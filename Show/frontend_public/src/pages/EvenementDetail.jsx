// src/pages/EvenementDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Grid,
  CircularProgress,
  Alert,
  Divider,
  Breadcrumbs,
  Skeleton,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  People,
  Share,
  CheckCircle,
  AccessTime,
  NavigateNext,
  Verified,
  Payment,
  LocalActivity,
  ArrowForward,
} from "@mui/icons-material";
import { evenementService } from "../services/evenementService";
import heroImage from "../assets/images/tibetia.jpeg";

const EvenementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering] = useState(false);

  useEffect(() => {
    fetchEvenement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvenement = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await evenementService.getEvenementById(id);
      setEvenement(data);
    } catch (err) {
      setError("Impossible de charger les détails de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX : helper qui retourne toujours une chaîne valide
  const formatDate = (dateString) => {
    if (!dateString) return "Date à confirmer";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Date à confirmer";
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // ✅ FIX : version courte sécurisée pour split
  const formatDateShort = (dateString) => {
    const full = formatDate(dateString);
    const parts = full.split(" ");
    return parts.length >= 3 ? parts.slice(0, 3).join(" ") : full;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatutConfig = (statut) => {
    const map = {
      A_VENIR: { label: "À venir", color: "#2563EB", bg: "rgba(37, 99, 235, 0.12)" },
      EN_COURS: { label: "En cours", color: "#DC2626", bg: "rgba(220, 38, 38, 0.12)" },
      TERMINE: { label: "Terminé", color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },
      ANNULE: { label: "Annulé", color: "#6B7280", bg: "rgba(107, 114, 128, 0.12)" },
    };
    return map[statut] || { label: statut, color: "#6B7280", bg: "rgba(107, 114, 128, 0.12)" };
  };

  // ─── LOADING ────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
        <Skeleton variant="rectangular" height={480} sx={{ bgcolor: "#E2E8F0" }} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={4}>
            {/* ✅ FIX : Grid v2 syntax (size au lieu de item/xs/md) */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Skeleton width="40%" height={20} sx={{ mb: 2 }} />
              <Skeleton width="80%" height={48} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={120} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Skeleton variant="rectangular" height={280} sx={{ borderRadius: 3 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", display: "flex", alignItems: "center" }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchEvenement}>
                Réessayer
              </Button>
            }
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!evenement) return null;

  const statutConfig = getStatutConfig(evenement.statut);
  const isFull = (evenement.places_restantes ?? 0) === 0;
  const isCancelled = evenement.statut === "ANNULE";
  const isPast = evenement.statut === "TERMINE";
  const canRegister = !isFull && !isCancelled && !isPast;
  const imageUrl = evenement.image_url || heroImage;

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", color: "#0F172A", pb: { xs: 14, md: 8 } }}>
      {/* ─── HERO IMMERSIF ─────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 380, md: 500 },
          overflow: "hidden",
        }}
      >
        {/* ✅ FIX : <img> natif au lieu de Box component="img" pour un onError fiable */}
        <Box
          component="img"
          src={imageUrl}
          alt={evenement.titre}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = heroImage;
          }}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />

        {/* Gradient overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,23,42,0.75) 0%, rgba(15,23,42,0.35) 45%, rgba(15,23,42,0.15) 100%)",
          }}
        />

        {/* Contenu du hero */}
        <Container
          maxWidth="lg"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            pb: { xs: 4, md: 5 },
          }}
        >
          <Breadcrumbs
            separator={<NavigateNext sx={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }} />}
            sx={{ mb: 2 }}
          >
            <Link
              to="/"
              style={{ textDecoration: "none", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
            >
              Accueil
            </Link>
            <Link
              to="/evenements"
              style={{ textDecoration: "none", color: "rgba(255,255,255,0.7)", fontSize: "0.8rem" }}
            >
              Événements
            </Link>
            <Typography sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 500 }}>
              {evenement.titre}
            </Typography>
          </Breadcrumbs>

          <Chip
            label={statutConfig.label}
            size="small"
            sx={{
              mb: 2,
              bgcolor: "rgba(255,255,255,0.18)",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
              borderRadius: 1.5,
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.25)",
            }}
          />

          {evenement.theme && (
            <Typography
              sx={{
                color: "rgba(255,255,255,0.8)",
                fontWeight: 500,
                letterSpacing: 1.2,
                fontSize: "0.75rem",
                textTransform: "uppercase",
                mb: 1,
              }}
            >
              {evenement.theme}
            </Typography>
          )}

          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 500,
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.15,
              color: "#fff",
              maxWidth: 720,
              mb: 1,
              textShadow: "0 2px 12px rgba(0,0,0,0.3)",
            }}
          >
            {evenement.titre}
          </Typography>
        </Container>
      </Box>

      {/* ─── CONTENU PRINCIPAL ─────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ mt: { xs: -3, md: -5 }, position: "relative", zIndex: 2 }}>
        <Grid container spacing={4}>
          {/* Colonne gauche */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Infos rapides */}
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: 3,
                p: 3,
                mb: 4,
                border: "1px solid #E2E8F0",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
              }}
            >
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: "rgba(37,99,235,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#2563EB",
                        flexShrink: 0,
                      }}
                    >
                      <CalendarToday sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#64748B", fontSize: "0.75rem", mb: 0.3 }}>
                        Date & heure
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0F172A" }}>
                        {formatDate(evenement.date_debut)}
                      </Typography>
                      {formatTime(evenement.date_debut) && (
                        <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                          {formatTime(evenement.date_debut)}
                          {evenement.date_fin && ` – ${formatTime(evenement.date_fin)}`}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: "rgba(5,150,105,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#059669",
                        flexShrink: 0,
                      }}
                    >
                      <LocationOn sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#64748B", fontSize: "0.75rem", mb: 0.3 }}>
                        Lieu
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0F172A" }}>
                        {evenement.lieu || "Lieu à confirmer"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: "rgba(245,158,11,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#D97706",
                        flexShrink: 0,
                      }}
                    >
                      <People sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#64748B", fontSize: "0.75rem", mb: 0.3 }}>
                        Places disponibles
                      </Typography>
                      {/* ✅ FIX : suppression du <Typography> imbriqué dans <Typography> */}
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0F172A" }}>
                        {evenement.places_restantes ?? 0}
                        {evenement.capacite_max ? ` / ${evenement.capacite_max}` : ""}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        bgcolor: "rgba(124,58,237,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#7C3AED",
                        flexShrink: 0,
                      }}
                    >
                      <AccessTime sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography sx={{ color: "#64748B", fontSize: "0.75rem", mb: 0.3 }}>
                        Durée
                      </Typography>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.95rem", color: "#0F172A" }}>
                        {evenement.duree || "À définir"}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>

            {/* Description */}
            <Box sx={{ mb: 5 }}>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: "1.5rem",
                  fontWeight: 500,
                  mb: 2.5,
                  color: "#0F172A",
                }}
              >
                À propos
              </Typography>
              <Typography
                sx={{
                  color: "#475569",
                  lineHeight: 1.8,
                  fontSize: "1.05rem",
                  whiteSpace: "pre-line",
                }}
              >
                {evenement.description || "Aucune description disponible pour cet événement."}
              </Typography>
            </Box>

            {/* Description longue */}
            {evenement.description_longue && (
              <Box sx={{ mb: 5 }}>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "1.5rem",
                    fontWeight: 500,
                    mb: 2.5,
                    color: "#0F172A",
                  }}
                >
                  En détail
                </Typography>
                <Typography
                  sx={{
                    color: "#475569",
                    lineHeight: 1.85,
                    fontSize: "1.05rem",
                    whiteSpace: "pre-line",
                  }}
                >
                  {evenement.description_longue}
                </Typography>
              </Box>
            )}

            {/* Avantages */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" },
                gap: 2,
              }}
            >
              {[
                { icon: <CheckCircle />, title: "Confirmation", subtitle: "Immédiate" },
                { icon: <Verified />, title: "Places limitées", subtitle: "Réservez vite" },
                { icon: <Payment />, title: "Paiement", subtitle: "Sécurisé" },
                { icon: <LocalActivity />, title: "Accès", subtitle: "Garanti" },
              ].map((item, i) => (
                <Paper
                  key={i}
                  elevation={0}
                  sx={{
                    bgcolor: "#FFFFFF",
                    borderRadius: 2.5,
                    p: 2.2,
                    border: "1px solid #E2E8F0",
                    textAlign: "center",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      borderColor: "#93C5FD",
                      boxShadow: "0 8px 20px rgba(37,99,235,0.08)",
                      transform: "translateY(-3px)",
                    },
                  }}
                >
                  <Box sx={{ color: "#2563EB", mb: 1 }}>{item.icon}</Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", mb: 0.3, color: "#0F172A" }}>
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: "#64748B", fontSize: "0.75rem" }}>
                    {item.subtitle}
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Grid>

          {/* ─── STICKY BOOKING CARD (Desktop) ─────────────────── */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ position: { md: "sticky" }, top: 100 }}>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#FFFFFF",
                  borderRadius: 3,
                  p: 3.5,
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
                }}
              >
                <Typography
                  sx={{
                    fontSize: "1.9rem",
                    fontWeight: 700,
                    mb: 0.5,
                    color: "#0F172A",
                  }}
                >
                  {formatPrice(evenement.prix)}
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 3 }}>
                  par personne
                </Typography>

                <Divider sx={{ borderColor: "#E2E8F0", mb: 3 }} />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Date</Typography>
                    <Typography sx={{ fontWeight: 500, fontSize: "0.9rem", color: "#0F172A" }}>
                      {formatDateShort(evenement.date_debut)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>
                      Places restantes
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: "0.9rem",
                        color: isFull ? "#DC2626" : "#059669",
                      }}
                    >
                      {evenement.places_restantes ?? 0}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  disabled={!canRegister || isRegistering}
                  onClick={() => navigate(`/evenements/${evenement.id}/inscription`)}
                  endIcon={!isRegistering && canRegister ? <ArrowForward /> : null}
                  startIcon={isRegistering ? <CircularProgress size={18} color="inherit" /> : null}
                  sx={{
                    bgcolor: canRegister ? "#2563EB" : "#E2E8F0",
                    color: canRegister ? "#fff" : "#94A3B8",
                    borderRadius: 2,
                    py: 1.7,
                    fontWeight: 600,
                    fontSize: "1rem",
                    textTransform: "none",
                    boxShadow: canRegister ? "0 8px 24px rgba(37,99,235,0.3)" : "none",
                    transition: "all 0.25s",
                    "&:hover": {
                      bgcolor: canRegister ? "#1D4ED8" : "#E2E8F0",
                      boxShadow: canRegister ? "0 12px 28px rgba(37,99,235,0.4)" : "none",
                      transform: canRegister ? "translateY(-1px)" : "none",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#E2E8F0",
                      color: "#94A3B8",
                    },
                  }}
                >
                  {isFull
                    ? "Complet"
                    : isCancelled
                    ? "Événement annulé"
                    : isPast
                    ? "Événement terminé"
                    : "S'inscrire maintenant"}
                </Button>

                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <IconButton
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    sx={{
                      color: "#64748B",
                      "&:hover": { color: "#2563EB", bgcolor: "rgba(37,99,235,0.08)" },
                    }}
                  >
                    <Share fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>

              {/* Bouton retour */}
              <Button
                startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
                onClick={() => navigate(-1)}
                sx={{
                  mt: 2,
                  color: "#64748B",
                  textTransform: "none",
                  fontSize: "0.85rem",
                  "&:hover": { color: "#0F172A", bgcolor: "transparent" },
                }}
              >
                Retour aux événements
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ─── BARRE STICKY MOBILE ──────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid #E2E8F0",
          p: 2,
          zIndex: 100,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#0F172A" }}>
              {formatPrice(evenement.prix)}
            </Typography>
            <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>
              {formatDateShort(evenement.date_debut)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            disabled={!canRegister}
            onClick={() => navigate(`/evenements/${evenement.id}/inscription`)}
            sx={{
              bgcolor: canRegister ? "#2563EB" : "#E2E8F0",
              color: canRegister ? "#fff" : "#94A3B8",
              borderRadius: 2,
              px: 3.5,
              py: 1.5,
              fontWeight: 600,
              fontSize: "0.9rem",
              textTransform: "none",
              boxShadow: canRegister ? "0 6px 20px rgba(37,99,235,0.3)" : "none",
              "&:hover": {
                bgcolor: canRegister ? "#1D4ED8" : "#E2E8F0",
              },
            }}
          >
            {isFull ? "Complet" : isCancelled ? "Annulé" : "S'inscrire"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default EvenementDetail;