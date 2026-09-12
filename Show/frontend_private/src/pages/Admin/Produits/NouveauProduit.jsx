// src/pages/Admin/Produits/NouveauProduit.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Grid, TextField, Button, MenuItem,
  Alert, CircularProgress, Divider, IconButton, InputAdornment,
  FormControlLabel, Switch, LinearProgress, Stack,
} from "@mui/material";
import {
  ArrowBack, CloudUpload, Delete, AddPhotoAlternate, Save, Cancel,
  CheckCircle,
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

const NouveauProduit = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    prix: "",
    categorie: "",
    taille: "",
    quantite_stock: "",
    est_disponible: true,
    est_en_promotion: false,
    prix_promotion: "",
  });

  const categories = [
    { value: "robes", label: "Robes" },
    { value: "accessoires", label: "Accessoires" },
    { value: "chaussures", label: "Chaussures" },
    { value: "bijoux", label: "Bijoux" },
    { value: "sacs", label: "Sacs" },
    { value: "AUTRE", label: "Autre" },
  ];

  const getTaillesByCategorie = (categorie) => {
    const map = {
      robes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      chaussures: ["35", "36", "37", "38", "39", "40", "41", "42", "43", "44", "45"],
      bijoux: ["Taille unique", "S", "M", "L", "XL"],
      sacs: ["Taille unique", "Petit", "Moyen", "Grand", "XL"],
      accessoires: ["Taille unique", "S", "M", "L"],
      AUTRE: ["Taille unique"],
    };
    return map[categorie] || ["Taille unique"];
  };

  const taillesDisponibles = getTaillesByCategorie(formData.categorie);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(null);
  };

  const handleMainImageChange = (e) => {
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
    setMainImage(file);
    setMainImagePreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files).filter(
      (f) => f.type.startsWith("image/") && f.size <= 5 * 1024 * 1024
    );
    if (secondaryImages.length + files.length > 4) {
      setError({ general: "Maximum 4 images secondaires" });
      return;
    }
    setSecondaryImages((prev) => [...prev, ...files]);
    setSecondaryPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setError(null);
  };

  const removeMainImage = () => {
    if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
    setMainImage(null);
    setMainImagePreview(null);
    const input = document.getElementById("image-principale");
    if (input) input.value = "";
  };

  const removeSecondaryImage = (index) => {
    URL.revokeObjectURL(secondaryPreviews[index]);
    setSecondaryImages((prev) => prev.filter((_, i) => i !== index));
    setSecondaryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = "Le nom est requis";
    if (!formData.description.trim()) errors.description = "La description est requise";
    if (!formData.prix || parseFloat(formData.prix) <= 0) errors.prix = "Le prix doit être supérieur à 0";
    if (!formData.categorie) errors.categorie = "La catégorie est requise";
    if (!formData.quantite_stock || parseInt(formData.quantite_stock) < 0) {
      errors.quantite_stock = "La quantité en stock est requise";
    }
    if (!mainImage) errors.image = "L'image principale est obligatoire";
    if (formData.est_en_promotion) {
      if (!formData.prix_promotion || parseFloat(formData.prix_promotion) <= 0) {
        errors.prix_promotion = "Le prix promotionnel est requis";
      } else if (parseFloat(formData.prix_promotion) >= parseFloat(formData.prix)) {
        errors.prix_promotion = "Le prix promo doit être inférieur au prix normal";
      }
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
      formDataToSend.append("nom", formData.nom);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("prix", formData.prix);
      formDataToSend.append("categorie", formData.categorie);
      if (formData.taille) formDataToSend.append("taille", formData.taille);
      formDataToSend.append("quantite_stock", formData.quantite_stock);
      formDataToSend.append("est_disponible", formData.est_disponible ? "true" : "false");
      formDataToSend.append("est_en_promotion", formData.est_en_promotion ? "true" : "false");
      if (formData.est_en_promotion && formData.prix_promotion) {
        formDataToSend.append("prix_promotion", formData.prix_promotion);
      }
      if (mainImage) formDataToSend.append("image_principale", mainImage);
      secondaryImages.forEach((img) => formDataToSend.append("images_secondaires", img));

      await adminService.createProduitWithImages(formDataToSend, (progress) =>
        setUploadProgress(progress)
      );

      setSuccess(true);
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      secondaryPreviews.forEach((url) => URL.revokeObjectURL(url));
      setTimeout(() => navigate("/admin/produits"), 2000);
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

  // Success
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
              Produit créé avec succès
            </Typography>
            <Typography sx={{ color: T.muted, mb: 3.5 }}>
              Le produit a été ajouté à votre boutique.
            </Typography>
            <Stack direction="row" spacing={1.5} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => navigate("/admin/produits")}
                sx={{
                  bgcolor: T.primary,
                  textTransform: "none",
                  borderRadius: 2,
                  px: 3,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
                }}
              >
                Voir les produits
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
                Ajouter un autre
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
            onClick={() => navigate("/admin/produits")}
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
            Nouveau produit
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
              {/* Image principale */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem", mb: 1.2 }}>
                  Image principale <span style={{ color: T.danger }}>*</span>
                </Typography>
                <Box
                  onClick={() => document.getElementById("image-principale").click()}
                  sx={{
                    border: `2px dashed ${error?.image ? T.danger : T.border}`,
                    borderRadius: 2.5,
                    p: 2.5,
                    minHeight: 200,
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
                  {mainImagePreview ? (
                    <Box sx={{ position: "relative", width: "100%", textAlign: "center" }}>
                      <Box
                        component="img"
                        src={mainImagePreview}
                        alt="Aperçu"
                        sx={{ maxWidth: "100%", maxHeight: 170, objectFit: "contain", borderRadius: 2 }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeMainImage();
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
                        {mainImage.name} ({(mainImage.size / 1024).toFixed(0)} Ko)
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
                    id="image-principale"
                    type="file"
                    accept="image/*"
                    onChange={handleMainImageChange}
                    style={{ display: "none" }}
                  />
                </Box>
              </Grid>

              {/* Images secondaires */}
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem", mb: 1.2 }}>
                  Images supplémentaires (max 4)
                </Typography>
                <Box
                  sx={{
                    border: `2px dashed ${T.border}`,
                    borderRadius: 2.5,
                    p: 2,
                    minHeight: 200,
                    bgcolor: T.bg,
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.2, minHeight: 80 }}>
                    {secondaryPreviews.map((preview, index) => (
                      <Box
                        key={index}
                        sx={{
                          position: "relative",
                          width: 72,
                          height: 72,
                          borderRadius: 1.5,
                          overflow: "hidden",
                          border: `1px solid ${T.border}`,
                        }}
                      >
                        <Box
                          component="img"
                          src={preview}
                          alt=""
                          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeSecondaryImage(index)}
                          sx={{
                            position: "absolute",
                            top: 2,
                            right: 2,
                            bgcolor: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            width: 22,
                            height: 22,
                            "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                          }}
                        >
                          <Delete sx={{ fontSize: 14 }} />
                        </IconButton>
                      </Box>
                    ))}
                    {secondaryPreviews.length < 4 && (
                      <Box
                        onClick={() => document.getElementById("images-secondaires").click()}
                        sx={{
                          width: 72,
                          height: 72,
                          borderRadius: 1.5,
                          border: `2px dashed ${T.border}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          "&:hover": { borderColor: T.accent },
                        }}
                      >
                        <AddPhotoAlternate sx={{ color: T.muted }} />
                      </Box>
                    )}
                  </Box>
                  <input
                    id="images-secondaires"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleSecondaryImagesChange}
                    style={{ display: "none" }}
                  />
                  <Typography sx={{ color: T.muted, fontSize: "0.75rem", mt: 1.2 }}>
                    {secondaryImages.length}/4 images
                  </Typography>
                </Box>
              </Grid>

              {/* Nom */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nom du produit *"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={!!error?.nom}
                  helperText={error?.nom}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description *"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!error?.description}
                  helperText={error?.description}
                  multiline
                  rows={4}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Prix */}
              <Grid item xs={12} sm={6}>
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
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">CFA</InputAdornment>,
                  }}
                />
              </Grid>

              {/* Catégorie */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Catégorie *"
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleChange}
                  error={!!error?.categorie}
                  helperText={error?.categorie}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Taille */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Taille"
                  name="taille"
                  value={formData.taille}
                  onChange={handleChange}
                  size="small"
                  disabled={!formData.categorie}
                  helperText={!formData.categorie ? "Sélectionnez d'abord une catégorie" : ""}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                >
                  {taillesDisponibles.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Stock */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantité en stock *"
                  name="quantite_stock"
                  type="number"
                  value={formData.quantite_stock}
                  onChange={handleChange}
                  error={!!error?.quantite_stock}
                  helperText={error?.quantite_stock}
                  size="small"
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
              </Grid>

              {/* Switches */}
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="est_disponible"
                      checked={formData.est_disponible}
                      onChange={handleChange}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.9rem", color: T.secondary }}>
                      Produit disponible
                    </Typography>
                  }
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="est_en_promotion"
                      checked={formData.est_en_promotion}
                      onChange={handleChange}
                    />
                  }
                  label={
                    <Typography sx={{ fontSize: "0.9rem", color: T.secondary }}>
                      Produit en promotion
                    </Typography>
                  }
                />
              </Grid>

              {/* Prix promo */}
              {formData.est_en_promotion && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Prix promotionnel *"
                    name="prix_promotion"
                    type="number"
                    value={formData.prix_promotion}
                    onChange={handleChange}
                    error={!!error?.prix_promotion}
                    helperText={error?.prix_promotion}
                    size="small"
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">CFA</InputAdornment>,
                    }}
                  />
                </Grid>
              )}

              {/* Progress */}
              {submitting && (
                <Grid item xs={12}>
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
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate("/admin/produits")}
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
                    disabled={submitting || !mainImage}
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
                    {submitting ? "Création..." : "Créer le produit"}
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

export default NouveauProduit;