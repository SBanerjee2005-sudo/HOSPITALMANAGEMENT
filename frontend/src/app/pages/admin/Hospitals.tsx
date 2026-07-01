import { useMemo, useState } from "react";
import {
  Building2,
  Star,
  MapPin,
  Bed,
  Ambulance,
  Users,
  Activity,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useDashboardData } from "../../hooks/useDashboardData";

const statusConfig = {
  Active: {
    label: "Active",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  Busy: {
    label: "Busy",
    color: "bg-amber-100 text-amber-700",
    icon: AlertCircle,
  },
  Unavailable: {
    label: "Unavailable",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
};

export default function Hospitals() {
  const { hospitals, loading } = useDashboardData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Busy" | "Unavailable">("All");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return hospitals.filter((h) => {
      const matchSearch =
        h.name.toLowerCase().includes(q) ||
        h.location.toLowerCase().includes(q) ||
        (h.specialties || []).some((s) => s.toLowerCase().includes(q));
      const matchStatus =
        statusFilter === "All" || h.emergencyStatus === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [hospitals, search, statusFilter]);

  const totalBeds = hospitals.reduce((s, h) => s + (h.bedsAvailable || 0), 0);
  const openCount = hospitals.filter((h) => h.isOpen).length;
  const activeCount = hospitals.filter((h) => h.emergencyStatus === "Active").length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Network Overview
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Kolkata Hospital Network
          </h1>
          <p className="text-slate-600">
            All {hospitals.length} registered hospitals with live metrics.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          {
            label: "Total Hospitals",
            value: hospitals.length,
            icon: Building2,
            color: "text-cyan-600",
            bg: "bg-cyan-50",
          },
          {
            label: "Open Now",
            value: openCount,
            icon: CheckCircle,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
          },
          {
            label: "Emergency Active",
            value: activeCount,
            icon: Activity,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Beds Available",
            value: totalBeds,
            icon: Bed,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="surface-card hover-float p-4">
            <div className={`mb-3 inline-flex rounded-xl p-2 ${bg}`}>
              <Icon size={20} className={color} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search by name, location, specialty…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Busy">Busy</option>
          <option value="Unavailable">Unavailable</option>
        </select>
        <span className="text-sm text-slate-500">
          {filtered.length} of {hospitals.length}
        </span>
      </div>

      {/* Hospital Cards Grid */}
      {filtered.length === 0 ? (
        <div className="surface-card p-10 text-center text-slate-500">
          No hospitals match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((hospital) => {
            const status = statusConfig[hospital.emergencyStatus] ?? statusConfig.Active;
            const StatusIcon = status.icon;
            const stars = Math.round(hospital.rating || 4);
            return (
              <div
                key={hospital.id}
                className="surface-card hover-float flex flex-col gap-4 p-5"
              >
                {/* Top Row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900 text-base">
                      {hospital.name}
                    </p>
                    <div className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                      <MapPin size={13} />
                      <span>{hospital.location}</span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color}`}
                  >
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < stars ? "currentColor" : "none"}
                        stroke={i < stars ? "none" : "currentColor"}
                        className={i < stars ? "text-amber-400" : "text-slate-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">
                    {hospital.rating?.toFixed(1)}
                  </span>
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {hospital.isOpen ? "Open" : "Closed"}
                  </span>
                </div>

                {/* Specialties */}
                {hospital.specialties && hospital.specialties.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hospital.specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-2 border-t border-slate-100 pt-3">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-1 text-blue-600">
                      <Bed size={14} />
                      <span className="text-base font-bold text-slate-900">
                        {hospital.bedsAvailable}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Beds</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Users size={14} />
                      <span className="text-base font-bold text-slate-900">
                        {hospital.departments?.reduce(
                          (sum, d) => sum + d.doctorCount,
                          0
                        ) ?? 0}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Doctors</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <div className="flex items-center gap-1 text-purple-600">
                      <Ambulance size={14} />
                      <span className="text-base font-bold text-slate-900">
                        {hospital.departments?.length ?? 0}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">Depts</span>
                  </div>
                </div>

                {/* Bed Inventory */}
                {hospital.bedInventory && hospital.bedInventory.length > 0 && (
                  <div className="space-y-1.5">
                    {hospital.bedInventory.map((bed) => {
                      const total = bed.available + bed.busy + bed.unavailable;
                      const pct = total > 0 ? (bed.available / total) * 100 : 0;
                      return (
                        <div key={bed.type}>
                          <div className="mb-0.5 flex justify-between text-xs text-slate-500">
                            <span>{bed.type}</span>
                            <span>{bed.available}/{total} free</span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
