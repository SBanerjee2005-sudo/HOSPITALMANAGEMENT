export default function Billing() {
  const bills = [
    { name: "Rahul Das", amount: "$200" },
    { name: "Tumpa Sen", amount: "$150" },
    { name: "Suman Ghosh", amount: "$300" },
    { name: "Mita Roy", amount: "$250" },
    { name: "Abhijit Pal", amount: "$180" }
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Billing</h1>

      <div className="bg-white rounded-xl shadow-md border">
        {bills.map((b, i) => (
          <div key={i} className="flex justify-between px-6 py-4 border-b hover:bg-gray-50 transition">
            <span>{b.name}</span>
            <span>{b.amount}</span>
          </div>
        ))}
      </div>
    </div>
  );
}