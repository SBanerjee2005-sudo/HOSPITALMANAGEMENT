const patients = [
  { name: "Rahul Das", age: 30, disease: "Diabetes" },
  { name: "Tumpa Sen", age: 25, disease: "Fever" },
  { name: "Suman Ghosh", age: 45, disease: "Heart Issue" },
  { name: "Mita Roy", age: 35, disease: "Asthma" },
  { name: "Abhijit Pal", age: 50, disease: "BP" },
];

export default function Patients() {
  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Patients</h1>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <span>Name</span>
          <span>Age</span>
          <span>Disease</span>
        </div>

        {/* Rows */}
        {patients.map((p, index) => (
          <div
            key={index}
            className="grid grid-cols-3 px-6 py-4 text-sm border-b border-gray-200/70 hover:bg-gray-50 transition cursor-pointer"
          >
            <span className="font-medium text-gray-800">{p.name}</span>
            <span className="text-gray-600">{p.age}</span>
            <span className="text-gray-600">{p.disease}</span>
          </div>
        ))}
      </div>
    </div>
  );
}