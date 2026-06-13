import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";

// Placeholder — you'll replace this with a real HomePage later
function HomePage() {
  return <h1 style={{ textAlign: "center", marginTop: "3rem" }}>🐾 Pet Adoption Platform</h1>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <HomePage />
              </PrivateRoute>
            }
          />

          {/* Catch-all: redirect unknown paths to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
