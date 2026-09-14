// src/pages/EvenementInscription.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  People,
  CheckCircle,
  NavigateNext,
  Event,
  ArrowForward,
} from "@mui/icons-material";
import { evenementService } from "../services/evenementService";
import {
  validateTelephone,
  validateEmail,
  validateNom,
  formatTelephone,
} from "../utils/validators";
import heroImage from "../assets/images/tibetia.jpeg";

const EvenementInscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    nombre_places: 1,
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});

  // ─── Chargement de l'événement ──────────────────────────────
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
      console.error("❌ Erreur chargement événement:", err);
      setError("Impossible de charger les informations de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  // ─── Validation d'un champ ──────────────────────────────────
  const validateField = (name, value) => {
    switch (name) {
      case "prenom":
        return validateNom(value, "Le prénom");
      case "nom":
        return validateNom(value, "Le nom");
      case "email":
        return validateEmail(value);
      case "telephone":
        return validateTelephone(value);
      case "nombre_places": {
        if (!value || value < 1) return "Minimum 1 place";
        if (
          evenement?.places_restantes != null &&
          value > evenement.places_restantes
        ) {
          return `Seulement ${evenement.places_restantes} place(s) restante(s)`;
        }
        return "";
      }
      case "message":
        if (value && value.length > 500) {
          return "Maximum 500 caractères.";
        }
        return "";
      default:
        return "";
    }
  };

  // ─── Changement d'un champ ──────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    let cleanValue = value;

    // Nettoyage spécifique
    if (name === "telephone") {
      cleanValue = formatTelephone(value);
    } else if (name === "email") {
      cleanValue = value.trim();
    } else if (name === "nom" || name === "prenom") {
      // Interdire les chiffres
      cleanValue = value.replace(/[0-9]/g, "");
    } else if (name === "nombre_places") {
      cleanValue = Number(value);
    }

    setFormData((prev) => ({ ...prev, [name]: cleanValue }));

    // Effacer l'erreur quand l'utilisateur corrige
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validation en temps réel si le champ a déjà été touché
    if (touched[name]) {
      const err = validateField(name, cleanValue);
      setFormErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // ─── Blur : marquer comme touché + valider ──────────────────
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: err }));
  };

  // ─── Validation globale avant envoi ─────────────────────────
  const validate = () => {
    const fields = [
      "prenom",
      "nom",
      "email",
      "telephone",
      "nombre_places",
      "message",
    ];
    const errors = {};
    const newTouched = {};

    fields.forEach((field) => {
      newTouched[field] = true;
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });

    setTouched(newTouched);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ─── Soumission ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setError(null);

    try {
      // ✅ Normalisation des données avant envoi
      const payload = {
        evenement: Number(id),
        prenom: formData.prenom.trim(),
        nom: formData.nom.trim(),
        email: formData.email.trim().toLowerCase(),
        telephone: formData.telephone.replace(/\D/g, ""),
        nombre_places: Number(formData.nombre_places),
        notes: formData.message.trim(),
      };

      console.log("📦 Payload inscription événement:", payload);

      await evenementService.inscrireEvenement(payload);

      setSuccess(true);
    } catch (err) {
      console.error("=== ERREUR COMPLÈTE ===");
      console.error(err.response?.data || err);
      console.error("=======================");

      // ✅ Gestion propre des erreurs backend (400)
      const data = err.response?.data;

      if (data && typeof data === "object") {
        // Erreurs de validation par champ
        const backendErrors = {};
        Object.keys(data).forEach((key) => {
          const val = data[key];
          backendErrors[key] = Array.isArray(val)
            ? val[0]
            : typeof val === "string"
            ? val
            : JSON.stringify(val);
        });
        setFormErrors((prev) => ({ ...prev, ...backendErrors }));
        setError("Veuillez corriger les erreurs ci-dessous.");
      } else {
        setError(
          data?.error ||
            data?.detail ||
            "Une erreur est survenue lors de l'inscription."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Utilitaires ────────────────────────────────────────────
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

  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ─── LOADING ────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="md">
          <Skeleton width="40%" height={28} sx={{ mb: 4 }} />
          <Skeleton
            variant="rectangular"
            height={140}
            sx={{ borderRadius: 3, mb: 4 }}
          />
          <Skeleton
            variant="rectangular"
            height={480}
            sx={{ borderRadius: 3 }}
          />
        </Container>
      </Box>
    );
  }

  if (error && !evenement) {
    return (
      <Box
        sx={{
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
        }}
      >
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

  const isFull = (evenement.places_restantes ?? 0) === 0;
  const isCancelled = evenement.statut === "ANNULE";
  const isPast = evenement.statut === "TERMINE";
  const canRegister = !isFull && !isCancelled && !isPast;

  // ─── SUCCESS ────────────────────────────────────────────────
  if (success) {
    return (
      <Box
        sx={{
          bgcolor: "#F8FAFC",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          py: 10,
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              textAlign: "center",
              borderRadius: 3,
              border: "1px solid #E2E8F0",
              bgcolor: "#fff",
            }}
          >
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: "50%",
                bgcolor: "#ECFDF5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 3,
              }}
            >
              <CheckCircle sx={{ fontSize: 36, color: "#059669" }} />
            </Box>

            <Typography
              sx={{
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "#0F172A",
                mb: 1.5,
              }}
            >
              Inscription confirmée
            </Typography>

            <Typography sx={{ color: "#64748B", mb: 4, lineHeight: 1.7 }}>
              Votre place pour <strong>{evenement.titre}</strong> est bien
              réservée.
              <br />
              Vous allez recevoir un email de confirmation.
            </Typography>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate("/evenements")}
                endIcon={<ArrowForward />}
                sx={{
                  bgcolor: "#0F172A",
                  color: "#fff",
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3.5,
                  py: 1.3,
                  fontWeight: 600,
                  "&:hover": { bgcolor: "#1E293B" },
                }}
              >
                Voir les événements
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{
                  borderColor: "#CBD5E1",
                  color: "#475569",
                  borderRadius: 2,
                  textTransform: "none",
                  px: 3.5,
                  py: 1.3,
                }}
              >
                Accueil
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", pb: 10 }}>
      <Container maxWidth="md" sx={{ pt: { xs: 3, md: 5 } }}>
        {/* Breadcrumbs + Retour */}
        <Box sx={{ mb: 4 }}>
          <Breadcrumbs
            separator={<NavigateNext sx={{ fontSize: 14, color: "#94A3B8" }} />}
            sx={{ mb: 2 }}
          >
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#64748B",
                fontSize: "0.82rem",
              }}
            >
              Accueil
            </Link>
            <Link
              to="/evenements"
              style={{
                textDecoration: "none",
                color: "#64748B",
                fontSize: "0.82rem",
              }}
            >
              Événements
            </Link>
            <Link
              to={`/evenements/${id}`}
              style={{
                textDecoration: "none",
                color: "#64748B",
                fontSize: "0.82rem",
              }}
            >
              {evenement.titre}
            </Link>
            <Typography
              sx={{ color: "#0F172A", fontWeight: 500, fontSize: "0.82rem" }}
            >
              Inscription
            </Typography>
          </Breadcrumbs>

          <Button
            startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
            onClick={() => navigate(`/evenements/${id}`)}
            sx={{
              color: "#64748B",
              textTransform: "none",
              fontSize: "0.875rem",
              px: 0,
              "&:hover": { bgcolor: "transparent", color: "#0F172A" },
            }}
          >
            Retour à l'événement
          </Button>
        </Box>

        {/* Titre */}
        <Typography
          sx={{
            fontSize: { xs: "1.7rem", md: "2rem" },
            fontWeight: 600,
            color: "#0F172A",
            mb: 1,
            letterSpacing: -0.4,
          }}
        >
          Inscription
        </Typography>
        <Typography sx={{ color: "#64748B", mb: 5, fontSize: "1.05rem" }}>
          Complétez vos informations pour réserver votre place.
        </Typography>

        {!canRegister && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
            {isFull && "Désolé, cet événement est complet."}
            {isCancelled && "Cet événement a été annulé."}
            {isPast && "Cet événement est terminé."}
          </Alert>
        )}

        {/* ─── BANDEAU RÉSUMÉ ÉVÉNEMENT ───────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            mb: 4,
            bgcolor: "#fff",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: 180 },
              height: { xs: 160, sm: "auto" },
              minHeight: { sm: 160 },
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src={evenement.image_url || heroImage}
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
          </Box>

          <Box
            sx={{
              p: 3,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.15rem",
                fontWeight: 600,
                color: "#0F172A",
                mb: 2,
                lineHeight: 1.35,
              }}
            >
              {evenement.titre}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: "0.875rem", color: "#475569" }}>
                  {formatDate(evenement.date_debut)}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: "0.875rem", color: "#475569" }}>
                  {evenement.lieu || "Lieu à confirmer"}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <People sx={{ fontSize: 16, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: "0.875rem", color: "#475569" }}>
                  {evenement.places_restantes ?? 0} place
                  {(evenement.places_restantes ?? 0) > 1 ? "s" : ""} restante
                  {(evenement.places_restantes ?? 0) > 1 ? "s" : ""}
                </Typography>
              </Box>
            </Box>

            <Typography
              sx={{
                mt: 2,
                fontSize: "1.15rem",
                fontWeight: 700,
                color: "#0F172A",
              }}
            >
              {formatPrice(evenement.prix)}
            </Typography>
          </Box>
        </Paper>

        {/* ─── FORMULAIRE ─────────────────────────────────────── */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4.5 },
            borderRadius: 3,
            border: "1px solid #E2E8F0",
            bgcolor: "#fff",
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 3.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2.5}>
              {/* Prénom */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Prénom *"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.prenom}
                  helperText={formErrors.prenom || " "}
                  disabled={!canRegister || submitting}
                  inputProps={{ maxLength: 50 }}
                  autoComplete="given-name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              </Grid>

              {/* Nom */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nom *"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.nom}
                  helperText={formErrors.nom || " "}
                  disabled={!canRegister || submitting}
                  inputProps={{ maxLength: 50 }}
                  autoComplete="family-name"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              </Grid>

              {/* Email */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.email}
                  helperText={formErrors.email || " "}
                  disabled={!canRegister || submitting}
                  inputProps={{ maxLength: 254 }}
                  autoComplete="email"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              </Grid>

              {/* Téléphone */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Téléphone *"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => {
                    const allowed = [
                      "Backspace",
                      "Delete",
                      "Tab",
                      "ArrowLeft",
                      "ArrowRight",
                      "Home",
                      "End",
                    ];
                    if (
                      !/^\d$/.test(e.key) &&
                      !allowed.includes(e.key) &&
                      !e.ctrlKey &&
                      !e.metaKey
                    ) {
                      e.preventDefault();
                    }
                  }}
                  error={!!formErrors.telephone}
                  helperText={formErrors.telephone || "Format : 07 09 87 14 79"}
                  disabled={!canRegister || submitting}
                  inputProps={{
                    inputMode: "tel",
                    maxLength: 14,
                  }}
                  autoComplete="tel"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              </Grid>

              {/* Nombre de places */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth error={!!formErrors.nombre_places}>
                  <InputLabel id="places-label">Nombre de places</InputLabel>
                  <Select
                    labelId="places-label"
                    name="nombre_places"
                    value={formData.nombre_places}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Nombre de places"
                    disabled={!canRegister || submitting}
                    sx={{
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <MenuItem
                        key={n}
                        value={n}
                        disabled={
                          evenement.places_restantes != null &&
                          n > evenement.places_restantes
                        }
                      >
                        {n} place{n > 1 ? "s" : ""}
                      </MenuItem>
                    ))}
                  </Select>
                  {formErrors.nombre_places && (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ mt: 0.6, ml: 1.5 }}
                    >
                      {formErrors.nombre_places}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Message */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Message (optionnel)"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!formErrors.message}
                  helperText={
                    formErrors.message ||
                    `${formData.message.length}/500 caractères`
                  }
                  multiline
                  rows={3}
                  disabled={!canRegister || submitting}
                  placeholder="Une question ou une information particulière ?"
                  inputProps={{ maxLength: 500 }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      bgcolor: "#F8FAFC",
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Total */}
            {evenement.prix > 0 && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 4,
                  mb: 1,
                  py: 2,
                  px: 2.5,
                  bgcolor: "#F1F5F9",
                  borderRadius: 2,
                }}
              >
                <Typography sx={{ color: "#475569", fontSize: "0.95rem" }}>
                  Total ({formData.nombre_places} place
                  {formData.nombre_places > 1 ? "s" : ""})
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.2rem", color: "#0F172A" }}
                >
                  {formatPrice(evenement.prix * formData.nombre_places)}
                </Typography>
              </Box>
            )}

            <Box sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!canRegister || submitting}
                startIcon={
                  submitting ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Event />
                  )
                }
                endIcon={!submitting && canRegister ? <ArrowForward /> : null}
                sx={{
                  bgcolor: canRegister ? "#0F172A" : "#E2E8F0",
                  color: canRegister ? "#fff" : "#94A3B8",
                  borderRadius: 2,
                  py: 1.7,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "1rem",
                  "&:hover": {
                    bgcolor: canRegister ? "#1E293B" : "#E2E8F0",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#E2E8F0",
                    color: "#94A3B8",
                  },
                }}
              >
                {submitting
                  ? "Inscription en cours..."
                  : evenement.prix > 0
                  ? "Confirmer et payer"
                  : "Confirmer mon inscription"}
              </Button>

              <Typography
                sx={{
                  color: "#94A3B8",
                  fontSize: "0.78rem",
                  textAlign: "center",
                  mt: 2.5,
                }}
              >
                En vous inscrivant, vous acceptez nos conditions générales.
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default EvenementInscription;