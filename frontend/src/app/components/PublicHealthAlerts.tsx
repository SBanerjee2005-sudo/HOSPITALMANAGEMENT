import { useEffect, useState } from "react";
import { Activity, AlertCircle, ShieldAlert, BedDouble, Stethoscope } from "lucide-react";

export default function PublicHealthAlerts() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealthStats = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${apiUrl}/realtime/health-stats`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (e) {
        console.error("Failed to fetch health stats", e);
      } finally {
        setLoading(false);
      }
    };
    fetchHealthStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealthStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-3xl p-5 shadow-sm animate-pulse flex items-center justify-center min-h-[120px]">
        <div className="flex items-center gap-2 text-rose-500">
          <Activity className="animate-spin" size={20} />
          <span className="text-sm font-semibold">Syncing Regional Health Network...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Activity className="text-indigo-600" size={22} />
            <span>Kolkata City Health Metrics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time healthcare capacity and disease intelligence (Source: {stats.source})
          </p>
        </div>
        <div className="h-10 w-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
          <ShieldAlert size={20} className="animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Active Patients</p>
          <p className="text-xl font-black text-slate-800">
            {stats.activePatients ? stats.activePatients.toLocaleString() : "N/A"}
          </p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
             <p className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Available Beds</p>
             <BedDouble size={14} className="text-emerald-500"/>
          </div>
          <p className="text-xl font-black text-emerald-700">
            {stats.totalBedsAvailable ? stats.totalBedsAvailable.toLocaleString() : "N/A"}
          </p>
        </div>
        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
             <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider">Total Bed Capacity</p>
             <BedDouble size={14} className="text-blue-500"/>
          </div>
          <p className="text-xl font-black text-blue-700">
            {stats.totalBeds ? stats.totalBeds.toLocaleString() : "N/A"}
          </p>
        </div>
        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
             <p className="text-[10px] uppercase font-bold text-amber-600 tracking-wider">Top Diseases</p>
             <Stethoscope size={14} className="text-amber-500"/>
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {stats.commonDiseases && stats.commonDiseases.length > 0 ? (
               stats.commonDiseases.map((disease: string, idx: number) => (
                  <span key={idx} className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-center flex-grow">
                    {disease}
                  </span>
               ))
            ) : "N/A"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 bg-indigo-50 border border-indigo-100 p-3 rounded-xl">
        <AlertCircle size={14} className="text-indigo-600 shrink-0" />
        <p className="text-xs text-indigo-800 font-medium leading-relaxed">
          The Ministry of Health advises maintaining hygiene protocols. Local bed availability may fluctuate based on real-time disease spread metrics. 
        </p>
      </div>
    </div>
  );
}
