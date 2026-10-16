// src/pages/Admin/Formations/NouvelleFormation.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Grid, TextField, Button, MenuItem,
  Alert, CircularProgress, Divider, IconButton, InputAdornment,
  FormControlLabel, Switch, LinearProgress, Stack,
} from "@mui/material";
import {
  ArrowBack, CloudUpload, Delete, Save, Cancel, CheckCircle,
  VideoLibrary, AttachMoney, CalendarToday,
  Link as LinkIcon, PlayArrow, Replay, Schedule,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const T = {
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  accent: "#4F46E5",
  success: "#059669",
  danger: "#DC2626",
};

const NouvelleFormation = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    description_detail: "",
    prix: "",
    duree: "",
    statut: "PROGRAMME",
    date_live: "",
    video_url: "",
    replay_url: "",
    est_actif: true,
    ordre: 0,
  });

  const statuts = [
    { value: "PROGRAMME", label: "Programmé", icon: <Schedule sx={{ color: "#3B82F6", fontSize: 18 }} /> },
    { value: "LIVE", label: "En direct", icon: <PlayArrow sx={{ color: "#EF4444", fontSize: 18 }} /> },
    { value: "REPLAY", label: "Replay disponible", icon: <Replay sx={{ color: "#F59E0B", fontSize: 18 }} /> },
    { value: "TERMINE", label: "Terminé", icon: <CheckCircle sx={{ color: "#10B981", fontSize: 18 }} /> },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError({ general: "Le fichier doit être une image" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError({ general: "L'image ne doit pas dépasser 5 Mo" });
      return;
    }

    setImage(file);
    setImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const removeImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImage(null);
    setImagePreview(null);
    const input = document.getElementById("image-formation");
    if (input) input.value = "";
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) errors.titre = "Le titre est requis";
    if (!formData.description.trim()) errors.description = "La description est requise";
    if (!formData.prix || parseFloat(formData.prix) <= 0) errors.prix = "Le prix doit être supérieur à 0";
    if (!formData.duree.trim()) errors.duree = "La durée est requise";
    if (!image) errors.image = "L'image est obligatoire";
    if ((formData.statut === "LIVE" || formData.statut === "PROGRAMME") && !formData.date_live) {
      errors.date_live = "La date du live est requise";
    }
    if (formData.statut === "REPLAY" && !formData.replay_url) {
      errors.replay_url = "L'URL du replay est requise";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    setSubmitting(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("titre", formData.titre);
      formDataToSend.append("description", formData.description);
      if (formData.description_detail) {
        formDataToSend.append("description_detail", formData.description_detail);
      }
      formDataToSend.append("prix", formData.prix);
      formDataToSend.append("duree", formData.duree);
      formDataToSend.append("statut", formData.statut);
      if (formData.date_live) formDataToSend.append("date_live", formData.date_live);
      if (formData.video_url) formDataToSend.append("video_url", formData.video_url);
      if (formData.replay_url) formDataToSend.append("replay_url", formData.replay_url);
      formDataToSend.append("est_actif", formData.est_actif ? "true" : "false");
      formDataToSend.append("ordre", formData.ordre.toString());
      if (image) formDataToSend.append("image", image);

      await adminService.createFormationWithImage(formDataToSend, (progress) =>
        setUploadProgress(progress)
      );

      setSuccess(true);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setTimeout(() => navigate("/admin/formations"), 2000);
    } catch (err) {
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === "object") {
          const messages = Object.entries(backendErrors)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
            .join("\n");
          setError({ general: `Erreur de validation :\n${messages}` });
        } else {
          setError({ general: backendErrors.error || backendErrors.message || "Erreur serveur" });
        }
      } else {
        setError({ general: err.message || "Erreur de connexion au serveur" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (success) {
    return (
      <Box sx={{ bgcolor: T.bg, minHeight: "100vh", py: 8 }}>
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              p: 5,
              textAlign: "center",
              borderRadius: 3,
              border: `1px solid ${T.border}`,
            }}
          >
            <CheckCircle sx={{ fontSize: 72, color: T.success, mb: 2 }} />
            <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.4rem", mb: 1 }}>
              Formation créée avec succès
            </Typography>
            <Typography sx={{ color: T.muted, mb: 3.5 }}>
              La formation a été ajoutée à votre catalogue.
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => navigate("/admin/formations")}
                sx={{
                  bgcolor: T.primary,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
                }}
              >
                Voir les formations
              </Button>
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                sx={{
                  borderColor: T.border,
                  color: T.primary,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                }}
              >
                Ajouter une autre
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/admin/formations")}
            sx={{
              color: T.muted,
              textTransform: "none",
              fontWeight: 500,
              mb: 2,
              px: 0,
              "&:hover": { color: T.primary, bgcolor: "transparent" },
            }}
          >
            Retour à la liste
          </Button>

          <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.5rem", letterSpacing: -0.3 }}>
            Nouvelle formation
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
            Remplissez les informations ci-dessous
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: `1px solid ${T.border}`,
          }}
        >
          {error?.general && (
            <Alert
              severity="error"
              sx={{ mb: 3, borderRadius: 2, whiteSpace: "pre-wrap" }}
              onClose={() => setError(null)}
            >
              {error.general}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Image */}
              <Grid size={{ xs: 12, md: 5 }}>
                <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem", mb: 1.2 }}>
                  Image de couverture <span style={{ color: T.danger }}>*</span>
                </Typography>
                <Box
                  onClick={() => document.getElementById("image-formation").click()}
                  sx={{
                    border: `2px dashed ${error?.image ? T.danger : T.border}`,
                    borderRadius: 2.5,
                    p: 2.5,
                    minHeight: 220,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    cursor: "pointer",
                    bgcolor: T.bg,
                    transition: "all 0.2s",
                    "&:hover": { borderColor: T.accent },
                  }}
                >
                  {imagePreview ? (
                    <Box sx={{ position: "relative", width: "100%", textAlign: "center" }}>
                      <Box
                        component="img"
                        src={imagePreview}
                        alt="Aperçu"
                        sx={{
                          maxWidth: "100%",
                          maxHeight: 180,
                          objectFit: "contain",
                          borderRadius: 2,
                        }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeImage();
                        }}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.6)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                      <Typography sx={{ display: "block", mt: 1, color: T.success, fontSize: "0.75rem" }}>
                        {image.name} ({(image.size / 1024).toFixed(0)} Ko)
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <CloudUpload sx={{ fontSize: 42, color: T.muted, mb: 1 }} />
                      <Typography sx={{ color: T.secondary, fontSize: "0.875rem" }}>
                        Cliquez pour ajouter une image
                      </Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.75rem", mt: 0.5 }}>
                        JPG, PNG, WEBP — max 5 Mo
                      </Typography>
                      {error?.image && (
                        <Typography sx={{ color: T.danger, fontSize: "0.75rem", mt: 1 }}>
                          {error.image}
                        </Typography>
                      )}
                    </>
                  )}
                  <input
                    id="image-formation"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </Box>
              </Grid>

              {/* Statut + Date + Ordre */}
              <Grid size={{ xs: 12, md: 7 }}>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    select
                    label="Statut *"
                    name="statut"
                    value={formData.statut}
                    onChange={handleChange}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  >
                    {statuts.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          {s.icon}
                          <span>{s.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>

                  {(formData.statut === "LIVE" || formData.statut === "PROGRAMME") && (
                    <TextField
                      fullWidth
                      type="datetime-local"
                      label="Date du live"
                      name="date_live"
                      value={formData.date_live}
                      onChange={handleChange}
                      error={!!error?.date_live}
                      helperText={error?.date_live}
                      size="small"
                      slotProps={{
                        inputLabel: { shrink: true },
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarToday sx={{ color: T.muted, fontSize: 18 }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    />
                  )}

                  <TextField
                    fullWidth
                    type="number"
                    label="Ordre d'affichage"
                    name="ordre"
                    value={formData.ordre}
                    onChange={handleChange}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Stack>
              </Grid>

              {/* Titre */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Titre de la formation *"
                  name="titre"
                  value={formData.titre}
                  onChange={handleChange}
                  error={!!error?.titre}
                  helperText={error?.titre}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <VideoLibrary sx={{ color: T.muted, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Description */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description courte *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!error?.description}
                  helperText={error?.description}
                  multiline
                  rows={3}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Description détaillée */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Description détaillée"
                  name="description_detail"
                  value={formData.description_detail}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Programme, objectifs, contenu..."
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Prix & Durée */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Prix (CFA) *"
                  name="prix"
                  type="number"
                  value={formData.prix}
                  onChange={handleChange}
                  error={!!error?.prix}
                  helperText={error?.prix}
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: T.muted, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Durée *"
                  name="duree"
                  value={formData.duree}
                  onChange={handleChange}
                  error={!!error?.duree}
                  helperText={error?.duree}
                  placeholder="ex: 2h30, 1 jour..."
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Schedule sx={{ color: T.muted, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* URL Vidéo */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="URL de la vidéo (Vimeo / YouTube)"
                  name="video_url"
                  value={formData.video_url}
                  onChange={handleChange}
                  placeholder="https://vimeo.com/... ou https://youtube.com/..."
                  size="small"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LinkIcon sx={{ color: T.muted, fontSize: 18 }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* URL Replay */}
              {(formData.statut === "REPLAY" || formData.statut === "TERMINE") && (
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="URL du replay *"
                    name="replay_url"
                    value={formData.replay_url}
                    onChange={handleChange}
                    error={!!error?.replay_url}
                    helperText={error?.replay_url}
                    placeholder="https://vimeo.com/... ou https://youtube.com/..."
                    size="small"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Replay sx={{ color: T.muted, fontSize: 18 }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  />
                </Grid>
              )}

              {/* Actif */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="est_actif"
                      checked={formData.est_actif}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.9rem", color: T.secondary }}>
                      Formation active (visible sur le site)
                    </Typography>
                  }
                />
              </Grid>

              {/* Progress */}
              {submitting && (
                <Grid size={{ xs: 12 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ flex: 1, height: 6, borderRadius: 3 }}
                    />
                    <Typography sx={{ color: T.muted, fontSize: "0.8rem", minWidth: 40 }}>
                      {uploadProgress}%
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Boutons */}
              <Grid size={{ xs: 12 }}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/admin/formations")}
                    startIcon={<Cancel />}
                    disabled={submitting}
                    sx={{
                      borderColor: T.border,
                      color: T.secondary,
                      textTransform: "none",
                      borderRadius: 2,
                      px: 2.5,
                    }}
                  >
                    Annuler
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={
                      submitting ? (
                        <CircularProgress size={18} sx={{ color: "#fff" }} />
                      ) : (
                        <Save />
                      )
                    }
                    disabled={submitting || !image}
                    sx={{
                      bgcolor: T.primary,
                      textTransform: "none",
                      borderRadius: 2,
                      px: 3,
                      minWidth: 180,
                      boxShadow: "none",
                      "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
                      "&.Mui-disabled": { bgcolor: "#CBD5E1", color: "#fff" },
                    }}
                  >
                    {submitting ? "Création..." : "Créer la formation"}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default NouvelleFormation;