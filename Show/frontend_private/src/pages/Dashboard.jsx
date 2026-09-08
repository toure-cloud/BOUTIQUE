// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Fade,
  Grow,
  Zoom,
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
  MoreVert,
  Email,
  Phone,
  ShoppingCart,
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
  gradient4: "linear-gradient(135deg, #EC4899 0%, #F472B6 100%)",
  gradient5: "linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)",
  gradient6: "linear-gradient(135deg, #F43F5E 0%, #FB7185 100%)",
  shadow: "0 4px 24px -4px rgba(15, 23, 42, 0.06)",
  shadowHover: "0 20px 40px -12px rgba(99, 102, 241, 0.15)",
};

// ═══════════════════════════════════════════════════════════════
// COMPOSANTS RÉUTILISABLES
// ═══════════════════════════════════════════════════════════════

// ─── Widget de statistique GRAND ────────────────────────────
const StatWidget = ({
  title,
  value,
  icon,
  gradient,
  trend,
  trendValue,
  color,
  delay,
}) => (
  <Grow in timeout={300 + (delay || 0)}>
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
          transform: "translateY(-6px)",
          boxShadow: T.shadowHover,
          borderColor: alpha(T.accent, 0.25),
          "& .stat-icon": {
            transform: "scale(1.15) rotate(-5deg)",
          },
        },
      }}
    >
      <Box sx={{ height: 4, background: gradient || T.gradient }} />
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: T.muted,
                fontWeight: 600,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                fontSize: "0.75rem",
                display: "block",
                mb: 0.5,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: T.primary,
                letterSpacing: -0.8,
                lineHeight: 1.1,
                fontSize: "2rem",
              }}
            >
              {value}
            </Typography>

            {trend !== undefined && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}
              >
                {trend > 0 ? (
                  <TrendingUp sx={{ fontSize: 16, color: T.success }} />
                ) : (
                  <TrendingDown sx={{ fontSize: 16, color: T.danger }} />
                )}
                <Typography
                  variant="body2"
                  sx={{
                    color: trend > 0 ? T.success : T.danger,
                    fontWeight: 700,
                  }}
                >
                  {trend > 0 ? "+" : ""}
                  {trendValue}%
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: T.muted, fontSize: "0.7rem" }}
                >
                  vs mois dernier
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            className="stat-icon"
            sx={{
              width: 56,
              height: 56,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: alpha(color || T.accent, 0.12),
              transition: "all 0.3s ease",
            }}
          >
            <Box sx={{ color: color || T.accent, fontSize: 28 }}>{icon}</Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Grow>
);

// ─── Widget d'activité ──────────────────────────────────
const ActivityItem = ({ activity, index }) => {
  const getIcon = (action) => {
    switch (action) {
      case "CREATE":
        return <CheckCircle sx={{ color: T.success, fontSize: 20 }} />;
      case "UPDATE":
        return <Pending sx={{ color: T.warning, fontSize: 20 }} />;
      case "DELETE":
        return <Cancel sx={{ color: T.danger, fontSize: 20 }} />;
      case "LOGIN":
        return <CheckCircle sx={{ color: T.accent, fontSize: 20 }} />;
      default:
        return <CheckCircle sx={{ color: T.success, fontSize: 20 }} />;
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
      case "CREATE":
        return T.success;
      case "UPDATE":
        return T.warning;
      case "DELETE":
        return T.danger;
      case "LOGIN":
        return T.accent;
      default:
        return T.muted;
    }
  };

  return (
    <ListItem
      sx={{
        px: 1.5,
        py: 1.5,
        borderRadius: "12px",
        transition: "all 0.2s",
        "&:hover": { bgcolor: alpha(T.accent, 0.04) },
      }}
    >
      <ListItemIcon sx={{ minWidth: 40 }}>
        {getIcon(activity.action)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: T.primary }}
          >
            <strong>{activity.admin_username || "Admin"}</strong>{" "}
            {getActionLabel(activity.action)}
            <span style={{ color: T.muted, fontWeight: 400 }}>
              {" "}
              {activity.model_name}
            </span>
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
          fontSize: "0.6rem",
          height: 24,
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
    <Skeleton
      variant="rounded"
      height={100}
      sx={{ borderRadius: "20px", mb: 3 }}
    />
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Grid item xs={12} sm={6} md={2.4} key={i}>
          <Skeleton
            variant="rounded"
            height={140}
            sx={{ borderRadius: "16px" }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[...Array(3)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton
            variant="rounded"
            height={140}
            sx={{ borderRadius: "16px" }}
          />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Skeleton
          variant="rounded"
          height={350}
          sx={{ borderRadius: "14px" }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton
          variant="rounded"
          height={350}
          sx={{ borderRadius: "14px" }}
        />
      </Grid>
      <Grid item xs={12} md={4}>
        <Skeleton
          variant="rounded"
          height={350}
          sx={{ borderRadius: "14px" }}
        />
      </Grid>
    </Grid>
  </Box>
);

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // ─── États ──────────────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [evenementStats, setEvenementStats] = useState({
    total_participations: 0,
    evenement_recent: {
      id: null,
      titre: "Aucun événement",
      clients: [],
      total_inscrits: 0,
    },
  });
  const [formationStats, setFormationStats] = useState({
    total_inscriptions: 0,
    en_attente: 0,
    payees: 0,
    inscriptions_recents: [],
  });
  const [commandesStats, setCommandesStats] = useState({
    total: 0,
    en_attente: 0,
    en_preparation: 0,
    livrees: 0,
    recents: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // ─── Pagination ─────────────────────────────────────────────
  const [pageParticipants, setPageParticipants] = useState(0);
  const [rowsPerPageParticipants, setRowsPerPageParticipants] = useState(3);
  const [pageInscriptions, setPageInscriptions] = useState(0);
  const [rowsPerPageInscriptions, setRowsPerPageInscriptions] = useState(3);
  const [pageCommandes, setPageCommandes] = useState(0);
  const [rowsPerPageCommandes, setRowsPerPageCommandes] = useState(3);

  // ─── Dialog ────────────────────────────────────────────────
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ─── Horloge ──────────────────────────────────────────────
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // ─── Protection admin ──────────────────────────────────────
  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, isAdmin, navigate]);

  // ─── Chargement des données ───────────────────────────────
  useEffect(() => {
    fetchDashboardData();
    fetchCommandes();
  }, []);

  // src/pages/Dashboard.jsx
  // Dans la fonction fetchDashboardData, vérifiez que les données sont bien récupérées

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      console.log("📊 Données dashboard reçues:", data);

      setStats(data.stats);
      setRecentActivities(data.recent_activities || []);
      setEvenementStats(
        data.evenement_stats || {
          total_participations: 0,
          evenement_recent: {
            id: null,
            titre: "Aucun événement",
            clients: [],
            total_inscrits: 0,
          },
        },
      );

      // ✅ Vérifier que les données formations sont bien reçues
      console.log("📋 Formation stats reçues:", data.formation_stats);
      setFormationStats(
        data.formation_stats || {
          total_inscriptions: 0,
          en_attente: 0,
          payees: 0,
          inscriptions_recents: [],
        },
      );

      // ✅ Vérifier que les données commandes sont bien reçues
      console.log("📋 Commandes stats reçues:", data.commandes_stats);
      setCommandesStats(
        data.commandes_stats || {
          total: 0,
          en_attente: 0,
          en_preparation: 0,
          livrees: 0,
          recents: [],
        },
      );
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
  }, [logout, navigate]);
  const fetchCommandes = async () => {
  try {
    const data = await adminService.getCommandes({ page: 1, page_size: 10 });
    console.log("📋 Commandes reçues:", data);
    
    // ✅ Transformer les données pour correspondre au format du Dashboard
    const recents = (data.results || []).map((cmd) => ({
      id: cmd.id,
      client: {
        id: cmd.client,
        nom: cmd.client_name?.split(' ')[0] || 'Client',
        prenom: cmd.client_name?.split(' ')[1] || '',
      },
      total: cmd.total,
      statut: cmd.statut,
      date_commande: cmd.date_commande,
    }));

    setCommandesStats({
      total: data.count || 0,
      en_attente: recents.filter(c => c.statut === 'EN_ATTENTE').length,
      en_preparation: recents.filter(c => c.statut === 'EN_PREPARATION').length,
      livrees: recents.filter(c => c.statut === 'LIVREE').length,
      recents: recents,
    });
  } catch (error) {
    console.error("❌ Erreur récupération commandes:", error);
  }
};

  // ─── Gestion des actions ──────────────────────────────────
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
        await adminService.updateInscription(inscription.id, {
          statut: "PAYEE",
        });
        setSnackbar({
          open: true,
          message: `✅ Participation validée pour ${inscription.client.prenom} ${inscription.client.nom}`,
          severity: "success",
        });
      } else if (actionType === "generer_code") {
        const code =
          "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await adminService.genererCodeAcces(inscription.id, { code });
        setSnackbar({
          open: true,
          message: `✅ Code d'accès généré : ${code}`,
          severity: "success",
        });
      } else if (actionType === "refuser") {
        await adminService.updateInscription(inscription.id, {
          statut: "ANNULEE",
        });
        setSnackbar({
          open: true,
          message: `❌ Participation refusée pour ${inscription.client.prenom} ${inscription.client.nom}`,
          severity: "warning",
        });
      }
      setActionDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      console.error("Erreur:", err);
      setSnackbar({
        open: true,
        message: "❌ Erreur lors de l'action",
        severity: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  // ─── Données mémoïsées ─────────────────────────────────────
  // ✅ 5 STATISTIQUES PRINCIPALES (avec IDs uniques)
  const mainStats = useMemo(
    () => [
      {
        id: "stat-users",
        title: "Utilisateurs",
        value: stats?.users || 0,
        icon: <People sx={{ fontSize: 26 }} />,
        gradient: T.gradient,
        color: T.accent,
        trend: 12,
        trendValue: 12,
        delay: 0,
      },
      {
        id: "stat-clients",
        title: "Clients",
        value: stats?.clients || 0,
        icon: <PersonAdd sx={{ fontSize: 26 }} />,
        gradient: T.gradient,
        color: "#8B5CF6",
        trend: 8,
        trendValue: 8,
        delay: 50,
      },
      {
        id: "stat-products",
        title: "Produits",
        value: stats?.products || 0,
        icon: <ShoppingBag sx={{ fontSize: 26 }} />,
        gradient: T.gradient3,
        color: "#F59E0B",
        trend: -3,
        trendValue: 3,
        delay: 100,
      },
      {
        id: "stat-formations",
        title: "Formations",
        value: stats?.formations || 0,
        icon: <School sx={{ fontSize: 26 }} />,
        gradient: T.gradient2,
        color: T.success,
        trend: 15,
        trendValue: 15,
        delay: 150,
      },
      {
        id: "stat-events",
        title: "Événements",
        value: stats?.events || 0,
        icon: <Event sx={{ fontSize: 26 }} />,
        gradient: T.gradient4,
        color: "#EC4899",
        trend: 5,
        trendValue: 5,
        delay: 200,
      },
    ],
    [stats],
  );

  // ✅ 3 STATISTIQUES SECONDAIRES
  const secondaryStats = useMemo(
    () => [
      {
        id: "stat-inscriptions",
        title: "Inscriptions",
        value: stats?.inscriptions || 0,
        icon: <Assignment sx={{ fontSize: 26 }} />,
        gradient: T.gradient5,
        color: "#06B6D4",
        trend: 22,
        trendValue: 22,
        delay: 0,
      },
      {
        id: "stat-pending",
        title: "En attente",
        value: stats?.pending_payments || 0,
        icon: <Pending sx={{ fontSize: 26 }} />,
        gradient: T.gradient3,
        color: T.warning,
        trend: -8,
        trendValue: 8,
        delay: 50,
      },
      {
        id: "stat-revenue",
        title: "Revenus",
        value: `${(stats?.revenue || 0).toLocaleString("fr-FR")} CFA`,
        icon: <AttachMoney sx={{ fontSize: 26 }} />,
        gradient: T.gradient2,
        color: T.success,
        trend: 18,
        trendValue: 18,
        delay: 100,
      },
    ],
    [stats],
  );

  const clients = evenementStats.evenement_recent.clients || [];
  const evenementId = evenementStats.evenement_recent.id;
  const paginatedClients = useMemo(
    () =>
      clients.slice(
        pageParticipants * rowsPerPageParticipants,
        pageParticipants * rowsPerPageParticipants + rowsPerPageParticipants,
      ),
    [clients, pageParticipants, rowsPerPageParticipants],
  );

  const inscriptions = formationStats.inscriptions_recents || [];
  const paginatedInscriptions = useMemo(
    () =>
      inscriptions.slice(
        pageInscriptions * rowsPerPageInscriptions,
        pageInscriptions * rowsPerPageInscriptions + rowsPerPageInscriptions,
      ),
    [inscriptions, pageInscriptions, rowsPerPageInscriptions],
  );

  const commandes = commandesStats.recents || [];
  const paginatedCommandes = useMemo(
    () =>
      commandes.slice(
        pageCommandes * rowsPerPageCommandes,
        pageCommandes * rowsPerPageCommandes + rowsPerPageCommandes,
      ),
    [commandes, pageCommandes, rowsPerPageCommandes],
  );

  // ─── États de chargement ───────────────────────────────────
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
        <Alert
          severity="error"
          sx={{
            borderRadius: "16px",
            mb: 3,
            display: "inline-flex",
            maxWidth: 480,
          }}
        >
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

  // ─── Rendu ──────────────────────────────────────────────────
  return (
    <Box sx={{ width: "100%" }}>
      {/* ===== HEADER ===== */}
      <DashboardHeader
        user={user}
        currentTime={currentTime}
        onRefresh={fetchDashboardData}
        loading={loading}
      />

      {/* ===== SECTION 1 : 5 STATISTIQUES PRINCIPALES ===== */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {mainStats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.id}>
            <StatWidget {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ===== SECTION 2 : 3 STATISTIQUES SECONDAIRES ===== */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {secondaryStats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.id}>
            <StatWidget {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ===== SECTION 3 : ACTIONS RAPIDES ===== */}
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: "16px",
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: T.primary,
              mb: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <DashboardIcon sx={{ fontSize: 24, color: T.accent }} />
            Actions rapides
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                id: "action-product",
                title: "Ajouter un produit",
                icon: <Storefront sx={{ fontSize: 24 }} />,
                path: "/admin/produits/nouveau",
                color: "#F59E0B",
              },
              {
                id: "action-event",
                title: "Créer un événement",
                icon: <Event sx={{ fontSize: 24 }} />,
                path: "/admin/evenements/nouveau",
                color: "#EC4899",
              },
              {
                id: "action-formation",
                title: "Ajouter une formation",
                icon: <VideoLibrary sx={{ fontSize: 24 }} />,
                path: "/admin/formations/nouveau",
                color: "#10B981",
              },
              {
                id: "action-events",
                title: "Voir les événements",
                icon: <CalendarToday sx={{ fontSize: 24 }} />,
                path: "/admin/evenements",
                color: "#3B82F6",
              },
              {
                id: "action-payments",
                title: "Voir les paiements",
                icon: <Receipt sx={{ fontSize: 24 }} />,
                path: "/admin/paiements",
                color: "#EF4444",
              },
            ].map((action) => (
              <Grid item xs={12} sm={6} md={2.4} key={action.id}>
                <Zoom in timeout={300}>
                  <Button
                    fullWidth
                    onClick={() => navigate(action.path)}
                    sx={{
                      background: action.color,
                      color: "#fff",
                      borderRadius: "14px",
                      py: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      flexDirection: "column",
                      gap: 0.8,
                      boxShadow: `0 4px 16px ${alpha(action.color, 0.25)}`,
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: `0 10px 28px ${alpha(action.color, 0.35)}`,
                      },
                      transition: "all 0.25s ease",
                    }}
                  >
                    {action.icon}
                    {action.title}
                  </Button>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>

      {/* ===== SECTION 4 : 3 CARTES SUR 1 LIGNE ===== */}
      <Grid container spacing={3}>
        {/* ---- CARTE 1 : ACTIVITÉS RÉCENTES ---- */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: T.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Analytics sx={{ fontSize: 22, color: T.accent }} />
                Activités récentes
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate("/admin/logs")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500 }}
              >
                Voir tout
              </Button>
            </Box>

            {recentActivities.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune activité récente
                </Typography>
              </Box>
            ) : (
              <List sx={{ py: 0 }}>
                {recentActivities.slice(0, 4).map((activity, index) => (
                  <React.Fragment key={activity.id || index}>
                    <ActivityItem activity={activity} index={index} />
                    {index < Math.min(recentActivities.length, 4) - 1 && (
                      <Divider sx={{ borderColor: T.border, mx: 0.5 }} />
                    )}
                  </React.Fragment>
                ))}
              </List>
            )}

            {recentActivities.length > 0 && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${T.border}`,
                  display: "flex",
                  justifyContent: "space-around",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {[
                  {
                    label: "Aujourd'hui",
                    value: recentActivities.filter(
                      (a) =>
                        new Date(a.created_at).toDateString() ===
                        new Date().toDateString(),
                    ).length,
                    icon: <Lightbulb sx={{ fontSize: 18 }} />,
                  },
                  {
                    label: "Cette semaine",
                    value: recentActivities.length,
                    icon: <BarChart sx={{ fontSize: 18 }} />,
                  },
                  {
                    label: "Moyenne / jour",
                    value: Math.round(recentActivities.length / 7) || 0,
                    icon: <RocketLaunch sx={{ fontSize: 18 }} />,
                  },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{ textAlign: "center", minWidth: 80 }}
                  >
                    <Box sx={{ color: T.muted }}>{item.icon}</Box>
                    <Typography
                      variant="caption"
                      sx={{ color: T.muted, display: "block" }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: T.primary }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* ---- CARTE 2 : INSCRIPTIONS ÉVÉNEMENTS ---- */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: T.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Event sx={{ fontSize: 22, color: T.accent }} />
                Inscriptions événements
              </Typography>
              <Button
                endIcon={<ArrowForward />}
                onClick={() => navigate("/admin/participants-evenements")} // ✅ Nouvelle page
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500 }}
              >
                Voir tout
              </Button>
            </Box>

            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: "12px",
                bgcolor: alpha(T.accent, 0.05),
                border: `1px solid ${alpha(T.accent, 0.08)}`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: T.primary }}
                >
                  📌{" "}
                  {evenementStats.evenement_recent.titre || "Aucun événement"}
                </Typography>
                <Chip
                  label={`${evenementStats.evenement_recent.total_inscrits || 0} inscrits`}
                  size="medium"
                  sx={{ bgcolor: T.success, color: "#fff", fontWeight: 700 }}
                />
              </Box>
            </Box>

            {paginatedClients.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Person sx={{ fontSize: 36, color: "#CBD5E1" }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune inscription
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {paginatedClients.map((client) => (
                  <Box
                    key={client.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: "10px",
                      border: `1px solid ${T.border}`,
                      transition: "all 0.2s",
                      "&:hover": { borderColor: alpha(T.accent, 0.25) },
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: alpha(T.accent, 0.12),
                          color: T.accent,
                          fontWeight: 600,
                        }}
                      >
                        {client.prenom?.[0]}
                        {client.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: T.primary }}
                        >
                          {client.prenom} {client.nom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: T.muted }}>
                          Inscrit le{" "}
                          {new Date(client.date_inscription).toLocaleDateString(
                            "fr-FR",
                          )}
                        </Typography>
                      </Box>
                    </Box>
                    <Tooltip title="Voir le client">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/admin/clients/${client.id}`)}
                        sx={{ color: T.muted }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            )}

            {clients.length > rowsPerPageParticipants && (
              <TablePagination
                rowsPerPageOptions={[3, 5, 10]}
                component="div"
                count={clients.length}
                rowsPerPage={rowsPerPageParticipants}
                page={pageParticipants}
                onPageChange={(e, p) => setPageParticipants(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPageParticipants(parseInt(e.target.value, 10));
                  setPageParticipants(0);
                }}
                labelRowsPerPage="Lignes"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count}`
                }
                sx={{
                  "& .MuiTablePagination-select, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.7rem" },
                }}
              />
            )}
          </Paper>
        </Grid>

        {/* ---- CARTE 3 : INSCRIPTIONS FORMATIONS ---- */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: T.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <School sx={{ fontSize: 22, color: T.accent }} />
                Inscriptions formations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={`${formationStats.en_attente || 0} en attente`}
                  size="small"
                  sx={{
                    bgcolor: alpha(T.warning, 0.12),
                    color: T.warning,
                    fontWeight: 700,
                  }}
                />
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/admin/inscriptions-formations")} // ✅ Nouvelle page
                  sx={{
                    color: T.muted,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Voir tout
                </Button>
              </Box>
            </Box>

            {paginatedInscriptions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <School sx={{ fontSize: 36, color: "#CBD5E1" }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune inscription
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {paginatedInscriptions.map((inscription) => (
                  <Box
                    key={inscription.id}
                    sx={{
                      p: 1.5,
                      borderRadius: "10px",
                      border: `1px solid ${T.border}`,
                      bgcolor: T.surface,
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: alpha(T.accent, 0.25),
                        boxShadow: T.shadowHover,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: alpha(T.accent, 0.12),
                            color: T.accent,
                            fontWeight: 600,
                          }}
                        >
                          {inscription.client.prenom?.[0]}
                          {inscription.client.nom?.[0]}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: T.primary }}
                          >
                            {inscription.client.prenom} {inscription.client.nom}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: T.muted, display: "block" }}
                          >
                            📚 {inscription.formation.titre}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.5}>
                        {inscription.statut === "EN_ATTENTE" && (
                          <>
                            <Tooltip title="Valider">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleAction(inscription, "valider")
                                }
                                sx={{ color: T.success }}
                              >
                                <CheckCircle fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Refuser">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleAction(inscription, "refuser")
                                }
                                sx={{ color: T.danger }}
                              >
                                <Cancel fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {inscription.statut === "PAYEE" &&
                          !inscription.code_acces && (
                            <Tooltip title="Générer le code">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  handleAction(inscription, "generer_code")
                                }
                                sx={{ color: T.accent }}
                              >
                                <QrCode fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        {inscription.code_acces && (
                          <Chip
                            label="🔑 OK"
                            size="small"
                            sx={{
                              bgcolor: alpha(T.success, 0.12),
                              color: T.success,
                              fontWeight: 700,
                            }}
                          />
                        )}
                        <Tooltip title="Voir le client">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(
                                `/admin/clients/${inscription.client.id}`,
                              )
                            }
                            sx={{ color: T.muted }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                    <Box
                      sx={{
                        mt: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Chip
                        label={
                          inscription.statut === "EN_ATTENTE"
                            ? "⏳ En attente"
                            : inscription.statut
                        }
                        size="small"
                        sx={{
                          bgcolor:
                            inscription.statut === "EN_ATTENTE"
                              ? alpha(T.warning, 0.12)
                              : alpha(T.success, 0.12),
                          color:
                            inscription.statut === "EN_ATTENTE"
                              ? T.warning
                              : T.success,
                          fontWeight: 700,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: T.muted }}>
                        💰 {inscription.montant} CFA
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}

            {inscriptions.length > rowsPerPageInscriptions && (
              <TablePagination
                rowsPerPageOptions={[3, 5, 10]}
                component="div"
                count={inscriptions.length}
                rowsPerPage={rowsPerPageInscriptions}
                page={pageInscriptions}
                onPageChange={(e, p) => setPageInscriptions(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPageInscriptions(parseInt(e.target.value, 10));
                  setPageInscriptions(0);
                }}
                labelRowsPerPage="Lignes"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count}`
                }
                sx={{
                  "& .MuiTablePagination-select, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.7rem" },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ===== SECTION 5 : COMMANDES CLIENTS ===== */}
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: "16px",
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
              transition: "box-shadow 0.3s",
              "&:hover": { boxShadow: T.shadowHover },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: T.primary,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <ShoppingCart sx={{ fontSize: 24, color: T.accent }} />
                Commandes clients
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={`${commandesStats.total || 0} total`}
                  size="small"
                  sx={{
                    bgcolor: alpha(T.accent, 0.12),
                    color: T.accent,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`${commandesStats.en_attente || 0} en attente`}
                  size="small"
                  sx={{
                    bgcolor: alpha(T.warning, 0.12),
                    color: T.warning,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`${commandesStats.en_preparation || 0} en préparation`}
                  size="small"
                  sx={{
                    bgcolor: alpha(T.accent, 0.12),
                    color: T.accent,
                    fontWeight: 700,
                  }}
                />
                <Chip
                  label={`${commandesStats.livrees || 0} livrées`}
                  size="small"
                  sx={{
                    bgcolor: alpha(T.success, 0.12),
                    color: T.success,
                    fontWeight: 700,
                  }}
                />
                <Button
                  endIcon={<ArrowForward />}
                  onClick={() => navigate("/admin/commandes")}
                  sx={{
                    color: T.muted,
                    textTransform: "none",
                    fontWeight: 500,
                  }}
                >
                  Voir tout
                </Button>
              </Box>
            </Box>

            {paginatedCommandes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingCart sx={{ fontSize: 48, color: "#CBD5E1" }} />
                <Typography variant="body2" sx={{ color: T.muted, mt: 1 }}>
                  Aucune commande récente
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 700, color: T.primary }}>
                        Commande
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: T.primary }}>
                        Client
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: T.primary }}
                        align="center"
                      >
                        Total
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: T.primary }}
                        align="center"
                      >
                        Statut
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: T.primary }}
                        align="center"
                      >
                        Date
                      </TableCell>
                      <TableCell
                        sx={{ fontWeight: 700, color: T.primary }}
                        align="center"
                      >
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCommandes.map((commande) => (
                      <TableRow
                        key={commande.id}
                        hover
                        sx={{ "&:hover": { bgcolor: alpha(T.accent, 0.03) } }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: T.primary }}
                          >
                            #{commande.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: alpha(T.accent, 0.12),
                                color: T.accent,
                                fontWeight: 600,
                              }}
                            >
                              {commande.client?.prenom?.[0]}
                              {commande.client?.nom?.[0]}
                            </Avatar>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, color: T.primary }}
                            >
                              {commande.client?.prenom} {commande.client?.nom}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: T.primary }}
                          >
                            {commande.total} CFA
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={commande.statut || "En attente"}
                            size="small"
                            sx={{
                              bgcolor:
                                commande.statut === "LIVREE"
                                  ? alpha(T.success, 0.12)
                                  : commande.statut === "EN_PREPARATION"
                                    ? alpha(T.accent, 0.12)
                                    : alpha(T.warning, 0.12),
                              color:
                                commande.statut === "LIVREE"
                                  ? T.success
                                  : commande.statut === "EN_PREPARATION"
                                    ? T.accent
                                    : T.warning,
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="body2" sx={{ color: T.muted }}>
                            {new Date(
                              commande.date_commande,
                            ).toLocaleDateString("fr-FR")}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Voir la commande">
                            <IconButton
                              size="small"
                              onClick={() =>
                                navigate(`/admin/commandes/${commande.id}`)
                              }
                              sx={{ color: T.muted }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {commandes.length > rowsPerPageCommandes && (
              <TablePagination
                rowsPerPageOptions={[3, 5, 10]}
                component="div"
                count={commandes.length}
                rowsPerPage={rowsPerPageCommandes}
                page={pageCommandes}
                onPageChange={(e, p) => setPageCommandes(p)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPageCommandes(parseInt(e.target.value, 10));
                  setPageCommandes(0);
                }}
                labelRowsPerPage="Lignes"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}-${to} sur ${count}`
                }
                sx={{
                  "& .MuiTablePagination-select, & .MuiTablePagination-displayedRows":
                    { fontSize: "0.7rem" },
                }}
              />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ===== DIALOG DE CONFIRMATION ===== */}
      <Dialog
        open={actionDialogOpen}
        onClose={() => setActionDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: T.primary }}>
          {actionType === "valider" && "✅ Valider la participation"}
          {actionType === "refuser" && "❌ Refuser la participation"}
          {actionType === "generer_code" && "🔑 Générer le code d'accès"}
        </DialogTitle>
        <DialogContent>
          {selectedInscription && (
            <DialogContentText sx={{ color: T.muted }}>
              {actionType === "valider" && (
                <>
                  Êtes-vous sûr de vouloir valider la participation de{" "}
                  <strong>
                    {selectedInscription.client.prenom}{" "}
                    {selectedInscription.client.nom}
                  </strong>{" "}
                  à la formation{" "}
                  <strong>"{selectedInscription.formation.titre}"</strong> ?
                </>
              )}
              {actionType === "refuser" && (
                <>
                  Êtes-vous sûr de vouloir refuser la participation de{" "}
                  <strong>
                    {selectedInscription.client.prenom}{" "}
                    {selectedInscription.client.nom}
                  </strong>{" "}
                  à la formation{" "}
                  <strong>"{selectedInscription.formation.titre}"</strong> ?
                </>
              )}
              {actionType === "generer_code" && (
                <>
                  Un code d'accès va être généré pour{" "}
                  <strong>
                    {selectedInscription.client.prenom}{" "}
                    {selectedInscription.client.nom}
                  </strong>{" "}
                  pour la formation{" "}
                  <strong>"{selectedInscription.formation.titre}"</strong>.
                </>
              )}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            onClick={() => setActionDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "12px", textTransform: "none" }}
          >
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
              "&:hover": {
                bgcolor: actionType === "refuser" ? "#DC2626" : "#059669",
              },
            }}
          >
            {processing ? (
              <CircularProgress size={20} sx={{ color: "#fff" }} />
            ) : (
              "Confirmer"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: "14px", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
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
        gap: 2,
        mb: 3,
        p: 2.5,
        borderRadius: "20px",
        background: `linear-gradient(135deg, ${alpha(T.accent, 0.05)} 0%, ${alpha("#A855F7", 0.03)} 100%)`,
        border: `1px solid ${alpha(T.accent, 0.08)}`,
        boxShadow: T.shadow,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
        <Avatar
          sx={{
            width: 56,
            height: 56,
            background: T.gradient,
            boxShadow: `0 4px 16px ${alpha(T.accent, 0.3)}`,
            fontWeight: 700,
            fontSize: "1.3rem",
          }}
        >
          {user?.first_name?.[0] || user?.username?.[0] || "A"}
        </Avatar>

        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: T.primary,
              letterSpacing: -0.5,
              lineHeight: 1.2,
              fontSize: "1.4rem",
            }}
          >
            Bonjour, {user?.first_name || user?.username || "Administrateur"} 👋
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mt: 0.5,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: T.muted, fontWeight: 500 }}
            >
              {currentTime.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </Typography>
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: T.muted,
                opacity: 0.5,
              }}
            />
            <Typography
              variant="body2"
              sx={{ color: T.muted, fontWeight: 500 }}
            >
              {currentTime.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Typography>
            <Chip
              label="Admin"
              size="small"
              sx={{
                height: 24,
                fontSize: "0.7rem",
                fontWeight: 700,
                background: T.gradient,
                color: "#fff",
                borderRadius: "8px",
              }}
            />
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
        <IconButton
          sx={{
            color: T.muted,
            bgcolor: alpha(T.accent, 0.05),
            "&:hover": { color: T.accent, bgcolor: alpha(T.accent, 0.1) },
            width: 40,
            height: 40,
          }}
        >
          <Badge badgeContent={3} color="error">
            <Notifications sx={{ fontSize: 22 }} />
          </Badge>
        </IconButton>

        <Button
          variant="outlined"
          startIcon={
            loading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Refresh sx={{ fontSize: 20 }} />
            )
          }
          onClick={onRefresh}
          disabled={loading}
          sx={{
            borderColor: T.border,
            color: T.primary,
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
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
          startIcon={<ExitToApp sx={{ fontSize: 20 }} />}
          onClick={handleLogout}
          sx={{
            background: `linear-gradient(135deg, ${T.danger} 0%, #F87171 100%)`,
            color: "#fff",
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 600,
            px: 2.5,
            boxShadow: `0 4px 16px ${alpha(T.danger, 0.25)}`,
            "&:hover": { boxShadow: `0 8px 24px ${alpha(T.danger, 0.35)}` },
            transition: "all 0.25s ease",
          }}
        >
          Déconnexion
        </Button>

        <IconButton onClick={handleMenuOpen}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              background: T.gradient,
              fontWeight: 700,
              fontSize: "1rem",
              border: `2px solid ${alpha(T.accent, 0.2)}`,
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
              borderRadius: "14px",
              mt: 1,
              minWidth: 200,
              border: `1px solid ${T.border}`,
              boxShadow: "0 12px 32px rgba(15,23,42,0.08)",
            },
          }}
        >
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/profile");
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <PersonAdd fontSize="small" sx={{ color: T.accent }} />
            </ListItemIcon>
            Mon profil
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleMenuClose();
              navigate("/admin/parametres");
            }}
            sx={{ py: 1 }}
          >
            <ListItemIcon>
              <Settings fontSize="small" sx={{ color: T.accent }} />
            </ListItemIcon>
            Paramètres
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleLogout} sx={{ color: T.danger, py: 1 }}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" sx={{ color: T.danger }} />
            </ListItemIcon>
            Déconnexion
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Dashboard;
