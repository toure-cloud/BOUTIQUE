// src/pages/Admin/Produits/NouveauProduit.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Switch,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  AddPhotoAlternate,
  Save,
  Cancel,
  AttachMoney,
  Category,
  Description,
  Inventory,
  LocalOffer,
  CheckCircle,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const NouveauProduit = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // ✅ État pour les images
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [secondaryImages, setSecondaryImages] = useState([]);
  const [secondaryPreviews, setSecondaryPreviews] = useState([]);

  // ✅ État du formulaire
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    categorie: '',
    taille: '',
    quantite_stock: '',
    est_disponible: true,
    est_en_promotion: false,
    prix_promotion: '',
  });

  const categories = [
    { value: 'robes', label: 'Robes' },
    { value: 'accessoires', label: 'Accessoires' },
    { value: 'chaussures', label: 'Chaussures' },
    { value: 'bijoux', label: 'Bijoux' },
    { value: 'sacs', label: 'Sacs' },
    { value: 'AUTRE', label: 'Autre' },
  ];

  // ✅ Tailles dynamiques par catégorie
  const getTaillesByCategorie = (categorie) => {
    const taillesMap = {
      robes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
      chaussures: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
      bijoux: ['Taille unique', 'S', 'M', 'L', 'XL'],
      sacs: ['Taille unique', 'Petit', 'Moyen', 'Grand', 'XL'],
      accessoires: ['Taille unique', 'S', 'M', 'L'],
      AUTRE: ['Taille unique'],
    };
    return taillesMap[categorie] || ['Taille unique'];
  };

  const taillesDisponibles = getTaillesByCategorie(formData.categorie);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError(null);
  };

  // ✅ Gestion de l'image principale
  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError({ general: 'Le fichier doit être une image' });
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError({ general: 'L\'image ne doit pas dépasser 5MB' });
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  // ✅ Gestion des images secondaires
  const handleSecondaryImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 5 * 1024 * 1024) return false;
      return true;
    });

    if (secondaryImages.length + validFiles.length > 4) {
      setError({ general: 'Maximum 4 images secondaires' });
      return;
    }

    setSecondaryImages(prev => [...prev, ...validFiles]);
    const previews = validFiles.map(file => URL.createObjectURL(file));
    setSecondaryPreviews(prev => [...prev, ...previews]);
    setError(null);
  };

  const removeSecondaryImage = (index) => {
    URL.revokeObjectURL(secondaryPreviews[index]);
    setSecondaryImages(prev => prev.filter((_, i) => i !== index));
    setSecondaryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeMainImage = () => {
    if (mainImagePreview) {
      URL.revokeObjectURL(mainImagePreview);
    }
    setMainImage(null);
    setMainImagePreview(null);
    document.getElementById('image-principale').value = '';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.description.trim()) errors.description = 'La description est requise';
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      errors.prix = 'Le prix doit être supérieur à 0';
    }
    if (!formData.categorie) errors.categorie = 'La catégorie est requise';
    if (!formData.quantite_stock || parseInt(formData.quantite_stock) < 0) {
      errors.quantite_stock = 'La quantité en stock est requise';
    }
    if (!mainImage) {
      errors.image = 'L\'image principale est obligatoire';
    }
    if (formData.est_en_promotion && (!formData.prix_promotion || parseFloat(formData.prix_promotion) <= 0)) {
      errors.prix_promotion = 'Le prix promotionnel est requis';
    }
    if (formData.est_en_promotion && parseFloat(formData.prix_promotion) >= parseFloat(formData.prix)) {
      errors.prix_promotion = 'Le prix promo doit être inférieur au prix normal';
    }
    return errors;
  };

  // ✅ SUBMIT AVEC FORMDATA - CORRIGÉ
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
      
      // ✅ Ajouter tous les champs texte
      formDataToSend.append('nom', formData.nom);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('categorie', formData.categorie);
      if (formData.taille) formDataToSend.append('taille', formData.taille);
      formDataToSend.append('quantite_stock', formData.quantite_stock);
      formDataToSend.append('est_disponible', formData.est_disponible ? 'true' : 'false');
      formDataToSend.append('est_en_promotion', formData.est_en_promotion ? 'true' : 'false');
      if (formData.est_en_promotion && formData.prix_promotion) {
        formDataToSend.append('prix_promotion', formData.prix_promotion);
      }

      // ✅ AJOUTER L'IMAGE PRINCIPALE
      if (mainImage) {
        formDataToSend.append('image_principale', mainImage);
      }

      // ✅ Ajouter les images secondaires
      secondaryImages.forEach((image) => {
        formDataToSend.append('images_secondaires', image);
      });

      console.log('📦 Envoi FormData:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      // ✅ Appel API
      const response = await adminService.createProduitWithImages(
        formDataToSend,
        (progress) => setUploadProgress(progress)
      );
      
      console.log('✅ Réponse:', response);
      
      setSuccess(true);
      
      if (mainImagePreview) URL.revokeObjectURL(mainImagePreview);
      secondaryPreviews.forEach(url => URL.revokeObjectURL(url));
      
      setTimeout(() => navigate('/admin/produits'), 2000);
      
    } catch (err) {
      console.error('❌ Erreur détaillée:', err);
      
      if (err.response?.data) {
        const backendErrors = err.response.data;
        if (typeof backendErrors === 'object') {
          const errorMessages = Object.entries(backendErrors)
            .map(([field, messages]) => {
              const msg = Array.isArray(messages) ? messages.join(', ') : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
          setError({ general: `Erreur de validation:\n${errorMessages}` });
        } else {
          setError({ general: backendErrors.error || backendErrors.message || 'Erreur serveur' });
        }
      } else if (err.message) {
        setError({ general: err.message });
      } else {
        setError({ general: 'Erreur de connexion au serveur' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <Container maxWidth="md">
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
          <CheckCircle sx={{ fontSize: 80, color: '#10B981', mb: 2 }} />
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>✅ Produit créé avec succès !</Typography>
          <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
            Le produit a été ajouté à votre boutique.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/admin/produits')} sx={{ mr: 2 }}>
            Voir tous les produits
          </Button>
          <Button variant="outlined" onClick={() => window.location.reload()}>
            Ajouter un autre produit
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* ===== EN-TÊTE AVEC BOUTON DASHBOARD ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              borderColor: '#E0E0E0',
              color: '#666666',
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#2C2C2C',
                color: '#2C2C2C',
                bgcolor: 'rgba(44,44,44,0.04)',
              },
              px: 2.5,
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/produits')}
            sx={{ color: '#666666', '&:hover': { color: '#2C2C2C' } }}
          >
            Retour à la liste
          </Button>
        </Box>
        
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
          Ajouter un nouveau produit
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Remplissez les informations ci-dessous pour ajouter un produit à votre boutique
        </Typography>
      </Box>

      <Paper sx={{ p: 4, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        {error?.general && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '8px', whiteSpace: 'pre-wrap' }}
            onClose={() => setError(null)}
          >
            {error.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Image principale */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Image principale <span style={{ color: '#EF4444' }}>*</span>
              </Typography>
              <Box
                sx={{
                  border: `2px dashed ${error?.image ? '#EF4444' : '#E2E8F0'}`,
                  borderRadius: '12px',
                  p: 2,
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': { borderColor: '#6366F1' },
                  bgcolor: '#F8FAFC',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => document.getElementById('image-principale').click()}
              >
                {mainImagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img
                      src={mainImagePreview}
                      alt="Aperçu principal"
                      style={{ 
                        maxWidth: '100%', 
                        maxHeight: '200px', 
                        objectFit: 'contain', 
                        borderRadius: '8px' 
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeMainImage();
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#10B981' }}>
                      ✅ {mainImage.name} ({(mainImage.size / 1024).toFixed(1)} KB)
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <CloudUpload sx={{ fontSize: 48, color: '#94A3B8' }} />
                    <Typography variant="body2" sx={{ color: '#666666', mt: 1 }}>
                      Cliquez pour télécharger une image
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                      JPG, PNG, WEBP - Max 5MB
                    </Typography>
                    {error?.image && (
                      <Typography variant="caption" sx={{ color: '#EF4444', mt: 1 }}>
                        ⚠️ {error.image}
                      </Typography>
                    )}
                  </>
                )}
                <input 
                  id="image-principale" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleMainImageChange}
                  style={{ display: 'none' }} 
                />
              </Box>
            </Grid>

            {/* Images secondaires */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Images supplémentaires (max 4)
              </Typography>
              <Box
                sx={{
                  border: '2px dashed #E2E8F0',
                  borderRadius: '12px',
                  p: 2,
                  minHeight: '200px',
                  bgcolor: '#F8FAFC',
                }}
              >
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, minHeight: '80px' }}>
                  {secondaryPreviews.map((preview, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                      }}
                    >
                      <img
                        src={preview}
                        alt={`Secondaire ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          color: '#FFFFFF',
                          width: 20,
                          height: 20,
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                        }}
                        onClick={() => removeSecondaryImage(index)}
                      >
                        <Delete sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                  ))}
                  {secondaryPreviews.length < 4 && (
                    <Box
                      sx={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '8px',
                        border: '2px dashed #E2E8F0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { borderColor: '#6366F1' },
                      }}
                      onClick={() => document.getElementById('images-secondaires').click()}
                    >
                      <AddPhotoAlternate sx={{ color: '#94A3B8' }} />
                    </Box>
                  )}
                </Box>
                <input
                  id="images-secondaires"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSecondaryImagesChange}
                  style={{ display: 'none' }}
                />
                <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 1 }}>
                  {secondaryImages.length}/4 images ajoutées
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
                required
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
                required
              />
            </Grid>

            {/* Prix */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Prix *"
                name="prix"
                type="number"
                value={formData.prix}
                onChange={handleChange}
                error={!!error?.prix}
                helperText={error?.prix}
                required
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
                required
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Taille - Dynamique selon catégorie */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Taille"
                name="taille"
                value={formData.taille}
                onChange={handleChange}
                helperText={formData.categorie ? "Sélectionnez une taille" : "Sélectionnez d'abord une catégorie"}
              >
                {taillesDisponibles.map((taille) => (
                  <MenuItem key={taille} value={taille}>{taille}</MenuItem>
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
                required
              />
            </Grid>

            {/* Disponibilité */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="est_disponible"
                    checked={formData.est_disponible}
                    onChange={handleChange}
                  />
                }
                label="Produit disponible"
              />
            </Grid>

            {/* Promotion */}
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="est_en_promotion"
                    checked={formData.est_en_promotion}
                    onChange={handleChange}
                  />
                }
                label="Produit en promotion"
              />
            </Grid>

            {/* Prix promotionnel */}
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
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">CFA</InputAdornment>,
                  }}
                />
              </Grid>
            )}

            {/* Barre de progression */}
            {submitting && (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LinearProgress 
                    variant="determinate" 
                    value={uploadProgress} 
                    sx={{ flex: 1, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="caption" sx={{ color: '#666666', minWidth: 45 }}>
                    {uploadProgress}%
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Boutons */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/admin/produits')} 
                  startIcon={<Cancel />}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <Save />}
                  disabled={submitting || !mainImage}
                  sx={{ 
                    bgcolor: '#1E293B', 
                    '&:hover': { bgcolor: '#334155' },
                    '&:disabled': { bgcolor: '#94A3B8' },
                    minWidth: 180,
                  }}
                >
                  {submitting ? 'Création...' : 'Créer le produit'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NouveauProduit;