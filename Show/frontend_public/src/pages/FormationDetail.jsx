// src/pages/FormationDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  Paper,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Avatar,
  alpha,
  Fade,
  Grow,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircle,
  Payment,
  Person,
  Email,
  Phone,
  CalendarToday,
  AccessTime,
  AttachMoney,
  PlayArrow,
  LiveTv,
  Replay,
  EventNote,
  CreditCard,
  PhoneAndroid,
  QrCode,
  Star,
  School,
  Timer,
  MenuBook,
  Lock,
} from "@mui/icons-material";
import { formationService } from "../services/formationService";
import { paiementService } from "../services/paiementService";
import QRCodePaiement from "../components/QRCodePaiement";
import PaiementCarte from "../components/PaiementCarte";
import heroImage from "../assets/images/tibetia.jpeg";
import madameTImage from "../assets/images/tibetia.jpeg";

// ─────────────────────────────────────────────────────────────
const T = {
  bg: "#F8F7F4",
  surface: "#FFFFFF",
  dark: "#1A1A1A",
  darkSoft: "#2C2C2C",
  textPrimary: "#1A1A1A",
  textSecondary: "#5C5C5C",
  textMuted: "#8A8A8A",
  border: "#EAEAEA",
  accent: "#C9A84C",
  accentSoft: "rgba(201, 168, 76, 0.12)",
  accentHover: "#B8943A",
  danger: "#B91C1C",
  success: "#059669",
  warning: "#D97706",
};

const PAIEMENT_ICONS = {
  WAVE: <QrCode sx={{ fontSize: 24 }} />,
  ORANGE_MONEY: <PhoneAndroid sx={{ fontSize: 24 }} />,
  MOOV_MONEY: <PhoneAndroid sx={{ fontSize: 24 }} />,
  MTN_MONEY: <PhoneAndroid sx={{ fontSize: 24 }} />,
  CARTE_BANCAIRE: <CreditCard sx={{ fontSize: 24 }} />,
};

const formatDuree = (duree) => {
  if (!duree) return "À définir";
  const str = String(duree).trim();
  if (/^\d+$/.test(str)) {
    const n = parseInt(str, 10);
    return n > 1 ? `${n} heures` : `${n} heure`;
  }
  return str;
};

const formatPrix = (prix) =>
  `${Number(prix || 0).toLocaleString("fr-FR")} CFA`;

const FormationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formation, setFormation] = useState(null);
  const [moyensPaiement, setMoyensPaiement] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingInscription, setLoadingInscription] = useState(false);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    notes: "",
  });
  const [formErrors, setFormErrors] = useState({});

  const [activeStep, setActiveStep] = useState(0);
  const [inscriptionId, setInscriptionId] = useState(null);
  const [codeAcces, setCodeAcces] = useState(null);
  const [paiementEffectue, setPaiementEffectue] = useState(false);

  const [moyenPaiementSelected, setMoyenPaiementSelected] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processingPaiement, setProcessingPaiement] = useState(false);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const formationData = await formationService.getFormationById(parseInt(id));
        setFormation(formationData);
      } catch (err) {
        console.error("❌ Erreur chargement formation:", err);
        setError("Impossible de charger les données de la formation");
        setLoading(false);
        return;
      }

      try {
        const moyensList = await paiementService.getMoyensPaiement();
        setMoyensPaiement(Array.isArray(moyensList) ? moyensList : []);
      } catch (errMoyens) {
        console.error("❌ Erreur moyens de paiement:", errMoyens);
        setMoyensPaiement([]);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) errors.prenom = "Le prénom est requis";
    if (!formData.email.trim()) errors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = "Email invalide";
    if (!formData.telephone.trim()) errors.telephone = "Le téléphone est requis";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInscription = async () => {
    if (!validateForm()) return;
    setLoadingInscription(true);

    try {
      const clientData = {
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
      };

      const response = await formationService.inscrire(
        parseInt(id),
        clientData,
        formData.notes || ""
      );

      const newInscriptionId = response.id || response.data?.id;
      setInscriptionId(newInscriptionId);
      setActiveStep(1);
      setSnackbarMessage("Inscription enregistrée ! Choisissez votre moyen de paiement.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      let errorMessage = "Erreur lors de l'inscription";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      else if (err.response?.data) {
        const errors = err.response.data;
        const firstKey = Object.keys(errors)[0];
        if (firstKey) {
          const firstError = errors[firstKey];
          if (Array.isArray(firstError)) errorMessage = firstError[0];
          else if (typeof firstError === "string") errorMessage = firstError;
        }
      }
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoadingInscription(false);
    }
  };

  const handlePaiement = async () => {
    if (!moyenPaiementSelected) {
      setSnackbarMessage("Veuillez sélectionner un moyen de paiement");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }
    setConfirmDialogOpen(true);
  };

  const handleConfirmerPaiement = async () => {
    setConfirmDialogOpen(false);
    setProcessingPaiement(true);

    try {
      const transactionData = {
        inscriptionId: inscriptionId,
        moyenPaiement: parseInt(moyenPaiementSelected),
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        notes: formData.notes || "",
      };

      await formationService.creerTransaction(transactionData);

      setPaiementEffectue(true);
      setActiveStep(2);
      setSnackbarMessage(
        "Paiement enregistré ! Votre inscription est en attente de validation."
      );
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      console.error("❌ Erreur paiement:", err.response?.data || err);
      setSnackbarMessage(err.response?.data?.error || "Erreur lors du paiement");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setProcessingPaiement(false);
    }
  };

  const handlePaiementConfirme = (data) => {
    setPaiementEffectue(true);
    setActiveStep(2);
    setSnackbarMessage("Paiement effectué ! En attente de validation admin.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleGoToLive = () => {
    if (!formation) return;
    const code = codeAcces?.code_acces || codeAcces?.code;
    if (!code || code === "EN_ATTENTE") {
      setSnackbarMessage(
        "Votre code d'accès sera envoyé après validation par l'administrateur."
      );
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
      return;
    }

    sessionStorage.setItem(
      "formation_access",
      JSON.stringify({
        formation: {
          id: formation.id,
          titre: formation.titre,
          video_url: formation.video_url,
          replay_url: formation.replay_url,
          image: formation.image,
        },
        code_acces: code,
        client: {
          email: formData.email,
          nom: formData.nom,
          prenom: formData.prenom,
        },
        timestamp: Date.now(),
      })
    );

    navigate(`/formation/${formation.id}/live`);
  };

  const getStatutChip = (formation) => {
    if (formation.est_live) {
      return (
        <Chip
          icon={<LiveTv sx={{ fontSize: 15, color: "#fff !important" }} />}
          label="EN DIRECT"
          sx={{
            bgcolor: T.danger,
            color: "#fff",
            fontWeight: 700,
            height: 30,
            borderRadius: 1.5,
            fontSize: "0.72rem",
            letterSpacing: 0.5,
          }}
        />
      );
    }
    if (formation.est_replay) {
      return (
        <Chip
          icon={<Replay sx={{ fontSize: 15 }} />}
          label="REPLAY"
          sx={{
            bgcolor: T.dark,
            color: "#fff",
            fontWeight: 700,
            height: 30,
            borderRadius: 1.5,
            fontSize: "0.72rem",
          }}
        />
      );
    }
    return (
      <Chip
        icon={<EventNote sx={{ fontSize: 15 }} />}
        label="PROGRAMMÉ"
        sx={{
          bgcolor: alpha("#fff", 0.15),
          color: "#fff",
          fontWeight: 700,
          height: 30,
          borderRadius: 1.5,
          backdropFilter: "blur(8px)",
          fontSize: "0.72rem",
        }}
      />
    );
  };

  const isCarteBancaire = () => {
    const moyen = moyensPaiement.find(
      (m) => m.id === parseInt(moyenPaiementSelected)
    );
    return moyen?.type === "CARTE_BANCAIRE";
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          bgcolor: T.bg,
        }}
      >
        <CircularProgress sx={{ color: T.accent }} thickness={4} size={48} />
      </Box>
    );
  }

  if (error || !formation) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: "100vh", py: 12 }}>
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 2.5, mb: 3 }}>
            {error || "Formation non trouvée"}
          </Alert>
          <Button
            component={Link}
            to="/"
            startIcon={<ArrowBack />}
            sx={{
              color: T.textPrimary,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Retour à l'accueil
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh" }}>
      {/* ─── HERO ─────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 280, md: 380 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={
            formation.image
              ? `${import.meta.env.VITE_MEDIA_URL}${formation.image}`
              : heroImage
          }
          alt={formation.titre}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 25%",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to top, ${alpha(T.dark, 0.88)} 0%, ${alpha(
              T.dark,
              0.45
            )} 50%, ${alpha(T.dark, 0.2)} 100%)`,
          }}
        />

        {/* Avatar Madame T */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 18, md: 28 },
            right: { xs: 18, md: 40 },
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Avatar
            src={madameTImage}
            alt="Madame T"
            sx={{
              width: { xs: 68, md: 92 },
              height: { xs: 68, md: 92 },
              border: `3px solid ${T.accent}`,
              boxShadow: "0 8px 28px rgba(0,0,0,0.3)",
              "& img": {
                objectFit: "cover",
                objectPosition: "center 20%",
              },
            }}
          />
          <Chip
            icon={<Star sx={{ fontSize: 13, color: `${T.accent} !important` }} />}
            label="Expert"
            size="small"
            sx={{
              bgcolor: alpha("#fff", 0.95),
              color: T.dark,
              fontWeight: 700,
              fontSize: "0.68rem",
              height: 24,
              borderRadius: 1.5,
            }}
          />
        </Box>

        <Container
          maxWidth="lg"
          sx={{ position: "relative", zIndex: 1, pb: { xs: 4, md: 5 } }}
        >
          <Typography
            sx={{
              color: alpha("#fff", 0.7),
              letterSpacing: 3,
              fontWeight: 500,
              fontSize: "0.72rem",
              mb: 1.5,
              textTransform: "uppercase",
            }}
          >
            Formation
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              color: "#fff",
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: "1.8rem", sm: "2.3rem", md: "2.9rem" },
              lineHeight: 1.15,
              mb: 2.5,
              maxWidth: 680,
              letterSpacing: -0.5,
            }}
          >
            {formation.titre}
          </Typography>
          {getStatutChip(formation)}
        </Container>
      </Box>

      {/* ─── CONTENU ─────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          sx={{
            mb: 4,
            color: T.textMuted,
            textTransform: "none",
            fontWeight: 500,
            px: 0,
            "&:hover": { color: T.textPrimary, bgcolor: "transparent" },
          }}
        >
          Retour
        </Button>

        <Grid container spacing={4}>
          {/* ─── COLONNE GAUCHE ──────────────────────────── */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Grow in timeout={500}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  bgcolor: T.surface,
                  mb: 3,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: T.textPrimary,
                    mb: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    fontSize: "1.15rem",
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  <MenuBook sx={{ color: T.accent, fontSize: 22 }} />
                  Description
                </Typography>
                <Typography
                  sx={{
                    color: T.textSecondary,
                    lineHeight: 1.85,
                    fontSize: "1.02rem",
                  }}
                >
                  {formation.description_detail ||
                    formation.description ||
                    "Aucune description disponible."}
                </Typography>
              </Paper>
            </Grow>

            <Grow in timeout={650}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                  border: `1px solid ${T.border}`,
                  bgcolor: T.surface,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: T.textPrimary,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    fontSize: "1.15rem",
                    fontFamily: '"Playfair Display", serif',
                  }}
                >
                  <Timer sx={{ color: T.accent, fontSize: 22 }} />
                  Informations pratiques
                </Typography>

                <Grid container spacing={2}>
                  {[
                    {
                      icon: <AttachMoney sx={{ fontSize: 22 }} />,
                      label: "Prix",
                      value:
                        formation.prix_formate || formatPrix(formation.prix),
                    },
                    {
                      icon: <AccessTime sx={{ fontSize: 22 }} />,
                      label: "Durée",
                      value: formatDuree(formation.duree),
                    },
                    {
                      icon: <CalendarToday sx={{ fontSize: 22 }} />,
                      label: "Date",
                      value: formation.date_live
                        ? new Date(formation.date_live).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            }
                          )
                        : "Date non définie",
                    },
                    {
                      icon: <AccessTime sx={{ fontSize: 22 }} />,
                      label: "Horaire",
                      value: formation.date_live
                        ? new Date(formation.date_live).toLocaleTimeString(
                            "fr-FR",
                            { hour: "2-digit", minute: "2-digit" }
                          )
                        : "Horaire non défini",
                    },
                  ].map((item, idx) => (
                    <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                      <Box
                        sx={{
                          textAlign: "center",
                          p: 2.2,
                          borderRadius: 2.5,
                          bgcolor: T.bg,
                          border: `1px solid ${T.border}`,
                          height: "100%",
                          transition: "all 0.25s ease",
                          "&:hover": {
                            borderColor: alpha(T.accent, 0.4),
                            bgcolor: alpha(T.accent, 0.04),
                          },
                        }}
                      >
                        <Box sx={{ color: T.accent, mb: 1 }}>{item.icon}</Box>
                        <Typography
                          sx={{
                            color: T.textMuted,
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            mb: 0.5,
                            letterSpacing: 0.5,
                            textTransform: "uppercase",
                          }}
                        >
                          {item.label}
                        </Typography>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            color: T.textPrimary,
                            fontSize: { xs: "0.82rem", md: "0.92rem" },
                            lineHeight: 1.3,
                          }}
                        >
                          {item.value}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grow>
          </Grid>

          {/* ─── COLONNE DROITE (INSCRIPTION) ─────────────── */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: 3,
                border: `1px solid ${T.border}`,
                bgcolor: T.surface,
                position: { md: "sticky" },
                top: 24,
                boxShadow: `0 12px 40px -12px ${alpha(T.dark, 0.08)}`,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: T.textPrimary,
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  fontSize: "1.15rem",
                  fontFamily: '"Playfair Display", serif',
                }}
              >
                {paiementEffectue ? (
                  <CheckCircle sx={{ color: T.success }} />
                ) : (
                  <School sx={{ color: T.accent }} />
                )}
                {paiementEffectue
                  ? "Inscription enregistrée"
                  : "Inscription"}
              </Typography>

              {!paiementEffectue ? (
                <>
                  {activeStep === 0 && (
                    <Box>
                      <Typography
                        sx={{
                          color: T.textSecondary,
                          mb: 2.5,
                          fontSize: "0.9rem",
                          lineHeight: 1.6,
                        }}
                      >
                        Remplissez le formulaire pour vous inscrire à cette
                        formation.
                      </Typography>

                      {["nom", "prenom"].map((field) => (
                        <TextField
                          key={field}
                          fullWidth
                          size="small"
                          label={field === "nom" ? "Nom *" : "Prénom *"}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          error={!!formErrors[field]}
                          helperText={formErrors[field]}
                          sx={{
                            mb: 2,
                            "& .MuiOutlinedInput-root": {
                              borderRadius: 2,
                              bgcolor: T.bg,
                              "& fieldset": { borderColor: T.border },
                              "&:hover fieldset": {
                                borderColor: alpha(T.accent, 0.5),
                              },
                              "&.Mui-focused fieldset": {
                                borderColor: T.accent,
                              },
                            },
                          }}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <Person
                                    sx={{ color: T.textMuted, fontSize: 18 }}
                                  />
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      ))}

                      <TextField
                        fullWidth
                        size="small"
                        label="Email *"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={!!formErrors.email}
                        helperText={formErrors.email}
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: T.bg,
                            "& fieldset": { borderColor: T.border },
                            "&:hover fieldset": {
                              borderColor: alpha(T.accent, 0.5),
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: T.accent,
                            },
                          },
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Email
                                  sx={{ color: T.textMuted, fontSize: 18 }}
                                />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="Téléphone *"
                        name="telephone"
                        value={formData.telephone}
                        onChange={handleChange}
                        error={!!formErrors.telephone}
                        helperText={formErrors.telephone}
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: T.bg,
                            "& fieldset": { borderColor: T.border },
                            "&:hover fieldset": {
                              borderColor: alpha(T.accent, 0.5),
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: T.accent,
                            },
                          },
                        }}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <Phone
                                  sx={{ color: T.textMuted, fontSize: 18 }}
                                />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />

                      <TextField
                        fullWidth
                        size="small"
                        label="Message (optionnel)"
                        name="notes"
                        multiline
                        rows={2}
                        value={formData.notes}
                        onChange={handleChange}
                        sx={{
                          mb: 3,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: T.bg,
                            "& fieldset": { borderColor: T.border },
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleInscription}
                        disabled={loadingInscription}
                        sx={{
                          bgcolor: T.dark,
                          borderRadius: 2.5,
                          py: 1.6,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "0.95rem",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: T.darkSoft,
                            boxShadow: `0 8px 24px ${alpha(T.dark, 0.2)}`,
                          },
                          "&.Mui-disabled": {
                            bgcolor: T.border,
                            color: T.textMuted,
                          },
                        }}
                        startIcon={
                          loadingInscription ? (
                            <CircularProgress
                              size={18}
                              sx={{ color: "#fff" }}
                            />
                          ) : (
                            <Person />
                          )
                        }
                      >
                        {loadingInscription ? "Inscription..." : "S'inscrire"}
                      </Button>
                    </Box>
                  )}

                  {activeStep === 1 && (
                    <Box>
                      <Alert
                        severity="info"
                        sx={{
                          mb: 2.5,
                          borderRadius: 2,
                          bgcolor: alpha(T.accent, 0.08),
                          border: `1px solid ${alpha(T.accent, 0.25)}`,
                          color: T.textPrimary,
                        }}
                      >
                        Choisissez votre moyen de paiement.
                      </Alert>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 1.2,
                          mb: 3,
                        }}
                      >
                        {moyensPaiement.length > 0 ? (
                          moyensPaiement.map((m) => {
                            const isSelected =
                              moyenPaiementSelected === m.id.toString();
                            return (
                              <Box
                                key={m.id}
                                onClick={() =>
                                  setMoyenPaiementSelected(m.id.toString())
                                }
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1.7,
                                  borderRadius: 2.5,
                                  border: isSelected
                                    ? `2px solid ${T.accent}`
                                    : `1px solid ${T.border}`,
                                  bgcolor: isSelected
                                    ? T.accentSoft
                                    : T.bg,
                                  cursor: "pointer",
                                  transition: "all 0.25s ease",
                                  "&:hover": {
                                    borderColor: alpha(T.accent, 0.6),
                                  },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: 2,
                                    bgcolor: isSelected
                                      ? T.accent
                                      : T.border,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isSelected
                                      ? T.dark
                                      : T.textMuted,
                                    transition: "all 0.25s",
                                  }}
                                >
                                  {PAIEMENT_ICONS[m.type] || <Payment />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography
                                    sx={{
                                      fontWeight: 600,
                                      fontSize: "0.92rem",
                                      color: T.textPrimary,
                                    }}
                                  >
                                    {m.nom}
                                  </Typography>
                                  <Typography
                                    sx={{
                                      color: T.textMuted,
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {m.type}
                                  </Typography>
                                </Box>
                                {isSelected && (
                                  <CheckCircle
                                    sx={{ color: T.accent, fontSize: 22 }}
                                  />
                                )}
                              </Box>
                            );
                          })
                        ) : (
                          <Alert severity="warning" sx={{ borderRadius: 2 }}>
                            Aucun moyen de paiement disponible.
                            <Typography
                              component="span"
                              sx={{
                                fontSize: "0.8rem",
                                mt: 0.5,
                                display: "block",
                              }}
                            >
                              Contactez l'administrateur pour finaliser votre
                              inscription.
                            </Typography>
                          </Alert>
                        )}
                      </Box>

                      {moyenPaiementSelected && (
                        <Box sx={{ mt: 1, mb: 2 }}>
                          {isCarteBancaire() ? (
                            <PaiementCarte
                              montant={formation.prix}
                              inscriptionId={inscriptionId}
                              onPaiementConfirme={handlePaiementConfirme}
                            />
                          ) : (
                            <QRCodePaiement
                              montant={formation.prix}
                              moyenPaiementId={parseInt(moyenPaiementSelected)}
                              inscriptionId={inscriptionId}
                              onPaiementConfirme={handlePaiementConfirme}
                            />
                          )}
                        </Box>
                      )}

                      <Paper
                        elevation={0}
                        sx={{
                          p: 2.2,
                          bgcolor: T.bg,
                          borderRadius: 2.5,
                          border: `1px solid ${T.border}`,
                          mt: 2,
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
                            sx={{ color: T.textSecondary, fontSize: "0.9rem" }}
                          >
                            Montant
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: T.textPrimary,
                              fontSize: "1.2rem",
                              fontFamily: '"Playfair Display", serif',
                            }}
                          >
                            {formation.prix_formate ||
                              formatPrix(formation.prix)}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </>
              ) : (
                <Box>
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2.5,
                      borderRadius: 2,
                      bgcolor: alpha("#3B82F6", 0.08),
                      border: "1px solid #BFDBFE",
                    }}
                  >
                    Votre inscription est enregistrée. Un administrateur va
                    valider votre paiement et vous recevrez votre code d'accès
                    par email.
                  </Alert>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3.5,
                      textAlign: "center",
                      borderRadius: 2.5,
                      border: `1px solid ${T.border}`,
                      bgcolor: T.bg,
                    }}
                  >
                    <Typography
                      sx={{
                        color: T.textMuted,
                        fontSize: "0.8rem",
                        mb: 1.5,
                      }}
                    >
                      Statut
                    </Typography>
                    <Chip
                      label="En attente de validation"
                      sx={{
                        bgcolor: alpha(T.warning, 0.12),
                        color: T.warning,
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        height: 34,
                        px: 2,
                        borderRadius: 2,
                      }}
                    />
                    <Typography
                      sx={{
                        color: T.textMuted,
                        fontSize: "0.78rem",
                        mt: 2.5,
                        lineHeight: 1.5,
                      }}
                    >
                      Vous serez notifié dès que le paiement est validé.
                    </Typography>
                  </Paper>

                  <Button
                    variant="contained"
                    fullWidth
                    disabled
                    sx={{
                      mt: 2.5,
                      bgcolor: T.border,
                      color: T.textMuted,
                      borderRadius: 2.5,
                      py: 1.6,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.95rem",
                    }}
                    startIcon={<Lock />}
                  >
                    En attente de validation
                  </Button>

                  <Typography
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 1.75,
                      color: T.textMuted,
                      fontSize: "0.75rem",
                    }}
                  >
                    <Lock
                      sx={{
                        fontSize: 14,
                        verticalAlign: "middle",
                        mr: 0.5,
                      }}
                    />
                    Accès activé après validation par l'administrateur
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ─── DIALOG CONFIRMATION ──────────────────────────── */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3, border: `1px solid ${T.border}` },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 600,
            color: T.textPrimary,
            fontFamily: '"Playfair Display", serif',
          }}
        >
          Confirmation de paiement
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: T.textSecondary }}>
            Vous allez payer{" "}
            <strong style={{ color: T.textPrimary }}>
              {formation.prix_formate || formatPrix(formation.prix)}
            </strong>{" "}
            pour :
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              mt: 2,
              bgcolor: T.bg,
              borderRadius: 2.5,
              border: `1px solid ${T.border}`,
            }}
          >
            <Typography
              sx={{
                fontWeight: 600,
                color: T.textPrimary,
                fontFamily: '"Playfair Display", serif',
              }}
            >
              « {formation.titre} »
            </Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setConfirmDialogOpen(false)}
            sx={{ color: T.textMuted, textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirmerPaiement}
            variant="contained"
            disabled={processingPaiement}
            sx={{
              bgcolor: T.dark,
              textTransform: "none",
              borderRadius: 2,
              px: 3.5,
              fontWeight: 600,
              "&:hover": { bgcolor: T.darkSoft },
            }}
          >
            {processingPaiement ? "Traitement..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── SNACKBAR ─────────────────────────────────────── */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          sx={{ borderRadius: 2.5 }}
          onClose={() => setSnackbarOpen(false)}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationDetail;