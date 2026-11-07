import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import PropertiesPage from './pages/PropertiesPage';
import PropertyDetailPage from './pages/PropertyDetailPage';
import LandlordDashboard from './pages/LandlordDashboard';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';

// Route Guards requiring explicit authentication
const LandlordRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading Landlord Portal...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'landlord' && user.role !== 'admin')) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const StudentRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading Student Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Opening Super Admin Console...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

function AppLayout() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${isAdminRoute ? 'bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100' : 'bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans'}`}>
      {/* Show public Navbar only on non-admin routes */}
      {!isAdminRoute && <Navbar />}

      {/* Main Route Content */}
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/properties/:identifier" element={<PropertyDetailPage />} />

          {/* Student Routes */}
          <Route
            path="/student/inquiries"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />
          <Route
            path="/student/saved"
            element={
              <StudentRoute>
                <StudentDashboard />
              </StudentRoute>
            }
          />

          {/* Landlord CRM & Listings */}
          <Route
            path="/landlord/dashboard"
            element={
              <LandlordRoute>
                <LandlordDashboard />
              </LandlordRoute>
            }
          />

          {/* Admin Routes with dedicated SaaS shell */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/users" element={<Navigate to="/admin/dashboard?tab=users" replace />} />
          <Route path="/admin/properties" element={<Navigate to="/admin/dashboard?tab=properties" replace />} />

          {/* Redirect api-docs */}
          <Route path="/api-docs" element={<Navigate to="/" replace />} />

          {/* Auth */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Show public Footer only on non-admin routes */}
      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
