import fs from "fs";
import { 
  hospitals, 
  doctors, 
  adminPatients, 
  hospitalRevenue, 
  appointments, 
  doctorSchedules, 
  alertNotifications, 
  patientMedicalRecords, 
  prescriptionRecords 
} from "./frontend/src/app/data";

const data = {
  hospitals,
  doctors,
  adminPatients,
  hospitalRevenue,
  appointments,
  doctorSchedules,
  alertNotifications,
  patientMedicalRecords,
  prescriptionRecords
};

fs.writeFileSync("seed_data.json", JSON.stringify(data, null, 2));
console.log("Dumped seed data to seed_data.json");
