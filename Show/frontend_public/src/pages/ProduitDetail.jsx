// frontend_public/src/pages/ProduitDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Chip,
  IconButton,
  Paper,
  Divider,
  TextField,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Skeleton,
  Avatar,
  Stack,
  Rating,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Remove,
  Favorite,
  FavoriteBorder,
  Star,
  LocalOffer,
  ShoppingBag,
  CheckCircle,
  Payment,
  Person,
  Email,
  Phone,
  LocationOn,
  Lock,
  Verified,
  Share,
  Visibility,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';

const ProduitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ État
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [favoris, setFavoris] = useState(false);
  const [panier, setPanier] = useState({});
  const [imagePrincipale, setImagePrincipale] = useState('');
  const [imagesSecondaires, setImagesSecondaires] = useState([]);

  // ✅ Formulaire de commande
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville: '',
    codePostal: '',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // ✅ États UI
  const [commandeOk, setCommandeOk] = useState(false);
  const [loadingPaiement, setLoadingPaiement] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // ✅ Chargement du produit
  useEffect(() => {
    const fetchProduit = async () => {
      try {
        setLoading(true);
        const data = await produitService.getProduitById(parseInt(id));
        console.log('📋 Produit reçu:', data);
        setProduit(data);
        setImagePrincipale(data.image_principale);
        
        // Récupérer les images secondaires
        if (data.images_secondaires && data.images_secondaires.length > 0) {
          setImagesSecondaires(data.images_secondaires);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Erreur:', err);
        setError('Impossible de charger les détails du produit');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProduit();
    }
  }, [id]);

  // ✅ Récupérer le panier depuis localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tibetia_panier');
    if (saved) {
      try {
        setPanier(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tibetia_panier', JSON.stringify(panier));
  }, [panier]);

  // ✅ Gestion du formulaire
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (formErrors[e.target.name]) {
      setFormErrors({ ...formErrors, [e.target.name]: null });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.nom.trim()) errors.nom = 'Le nom est requis';
    if (!formData.prenom.trim()) errors.prenom = 'Le prénom est requis';
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email invalide';
    }
    if (!formData.telephone.trim()) errors.telephone = 'Le téléphone est requis';
    if (!formData.adresse.trim()) errors.adresse = "L'adresse est requise";
    if (!formData.ville.trim()) errors.ville = 'La ville est requise';
    if (!formData.codePostal.trim()) errors.codePostal = 'Le code postal est requis';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ✅ Gestion de la commande
  const handleCommande = () => {
    if (!validateForm()) return;
    setConfirmDialogOpen(true);
  };

  const handleConfirmerCommande = () => {
    setConfirmDialogOpen(false);
    setLoadingPaiement(true);

    setTimeout(() => {
      setLoadingPaiement(false);
      setCommandeOk(true);
      setSnackbarMessage('✅ Commande confirmée !');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      const newPanier = { ...panier, [produit.id]: (panier[produit.id] || 0) + quantite };
      setPanier(newPanier);
      localStorage.setItem('tibetia_panier', JSON.stringify(newPanier));
    }, 2000);
  };

  // ✅ Gestion du panier
  const ajouterAuPanier = () => {
    const newPanier = { ...panier, [produit.id]: (panier[produit.id] || 0) + quantite };
    setPanier(newPanier);
    localStorage.setItem('tibetia_panier', JSON.stringify(newPanier));
    setSnackbarMessage(`✅ ${produit.nom} ajouté au panier !`);
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  const updateQuantite = (delta) => {
    setQuantite((prev) => Math.max(1, Math.min(prev + delta, produit?.quantite_stock || 10)));
  };

  // ✅ Favoris
  const toggleFavori = () => {
    setFavoris(!favoris);
    setSnackbarMessage(favoris ? 'Retiré des favoris' : 'Ajouté aux favoris');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // ✅ Partage
  const handleShare = async () => {
    try {
      await navigator.share({
        title: produit?.nom,
        text: `Découvrez ${produit?.nom} sur Madame Tibetia`,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setSnackbarMessage('Lien copié dans le presse-papier !');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    }
  };

  // ✅ Utilitaires
  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  const prixTotal = () => {
    const prix = produit?.prix_promotion || produit?.prix || 0;
    return prix * quantite;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return heroImage;
    return `${import.meta.env.VITE_MEDIA_URL}${imagePath}`;
  };

  // ✅ Skeleton de chargement
  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="text" width={200} height={40} sx={{ mb: 3 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="text" height={40} width="60%" />
              <Skeleton variant="text" height={30} width="40%" sx={{ mt: 2 }} />
              <Skeleton variant="text" height={100} sx={{ mt: 2 }} />
              <Skeleton variant="rectangular" height={50} sx={{ mt: 3, borderRadius: 50 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error || !produit) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}>
          {error || 'Produit non trouvé'}
        </Alert>
        <Button
          component={Link}
          to="/boutique"
          variant="contained"
          startIcon={<ArrowBack />}
          sx={{ mt: 3, borderRadius: 50 }}
        >
          Retour à la boutique
        </Button>
      </Container>
    );
  }

  // Images du produit
  const allImages = [produit.image_principale, ...(produit.images_secondaires?.map(img => img.image) || [])];
  const imagePrincipalUrl = getImageUrl(imagePrincipale || produit.image_principale);

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* ===== BOUTON RETOUR ===== */}
        <Button
          component={Link}
          to="/boutique"
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: '#666', fontWeight: 500 }}
        >
          Retour à la boutique
        </Button>

        {/* ===== GRILLE PRINCIPALE ===== */}
        <Grid container spacing={3}>
          
          {/* ===== COLONNE 1 : MINIATURES ===== */}
          <Grid item xs={12} sm={2} md={2}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'column' },
                gap: 1.5,
                overflowX: { xs: 'auto', sm: 'visible' },
                pb: { xs: 2, sm: 0 },
              }}
            >
              {allImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setImagePrincipale(img)}
                  onMouseEnter={() => setImagePrincipale(img)}
                  sx={{
                    width: { xs: 70, sm: '100%' },
                    height: { xs: 70, sm: 80 },
                    minWidth: { xs: 70, sm: 'auto' },
                    borderRadius: 2,
                    overflow: 'hidden',
                    border: imagePrincipale === img ? '3px solid #2E7D32' : '2px solid #E8E8E8',
                    cursor: 'pointer',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      borderColor: '#66BB6A',
                      transform: 'scale(1.05)',
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={getImageUrl(img)}
                    alt={`Vue ${index + 1}`}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Grid>

          {/* ===== COLONNE 2 : IMAGE PRINCIPALE ===== */}
          <Grid item xs={12} sm={6} md={5}>
            <Paper
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                backgroundColor: '#FFF',
                border: '1px solid #EEE',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={imagePrincipalUrl}
                alt={produit.nom}
                sx={{
                  width: '100%',
                  height: { xs: 300, sm: 400, md: 500 },
                  objectFit: 'cover',
                }}
              />
              {produit.est_en_promotion && produit.prix_promotion && (
                <Chip
                  icon={<LocalOffer sx={{ fontSize: 16, color: '#fff !important' }} />}
                  label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    backgroundColor: '#C62828',
                    color: '#fff',
                    fontWeight: 700,
                    height: 32,
                  }}
                />
              )}
              {/* Badge stock */}
              {produit.quantite_stock <= 5 && produit.quantite_stock > 0 && (
                <Chip
                  label={`⚠️ Plus que ${produit.quantite_stock} pièces`}
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    backgroundColor: '#FFA726',
                    color: '#fff',
                    fontWeight: 700,
                  }}
                />
              )}
            </Paper>
          </Grid>

          {/* ===== COLONNE 3 : DÉTAILS ===== */}
          <Grid item xs={12} sm={4} md={5}>
            <Paper
              sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 3,
                border: '1px solid #EEE',
                backgroundColor: '#FFF',
                height: '100%',
              }}
            >
              {/* Catégorie */}
              <Typography
                variant="overline"
                sx={{
                  color: '#999',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  letterSpacing: 1,
                  display: 'block',
                  mb: 0.5,
                }}
              >
                {produit.categorie}
              </Typography>

              {/* Nom */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#1A1A1A',
                  fontFamily: '"Playfair Display", serif',
                  mb: 1.5,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                }}
              >
                {produit.nom}
              </Typography>

              {/* Note étoiles */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating
                  value={produit.note || 4.5}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{ color: '#D4A017' }}
                />
                <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>
                  ({produit.nb_avis || 0} avis)
                </Typography>
              </Box>

              {/* Prix */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                {produit.est_en_promotion && produit.prix_promotion ? (
                  <>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 700,
                        color: '#C62828',
                        fontSize: { xs: '1.6rem', md: '2rem' },
                      }}
                    >
                      {formatPrice(produit.prix_promotion)}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#AAA',
                        textDecoration: 'line-through',
                        fontSize: '1rem',
                      }}
                    >
                      {formatPrice(produit.prix)}
                    </Typography>
                    <Chip
                      label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                      size="small"
                      sx={{ backgroundColor: '#C62828', color: '#fff', fontWeight: 700 }}
                    />
                  </>
                ) : (
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 700,
                      color: '#1A1A1A',
                      fontSize: { xs: '1.6rem', md: '2rem' },
                    }}
                  >
                    {formatPrice(produit.prix)}
                  </Typography>
                )}
              </Box>

              {/* Stock */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={
                    produit.quantite_stock > 0
                      ? `✅ En stock (${produit.quantite_stock} pièces)`
                      : '❌ Rupture de stock'
                  }
                  sx={{
                    backgroundColor: produit.quantite_stock > 0 ? '#E8F5E9' : '#FFEBEE',
                    color: produit.quantite_stock > 0 ? '#2E7D32' : '#C62828',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Description */}
              <Typography
                variant="body1"
                sx={{
                  color: '#555',
                  lineHeight: 1.8,
                  mb: 3,
                }}
              >
                {produit.description}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Quantité */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  mb: 3,
                  flexWrap: 'wrap',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Quantité :
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#F5F5F5',
                    borderRadius: 50,
                    px: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => updateQuantite(-1)}
                    disabled={quantite <= 1}
                  >
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>
                    {quantite}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => updateQuantite(1)}
                    disabled={quantite >= produit.quantite_stock}
                  >
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Total : <strong style={{ color: '#1A1A1A' }}>
                    {formatPrice(prixTotal())}
                  </strong>
                </Typography>
              </Box>

              {/* Boutons */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={ajouterAuPanier}
                  disabled={produit.quantite_stock <= 0}
                  startIcon={<ShoppingBag />}
                  sx={{
                    backgroundColor: '#1A1A1A',
                    color: '#fff',
                    borderRadius: 50,
                    py: 1.5,
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#333' },
                    '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#999' },
                  }}
                >
                  Ajouter au panier
                </Button>
                <IconButton
                  onClick={toggleFavori}
                  sx={{
                    border: '1px solid #E0E0E0',
                    borderRadius: 50,
                    width: 56,
                    height: 56,
                  }}
                >
                  {favoris ? (
                    <Favorite sx={{ color: '#C62828' }} />
                  ) : (
                    <FavoriteBorder />
                  )}
                </IconButton>
                <IconButton
                  onClick={handleShare}
                  sx={{
                    border: '1px solid #E0E0E0',
                    borderRadius: 50,
                    width: 56,
                    height: 56,
                  }}
                >
                  <Share />
                </IconButton>
              </Box>

              {/* Conditions de vente */}
              <Alert
                severity="info"
                icon={<Verified />}
                sx={{
                  borderRadius: 2,
                  backgroundColor: '#F5F5F5',
                  border: '1px solid #E0E0E0',
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A1A' }}>
                  Conditions de vente
                </Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  • Aucun remboursement n'est autorisé<br />
                  • Aucun retour de produit n'est accepté<br />
                  • Sauf si la commande est erronée ou produit défectueux
                </Typography>
              </Alert>
            </Paper>
          </Grid>
        </Grid>

        {/* ===== FORMULAIRE DE COMMANDE ===== */}
        <Paper
          sx={{
            mt: 4,
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid #EEE',
            backgroundColor: '#FFF',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              fontFamily: '"Playfair Display", serif',
              color: '#1A1A1A',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <Payment sx={{ color: '#2E7D32' }} />
            Passer commande
          </Typography>

          {!commandeOk ? (
            <Box>
              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Nom *"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    error={!!formErrors.nom}
                    helperText={formErrors.nom}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#2E7D32' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Prénom *"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    error={!!formErrors.prenom}
                    helperText={formErrors.prenom}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#2E7D32' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#2E7D32' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Téléphone *"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    error={!!formErrors.telephone}
                    helperText={formErrors.telephone}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: '#2E7D32' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adresse de livraison *"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    error={!!formErrors.adresse}
                    helperText={formErrors.adresse}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#2E7D32' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ville *"
                    name="ville"
                    value={formData.ville}
                    onChange={handleChange}
                    error={!!formErrors.ville}
                    helperText={formErrors.ville}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Code postal *"
                    name="codePostal"
                    value={formData.codePostal}
                    onChange={handleChange}
                    error={!!formErrors.codePostal}
                    helperText={formErrors.codePostal}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Notes / Instructions (optionnel)"
                    name="notes"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>

              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total :{' '}
                    <strong style={{ color: '#1A1A1A', fontSize: '1.2rem' }}>
                      {formatPrice(prixTotal())}
                    </strong>
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999', display: 'block' }}>
                    Livraison estimée : 3-5 jours ouvrés
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={handleCommande}
                  disabled={produit.quantite_stock <= 0}
                  startIcon={<Payment />}
                  sx={{
                    backgroundColor: '#2E7D32',
                    color: '#fff',
                    borderRadius: 50,
                    px: 4,
                    py: 1.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    '&:hover': { backgroundColor: '#1B5E20' },
                    '&.Mui-disabled': { backgroundColor: '#E0E0E0', color: '#999' },
                  }}
                >
                  Confirmer la commande
                </Button>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircle sx={{ fontSize: 80, color: '#2E7D32', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1A1A1A', mb: 1 }}>
                ✅ Commande confirmée !
              </Typography>
              <Typography sx={{ color: '#666', mb: 3 }}>
                Vous recevrez un email de confirmation avec les détails de votre commande.
              </Typography>
              <Button
                component={Link}
                to="/boutique"
                variant="contained"
                sx={{
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  borderRadius: 50,
                  px: 4,
                  py: 1.2,
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                Continuer vos achats
              </Button>
            </Box>
          )}
        </Paper>

        {/* ===== POLITIQUE DE CONFIDENTIALITÉ ===== */}
        <Paper
          sx={{
            mt: 3,
            p: 3,
            borderRadius: 3,
            border: '1px solid #E8F5E9',
            backgroundColor: '#FAFFFA',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Lock sx={{ color: '#2E7D32' }} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1A1A1A' }}>
              Politique de confidentialité
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.8, fontSize: '0.9rem' }}>
            • Vos données personnelles sont sécurisées et ne seront jamais partagées avec des tiers.<br />
            • Aucun remboursement n'est autorisé après validation de la commande.<br />
            • Aucun retour de produit n'est accepté, sauf en cas de produit défectueux ou de commande erronée.<br />
            • Vous disposez d'un délai de 14 jours pour signaler tout problème concernant votre commande.<br />
            • Pour toute question, contactez-nous à <strong>contact@madametibetia.com</strong>
          </Typography>
        </Paper>
      </Container>

      {/* ===== DIALOG CONFIRMATION ===== */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px', p: 1 },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>💳 Confirmation de la commande</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Vous confirmez la commande de <strong>{quantite} x {produit.nom}</strong> pour un total de{' '}
            <strong style={{ color: '#2E7D32', fontSize: '1.2rem' }}>
              {formatPrice(prixTotal())}
            </strong>
          </Typography>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            ⚠️ Aucun remboursement n'est autorisé après confirmation.
          </Alert>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#F5F5F5', borderRadius: 2 }}>
            <Typography variant="caption" sx={{ color: '#666' }}>
              Livraison à : {formData.adresse}, {formData.codePostal} {formData.ville}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Annuler</Button>
          <Button
            onClick={handleConfirmerCommande}
            variant="contained"
            disabled={loadingPaiement}
            sx={{
              backgroundColor: '#2E7D32',
              '&:hover': { backgroundColor: '#1B5E20' },
              borderRadius: 50,
              px: 3,
            }}
          >
            {loadingPaiement ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              'Confirmer'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ borderRadius: 2.5, width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProduitDetail;