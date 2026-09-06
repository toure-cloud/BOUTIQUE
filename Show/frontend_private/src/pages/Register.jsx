// src/pages/Register.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Container, Paper, Typography, TextField, Button, Alert,
  Box, Stepper, Step, StepLabel, InputAdornment, IconButton,
  Fade, Zoom, Stack, CircularProgress, alpha, Divider,
} from '@mui/material';
import {
  Visibility, VisibilityOff, Person, Email, Phone, Lock,
  ArrowBack, ArrowForward, CheckCircle, Mail, GppGood,
  Badge, PersonAdd, Refresh,
} from '@mui/icons-material';

// ═══════════════════════════════════════════════════════════════════════════════
// PALETTE PROFESSIONNELLE
// ═══════════════════════════════════════════════════════════════════════════════
const T = {
  bg:        '#F8FAFC',
  surface:   '#FFFFFF',
  primary:   '#1E293B',
  secondary: '#334155',
  accent:    '#6366F1',
  accentH:   '#4F46E5',
  success:   '#10B981',
  warning:   '#F59E0B',
  danger:    '#EF4444',
  border:    '#E2E8F0',
  muted:     '#94A3B8',
  gradient:  'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
};

const STEPS = ['Vérification email', 'Code de sécurité', 'Votre compte'];

const INITIAL_FORM = {
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
  password2: '',
};

const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  if (score <= 1) return { score, label: 'Faible', color: T.danger };
  if (score <= 2) return { score, label: 'Moyen', color: T.warning };
  if (score <= 3) return { score, label: 'Bon', color: T.accent };
  return { score, label: 'Excellent', color: T.success };
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => v === '' || /^\d{8,15}$/.test(v.replace(/[\s.-]/g, ''));

// ═══════════════════════════════════════════════════════════════════════════════
// SOUS-COMPOSANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PasswordStrengthBar = ({ password }) => {
  const { score, label, color } = getPasswordStrength(password);
  if (!password) return null;
  return (
    <Box className="mt-2 mb-1">
      <Stack direction="row" spacing={0.5}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            className="flex-1 h-1.5 rounded-md transition-all duration-300"
            style={{
              backgroundColor: i <= score
                ? i <= 1 ? T.danger : i <= 2 ? T.warning : i <= 3 ? T.accent : T.success
                : T.border,
            }}
          />
        ))}
      </Stack>
      <Typography variant="caption" className="font-semibold mt-1 block" style={{ color }}>
        {label}
      </Typography>
    </Box>
  );
};

const StepCard = ({ active, completed, icon: Icon, title, subtitle }) => (
  <Box
    className={`
      flex items-center gap-1.5 p-1.5 rounded-xl transition-all duration-200
      ${active ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'}
    `}
  >
    <Box
      className={`
        w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200
        ${completed ? 'bg-green-50 text-green-500' : active ? 'bg-indigo-50 text-indigo-500' : 'bg-gray-50 text-gray-400'}
      `}
    >
      {completed ? <CheckCircle className="text-xl" /> : <Icon className="text-xl" />}
    </Box>
    <Box>
      <Typography variant="subtitle2" className={`font-bold leading-tight ${active ? 'text-indigo-600' : 'text-gray-800'}`}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" className="text-gray-400">{subtitle}</Typography>
      )}
    </Box>
  </Box>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const Register = () => {
  const navigate = useNavigate();
  const { requestOTP, verifyOTP, register } = useAuth();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState(null);

  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((p) => {
      const { [name]: _, ...r } = p;
      return r;
    });
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setGeneralError('Veuillez entrer une adresse email valide');
      return;
    }
    setLoading(true);
    setGeneralError(null);
    
    // ✅ Appel à l'API request-otp
    const result = await requestOTP(email);
    if (result.success) {
      setOtpSent(true);
      setStep(1);
    } else {
      setGeneralError(result.error || "Erreur lors de l'envoi du code");
    }
    setLoading(false);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      setGeneralError('Code invalide');
      return;
    }

    setLoading(true);
    setGeneralError(null);

    // ✅ Appel à l'API verify-otp
    const result = await verifyOTP(email, otpCode);

    if (result.success) {
      setStep(2);
    } else {
      setGeneralError(result.error || 'Code OTP invalide ou expiré');
    }
    setLoading(false);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setLoading(true);
    setGeneralError(null);
    const result = await requestOTP(email);
    if (!result.success) {
      setGeneralError(result.error || 'Erreur lors du renvoi');
    }
    setLoading(false);
  };

  const validateStep3 = useCallback(() => {
    const e = {};
    if (!formData.username.trim()) e.username = 'Requis';
    else if (formData.username.trim().length < 3) e.username = 'Minimum 3 caractères';
    else if (!/^[a-zA-Z0-9._-]+$/.test(formData.username.trim())) e.username = 'Caractères invalides (a-z, 0-9, . _ -)';

    if (!formData.first_name.trim()) e.first_name = 'Requis';
    if (!formData.last_name.trim()) e.last_name = 'Requis';

    if (formData.phone && !isValidPhone(formData.phone)) e.phone = 'Format invalide (uniquement des chiffres)';

    if (!formData.password) e.password = 'Requis';
    else if (formData.password.length < 8) e.password = 'Minimum 8 caractères';
    else if (!/[A-Z]/.test(formData.password)) e.password = 'Ajoutez une majuscule';
    else if (!/[0-9]/.test(formData.password)) e.password = 'Ajoutez un chiffre';

    if (formData.password !== formData.password2) e.password2 = 'Les mots de passe ne correspondent pas';

    return e;
  }, [formData]);

  const handleRegister = async (e) => {
    e.preventDefault();
    const errs = validateStep3();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setLoading(true);
    setGeneralError(null);

    const cleanPhone = formData.phone.replace(/\D/g, '');

    // ✅ Appel à l'API register
    const result = await register({
      username: formData.username.trim(),
      email: email,
      first_name: formData.first_name.trim(),
      last_name: formData.last_name.trim(),
      phone: cleanPhone,
      password: formData.password,
      password2: formData.password2,
    });

    if (result.success) {
      navigate('/login', { state: { message: 'Inscription réussie ! Vous pouvez vous connecter.' } });
    } else {
      const err = typeof result.error === 'object' ? result.error : { general: result.error || "Erreur lors de l'inscription" };
      setFormErrors(err);
      if (err.general) setGeneralError(err.general);
    }
    setLoading(false);
  };

  const pwdStrength = getPasswordStrength(formData.password);

  return (
    <Box
      className="min-h-screen flex items-center py-6"
      style={{
        backgroundColor: T.bg,
        backgroundImage: `
          radial-gradient(circle at 30% 20%, ${alpha(T.accent, 0.04)} 0%, transparent 50%),
          radial-gradient(circle at 70% 80%, ${alpha('#A855F7', 0.04)} 0%, transparent 50%)
        `,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={500}>
          <Paper
            elevation={0}
            className="p-7 md:p-10 rounded-2xl relative overflow-hidden"
            style={{ border: `1px solid ${T.border}` }}
          >
            {/* Bannière décorative */}
            <Box className="h-1 -mx-10 -mt-10 mb-0" style={{ background: T.gradient }} />

            {/* Logo / Marque */}
            <Box className="text-center mb-6 mt-4">
              <Box
                className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center"
                style={{ background: T.gradient, boxShadow: `0 6px 20px ${alpha(T.accent, 0.3)}` }}
              >
                <PersonAdd className="text-white text-2xl" />
              </Box>
              <Typography variant="h4" className="font-extrabold text-gray-800">
                Créer un compte
              </Typography>
              <Typography variant="body2" className="text-gray-400 mt-1.5">
                Rejoignez Madame Tibetia
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper
              activeStep={step}
              alternativeLabel
              className="mt-2 mb-5"
              sx={{
                '& .MuiStepLabel-label': { fontSize: '0.7rem', fontWeight: 600 },
                '& .MuiStepLabel-label.Mui-active': { color: T.accent },
                '& .MuiStepLabel-label.Mui-completed': { color: T.success },
                '& .MuiStepIcon-root.Mui-active': { color: T.accent },
                '& .MuiStepIcon-root.Mui-completed': { color: T.success },
                '& .MuiStepConnector-line': { borderColor: T.border },
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}><StepLabel>{label}</StepLabel></Step>
              ))}
            </Stepper>

            {/* Mini cartes d'étapes */}
            <Stack direction="row" spacing={1.5} className="mb-6">
              <StepCard active={step === 0} completed={step > 0} icon={Mail} title="Email" subtitle="Vérification" />
              <StepCard active={step === 1} completed={step > 1} icon={GppGood} title="Code" subtitle="Sécurité" />
              <StepCard active={step === 2} completed={false} icon={Badge} title="Compte" subtitle="Finalisation" />
            </Stack>

            {/* Alerte erreur générale */}
            {generalError && (
              <Alert
                severity="error"
                onClose={() => setGeneralError(null)}
                className="mb-5 rounded-xl"
              >
                {generalError}
              </Alert>
            )}

            {/* ══════════════════════ ÉTAPE 0 : EMAIL ══════════════════════ */}
            {step === 0 && (
              <Zoom in>
                <Box component="form" onSubmit={handleSendOTP} noValidate>
                  <Box className="mb-2">
                    <Typography variant="subtitle2" className="font-semibold text-gray-800 mb-1">
                      Votre adresse email
                    </Typography>
                    <Typography variant="caption" className="text-gray-400 block mb-3">
                      Un code de vérification vous sera envoyé à cette adresse
                    </Typography>
                  </Box>

                  <Box className="mb-6">
                    <TextField
                      fullWidth
                      required
                      autoFocus
                      label="Email"
                      type="email"
                      variant="outlined"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setGeneralError(null); }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email className="text-gray-400" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || !email}
                    endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForward />}
                    className="rounded-xl py-3.5 font-bold text-sm normal-case"
                    style={{
                      background: T.gradient,
                      boxShadow: `0 4px 14px ${alpha(T.accent, 0.35)}`,
                    }}
                    sx={{
                      '&:hover': { boxShadow: `0 6px 20px ${alpha(T.accent, 0.45)}` },
                      '&:disabled': { background: T.muted, boxShadow: 'none' },
                    }}
                  >
                    {loading ? 'Envoi en cours…' : 'Recevoir le code'}
                  </Button>
                </Box>
              </Zoom>
            )}

            {/* ══════════════════════ ÉTAPE 1 : OTP ══════════════════════ */}
            {step === 1 && (
              <Zoom in>
                <Box component="form" onSubmit={handleVerifyOTP} noValidate>
                  <Alert
                    severity="success"
                    icon={<Mail fontSize="small" />}
                    className="mb-5 rounded-xl"
                    sx={{ bgcolor: alpha(T.success, 0.06) }}
                  >
                    Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
                  </Alert>

                  <Box className="mb-2">
                    <Typography variant="subtitle2" className="font-semibold text-gray-800 mb-1">
                      Code de vérification
                    </Typography>
                    <Typography variant="caption" className="text-gray-400 block mb-3">
                      Entrez le code reçu par email
                    </Typography>
                  </Box>

                  <Box className="mb-6">
                    <TextField
                      fullWidth
                      required
                      autoFocus
                      label="Code OTP"
                      variant="outlined"
                      value={otpCode}
                      onChange={(e) => { setOtpCode(e.target.value.replace(/\D/g, '')); setGeneralError(null); }}
                      placeholder="000000"
                      inputProps={{
                        maxLength: 6,
                        inputMode: 'numeric',
                        style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '12px', fontWeight: 700 },
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading || otpCode.length < 4}
                    endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircle className="text-lg" />}
                    className="rounded-xl py-3.5 font-bold text-sm normal-case"
                    style={{
                      background: T.gradient,
                      boxShadow: `0 4px 14px ${alpha(T.accent, 0.35)}`,
                    }}
                    sx={{
                      '&:hover': { boxShadow: `0 6px 20px ${alpha(T.accent, 0.45)}` },
                      '&:disabled': { background: T.muted, boxShadow: 'none' },
                    }}
                  >
                    {loading ? 'Vérification…' : 'Vérifier le code'}
                  </Button>

                  <Stack direction="row" justifyContent="center" spacing={2} className="mt-5">
                    <Button
                      variant="text"
                      size="small"
                      onClick={() => setStep(0)}
                      startIcon={<ArrowBack className="text-base" />}
                      className="text-gray-400 normal-case"
                    >
                      Modifier l'email
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      onClick={handleResendOTP}
                      disabled={resendCooldown > 0}
                      startIcon={<Refresh className="text-base" />}
                      className="text-indigo-500 normal-case"
                    >
                      {resendCooldown > 0 ? `Renvoyer (${resendCooldown}s)` : 'Renvoyer le code'}
                    </Button>
                  </Stack>
                </Box>
              </Zoom>
            )}

            {/* ══════════════════════ ÉTAPE 2 : INSCRIPTION ══════════════════════ */}
            {step === 2 && (
              <Fade in timeout={300}>
                <Box component="form" onSubmit={handleRegister} noValidate>
                  <Box className="mb-5">
                    <Typography variant="subtitle2" className="font-semibold text-gray-800 mb-1">
                      Finalisez votre profil
                    </Typography>
                    <Typography variant="caption" className="text-gray-400 block">
                      Ces informations apparaîtront sur votre compte
                    </Typography>
                  </Box>

                  {formErrors.general && (
                    <Alert severity="error" className="mb-5 rounded-xl">
                      {formErrors.general}
                    </Alert>
                  )}

                  {/* Nom d'utilisateur */}
                  <Box className="mb-5">
                    <TextField
                      fullWidth
                      required
                      label="Nom d'utilisateur"
                      name="username"
                      variant="outlined"
                      placeholder="mon_pseudo"
                      value={formData.username}
                      onChange={handleChange}
                      error={!!formErrors.username}
                      helperText={formErrors.username || 'Visible publiquement (3+ caractères)'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Badge className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  {/* Email (lecture seule) */}
                  <Box className="mb-2">
                    <TextField
                      fullWidth
                      label="Email"
                      variant="outlined"
                      value={email}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Email className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>
                  <Button
                    variant="text"
                    size="small"
                    onClick={() => setStep(0)}
                    className="text-gray-400 normal-case mb-5 -ml-1"
                  >
                    Modifier l'email
                  </Button>

                  <Divider className="mb-5" style={{ borderColor: T.border }} />

                  {/* Prénom + Nom */}
                  <Box className="flex gap-4 mb-5">
                    <TextField
                      fullWidth
                      required
                      label="Prénom"
                      name="first_name"
                      variant="outlined"
                      value={formData.first_name}
                      onChange={handleChange}
                      error={!!formErrors.first_name}
                      helperText={formErrors.first_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Person className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Nom"
                      name="last_name"
                      variant="outlined"
                      value={formData.last_name}
                      onChange={handleChange}
                      error={!!formErrors.last_name}
                      helperText={formErrors.last_name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Person className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  {/* Téléphone */}
                  <Box className="mb-5">
                    <TextField
                      fullWidth
                      label="Téléphone"
                      name="phone"
                      variant="outlined"
                      placeholder="0123456789"
                      value={formData.phone}
                      onChange={handleChange}
                      error={!!formErrors.phone}
                      helperText={formErrors.phone || 'Optionnel - uniquement des chiffres (8 à 15 chiffres)'}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Phone className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  <Divider className="mb-5" style={{ borderColor: T.border }} />

                  {/* Mot de passe */}
                  <Box className="mb-2">
                    <TextField
                      fullWidth
                      required
                      label="Mot de passe"
                      name="password"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      error={!!formErrors.password}
                      helperText={formErrors.password}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Lock className="text-gray-400" /></InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: pwdStrength.score >= 3 ? T.success : T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                    <PasswordStrengthBar password={formData.password} />
                  </Box>

                  {/* Confirmation mot de passe */}
                  <Box className="mb-6 mt-4">
                    <TextField
                      fullWidth
                      required
                      label="Confirmer le mot de passe"
                      name="password2"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password2}
                      onChange={handleChange}
                      error={!!formErrors.password2}
                      helperText={formErrors.password2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start"><Lock className="text-gray-400" /></InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '12px',
                          '&.Mui-focused fieldset': { borderColor: T.accent },
                          '& fieldset': { borderColor: T.border },
                        },
                      }}
                    />
                  </Box>

                  {/* Bouton final */}
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PersonAdd className="text-lg" />}
                    className="rounded-xl py-4 font-bold text-base normal-case"
                    style={{
                      background: T.gradient,
                      boxShadow: `0 4px 18px ${alpha(T.accent, 0.4)}`,
                    }}
                    sx={{
                      '&:hover': { boxShadow: `0 6px 24px ${alpha(T.accent, 0.5)}` },
                      '&:disabled': { background: T.muted, boxShadow: 'none' },
                    }}
                  >
                    {loading ? 'Création du compte…' : "S'inscrire"}
                  </Button>
                </Box>
              </Fade>
            )}

            {/* Lien connexion */}
            <Box className="mt-6 text-center">
              <Typography variant="body2" className="text-gray-400">
                Déjà un compte ?{' '}
                <Link
                  to="/login"
                  className="text-indigo-500 font-bold no-underline hover:text-indigo-600 transition-colors"
                >
                  Se connecter
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Container>
    </Box>
  );
};

export default Register;