// frontend_public/src/pages/ProduitDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Chip, IconButton, Grid,
  CircularProgress, Alert, Divider, Breadcrumbs, Paper, Rating,
} from '@mui/material';
import {
  ArrowBack, ShoppingBag, Favorite, FavoriteBorder, Share,
  CheckCircle, Add, Remove, LocalOffer, LocalShipping, Verified,
  Payment, Security, Home,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';

const ProduitDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await produitService.getProduitById(id);
      setProduit(data);
    } catch (err) {
      setError('Impossible de charger le produit.');
    } finally {
      setLoading(false);
    }
  };

  const ajouterAuPanier = () => {
    const saved = localStorage.getItem('tibetia_panier');
    let currentPanier = {};
    if (saved) {
      try { currentPanier = JSON.parse(saved); } catch (e) {}
    }
    const newPanier = { ...currentPanier, [produit.id]: (currentPanier[produit.id] || 0) + quantite };
    localStorage.setItem('tibetia_panier', JSON.stringify(newPanier));
    navigate('/panier');
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);
  const formatPrice = (price) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);

  // ✅ CORRECTION MAJEURE : Utiliser directement image_url SANS AUCUNE CONCATÉNATION
  const imageUrl = produit?.image_url || produit?.image_principale || heroImage;

  if (loading) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress sx={{ color: '#1A1A1A' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" action={<Button color="inherit" onClick={fetchProduit}>Réessayer</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!produit) return null;

  return (
    <Box sx={{ py: 4, backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 3, '& .MuiBreadcrumbs-separator': { color: '#999' } }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#666' }}>
            <Home sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
            Accueil
          </Link>
          <Link to="/boutique" style={{ textDecoration: 'none', color: '#666' }}>
            Boutique
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>{produit.nom}</Typography>
        </Breadcrumbs>

        <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 3, color: '#666', textTransform: 'none' }}>
          Retour à la boutique
        </Button>

        <Grid container spacing={4}>
          {/* ========== IMAGE ========== */}
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
                {/* ✅ IMAGE CORRECTE : Utilise l'URL complète fournie par le backend */}
                <Box
                  component="img"
                  src={imageUrl}
                  alt={produit.nom}
                  onError={(e) => { e.target.onerror = null; e.target.src = heroImage; }}
                  sx={{ width: '100%', height: { xs: 300, md: 500 }, objectFit: 'cover', transition: 'transform 0.3s ease' }}
                />
                <IconButton
                  onClick={toggleFavorite}
                  sx={{ position: 'absolute', top: 16, right: 16, backgroundColor: 'rgba(255,255,255,0.9)', '&:hover': { backgroundColor: '#fff' }, boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
                >
                  {isFavorite ? <Favorite sx={{ color: '#C62828' }} /> : <FavoriteBorder />}
                </IconButton>
              </Box>

              {produit.images_secondaires && produit.images_secondaires.length > 0 && (
                <Box sx={{ p: 2, display: 'flex', gap: 1.5, justifyContent: 'center', backgroundColor: '#FFF' }}>
                  {produit.images_secondaires.map((img, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={img.image_url || heroImage}
                      alt={`Vue ${index + 1}`}
                      sx={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 2, border: index === 0 ? '2px solid #1A1A1A' : '1px solid #DDD', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { borderColor: '#1A1A1A' } }}
                    />
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>

          {/* ========== DÉTAILS ========== */}
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

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Chip icon={<CheckCircle sx={{ fontSize: 16, color: '#2E7D32 !important' }} />} label={`En stock (${produit.quantite_stock} pièces)`} sx={{ backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, height: 28 }} />
                {produit.est_disponible === false && <Chip label="Indisponible" sx={{ backgroundColor: '#FFEBEE', color: '#C62828', fontWeight: 600, height: 28 }} />}
              </Box>

              <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 3 }}>{produit.description || 'Aucune description disponible.'}</Typography>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <Typography variant="body1" sx={{ fontWeight: 600, color: '#333' }}>Quantité :</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #DDD', borderRadius: 50, overflow: 'hidden' }}>
                  <IconButton size="small" onClick={() => setQuantite(Math.max(1, quantite - 1))} sx={{ p: 1.5 }}><Remove fontSize="small" /></IconButton>
                  <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 700 }}>{quantite}</Typography>
                  <IconButton size="small" onClick={() => setQuantite(quantite + 1)} sx={{ p: 1.5 }}><Add fontSize="small" /></IconButton>
                </Box>
                <Typography variant="body1" sx={{ color: '#888' }}>Total : <span style={{ fontWeight: 800, color: '#1A1A1A' }}>{formatPrice((produit.prix_promotion || produit.prix) * quantite)}</span></Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Button variant="contained" onClick={ajouterAuPanier} startIcon={<ShoppingBag />} disabled={!produit.est_disponible || produit.quantite_stock === 0} sx={{ backgroundColor: '#1A1A1A', color: '#fff', borderRadius: 50, px: 4, py: 1.5, fontWeight: 600, flexGrow: 1, maxWidth: 300, '&:hover': { backgroundColor: '#333' } }}>
                  Ajouter au panier
                </Button>
                <IconButton onClick={toggleFavorite} sx={{ border: '1px solid #DDD', width: 48, height: 48, '&:hover': { backgroundColor: '#F5F5F5' } }}>
                  {isFavorite ? <Favorite sx={{ color: '#C62828' }} /> : <FavoriteBorder />}
                </IconButton>
                <IconButton sx={{ border: '1px solid #DDD', width: 48, height: 48, '&:hover': { backgroundColor: '#F5F5F5' } }} onClick={() => navigator.clipboard.writeText(window.location.href)}>
                  <Share />
                </IconButton>
              </Box>

              <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                  { icon: <LocalShipping />, title: 'Livraison rapide', subtitle: 'Sous 48h à 72h' },
                  { icon: <Verified />, title: 'Produit authentique', subtitle: 'Qualité garantie' },
                  { icon: <Payment />, title: 'Paiement sécurisé', subtitle: 'Mobile Money & CB' },
                  { icon: <Security />, title: 'Retour facile', subtitle: 'Sous 7 jours' },
                ].map((item, index) => (
                  <Grid item xs={6} sm={3} key={index}>
                    <Box sx={{ textAlign: 'center', p: 1.5 }}>
                      <Box sx={{ color: '#1A1A1A', mb: 0.5 }}>{item.icon}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#333' }}>{item.title}</Typography>
                      <Typography variant="caption" sx={{ color: '#888' }}>{item.subtitle}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProduitDetail;