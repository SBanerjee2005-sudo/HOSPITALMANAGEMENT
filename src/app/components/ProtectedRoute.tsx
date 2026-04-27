import { Navigate } from "react-router-dom";
import { getUser } from "../utils/auth";
import type { JSX } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role: string;
}) {
  const user = getUser();

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}