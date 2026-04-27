import { useParams, useNavigate } from "react-router-dom";
import { getDoctorsByHospitalAndDepartment, getHospitalById } from "../data";

export default function DoctorList() {
  const { id, department } = useParams();
  const navigate = useNavigate();

  const hospitalId = Number(id);
  const decodedDepartment = decodeURIComponent(department ?? "");
  const hospital = getHospitalById(hospitalId);
  const deptDoctors = getDoctorsByHospitalAndDepartment(
    hospitalId,
    decodedDepartment
  );

  if (!hospital) {
    return <div className="p-6">Hospital not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctors Directory</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{decodedDepartment}</h1>
        <p className="text-slate-600">{hospital.name}</p>
      </div>

      <div className="stagger space-y-4">
        {deptDoctors.map((doc) => (
        <div
          key={doc.id}
          className="surface-card p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{doc.name}</h2>
              <p className="text-slate-600">Experience: {doc.experience} years</p>
              <p className="text-slate-600">Availability: {doc.availability}</p>
              <p className="text-slate-700">Consultation Fee: Rs. {doc.fees}</p>
            </div>

            <button
              className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
              onClick={() =>
                navigate(
                  `/patient-dashboard/book/${doc.id}?hospitalId=${hospitalId}&department=${encodeURIComponent(
                    decodedDepartment
                  )}`
                )
              }
            >
              Book Appointment
            </button>
          </div>
        </div>
        ))}
      </div>

      {deptDoctors.length === 0 && (
        <p className="surface-card p-5 text-slate-600">No doctors available for this department.</p>
      )}
    </div>
  );
}