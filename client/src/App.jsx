import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuthContext } from "./context/AuthContext";
import { TicketProvider } from "./context/TicketContext";
import AuthPage from "./pages/AuthPage";
import Home from "./pages/Home";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-500 text-lg">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};


const AppRoutes = () => {
  const { user } = useAuthContext();

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={"/dashboard"} replace />}
      />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/auth/:type" element={<AuthPage />} />
      <Route
        path="/:section/:ticketId?"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <TicketProvider>
          <AppRoutes />
        </TicketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
