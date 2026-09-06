// src/pages/Admin/Formations/NouvelleFormation.jsx
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
  Chip,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Delete,
  Save,
  Cancel,
  CheckCircle,
  VideoLibrary,
  Description,
  AttachMoney,
  CalendarToday,
  Link as LinkIcon,
  PlayArrow,
  Replay,
  Schedule,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const NouvelleFormation = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // ✅ État pour l'image
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ✅ État du formulaire
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    description_detail: '',
    prix: '',
    duree: '',
    statut: 'PROGRAMME',
    date_live: '',
    video_url: '',
    replay_url: '',
    est_actif: true,
    ordre: 0,
  });

  // ✅ Statuts disponibles
  const statuts = [
    { value: 'PROGRAMME', label: 'Programmé' },
    { value: 'LIVE', label: 'En direct' },
    { value: 'REPLAY', label: 'Replay disponible' },
    { value: 'TERMINE', label: 'Terminé' },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setError(null);
  };

  // ✅ Gestion de l'image
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
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(null);
    }
  };

  const removeImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImage(null);
    setImagePreview(null);
    document.getElementById('image-formation').value = '';
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.titre.trim()) errors.titre = 'Le titre est requis';
    if (!formData.description.trim()) errors.description = 'La description est requise';
    if (!formData.prix || parseFloat(formData.prix) <= 0) {
      errors.prix = 'Le prix doit être supérieur à 0';
    }
    if (!formData.duree.trim()) errors.duree = 'La durée est requise';
    if (!image) {
      errors.image = 'L\'image est obligatoire';
    }
    if (formData.statut === 'LIVE' && !formData.date_live) {
      errors.date_live = 'La date du live est requise pour un statut "En direct"';
    }
    if (formData.statut === 'REPLAY' && !formData.replay_url) {
      errors.replay_url = 'L\'URL du replay est requise pour un statut "Replay"';
    }
    return errors;
  };

  // ✅ SUBMIT AVEC FORMDATA
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
      formDataToSend.append('titre', formData.titre);
      formDataToSend.append('description', formData.description);
      if (formData.description_detail) {
        formDataToSend.append('description_detail', formData.description_detail);
      }
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('duree', formData.duree);
      formDataToSend.append('statut', formData.statut);
      if (formData.date_live) {
        formDataToSend.append('date_live', formData.date_live);
      }
      if (formData.video_url) {
        formDataToSend.append('video_url', formData.video_url);
      }
      if (formData.replay_url) {
        formDataToSend.append('replay_url', formData.replay_url);
      }
      formDataToSend.append('est_actif', formData.est_actif ? 'true' : 'false');
      formDataToSend.append('ordre', formData.ordre.toString());

      // ✅ Ajouter l'image
      if (image) {
        formDataToSend.append('image', image);
      }

      // ✅ LOG POUR DEBUG
      console.log('📦 Envoi FormData Formation:');
      for (let pair of formDataToSend.entries()) {
        if (pair[1] instanceof File) {
          console.log(`  ${pair[0]}: ${pair[1].name} (${pair[1].size} bytes, ${pair[1].type})`);
        } else {
          console.log(`  ${pair[0]}: ${pair[1]}`);
        }
      }

      // ✅ Appel API
      const response = await adminService.createFormationWithImage(
        formDataToSend,
        (progress) => setUploadProgress(progress)
      );
      
      console.log('✅ Réponse:', response);
      
      setSuccess(true);
      
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      
      setTimeout(() => navigate('/admin/formations'), 2000);
      
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
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            ✅ Formation créée avec succès !
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
            La formation a été ajoutée à votre catalogue.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/admin/formations')} 
            sx={{ mr: 2 }}
          >
            Voir toutes les formations
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => window.location.reload()}
          >
            Ajouter une autre formation
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBack />} 
          onClick={() => navigate('/admin/formations')} 
          sx={{ color: '#666666' }}
        >
          Retour à la liste
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B', mt: 2 }}>
          Ajouter une nouvelle formation
        </Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Remplissez les informations ci-dessous pour ajouter une formation en ligne
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
            {/* ============ IMAGE ============ */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Image de la formation <span style={{ color: '#EF4444' }}>*</span>
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
                onClick={() => document.getElementById('image-formation').click()}
              >
                {imagePreview ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img
                      src={imagePreview}
                      alt="Aperçu"
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
                        removeImage();
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#10B981' }}>
                      ✅ {image.name} ({(image.size / 1024).toFixed(1)} KB)
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
                  id="image-formation" 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  style={{ display: 'none' }} 
                />
              </Box>
            </Grid>

            {/* ============ STATUT & INFOS ============ */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Statut */}
                <TextField
                  fullWidth
                  select
                  label="Statut *"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VideoLibrary sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                >
                  {statuts.map((statut) => (
                    <MenuItem key={statut.value} value={statut.value}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {statut.value === 'LIVE' && <PlayArrow sx={{ color: '#EF4444', fontSize: 18 }} />}
                        {statut.value === 'REPLAY' && <Replay sx={{ color: '#F59E0B', fontSize: 18 }} />}
                        {statut.value === 'PROGRAMME' && <Schedule sx={{ color: '#3B82F6', fontSize: 18 }} />}
                        {statut.value === 'TERMINE' && <CheckCircle sx={{ color: '#10B981', fontSize: 18 }} />}
                        <span>{statut.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </TextField>

                {/* Date Live (si statut LIVE) */}
                {(formData.statut === 'LIVE' || formData.statut === 'PROGRAMME') && (
                  <TextField
                    fullWidth
                    type="datetime-local"
                    label="Date du live"
                    name="date_live"
                    value={formData.date_live}
                    onChange={handleChange}
                    error={!!error?.date_live}
                    helperText={error?.date_live}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: '#94A3B8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                {/* Ordre d'affichage */}
                <TextField
                  fullWidth
                  type="number"
                  label="Ordre d'affichage"
                  name="ordre"
                  value={formData.ordre}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Schedule sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>

            {/* ============ TITRE ============ */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Titre de la formation *"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                error={!!error?.titre}
                helperText={error?.titre}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VideoLibrary sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* ============ DESCRIPTION ============ */}
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
                rows={3}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* ============ DESCRIPTION DÉTAILLÉE ============ */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description détaillée"
                name="description_detail"
                value={formData.description_detail}
                onChange={handleChange}
                multiline
                rows={5}
                placeholder="Contenu détaillé de la formation, programme, objectifs..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Description sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* ============ PRIX & DURÉE ============ */}
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
                  startAdornment: (
                    <InputAdornment position="start">
                      <AttachMoney sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Durée *"
                name="duree"
                value={formData.duree}
                onChange={handleChange}
                error={!!error?.duree}
                helperText={error?.duree}
                required
                placeholder="ex: 2h30, 1 jour, 4 semaines"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Schedule sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* ============ URL VIDÉO ============ */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="URL de la vidéo (Vimeo/Youtube)"
                name="video_url"
                value={formData.video_url}
                onChange={handleChange}
                placeholder="https://vimeo.com/... ou https://youtube.com/..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* ============ URL REPLAY ============ */}
            {(formData.statut === 'REPLAY' || formData.statut === 'TERMINE') && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="URL du replay *"
                  name="replay_url"
                  value={formData.replay_url}
                  onChange={handleChange}
                  error={!!error?.replay_url}
                  helperText={error?.replay_url}
                  placeholder="https://vimeo.com/... ou https://youtube.com/..."
                  required={formData.statut === 'REPLAY'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Replay sx={{ color: '#94A3B8' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}

            {/* ============ ACTIF ============ */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    name="est_actif"
                    checked={formData.est_actif}
                    onChange={handleChange}
                  />
                }
                label="Formation active (visible sur le site)"
              />
            </Grid>

            {/* ============ BARRE DE PROGRESSION ============ */}
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

            {/* ============ BOUTONS ============ */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/admin/formations')} 
                  startIcon={<Cancel />}
                  disabled={submitting}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <Save />}
                  disabled={submitting || !image}
                  sx={{ 
                    bgcolor: '#1E293B', 
                    '&:hover': { bgcolor: '#334155' },
                    '&:disabled': { bgcolor: '#94A3B8' },
                    minWidth: 180,
                  }}
                >
                  {submitting ? 'Création...' : 'Créer la formation'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default NouvelleFormation;