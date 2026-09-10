// src/pages/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import {
  Grid, Paper, Typography, Box, Card, CardContent, Button, List, ListItem,
  ListItemText, ListItemIcon, Divider, Chip, CircularProgress, Alert,
  Avatar, IconButton, Badge, Menu, MenuItem, alpha, Tooltip, Skeleton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Stack, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar,
  FormControl, InputLabel, Select,
} from "@mui/material";
import {
  People, Event, ShoppingBag, School, TrendingUp, TrendingDown,
  AttachMoney, ArrowForward, CheckCircle, Pending, Cancel, Refresh,
  PersonAdd, Notifications, Settings, Assignment, Receipt,
  Dashboard as DashboardIcon, Analytics, ExitToApp,
  Storefront, VideoLibrary, CalendarToday, Visibility, QrCode,
  Email, Phone, ShoppingCart, Spa, Logout as LogoutIcon, Person,
} from "@mui/icons-material";

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM – Épuré & Professionnel
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#94A3B8",
  border: "#E2E8F0",
  accent: "#4F46E5",          // Indigo discret
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  shadow: "0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)",
  shadowHover: "0 4px 12px -2px rgba(0,0,0,0.06)",
};

// ─── Carte de statistique ────────────────────────────────────
const StatCard = ({ title, value, icon, trend, trendValue, color = T.accent }) => (
  <Card
    elevation={0}
    sx={{
      height: "100%",
      borderRadius: 2,
      border: `1px solid ${T.border}`,
      background: T.surface,
      transition: "box-shadow 0.2s ease",
      "&:hover": { boxShadow: T.shadowHover },
    }}
  >
    <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
        <Typography
          variant="body2"
          sx={{ color: T.muted, fontWeight: 500, fontSize: "0.8125rem" }}
        >
          {title}
        </Typography>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(color, 0.08),
            color: color,
          }}
        >
          {icon}
        </Box>
      </Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 700, color: T.primary, letterSpacing: -0.5, mb: 0.75 }}
      >
        {value}
      </Typography>
      {trend !== undefined && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {trend > 0 ? (
            <TrendingUp sx={{ fontSize: 14, color: T.success }} />
          ) : (
            <TrendingDown sx={{ fontSize: 14, color: T.danger }} />
          )}
          <Typography
            variant="caption"
            sx={{
              color: trend > 0 ? T.success : T.danger,
              fontWeight: 600,
              fontSize: "0.75rem",
            }}
          >
            {trend > 0 ? "+" : ""}{trendValue}%
          </Typography>
          <Typography variant="caption" sx={{ color: T.muted, fontSize: "0.75rem" }}>
            vs mois dernier
          </Typography>
        </Box>
      )}
    </CardContent>
  </Card>
);

// ─── Item d'activité ─────────────────────────────────────────
const ActivityItem = ({ activity }) => {
  const getIcon = (action) => {
    switch (action) {
      case "CREATE": return <CheckCircle sx={{ color: T.success, fontSize: 18 }} />;
      case "UPDATE": return <Pending sx={{ color: T.warning, fontSize: 18 }} />;
      case "DELETE": return <Cancel sx={{ color: T.danger, fontSize: 18 }} />;
      case "LOGIN": return <CheckCircle sx={{ color: T.accent, fontSize: 18 }} />;
      default: return <CheckCircle sx={{ color: T.muted, fontSize: 18 }} />;
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

  return (
    <ListItem
      sx={{
        px: 0,
        py: 1.25,
        borderBottom: `1px solid ${T.border}`,
        "&:last-child": { borderBottom: "none" },
      }}
    >
      <ListItemIcon sx={{ minWidth: 36 }}>{getIcon(activity.action)}</ListItemIcon>
      <ListItemText
        primary={
          <Typography variant="body2" sx={{ color: T.primary, fontSize: "0.875rem" }}>
            <Box component="span" sx={{ fontWeight: 600 }}>
              {activity.admin_username || "Admin"}
            </Box>{" "}
            {getActionLabel(activity.action)}{" "}
            <Box component="span" sx={{ color: T.muted }}>
              {activity.model_name}
            </Box>
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
    </ListItem>
  );
};

// ─── Skeleton ────────────────────────────────────────────────
const DashboardSkeleton = () => (
  <Box>
    <Skeleton variant="rounded" height={72} sx={{ borderRadius: 2, mb: 3 }} />
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Grid item xs={12} sm={6} md={2.4} key={i}>
          <Skeleton variant="rounded" height={110} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[...Array(3)].map((_, i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Skeleton variant="rounded" height={110} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={2.5}>
      {[...Array(3)].map((_, i) => (
        <Grid item xs={12} md={4} key={i}>
          <Skeleton variant="rounded" height={320} sx={{ borderRadius: 2 }} />
        </Grid>
      ))}
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
  const [commandesStats, setCommandesStats] = useState({
    total: 0,
    en_attente: 0,
    en_preparation: 0,
    livrees: 0,
    recents: [],
  });
  const [inscriptionsRelooking, setInscriptionsRelooking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Modals
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [commandeDetailOpen, setCommandeDetailOpen] = useState(false);
  const [commandeDetails, setCommandeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [selectedInscription, setSelectedInscription] = useState(null);
  const [inscriptionDetailOpen, setInscriptionDetailOpen] = useState(false);
  const [loadingInscriptionDetails, setLoadingInscriptionDetails] = useState(false);

  const [selectedInscriptionAction, setSelectedInscriptionAction] = useState(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [processing, setProcessing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // Pagination
  const [pageParticipants, setPageParticipants] = useState(0);
  const [rowsPerPageParticipants] = useState(4);
  const [pageInscriptions, setPageInscriptions] = useState(0);
  const [rowsPerPageInscriptions] = useState(4);
  const [pageCommandes, setPageCommandes] = useState(0);
  const [rowsPerPageCommandes] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && !isAdmin) navigate("/", { replace: true });
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    fetchDashboardData();
    fetchCommandes();
    fetchInscriptionsRelooking();
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data.stats);
      setRecentActivities(data.recent_activities || []);
      setEvenementStats(
        data.evenement_stats || {
          total_participations: 0,
          evenement_recent: { id: null, titre: "Aucun événement", clients: [], total_inscrits: 0 },
        }
      );
      setFormationStats(
        data.formation_stats || {
          total_inscriptions: 0,
          en_attente: 0,
          payees: 0,
          inscriptions_recents: [],
        }
      );
      setCommandesStats(
        data.commandes_stats || {
          total: 0,
          en_attente: 0,
          en_preparation: 0,
          livrees: 0,
          recents: [],
        }
      );
    } catch (err) {
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
      const recents = (data.results || []).map((cmd) => ({
        id: cmd.id,
        client: {
          id: cmd.client,
          prenom: cmd.client_name?.split(" ")[0] || "Client",
          nom: cmd.client_name?.split(" ")[1] || "",
        },
        total: cmd.total,
        statut: cmd.statut,
        date_commande: cmd.date_commande,
      }));
      setCommandesStats({
        total: data.count || 0,
        en_attente: recents.filter((c) => c.statut === "EN_ATTENTE").length,
        en_preparation: recents.filter((c) => c.statut === "EN_PREPARATION").length,
        livrees: recents.filter((c) => c.statut === "LIVREE").length,
        recents,
      });
    } catch (error) {
      console.error("Erreur récupération commandes:", error);
    }
  };

  const fetchInscriptionsRelooking = async () => {
    try {
      const data = await adminService.getInscriptionsRelooking({});
      setInscriptionsRelooking(data.results || data || []);
    } catch (error) {
      console.error("Erreur récupération inscriptions relooking:", error);
    }
  };

  const handleAction = (inscription, type) => {
    setSelectedInscriptionAction(inscription);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    setProcessing(true);
    try {
      const inscription = selectedInscriptionAction;
      if (actionType === "valider") {
        await adminService.updateInscription(inscription.id, { statut: "PAYEE" });
        setSnackbar({
          open: true,
          message: `Participation validée pour ${inscription.client.prenom} ${inscription.client.nom}`,
          severity: "success",
        });
      } else if (actionType === "generer_code") {
        const code = "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await adminService.genererCodeAcces(inscription.id, { code });
        setSnackbar({ open: true, message: `Code d'accès généré : ${code}`, severity: "success" });
      } else if (actionType === "refuser") {
        await adminService.updateInscription(inscription.id, { statut: "ANNULEE" });
        setSnackbar({
          open: true,
          message: `Participation refusée pour ${inscription.client.prenom} ${inscription.client.nom}`,
          severity: "warning",
        });
      }
      setActionDialogOpen(false);
      fetchDashboardData();
    } catch (err) {
      setSnackbar({ open: true, message: "Erreur lors de l'action", severity: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleVoirCommande = async (commande) => {
    setSelectedCommande(commande);
    setCommandeDetailOpen(true);
    setLoadingDetails(true);
    try {
      const details = await adminService.getCommandeDetails(commande.id);
      setCommandeDetails(details);
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des détails de la commande",
        severity: "error",
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseCommandeDetail = () => {
    setCommandeDetailOpen(false);
    setSelectedCommande(null);
    setCommandeDetails(null);
  };

  const handleVoirInscriptionRelooking = async (inscription) => {
    setSelectedInscription(inscription);
    setInscriptionDetailOpen(true);
    setLoadingInscriptionDetails(true);
    try {
      const details = await adminService.getInscriptionRelookingById(inscription.id);
      setSelectedInscription(details);
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors du chargement des détails", severity: "error" });
    } finally {
      setLoadingInscriptionDetails(false);
    }
  };

  const handleCloseInscriptionDetail = () => {
    setInscriptionDetailOpen(false);
    setSelectedInscription(null);
  };

  // Stats
  const mainStats = useMemo(
    () => [
      {
        title: "Utilisateurs",
        value: stats?.users || 0,
        icon: <People sx={{ fontSize: 18 }} />,
        color: T.accent,
        trend: 12,
        trendValue: 12,
      },
      {
        title: "Clients",
        value: stats?.clients || 0,
        icon: <PersonAdd sx={{ fontSize: 18 }} />,
        color: "#7C3AED",
        trend: 8,
        trendValue: 8,
      },
      {
        title: "Produits",
        value: stats?.products || 0,
        icon: <ShoppingBag sx={{ fontSize: 18 }} />,
        color: T.warning,
        trend: -3,
        trendValue: 3,
      },
      {
        title: "Formations",
        value: stats?.formations || 0,
        icon: <School sx={{ fontSize: 18 }} />,
        color: T.success,
        trend: 15,
        trendValue: 15,
      },
      {
        title: "Événements",
        value: stats?.events || 0,
        icon: <Event sx={{ fontSize: 18 }} />,
        color: "#DB2777",
        trend: 5,
        trendValue: 5,
      },
    ],
    [stats]
  );

  const secondaryStats = useMemo(
    () => [
      {
        title: "Inscriptions",
        value: stats?.inscriptions || 0,
        icon: <Assignment sx={{ fontSize: 18 }} />,
        color: "#0891B2",
        trend: 22,
        trendValue: 22,
      },
      {
        title: "En attente",
        value: stats?.pending_payments || 0,
        icon: <Pending sx={{ fontSize: 18 }} />,
        color: T.warning,
        trend: -8,
        trendValue: 8,
      },
      {
        title: "Revenus",
        value: `${(stats?.revenue || 0).toLocaleString("fr-FR")} CFA`,
        icon: <AttachMoney sx={{ fontSize: 18 }} />,
        color: T.success,
        trend: 18,
        trendValue: 18,
      },
    ],
    [stats]
  );

  const clients = evenementStats.evenement_recent.clients || [];
  const paginatedClients = useMemo(
    () =>
      clients.slice(
        pageParticipants * rowsPerPageParticipants,
        pageParticipants * rowsPerPageParticipants + rowsPerPageParticipants
      ),
    [clients, pageParticipants, rowsPerPageParticipants]
  );

  const inscriptions = formationStats.inscriptions_recents || [];
  const paginatedInscriptions = useMemo(
    () =>
      inscriptions.slice(
        pageInscriptions * rowsPerPageInscriptions,
        pageInscriptions * rowsPerPageInscriptions + rowsPerPageInscriptions
      ),
    [inscriptions, pageInscriptions, rowsPerPageInscriptions]
  );

  const commandes = commandesStats.recents || [];
  const paginatedCommandes = useMemo(
    () =>
      commandes.slice(
        pageCommandes * rowsPerPageCommandes,
        pageCommandes * rowsPerPageCommandes + rowsPerPageCommandes
      ),
    [commandes, pageCommandes, rowsPerPageCommandes]
  );

  const typeColors = {
    FEMME: { color: "#DB2777", label: "Relooking Femme" },
    HOMME: { color: "#2563EB", label: "Relooking Homme" },
    ATELIER: { color: T.success, label: "Atelier Relooking" },
  };

  const statutColors = {
    EN_ATTENTE: { color: T.warning, label: "En attente" },
    CONFIRME: { color: T.success, label: "Confirmé" },
    ANNULE: { color: T.danger, label: "Annulé" },
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
        <Alert
          severity="error"
          sx={{ borderRadius: 2, mb: 3, display: "inline-flex", maxWidth: 480 }}
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
            bgcolor: T.accent,
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            boxShadow: "none",
            "&:hover": { bgcolor: "#4338CA", boxShadow: "none" },
          }}
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      {/* ─── HEADER ─────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 3.5,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: T.primary, letterSpacing: -0.5, mb: 0.25 }}
          >
            Bonjour, {user?.first_name || user?.username || "Administrateur"}
          </Typography>
          <Typography variant="body2" sx={{ color: T.muted }}>
            {currentTime.toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {currentTime.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <IconButton
            size="small"
            sx={{
              color: T.muted,
              border: `1px solid ${T.border}`,
              borderRadius: 1.5,
              width: 38,
              height: 38,
            }}
          >
            <Badge badgeContent={3} color="error" sx={{ "& .MuiBadge-badge": { fontSize: 10 } }}>
              <Notifications sx={{ fontSize: 20 }} />
            </Badge>
          </IconButton>

          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} color="inherit" /> : <Refresh sx={{ fontSize: 18 }} />}
            onClick={fetchDashboardData}
            disabled={loading}
            sx={{
              borderColor: T.border,
              color: T.primary,
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
              px: 2,
              height: 38,
              "&:hover": { borderColor: T.accent, bgcolor: alpha(T.accent, 0.04) },
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
              color: "#fff",
              borderRadius: 1.5,
              textTransform: "none",
              fontWeight: 500,
              px: 2,
              height: 38,
              boxShadow: "none",
              "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
            }}
          >
            Déconnexion
          </Button>
        </Box>
      </Box>

      {/* ─── STATS PRINCIPALES ──────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 2.5 }}>
        {mainStats.map((stat) => (
          <Grid item xs={12} sm={6} md={2.4} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ─── STATS SECONDAIRES ──────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3.5 }}>
        {secondaryStats.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* ─── ACTIONS RAPIDES ────────────────────────────────── */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 2,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadow,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: T.primary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}
        >
          <DashboardIcon sx={{ fontSize: 18, color: T.accent }} />
          Actions rapides
        </Typography>
        <Grid container spacing={1.5}>
          {[
            { title: "Ajouter un produit", icon: <Storefront sx={{ fontSize: 18 }} />, path: "/admin/produits/nouveau" },
            { title: "Créer un événement", icon: <Event sx={{ fontSize: 18 }} />, path: "/admin/evenements/nouveau" },
            { title: "Ajouter une formation", icon: <VideoLibrary sx={{ fontSize: 18 }} />, path: "/admin/formations/nouveau" },
            { title: "Voir les événements", icon: <CalendarToday sx={{ fontSize: 18 }} />, path: "/admin/evenements" },
            { title: "Voir les paiements", icon: <Receipt sx={{ fontSize: 18 }} />, path: "/admin/paiements" },
          ].map((action) => (
            <Grid item xs={12} sm={6} md={2.4} key={action.title}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={action.icon}
                onClick={() => navigate(action.path)}
                sx={{
                  borderColor: T.border,
                  color: T.primary,
                  borderRadius: 1.5,
                  py: 1.25,
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "0.8125rem",
                  justifyContent: "flex-start",
                  "&:hover": {
                    borderColor: T.accent,
                    bgcolor: alpha(T.accent, 0.04),
                    color: T.accent,
                  },
                }}
              >
                {action.title}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ─── 3 COLONNES PRINCIPALES ─────────────────────────── */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Activités récentes */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
                <Analytics sx={{ fontSize: 18, color: T.accent }} />
                Activités récentes
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/admin/logs")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500, fontSize: "0.75rem" }}
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
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <ActivityItem key={activity.id || index} activity={activity} />
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Inscriptions événements */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
                <Event sx={{ fontSize: 18, color: T.accent }} />
                Inscriptions événements
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/admin/participants-evenements")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500, fontSize: "0.75rem" }}
              >
                Voir tout
              </Button>
            </Box>

            <Box
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 1.5,
                bgcolor: alpha(T.accent, 0.04),
                border: `1px solid ${alpha(T.accent, 0.08)}`,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary, fontSize: "0.8125rem" }}>
                  {evenementStats.evenement_recent.titre || "Aucun événement"}
                </Typography>
                <Chip
                  label={`${evenementStats.evenement_recent.total_inscrits || 0} inscrits`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor: alpha(T.success, 0.1),
                    color: T.success,
                  }}
                />
              </Box>
            </Box>

            {paginatedClients.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <Person sx={{ fontSize: 32, color: "#CBD5E1", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune inscription
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {paginatedClients.map((client) => (
                  <Box
                    key={client.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.25,
                      borderRadius: 1.5,
                      border: `1px solid ${T.border}`,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: alpha(T.accent, 0.1),
                          color: T.accent,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {client.prenom?.[0]}
                        {client.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary, fontSize: "0.8125rem" }}>
                          {client.prenom} {client.nom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: T.muted }}>
                          {new Date(client.date_inscription).toLocaleDateString("fr-FR")}
                        </Typography>
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/admin/clients/${client.id}`)}
                      sx={{ color: T.muted }}
                    >
                      <Visibility sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* Inscriptions formations */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 2,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
                <School sx={{ fontSize: 18, color: T.accent }} />
                Inscriptions formations
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={`${formationStats.en_attente || 0} en attente`}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    bgcolor: alpha(T.warning, 0.1),
                    color: T.warning,
                  }}
                />
                <Button
                  size="small"
                  endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                  onClick={() => navigate("/admin/inscriptions-formations")}
                  sx={{ color: T.muted, textTransform: "none", fontWeight: 500, fontSize: "0.75rem" }}
                >
                  Voir tout
                </Button>
              </Box>
            </Box>

            {paginatedInscriptions.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3 }}>
                <School sx={{ fontSize: 32, color: "#CBD5E1", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune inscription
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.25}>
                {paginatedInscriptions.map((inscription) => (
                  <Box
                    key={inscription.id}
                    sx={{
                      p: 1.5,
                      borderRadius: 1.5,
                      border: `1px solid ${T.border}`,
                      transition: "border-color 0.15s",
                      "&:hover": { borderColor: alpha(T.accent, 0.3) },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: alpha(T.accent, 0.1),
                            color: T.accent,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {inscription.client.prenom?.[0]}
                          {inscription.client.nom?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: T.primary, fontSize: "0.8125rem" }}>
                            {inscription.client.prenom} {inscription.client.nom}
                          </Typography>
                          <Typography variant="caption" sx={{ color: T.muted, display: "block" }}>
                            {inscription.formation.titre}
                          </Typography>
                        </Box>
                      </Box>
                      <Stack direction="row" spacing={0.25}>
                        {inscription.statut === "EN_ATTENTE" && (
                          <>
                            <Tooltip title="Valider">
                              <IconButton
                                size="small"
                                onClick={() => handleAction(inscription, "valider")}
                                sx={{ color: T.success }}
                              >
                                <CheckCircle sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Refuser">
                              <IconButton
                                size="small"
                                onClick={() => handleAction(inscription, "refuser")}
                                sx={{ color: T.danger }}
                              >
                                <Cancel sx={{ fontSize: 16 }} />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {inscription.statut === "PAYEE" && !inscription.code_acces && (
                          <Tooltip title="Générer le code">
                            <IconButton
                              size="small"
                              onClick={() => handleAction(inscription, "generer_code")}
                              sx={{ color: T.accent }}
                            >
                              <QrCode sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        )}
                        {inscription.code_acces && (
                          <Chip
                            label="Code OK"
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.65rem",
                              fontWeight: 600,
                              bgcolor: alpha(T.success, 0.1),
                              color: T.success,
                            }}
                          />
                        )}
                      </Stack>
                    </Box>
                    <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip
                        label={inscription.statut === "EN_ATTENTE" ? "En attente" : inscription.statut}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 600,
                          bgcolor:
                            inscription.statut === "EN_ATTENTE"
                              ? alpha(T.warning, 0.1)
                              : alpha(T.success, 0.1),
                          color: inscription.statut === "EN_ATTENTE" ? T.warning : T.success,
                        }}
                      />
                      <Typography variant="caption" sx={{ color: T.muted }}>
                        {inscription.montant} CFA
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ─── TABLEAUX ───────────────────────────────────────── */}
      <Grid container spacing={2.5}>
        {/* Commandes */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
                <ShoppingCart sx={{ fontSize: 18, color: T.accent }} />
                Commandes clients
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/admin/commandes")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500, fontSize: "0.75rem" }}
              >
                Voir tout
              </Button>
            </Box>

            {paginatedCommandes.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <ShoppingCart sx={{ fontSize: 36, color: "#CBD5E1", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune commande récente
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Commande
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Client
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Total
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Statut
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedCommandes.map((commande) => (
                      <TableRow key={commande.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                            #{commande.id}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                            {commande.client?.prenom} {commande.client?.nom}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                            {commande.total} CFA
                          </Typography>
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Chip
                            label={commande.statut}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              bgcolor:
                                commande.statut === "LIVREE"
                                  ? alpha(T.success, 0.1)
                                  : alpha(T.warning, 0.1),
                              color: commande.statut === "LIVREE" ? T.success : T.warning,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              onClick={() => handleVoirCommande(commande)}
                              sx={{ color: T.muted }}
                            >
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Inscriptions Relooking */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: `1px solid ${T.border}`,
              boxShadow: T.shadow,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
                <Spa sx={{ fontSize: 18, color: T.accent }} />
                Inscriptions Relooking
              </Typography>
              <Button
                size="small"
                endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                onClick={() => navigate("/admin/inscriptions-relooking")}
                sx={{ color: T.muted, textTransform: "none", fontWeight: 500, fontSize: "0.75rem" }}
              >
                Voir tout
              </Button>
            </Box>

            {inscriptionsRelooking.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Spa sx={{ fontSize: 36, color: "#CBD5E1", mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: T.muted }}>
                  Aucune inscription relooking
                </Typography>
              </Box>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Client
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Type
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        Statut
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.75rem", borderBottom: `1px solid ${T.border}` }}>
                        
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inscriptionsRelooking.slice(0, 5).map((inscription) => (
                      <TableRow key={inscription.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                        <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                bgcolor: alpha(T.accent, 0.1),
                                color: T.accent,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {inscription.prenom?.[0]}
                              {inscription.nom?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                                {inscription.prenom} {inscription.nom}
                              </Typography>
                              <Typography variant="caption" sx={{ color: T.muted }}>
                                {inscription.rubrique_nom || inscription.atelier_nom}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Chip
                            label={typeColors[inscription.type]?.label || inscription.type}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              bgcolor: alpha(T.accent, 0.08),
                              color: T.accent,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Chip
                            label={statutColors[inscription.statut]?.label || inscription.statut}
                            size="small"
                            sx={{
                              height: 22,
                              fontSize: "0.7rem",
                              fontWeight: 600,
                              bgcolor: statutColors[inscription.statut]?.color
                                ? alpha(statutColors[inscription.statut].color, 0.1)
                                : alpha(T.muted, 0.1),
                              color: statutColors[inscription.statut]?.color || T.muted,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center" sx={{ borderBottom: `1px solid ${T.border}` }}>
                          <Tooltip title="Voir détails">
                            <IconButton
                              size="small"
                              onClick={() => handleVoirInscriptionRelooking(inscription)}
                              sx={{ color: T.muted }}
                            >
                              <Visibility sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* ─── MODAL COMMANDE ─────────────────────────────────── */}
      <Dialog
        open={commandeDetailOpen}
        onClose={handleCloseCommandeDetail}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${T.border}`,
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, color: T.primary }}>
            Commande #{selectedCommande?.id}
          </Typography>
          <IconButton onClick={handleCloseCommandeDetail} size="small">
            <Cancel sx={{ color: T.muted, fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {loadingDetails ? (
            <Box sx={{ p: 5, textAlign: "center" }}>
              <CircularProgress size={28} sx={{ color: T.accent }} />
              <Typography variant="body2" sx={{ color: T.muted, mt: 2 }}>
                Chargement des détails...
              </Typography>
            </Box>
          ) : commandeDetails ? (
            <Box>
              <Box sx={{ p: 3, bgcolor: alpha(T.accent, 0.03), borderBottom: `1px solid ${T.border}` }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: alpha(T.accent, 0.1),
                          color: T.accent,
                          fontWeight: 600,
                        }}
                      >
                        {commandeDetails.client?.prenom?.[0]}
                        {commandeDetails.client?.nom?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="caption" sx={{ color: T.muted }}>
                          Client
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {commandeDetails.client?.prenom} {commandeDetails.client?.nom}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Stack spacing={0.75}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ color: T.muted }}>
                          Total
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: T.success }}>
                          {commandeDetails.total} CFA
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ color: T.muted }}>
                          Statut
                        </Typography>
                        <Chip label={commandeDetails.statut} size="small" sx={{ height: 22, fontWeight: 600 }} />
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="body2" sx={{ color: T.muted }}>
                          Date
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {new Date(commandeDetails.date_commande).toLocaleDateString("fr-FR")}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: T.primary, mb: 1.5 }}>
                  Articles commandés
                </Typography>
                <TableContainer
                  component={Paper}
                  elevation={0}
                  sx={{ border: `1px solid ${T.border}`, borderRadius: 1.5 }}
                >
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                        <TableCell sx={{ fontWeight: 600, fontSize: "0.75rem" }}>Produit</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                          Qté
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                          Prix unitaire
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 600, fontSize: "0.75rem" }}>
                          Total
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(commandeDetails.lignes || commandeDetails.items || []).map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                              {ligne.produit_nom || ligne.produit}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                              {ligne.quantite || 1}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontSize: "0.8125rem" }}>
                              {ligne.prix_unitaire || ligne.prix || 0} CFA
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: "0.8125rem" }}>
                              {ligne.total_ligne || (ligne.quantite || 1) * (ligne.prix || 0)} CFA
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>
          ) : (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" sx={{ color: T.muted }}>
                Impossible de charger les détails
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── MODAL INSCRIPTION RELOOKING ────────────────────── */}
      <Dialog
        open={inscriptionDetailOpen}
        onClose={handleCloseInscriptionDetail}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${T.border}`,
            py: 2,
            px: 3,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Détails de l'inscription
          </Typography>
          <IconButton onClick={handleCloseInscriptionDetail} size="small">
            <Cancel sx={{ color: T.muted, fontSize: 20 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingInscriptionDetails ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress size={28} sx={{ color: T.accent }} />
            </Box>
          ) : selectedInscription ? (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ textAlign: "center" }}>
                <Avatar
                  sx={{
                    width: 72,
                    height: 72,
                    mx: "auto",
                    bgcolor: alpha(T.accent, 0.1),
                    color: T.accent,
                    fontSize: 28,
                    fontWeight: 600,
                  }}
                >
                  {selectedInscription.prenom?.[0]}
                  {selectedInscription.nom?.[0]}
                </Avatar>
                <Typography variant="h6" sx={{ mt: 1.5, fontWeight: 700 }}>
                  {selectedInscription.prenom} {selectedInscription.nom}
                </Typography>
                <Chip
                  label={typeColors[selectedInscription.type]?.label}
                  size="small"
                  sx={{ mt: 1, fontWeight: 500 }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: T.primary }}>
                  Contact
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Email sx={{ fontSize: 16, color: T.muted }} /> {selectedInscription.email}
                </Typography>
                <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: T.muted }} /> {selectedInscription.telephone}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: T.primary }}>
                  Prestation
                </Typography>
                <Typography variant="body2">
                  <strong>Prestation :</strong> {selectedInscription.rubrique_nom || selectedInscription.atelier_nom}
                </Typography>
                <Typography variant="body2">
                  <strong>Prix :</strong> {selectedInscription.prix} CFA
                </Typography>
                <Typography variant="body2">
                  <strong>Durée :</strong> {selectedInscription.duree}
                </Typography>
                {selectedInscription.message && (
                  <Typography
                    variant="body2"
                    sx={{ mt: 1.5, p: 1.5, bgcolor: "#F8FAFC", borderRadius: 1.5, border: `1px solid ${T.border}` }}
                  >
                    <strong>Message :</strong> {selectedInscription.message}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={1.5}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={async () => {
                    await adminService.updateInscriptionRelooking(selectedInscription.id, {
                      statut: "CONFIRME",
                    });
                    setSnackbar({ open: true, message: "Inscription confirmée", severity: "success" });
                    handleCloseInscriptionDetail();
                    fetchInscriptionsRelooking();
                  }}
                  sx={{
                    bgcolor: T.success,
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { bgcolor: "#047857", boxShadow: "none" },
                  }}
                >
                  Confirmer
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="error"
                  onClick={async () => {
                    await adminService.updateInscriptionRelooking(selectedInscription.id, {
                      statut: "ANNULE",
                    });
                    setSnackbar({ open: true, message: "Inscription annulée", severity: "warning" });
                    handleCloseInscriptionDetail();
                    fetchInscriptionsRelooking();
                  }}
                  sx={{ textTransform: "none", fontWeight: 600 }}
                >
                  Annuler
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Typography>Chargement...</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── DIALOG CONFIRMATION ACTION ─────────────────────── */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>Confirmer l'action</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: T.secondary }}>
            {actionType === "valider" && "Voulez-vous valider cette inscription ?"}
            {actionType === "refuser" && "Voulez-vous refuser cette inscription ?"}
            {actionType === "generer_code" && "Générer un code d'accès pour cette inscription ?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setActionDialogOpen(false)} sx={{ textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            variant="contained"
            onClick={handleActionConfirm}
            disabled={processing}
            sx={{
              textTransform: "none",
              bgcolor: T.accent,
              boxShadow: "none",
              "&:hover": { bgcolor: "#4338CA", boxShadow: "none" },
            }}
          >
            {processing ? <CircularProgress size={18} color="inherit" /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── SNACKBAR ───────────────────────────────────────── */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 1.5, width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Dashboard;