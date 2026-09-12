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

const COACH_IMAGE =
  "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&h=400&fit=crop&q=80";

const PAIEMENT_ICONS = {
  WAVE: <QrCode sx={{ fontSize: 26 }} />,
  ORANGE_MONEY: <PhoneAndroid sx={{ fontSize: 26 }} />,
  MOOV_MONEY: <PhoneAndroid sx={{ fontSize: 26 }} />,
  MTN_MONEY: <PhoneAndroid sx={{ fontSize: 26 }} />,
  CARTE_BANCAIRE: <CreditCard sx={{ fontSize: 26 }} />,
};

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
      try {
        setLoading(true);
        const [formationData, moyensData] = await Promise.all([
          formationService.getFormationById(parseInt(id)),
          paiementService.getMoyensPaiement(),
        ]);

        setFormation(formationData);
        const moyensList = Array.isArray(moyensData) ? moyensData : moyensData.results || [];
        setMoyensPaiement(moyensList);
        setError(null);
      } catch (err) {
        console.error("Erreur:", err);
        setError("Impossible de charger les données");
      } finally {
        setLoading(false);
      }
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
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email invalide";
    }
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

      setInscriptionId(response.id);
      setActiveStep(1);
      setSnackbarMessage("Inscription enregistrée ! Choisissez votre moyen de paiement.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (err) {
      let errorMessage = "Erreur lors de l'inscription";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data) {
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

      setTimeout(() => {
        setCodeAcces({
          code_acces: "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
          date_expiration: new Date(Date.now() + 86400000).toISOString(),
        });
        setPaiementEffectue(true);
        setActiveStep(2);
        setProcessingPaiement(false);
        setSnackbarMessage("Paiement effectué ! Code d'accès généré.");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);
      }, 2000);
    } catch (err) {
      setProcessingPaiement(false);
      setSnackbarMessage("Erreur lors du paiement");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handlePaiementConfirme = (data) => {
    setPaiementEffectue(true);
    setActiveStep(2);
    setCodeAcces({
      code_acces: "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase(),
      date_expiration: new Date(Date.now() + 86400000).toISOString(),
    });
    setSnackbarMessage("Paiement effectué ! Code d'accès généré.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
  };

  const handleGoToLive = () => {
    if (!formation || !codeAcces) {
      setSnackbarMessage("Code d'accès non disponible");
      setSnackbarSeverity("error");
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
        code_acces: codeAcces.code_acces,
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
          icon={<LiveTv sx={{ fontSize: 16, color: "#fff" }} />}
          label="EN DIRECT"
          sx={{
            bgcolor: "#EF4444",
            color: "#fff",
            fontWeight: 600,
            height: 30,
            borderRadius: 1.5,
          }}
        />
      );
    }
    if (formation.est_replay) {
      return (
        <Chip
          icon={<Replay sx={{ fontSize: 16 }} />}
          label="REPLAY"
          sx={{
            bgcolor: "#0F172A",
            color: "#fff",
            fontWeight: 600,
            height: 30,
            borderRadius: 1.5,
          }}
        />
      );
    }
    return (
      <Chip
        icon={<EventNote sx={{ fontSize: 16 }} />}
        label="PROGRAMMÉ"
        sx={{
          bgcolor: "rgba(255,255,255,0.15)",
          color: "#fff",
          fontWeight: 600,
          height: 30,
          borderRadius: 1.5,
          backdropFilter: "blur(8px)",
        }}
      />
    );
  };

  const isCarteBancaire = () => {
    const moyen = moyensPaiement.find((m) => m.id === parseInt(moyenPaiementSelected));
    return moyen?.type === "CARTE_BANCAIRE";
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh", bgcolor: "#F8FAFC" }}>
        <CircularProgress sx={{ color: "#0F172A" }} thickness={4} size={48} />
      </Box>
    );
  }

  if (error || !formation) {
    return (
      <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", py: 10 }}>
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 2, mb: 3 }}>
            {error || "Formation non trouvée"}
          </Alert>
          <Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ color: "#0F172A" }}>
            Retour à l'accueil
          </Button>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* ─── HEADER ───────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 260, md: 340 },
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
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0.4) 50%, rgba(15,23,42,0.2) 100%)",
          }}
        />

        {/* Coach */}
        <Box
          sx={{
            position: "absolute",
            top: { xs: 16, md: 28 },
            right: { xs: 16, md: 40 },
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0.8,
          }}
        >
          <Avatar
            src={COACH_IMAGE}
            sx={{
              width: { xs: 64, md: 88 },
              height: { xs: 64, md: 88 },
              border: "3px solid rgba(255,255,255,0.9)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
            }}
          />
          <Chip
            icon={<Star sx={{ fontSize: 14 }} />}
            label="Expert"
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.95)",
              color: "#0F172A",
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 24,
            }}
          />
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pb: { xs: 3.5, md: 4.5 } }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              letterSpacing: 2.5,
              fontWeight: 500,
              fontSize: "0.75rem",
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
              fontSize: { xs: "1.7rem", sm: "2.2rem", md: "2.7rem" },
              lineHeight: 1.2,
              mb: 2,
              maxWidth: 680,
            }}
          >
            {formation.titre}
          </Typography>
          {getStatutChip(formation)}
        </Container>
      </Box>

      {/* ─── CONTENU ──────────────────────────────────────────── */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Button
          component={Link}
          to="/"
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          sx={{
            mb: 4,
            color: "#64748B",
            textTransform: "none",
            fontWeight: 500,
            px: 0,
            "&:hover": { color: "#0F172A", bgcolor: "transparent" },
          }}
        >
          Retour
        </Button>

        <Grid container spacing={4}>
          {/* ─── COLONNE GAUCHE ──────────────────────────────── */}
          <Grid item xs={12} md={7}>
            {/* Description */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#0F172A",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  fontSize: "1.15rem",
                }}
              >
                <MenuBook sx={{ color: "#0F172A", fontSize: 22 }} />
                Description
              </Typography>
              <Typography sx={{ color: "#475569", lineHeight: 1.8, fontSize: "1rem" }}>
                {formation.description_detail || formation.description || "Aucune description disponible."}
              </Typography>
            </Paper>

            {/* Infos pratiques */}
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#0F172A",
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  fontSize: "1.15rem",
                }}
              >
                <Timer sx={{ color: "#0F172A", fontSize: 22 }} />
                Informations pratiques
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    icon: <AttachMoney sx={{ fontSize: 22 }} />,
                    label: "Prix",
                    value: formation.prix_formate || `${formation.prix} CFA`,
                  },
                  {
                    icon: <AccessTime sx={{ fontSize: 22 }} />,
                    label: "Durée",
                    value: formation.duree || "3h",
                  },
                  {
                    icon: <CalendarToday sx={{ fontSize: 22 }} />,
                    label: "Date",
                    value: formation.date_live
                      ? new Date(formation.date_live).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })
                      : "Date non définie",
                  },
                  {
                    icon: <AccessTime sx={{ fontSize: 22 }} />,
                    label: "Horaire",
                    value: formation.date_live
                      ? new Date(formation.date_live).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Horaire non défini",
                  },
                ].map((item, idx) => (
                  <Grid item xs={6} sm={3} key={idx}>
                    <Box
                      sx={{
                        textAlign: "center",
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        height: "100%",
                      }}
                    >
                      <Box sx={{ color: "#0F172A", mb: 1 }}>{item.icon}</Box>
                      <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", fontWeight: 500, mb: 0.4 }}>
                        {item.label}
                      </Typography>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#0F172A",
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
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
          </Grid>

          {/* ─── COLONNE DROITE (sticky) ─────────────────────── */}
          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 3.5 },
                borderRadius: 3,
                border: "1px solid #E2E8F0",
                bgcolor: "#fff",
                position: { md: "sticky" },
                top: 24,
                boxShadow: "0 8px 30px rgba(15,23,42,0.04)",
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "#0F172A",
                  mb: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  fontSize: "1.15rem",
                }}
              >
                {paiementEffectue ? (
                  <CheckCircle sx={{ color: "#059669" }} />
                ) : (
                  <School sx={{ color: "#0F172A" }} />
                )}
                {paiementEffectue ? "Accès autorisé" : "Inscription"}
              </Typography>

              {!paiementEffectue ? (
                <>
                  {/* Étape 0 : Formulaire */}
                  {activeStep === 0 && (
                    <Box>
                      <Typography sx={{ color: "#64748B", mb: 2.5, fontSize: "0.9rem" }}>
                        Remplissez le formulaire pour vous inscrire.
                      </Typography>

                      <TextField
                        fullWidth
                        size="small"
                        label="Nom *"
                        name="nom"
                        value={formData.nom}
                        onChange={handleChange}
                        error={!!formErrors.nom}
                        helperText={formErrors.nom}
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "#F8FAFC",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: "#94A3B8", fontSize: 18 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Prénom *"
                        name="prenom"
                        value={formData.prenom}
                        onChange={handleChange}
                        error={!!formErrors.prenom}
                        helperText={formErrors.prenom}
                        sx={{
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 2,
                            bgcolor: "#F8FAFC",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person sx={{ color: "#94A3B8", fontSize: 18 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
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
                            bgcolor: "#F8FAFC",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email sx={{ color: "#94A3B8", fontSize: 18 }} />
                            </InputAdornment>
                          ),
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
                            bgcolor: "#F8FAFC",
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone sx={{ color: "#94A3B8", fontSize: 18 }} />
                            </InputAdornment>
                          ),
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
                            bgcolor: "#F8FAFC",
                          },
                        }}
                      />

                      <Button
                        variant="contained"
                        fullWidth
                        onClick={handleInscription}
                        disabled={loadingInscription}
                        sx={{
                          bgcolor: "#0F172A",
                          borderRadius: 2,
                          py: 1.5,
                          fontWeight: 600,
                          textTransform: "none",
                          fontSize: "0.95rem",
                          "&:hover": { bgcolor: "#1E293B" },
                          "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" },
                        }}
                        startIcon={
                          loadingInscription ? (
                            <CircularProgress size={18} sx={{ color: "#fff" }} />
                          ) : (
                            <Person />
                          )
                        }
                      >
                        {loadingInscription ? "Inscription..." : "S'inscrire"}
                      </Button>
                    </Box>
                  )}

                  {/* Étape 1 : Paiement */}
                  {activeStep === 1 && (
                    <Box>
                      <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2 }}>
                        Choisissez votre moyen de paiement.
                      </Alert>

                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2, mb: 3 }}>
                        {Array.isArray(moyensPaiement) && moyensPaiement.length > 0 ? (
                          moyensPaiement.map((m) => {
                            const isSelected = moyenPaiementSelected === m.id.toString();
                            return (
                              <Box
                                key={m.id}
                                onClick={() => setMoyenPaiementSelected(m.id.toString())}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  p: 1.6,
                                  borderRadius: 2,
                                  border: isSelected ? "2px solid #0F172A" : "1px solid #E2E8F0",
                                  bgcolor: isSelected ? "#F1F5F9" : "#F8FAFC",
                                  cursor: "pointer",
                                  transition: "all 0.2s",
                                  "&:hover": { borderColor: "#94A3B8" },
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: isSelected ? "#0F172A" : "#E2E8F0",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: isSelected ? "#fff" : "#64748B",
                                  }}
                                >
                                  {PAIEMENT_ICONS[m.type] || <Payment />}
                                </Box>
                                <Box sx={{ flex: 1 }}>
                                  <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", color: "#0F172A" }}>
                                    {m.nom}
                                  </Typography>
                                  <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                                    {m.type}
                                  </Typography>
                                </Box>
                                {isSelected && <CheckCircle sx={{ color: "#0F172A", fontSize: 20 }} />}
                              </Box>
                            );
                          })
                        ) : (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Aucun moyen de paiement disponible.
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
                          p: 2,
                          bgcolor: "#F1F5F9",
                          borderRadius: 2,
                          border: "1px solid #E2E8F0",
                          mt: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Montant</Typography>
                          <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.15rem" }}>
                            {formation.prix_formate || `${formation.prix} CFA`}
                          </Typography>
                        </Box>
                      </Paper>
                    </Box>
                  )}
                </>
              ) : (
                /* ─── ACCÈS AUTORISÉ ─────────────────────────── */
                <Box>
                  <Alert
                    severity="success"
                    sx={{ mb: 2.5, borderRadius: 2, bgcolor: "#ECFDF5", border: "1px solid #A7F3D0" }}
                  >
                    Félicitations ! Vous avez accès à la formation.
                  </Alert>

                  <Paper
                    elevation={0}
                    sx={{
                      p: 3,
                      textAlign: "center",
                      borderRadius: 2.5,
                      border: "1px solid #E2E8F0",
                      bgcolor: "#F8FAFC",
                    }}
                  >
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem", mb: 1 }}>
                      Code d'accès
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#0F172A",
                        fontFamily: "monospace",
                        letterSpacing: 3,
                        fontSize: "1.4rem",
                        py: 1,
                      }}
                    >
                      {codeAcces?.code_acces || "ACCES-XXXX"}
                    </Typography>
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>
                      Valable 24h
                    </Typography>
                  </Paper>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGoToLive}
                    sx={{
                      mt: 2.5,
                      bgcolor: "#EF4444",
                      borderRadius: 2,
                      py: 1.5,
                      fontWeight: 600,
                      textTransform: "none",
                      fontSize: "0.95rem",
                      "&:hover": { bgcolor: "#DC2626" },
                    }}
                    startIcon={<PlayArrow />}
                  >
                    {formation.est_live ? "Rejoindre le live" : "Accéder au replay"}
                  </Button>

                  <Typography
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 1.5,
                      color: "#94A3B8",
                      fontSize: "0.75rem",
                    }}
                  >
                    <Lock sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
                    Accès sécurisé avec votre code
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ─── DIALOG CONFIRMATION ──────────────────────────────── */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, color: "#0F172A" }}>Confirmation de paiement</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "#475569" }}>
            Vous allez payer{" "}
            <strong style={{ color: "#0F172A" }}>
              {formation.prix_formate || `${formation.prix} CFA`}
            </strong>{" "}
            pour :
          </Typography>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              mt: 2,
              bgcolor: "#F8FAFC",
              borderRadius: 2,
              border: "1px solid #E2E8F0",
            }}
          >
            <Typography sx={{ fontWeight: 600, color: "#0F172A" }}>« {formation.titre} »</Typography>
          </Paper>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConfirmDialogOpen(false)} sx={{ color: "#64748B", textTransform: "none" }}>
            Annuler
          </Button>
          <Button
            onClick={handleConfirmerPaiement}
            variant="contained"
            disabled={processingPaiement}
            sx={{
              bgcolor: "#0F172A",
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              "&:hover": { bgcolor: "#1E293B" },
            }}
          >
            {processingPaiement ? "Traitement..." : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── SNACKBAR ─────────────────────────────────────────── */}
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ borderRadius: 2 }} onClose={() => setSnackbarOpen(false)}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationDetail;