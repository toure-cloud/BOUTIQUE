// src/components/RegisterDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Grid,
  TextField,
  Button,
  Alert,
  Fade,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Close, CheckCircle } from '@mui/icons-material';
import FormAlert from './FormAlert';

/**
 * Dialog réutilisable pour l'inscription à une prestation relooking.
 *
 * Props :
 * - open, onClose
 * - prestationNom : nom de la prestation (affiché en haut)
 * - formData, onFormChange
 * - onSubmit : async (e) => void
 * - loading : bool
 * - submitted : bool
 * - message : { type, title, text, details } | null
 * - onClearMessage : () => void
 * - submitLabel : string (défaut : "S'inscrire")
 * - showDateField : bool (défaut : true)
 * - showNbPersonnes : bool (défaut : false)
 */
const RegisterDialog = ({
  open,
  onClose,
  prestationNom,
  formData,
  onFormChange,
  onSubmit,
  loading,
  submitted,
  message,
  onClearMessage,
  submitLabel = "S'inscrire",
  showDateField = true,
  showNbPersonnes = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: isMobile ? 0 : '20px',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
        },
      }}
      aria-labelledby="register-dialog-title"
    >
      {/* =============================================
          ✅ Header du dialog
          On utilise un <Box> au lieu de <DialogTitle>
          pour éviter l'imbrication <h2><h6>
          ============================================= */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2C2C2C 100%)',
          color: '#fff',
          px: 3,
          py: 2.5,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{
              opacity: 0.7,
              letterSpacing: 1.5,
              fontSize: '0.7rem',
              display: 'block',
            }}
          >
            Inscription
          </Typography>
          <Typography
            id="register-dialog-title"
            variant="h5"
            component="h2"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
              mt: 0.3,
            }}
          >
            Réserver cette prestation
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: '#fff' }} aria-label="Fermer">
          <Close />
        </IconButton>
      </Box>

      {/* =============================================
          ✅ Contenu du dialog
          ============================================= */}
      <DialogContent sx={{ px: 3, py: 3 }}>
        <Alert
          severity="info"
          icon={false}
          sx={{
            mb: 3,
            borderRadius: '12px',
            bgcolor: 'rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.06)',
            color: '#333',
          }}
        >
          Vous vous inscrivez à : <strong>{prestationNom}</strong>
        </Alert>

        {/* ✅ Affichage des messages d'erreur / succès (inline) */}
        {message && (
          <FormAlert
            type={message.type}
            title={message.title}
            message={message.text}
            details={message.details}
            onClose={onClearMessage}
          />
        )}

        {submitted ? (
          <Fade in>
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <CheckCircle sx={{ fontSize: 72, color: '#4CAF50', mb: 2 }} />
              <Typography
                variant="h6"
                component="p"
                fontWeight={700}
                color="#1a1a1a"
                gutterBottom
              >
                Inscription réussie !
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vous recevrez un email de confirmation avec tous les détails.
              </Typography>
            </Box>
          </Fade>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={onFormChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={onFormChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={onFormChange}
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={onFormChange}
                  required
                  helperText="Format : 10 chiffres commençant par 0"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>

              {showNbPersonnes && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Nombre de participants"
                    name="nb_personnes"
                    type="number"
                    value={formData.nb_personnes ?? 2}
                    onChange={onFormChange}
                    required
                    slotProps={{ htmlInput: { min: 2, max: 6 } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              )}

              {showDateField && (
                <Grid item xs={12} sm={showNbPersonnes ? 6 : 12}>
                  <TextField
                    fullWidth
                    label="Date souhaitée"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={onFormChange}
                    InputLabelProps={{ shrink: true }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Message / Questions"
                  name="message"
                  multiline
                  rows={3}
                  value={formData.message}
                  onChange={onFormChange}
                  placeholder="Décrivez vos attentes..."
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                />
              </Grid>
            </Grid>

            <DialogActions sx={{ px: 0, pt: 3.5, pb: 0 }}>
              <Button
                onClick={onClose}
                sx={{ color: '#666', borderRadius: '50px', px: 3 }}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: '#1a1a1a',
                  color: '#fff',
                  borderRadius: '50px',
                  px: 4,
                  py: 1.2,
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: 150,
                  '&:hover': { bgcolor: '#333' },
                  '&.Mui-disabled': { bgcolor: '#555', color: '#fff' },
                }}
                startIcon={
                  loading ? (
                    <CircularProgress size={18} sx={{ color: '#fff' }} />
                  ) : (
                    <CheckCircle sx={{ fontSize: 20 }} />
                  )
                }
              >
                {loading ? 'Envoi...' : submitLabel}
              </Button>
            </DialogActions>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;