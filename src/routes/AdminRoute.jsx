import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const auth = JSON.parse(localStorage.getItem("binclass_auth"));

  // BELUM LOGIN
  if (!auth?.accessToken) {
    return <Navigate to="/" />;
  }

  // BUKAN ADMIN
  if (auth.role !== "admin") {
    return <Navigate to="/home" />;
  }

  return children;
}
