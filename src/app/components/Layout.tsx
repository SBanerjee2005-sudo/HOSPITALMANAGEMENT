import { useMemo, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { getUser, logoutUser } from "../utils/auth";

export default function Layout() {
  const navigate = useNavigate();
  const user = getUser();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const links = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "patients", label: "Patients" },
        { to: "doctors", label: "Doctors" },
        { to: "appointments", label: "Appointments" },
        { to: "billing", label: "Billing" },
        { to: "reports", label: "Reports" },
        { to: "settings", label: "Settings" },
      ];
    }

    return [
      { to: "/patient-dashboard", label: "Dashboard", end: true },
      { to: "my-appointments", label: "My Appointments" },
    ];
  }, [user?.role]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center px-4 py-3 rounded-xl transition-all duration-300
    ${
      isActive
        ? "bg-cyan-50 text-cyan-800 font-semibold shadow-sm border border-cyan-100"
        : "text-slate-600 hover:bg-slate-100/85 hover:text-slate-900"
    }`;

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  return (
    <div className="page-shell min-h-screen lg:flex">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/35 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-cyan-100/80 bg-white/90 p-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700/80">
              Hospital Suite
            </p>
            <p className="text-2xl font-extrabold text-slate-900">Medisync</p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Collapse sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="surface-card mb-6 px-4 py-3 text-sm text-slate-600 soft-pop">
          <p className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
            {user?.role === "admin" ? <ShieldCheck size={16} /> : <UserRound size={16} />}
            {user?.role === "admin" ? "Administrator" : "Patient Portal"}
          </p>
          <p>Role based workspace with live workflow navigation.</p>
        </div>

        <nav className="stagger space-y-2" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={linkClass}
              onClick={() => setIsSidebarOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 p-3 md:p-5">
          <div className="glass-topbar mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

              <div className="relative hidden md:block">
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search appointments, doctors, reports"
                  aria-label="Search appointments, doctors, and reports"
                  className="w-[370px] rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden rounded-xl bg-cyan-50 px-3 py-2 text-right md:block">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800">{user?.username}</p>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="fade-up px-3 pb-8 md:px-5" tabIndex={-1}>
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}