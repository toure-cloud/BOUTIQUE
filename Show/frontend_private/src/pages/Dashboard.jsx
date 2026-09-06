// src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  LinearProgress,
  Avatar,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  alpha,
  Tooltip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from "@mui/material";
import {
  People,
  Event,
  ShoppingBag,
  School,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ArrowForward,
  CheckCircle,
  Pending,
  Cancel,
  Refresh,
  PersonAdd,
  Notifications,
  Settings,
  Assignment,
  Receipt,
  Dashboard as DashboardIcon,
  Analytics,
  Timeline,
  ExitToApp,
  Storefront,
  VideoLibrary,
  BarChart,
  Lightbulb,
  RocketLaunch,
  Star,
  Logout as LogoutIcon,
  Person,
  CalendarToday,
  Visibility,
  QrCode,
} from "@mui/icons-material";

// ═══════════════════════════════════════════════════════════════
// PALETTE PREMIUM
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#0F172A",
  secondary: "#334155",
  accent: "#6366F1",
  accentSoft: "#818CF8",
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  border: "#E2E8F0",
  muted: "#94A3B8",
  gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
  gradient2: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
  gradient3: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)",
  shadow: "0 4px 24px -4px rgba(15, 23, 42, 0.06)",
  shadowHover: "0 20px 40px -12px rgba(99, 102, 241, 0.15)",
};

// ─── Header ──────────────────────────────────────────────────
const DashboardHeader = ({ user, currentTime, onRefresh, loading }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate("/login");
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 3,
        mb: 4,
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "24px",
        background: `linear-gradient(135deg, ${alpha(T.accent, 0.06)} 0%, ${alpha("#A855F7", 0.04)} 100%)`,
        border: `1px solid ${alpha(T.accent, 0.1)}`,
        boxShadow: T.shadow,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            background: T.gradient,
            boxShadow: `0 8px 24px ${alpha(T.accent, 0.35)}`,
            fontWeight: 800,
            fontSize: "1.5rem",
          }}
        >
          {user?.first_name?.[0] || user?.username?.[0] || "A"}
        </Avatar>

        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: T.primary,
              letterSpacing: -0.8,
              lineHeight: 1.15,
              fontSize: { xs: "1.5rem", md: "1.85rem" },
            }}
          >
            Bonjour, {user?.first_name || user?.username || "Administrateur"} 👋
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.8, flexWrap: "wrap" }}>
            <Typography variant="body2" sx={{ color: T.muted, fontWeight: 500 }}>
              {currentTime.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: T.muted, opacity: 0.5 }} />
            <Typography variant="body2" sx={{ color: T.muted, fontWeight: 500 }}>
              {currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </Typography>
            <Chip
              label="Administrateur"
              size="small"
              sx={{
                height: 24,
                fontSize: "0.68rem",
                fontWeight: 700,
                background: T.gradient,
                color: "#fff",
                borderRadius: "8px",
                "& .MuiChip-label": { px: 1.5 },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <Tooltip title="Notifications">
          <IconButton
            sx={{
              color: T.muted,
              bgcolor: alpha(T.accent, 0.06),
              "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.12) },
            }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
        </Tooltip>

        <Tooltip title="Actualiser">
          <Button
            variant="outlined"
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Refresh />}
            onClick={onRefresh}
            disabled={loading}
            sx={{
              borderColor: T.border,
              color: T.primary,
              borderRadius: "14px",
              textTransform: "none",
              fontWeight: 600,
              px: 2.2,
              "&:hover": {
                borderColor: T.accent,
                bgcolor: alpha(T.accent, 0.04),
              },
            }}
          >
            Actualiser
          </Button>
        </Tooltip>

        <Button
          variant="contained"
          startIcon={<ExitToApp />}
          onClick={handleLogout}
          sx={{
            background: `linear-gradient(135deg, ${T.danger} 0%, #F87171 100%)`,
            color: "#fff",
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            boxShadow: `0 4px 16px ${alpha(T.danger, 0.3)}`,
            "&:hover": {
              boxShadow: `0 8px 24px ${alpha(T.danger, 0.4)}`,
              transform: "translateY(-1px)",
            },
            transition: "all 0.25s ease",
          }}
        >
          Déconnexion
        </Button>

        <IconButton onClick={handleMenuOpen}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              background: T.gradient,
              fontWeight: 700,
              fontSize: "1.05rem",
              border: `2px solid ${alpha(T.accent, 0.25)}`,
            }}
          >
            {user?.first_name?.[0] || user?.username?.[0] || "A"}
          </Avatar>
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              borderRadius: "16px",
              mt: 1.5,
              minWidth: 220,
              border: `1px solid ${T.border}`,
              boxShadow: "0 16px 48px rgba(15,23,42,0.1)",
            },
          }}
        >
          <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>
            <ListItemIcon><PersonAdd fontSize="small" sx={{ color: T.accent }} /></ListItemIcon>
            Mon profil
          </MenuItem>
          <MenuItem onClick={() => { handleMenuClose(); navigate("/admin/parametres"); }}>
            <ListItemIcon><Settings fontSize="small" sx={{ color: T.accent }} /></ListItemIcon>
            Paramètres
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: T.danger }}>
            <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: T.danger }} /></ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

// ─── Carte de statistique ──────────────────────────────────
const StatCard = ({ title, value, icon, gradient, trend, trendValue, color }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: "20px",
      overflow: "hidden",
      border: `1px solid ${T.border}`,
      background: T.surface,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: T.shadowHover,
        borderColor: alpha(T.accent, 0.25),
      },
    }}
  >
    <Box sx={{ height: 5, background: gradient || T.gradient }} />
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: T.muted,
              fontWeight: 700,
              letterSpacing: 0.6,
              textTransform: "uppercase",
              fontSize: "0.68rem",
            }}
          >
            {title}
          </Typography>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              color: T.primary,
              mt: 1,
              letterSpacing: -0.8,
              lineHeight: 1.1,
            }}
          >
            {value}
          </Typography>

          {trend !== undefined && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6, mt: 1.4 }}>
              {trend > 0 ? (
                <TrendingUp sx={{ fontSize: 16, color: T.success }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: T.danger }} />
              )}
              <Typography
                variant="caption"
                sx={{ color: trend > 0 ? T.success : T.danger, fontWeight: 700 }}
              >
                {trend > 0 ? "+" : ""}
                {trendValue}%
              </Typography>
              <Typography variant="caption" sx={{ color: T.muted }}>
                vs mois dernier
              </Typography>
            </Box>
          )}
        </Box>

        <Box
          sx={{
            width: 54,
            height: 54,
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: alpha(color || T.accent, 0.12),
          }}
        >
          <Box sx={{ color: color || T.accent }}>{icon}</Box>
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Item d'activité ──────────────────────────────────
const ActivityItem = ({ activity }) => {
  const getIcon = (action) => {
    switch (action) {
      case "CREATE": return <CheckCircle sx={{ color: T.success, fontSize: 20 }} />;
      case "UPDATE": return <Pending sx={{ color: T.warning, fontSize: 20 }} />;
      case "DELETE": return <Cancel sx={{ color: T.danger, fontSize: 20 }} />;
      case "LOGIN": return <CheckCircle sx={{ color: T.accent, fontSize: 20 }} />;
      default: return <CheckCircle sx={{ color: T.success, fontSize: 20 }} />;
    }
  };

  const getActionLabel = (action) => {
    const labels = {
      CREATE: "a créé",
      UPDATE: "a modifié",
      DELETE: "a supprimé",
      LOGIN: "s'est connecté",
    };
    return labels[action] || action;
  };

  const getBadgeColor = (action) => {
    switch (action) {
      case "CREATE": return T.success;
      case "UPDATE": return T.warning;
      case "DELETE": return T.danger;
      case "LOGIN": return T.accent;
      default: return T.muted;
    }
  };

  return (
    <ListItem
      sx={{
        px: 1.5,
        py: 1.5,
        borderRadius: "14px",
        transition: "all 0.2s",
        "&:hover": { bgcolor: alpha(T.accent, 0.04) },
      }}
    >
      <ListItemIcon sx={{ minWidth: 42 }}>{getIcon(activity.action)}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ fontWeight: 500, color: T.primary }}>
            <strong>{activity.admin_username || "Admin"}</strong>{" "}
            {getActionLabel(activity.action)}
            <span style={{ color: T.muted, fontWeight: 400 }}> {activity.model_name}</span>
          </Typography>
        }
        secondary={
          <Typography variant="caption" sx={{ color: T.muted }}>
            {activity.created_at
              ? new Date(activity.created_at).toLocaleString("fr-FR", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })
              : "Récemment"}
          </Typography>
        }
      />
      <Chip
        label={activity.action}
        size="small"
        sx={{
          fontSize: "0.62rem",
          height: 22,
          fontWeight: 700,
          borderRadius: "8px",
          backgroundColor: alpha(getBadgeColor(activity.action), 0.12),
          color: getBadgeColor(activity.action),
        }}
      />
    </ListItem>
  );
};

// ─── Skeleton ───────────────────────────────────────────────
const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="rounded" height={120} sx={{ borderRadius: "24px", mb: 4 }} />
    <Grid container spacing={2.5} sx={{ mb: 4 }}>
      {[...Array(8)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
          <Skeleton variant="rounded" height={140} sx={{ borderRadius: "20px" }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}><Skeleton variant="rounded" height={480} sx={{ borderRadius: "20px" }} /></Grid>
      <Grid item xs={12} md={4}><Skeleton variant="rounded" height={480} sx={{ borderRadius: "20px" }} /></Grid>
      <Grid item xs={12} md={5}><Skeleton variant="rounded" height={480} sx={{ borderRadius: "20px" }} /></Grid>
    </Grid>
  </Box>
);

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [evenementStats, setEvenementStats] = useState({
    total_participations: 0,
    evenement_recent: { id: null, titre: "Aucun événement", clients: [], total_inscrits: 0 },
  });
  const [formationStats, setFormationStats] = useState({
    total_inscriptions: 0,
    en_attente: 0,
    payees: 0,
    inscriptions_recents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [pageParticipants, setPageParticipants] = useState(0);
  const [rowsPerPageParticipants, setRowsPerPageParticipants] = useState(5);
  const [pageInscriptions, setPageInscriptions] = useState(0);
  const [rowsPerPageInscriptions, setRowsPerPageInscriptions] = useState(5);

  const [selectedInscription, setSelectedInscription] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentActivities(data.recent_activities || []);
      setEvenementStats(data.evenement_stats || {
        total_participations: 0,
        evenement_recent: { id: null, titre: "Aucun événement", clients: [], total_inscrits: 0 },
      });
      setFormationStats(data.formation_stats || {
        total_inscriptions: 0,
        en_attente: 0,
        payees: 0,
        inscriptions_recents: [],
      });
    } catch (err) {
      console.error("Erreur dashboard:", err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError("Impossible de charger les statistiques. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (inscription, type) => {
    setSelectedInscription(inscription);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    setProcessing(true);
    try {
      const inscription = selectedInscription;
      if (actionType === "valider") {
        await adminService.updateInscription(inscription.id, { statut: "PAYEE" });
        setSnackbar({ open: true, message: `Participation validée pour ${inscription.client.prenom} ${inscription.client.nom}`, severity: "success" });
      } else if (actionType === "generer_code") {
        const code = "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await adminService.genererCodeAcces(inscription.id, { code });
        setSnackbar({ open: true, message: `Code d'accès généré : ${code}`, severity: "success" });
      } else if (actionType === "refuser") {
        await adminService.updateInscription(inscription.id, { statut: "ANNULEE" });
        setSnackbar({ open: true, message: `Participation refusée pour ${inscription.client.prenom} ${inscription.client.nom}`, severity: "warning" });
      }
      setActionDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Erreur:", err);
      setSnackbar({ open: true, message: "Erreur lors de l'action", severity: "error" });
    } finally {
      setProcessing(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Box sx={{ width: "100%", py: 2 }}>
        <DashboardSkeleton />
      </Box>
    );
  }

  if (!isAdmin) return null;

  if (error) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <Alert severity="error" sx={{ borderRadius: "16px", mb: 3, display: "inline-flex", maxWidth: 480 }}>
          {error}
        </Alert>
        <br />
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDashboardData}
          sx={{
            mt: 1,
            background: T.gradient,
            borderRadius: "14px",
            textTransform: "none",
            fontWeight: 600,
            px: 4,
            boxShadow: `0 4px 16px ${alpha(T.accent, 0.3)}`,
          }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  const mainStats = [
    { title: "Utilisateurs", value: stats?.users || 0, icon: <People sx={{ fontSize: 26 }} />, gradient: T.gradient, color: T.accent, trend: 12, trendValue: 12 },
    { title: "Clients", value: stats?.clients || 0, icon: <PersonAdd sx={{ fontSize: 26 }} />, gradient: "linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)", color: "#8B5CF6", trend: 8, trendValue: 8 },
    { title: "Événements", value: stats?.events || 0, icon: <Event sx={{ fontSize: 26 }} />, gradient: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)", color: "#EC4899", trend: 5, trendValue: 5 },
    { title: "Produits", value: stats?.products || 0, icon: <ShoppingBag sx={{ fontSize: 26 }} />, gradient: "linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%)", color: "#F59E0B", trend: -3, trendValue: 3 },
    { title: "Formations", value: stats?.formations || 0, icon: <School sx={{ fontSize: 26 }} />, gradient: T.gradient2, color: T.success, trend: 15, trendValue: 15 },
    { title: "Inscriptions", value: stats?.inscriptions || 0, icon: <Assignment sx={{ fontSize: 26 }} />, gradient: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)", color: "#06B6D4", trend: 22, trendValue: 22 },
    { title: "En attente", value: stats?.pending_payments || 0, icon: <Pending sx={{ fontSize: 26 }} />, gradient: T.gradient3, color: T.warning, trend: -8, trendValue: 8 },
    { title: "Revenus", value: `${(stats?.revenue || 0).toLocaleString("fr-FR")} CFA`, icon: <AttachMoney sx={{ fontSize: 26 }} />, gradient: T.gradient2, color: T.success, trend: 18, trendValue: 18 },
  ];

  const actions = [
    { title: "Ajouter un produit", icon: <Storefront sx={{ fontSize: 22 }} />, path: "/admin/produits/nouveau", color: "#F59E0B" },
    { title: "Créer un événement", icon: <Event sx={{ fontSize: 22 }} />, path: "/admin/evenements/nouveau", color: "#EC4899" },
    { title: "Ajouter une formation", icon: <VideoLibrary sx={{ fontSize: 22 }} />, path: "/admin/formations/nouveau", color: "#10B981" },
    { title: "Voir les événements", icon: <CalendarToday sx={{ fontSize: 22 }} />, path: "/admin/evenements", color: "#3B82F6" },
    { title: "Voir les paiements", icon: <Receipt sx={{ fontSize: 22 }} />, path: "/admin/paiements", color: "#EF4444" },
  ];

  const clients = evenementStats.evenement_recent.clients || [];
  const evenementId = evenementStats.evenement_recent.id;
  const paginatedClients = clients.slice(pageParticipants * rowsPerPageParticipants, pageParticipants * rowsPerPageParticipants + rowsPerPageParticipants);

  const inscriptions = formationStats.inscriptions_recents || [];
  const paginatedInscriptions = inscriptions.slice(pageInscriptions * rowsPerPageInscriptions, pageInscriptions * rowsPerPageInscriptions + rowsPerPageInscriptions);

  return (
    <Box sx={{ width: "100%" }}>
      <DashboardHeader user={user} currentTime={currentTime} onRefresh={fetchDashboardData} loading={loading} />

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {mainStats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Section principale */}
      <Grid container spacing={3}>
        {/* Actions rapides */}
        <Grid item xs={12} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: "20px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: T.primary, mb: 3, display: "flex", alignItems: "center", gap: 1.2 }}>
              <DashboardIcon sx={{ fontSize: 22, color: T.accent }} />
              Actions rapides
            </Typography>

            <Grid container spacing={1.5}>
              {actions.map((action, index) => (
                <Grid item xs={6} key={index}>
                  <Button
                    fullWidth
                    onClick={() => navigate(action.path)}
                    sx={{
                      background: action.color,
                      color: "#fff",
                      borderRadius: "16px",
                      py: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                      flexDirection: "column",
                      gap: 0.7,
                      boxShadow: `0 4px 16px ${alpha(action.color, 0.3)}`,
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: `0 10px 28px ${alpha(action.color, 0.4)}`,
                      },
                      transition: "all 0.25s ease",
                    }}
                  >
                    {action.icon}
                    {action.title}
                  </Button>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ my: 3.5, borderColor: T.border }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: T.primary, mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}>
              <Timeline sx={{ fontSize: 20, color: T.accent }} />
              Performance du mois
            </Typography>

            {[
              { label: "Objectif de vente", value: 65, icon: <AttachMoney sx={{ fontSize: 15 }} /> },
              { label: "Inscriptions", value: 45, icon: <School sx={{ fontSize: 15 }} /> },
              { label: "Engagement", value: 78, icon: <Star sx={{ fontSize: 15 }} /> },
            ].map((item) => (
              <Box key={item.label} sx={{ mb: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.9 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ color: T.muted }}>{item.icon}</Box>
                    <Typography variant="body2" sx={{ color: T.muted, fontSize: "0.85rem" }}>{item.label}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: T.primary }}>{item.value}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={item.value}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(T.accent, 0.08),
                    "& .MuiLinearProgress-bar": { background: T.gradient, borderRadius: 4 },
                  }}
                />
              </Box>
            ))}

            <Button
              fullWidth
              endIcon={<ArrowForward />}
              onClick={() => navigate("/admin/analytics")}
              sx={{ mt: 1, color: T.accent, textTransform: "none", fontWeight: 600, borderRadius: "12px", "&:hover": { bgcolor: alpha(T.accent, 0.06) } }}
            >
              Voir les analyses
            </Button>
          </Paper>
        </Grid>

        {/* Activités récentes */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: "20px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: T.primary, display: "flex", alignItems: "center", gap: 1.2 }}>
                <Analytics sx={{ fontSize: 22, color: T.accent }} />
                Activités récentes
              </Typography>
              <Button endIcon={<ArrowForward />} onClick={() => navigate("/admin/logs")} sx={{ color: T.muted, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.05) } }}>
                Voir tout
              </Button>
            </Box>

            {recentActivities.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 8 }}>
                <Typography variant="body2" sx={{ color: T.muted }}>Aucune activité récente</Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <React.Fragment key={activity.id || index}>
                    <ActivityItem activity={activity} />
                    {index < Math.min(recentActivities.length, 5) - 1 && <Divider sx={{ borderColor: T.border, mx: 1 }} />}
                  </React.Fragment>
                ))}
              </List>
            )}

            {recentActivities.length > 0 && (
              <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 2 }}>
                {[
                  { label: "Aujourd'hui", value: recentActivities.filter(a => new Date(a.created_at).toDateString() === new Date().toDateString()).length, icon: <Lightbulb sx={{ fontSize: 18 }} /> },
                  { label: "Cette semaine", value: recentActivities.length, icon: <BarChart sx={{ fontSize: 18 }} /> },
                  { label: "Moyenne / jour", value: Math.round(recentActivities.length / 7) || 0, icon: <RocketLaunch sx={{ fontSize: 18 }} /> },
                ].map((item) => (
                  <Box key={item.label} sx={{ textAlign: "center", minWidth: 90 }}>
                    <Box sx={{ color: T.muted, mb: 0.5 }}>{item.icon}</Box>
                    <Typography variant="caption" sx={{ color: T.muted, display: "block" }}>{item.label}</Typography>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: T.primary, mt: 0.3 }}>{item.value}</Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Inscriptions formations */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: "100%",
              borderRadius: "20px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: T.primary, display: "flex", alignItems: "center", gap: 1.2 }}>
                <School sx={{ fontSize: 22, color: T.accent }} />
                Inscriptions formations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip label={`${formationStats.en_attente || 0} en attente`} size="small" sx={{ bgcolor: alpha(T.warning, 0.15), color: T.warning, fontWeight: 700, borderRadius: "8px" }} />
                <Button endIcon={<ArrowForward />} onClick={() => navigate("/admin/formations")} sx={{ color: T.muted, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.05) } }}>
                  Voir tout
                </Button>
              </Box>
            </Box>

            {inscriptions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 7 }}>
                <School sx={{ fontSize: 52, color: "#CBD5E1", mb: 2 }} />
                <Typography variant="body2" sx={{ color: T.muted, fontWeight: 500 }}>Aucune inscription en attente</Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }}>Client / Formation</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }} align="center">Statut</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedInscriptions.map((inscription) => (
                        <TableRow key={inscription.id} hover sx={{ "&:hover": { bgcolor: alpha(T.accent, 0.03) } }}>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar sx={{ width: 32, height: 32, bgcolor: alpha(T.accent, 0.12), color: T.accent, fontSize: "0.7rem", fontWeight: 700 }}>
                                  {inscription.client.prenom?.[0]}{inscription.client.nom?.[0]}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary, fontSize: "0.82rem" }}>
                                    {inscription.client.prenom} {inscription.client.nom}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.65rem" }}>{inscription.client.email}</Typography>
                                </Box>
                              </Box>
                              <Box sx={{ pl: 5.5 }}>
                                <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.68rem" }}>📚 {inscription.formation.titre}</Typography>
                                <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.65rem", display: "block" }}>💰 {inscription.montant} CFA</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Chip
                              label={inscription.statut === "EN_ATTENTE" ? "En attente" : inscription.statut}
                              size="small"
                              sx={{
                                bgcolor: inscription.statut === "EN_ATTENTE" ? alpha(T.warning, 0.12) : alpha(T.success, 0.12),
                                color: inscription.statut === "EN_ATTENTE" ? T.warning : T.success,
                                fontWeight: 700,
                                fontSize: "0.62rem",
                                borderRadius: "8px",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Stack direction="row" spacing={0.5} justifyContent="center">
                              {inscription.statut === "EN_ATTENTE" && (
                                <>
                                  <Tooltip title="Valider">
                                    <IconButton size="small" onClick={() => handleAction(inscription, "valider")} sx={{ color: T.success }}>
                                      <CheckCircle fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Refuser">
                                    <IconButton size="small" onClick={() => handleAction(inscription, "refuser")} sx={{ color: T.danger }}>
                                      <Cancel fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {inscription.statut === "PAYEE" && !inscription.code_acces && (
                                <Tooltip title="Générer le code">
                                  <IconButton size="small" onClick={() => handleAction(inscription, "generer_code")} sx={{ color: T.accent }}>
                                    <QrCode fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                              {inscription.code_acces && (
                                <Chip label="Code OK" size="small" sx={{ bgcolor: alpha(T.success, 0.12), color: T.success, fontWeight: 700, fontSize: "0.55rem", borderRadius: "8px" }} />
                              )}
                              <Tooltip title="Voir le client">
                                <IconButton size="small" onClick={() => navigate(`/admin/clients/${inscription.client.id}`)} sx={{ color: T.muted }}>
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {inscriptions.length > rowsPerPageInscriptions && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={inscriptions.length}
                    rowsPerPage={rowsPerPageInscriptions}
                    page={pageInscriptions}
                    onPageChange={(e, p) => setPageInscriptions(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPageInscriptions(parseInt(e.target.value, 10)); setPageInscriptions(0); }}
                    labelRowsPerPage="Lignes"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                    sx={{ "& .MuiTablePagination-select, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem" } }}
                  />
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Participants événement */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3.5,
              borderRadius: "20px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: T.primary, display: "flex", alignItems: "center", gap: 1.2 }}>
                <Event sx={{ fontSize: 22, color: T.accent }} />
                Participants à l'événement
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => evenementId ? navigate(`/admin/evenements/${evenementId}/participants`) : navigate("/admin/evenements")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 600, borderRadius: "10px", "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.05) } }}
              >
                Voir tout
              </Button>
            </Box>

            <Box sx={{ mb: 3, p: 2, borderRadius: "14px", bgcolor: alpha(T.accent, 0.05), border: `1px solid ${alpha(T.accent, 0.1)}` }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary }}>
                  📌 {evenementStats.evenement_recent.titre || "Aucun événement avec participants"}
                </Typography>
                <Chip
                  label={`${evenementStats.evenement_recent.total_inscrits || 0} inscrits`}
                  size="small"
                  sx={{ bgcolor: T.success, color: "#fff", fontWeight: 700, borderRadius: "8px" }}
                />
              </Box>
            </Box>

            {clients.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 7 }}>
                <Person sx={{ fontSize: 52, color: "#CBD5E1", mb: 2 }} />
                <Typography variant="body2" sx={{ color: T.muted, fontWeight: 500 }}>Aucune inscription pour cet événement</Typography>
                <Typography variant="caption" sx={{ color: T.muted, display: "block", mt: 0.8 }}>
                  Les clients s'inscrivent via le site public
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }}>Contact</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }} align="center">Statut</TableCell>
                        <TableCell sx={{ fontWeight: 700, color: T.primary, fontSize: "0.72rem", borderBottom: `1px solid ${T.border}` }} align="center">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedClients.map((client) => (
                        <TableRow key={client.id} hover sx={{ "&:hover": { bgcolor: alpha(T.accent, 0.03) } }}>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar sx={{ width: 34, height: 34, bgcolor: alpha(T.accent, 0.12), color: T.accent, fontSize: "0.75rem", fontWeight: 700 }}>
                                {client.prenom?.[0]}{client.nom?.[0]}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary, fontSize: "0.85rem" }}>
                                  {client.prenom} {client.nom}
                                </Typography>
                                <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.68rem" }}>
                                  Inscrit le {new Date(client.date_inscription).toLocaleDateString("fr-FR")}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.7rem", display: "block" }}>{client.email}</Typography>
                            <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.7rem" }}>{client.telephone}</Typography>
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Chip
                              label={client.statut_inscription === "INSCRIT" ? "Inscrit" : client.statut_inscription}
                              size="small"
                              sx={{
                                bgcolor: client.statut_inscription === "INSCRIT" ? alpha(T.success, 0.12) : alpha(T.warning, 0.12),
                                color: client.statut_inscription === "INSCRIT" ? T.success : T.warning,
                                fontWeight: 700,
                                fontSize: "0.62rem",
                                borderRadius: "8px",
                              }}
                            />
                          </TableCell>
                          <TableCell align="center" sx={{ borderBottom: `1px solid ${alpha(T.border, 0.7)}` }}>
                            <Tooltip title="Voir le client">
                              <IconButton size="small" onClick={() => navigate(`/admin/clients/${client.id}`)} sx={{ color: T.muted, "&:hover": { color: T.accent } }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {clients.length > rowsPerPageParticipants && (
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={clients.length}
                    rowsPerPage={rowsPerPageParticipants}
                    page={pageParticipants}
                    onPageChange={(e, p) => setPageParticipants(p)}
                    onRowsPerPageChange={(e) => { setRowsPerPageParticipants(parseInt(e.target.value, 10)); setPageParticipants(0); }}
                    labelRowsPerPage="Lignes"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                    sx={{ "& .MuiTablePagination-select, & .MuiTablePagination-displayedRows": { fontSize: "0.8rem" } }}
                  />
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Dialog de confirmation */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} PaperProps={{ sx: { borderRadius: "20px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: T.primary }}>
          {actionType === "valider" && "Valider la participation"}
          {actionType === "refuser" && "Refuser la participation"}
          {actionType === "generer_code" && "Générer le code d'accès"}
        </DialogTitle>
        <DialogContent>
          {selectedInscription && (
            <DialogContentText sx={{ color: T.muted }}>
              {actionType === "valider" && (
                <>Êtes-vous sûr de vouloir valider la participation de <strong>{selectedInscription.client.prenom} {selectedInscription.client.nom}</strong> à la formation <strong>"{selectedInscription.formation.titre}"</strong> ?</>
              )}
              {actionType === "refuser" && (
                <>Êtes-vous sûr de vouloir refuser la participation de <strong>{selectedInscription.client.prenom} {selectedInscription.client.nom}</strong> à la formation <strong>"{selectedInscription.formation.titre}"</strong> ?</>
              )}
              {actionType === "generer_code" && (
                <>Un code d'accès va être généré pour <strong>{selectedInscription.client.prenom} {selectedInscription.client.nom}</strong> pour la formation <strong>"{selectedInscription.formation.titre}"</strong>.<br />Le code sera envoyé par email au client.</>
              )}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button onClick={() => setActionDialogOpen(false)} variant="outlined" sx={{ borderRadius: "12px", textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            onClick={handleActionConfirm}
            variant="contained"
            disabled={processing}
            sx={{
              bgcolor: actionType === "refuser" ? T.danger : T.success,
              borderRadius: "12px",
              textTransform: "none",
              fontWeight: 600,
              "&:hover": { bgcolor: actionType === "refuser" ? "#DC2626" : "#059669" },
            }}
          >
            {processing ? <CircularProgress size={20} sx={{ color: "#fff" }} /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: "14px", width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;