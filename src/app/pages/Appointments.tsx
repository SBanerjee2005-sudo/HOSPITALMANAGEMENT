import { useState } from "react";

type Appointment = {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  type: string;
  status: string;
};

const initialAppointments: Appointment[] = [
  {
    id: "A001",
    patient: "John Smith",
    doctor: "Dr. Amanda Foster",
    date: "2026-04-05",
    time: "09:00 AM",
    type: "Follow-up",
    status: "Scheduled",
  },
  {
    id: "A002",
    patient: "Sarah Johnson",
    doctor: "Dr. James Chen",
    date: "2026-04-04",
    time: "02:00 PM",
    type: "Consultation",
    status: "In Progress",
  },
];

export default function Appointments() {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [form, setForm] = useState<Appointment>({
    id: "",
    patient: "",
    doctor: "",
    date: "",
    time: "",
    type: "Consultation",
    status: "Scheduled",
  });

  const statusStyle = (status: string) => {
    if (status === "Scheduled") return "bg-blue-100 text-blue-600";
    if (status === "In Progress") return "bg-yellow-100 text-yellow-700";
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "Cancelled") return "bg-red-100 text-red-600";
    return "bg-gray-100";
  };

  const filtered = appointments.filter((a) =>
    (a.patient + a.doctor + a.type)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.patient || !form.doctor) return;

    if (editIndex !== null) {
      const updated = [...appointments];
      updated[editIndex] = form;
      setAppointments(updated);
    } else {
      setAppointments([
        ...appointments,
        { ...form, id: "A00" + (appointments.length + 1) },
      ]);
    }

    resetForm();
  };

  const resetForm = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm({
      id: "",
      patient: "",
      doctor: "",
      date: "",
      time: "",
      type: "Consultation",
      status: "Scheduled",
    });
  };

  const handleEdit = (i: number) => {
    setForm(appointments[i]);
    setEditIndex(i);
    setShowModal(true);
  };

  const handleDelete = (i: number) => {
    setAppointments(appointments.filter((_, idx) => idx !== i));
  };

  const handleComplete = (i: number) => {
    const updated = [...appointments];
    updated[i].status = "Completed";
    setAppointments(updated);
  };

  // GROUP BY DATE (calendar view)
  const grouped = filtered.reduce((acc: any, curr) => {
    if (!acc[curr.date]) acc[curr.date] = [];
    acc[curr.date].push(curr);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Appointments</h1>
          <p className="text-gray-500 text-sm">
            Manage and schedule appointments
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Schedule Appointment
        </button>
      </div>

      {/* SEARCH + VIEW */}
      <div className="bg-white p-4 rounded-xl shadow border flex justify-between items-center gap-3">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
        />

        <div className="flex gap-2">
          <button
            onClick={() => setView("list")}
            className={`px-3 py-1 rounded ${
              view === "list" ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            List
          </button>

          <button
            onClick={() => setView("calendar")}
            className={`px-3 py-1 rounded ${
              view === "calendar" ? "bg-gray-200" : "bg-gray-100"
            }`}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="bg-white rounded-xl shadow border overflow-hidden">
          <div className="grid grid-cols-8 px-6 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
            <span>ID</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Date</span>
            <span>Time</span>
            <span>Type</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filtered.map((a, i) => (
            <div
              key={i}
              className="grid grid-cols-8 px-6 py-4 items-center border-b text-sm hover:bg-gray-50"
            >
              <span className="text-blue-600">{a.id}</span>
              <span>{a.patient}</span>
              <span>{a.doctor}</span>
              <span>{a.date}</span>
              <span>{a.time}</span>
              <span>{a.type}</span>

              <span
                className={`px-3 py-1 text-xs rounded-full w-fit ${statusStyle(
                  a.status
                )}`}
              >
                {a.status}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(i)}
                  className="text-blue-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(i)}
                  className="text-red-500"
                >
                  Delete
                </button>

                {a.status !== "Completed" && (
                  <button
                    onClick={() => handleComplete(i)}
                    className="text-green-600"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div className="space-y-4">
          {Object.keys(grouped).map((date) => (
            <div key={date} className="bg-white p-4 rounded-xl shadow border">
              <h2 className="font-semibold mb-3">{date}</h2>

              {grouped[date].map((a: Appointment, i: number) => (
                <div
                  key={i}
                  className="flex justify-between items-center border-b py-3"
                >
                  <div>
                    <p className="font-medium">{a.time}</p>
                    <p className="text-gray-600 text-sm">
                      {a.patient} with {a.doctor}
                    </p>
                    <p className="text-gray-400 text-xs">{a.type}</p>
                  </div>

                  <span
                    className={`px-3 py-1 text-xs rounded-full ${statusStyle(
                      a.status
                    )}`}
                  >
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <h2 className="text-lg font-semibold">
              {editIndex !== null ? "Edit Appointment" : "Add Appointment"}
            </h2>

            <input
              placeholder="Patient Name"
              value={form.patient}
              onChange={(e) =>
                setForm({ ...form, patient: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              placeholder="Doctor Name"
              value={form.doctor}
              onChange={(e) =>
                setForm({ ...form, doctor: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              type="date"
              value={form.date}
              onChange={(e) =>
                setForm({ ...form, date: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <input
              type="time"
              value={form.time}
              onChange={(e) =>
                setForm({ ...form, time: e.target.value })
              }
              className="border p-2 w-full rounded"
            />

            <select
              value={form.type}
              onChange={(e) =>
                setForm({ ...form, type: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option>Consultation</option>
              <option>Follow-up</option>
              <option>Surgery</option>
              <option>Checkup</option>
            </select>

            <select
              value={form.status}
              onChange={(e) =>
                setForm({ ...form, status: e.target.value })
              }
              className="border p-2 w-full rounded"
            >
              <option>Scheduled</option>
              <option>In Progress</option>
              <option>Completed</option>
              <option>Cancelled</option>
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={resetForm} className="border px-3 py-1 rounded">
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