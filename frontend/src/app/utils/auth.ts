export type UserRole = "admin" | "patient" | "hospital_staff" | "doctor";

export type AuthUser = {
  role: UserRole;
  username: string;
  id?: number;
  hospitalId?: number;
  hospitalIds?: number[];
  activeHospitalId?: number;
  doctorId?: number;
  displayName?: string;
  email?: string;
  phone?: string;
  verification_status?: string;
};

export const loginUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const updateLoggedInUser = (patch: Partial<AuthUser>) => {
  const currentUser = getUser();
  if (!currentUser) return;

  loginUser({ ...currentUser, ...patch });
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};

export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};

export const getRoleHomePath = (role: UserRole) => {
  if (role === "admin") return "/admin";
  if (role === "patient") return "/patient-dashboard";
  if (role === "hospital_staff") return "/staff-dashboard";
  return "/doctor-dashboard";
};