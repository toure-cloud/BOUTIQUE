// src/pages/Admin/Evenements/NouvelEvenement.jsx
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
  Chip,
  Card,
  CardContent,
  Stack,
  Avatar,
  LinearProgress,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Save,
  Cancel,
  AttachMoney,
  Event,
  Description,
  LocationOn,
  CalendarToday,
  People,
  CheckCircle,
  PhotoCamera,
  AccessTime,
  Public,
  Category,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const NouvelEvenement = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [formData, setFormData] = useState({
    titre: '',
    theme: '',
    description: '',
    date_debut: '',
    date_fin: '',
    lieu: '',
    places_total: '',
    prix: '',
    est_gratuit: false,
    statut: 'A_VENIR',
  });

  const statuts = [
    { value: 'A_VENIR', label: 'À venir' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' },
    { value: 'ANNULE', label: 'Annulé' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError(null);
  };

  const handleImageChange = (e) => {
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
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setPreviewImage(null);
    setImageFile(null);
    document.getElementById('image-evenement').value = '';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) errors.titre = 'Le titre est requis';
    if (!formData.theme.trim()) errors.theme = 'Le thème est requis';
    if (!formData.description.trim()) errors.description = 'La description est requise';
    if (!formData.date_debut) errors.date_debut = 'La date de début est requise';
    if (!formData.date_fin) errors.date_fin = 'La date de fin est requise';
    if (!formData.lieu.trim()) errors.lieu = 'Le lieu est requis';
    if (!formData.places_total || parseInt(formData.places_total) < 1) {
      errors.places_total = 'Le nombre de places doit être supérieur à 0';
    }
    if (!formData.est_gratuit && (!formData.prix || parseFloat(formData.prix) < 0)) {
      errors.prix = 'Le prix doit être supérieur ou égal à 0';
    }
    return errors;
  };

  // ✅ SUBMIT AVEC ENVOI VERS LE BACKEND
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
      // ✅ Créer FormData pour envoyer l'image
      const formDataToSend = new FormData();
      
      // ✅ Ajouter tous les champs avec les bonnes conversions
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('theme', formData.theme);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date_debut', formData.date_debut);
      formDataToSend.append('date_fin', formData.date_fin);
      formDataToSend.append('lieu', formData.lieu);
      formDataToSend.append('places_total', formData.places_total);
      formDataToSend.append('statut', formData.statut);
      
      // ✅ Convertir le booléen en string 'true' ou 'false' pour FormData
      formDataToSend.append('est_gratuit', formData.est_gratuit ? 'true' : 'false');
      
      if (!formData.est_gratuit && formData.prix) {
        formDataToSend.append('prix', formData.prix);
      }

      // ✅ Ajouter l'image si elle existe
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      // ✅ LOG pour debug
      console.log('📦 Envoi FormData:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: ${pair[1].name} (${pair[1].size} bytes)`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      // ✅ Appel API avec FormData
      const response = await adminService.createEvenementWithImage(
        formDataToSend,
        (progress) => setUploadProgress(progress)
      );

      console.log('✅ Réponse:', response);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/admin/evenements');
      }, 2000);
      
    } catch (err) {
      console.error('❌ Erreur:', err);
      
      // ✅ Afficher les erreurs du backend
      if (err.response?.data) {
        const backendErrors = err.response.data;
        console.log('📋 Erreurs backend:', backendErrors);
        
        if (typeof backendErrors === 'object') {
          // ✅ Construire un message d'erreur lisible
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
        <Paper
          sx={{
            p: 6,
            textAlign: 'center',
            borderRadius: '20px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
          }}
        >
          <Avatar
            sx={{
              width: 80,
              height: 80,
              bgcolor: '#E8F5E9',
              color: '#66BB6A',
              mx: 'auto',
              mb: 3,
            }}
          >
            <CheckCircle sx={{ fontSize: 48 }} />
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C2C2C', mb: 2 }}>
            ✅ Événement créé avec succès !
          </Typography>
          <Typography variant="body1" sx={{ color: '#666666', mb: 4 }}>
            L'événement a été ajouté à votre calendrier.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigate('/admin/evenements')}
              sx={{
                bgcolor: '#2C2C2C',
                color: '#FFFFFF',
                '&:hover': { bgcolor: '#1A1A1A' },
                px: 4,
                py: 1.2,
                borderRadius: '50px',
              }}
            >
              Voir tous les événements
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setSuccess(false);
                setFormData({
                  titre: '',
                  theme: '',
                  description: '',
                  date_debut: '',
                  date_fin: '',
                  lieu: '',
                  places_total: '',
                  prix: '',
                  est_gratuit: false,
                  statut: 'A_VENIR',
                });
                setPreviewImage(null);
                setImageFile(null);
                setUploadProgress(0);
              }}
              sx={{
                borderColor: '#9E9E9E',
                color: '#2C2C2C',
                '&:hover': {
                  borderColor: '#2C2C2C',
                  bgcolor: 'rgba(0,0,0,0.02)',
                },
                px: 4,
                py: 1.2,
                borderRadius: '50px',
              }}
            >
              Ajouter un autre événement
            </Button>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête avec bouton Dashboard */}
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
            onClick={() => navigate('/admin/evenements')}
            sx={{
              color: '#666666',
              '&:hover': { color: '#2C2C2C' },
            }}
          >
            Retour à la liste
          </Button>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: '#2C2C2C',
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Créer un événement
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              Remplissez les informations ci-dessous pour créer un nouvel événement
            </Typography>
          </Box>
          <Chip
            icon={<Event />}
            label="Nouvel événement"
            sx={{
              bgcolor: '#F5F5F5',
              color: '#2C2C2C',
              fontWeight: 600,
              px: 1,
            }}
          />
        </Box>
      </Box>

      <Paper
        sx={{
          p: 4,
          borderRadius: '20px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          border: '1px solid #F0F0F0',
        }}
      >
        {error?.general && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '12px', whiteSpace: 'pre-wrap' }}
            onClose={() => setError(null)}
          >
            {error.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* ===== IMAGE ===== */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: '#2C2C2C' }}>
                Image de l'événement
              </Typography>
              <Box
                sx={{
                  border: `2px dashed ${previewImage ? '#66BB6A' : '#E0E0E0'}`,
                  borderRadius: '16px',
                  p: 3,
                  textAlign: 'center',
                  minHeight: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: '#2C2C2C',
                    bgcolor: '#F8F8F8',
                  },
                  bgcolor: previewImage ? 'transparent' : '#FAFAFA',
                  transition: 'all 0.3s ease',
                }}
                onClick={() => document.getElementById('image-evenement').click()}
              >
                {previewImage ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img
                      src={previewImage}
                      alt="Aperçu de l'événement"
                      style={{
                        maxWidth: '100%',
                        maxHeight: '300px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: '#FFFFFF',
                        '&:hover': { bgcolor: 'rgba(0,0,0,0.9)' },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage();
                      }}
                    >
                      <Delete />
                    </IconButton>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#66BB6A' }}>
                      ✅ Image téléchargée
                    </Typography>
                  </Box>
                ) : (
                  <>
                    <PhotoCamera sx={{ fontSize: 48, color: '#BDBDBD' }} />
                    <Typography variant="body1" sx={{ color: '#666666', mt: 2, fontWeight: 500 }}>
                      Cliquez pour télécharger une image
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#BDBDBD' }}>
                      JPG, PNG, WEBP - Max 5MB
                    </Typography>
                  </>
                )}
                <input
                  id="image-evenement"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </Box>
            </Grid>

            {/* ===== TITRE ===== */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de l'événement *"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                error={!!error?.titre}
                helperText={error?.titre}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Event sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== THEME ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thème *"
                name="theme"
                value={formData.theme}
                onChange={handleChange}
                error={!!error?.theme}
                helperText={error?.theme}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Category sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== STATUT ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Statut"
                name="statut"
                value={formData.statut}
                onChange={handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              >
                {statuts.map((statut) => (
                  <MenuItem key={statut.value} value={statut.value}>
                    {statut.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* ===== DESCRIPTION ===== */}
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
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Description sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== DATES ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de début *"
                name="date_debut"
                type="datetime-local"
                value={formData.date_debut}
                onChange={handleChange}
                error={!!error?.date_debut}
                helperText={error?.date_debut}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarToday sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Date de fin *"
                name="date_fin"
                type="datetime-local"
                value={formData.date_fin}
                onChange={handleChange}
                error={!!error?.date_fin}
                helperText={error?.date_fin}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== LIEU ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu *"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                error={!!error?.lieu}
                helperText={error?.lieu}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== PLACES ===== */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nombre de places *"
                name="places_total"
                type="number"
                value={formData.places_total}
                onChange={handleChange}
                error={!!error?.places_total}
                helperText={error?.places_total}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <People sx={{ color: '#9E9E9E' }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
              />
            </Grid>

            {/* ===== PRIX ET GRATUIT ===== */}
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="est_gratuit"
                    checked={formData.est_gratuit}
                    onChange={handleChange}
                    color="primary"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#2C2C2C',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        bgcolor: '#2C2C2C',
                      },
                    }}
                  />
                }
                label="Événement gratuit"
              />
            </Grid>

            {!formData.est_gratuit && (
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Prix"
                  name="prix"
                  type="number"
                  value={formData.prix}
                  onChange={handleChange}
                  error={!!error?.prix}
                  helperText={error?.prix}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <AttachMoney sx={{ color: '#9E9E9E' }} />
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    },
                  }}
                />
              </Grid>
            )}

            {/* ===== PROGRESS BAR ===== */}
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
                <Typography variant="caption" sx={{ color: '#999999', display: 'block', mt: 0.5 }}>
                  {uploadProgress < 100 ? 'Téléchargement de l\'image...' : 'Création de l\'événement...'}
                </Typography>
              </Grid>
            )}

            {/* ===== RÉSUMÉ ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Card
                sx={{
                  bgcolor: '#F8F8F8',
                  borderRadius: '16px',
                  border: '1px solid #F0F0F0',
                }}
              >
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#2C2C2C', mb: 2 }}>
                    📋 Résumé de l'événement
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Titre
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                        {formData.titre || 'Non défini'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Thème
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                        {formData.theme || 'Non défini'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Lieu
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                        {formData.lieu || 'Non défini'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>
                        Places
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                        {formData.places_total || 'Non défini'}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* ===== BOUTONS ===== */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/evenements')}
                  startIcon={<Cancel />}
                  disabled={submitting}
                  sx={{
                    borderColor: '#E0E0E0',
                    color: '#666666',
                    '&:hover': {
                      borderColor: '#2C2C2C',
                      bgcolor: 'rgba(0,0,0,0.02)',
                    },
                    px: 4,
                    py: 1.2,
                    borderRadius: '50px',
                  }}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    submitting ? (
                      <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                    ) : (
                      <Save />
                    )
                  }
                  disabled={submitting}
                  sx={{
                    bgcolor: '#2C2C2C',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#1A1A1A' },
                    px: 4,
                    py: 1.2,
                    borderRadius: '50px',
                  }}
                >
                  {submitting ? 'Création...' : 'Créer l\'événement'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NouvelEvenement;