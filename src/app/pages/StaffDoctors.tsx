import { useState } from "react";
import { getDoctorSchedulesByHospital, getDoctorsByHospital, getHospitalById, type Doctor } from "../data";
import { getStaffHospitalId } from "../utils/roleScope";

export default function StaffDoctors() {
  const hospitalId = getStaffHospitalId();
  const hospital = getHospitalById(hospitalId);
  const [query, setQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  const [doctorRows, setDoctorRows] = useState(() => getDoctorsByHospital(hospitalId));
  const [form, setForm] = useState({
    name: "",
    department: hospital?.departments[0]?.name ?? "Cardiology",
    experience: "5",
    availability: "Available" as Doctor["availability"],
    fees: "900",
    phone: "+91 ",
    email: "",
  });

  const schedules = getDoctorSchedulesByHospital(hospitalId);

  const departments = ["All", ...Array.from(new Set(doctorRows.map((doctor) => doctor.department)))];

  const doctorWorkload = doctorRows.map((doctor) => ({
    doctorId: doctor.id,
    slots: schedules.filter((schedule) => schedule.doctorId === doctor.id).length,
    emergencyDuties: schedules.filter(
      (schedule) => schedule.doctorId === doctor.id && schedule.isEmergencyDuty
    ).length,
  }));

  const filteredDoctors = doctorRows.filter((doctor) => {
    const normalized = query.toLowerCase();
    const matchesQuery =
      doctor.name.toLowerCase().includes(normalized) ||
      doctor.email.toLowerCase().includes(normalized) ||
      doctor.department.toLowerCase().includes(normalized);

    const matchesDepartment = departmentFilter === "All" || doctor.department === departmentFilter;
    const matchesAvailability = availabilityFilter === "All" || doctor.availability === availabilityFilter;

    return matchesQuery && matchesDepartment && matchesAvailability;
  });

  const addDoctor = () => {
    if (!form.name.trim() || !form.email.trim()) return;

    const nextId = doctorRows.reduce((max, doctor) => Math.max(max, doctor.id), 100) + 1;

    setDoctorRows((prev) => [
      {
        id: nextId,
        hospitalId,
        department: form.department,
        name: form.name.trim(),
        experience: Number(form.experience),
        availability: form.availability,
        fees: Number(form.fees),
        phone: form.phone.trim(),
        email: form.email.trim(),
      },
      ...prev,
    ]);

    setForm({
      name: "",
      department: hospital?.departments[0]?.name ?? "Cardiology",
      experience: "5",
      availability: "Available",
      fees: "900",
      phone: "+91 ",
      email: "",
    });
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Doctor Management</h1>
        <p className="text-slate-600">Track specialization, schedule load, and availability for {hospital?.name ?? "your hospital"} doctors.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-6">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor Name</label>
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="e.g. Dr. John Smith"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Department</label>
          <select
            value={form.department}
            onChange={(event) => setForm((prev) => ({ ...prev, department: event.target.value }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          >
            {(hospital?.departments.map((department) => department.name) ?? ["Cardiology"]).map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Years of Specialization</label>
          <input
            value={form.experience}
            onChange={(event) => setForm((prev) => ({ ...prev, experience: event.target.value }))}
            type="number"
            min={1}
            placeholder="e.g. 5"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Availability</label>
          <select
            value={form.availability}
            onChange={(event) => setForm((prev) => ({ ...prev, availability: event.target.value as Doctor["availability"] }))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          >
            <option value="Available">Available</option>
            <option value="Limited">Limited</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Fees (₹)</label>
          <input
            value={form.fees}
            onChange={(event) => setForm((prev) => ({ ...prev, fees: event.target.value }))}
            type="number"
            min={0}
            placeholder="e.g. 900"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
        <button onClick={addDoctor} className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 md:col-span-1 h-fit">Add Doctor</button>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
          <input
            value={form.phone}
            onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
            placeholder="+91 XXXXXXXXXX"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
          <input
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="doctor@hospital.com"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, email, department"
          className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={departmentFilter}
          onChange={(event) => setDepartmentFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          {departments.map((department) => (
            <option key={department} value={department}>
              {department === "All" ? "All Departments" : department}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(event) => setAvailabilityFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Availability</option>
          <option value="Available">Available</option>
          <option value="Limited">Limited</option>
          <option value="On Leave">On Leave</option>
        </select>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3">Doctor</th>
              <th className="px-5 py-3">Specialization</th>
              <th className="px-5 py-3">Availability</th>
              <th className="px-5 py-3">Schedule Slots</th>
              <th className="px-5 py-3">Emergency Duties</th>
              <th className="px-5 py-3">Contact</th>
            </tr>
          </thead>
          <tbody>
            {filteredDoctors.map((doctor) => {
              const workload = doctorWorkload.find((item) => item.doctorId === doctor.id);

              return (
                <tr key={doctor.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{doctor.name}</p>
                    <p className="text-xs text-slate-500">{doctor.email}</p>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{doctor.department}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      {doctor.availability}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{workload?.slots ?? 0}</td>
                  <td className="px-5 py-4 text-slate-700">{workload?.emergencyDuties ?? 0}</td>
                  <td className="px-5 py-4 text-slate-700">
                    <p className="font-medium">{doctor.phone}</p>
                    <p className="text-xs text-slate-500">₹{doctor.fees.toLocaleString("en-IN")}</p>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredDoctors.length === 0 && (
          <p className="p-5 text-sm text-slate-500">No doctors match the selected filters.</p>
        )}
      </div>
    </div>
  );
}
