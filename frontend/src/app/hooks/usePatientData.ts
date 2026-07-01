import { useState, useEffect } from "react";
import { api } from "../services/api";

export const usePatientData = (patientId?: number) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const [aptRes, presRes, dashRes] = await Promise.all([
        api.get<any[]>("/patient/appointments").catch(() => []),
        api.get<any[]>(`/prescriptions/patient/${patientId || 0}`).catch(() => []),
        api.get<any>("/patient/dashboard").catch(() => null),
      ]);
      setAppointments(aptRes);
      setPrescriptions(presRes);
      setDashboard(dashRes);
    } catch (error) {
      console.error("Failed to fetch patient data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [patientId]);

  return { appointments, prescriptions, dashboard, loading, refetch: fetchPatientData };
};
