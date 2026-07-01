import { useState, useEffect } from "react";
import { api } from "../services/api";

export const useStaffData = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [reports, setReports] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStaffData = async () => {
    setLoading(true);
    try {
      const [aptRes, patRes, docRes, notifRes, schedRes, reportRes] = await Promise.all([
        api.get<any[]>("/staff/appointments").catch(() => []),
        api.get<any[]>("/staff/patients").catch(() => []),
        api.get<any[]>("/staff/doctors").catch(() => []),
        api.get<any[]>("/staff/notifications").catch(() => []),
        api.get<any[]>("/staff/schedule").catch(() => []),
        api.get<any>("/staff/reports").catch(() => null),
      ]);
      setAppointments(aptRes);
      setPatients(patRes);
      setDoctors(docRes);
      setNotifications(notifRes);
      setSchedule(schedRes);
      setReports(reportRes);
    } catch (error) {
      console.error("Failed to fetch staff data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffData();
  }, []);

  return { appointments, patients, doctors, notifications, schedule, reports, loading, refetch: fetchStaffData };
};
