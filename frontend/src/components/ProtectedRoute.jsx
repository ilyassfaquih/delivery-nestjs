import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, requireAdmin, requireLivreur, blockLivreur, public: isPublic }) {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="text-center text-white mt-10">Loading...</div>;
    }

    // If driver is on a page they're not allowed (menu, order) → redirect to dashboard
    if (blockLivreur && user?.role === 'DRIVER') {
        return <Navigate to="/livreur" replace />;
    }

    // Public pages (e.g. Menu): no login required
    if (isPublic) {
        return children;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user.role !== 'ADMIN') {
        return <Navigate to="/" replace />;
    }

    // Require backend role 'DRIVER' for driver-only routes
    if (requireLivreur && user.role !== 'DRIVER') {
        return <Navigate to="/" replace />;
    }

    return children;
}