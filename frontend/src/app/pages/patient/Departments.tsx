import { useNavigate, useParams } from "react-router-dom";
import { useDashboardData } from "../../hooks/useDashboardData";
import { Loader2, Stethoscope, Users, Clock, ArrowLeft, ChevronRight } from "lucide-react";

const DEPT_COLORS = [
  { bg: "from-cyan-500 to-blue-600", light: "bg-cyan-50 border-cyan-200", badge: "bg-cyan-100 text-cyan-700" },
  { bg: "from-violet-500 to-purple-600", light: "bg-violet-50 border-violet-200", badge: "bg-violet-100 text-violet-700" },
  { bg: "from-emerald-500 to-teal-600", light: "bg-emerald-50 border-emerald-200", badge: "bg-emerald-100 text-emerald-700" },
  { bg: "from-orange-500 to-red-500", light: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700" },
  { bg: "from-pink-500 to-rose-600", light: "bg-pink-50 border-pink-200", badge: "bg-pink-100 text-pink-700" },
  { bg: "from-indigo-500 to-blue-700", light: "bg-indigo-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700" },
];

const AVAILABILITY_STYLE: Record<string, string> = {
  Available: "bg-emerald-100 text-emerald-700",
  Limited: "bg-amber-100 text-amber-700",
  Busy: "bg-red-100 text-red-700",
};

export default function Departments() {
  const { hospitals, loading } = useDashboardData();
  const navigate = useNavigate();
  const { id } = useParams();
  const hospitalId = Number(id);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  const hospital = hospitals.find((h) => h.id === hospitalId);

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

  // Use departments from the API response (which comes from our rich HOSPITAL_META or fallback)
  const departments = hospital.departments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="surface-card overflow-hidden p-0">
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 px-6 py-8 text-white">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-1 text-sm text-cyan-100 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
            Clinical Units
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">{hospital.name}</h2>
          <p className="mt-1 text-cyan-100">
            {departments.length} department{departments.length !== 1 ? "s" : ""} available
          </p>
        </div>
        {/* Stat bar */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white">
          <div className="px-6 py-3 text-center">
            <p className="text-xs text-slate-500">Beds Free</p>
            <p className="text-lg font-bold text-cyan-700">{hospital.bedsAvailable}</p>
          </div>
          <div className="px-6 py-3 text-center">
            <p className="text-xs text-slate-500">Rating</p>
            <p className="text-lg font-bold text-amber-500">★ {hospital.rating?.toFixed(1)}</p>
          </div>
          <div className="px-6 py-3 text-center">
            <p className="text-xs text-slate-500">Emergency</p>
            <p
              className={`text-lg font-bold ${
                hospital.emergencyStatus === "Active" ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {hospital.emergencyStatus}
            </p>
          </div>
        </div>
      </div>

      {/* Department Cards */}
      {departments.length === 0 ? (
        <div className="surface-card flex h-48 flex-col items-center justify-center gap-3 text-slate-400">
          <Stethoscope className="h-10 w-10 opacity-30" />
          <p className="font-medium">No department data available for this hospital.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept, idx) => {
            const color = DEPT_COLORS[idx % DEPT_COLORS.length];
            const availStyle = AVAILABILITY_STYLE[dept.availability] ?? "bg-slate-100 text-slate-600";
            return (
              <button
                key={dept.name}
                type="button"
                onClick={() =>
                  navigate(
                    `/patient-dashboard/hospitals/${hospitalId}/departments/${encodeURIComponent(dept.name)}`
                  )
                }
                className={`group relative overflow-hidden rounded-2xl border p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${color.light}`}
                aria-label={`Open ${dept.name} department`}
              >
                {/* gradient corner accent */}
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br opacity-20 transition-opacity duration-300 group-hover:opacity-40 ${color.bg}`}
                />
                {/* Icon */}
                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow ${color.bg}`}
                >
                  <Stethoscope className="h-5 w-5" />
                </div>

                <h3 className="text-lg font-bold text-slate-900">{dept.name}</h3>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    <Users className="h-3 w-3" />
                    {dept.doctorCount} doctor{dept.doctorCount !== 1 ? "s" : ""}
                  </span>
                  <span className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${availStyle}`}>
                    <Clock className="h-3 w-3" />
                    {dept.availability}
                  </span>
                </div>

                <div className="mt-4 flex items-center text-xs font-semibold text-slate-500 transition group-hover:text-cyan-600">
                  View doctors <ChevronRight className="ml-1 h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}