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
  AttachMoney,
  Share,
  CheckCircle,
  AccessTime,
  Event,
  NavigateNext,
  LocalShipping,
  Verified,
  Payment,
  Security,
} from "@mui/icons-material";
import { evenementService } from "../services/evenementService";
import heroImage from "../assets/images/tibetia.jpeg";

const EvenementDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchEvenement();
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

  const formatDate = (dateString) => {
    if (!dateString) return "Date à confirmer";
    const date = new Date(dateString);
    return isNaN(date)
      ? "Date à confirmer"
      : date.toLocaleDateString("fr-FR", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return isNaN(date)
      ? ""
      : date.toLocaleTimeString("fr-FR", {
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
      A_VENIR: { label: "À venir", color: "#2563EB", bg: "rgba(37, 99, 235, 0.1)" },
      EN_COURS: { label: "En cours", color: "#DC2626", bg: "rgba(220, 38, 38, 0.1)" },
      TERMINE: { label: "Terminé", color: "#059669", bg: "rgba(5, 150, 105, 0.1)" },
      ANNULE: { label: "Annulé", color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" },
    };
    return map[statut] || { label: statut, color: "#6B7280", bg: "rgba(107, 114, 128, 0.1)" };
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={7}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: "16/10", mb: 2 }} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Skeleton width="30%" height={18} sx={{ mb: 2 }} />
              <Skeleton width="90%" height={40} sx={{ mb: 2 }} />
              <Skeleton width="50%" height={24} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={80} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={52} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", py: 10 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchEvenement}>
                Réessayer
              </Button>
            }
            sx={{ borderRadius: 0 }}
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
    <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", pb: { xs: 12, md: 8 } }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 16, color: "#999" }} />}
          sx={{ mb: 3 }}
        >
          <Link to="/" style={{ textDecoration: "none", color: "#777", fontSize: "0.85rem" }}>
            Accueil
          </Link>
          <Link
            to="/evenements"
            style={{ textDecoration: "none", color: "#777", fontSize: "0.85rem" }}
          >
            Événements
          </Link>
          <Typography sx={{ color: "#111", fontWeight: 500, fontSize: "0.85rem" }}>
            {evenement.titre}
          </Typography>
        </Breadcrumbs>

        {/* Bouton retour */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 4,
            color: "#666",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "0.875rem",
            px: 0,
            "&:hover": { backgroundColor: "transparent", color: "#111" },
          }}
        >
          Retour aux événements
        </Button>

        <Grid container spacing={{ xs: 4, md: 6 }}>
          {/* ─── COLONNE IMAGE ─────────────────────────────────── */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: { md: "sticky" }, top: 100 }}>
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "16/10",
                  backgroundColor: "#F5F5F5",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={imageUrl}
                  alt={evenement.titre}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = heroImage;
                  }}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />

                {/* Badge statut */}
                <Chip
                  label={statutConfig.label}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 16,
                    left: 16,
                    backgroundColor: statutConfig.bg,
                    color: statutConfig.color,
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: 28,
                    borderRadius: 0,
                    zIndex: 2,
                  }}
                />
              </Box>
            </Box>
          </Grid>

          {/* ─── COLONNE DÉTAILS ───────────────────────────────── */}
          <Grid item xs={12} md={5}>
            <Box>
              {/* Thème */}
              {evenement.theme && (
                <Typography
                  variant="overline"
                  sx={{
                    color: "#888",
                    fontWeight: 500,
                    letterSpacing: 1.5,
                    fontSize: "0.7rem",
                    display: "block",
                    mb: 1,
                  }}
                >
                  {evenement.theme}
                </Typography>
              )}

              {/* Titre */}
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 400,
                  fontSize: { xs: "1.9rem", md: "2.3rem" },
                  color: "#111",
                  lineHeight: 1.2,
                  mb: 2.5,
                  letterSpacing: -0.3,
                }}
              >
                {evenement.titre}
              </Typography>

              {/* Infos principales */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <CalendarToday sx={{ fontSize: 18, color: "#999" }} />
                  <Box>
                    <Typography sx={{ color: "#111", fontWeight: 500, fontSize: "0.95rem" }}>
                      {formatDate(evenement.date_debut)}
                    </Typography>
                    {formatTime(evenement.date_debut) && (
                      <Typography sx={{ color: "#777", fontSize: "0.85rem" }}>
                        {formatTime(evenement.date_debut)}
                        {evenement.date_fin && ` – ${formatTime(evenement.date_fin)}`}
                      </Typography>
                    )}
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <LocationOn sx={{ fontSize: 18, color: "#999" }} />
                  <Typography sx={{ color: "#111", fontSize: "0.95rem" }}>
                    {evenement.lieu || "Lieu à confirmer"}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <People sx={{ fontSize: 18, color: "#999" }} />
                  <Typography sx={{ color: "#111", fontSize: "0.95rem" }}>
                    {evenement.places_restantes ?? 0} place
                    {(evenement.places_restantes ?? 0) > 1 ? "s" : ""} restante
                    {(evenement.places_restantes ?? 0) > 1 ? "s" : ""}
                    {evenement.capacite_max && (
                      <Typography component="span" sx={{ color: "#888", fontSize: "0.85rem" }}>
                        {" "}
                        / {evenement.capacite_max}
                      </Typography>
                    )}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <AttachMoney sx={{ fontSize: 18, color: "#999" }} />
                  <Typography sx={{ color: "#111", fontWeight: 600, fontSize: "1.05rem" }}>
                    {formatPrice(evenement.prix)}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3, borderColor: "#E5E5E5" }} />

              {/* Description */}
              <Typography
                sx={{
                  color: "#555",
                  lineHeight: 1.75,
                  fontSize: "0.95rem",
                  mb: 4,
                  whiteSpace: "pre-line",
                }}
              >
                {evenement.description || "Aucune description disponible pour cet événement."}
              </Typography>

              {/* Boutons d'action */}
              <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 4 }}>
                <Button
                  variant="contained"
                  disabled={!canRegister || isRegistering}
                  onClick={() => {
                    // Redirige vers la page d'inscription ou ouvre un modal
                    navigate(`/evenements/${evenement.id}/inscription`);
                  }}
                  startIcon={isRegistering ? <CircularProgress size={18} color="inherit" /> : <Event />}
                  sx={{
                    backgroundColor: canRegister ? "#111" : "#E5E5E5",
                    color: canRegister ? "#fff" : "#999",
                    borderRadius: 0,
                    px: 4,
                    py: 1.6,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textTransform: "none",
                    flex: 1,
                    minWidth: 200,
                    boxShadow: "none",
                    "&:hover": {
                      backgroundColor: canRegister ? "#333" : "#E5E5E5",
                      boxShadow: "none",
                    },
                    "&.Mui-disabled": {
                      backgroundColor: "#E5E5E5",
                      color: "#999",
                    },
                  }}
                >
                  {isFull
                    ? "Complet"
                    : isCancelled
                    ? "Événement annulé"
                    : isPast
                    ? "Événement terminé"
                    : "S'inscrire à l'événement"}
                </Button>

                <IconButton
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                  }}
                  sx={{
                    border: "1px solid #DDD",
                    borderRadius: 0,
                    width: 52,
                    height: 52,
                    color: "#666",
                    "&:hover": { backgroundColor: "#F5F5F5", borderColor: "#CCC" },
                  }}
                >
                  <Share />
                </IconButton>
              </Box>

              {/* Infos pratiques */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                  pt: 3,
                  borderTop: "1px solid #E5E5E5",
                }}
              >
                {[
                  {
                    icon: <CheckCircle sx={{ fontSize: 20 }} />,
                    title: "Confirmation",
                    subtitle: "Immédiate",
                  },
                  {
                    icon: <AccessTime sx={{ fontSize: 20 }} />,
                    title: "Durée",
                    subtitle: evenement.duree || "À définir",
                  },
                  {
                    icon: <Verified sx={{ fontSize: 20 }} />,
                    title: "Places limitées",
                    subtitle: "Réservez vite",
                  },
                  {
                    icon: <Payment sx={{ fontSize: 20 }} />,
                    title: "Paiement",
                    subtitle: "Sécurisé",
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
                    <Box sx={{ color: "#111", mt: 0.2 }}>{item.icon}</Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#333",
                          fontSize: "0.8rem",
                          mb: 0.2,
                        }}
                      >
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: "#888", fontSize: "0.75rem" }}>
                        {item.subtitle}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* ─── SECTION DESCRIPTION LONGUE (si besoin) ─────────── */}
        {evenement.description_longue && (
          <Box sx={{ mt: 8 }}>
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "1.5rem",
                color: "#111",
                mb: 3,
              }}
            >
              À propos de cet événement
            </Typography>
            <Typography
              sx={{
                color: "#555",
                lineHeight: 1.8,
                fontSize: "1rem",
                whiteSpace: "pre-line",
              }}
            >
              {evenement.description_longue}
            </Typography>
          </Box>
        )}
      </Container>

      {/* ─── BARRE STICKY MOBILE ──────────────────────────────── */}
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: "#fff",
          borderTop: "1px solid #E5E5E5",
          p: 2,
          zIndex: 100,
          boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "1rem", color: "#111" }}>
              {formatPrice(evenement.prix)}
            </Typography>
            <Typography sx={{ color: "#777", fontSize: "0.8rem" }}>
              {formatDate(evenement.date_debut)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            disabled={!canRegister}
            onClick={() => navigate(`/evenements/${evenement.id}/inscription`)}
            sx={{
              backgroundColor: canRegister ? "#111" : "#E5E5E5",
              color: canRegister ? "#fff" : "#999",
              borderRadius: 0,
              px: 3,
              py: 1.4,
              fontWeight: 600,
              fontSize: "0.875rem",
              textTransform: "none",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: canRegister ? "#333" : "#E5E5E5",
                boxShadow: "none",
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