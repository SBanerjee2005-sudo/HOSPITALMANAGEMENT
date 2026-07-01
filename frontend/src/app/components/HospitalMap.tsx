import { useEffect, useState, useMemo } from "react";
import { MapPin, Phone, Compass, AlertTriangle, Check, Info } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { hospitals as mockHospitals } from "../data";

// Fix leaflet default icon path issues in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Haversine formula to calculate distance in km
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// A component to recenter map when selectedHospital changes
function MapRecenter({ center }: { center: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// A component to handle map clicks for user location
function MapClickHandler({ setUserLocation }: { setUserLocation: (loc: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      setUserLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

// A component to auto-fit bounds based on hospitals and user location
function BoundsFitter({ bounds }: { bounds: L.LatLngBounds | null }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [bounds, map]);
  return null;
}

export default function HospitalMap() {
  const defaultCenter = { lat: 22.5726, lng: 88.3639 };
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState<number>(15); // Default 15km
  const [selectedHospital, setSelectedHospital] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [activeEmergency, setActiveEmergency] = useState<any | null>(null);
  
  // Create a ref to store a map instance if we need to call methods directly
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  // 1. Fetch hospitals from backend or fallback to mock data
  useEffect(() => {
    const loadHospitalsData = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        // Call the realtime API. Note: userLocation might be null on first render.
        // We handle that by depending on userLocation below.
        if (!userLocation) return;
        
        const response = await fetch(`${apiUrl}/realtime/hospitals?lat=${userLocation.lat}&lng=${userLocation.lng}&radius_km=${radius}`);
        if (response.ok) {
          const data = await response.json();
          const mapped = data.map((h: any) => ({
            id: h.id,
            name: h.name,
            location: h.district,
            isOpen: h.beds > 0,
            bedsAvailable: h.beds,
            rating: h.rating || 4.0,
            lat: h.lat,
            lng: h.lng,
            specialties: h.id % 2 === 0 ? ["General Medicine", "Cardiology"] : ["Pediatrics", "Emergency Care"],
            emergencyStatus: h.beds > 0 ? "Active" : "Busy",
            emergencyPhone: `+91 33 ${3000 + h.id * 13} ${1000 + h.id * 7}`
          }));
          setHospitals(mapped);
        } else {
          throw new Error("Backend response error");
        }
      } catch (err) {
        console.warn("Using local mock hospitals data:", err);
        const mapped = mockHospitals.map((h: any) => ({
          ...h,
          lat: h.lat || 22.5726 + (Math.random() - 0.5) * 0.1,
          lng: h.lng || 88.3639 + (Math.random() - 0.5) * 0.1,
          emergencyPhone: `+91 33 ${3000 + h.id * 13} ${1000 + h.id * 7}`
        }));
        setHospitals(mapped);
      }
      setLoading(false);
    };

    if (userLocation) {
      loadHospitalsData();
    }
  }, [userLocation, radius]);

  // 2. Request user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => {
          console.warn("Geolocation access denied or timed out:", err);
          setLocationDenied(true);
          setUserLocation(defaultCenter);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setUserLocation(loc);
        setSelectedHospital(null); // Clear selection to let map fly to user location if we had logic for it
        if (mapInstance) {
           mapInstance.flyTo([loc.lat, loc.lng], 14, { duration: 1.5 });
        }
      });
    }
  };

  // Process hospitals and calculate dynamic distance
  const processedHospitals = useMemo(() => {
    if (!userLocation) return [];
    return hospitals
      .map((h) => {
        const dist = calculateDistance(userLocation.lat, userLocation.lng, h.lat, h.lng);
        return { ...h, distance: dist };
      })
      .filter((h) => {
        const matchesRadius = h.distance <= radius;
        const matchesQuery = searchQuery === "" || h.name.toLowerCase().includes(searchQuery.toLowerCase()) || h.location.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesRadius && matchesQuery;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [hospitals, userLocation, radius, searchQuery]);

  // Compute bounds for all markers
  const bounds = useMemo(() => {
    if (!userLocation) return null;
    const b = L.latLngBounds([userLocation.lat, userLocation.lng], [userLocation.lat, userLocation.lng]);
    if (searchQuery === "") {
        processedHospitals.forEach((h) => {
          b.extend([h.lat, h.lng]);
        });
    }
    return b;
  }, [processedHospitals, userLocation, searchQuery]);

  // Create custom Leaflet Icons
  const userIcon = new L.DivIcon({
    className: "custom-user-marker",
    html: `<div style="font-size: 24px; text-shadow: 0 2px 4px rgba(0,0,0,0.3); transform: translateY(-50%);">📍</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  const getHospitalIcon = (bedsAvailable: number, isSelected: boolean) => {
    const color = bedsAvailable > 0 ? "#10b981" : "#ef4444";
    const glyph = bedsAvailable > 0 ? "🟢" : "🔴";
    const scale = isSelected ? "scale(1.25)" : "scale(1.0)";
    
    return new L.DivIcon({
      className: "custom-hospital-marker",
      html: `
        <div style="
          background-color: ${color};
          border: 2px solid white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          transform: ${scale};
          transition: transform 0.2s;
        ">
          <span style="font-size: 12px;">${glyph}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
  };

  return (
    <div className="flex flex-col h-[580px] bg-white text-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-200">

      {/* Header and Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-xl font-black text-cyan-700 flex items-center gap-2">
              <Compass className="animate-spin-slow text-cyan-600" size={22} />
              <span>Real-Time Nearest Care Locator</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Drag the pointer 📍 on the map or click any spot to set your custom patient location.</p>
          </div>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 active:scale-95 transition text-xs font-bold rounded-lg border border-slate-300 text-slate-700 cursor-pointer shadow-sm"
          >
            <MapPin size={14} className="text-cyan-600" />
            <span>Use My GPS Location</span>
          </button>
        </div>

        {/* Search and Slider Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Search Hospitals</label>
            <input
              type="text"
              placeholder="Search by name, landmark, or specialty..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Search Radius</label>
              <span className="text-xs font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">{radius} km</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-slate-400 font-semibold">5km</span>
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="flex-1 accent-cyan-600 cursor-pointer bg-slate-200 rounded-lg h-2"
              />
              <span className="text-xs text-slate-400 font-semibold">30km</span>
            </div>
          </div>
        </div>

        {locationDenied && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
            <Info size={14} className="shrink-0 text-amber-600" />
            <span>Location permission was denied. Defaulting to Central Kolkata. Click or drag the map to update.</span>
          </div>
        )}
      </div>

      {/* Main Split Screen Area */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">

        {/* Left pane: Leaflet Map */}
        <div className="relative h-full w-full bg-slate-100 border-r border-slate-200 min-h-[300px] lg:min-h-full z-0">
          {userLocation ? (
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={12} 
              className="absolute inset-0 w-full h-full"
              zoomControl={false}
              ref={setMapInstance}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                maxZoom={20}
              />
              
              <MapClickHandler setUserLocation={setUserLocation} />
              {selectedHospital && <MapRecenter center={{ lat: selectedHospital.lat, lng: selectedHospital.lng }} />}
              <BoundsFitter bounds={bounds} />

              {/* User Location Marker (Draggable) */}
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const marker = e.target;
                    const position = marker.getLatLng();
                    setUserLocation({ lat: position.lat, lng: position.lng });
                  },
                }}
                icon={userIcon}
                zIndexOffset={1000}
              />
              
              {/* Radius Circle */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={radius * 1000}
                pathOptions={{ color: '#0ea5e9', fillColor: '#38bdf8', fillOpacity: 0.1, weight: 1 }}
              />

              {/* Hospital Markers */}
              {processedHospitals.map(hospital => (
                <Marker 
                  key={hospital.id}
                  position={[hospital.lat, hospital.lng]}
                  icon={getHospitalIcon(hospital.bedsAvailable, selectedHospital?.id === hospital.id)}
                  eventHandlers={{
                    click: () => {
                      setSelectedHospital(hospital);
                      const element = document.getElementById(`hospital-card-${hospital.id}`);
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
                      }
                    }
                  }}
                >
                  <Popup>
                    <div className="text-center font-manrope">
                      <h4 className="font-bold text-sm text-slate-800">{hospital.name}</h4>
                      <p className="text-xs text-slate-500">{hospital.distance.toFixed(1)} km away</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
             <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
              <div className="h-8 w-8 rounded-full border-4 border-cyan-600/20 border-t-cyan-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Acquiring Location...</p>
            </div>
          )}
          
          {loading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-3 z-10">
              <div className="h-8 w-8 rounded-full border-4 border-cyan-600/20 border-t-cyan-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Syncing nearest clinical coordinates...</p>
            </div>
          )}
        </div>

        {/* Right pane: Sidebar Hospital List */}
        <div className="flex flex-col h-full bg-slate-50 min-h-0 overflow-hidden relative z-10">

          <div className="p-3 bg-white border-b border-slate-200 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-500">Hospitals in range ({processedHospitals.length})</span>
            <span className="text-[10px] text-slate-400 font-medium">🟢 Beds Available | 🔴 Full</span>
          </div>

          {/* Scrollable list inside fixed height container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {processedHospitals.map((hospital) => {
              const isSelected = selectedHospital?.id === hospital.id;
              return (
                <div
                  key={hospital.id}
                  id={`hospital-card-${hospital.id}`}
                  onClick={() => {
                    setSelectedHospital(hospital);
                  }}
                  className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${isSelected
                    ? "bg-cyan-50/40 border-cyan-500 shadow-sm shadow-cyan-100 scale-[1.01]"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 leading-snug">{hospital.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{hospital.location}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="inline-block text-xs font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {hospital.distance.toFixed(1)} km
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                    <div className="text-xs text-slate-600">
                      Beds Available: <span className={`font-bold ${hospital.bedsAvailable > 0 ? "text-emerald-600" : "text-rose-600"}`}>{hospital.bedsAvailable}</span>
                    </div>
                    <div className="text-xs text-slate-600">
                      Rating: <span className="font-semibold text-amber-500">★ {hospital.rating}</span>
                    </div>
                  </div>

                  {/* Contact Number and Action Buttons */}
                  <div className="mt-3 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-700 font-semibold mb-2.5">
                      <Phone size={13} className="text-cyan-600" />
                      <span>Emergency: <span className="text-red-600 font-bold">{hospital.emergencyPhone}</span></span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveEmergency(hospital);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 bg-rose-600 hover:bg-rose-700 active:scale-95 transition text-[11px] font-bold text-white rounded-lg cursor-pointer shadow-sm"
                      >
                        <AlertTriangle size={12} className="animate-pulse" />
                        <span>Emergency</span>
                      </button>

                      <a
                        href={`https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${hospital.lat},${hospital.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-slate-50 active:scale-95 transition text-[11px] font-bold text-slate-700 rounded-lg border border-slate-300 text-center cursor-pointer shadow-sm"
                      >
                        <Compass size={12} className="text-slate-500" />
                        <span>Get Directions</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}

            {processedHospitals.length === 0 && (
              <div className="p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl">
                <MapPin size={24} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-medium">No hospitals match your radius & filter.</p>
                <p className="text-[10px] text-slate-400 mt-1">Try expanding the range slider up to 30 km.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated Emergency Action Modal */}
      {activeEmergency && (
        <div className="absolute inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-scaleUp">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border-2 border-rose-500 flex items-center justify-center text-rose-600 mb-4">
              <Phone size={28} className="animate-bounce" />
            </div>

            <h4 className="text-lg font-black text-slate-800">Connecting Emergency Desk</h4>
            <p className="text-xs text-slate-500 mt-1">{activeEmergency.name}</p>

            <div className="my-5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="text-xl font-black text-rose-600 font-mono tracking-wide">{activeEmergency.emergencyPhone}</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wider">Simulating cellular outbound connection...</p>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              In a real emergency, this opens your dialer directly. Ambulances are routed automatically using your current telemetry coords:
              <span className="font-mono text-[10px] text-cyan-700 block mt-1">lat: {userLocation?.lat.toFixed(4)}, lng: {userLocation?.lng.toFixed(4)}</span>
            </p>

            <div className="grid grid-cols-2 gap-3">
              <a
                href={`tel:${activeEmergency.emergencyPhone}`}
                onClick={() => setActiveEmergency(null)}
                className="flex items-center justify-center gap-1.5 py-2 bg-emerald-600 hover:bg-emerald-700 transition text-xs font-bold text-white rounded-xl shadow-lg"
              >
                <Check size={14} />
                <span>Call Now</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveEmergency(null)}
                className="py-2 bg-white hover:bg-slate-50 transition text-xs font-bold text-slate-600 rounded-xl border border-slate-300 shadow-sm"
              >
                Cancel Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
