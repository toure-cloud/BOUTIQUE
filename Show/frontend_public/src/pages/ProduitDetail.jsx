// frontend_public/src/pages/ProduitDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Button, Chip, IconButton, Paper,
  Divider, InputAdornment, Alert, Snackbar, Dialog, DialogTitle,
  DialogContent, DialogActions, CircularProgress, Rating,
  Breadcrumbs, Stack, TextField,
} from '@mui/material';
import {
  ArrowBack, Add, Remove, Favorite, FavoriteBorder, LocalOffer,
  ShoppingBag, CheckCircle, Payment, Person, Email, Phone, LocationOn,
  Lock, Verified, Share, Home,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import { panierService } from '../services/panierService';
import heroImage from '../assets/images/tibetia.jpeg';

const ProduitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [favoris, setFavoris] = useState(false);
  const [imagesSecondaires, setImagesSecondaires] = useState([]);
  const [imagePrincipale, setImagePrincipale] = useState('');
  const [client, setClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchProduit = async () => {
      try {
        setLoading(true);
        const data = await produitService.getProduitById(parseInt(id));
        setProduit(data);
        setImagePrincipale(data.image_principale);
        if (data.images_secondaires && data.images_secondaires.length > 0) {
          setImagesSecondaires(data.images_secondaires);
        }
        setError(null);
      } catch (err) {
        setError('Impossible de charger les détails du produit');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduit();
  }, [id]);

  useEffect(() => {
    const storedClient = localStorage.getItem('client_data');
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    }
  }, []);

  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);
  const prixTotal = () => (produit?.prix_promotion || produit?.prix || 0) * quantite;
  const imageUrl = produit?.image_url || produit?.image_principale || heroImage;

  const handleAjouterAuPanier = async () => {
  if (!client) {
    navigate('/login');
    return;
  }
  try {
    await panierService.ajouterProduit(client.id, produit.id, quantite);
    setSnackbar({ open: true, message: '✅ Ajouté au panier !', severity: 'success' });
  } catch (error) {
    // ✅ Si le client n'existe plus côté backend, on le déconnecte
    if (error.response?.status === 404) {
      localStorage.removeItem('client_data');
      setClient(null);
      setSnackbar({ open: true, message: 'Votre session a expiré. Veuillez vous reconnecter.', severity: 'warning' });
      setTimeout(() => navigate('/login'), 1500);
    } else {
      setSnackbar({ open: true, message: '❌ Erreur lors de l\'ajout au panier', severity: 'error' });
    }
  }
};

  const toggleFavori = () => {
    setFavoris(!favoris);
    setSnackbar({ open: true, message: favoris ? 'Retiré des favoris' : 'Ajouté aux favoris', severity: 'success' });
  };

  const handleShare = async () => {
    try {
      await navigator.share({ title: produit?.nom, text: `Découvrez ${produit?.nom} sur Madame Tibetia`, url: window.location.href });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      setSnackbar({ open: true, message: 'Lien copié !', severity: 'success' });
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#1A1A1A' }} />
      </Box>
    );
  }

  if (error || !produit) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Alert severity="error">{error || 'Produit non trouvé'}</Alert>
        <Button component={Link} to="/boutique" variant="contained" startIcon={<ArrowBack />} sx={{ mt: 3, borderRadius: 50 }}>
          Retour à la boutique
        </Button>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="contained" startIcon={<ShoppingBag />} onClick={() => navigate('/panier')} sx={{ backgroundColor: '#1A1A1A', color: '#fff', borderRadius: '50px', px: 3 }}>
            Mon Panier {client ? `(${client.prenom})` : ''}
          </Button>
        </Box>

        <Breadcrumbs sx={{ mb: 3 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>
            <Home sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} /> Accueil
          </Link>
          <Link to="/boutique" style={{ textDecoration: 'none', color: '#666' }}>Boutique</Link>
          <Typography color="text.primary">{produit.nom}</Typography>
        </Breadcrumbs>

        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ borderRadius: 3, overflow: 'hidden', border: '1px solid #EEE', position: 'sticky', top: 100 }}>
              <Box sx={{ position: 'relative', backgroundColor: '#F9F9F9' }}>
                {produit.est_en_promotion && produit.prix_promotion && (
                  <Chip
                    icon={<LocalOffer sx={{ fontSize: 14, color: '#fff !important' }} />}
                    label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                    sx={{ position: 'absolute', top: 16, left: 16, backgroundColor: '#C62828', color: '#fff', fontWeight: 700, zIndex: 2, height: 26 }}
                  />
                )}
                <Box component="img" src={imageUrl} alt={produit.nom} onError={(e) => { e.target.onerror = null; e.target.src = heroImage; }} sx={{ width: '100%', height: { xs: 300, md: 500 }, objectFit: 'cover' }} />
                <IconButton onClick={toggleFavori} sx={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', '&:hover': { backgroundColor: '#fff' }, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  {favoris ? <Favorite sx={{ color: '#C62828' }} /> : <FavoriteBorder />}
                </IconButton>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="overline" sx={{ color: '#999', fontWeight: 700, letterSpacing: 1.5 }}>{produit.categorie}</Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#1A1A1A', mb: 1 }}>{produit.nom}</Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Rating value={parseFloat(produit.note || 4.5)} precision={0.5} readOnly sx={{ color: '#D4A017' }} />
                <Typography variant="body2" sx={{ color: '#888' }}>({produit.nb_avis || 0} avis)</Typography>
              </Box>

              <Box sx={{ mb: 2.5 }}>
                {produit.est_en_promotion && produit.prix_promotion ? (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#C62828' }}>{formatPrice(produit.prix_promotion)}</Typography>
                    <Typography variant="h6" sx={{ color: '#AAA', textDecoration: 'line-through' }}>{formatPrice(produit.prix)}</Typography>
                  </Box>
                ) : (
                  <Typography variant="h4" sx={{ fontWeight: 800, color: '#1A1A1A' }}>{formatPrice(produit.prix)}</Typography>
                )}
              </Box>

              <Box sx={{ mb: 2.5 }}>
                <Chip icon={<CheckCircle sx={{ fontSize: 16, color: '#2E7D32 !important' }} />} label={`En stock (${produit.quantite_stock} pièces)`} sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, height: 28 }} />
              </Box>

              <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 3 }}>{produit.description || 'Aucune description disponible.'}</Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>Quantité :</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #DDD', borderRadius: 50, overflow: 'hidden' }}>
                  <IconButton size="small" onClick={() => setQuantite(Math.max(1, quantite - 1))} sx={{ p: 1.5 }}><Remove fontSize="small" /></IconButton>
                  <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>{quantite}</Typography>
                  <IconButton size="small" onClick={() => setQuantite(quantite + 1)} sx={{ p: 1.5 }}><Add fontSize="small" /></IconButton>
                </Box>
                <Typography variant="body1" sx={{ color: '#888' }}>
                  Total : <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{formatPrice(prixTotal())}</span>
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleAjouterAuPanier}
                  disabled={produit.quantite_stock <= 0}
                  startIcon={<ShoppingBag />}
                  sx={{ backgroundColor: '#1A1A1A', color: '#fff', borderRadius: 50, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { backgroundColor: '#333' } }}
                >
                  Ajouter au panier
                </Button>
                <IconButton onClick={toggleFavori} sx={{ border: '1px solid #E0E0E0', borderRadius: 50, width: 48, height: 48 }}>
                  {favoris ? <Favorite sx={{ color: '#C62828' }} /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare} sx={{ border: '1px solid #E0E0E0', borderRadius: 50, width: 48, height: 48 }}>
                  <Share />
                </IconButton>
              </Box>

              <Alert severity="info" icon={<Verified />} sx={{ borderRadius: 2, backgroundColor: '#F5F5F5', border: '1px solid #E0E0E0' }}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1A1A1A' }}>Conditions de vente</Typography>
                <Typography variant="caption" sx={{ color: '#666' }}>
                  • Aucun remboursement n'est autorisé<br />
                  • Aucun retour de produit n'est accepté<br />
                  • Sauf si la commande est erronée ou produit défectueux
                </Typography>
              </Alert>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: 2.5 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProduitDetail;