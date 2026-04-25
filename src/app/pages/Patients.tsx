import { useState } from "react";

type Patient = {
  id: string;
  name: string;
  age: number;
  gender: string;
  diagnosis: string;
  status: string;
};

const initialPatients: Patient[] = [
  {
    id: "P001",
    name: "John Smith",
    age: 45,
    gender: "Male",
    diagnosis: "Hypertension",
    status: "In Treatment",
  },
  {
    id: "P002",
    name: "Sarah Johnson",
    age: 32,
    gender: "Female",
    diagnosis: "Diabetes Type 2",
    status: "Admitted",
  },
];

export default function Patients() {
  const [patients, setPatients] = useState(initialPatients);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [genderFilter, setGenderFilter] = useState("All Genders");

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState<Patient>({
    id: "",
    name: "",
    age: 0,
    gender: "Male",
    diagnosis: "",
    status: "Admitted",
  });

  const [customGender, setCustomGender] = useState("");

  // 🔥 AUTO ID GENERATOR
  const generatePatientId = () => {
    if (patients.length === 0) return "P001";

    const last = patients[patients.length - 1].id;
    const num = parseInt(last.replace("P", "")) + 1;
    return "P" + num.toString().padStart(3, "0");
  };

  const normalize = (v: string) => v.toLowerCase().trim();

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("");

  const statusStyle = (status: string) => {
    if (status === "Admitted") return "bg-red-100 text-red-600";
    if (status === "In Treatment") return "bg-yellow-100 text-yellow-700";
    if (status === "Discharged") return "bg-green-100 text-green-600";
    if (status === "Waiting") return "bg-blue-100 text-blue-600";
    return "bg-gray-100 text-gray-600";
  };

  const filtered = patients.filter((p) => {
    const matchesSearch =
      normalize(p.name).includes(normalize(search)) ||
      normalize(p.id).includes(normalize(search)) ||
      normalize(p.diagnosis).includes(normalize(search));

    const matchesStatus =
      statusFilter === "All Status" || p.status === statusFilter;

    const matchesGender =
      genderFilter === "All Genders" ||
      normalize(p.gender) === normalize(genderFilter);

    return matchesSearch && matchesStatus && matchesGender;
  });

  const handleSave = () => {
    if (!form.name) return;

    const finalGender =
      form.gender === "Other"
        ? customGender.trim() || "Other"
        : form.gender;

    if (editIndex !== null) {
      const copy = [...patients];
      copy[editIndex] = { ...form, gender: finalGender };
      setPatients(copy);
    } else {
      const newPatient = {
        ...form,
        id: generatePatientId(), // 🔥 AUTO ID
        gender: finalGender,
      };

      setPatients([...patients, newPatient]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditIndex(null);
    setCustomGender("");
    setForm({
      id: "",
      name: "",
      age: 0,
      gender: "Male",
      diagnosis: "",
      status: "Admitted",
    });
  };

  const handleDelete = (i: number) =>
    setPatients(patients.filter((_, idx) => idx !== i));

  const handleEdit = (i: number) => {
    setForm(patients[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Patients</h1>
          <p className="text-gray-500 text-sm">
            Manage and view all patient records
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Patient
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow border flex gap-3">
        <input
          placeholder="Search by name, ID, or diagnosis..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option>All Status</option>
          <option>Admitted</option>
          <option>In Treatment</option>
          <option>Discharged</option>
          <option>Waiting</option>
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg text-sm"
        >
          <option>All Genders</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 text-left">ID</th>
              <th className="px-6 py-3 text-left">Patient</th>
              <th className="px-6 py-3 text-left">Age</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Diagnosis</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Edit</th>
              <th className="px-6 py-3 text-left">Delete</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                <td className="px-6 py-4 text-blue-600 font-medium">
                  {p.id}
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">
                      {getInitials(p.name)}
                    </div>
                    {p.name}
                  </div>
                </td>

                <td className="px-6 py-4">{p.age}</td>
                <td className="px-6 py-4 capitalize">{p.gender}</td>
                <td className="px-6 py-4">{p.diagnosis}</td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 text-xs rounded-full ${statusStyle(
                      p.status
                    )}`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleEdit(i)}
                    className="text-blue-600"
                  >
                    Edit
                  </button>
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => handleDelete(i)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              {editIndex !== null ? "Edit Patient" : "Add Patient"}
            </h2>

            <input
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              placeholder="Age"
              value={form.age || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  age: Number(e.target.value),
                })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Diagnosis"
              value={form.diagnosis}
              onChange={(e) =>
                setForm({ ...form, diagnosis: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <select
              value={form.gender}
              onChange={(e) =>
                setForm({ ...form, gender: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            {form.gender === "Other" && (
              <input
                placeholder="Enter gender"
                value={customGender}
                onChange={(e) => setCustomGender(e.target.value)}
                className="border p-2 w-full rounded"
              />
            )}

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option>Admitted</option>
              <option>In Treatment</option>
              <option>Discharged</option>
              <option>Waiting</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="border px-3 py-1">
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}