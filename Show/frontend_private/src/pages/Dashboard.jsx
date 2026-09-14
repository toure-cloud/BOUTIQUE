// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import {
  Grid, Typography, Box, Card, CardContent, Button, alpha,
  Avatar, Chip, CircularProgress, Skeleton, Stack, Divider,
  Tooltip, IconButton,
} from "@mui/material";
import {
  Event, ShoppingBag, ExitToApp, Storefront, Spa,
  VideoLibrary, ReceiptLong, Refresh, Visibility,
  PersonAdd, ArrowForward, CheckCircle, Pending, Cancel,
  CalendarToday, Email, Phone,
} from "@mui/icons-material";

const T = {
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  accent: "#4F46E5",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#DC2626",
  shadowHover: "0 12px 28px -6px rgba(0,0,0,0.1)",
};

// ─── CARTE DE MODULE ────────────────────────────────────────
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
      <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: { xs: "1.1rem", md: "1.25rem" }, mb: 1, letterSpacing: -0.3 }}>
        {title}
      </Typography>
      <Typography sx={{ color: T.muted, fontSize: { xs: "0.85rem", md: "0.9rem" }, lineHeight: 1.5, maxWidth: 180 }}>
        {description}
      </Typography>
    </CardContent>
  </Card>
);

// ─── STATUT CHIP ────────────────────────────────────────────
const getStatutConfig = (statut) => {
  const configs = {
    EN_ATTENTE: { label: "⏳ En attente", color: T.warning, bgcolor: alpha(T.warning, 0.12) },
    PAYEE: { label: "💳 Payée", color: T.success, bgcolor: alpha(T.success, 0.12) },
    INSCRIT: { label: "✅ Inscrit", color: T.success, bgcolor: alpha(T.success, 0.12) },
    PRESENT: { label: "✅ Présent", color: T.success, bgcolor: alpha(T.success, 0.12) },
    ABSENT: { label: "❌ Absent", color: T.danger, bgcolor: alpha(T.danger, 0.12) },
    ANNULEE: { label: "❌ Annulée", color: T.danger, bgcolor: alpha(T.danger, 0.12) },
    REMBOURSEE: { label: "🔄 Remboursée", color: T.accent, bgcolor: alpha(T.accent, 0.12) },
  };
  return configs[statut] || { label: statut, color: T.muted, bgcolor: alpha(T.muted, 0.12) };
};

// ─── SECTION INSCRIPTIONS ───────────────────────────────────
const InscriptionsSection = ({
  title,
  icon,
  iconColor,
  loading,
  data,
  onViewAll,
  onViewItem,
  type, // 'evenement' ou 'formation'
}) => (
  <Box sx={{ mb: 4 }}>
    {/* En-tête de section */}
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: alpha(iconColor, 0.12), color: iconColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {icon}
        </Box>
        <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.05rem" }}>
          {title}
        </Typography>
        {!loading && (
          <Chip label={data.length} size="small" sx={{ bgcolor: T.primary, color: "#fff", fontWeight: 600, height: 22, fontSize: "0.7rem" }} />
        )}
      </Box>
      <Button
        size="small"
        endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
        onClick={onViewAll}
        sx={{ textTransform: "none", color: T.accent, fontWeight: 600, fontSize: "0.85rem" }}
      >
        Voir tout
      </Button>
    </Box>

    {/* Liste */}
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${T.border}`,
        bgcolor: T.surface,
        overflow: "hidden",
      }}
    >
      {loading ? (
        <Box sx={{ p: 3 }}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 1, borderRadius: 2 }} />
          ))}
        </Box>
      ) : data.length === 0 ? (
        <Box sx={{ p: 5, textAlign: "center" }}>
          <PersonAdd sx={{ fontSize: 40, color: "#CBD5E1", mb: 1.5 }} />
          <Typography sx={{ color: T.muted, fontSize: "0.9rem" }}>
            Aucune inscription pour le moment
          </Typography>
        </Box>
      ) : (
        <Stack divider={<Divider sx={{ borderColor: T.border }} />}>
          {data.map((item, index) => {
            const client = item.client_details || {};
            const secondaire = type === "evenement" ? item.evenement_details : item.formation_details;
            const config = getStatutConfig(item.statut);

            return (
              <Box
                key={item.id || index}
                sx={{
                  p: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  transition: "background-color 0.2s",
                  "&:hover": { bgcolor: alpha(T.accent, 0.03) },
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: 42,
                    height: 42,
                    bgcolor: alpha(iconColor, 0.12),
                    color: iconColor,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    flexShrink: 0,
                  }}
                >
                  {client.prenom?.[0]}{client.nom?.[0]}
                </Avatar>

                {/* Infos principales */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem", mb: 0.3 }}>
                    {client.prenom || "Prénom"} {client.nom || "Nom"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ color: T.muted, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Email sx={{ fontSize: 12 }} /> {client.email || "Email"}
                    </Typography>
                    <Typography sx={{ color: T.muted, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.4 }}>
                      <Phone sx={{ fontSize: 12 }} /> {client.telephone || "Téléphone"}
                    </Typography>
                  </Box>
                  <Typography sx={{ color: T.secondary, fontSize: "0.8rem", mt: 0.5, fontStyle: "italic" }}>
                    {type === "evenement" ? "📅" : "🎓"}{" "}
                    {type === "evenement"
                      ? secondaire?.titre || "Événement inconnu"
                      : secondaire?.titre || "Formation inconnue"}
                  </Typography>
                </Box>

                {/* Statut + Date */}
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flexShrink: 0 }}>
                  <Chip
                    label={config.label}
                    size="small"
                    sx={{
                      bgcolor: config.bgcolor,
                      color: config.color,
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      height: 24,
                    }}
                  />
                  <Typography sx={{ color: T.muted, fontSize: "0.7rem", display: "flex", alignItems: "center", gap: 0.3 }}>
                    <CalendarToday sx={{ fontSize: 11 }} />
                    {new Date(item.date_inscription).toLocaleDateString("fr-FR")}
                  </Typography>
                </Box>

                {/* Action */}
                <Tooltip title="Voir les détails">
                  <IconButton
                    size="small"
                    onClick={() => onViewItem(item)}
                    sx={{ color: T.muted, "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.08) } }}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            );
          })}
        </Stack>
      )}
    </Card>
  </Box>
);

// ─── DASHBOARD ──────────────────────────────────────────────
const Dashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // États pour les inscriptions
  const [inscriptionsEvenements, setInscriptionsEvenements] = useState([]);
  const [inscriptionsFormations, setInscriptionsFormations] = useState([]);
  const [loadingEvenements, setLoadingEvenements] = useState(true);
  const [loadingFormations, setLoadingFormations] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchInscriptions();
    }
  }, [isAdmin]);

  const fetchInscriptions = async () => {
    // Inscriptions événements
    setLoadingEvenements(true);
    try {
      const data = await adminService.getParticipantsEvenements({ page: 1, page_size: 5 });
      setInscriptionsEvenements(data.results || data || []);
    } catch (err) {
      console.error("❌ Erreur inscriptions événements:", err);
    } finally {
      setLoadingEvenements(false);
    }

    // Inscriptions formations
    setLoadingFormations(true);
    try {
      const data = await adminService.getInscriptionsFormations({ page: 1, page_size: 5 });
      setInscriptionsFormations(data.results || data || []);
    } catch (err) {
      console.error("❌ Erreur inscriptions formations:", err);
    } finally {
      setLoadingFormations(false);
    }
  };

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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: { xs: 4, md: 6 } }}>
        <Box>
          <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: { xs: "1.35rem", md: "1.5rem" }, letterSpacing: -0.4, mb: 0.4 }}>
            Bonjour, {user?.first_name || user?.username || "Admin"}
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "0.9rem" }}>
            {currentTime.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh sx={{ fontSize: 18 }} />}
            onClick={fetchInscriptions}
            sx={{ borderColor: T.border, color: T.primary, borderRadius: 2, textTransform: "none", fontWeight: 500, height: 40, px: 2, "&:hover": { borderColor: T.accent, bgcolor: alpha(T.accent, 0.04) } }}
          >
            Actualiser
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
            onClick={() => { logout(); navigate("/login"); }}
            sx={{ bgcolor: T.danger, borderRadius: 2, textTransform: "none", fontWeight: 500, height: 40, px: 2, boxShadow: "none", "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" } }}
          >
            Déconnexion
          </Button>
        </Box>
      </Box>

      {/* ─── MODULES ────────────────────────────────────────── */}
      <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "1.1rem", mb: 2.5, letterSpacing: -0.2 }}>
        Modules
      </Typography>

      <Grid container spacing={2.5} sx={{ mb: 6 }}>
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

      {/* ─── INSCRIPTIONS RÉCENTES ──────────────────────────── */}
      <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "1.1rem", mb: 2.5, letterSpacing: -0.2 }}>
        Inscriptions récentes
      </Typography>

      <Grid container spacing={3}>
        {/* Événements */}
        <Grid item xs={12} lg={6}>
          <InscriptionsSection
            title="Inscriptions événements"
            icon={<Event sx={{ fontSize: 20 }} />}
            iconColor="#2563EB"
            loading={loadingEvenements}
            data={inscriptionsEvenements}
            type="evenement"
            onViewAll={() => navigate("/admin/participants-evenements")}
            onViewItem={(item) => navigate(`/admin/participants-evenements`)}
          />
        </Grid>

        {/* Formations */}
        <Grid item xs={12} lg={6}>
          <InscriptionsSection
            title="Inscriptions formations"
            icon={<VideoLibrary sx={{ fontSize: 20 }} />}
            iconColor="#059669"
            loading={loadingFormations}
            data={inscriptionsFormations}
            type="formation"
            onViewAll={() => navigate("/admin/inscriptions-formations")}
            onViewItem={(item) => navigate(`/admin/inscriptions-formations`)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;