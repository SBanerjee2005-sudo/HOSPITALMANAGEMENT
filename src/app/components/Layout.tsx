import { NavLink, Outlet } from "react-router-dom";

export default function Layout() {
  const linkClass = ({ isActive }: any) =>
    `flex items-center px-4 py-3 rounded-xl transition-all duration-200 relative
    ${
      isActive
        ? "bg-blue-50 text-blue-600 font-semibold"
        : "text-gray-600 hover:bg-gray-100 hover:text-blue-600"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-4">
        
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600 mb-8 px-2">
          MediCare
        </div>

        {/* Menu */}
        <nav className="space-y-2">

          <NavLink to="/" className={linkClass}>
            Dashboard
          </NavLink>

          <NavLink to="/patients" className={linkClass}>
            Patients
          </NavLink>

          <NavLink to="/doctors" className={linkClass}>
            Doctors
          </NavLink>

          <NavLink to="/appointments" className={linkClass}>
            Appointments
          </NavLink>

          <NavLink to="/billing" className={linkClass}>
            Billing
          </NavLink>

          <NavLink to="/settings" className={linkClass}>
            Settings
          </NavLink>

        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}