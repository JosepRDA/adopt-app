// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider } from "./hooks/useAuth";
// import PrivateRoute from "./components/PrivateRoute";
// import LoginPage from "./pages/Login";
// import RegisterPage from "./pages/Register";
// import Home from "./pages/Home";
//
// export default function App() {
//   return (
//     <AuthProvider>
//       <BrowserRouter>
//         <Routes>
//           {/* Public routes */}
//           <Route path="/login" element={<LoginPage />} />
//           <Route path="/register" element={<RegisterPage />} />
//
//           {/* Protected routes. Require Login.*/}
//           <Route
//             path="/"
//             element={
//               <PrivateRoute>
//                 <Home />
//               </PrivateRoute>
//             }
//           />
//
//           {/* Catch-all: redirect unknown paths to home */}
//           <Route path="*" element={<Navigate to="/" replace />} />
//         </Routes>
//       </BrowserRouter>
//     </AuthProvider>
//   );
// }

// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import PrivateRoute from "./components/PrivateRoute";
import LoginPage from "./pages/Login";
import RegisterPage from "./pages/Register";
import HomePage from "./pages/Home";
import PetDetailPage from "./pages/PetDetailPage";
import AddPetPage from "./pages/AddPetPage";
import EditPetPage from "./pages/EditPetPage";

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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
