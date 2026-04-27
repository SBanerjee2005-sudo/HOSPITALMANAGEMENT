import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PatientDashboard from "./pages/PatientDashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import MyAppointments from "./pages/MyAppointments";
import HospitalDetails from "./pages/HospitalDetails";
import Departments from "./pages/Departments";
import DoctorList from "./pages/DoctorList";
import BookAppointment from "./pages/BookAppointment";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="appointments" element={<Appointments />} />
          <Route path="billing" element={<Billing />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* PATIENT ROUTES */}
        <Route
          path="/patient-dashboard"
          element={
            <ProtectedRoute role="patient">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />
          <Route path="hospitals/:id" element={<HospitalDetails />} />
          <Route path="hospitals/:id/departments" element={<Departments />} />
          <Route
            path="hospitals/:id/departments/:department"
            element={<DoctorList />}
          />
          <Route path="book/:doctorId" element={<BookAppointment />} />
          <Route path="my-appointments" element={<MyAppointments />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;