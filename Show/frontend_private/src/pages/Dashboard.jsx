// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Grid, Typography, Box, Card, CardContent, Button, alpha,
} from "@mui/material";
import {
  Event, ShoppingBag, ExitToApp, Storefront, Spa,
  VideoLibrary, ReceiptLong, Refresh,
} from "@mui/icons-material";

const T = {
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  accent: "#4F46E5",
  danger: "#DC2626",
  shadowHover: "0 12px 28px -6px rgba(0,0,0,0.1)",
};

const ActionCard = ({ title, description, icon, color, onClick }) => (
  <Card
    elevation={0}
    onClick={onClick}
    sx={{
      height: "100%",
      borderRadius: 3,
      border: `1px solid ${T.border}`,
      bgcolor: T.surface,
      cursor: "pointer",
      transition: "all 0.25s ease",
      "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: T.shadowHover,
        borderColor: color,
        "& .action-icon": {
          bgcolor: color,
          color: "#fff",
          transform: "scale(1.08)",
        },
      },
    }}
  >
    <CardContent
      sx={{
        p: { xs: 3, md: 4 },
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: { xs: 180, md: 220 },
        "&:last-child": { pb: { xs: 3, md: 4 } },
      }}
    >
      <Box
        className="action-icon"
        sx={{
          width: { xs: 64, md: 72 },
          height: { xs: 64, md: 72 },
          borderRadius: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(color, 0.12),
          color: color,
          mb: 2.5,
          transition: "all 0.25s ease",
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontWeight: 700,
          color: T.primary,
          fontSize: { xs: "1.1rem", md: "1.25rem" },
          mb: 1,
          letterSpacing: -0.3,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: T.muted,
          fontSize: { xs: "0.85rem", md: "0.9rem" },
          lineHeight: 1.5,
          maxWidth: 180,
        }}
      >
        {description}
      </Typography>
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, isAdmin, navigate]);

  if (authLoading) return null;
  if (!isAdmin) return null;

  const actions = [
    {
      title: "Relooking",
      description: "Inscrits, détails, modification et suppression",
      icon: <Spa sx={{ fontSize: 32 }} />,
      color: "#DB2777",
      path: "/admin/inscriptions-relooking",
    },
    {
      title: "Commandes",
      description: "Liste et détails des commandes",
      icon: <ReceiptLong sx={{ fontSize: 32 }} />,
      color: "#D97706",
      path: "/admin/commandes",
    },
    {
      title: "Produits",
      description: "Gérer le catalogue boutique",
      icon: <Storefront sx={{ fontSize: 32 }} />,
      color: "#7C3AED",
      path: "/admin/produits",
    },
    {
      title: "Événements",
      description: "Créer et gérer les événements",
      icon: <Event sx={{ fontSize: 32 }} />,
      color: "#2563EB",
      path: "/admin/evenements",
    },
    {
      title: "Formation en ligne",
      description: "Formations et inscriptions",
      icon: <VideoLibrary sx={{ fontSize: 32 }} />,
      color: "#059669",
      path: "/admin/formations",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 5 },
      }}
    >
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: { xs: 4, md: 6 },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              color: T.primary,
              fontSize: { xs: "1.35rem", md: "1.5rem" },
              letterSpacing: -0.4,
              mb: 0.4,
            }}
          >
            Bonjour, {user?.first_name || user?.username || "Admin"}
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "0.9rem" }}>
            {currentTime.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh sx={{ fontSize: 18 }} />}
            onClick={() => window.location.reload()}
            sx={{
              borderColor: T.border,
              color: T.primary,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              height: 40,
              px: 2,
              "&:hover": {
                borderColor: T.accent,
                bgcolor: alpha(T.accent, 0.04),
              },
            }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
            onClick={() => {
              logout();
              navigate("/login");
            }}
            sx={{
              bgcolor: T.danger,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 500,
              height: 40,
              px: 2,
              boxShadow: "none",
              "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </Box>

      {/* ─── MODULES (seule section) ────────────────────────── */}
      <Typography
        sx={{
          fontWeight: 600,
          color: T.primary,
          fontSize: "1.1rem",
          mb: 2.5,
          letterSpacing: -0.2,
        }}
      >
        Modules
      </Typography>

      <Grid container spacing={2.5}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={action.title}>
            <ActionCard
              title={action.title}
              description={action.description}
              icon={action.icon}
              color={action.color}
              onClick={() => navigate(action.path)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;