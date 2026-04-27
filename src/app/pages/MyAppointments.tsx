import { useMemo, useState } from "react";
import {
  getPatientAppointments,
  savePatientAppointments,
  type PatientAppointment,
} from "../utils/patientAppointments";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>(() =>
    getPatientAppointments()
  );

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Scheduled"),
    [appointments]
  );

  const completedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Completed").length,
    [appointments]
  );

  const cancelledCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Cancelled").length,
    [appointments]
  );

  const updateStatus = (
    appointmentId: string,
    status: "Scheduled" | "Completed" | "Cancelled"
  ) => {
    const updated = appointments.map((appointment) =>
      appointment.id === appointmentId ? { ...appointment, status } : appointment
    );
    setAppointments(updated);
    savePatientAppointments(updated);
  };

  const statusStyle = (status: string) => {
    if (status === "Scheduled") return "bg-blue-100 text-blue-600";
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "Cancelled") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Timeline</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">My Appointments</h2>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Upcoming</p>
          <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </div>
      </div>

      <div className="stagger space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="surface-card p-5"
          >
            <h3 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h3>
            <p className="text-slate-600">{appointment.department}</p>
            <p className="text-slate-700">{appointment.hospitalName}</p>

            <div className="flex justify-between mt-3">
              <span>{appointment.date} | {appointment.time}</span>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded text-sm ${statusStyle(appointment.status)}`}>
                  {appointment.status}
                </span>

                {appointment.status === "Scheduled" && (
                  <button
                    onClick={() => updateStatus(appointment.id, "Cancelled")}
                    className="text-sm font-semibold text-rose-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}