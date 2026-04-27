export type DepartmentInfo = {
  name: string;
  doctorCount: number;
  availability: "Available" | "Limited" | "Busy";
};

export type BedType = "ICU" | "General Ward" | "Private Room" | "Emergency";

export type BedTypeAvailability = {
  type: BedType;
  available: number;
  busy: number;
  unavailable: number;
};

export type Hospital = {
  id: number;
  name: string;
  location: string;
  specialties: string[];
  rating: number;
  isOpen: boolean;
  bedsAvailable: number;
  emergencyStatus: "Active" | "Busy" | "Unavailable";
  bedInventory: BedTypeAvailability[];
  departments: DepartmentInfo[];
};

export type Doctor = {
  id: number;
  hospitalId: number;
  department: string;
  name: string;
  experience: number;
  availability: "Available" | "Limited" | "On Leave";
  fees: number;
  phone: string;
  email: string;
};

export type AdminPatient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  diagnosis: string;
  status: "Admitted" | "In Treatment" | "Discharged" | "Waiting";
  hospitalId: number;
};

export type HospitalRevenue = {
  hospitalId: number;
  monthly: number[];
};

export const hospitals: Hospital[] = [
  {
    id: 1,
    name: "Apollo Hospital Kolkata",
    location: "Salt Lake",
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    rating: 4.7,
    isOpen: true,
    bedsAvailable: 18,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 4, busy: 9, unavailable: 1 },
      { type: "General Ward", available: 7, busy: 14, unavailable: 2 },
      { type: "Private Room", available: 5, busy: 6, unavailable: 1 },
      { type: "Emergency", available: 2, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Cardiology", doctorCount: 5, availability: "Available" },
      { name: "Neurology", doctorCount: 4, availability: "Limited" },
      { name: "Orthopedics", doctorCount: 3, availability: "Available" },
      { name: "General Medicine", doctorCount: 6, availability: "Busy" },
    ],
  },
  {
    id: 2,
    name: "Fortis Hospital Kolkata",
    location: "Anandapur",
    specialties: ["Cardiology", "Dermatology", "ENT"],
    rating: 4.4,
    isOpen: true,
    bedsAvailable: 7,
    emergencyStatus: "Busy",
    bedInventory: [
      { type: "ICU", available: 1, busy: 6, unavailable: 1 },
      { type: "General Ward", available: 3, busy: 12, unavailable: 2 },
      { type: "Private Room", available: 2, busy: 5, unavailable: 1 },
      { type: "Emergency", available: 1, busy: 4, unavailable: 0 },
    ],
    departments: [
      { name: "Cardiology", doctorCount: 4, availability: "Limited" },
      { name: "Dermatology", doctorCount: 3, availability: "Available" },
      { name: "ENT", doctorCount: 2, availability: "Available" },
      { name: "General Medicine", doctorCount: 5, availability: "Busy" },
    ],
  },
  {
    id: 3,
    name: "AMRI Dhakuria",
    location: "Dhakuria",
    specialties: ["Pediatrics", "Neurology", "General Medicine"],
    rating: 4.1,
    isOpen: false,
    bedsAvailable: 0,
    emergencyStatus: "Unavailable",
    bedInventory: [
      { type: "ICU", available: 0, busy: 2, unavailable: 4 },
      { type: "General Ward", available: 0, busy: 4, unavailable: 6 },
      { type: "Private Room", available: 0, busy: 1, unavailable: 2 },
      { type: "Emergency", available: 0, busy: 1, unavailable: 2 },
    ],
    departments: [
      { name: "Pediatrics", doctorCount: 4, availability: "Available" },
      { name: "Neurology", doctorCount: 2, availability: "Limited" },
      { name: "General Medicine", doctorCount: 4, availability: "Busy" },
    ],
  },
  {
    id: 4,
    name: "Peerless Hospital Kolkata",
    location: "Panchasayar",
    specialties: ["Oncology", "Cardiology", "General Medicine"],
    rating: 4.3,
    isOpen: true,
    bedsAvailable: 12,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 2, busy: 7, unavailable: 1 },
      { type: "General Ward", available: 5, busy: 10, unavailable: 2 },
      { type: "Private Room", available: 3, busy: 5, unavailable: 1 },
      { type: "Emergency", available: 2, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Oncology", doctorCount: 4, availability: "Available" },
      { name: "Cardiology", doctorCount: 3, availability: "Limited" },
      { name: "General Medicine", doctorCount: 5, availability: "Available" },
    ],
  },
  {
    id: 5,
    name: "Ruby General Hospital",
    location: "Kasba",
    specialties: ["Nephrology", "Pediatrics", "ENT"],
    rating: 4.2,
    isOpen: true,
    bedsAvailable: 9,
    emergencyStatus: "Busy",
    bedInventory: [
      { type: "ICU", available: 1, busy: 5, unavailable: 1 },
      { type: "General Ward", available: 4, busy: 11, unavailable: 2 },
      { type: "Private Room", available: 3, busy: 4, unavailable: 1 },
      { type: "Emergency", available: 1, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Nephrology", doctorCount: 3, availability: "Available" },
      { name: "Pediatrics", doctorCount: 4, availability: "Limited" },
      { name: "ENT", doctorCount: 3, availability: "Available" },
    ],
  },
  {
    id: 6,
    name: "Medica Superspecialty",
    location: "Mukundapur",
    specialties: ["Critical Care", "Neurology", "Orthopedics"],
    rating: 4.6,
    isOpen: true,
    bedsAvailable: 21,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 5, busy: 10, unavailable: 1 },
      { type: "General Ward", available: 8, busy: 16, unavailable: 2 },
      { type: "Private Room", available: 5, busy: 6, unavailable: 1 },
      { type: "Emergency", available: 3, busy: 4, unavailable: 0 },
    ],
    departments: [
      { name: "Critical Care", doctorCount: 4, availability: "Available" },
      { name: "Neurology", doctorCount: 5, availability: "Available" },
      { name: "Orthopedics", doctorCount: 4, availability: "Limited" },
    ],
  },
];

export const doctors: Doctor[] = [
  { id: 101, hospitalId: 1, department: "Cardiology", name: "Dr. Rahul Das", experience: 10, availability: "Available", fees: 900, phone: "+91 90511 11001", email: "rahul.das@medisync.com" },
  { id: 102, hospitalId: 1, department: "Cardiology", name: "Dr. Suman Ghosh", experience: 8, availability: "Limited", fees: 850, phone: "+91 90511 11002", email: "suman.ghosh@medisync.com" },
  { id: 103, hospitalId: 1, department: "Neurology", name: "Dr. Tumpa Sen", experience: 7, availability: "Available", fees: 1000, phone: "+91 90511 11003", email: "tumpa.sen@medisync.com" },
  { id: 104, hospitalId: 1, department: "Orthopedics", name: "Dr. Mita Roy", experience: 9, availability: "Available", fees: 780, phone: "+91 90511 11004", email: "mita.roy@medisync.com" },
  { id: 105, hospitalId: 2, department: "Cardiology", name: "Dr. Arindam Pal", experience: 12, availability: "Limited", fees: 950, phone: "+91 90511 11005", email: "arindam.pal@medisync.com" },
  { id: 106, hospitalId: 2, department: "Dermatology", name: "Dr. Sneha Sen", experience: 6, availability: "Available", fees: 700, phone: "+91 90511 11006", email: "sneha.sen@medisync.com" },
  { id: 107, hospitalId: 2, department: "ENT", name: "Dr. Rakesh Mitra", experience: 11, availability: "On Leave", fees: 650, phone: "+91 90511 11007", email: "rakesh.mitra@medisync.com" },
  { id: 108, hospitalId: 3, department: "Pediatrics", name: "Dr. Nabanita Paul", experience: 9, availability: "Available", fees: 800, phone: "+91 90511 11008", email: "nabanita.paul@medisync.com" },
  { id: 109, hospitalId: 3, department: "Neurology", name: "Dr. Arnab Dey", experience: 5, availability: "Limited", fees: 900, phone: "+91 90511 11009", email: "arnab.dey@medisync.com" },
  { id: 110, hospitalId: 4, department: "Oncology", name: "Dr. Sreya Mitra", experience: 11, availability: "Available", fees: 1200, phone: "+91 90511 11010", email: "sreya.mitra@medisync.com" },
  { id: 111, hospitalId: 4, department: "Cardiology", name: "Dr. Souvik Kar", experience: 9, availability: "Limited", fees: 980, phone: "+91 90511 11011", email: "souvik.kar@medisync.com" },
  { id: 112, hospitalId: 5, department: "Nephrology", name: "Dr. Ria Banerjee", experience: 10, availability: "Available", fees: 1100, phone: "+91 90511 11012", email: "ria.banerjee@medisync.com" },
  { id: 113, hospitalId: 5, department: "ENT", name: "Dr. Debjit Ghosh", experience: 8, availability: "Available", fees: 760, phone: "+91 90511 11013", email: "debjit.ghosh@medisync.com" },
  { id: 114, hospitalId: 6, department: "Critical Care", name: "Dr. Paroma Nandi", experience: 13, availability: "Available", fees: 1400, phone: "+91 90511 11014", email: "paroma.nandi@medisync.com" },
  { id: 115, hospitalId: 6, department: "Neurology", name: "Dr. Sagnik Roy", experience: 7, availability: "Available", fees: 1020, phone: "+91 90511 11015", email: "sagnik.roy@medisync.com" },
  { id: 116, hospitalId: 6, department: "Orthopedics", name: "Dr. Rupam Dutta", experience: 9, availability: "Limited", fees: 930, phone: "+91 90511 11016", email: "rupam.dutta@medisync.com" },
];

export const adminPatients: AdminPatient[] = [
  {
    id: "P001",
    name: "Rohan Mukherjee",
    age: 45,
    gender: "Male",
    diagnosis: "Hypertension",
    status: "In Treatment",
    hospitalId: 1,
  },
  {
    id: "P002",
    name: "Priyanka Sen",
    age: 32,
    gender: "Female",
    diagnosis: "Diabetes Type 2",
    status: "Admitted",
    hospitalId: 2,
  },
  {
    id: "P003",
    name: "Ritwik Ghosh",
    age: 27,
    gender: "Male",
    diagnosis: "Migraine",
    status: "Waiting",
    hospitalId: 3,
  },
  {
    id: "P004",
    name: "Ananya Dutta",
    age: 54,
    gender: "Female",
    diagnosis: "Cardiac Arrhythmia",
    status: "Discharged",
    hospitalId: 1,
  },
  {
    id: "P005",
    name: "Imran Ali",
    age: 41,
    gender: "Male",
    diagnosis: "Pneumonia",
    status: "In Treatment",
    hospitalId: 2,
  },
  {
    id: "P006",
    name: "Tanisha Roy",
    age: 36,
    gender: "Female",
    diagnosis: "Kidney Stone",
    status: "Admitted",
    hospitalId: 5,
  },
  {
    id: "P007",
    name: "Sayan Chatterjee",
    age: 59,
    gender: "Male",
    diagnosis: "Post Stroke Rehab",
    status: "In Treatment",
    hospitalId: 6,
  },
  {
    id: "P008",
    name: "Mou Das",
    age: 43,
    gender: "Female",
    diagnosis: "Thyroid Nodules",
    status: "Waiting",
    hospitalId: 4,
  },
  {
    id: "P009",
    name: "Arif Khan",
    age: 48,
    gender: "Male",
    diagnosis: "ENT Infection",
    status: "Discharged",
    hospitalId: 5,
  },
  {
    id: "P010",
    name: "Nabanita Ghosh",
    age: 62,
    gender: "Female",
    diagnosis: "Neuro Observation",
    status: "Admitted",
    hospitalId: 6,
  },
];

export const revenueMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const hospitalRevenue: HospitalRevenue[] = [
  {
    hospitalId: 1,
    monthly: [4500000, 4720000, 4830000, 5010000, 5120000, 5280000, 5360000, 5420000, 5490000, 5630000, 5740000, 5900000],
  },
  {
    hospitalId: 2,
    monthly: [3800000, 3920000, 4010000, 4150000, 4240000, 4330000, 4410000, 4460000, 4520000, 4650000, 4740000, 4860000],
  },
  {
    hospitalId: 3,
    monthly: [2900000, 3010000, 3090000, 3160000, 3220000, 3270000, 3330000, 3380000, 3410000, 3490000, 3560000, 3640000],
  },
  {
    hospitalId: 4,
    monthly: [3300000, 3440000, 3520000, 3690000, 3780000, 3860000, 3940000, 4010000, 4070000, 4170000, 4250000, 4380000],
  },
  {
    hospitalId: 5,
    monthly: [3100000, 3220000, 3330000, 3470000, 3520000, 3600000, 3670000, 3720000, 3780000, 3890000, 3970000, 4090000],
  },
  {
    hospitalId: 6,
    monthly: [4100000, 4230000, 4370000, 4520000, 4630000, 4740000, 4830000, 4920000, 5010000, 5150000, 5260000, 5410000],
  },
];

export const getHospitalById = (id: number) => {
  return hospitals.find((hospital) => hospital.id === id) ?? null;
};

export const getHospitalMonthlyRevenue = (hospitalId: number) => {
  return hospitalRevenue.find((revenue) => revenue.hospitalId === hospitalId)?.monthly ?? [];
};

export const getHospitalYearlyRevenue = () => {
  return hospitalRevenue.map((revenue) => ({
    hospitalId: revenue.hospitalId,
    yearly: revenue.monthly.reduce((sum, value) => sum + value, 0),
  }));
};

export const getNetworkMonthlyRevenue = () => {
  return revenueMonths.map((month, monthIndex) => ({
    month,
    value: hospitalRevenue.reduce(
      (sum, revenue) => sum + (revenue.monthly[monthIndex] ?? 0),
      0
    ),
  }));
};

export const getHospitalNameById = (id: number) => {
  return getHospitalById(id)?.name ?? "Unknown Hospital";
};

export const getDepartmentsByHospital = (hospitalId: number) => {
  return getHospitalById(hospitalId)?.departments ?? [];
};

export const getDoctorsByHospitalAndDepartment = (
  hospitalId: number,
  department: string
) => {
  return doctors.filter(
    (doctor) =>
      doctor.hospitalId === hospitalId &&
      doctor.department.toLowerCase() === department.toLowerCase()
  );
};

export const getDoctorById = (id: number) => {
  return doctors.find((doctor) => doctor.id === id) ?? null;
};