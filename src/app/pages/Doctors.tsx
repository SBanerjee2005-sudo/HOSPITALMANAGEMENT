export default function Doctors() {
  const doctors = [
    { name: "Dr. Rahul Das", dept: "Cardiology" },
    { name: "Dr. Tumpa Sen", dept: "Neurology" },
    { name: "Dr. Suman Ghosh", dept: "Orthopedic" },
    { name: "Dr. Mita Roy", dept: "Dermatology" },
    { name: "Dr. Abhijit Pal", dept: "ENT" }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>

      <div className="grid grid-cols-3 gap-6">
        {doctors.map((d, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition border">
            <h2 className="font-bold">{d.name}</h2>
            <p className="text-gray-500">{d.dept}</p>
          </div>
        ))}
      </div>
    </div>
  );
}