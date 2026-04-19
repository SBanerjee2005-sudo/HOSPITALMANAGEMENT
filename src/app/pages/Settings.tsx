export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="bg-white p-6 rounded-xl shadow-md border w-96">
        <label className="block mb-2">Name</label>
        <input className="border w-full p-2 mb-4 rounded" defaultValue="Swarnavo" />

        <label className="block mb-2">Email</label>
        <input className="border w-full p-2 mb-4 rounded" defaultValue="admin@hospital.com" />

        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Save Changes
        </button>
      </div>
    </div>
  );
}