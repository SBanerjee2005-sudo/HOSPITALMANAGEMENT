import { useState, useEffect } from "react";
import { api } from "../services/api";

import { type DoctorSchedule } from "../data";

export const useDoctorData = (doctorId?: number) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<DoctorSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctorData = async () => {
    setLoading(true);
    try {
      const [aptRes, patRes, presRes, notifRes, schedRes] = await Promise.all([
        api.get<any[]>("/doctor/appointments").catch(() => []),
        api.get<any[]>("/doctor/patients").catch(() => []),
        api.get<any[]>(`/prescriptions/doctor/${doctorId || 0}`).catch(() => []),
        api.get<any[]>("/doctor/notifications").catch(() => []),
        api.get<any[]>("/doctor/schedule").catch(() => []),
      ]);
      setAppointments(aptRes);
      setPatients(patRes);
      setPrescriptions(presRes);
      setNotifications(notifRes);
      setSchedule(schedRes as DoctorSchedule[]);
    } catch (error) {
      console.error("Failed to fetch doctor data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctorData();
  }, [doctorId]);

  return { appointments, patients, prescriptions, notifications, schedule, loading, refetch: fetchDoctorData };
};
