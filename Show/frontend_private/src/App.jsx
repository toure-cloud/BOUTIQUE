// frontend_private/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import InscriptionsRelooking from './pages/Admin/Relookings/InscriptionsRelooking';
import NouveauProduit from "./pages/Admin/Produits/NouveauProduit";
import NouvelEvenement from "./pages/Admin/Evenements/NouvelEvenement";
import NouvelleFormation from "./pages/Admin/Formations/NouvelleFormation";
import ProduitsList from "./pages/Admin/Produits/ProduitsList";
import EvenementsList from "./pages/Admin/Evenements/EvenementsList";
import FormationsList from "./pages/Admin/Formations/FormationsList";
import PaiementsList from "./pages/Admin/Paiements/PaiementsList";
import ClientsList from "./pages/Admin/Clients/ClientsList";
import ParticipantsList from "./pages/Admin/Evenements/ParticipantsList";
import ParticipantsEvenements from "./pages/Admin/Evenements/ParticipantsEvenements";
import CommandesList from "./pages/Admin/Commandes/CommandesList";
import InscriptionsFormations from "./pages/Admin/Formations/InscriptionsFormations"; // ✅ AJOUTER CET IMPORT
import "./index.css";

// Composant de redirection intelligente
const HomeRedirect = () => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/profile" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Routes publiques */}
          <Route path="/login" element={<Login />} />

          {/* Dashboard Admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/commandes"
            element={
              <ProtectedRoute requireAdmin>
                <CommandesList />
              </ProtectedRoute>
            }
          />

          {/* ✅ Routes Admin - Produits */}
          <Route
            path="/admin/produits"
            element={
              <ProtectedRoute requireAdmin>
                <ProduitsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/participants-evenements"
            element={
              <ProtectedRoute requireAdmin>
                <ParticipantsEvenements />
              </ProtectedRoute>
            }
          />
<Route path="/admin/inscriptions-relooking" element={<InscriptionsRelooking />} />
          <Route
            path="/admin/inscriptions-formations"
            element={
              <ProtectedRoute requireAdmin>
                <InscriptionsFormations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/produits/nouveau"
            element={
              <ProtectedRoute requireAdmin>
                <NouveauProduit />
              </ProtectedRoute>
            }
          />

          {/* ✅ Routes Admin - Événements */}
          <Route
            path="/admin/evenements"
            element={
              <ProtectedRoute requireAdmin>
                <EvenementsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/evenements/nouveau"
            element={
              <ProtectedRoute requireAdmin>
                <NouvelEvenement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/evenements/:id/participants"
            element={
              <ProtectedRoute requireAdmin>
                <ParticipantsList />
              </ProtectedRoute>
            }
          />

          {/* ✅ Routes Admin - Formations */}
          <Route
            path="/admin/formations"
            element={
              <ProtectedRoute requireAdmin>
                <FormationsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/formations/nouveau"
            element={
              <ProtectedRoute requireAdmin>
                <NouvelleFormation />
              </ProtectedRoute>
            }
          />

          {/* ✅ Routes Admin - Clients */}
          <Route
            path="/admin/clients"
            element={
              <ProtectedRoute requireAdmin>
                <ClientsList /> {/* ✅ AJOUTER CETTE ROUTE */}
              </ProtectedRoute>
            }
          />

          {/* ✅ Routes Admin - Paiements */}
          <Route
            path="/admin/paiements"
            element={
              <ProtectedRoute requireAdmin>
                <PaiementsList />
              </ProtectedRoute>
            }
          />

          {/* Profil */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Redirection */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="*" element={<HomeRedirect />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
