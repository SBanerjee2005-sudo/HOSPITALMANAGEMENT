import { useParams, useNavigate } from "react-router-dom";
import { useDashboardData } from "../../hooks/useDashboardData";
import {
  Loader2,
  ArrowLeft,
  BedDouble,
  ShieldAlert,
  Star,
  Stethoscope,
  Users,
  Clock,
  ChevronRight,
  MapPin,
} from "lucide-react";

const DEPT_COLORS = [
  { bg: "from-cyan-500 to-blue-600", light: "bg-cyan-50 border-cyan-200" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 border-violet-200" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 border-emerald-200" },
  { bg: "from-orange-500 to-red-500", light: "bg-orange-50 border-orange-200" },
  { bg: "from-pink-500 to-rose-600", light: "bg-pink-50 border-pink-200" },
  { bg: "from-indigo-500 to-blue-700", light: "bg-indigo-50 border-indigo-200" },
];

const AVAIL_STYLE: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Limited: "bg-amber-100 text-amber-700",
  Busy: "bg-red-100 text-red-700",
};

export default function HospitalDetails() {
  const { hospitals, loading } = useDashboardData();
  const { id } = useParams();
  const navigate = useNavigate();

  const hospitalId = Number(id);
  const hospital = hospitals.find((h) => h.id === hospitalId);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-500">
        <Stethoscope className="h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">Hospital not found.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
        >
          <ArrowLeft className="h-4 w-4" /> Go Back
        </button>
      </div>
    );
  }

  const departments = hospital.departments ?? [];

  const emergencyColor =
    hospital.emergencyStatus === "Active"
      ? "text-emerald-600 bg-emerald-50"
      : hospital.emergencyStatus === "Busy"
      ? "text-amber-600 bg-amber-50"
      : "text-red-600 bg-red-50";

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-cyan-700 to-blue-800 px-6 py-8 text-white">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1 text-sm text-cyan-200 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Hospitals
          </button>
          <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
            Hospital Profile
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight">{hospital.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-cyan-200">
            <MapPin className="h-4 w-4" />
            {hospital.location}, Kolkata
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {hospital.specialties?.map((s) => (
              <span
                key={s}
                className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium text-white backdrop-blur-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Stat bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
          <div className="flex flex-col items-center gap-1 py-4">
            <BedDouble className="h-5 w-5 text-cyan-500" />
            <p className="text-xl font-bold text-slate-900">{hospital.bedsAvailable}</p>
            <p className="text-xs text-slate-500">Beds Free</p>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <Star className="h-5 w-5 text-amber-400" />
            <p className="text-xl font-bold text-slate-900">{hospital.rating?.toFixed(1)}</p>
            <p className="text-xs text-slate-500">Rating</p>
          </div>
          <div className="flex flex-col items-center gap-1 py-4">
            <ShieldAlert className={`h-5 w-5 ${hospital.emergencyStatus === "Active" ? "text-emerald-500" : "text-red-400"}`} />
            <p className={`rounded-full px-2 py-0.5 text-sm font-bold ${emergencyColor}`}>
              {hospital.emergencyStatus}
            </p>
            <p className="text-xs text-slate-500">Emergency</p>
          </div>
        </div>
      </div>

      {/* Bed Inventory */}
      {hospital.bedInventory && hospital.bedInventory.length > 0 && (
        <div className="surface-card p-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Bed Inventory</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {hospital.bedInventory.map((b) => {
              const total = b.available + b.busy + b.unavailable;
              const pct = total > 0 ? Math.round((b.available / total) * 100) : 0;
              return (
                <div key={b.type} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-slate-500">{b.type}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{b.available}</p>
                  <p className="text-xs text-slate-400">of {total} available</p>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-cyan-500 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Departments */}
      <div>
        <h2 className="mb-4 text-xl font-bold text-slate-900">
          Departments ({departments.length})
        </h2>
        {departments.length === 0 ? (
          <div className="surface-card flex h-32 items-center justify-center text-slate-400">
            No department info available.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {departments.map((dept, idx) => {
              const color = DEPT_COLORS[idx % DEPT_COLORS.length];
              const avail = AVAIL_STYLE[dept.availability] ?? "bg-slate-100 text-slate-600";
              return (
                <button
                  key={dept.name}
                  type="button"
                  className={`group relative overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${color.light}`}
                  onClick={() =>
                    navigate(
                      `/patient-dashboard/hospitals/${hospital.id}/departments/${encodeURIComponent(dept.name)}`
                    )
                  }
                  aria-label={`View ${dept.name} doctors`}
                >
                  <div
                    className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 transition group-hover:opacity-40 ${color.bg}`}
                  />
                  <div
                    className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${color.bg}`}
                  >
                    <Stethoscope className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-slate-900">{dept.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-xs text-slate-600">
                      <Users className="h-3 w-3" />
                      {dept.doctorCount} doctors
                    </span>
                    <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${avail}`}>
                      <Clock className="h-3 w-3" />
                      {dept.availability}
                    </span>
                  </div>
                  <p className="mt-3 flex items-center text-xs font-medium text-slate-400 transition group-hover:text-cyan-600">
                    View doctors <ChevronRight className="ml-0.5 h-3 w-3" />
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}