import { logger } from '../lib/logger';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { adminService } from "../services/adminService";
import {
  Grid, Typography, Box, Card, CardContent, Button, alpha,
  Avatar, Chip, Skeleton, Stack, Divider, Tooltip, IconButton,
  Fade, Zoom,
} from "@mui/material";
import {
  Event, ExitToApp, Storefront, Spa, VideoLibrary,
  ReceiptLong, Refresh, Visibility, PersonAdd, ArrowForward,
  CalendarToday, Email, Phone, Dashboard as DashboardIcon,
} from "@mui/icons-material";

const T = {
  primary: "#0F172A",
  secondary: "#334155",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "#FFFFFF",
  background: "#F8FAFC",
  accent: "#4F46E5",
  accentSoft: "#EEF2FF",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
  shadow: "0 4px 24px -4px rgba(15, 23, 42, 0.08)",
  shadowHover: "0 20px 40px -12px rgba(15, 23, 42, 0.15)",
};

// ─── CARTE DE MODULE PREMIUM ────────────────────────────────
const ActionCard = ({ title, description, icon, color, onClick, delay = 0 }) => (
  <Zoom in timeout={400 + delay}>
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${T.border}`,
        bgcolor: T.surface,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${color}, ${alpha(color, 0.4)})`,
          opacity: 0,
          transition: "opacity 0.3s ease",
        },
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: T.shadowHover,
          borderColor: alpha(color, 0.4),
          "&::before": { opacity: 1 },
          "& .action-icon": {
            bgcolor: color,
            color: "#fff",
            transform: "scale(1.1) rotate(-4deg)",
            boxShadow: `0 8px 20px ${alpha(color, 0.35)}`,
          },
          "& .action-arrow": {
            opacity: 1,
            transform: "translateX(0)",
          },
        },
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3, md: 3.5 },
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minHeight: { xs: 170, md: 200 },
          "&:last-child": { pb: { xs: 3, md: 3.5 } },
        }}
      >
        <Box
          className="action-icon"
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(color, 0.1),
            color: color,
            mb: 2.5,
            transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontWeight: 700,
            color: T.primary,
            fontSize: "1.05rem",
            mb: 0.8,
            letterSpacing: -0.3,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: T.muted,
            fontSize: "0.85rem",
            lineHeight: 1.55,
            flexGrow: 1,
          }}
        >
          {description}
        </Typography>

        <Box
          className="action-arrow"
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: color,
            fontSize: "0.8rem",
            fontWeight: 600,
            opacity: 0,
            transform: "translateX(-8px)",
            transition: "all 0.3s ease",
          }}
        >
          Accéder <ArrowForward sx={{ fontSize: 16 }} />
        </Box>
      </CardContent>
    </Card>
  </Zoom>
);

// ─── STATUT CHIP ────────────────────────────────────────────
const getStatutConfig = (statut) => {
  const configs = {
    EN_ATTENTE: { label: "En attente", color: T.warning, bgcolor: alpha(T.warning, 0.12) },
    PAYEE: { label: "Payée", color: T.success, bgcolor: alpha(T.success, 0.12) },
    INSCRIT: { label: "Inscrit", color: T.success, bgcolor: alpha(T.success, 0.12) },
    PRESENT: { label: "Présent", color: T.success, bgcolor: alpha(T.success, 0.12) },
    ABSENT: { label: "Absent", color: T.danger, bgcolor: alpha(T.danger, 0.12) },
    ANNULEE: { label: "Annulée", color: T.danger, bgcolor: alpha(T.danger, 0.12) },
    REMBOURSEE: { label: "Remboursée", color: T.accent, bgcolor: alpha(T.accent, 0.12) },
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
  type,
}) => {
  const list = Array.isArray(data) ? data : (data?.results ?? []);

  return (
    <Fade in timeout={600}>
      <Box>
        {/* En-tête de section */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2.2,
                bgcolor: alpha(iconColor, 0.12),
                color: iconColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
            <Box>
              <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.05rem", lineHeight: 1.2 }}>
                {title}
              </Typography>
              {!loading && (
                <Typography sx={{ color: T.muted, fontSize: "0.78rem", mt: 0.2 }}>
                  {list.length} récente{list.length > 1 ? "s" : ""}
                </Typography>
              )}
            </Box>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
            onClick={onViewAll}
            sx={{
              textTransform: "none",
              color: T.accent,
              fontWeight: 600,
              fontSize: "0.85rem",
              borderRadius: 2,
              px: 1.5,
              "&:hover": { bgcolor: alpha(T.accent, 0.06) },
            }}
          >
            Voir tout
          </Button>
        </Box>

        {/* Liste */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: `1px solid ${T.border}`,
            bgcolor: T.surface,
            overflow: "hidden",
            boxShadow: T.shadow,
          }}
        >
          {loading ? (
            <Box sx={{ p: 2.5 }}>
              {[1, 2, 3].map((i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  height={72}
                  sx={{ mb: 1.5, borderRadius: 2.5 }}
                />
              ))}
            </Box>
          ) : list.length === 0 ? (
            <Box sx={{ p: 6, textAlign: "center" }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: alpha(T.muted, 0.08),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <PersonAdd sx={{ fontSize: 28, color: "#94A3B8" }} />
              </Box>
              <Typography sx={{ color: T.muted, fontSize: "0.95rem", fontWeight: 500 }}>
                Aucune inscription récente
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: "0.8rem", mt: 0.5 }}>
                Les nouvelles inscriptions apparaîtront ici
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Divider sx={{ borderColor: alpha(T.border, 0.8) }} />}>
              {list.map((item, index) => {
                const client = item.client_details || {};
                const secondaire = type === "evenement" ? item.evenement_details : item.formation_details;
                const config = getStatutConfig(item.statut);

                return (
                  <Box
                    key={item.id || index}
                    sx={{
                      p: 2.2,
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      transition: "background-color 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: alpha(T.accent, 0.03),
                        "& .view-btn": {
                          opacity: 1,
                          color: T.accent,
                        },
                      },
                    }}
                    onClick={() => onViewItem(item)}
                  >
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor: alpha(iconColor, 0.12),
                        color: iconColor,
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        flexShrink: 0,
                      }}
                    >
                      {client.prenom?.[0]}{client.nom?.[0]}
                    </Avatar>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 650,
                          color: T.primary,
                          fontSize: "0.92rem",
                          mb: 0.3,
                          letterSpacing: -0.2,
                        }}
                      >
                        {client.prenom || "Prénom"} {client.nom || "Nom"}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        <Typography
                          sx={{
                            color: T.muted,
                            fontSize: "0.75rem",
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                          }}
                        >
                          <Email sx={{ fontSize: 13 }} />
                          {client.email || "—"}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          color: T.secondary,
                          fontSize: "0.8rem",
                          mt: 0.6,
                          fontWeight: 500,
                        }}
                      >
                        {type === "evenement" ? "📅" : "🎓"}{" "}
                        {secondaire?.titre || (type === "evenement" ? "Événement" : "Formation")}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.7,
                        flexShrink: 0,
                      }}
                    >
                      <Chip
                        label={config.label}
                        size="small"
                        sx={{
                          bgcolor: config.bgcolor,
                          color: config.color,
                          fontWeight: 650,
                          fontSize: "0.7rem",
                          height: 24,
                          borderRadius: 1.5,
                        }}
                      />
                      <Typography
                        sx={{
                          color: T.muted,
                          fontSize: "0.72rem",
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                        }}
                      >
                        <CalendarToday sx={{ fontSize: 11 }} />
                        {item.date_inscription
                          ? new Date(item.date_inscription).toLocaleDateString("fr-FR")
                          : "—"}
                      </Typography>
                    </Box>

                    <Tooltip title="Voir les détails" arrow>
                      <IconButton
                        className="view-btn"
                        size="small"
                        sx={{
                          color: T.muted,
                          opacity: 0.5,
                          transition: "all 0.2s",
                          "&:hover": {
                            bgcolor: alpha(T.accent, 0.1),
                          },
                        }}
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
    </Fade>
  );
};

// ─── DASHBOARD ──────────────────────────────────────────────
const Dashboard = () => {
  const { user, isAdmin, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

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
    if (isAdmin) fetchInscriptions();
  }, [isAdmin]);

  const toArray = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (payload && Array.isArray(payload.results)) return payload.results;
    return [];
  };

  const fetchInscriptions = async () => {
    setLoadingEvenements(true);
    try {
      const data = await adminService.getParticipantsEvenements({ page: 1, page_size: 5 });
      logger.debug?.("📦 participants:", data);
      setInscriptionsEvenements(toArray(data));
    } catch (err) {
      logger.error("❌ Erreur inscriptions événements:", err);
      setInscriptionsEvenements([]);
    } finally {
      setLoadingEvenements(false);
    }

    setLoadingFormations(true);
    try {
      const data = await adminService.getInscriptionsFormations({ page: 1, page_size: 5 });
      logger.debug?.("📦 inscriptions formations:", data);
      setInscriptionsFormations(toArray(data));
    } catch (err) {
      logger.error("❌ Erreur inscriptions formations:", err);
      setInscriptionsFormations([]);
    } finally {
      setLoadingFormations(false);
    }
  };

  if (authLoading) return null;
  if (!isAdmin) return null;

  const actions = [
    {
      title: "Relooking",
      description: "Inscrits, détails et gestion complète",
      icon: <Spa sx={{ fontSize: 26 }} />,
      color: "#DB2777",
      path: "/admin/inscriptions-relooking",
    },
    {
      title: "Commandes",
      description: "Suivi et détails des commandes",
      icon: <ReceiptLong sx={{ fontSize: 26 }} />,
      color: "#D97706",
      path: "/admin/commandes",
    },
    {
      title: "Produits",
      description: "Catalogue et gestion boutique",
      icon: <Storefront sx={{ fontSize: 26 }} />,
      color: "#7C3AED",
      path: "/admin/produits",
    },
    {
      title: "Événements",
      description: "Création et gestion des événements",
      icon: <Event sx={{ fontSize: 26 }} />,
      color: "#2563EB",
      path: "/admin/evenements",
    },
    {
      title: "Formations",
      description: "Formations en ligne & inscriptions",
      icon: <VideoLibrary sx={{ fontSize: 26 }} />,
      color: "#059669",
      path: "/admin/formations",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: T.background,
        width: "100%",
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3.5, md: 5 },
        }}
      >
        {/* ─── HEADER ─────────────────────────────────────────── */}
        <Fade in timeout={400}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 3,
              mb: { xs: 5, md: 6 },
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: T.accentSoft,
                    color: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <DashboardIcon sx={{ fontSize: 22 }} />
                </Box>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: T.primary,
                    fontSize: { xs: "1.5rem", md: "1.7rem" },
                    letterSpacing: -0.6,
                    lineHeight: 1.15,
                  }}
                >
                  Bonjour, {user?.first_name || user?.username || "Admin"}
                </Typography>
              </Box>
              <Typography
                sx={{
                  color: T.muted,
                  fontSize: "0.95rem",
                  ml: { xs: 0, sm: 7 },
                  textTransform: "capitalize",
                }}
              >
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
                size="medium"
                startIcon={<Refresh sx={{ fontSize: 18 }} />}
                onClick={fetchInscriptions}
                sx={{
                  borderColor: T.border,
                  color: T.primary,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  height: 44,
                  px: 2.5,
                  bgcolor: T.surface,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
                size="medium"
                startIcon={<ExitToApp sx={{ fontSize: 18 }} />}
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                sx={{
                  bgcolor: T.danger,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 600,
                  height: 44,
                  px: 2.5,
                  boxShadow: "0 4px 14px rgba(220, 38, 38, 0.25)",
                  "&:hover": {
                    bgcolor: "#B91C1C",
                    boxShadow: "0 6px 18px rgba(220, 38, 38, 0.3)",
                  },
                }}
              >
                Déconnexion
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* ─── MODULES ────────────────────────────────────────── */}
        <Typography
          sx={{
            fontWeight: 700,
            color: T.primary,
            fontSize: "1.15rem",
            mb: 2.5,
            letterSpacing: -0.3,
          }}
        >
          Modules
        </Typography>

        <Grid container spacing={2.5} sx={{ mb: 6 }}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={action.title}>
              <ActionCard
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                onClick={() => navigate(action.path)}
                delay={index * 80}
              />
            </Grid>
          ))}
        </Grid>

        {/* ─── INSCRIPTIONS RÉCENTES ──────────────────────────── */}
        <Typography
          sx={{
            fontWeight: 700,
            color: T.primary,
            fontSize: "1.15rem",
            mb: 3,
            letterSpacing: -0.3,
          }}
        >
          Inscriptions récentes
        </Typography>

        <Grid container spacing={3.5}>
          <Grid item xs={12} lg={6}>
            <InscriptionsSection
              title="Événements"
              icon={<Event sx={{ fontSize: 20 }} />}
              iconColor="#2563EB"
              loading={loadingEvenements}
              data={inscriptionsEvenements}
              type="evenement"
              onViewAll={() => navigate("/admin/participants-evenements")}
              onViewItem={() => navigate(`/admin/participants-evenements`)}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <InscriptionsSection
              title="Formations"
              icon={<VideoLibrary sx={{ fontSize: 20 }} />}
              iconColor="#059669"
              loading={loadingFormations}
              data={inscriptionsFormations}
              type="formation"
              onViewAll={() => navigate("/admin/inscriptions-formations")}
              onViewItem={() => navigate(`/admin/inscriptions-formations`)}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Dashboard;