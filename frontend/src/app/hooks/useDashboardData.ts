import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { type Hospital, type Doctor, type AdminPatient, type AppointmentRecord } from '../data';

export const useDashboardData = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [adminPatients, setAdminPatients] = useState<AdminPatient[]>([]);
  const [appointments, setAppointments] = useState<AppointmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Run all fetches independently so one failure does not zero out others
      const [hRes, dRes, pRes, aRes] = await Promise.all([
        api.get<Hospital[]>('/hospitals').catch((e) => { console.error('hospitals fetch failed', e); return [] as Hospital[]; }),
        api.get<Doctor[]>('/doctors').catch((e) => { console.error('doctors fetch failed', e); return [] as Doctor[]; }),
        api.get<any[]>('/patients').catch((e) => { console.error('patients fetch failed', e); return []; }),
        api.get<AppointmentRecord[]>('/appointments').catch(() => [] as AppointmentRecord[]),
      ]);

      setHospitals(hRes);
      setDoctors(dRes);

      // Normalize patient IDs: backend returns integers, frontend types expect strings
      const normalizedPatients: AdminPatient[] = pRes.map((p: any) => ({
        id: String(p.id),
        name: p.name ?? 'Unknown',
        age: p.age ?? 0,
        gender: (p.gender as AdminPatient['gender']) ?? 'Other',
        diagnosis: p.diagnosis ?? 'N/A',
        status: (p.status as AdminPatient['status']) ?? 'Waiting',
        hospitalId: p.hospitalId ?? 1,
      }));
      setAdminPatients(normalizedPatients);
      setAppointments(aRes);
    } catch (err) {
      console.error('Unexpected error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getHospitalById = (id: number) => hospitals.find(h => h.id === id);

  return { hospitals, doctors, adminPatients, appointments, loading, getHospitalById, refetch: fetchData };
};
