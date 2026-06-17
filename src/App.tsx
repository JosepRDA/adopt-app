import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import HomePage from "./pages/Home";
import PetDetailPage from "./pages/PetDetailPage";
import AddPetPage from "./pages/AddPetPage";
import EditPetPage from "./pages/EditPetPage";
import AdoptionRequestPage from "./pages/AdoptionRequestPage";
import MyRequestsPage from "./components/MyRequestsPage";
import ManageRequestsPage from "./pages/ManageRequestsPage";
import AdminPanelPage from "./pages/AdminPanelPage";
import AdminRoute from "./components/AdminRoute";
import ReportListingPage from "./pages/ReportListingPage";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes — all require authentication */}
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
          <Route path="/pets/new" element={<PrivateRoute><AddPetPage /></PrivateRoute>} />
          <Route path="/pets/:id" element={<PrivateRoute><PetDetailPage /></PrivateRoute>} />
          <Route path="/pets/:id/edit" element={<PrivateRoute><EditPetPage /></PrivateRoute>} />
          <Route path="/pets/:petId/adopt" element={<PrivateRoute><AdoptionRequestPage /></PrivateRoute>} />
          <Route path="/pets/:petId/report" element={<PrivateRoute><ReportListingPage /></PrivateRoute>} />
          <Route path="/my-requests" element={<PrivateRoute><MyRequestsPage /></PrivateRoute>} />
          <Route path="/manage-requests" element={<PrivateRoute><ManageRequestsPage /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanelPage /></AdminRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
