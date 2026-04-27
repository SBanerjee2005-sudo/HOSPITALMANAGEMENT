import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getDoctorById, getHospitalById } from "../data";
import { getUser } from "../utils/auth";
import { addPatientAppointment } from "../utils/patientAppointments";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hospitalId = Number(searchParams.get("hospitalId"));
  const doctor = getDoctorById(Number(doctorId));
  const hospital = getHospitalById(hospitalId);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [message, setMessage] = useState("");

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
  ];

  if (!doctor || !hospital) {
    return <div className="p-6">Doctor details not found.</div>;
  }

  const handleConfirm = () => {
    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    const user = getUser();
    addPatientAppointment({
      patientName: user?.username ?? "patient",
      doctorName: doctor.name,
      department: doctor.department,
      hospitalName: hospital.name,
      date,
      time,
    });

    setMessage("Appointment confirmed.");
    navigate("/patient-dashboard/my-appointments");
  };

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Appointment Booking</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Book Appointment</h1>
        <p className="mt-2 text-slate-600">Doctor: {doctor.name}</p>
        <p className="text-slate-600">Hospital: {hospital.name}</p>
      </div>

      <div className="surface-card max-w-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm font-semibold text-slate-700">
            Select date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-label="Appointment date"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />
          </label>

          <label className="block text-sm font-semibold text-slate-700">
            Select time slot
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              aria-label="Appointment time slot"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          onClick={handleConfirm}
          aria-label="Confirm appointment booking"
          className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Confirm Booking
        </button>

        {message && <p role="status" aria-live="polite" className="mt-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      </div>
    </div>
  );
}