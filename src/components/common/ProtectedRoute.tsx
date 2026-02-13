import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsAuthenticated } from "../../store/slices/authslice"; // adjust path if needed

const ProtectedRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated);

    return isAuthenticated ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
