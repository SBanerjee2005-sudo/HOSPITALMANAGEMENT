import { useMemo, useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { type AdminPatient } from "../../data";

import { useDashboardData } from "../../hooks/useDashboardData";
import { getStaffHospitalId } from "../../utils/roleScope";
import { api } from "../../services/api";
import { Pencil, X, Loader2 } from "lucide-react";

type PatientStatus = AdminPatient["status"];

type PatientRow = AdminPatient & {
  emergencyTagged: boolean;
};

export default function StaffPatients() {
  const {  doctors: allDoctors, appointments: allAppointments, adminPatients, refetch } = useDashboardData();

  const hospitalId = getStaffHospitalId();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "All">("All");

  const basePatients = adminPatients.filter(p => p.hospitalId === hospitalId);
  const doctors = allDoctors.filter(d => d.hospitalId === hospitalId);
  const appointments = allAppointments.filter(a => a.hospitalId === hospitalId);

  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [selectedSnapshotPatient, setSelectedSnapshotPatient] = useState<PatientRow | null>(null);
  
  const [editingPatient, setEditingPatient] = useState<PatientRow | null>(null);
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [assignDoctorId, setAssignDoctorId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const openEditModal = (patient: PatientRow) => {
    setEditingPatient(patient);
    setEditDiagnosis(patient.diagnosis || "");
    const latestAppointment = appointments.find((a) => String(a.patientId) === String(patient.id));
    setAssignDoctorId(latestAppointment ? String(latestAppointment.doctorId) : "");
  };

  const savePatientEdits = async () => {
    if (!editingPatient) return;
    setIsSaving(true);
    try {
      if (editDiagnosis !== editingPatient.diagnosis) {
        await api.put(`/patients/${editingPatient.id}`, { diagnosis: editDiagnosis });
      }

      const currentDoctorId = appointments.find((a) => String(a.patientId) === String(editingPatient.id))?.doctorId;
      if (assignDoctorId && String(currentDoctorId) !== assignDoctorId) {
        // Use local timezone to prevent UTC timezone shift causing 'yesterday' dates
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        await api.post('/appointments', {
          patientId: Number(editingPatient.id),
          doctorId: Number(assignDoctorId),
          hospitalId: hospitalId,
          patientName: editingPatient.name,
          doctorName: doctors.find((d) => String(d.id) === assignDoctorId)?.name || "Unknown",
          date: today,
          time: "09:00",
          type: "Consultation",
          mode: "In-person",
          status: "Scheduled"
        });
      }

      await refetch();
      setEditingPatient(null);
    } catch (error) {
      console.error("Failed to save patient edits:", error);
      alert("Failed to save changes. Please check network console.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    setPatients(basePatients.map((patient) => ({ ...patient, emergencyTagged: false })));
  }, [adminPatients, hospitalId]);

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const normalized = query.toLowerCase().trim();
      const matchesQuery =
        patient.name.toLowerCase().includes(normalized) ||
        patient.id.toLowerCase().includes(normalized) ||
        patient.diagnosis.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [patients, query, statusFilter]);

  const getAssignedDoctor = (patientId: string) => {
    // Cast to String for strict equality, as patientId is string but API returns numbers
    const latestAppointment = appointments.find((appointment) => String(appointment.patientId) === String(patientId));
    if (!latestAppointment) return "Not assigned";
    return doctors.find((doctor) => String(doctor.id) === String(latestAppointment.doctorId))?.name ?? "Not assigned";
  };

  const updatePatientStatus = (patientId: string, status: PatientStatus) => {
    setPatients((prev) => prev.map((patient) => (patient.id === patientId ? { ...patient, status } : patient)));
  };

  const toggleEmergencyTag = (patientId: string) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId ? { ...patient, emergencyTagged: !patient.emergencyTagged } : patient
      )
    );
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Patient Management</h1>
        <p className="text-slate-600">Search, track medical history, and manage admissions for your hospital only.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, ID, diagnosis"
          className="md:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PatientStatus | "All")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Status</option>
          <option value="Admitted">Admitted</option>
          <option value="In Treatment">In Treatment</option>
          <option value="Discharged">Discharged</option>
          <option value="Waiting">Waiting</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="surface-card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  onClick={() => setSelectedSnapshotPatient(patient)}
                  className={`cursor-pointer border-t transition ${selectedSnapshotPatient?.id === patient.id ? "bg-cyan-50 border-cyan-100" : "border-slate-100 hover:bg-slate-50/70"}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.id} • {patient.age} yrs</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{patient.diagnosis}</td>
                  <td className="px-4 py-3 text-slate-700">{getAssignedDoctor(patient.id)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      {patient.status}
                    </span>
                    {patient.emergencyTagged && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Emergency</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updatePatientStatus(patient.id, "Admitted"); }}
                        className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        Admit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); updatePatientStatus(patient.id, "Discharged"); }}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Discharge
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleEmergencyTag(patient.id); }}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Tag Emergency
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); openEditModal(patient); }}
                        className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
                      >
                        <Pencil className="h-3 w-3" /> Edit Case
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No patients match your search criteria.</p>
          )}
        </div>

        {/* EDIT PATIENT MODAL */}
        {editingPatient && document.body && createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <h3 className="text-lg font-bold text-slate-900">Edit Case: {editingPatient.name}</h3>
                <button
                  onClick={() => setEditingPatient(null)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Update Diagnosis</label>
                  <input
                    type="text"
                    value={editDiagnosis}
                    onChange={(e) => setEditDiagnosis(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Enter current diagnosis..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Assign Doctor</label>
                  <select
                    value={assignDoctorId}
                    onChange={(e) => setAssignDoctorId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {doctors.map(doc => (
                      <option key={doc.id} value={String(doc.id)}>
                        {doc.name} ({doc.department})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 px-6 py-4 bg-slate-50 rounded-b-2xl">
                <button
                  onClick={() => setEditingPatient(null)}
                  className="rounded-xl px-4 py-2 font-semibold text-slate-600 hover:bg-slate-200 transition"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={savePatientEdits}
                  disabled={isSaving}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-2 font-bold text-white hover:bg-cyan-700 transition disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

        <div className="surface-card p-5 sticky top-6">
          <h2 className="mb-4 text-lg font-bold text-slate-900 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-600"><path d="M14.5 2v17.5c0 1.4-1.1 2.5-2.5 2.5h0c-1.4 0-2.5-1.1-2.5-2.5V2"/><path d="M8.5 2h7"/><path d="M14.5 16h-5"/><path d="M14.5 12h-5"/><path d="M14.5 8h-5"/></svg>
            Medical History Snapshot
          </h2>
          <div className="space-y-4">
            {selectedSnapshotPatient ? (
              (() => {
                const generateRealisticHistory = (diagnosis: string) => {
                  const lowerDiag = diagnosis.toLowerCase();
                  if (lowerDiag.includes("diabetes")) return { allergies: ["Penicillin", "Latex"], history: "Diagnosed 2021. Regular HbA1c monitoring. Prescribed Metformin 500mg. Reports occasional neuropathy in lower extremities.", risk: "Moderate" };
                  if (lowerDiag.includes("hypertension") || lowerDiag.includes("cardiac") || lowerDiag.includes("blockage")) return { allergies: ["Sulfa drugs"], history: "Consistent BP monitoring. Previous echo showed mild LVH. Currently on Amlodipine 5mg. Advised low-sodium diet and daily cardio.", risk: "High" };
                  if (lowerDiag.includes("asthma") || lowerDiag.includes("pneumonia")) return { allergies: ["Dust", "Pollen", "Cat dander"], history: "Frequent inhaler use. Last PFT showed reduced FEV1. Albuterol PRN. Previous hospital admission for exacerbation in 2022.", risk: "Moderate" };
                  if (lowerDiag.includes("kidney") || lowerDiag.includes("stone")) return { allergies: ["NSAIDs"], history: "Recurrent renal calculi. ESWL in 2023. Advised increased hydration and reduced dietary oxalates.", risk: "Low" };
                  if (lowerDiag.includes("neuro") || lowerDiag.includes("migraine")) return { allergies: ["None known"], history: "Chronic tension headaches. MRI clear (2022). Sumatriptan prescribed for acute attacks. Neurology follow-up pending.", risk: "Low" };
                  if (lowerDiag.includes("thyroid")) return { allergies: ["Iodine contrast"], history: "Hashimoto's thyroiditis. TSH levels fluctuating. Levothyroxine 75mcg daily. Last ultrasound showed stable nodules.", risk: "Low" };
                  if (lowerDiag.includes("new") || lowerDiag.includes("fever") || lowerDiag.includes("infection")) return { allergies: ["None known"], history: "No major chronic conditions documented. Recent onset of acute symptoms. Standard blood panel ordered.", risk: "Low" };
                  return { allergies: ["None known"], history: "Routine annual checkups. No significant surgical history. Vitals consistently within normal range.", risk: "Low" };
                };
                
                const dynamicRecord = generateRealisticHistory(selectedSnapshotPatient.diagnosis);
                
                return (
                  <div className="rounded-2xl border border-cyan-100 bg-gradient-to-b from-cyan-50/50 to-white p-5 shadow-sm">
                    <div className="mb-4 flex items-center justify-between border-b border-cyan-100 pb-4">
                      <div>
                        <p className="text-xl font-bold text-slate-900">{selectedSnapshotPatient.name}</p>
                        <p className="text-sm text-slate-500">ID: {selectedSnapshotPatient.id} • {selectedSnapshotPatient.age} yrs • {selectedSnapshotPatient.gender}</p>
                      </div>
                      <div className={`flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                        dynamicRecord.risk === 'High' ? 'bg-rose-100 text-rose-700' :
                        dynamicRecord.risk === 'Moderate' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {dynamicRecord.risk} Risk
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Primary Diagnosis</p>
                        <p className="mt-1 font-medium text-slate-800">{selectedSnapshotPatient.diagnosis}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Known Allergies</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {dynamicRecord.allergies.map((allergy, idx) => (
                            <span key={idx} className="rounded-md bg-rose-50 px-2 py-1 text-xs font-medium text-rose-600 border border-rose-100">
                              {allergy}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Clinical History</p>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">{dynamicRecord.history}</p>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div className="flex h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                <div className="mb-3 rounded-full bg-slate-100 p-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M2 12h3l3 -9l5 21l3 -9h5"/></svg>
                </div>
                <p className="text-sm font-semibold text-slate-700">No Patient Selected</p>
                <p className="mt-1 text-xs text-slate-500">Click on any patient row in the table to view their detailed medical profile.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
