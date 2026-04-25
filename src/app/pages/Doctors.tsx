import { useState } from "react";

type Doctor = {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  phone: string;
  email: string;
  status: string;
};

const initialDoctors: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Amanda Foster",
    specialty: "Cardiologist",
    experience: 15,
    phone: "+1 234-567-9001",
    email: "a.foster@hospital.com",
    status: "Available",
  },
  {
    id: "D002",
    name: "Dr. James Chen",
    specialty: "Neurologist",
    experience: 12,
    phone: "+1 234-567-9002",
    email: "j.chen@hospital.com",
    status: "Busy",
  },
  {
    id: "D003",
    name: "Dr. Maria Garcia",
    specialty: "Pediatrician",
    experience: 8,
    phone: "+1 234-567-9003",
    email: "m.garcia@hospital.com",
    status: "Available",
  },
];

export default function Doctors() {
  const [doctors, setDoctors] = useState(initialDoctors);
  const [search, setSearch] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState<Doctor>({
    id: "",
    name: "",
    specialty: "",
    experience: 0,
    phone: "",
    email: "",
    status: "Available",
  });

  // 🔥 AUTO ID GENERATOR
  const generateDoctorId = () => {
    if (doctors.length === 0) return "D001";

    const last = doctors[doctors.length - 1].id;
    const num = parseInt(last.replace("D", "")) + 1;
    return "D" + num.toString().padStart(3, "0");
  };

  const getInitials = (name: string) => {
    const parts = name.replace("Dr. ", "").split(" ");
    return parts[0][0] + (parts[1]?.[0] || "");
  };

  const statusStyle = (status: string) => {
    if (status === "Available") return "bg-green-100 text-green-700";
    if (status === "Busy") return "bg-yellow-100 text-yellow-700";
    if (status === "On Leave") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  // FILTER
  const filtered = doctors.filter((d) =>
    (d.name + d.specialty)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // SAVE
  const handleSave = () => {
    if (!form.name) return;

    if (editIndex !== null) {
      const updated = [...doctors];
      updated[editIndex] = form; // ID stays same
      setDoctors(updated);
    } else {
      const newDoctor = {
        ...form,
        id: generateDoctorId(), // 🔥 AUTO ID
      };

      setDoctors([...doctors, newDoctor]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm({
      id: "",
      name: "",
      specialty: "",
      experience: 0,
      phone: "",
      email: "",
      status: "Available",
    });
  };

  const handleEdit = (i: number) => {
    setForm(doctors[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleDelete = (i: number) => {
    setDoctors(doctors.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Doctors</h1>
          <p className="text-gray-500 text-sm">
            View and manage medical staff
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add New Doctor
        </button>
      </div>

      {/* SEARCH */}
      <div className="bg-white p-4 rounded-xl shadow border">
        <input
          placeholder="Search by name or specialty..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((d, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-xl shadow border hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-teal-500 text-white flex items-center justify-center text-lg font-semibold">
                  {getInitials(d.name)}
                </div>

                <div>
                  <h2 className="font-semibold text-lg">{d.name}</h2>
                  <p className="text-gray-500 text-sm">{d.specialty}</p>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Availability</span>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${statusStyle(
                      d.status
                    )}`}
                  >
                    {d.status}
                  </span>
                </div>

                <div>
                  <span className="text-gray-500">Experience</span>
                  <p className="font-medium">{d.experience} years</p>
                </div>

                <div>
                  <span className="text-gray-500">Contact</span>
                  <p>{d.phone}</p>
                </div>

                <div>
                  <span className="text-gray-500">Email</span>
                  <p>{d.email}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-sm">
              <button
                onClick={() => handleEdit(i)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(i)}
                className="text-red-500 hover:underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              {editIndex !== null ? "Edit Doctor" : "Add Doctor"}
            </h2>

            {/* ❌ REMOVED ID INPUT */}

            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Specialty"
              value={form.specialty}
              onChange={(e) =>
                setForm({ ...form, specialty: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              type="number"
              placeholder="Experience (years)"
              value={form.experience || ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  experience: Number(e.target.value),
                })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option>Available</option>
              <option>Busy</option>
              <option>On Leave</option>
            </select>

            <div className="flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="border px-3 py-1 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-3 py-1 rounded"
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