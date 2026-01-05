import { Navigate } from "react-router-dom";

const isAuth = () => {
  const auth = JSON.parse(localStorage.getItem("binclass_auth"));
  return auth?.accessToken;
};

export default function ProtectedRoute({ children }) {
  return isAuth() ? children : <Navigate to="/" />;
}
