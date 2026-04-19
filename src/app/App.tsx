import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports"; // ✅ ADDED

function App() {
  const linkClass = ({ isActive }: any) =>
    `px-4 py-3 rounded-lg transition-all duration-200 font-medium
     ${
       isActive
         ? "bg-blue-100 text-blue-600"
         : "text-gray-700 hover:bg-gray-200"
     }`;

  return (
    <Router>
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-white border-r shadow-md p-5">
          <h1 className="text-2xl font-bold mb-8 text-blue-600">MediCare</h1>

          <nav className="flex flex-col gap-2">
            <NavLink to="/" className={linkClass}>Dashboard</NavLink>
            <NavLink to="/patients" className={linkClass}>Patients</NavLink>
            <NavLink to="/doctors" className={linkClass}>Doctors</NavLink>
            <NavLink to="/appointments" className={linkClass}>Appointments</NavLink>
            <NavLink to="/billing" className={linkClass}>Billing</NavLink>

            {/* ✅ NEW LINK */}
            <NavLink to="/reports" className={linkClass}>Reports</NavLink>

            <NavLink to="/settings" className={linkClass}>Settings</NavLink>
          </nav>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">

          {/* Navbar */}
          <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm">
            <input
              type="text"
              placeholder="Search..."
              className="px-4 py-2 border rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex items-center gap-4">
              🔔
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded-full">
                  S
                </div>
                <span>Swarnavo</span>
              </div>
            </div>
          </div>

          {/* Pages */}
          <div className="p-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/patients" element={<Patients />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/billing" element={<Billing />} />

              {/* ✅ NEW ROUTE */}
              <Route path="/reports" element={<Reports />} />

              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>

        </div>
      </div>
    </Router>
  );
}

export default App;