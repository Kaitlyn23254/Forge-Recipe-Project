import { Navigate } from "react-router";
import { getStoredUser } from "../utility/auth.js";

function AdminRoute({ children }) {
  const user = getStoredUser();

//   If the user is not an admin, redirect to the home page
  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;