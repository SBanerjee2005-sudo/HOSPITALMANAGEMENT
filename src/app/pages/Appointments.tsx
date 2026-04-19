const appointments = [
  { patient: "Rahul Das", doctor: "Dr. Mita Roy", time: "10:00 AM" },
  { patient: "Tumpa Sen", doctor: "Dr. Rahul Das", time: "11:00 AM" },
  { patient: "Suman Ghosh", doctor: "Dr. Tumpa Sen", time: "12:00 PM" },
  { patient: "Mita Roy", doctor: "Dr. Abhijit Pal", time: "1:00 PM" },
  { patient: "Abhijit Pal", doctor: "Dr. Suman Ghosh", time: "2:00 PM" },
];

export default function Appointments() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Appointments</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Time</span>
        </div>

        {/* Rows */}
        {appointments.map((a, index) => (
          <div
            key={index}
            className="grid grid-cols-3 px-6 py-4 text-sm border-b border-gray-200/70 hover:bg-gray-50 transition cursor-pointer"
          >
            <span className="font-medium text-gray-800">{a.patient}</span>
            <span className="text-gray-600">{a.doctor}</span>
            <span className="text-gray-600">{a.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}