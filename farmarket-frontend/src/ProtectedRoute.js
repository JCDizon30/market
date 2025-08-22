import { Navigate } from "react-router-dom";
import Swal from "sweetalert2";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  // No user logged in
  if (!user) {
    Swal.fire("Unauthorized", "You must be logged in to access this page.", "warning");
    return <Navigate to="/login" replace />;
  }

  // Role-based check (if allowedRoles is defined)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    Swal.fire("Forbidden", "You don't have permission to access this page.", "error");
    return <Navigate to="/" replace />;
  }

  // User is authorized
  return children;
};

export default ProtectedRoute;
