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
  Divider,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Skeleton,
} from "@mui/material";
import {
  ArrowBack,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  CheckCircle,
  NavigateNext,
  Event,
  Person,
  Email,
  Phone,
} from "@mui/icons-material";
import { evenementService } from "../services/evenementService";
import heroImage from "../assets/images/tibetia.jpeg";

const EvenementInscription = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    prenom: "",
    nom: "",
    email: "",
    telephone: "",
    nombre_places: 1,
    message: "",
  });

  const [formErrors, setFormErrors] = useState({});

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
      setError("Impossible de charger les informations de l'événement.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.prenom.trim()) errors.prenom = "Le prénom est requis";
    if (!formData.nom.trim()) errors.nom = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    if (!formData.telephone.trim()) {
      errors.telephone = "Le téléphone est requis";
    }
    if (formData.nombre_places < 1) {
      errors.nombre_places = "Minimum 1 place";
    }
    if (
      evenement?.places_restantes &&
      formData.nombre_places > evenement.places_restantes
    ) {
      errors.nombre_places = `Seulement ${evenement.places_restantes} place(s) restante(s)`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  setSubmitting(true);
  setError(null);

  try {
    await evenementService.inscrireEvenement({
      evenement: id,
      prenom: formData.prenom,
      nom: formData.nom,
      email: formData.email,
      telephone: formData.telephone,
      notes: formData.message || "",
    });

    setSuccess(true);
  } catch (err) {
    // ✅ Affiche l'erreur exacte dans la console
    console.log("=== ERREUR COMPLÈTE ===");
    console.log(err.response?.data);
    console.log("=======================");

    setError(
      err.response?.data?.error ||
      err.response?.data?.detail ||
      JSON.stringify(err.response?.data) ||
      "Une erreur est survenue lors de l'inscription."
    );
  } finally {
    setSubmitting(false);
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

  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", py: 6 }}>
        <Container maxWidth="md">
          <Skeleton width="40%" height={24} sx={{ mb: 3 }} />
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1, mb: 2 }} />
              <Skeleton width="80%" height={28} sx={{ mb: 1 }} />
              <Skeleton width="60%" height={18} />
            </Grid>
            <Grid item xs={12} md={7}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 1 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error && !evenement) {
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

  // ─────────────────────────────────────────────────────────────
  // SUCCESS STATE
  // ─────────────────────────────────────────────────────────────
  if (success) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", py: 10 }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 2,
              border: "1px solid #EAEAEA",
            }}
          >
            <CheckCircle sx={{ fontSize: 56, color: "#059669", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontSize: "1.7rem",
                color: "#111",
                mb: 1.5,
              }}
            >
              Inscription confirmée !
            </Typography>
            <Typography sx={{ color: "#666", mb: 3, lineHeight: 1.6 }}>
              Votre inscription à <strong>{evenement.titre}</strong> a bien été enregistrée.
              <br />
              Un email de confirmation vous a été envoyé.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/evenements")}
                sx={{
                  backgroundColor: "#111",
                  color: "#fff",
                  borderRadius: 1,
                  textTransform: "none",
                  px: 3,
                  boxShadow: "none",
                  "&:hover": { backgroundColor: "#333", boxShadow: "none" },
                }}
              >
                Voir les événements
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate("/")}
                sx={{
                  borderColor: "#CCC",
                  color: "#333",
                  borderRadius: 1,
                  textTransform: "none",
                  px: 3,
                }}
              >
                Retour à l'accueil
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", pb: 8 }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 16, color: "#999" }} />}
          sx={{ mb: 2.5 }}
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
          <Link
            to={`/evenements/${id}`}
            style={{ textDecoration: "none", color: "#777", fontSize: "0.85rem" }}
          >
            {evenement.titre}
          </Link>
          <Typography sx={{ color: "#111", fontWeight: 500, fontSize: "0.85rem" }}>
            Inscription
          </Typography>
        </Breadcrumbs>

        {/* Retour */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          onClick={() => navigate(`/evenements/${id}`)}
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
          Retour à l'événement
        </Button>

        <Typography
          sx={{
            fontFamily: '"Playfair Display", serif',
            fontSize: { xs: "1.7rem", md: "2rem" },
            color: "#111",
            mb: 4,
            fontWeight: 400,
          }}
        >
          Inscription à l'événement
        </Typography>

        {!canRegister && (
          <Alert severity="warning" sx={{ mb: 4, borderRadius: 1 }}>
            {isFull && "Désolé, cet événement est complet."}
            {isCancelled && "Cet événement a été annulé."}
            {isPast && "Cet événement est terminé."}
          </Alert>
        )}

        <Grid container spacing={4}>
          {/* ─── RÉSUMÉ DE L'ÉVÉNEMENT ─────────────────────────── */}
          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 0,
                borderRadius: 2,
                border: "1px solid #EAEAEA",
                overflow: "hidden",
                position: { md: "sticky" },
                top: 100,
              }}
            >
              <Box
                sx={{
                  height: 160,
                  backgroundColor: "#F4F4F4",
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={evenement.image_url || heroImage}
                  alt={evenement.titre}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </Box>

              <Box sx={{ p: 2.5 }}>
                <Typography
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: "1.15rem",
                    color: "#111",
                    mb: 2,
                    lineHeight: 1.3,
                  }}
                >
                  {evenement.titre}
                </Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CalendarToday sx={{ fontSize: 16, color: "#999" }} />
                    <Typography sx={{ color: "#555", fontSize: "0.85rem" }}>
                      {formatDate(evenement.date_debut)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: "#999" }} />
                    <Typography sx={{ color: "#555", fontSize: "0.85rem" }}>
                      {evenement.lieu || "Lieu à confirmer"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <People sx={{ fontSize: 16, color: "#999" }} />
                    <Typography sx={{ color: "#555", fontSize: "0.85rem" }}>
                      {evenement.places_restantes ?? 0} place
                      {(evenement.places_restantes ?? 0) > 1 ? "s" : ""} restante
                      {(evenement.places_restantes ?? 0) > 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <AttachMoney sx={{ fontSize: 16, color: "#999" }} />
                    <Typography sx={{ color: "#111", fontWeight: 600, fontSize: "0.95rem" }}>
                      {formatPrice(evenement.prix)}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* ─── FORMULAIRE ────────────────────────────────────── */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: 2,
                border: "1px solid #EAEAEA",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#111",
                  fontSize: "1.1rem",
                  mb: 3,
                }}
              >
                Vos informations
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={2.5}>
                  {/* Prénom */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Prénom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      error={!!formErrors.prenom}
                      helperText={formErrors.prenom}
                      disabled={!canRegister || submitting}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <Person sx={{ color: "#AAA", fontSize: 18, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    />
                  </Grid>

                  {/* Nom */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      error={!!formErrors.nom}
                      helperText={formErrors.nom}
                      disabled={!canRegister || submitting}
                      size="small"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    />
                  </Grid>

                  {/* Email */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!formErrors.email}
                      helperText={formErrors.email}
                      disabled={!canRegister || submitting}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <Email sx={{ color: "#AAA", fontSize: 18, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    />
                  </Grid>

                  {/* Téléphone */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="telephone"
                      value={formData.telephone}
                      onChange={handleChange}
                      error={!!formErrors.telephone}
                      helperText={formErrors.telephone}
                      disabled={!canRegister || submitting}
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <Phone sx={{ color: "#AAA", fontSize: 18, mr: 1 }} />
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    />
                  </Grid>

                  {/* Nombre de places */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small" error={!!formErrors.nombre_places}>
                      <InputLabel>Nombre de places</InputLabel>
                      <Select
                        name="nombre_places"
                        value={formData.nombre_places}
                        onChange={handleChange}
                        label="Nombre de places"
                        disabled={!canRegister || submitting}
                        sx={{
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <MenuItem
                            key={n}
                            value={n}
                            disabled={
                              evenement.places_restantes && n > evenement.places_restantes
                            }
                          >
                            {n} place{n > 1 ? "s" : ""}
                          </MenuItem>
                        ))}
                      </Select>
                      {formErrors.nombre_places && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {formErrors.nombre_places}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Message */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Message (optionnel)"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      disabled={!canRegister || submitting}
                      size="small"
                      placeholder="Une question ou une information particulière ?"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 1,
                          backgroundColor: "#FAFAFA",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3.5 }} />

                {/* Récapitulatif prix */}
                {evenement.prix > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 3,
                      p: 2,
                      backgroundColor: "#F8F8F8",
                      borderRadius: 1,
                    }}
                  >
                    <Typography sx={{ color: "#555", fontSize: "0.9rem" }}>
                      Total ({formData.nombre_places} place
                      {formData.nombre_places > 1 ? "s" : ""})
                    </Typography>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: "#111" }}>
                      {formatPrice(evenement.prix * formData.nombre_places)}
                    </Typography>
                  </Box>
                )}

                {/* Bouton submit */}
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={!canRegister || submitting}
                  startIcon={
                    submitting ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <Event sx={{ fontSize: 18 }} />
                    )
                  }
                  sx={{
                    backgroundColor: canRegister ? "#111" : "#E5E5E5",
                    color: canRegister ? "#fff" : "#999",
                    borderRadius: 1,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
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
                  {submitting
                    ? "Inscription en cours..."
                    : evenement.prix > 0
                    ? "Confirmer et payer"
                    : "Confirmer mon inscription"}
                </Button>

                <Typography
                  sx={{
                    color: "#999",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    mt: 2,
                  }}
                >
                  En vous inscrivant, vous acceptez nos conditions générales.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default EvenementInscription;