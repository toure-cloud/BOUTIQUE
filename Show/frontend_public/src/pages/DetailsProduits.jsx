// frontend_public/src/pages/ProduitDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Typography, Button, Chip, IconButton, Grid,
  CircularProgress, Alert, Divider, Breadcrumbs, Rating, Skeleton,
} from '@mui/material';
import {
  ArrowBack, ShoppingBag, Favorite, FavoriteBorder, Share,
  CheckCircle, Add, Remove, LocalOffer, LocalShipping, Verified,
  Payment, Security, Home, NavigateNext,
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
  const [selectedImage, setSelectedImage] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await produitService.getProduitById(id);
      setProduit(data);
      // Image principale par défaut
      setSelectedImage(data?.image_url || data?.image_principale || heroImage);
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
      try {
        currentPanier = JSON.parse(saved);
      } catch (e) {}
    }
    const newPanier = {
      ...currentPanier,
      [produit.id]: (currentPanier[produit.id] || 0) + quantite,
    };
    localStorage.setItem('tibetia_panier', JSON.stringify(newPanier));
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const toggleFavorite = () => setIsFavorite(!isFavorite);

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  // Images disponibles
  const mainImage = produit?.image_url || produit?.image_principale || heroImage;
  const secondaryImages = produit?.images_secondaires || [];
  const allImages = [mainImage, ...secondaryImages.map((img) => img.image_url || img)].filter(Boolean);

  // ─────────────────────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', borderRadius: 0 }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton width="30%" height={20} sx={{ mb: 2 }} />
              <Skeleton width="80%" height={40} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={24} sx={{ mb: 3 }} />
              <Skeleton width="50%" height={36} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={80} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={52} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchProduit}>
                Réessayer
              </Button>
            }
            sx={{ borderRadius: 0 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  if (!produit) return null;

  const isInStock = produit.est_disponible !== false && produit.quantite_stock > 0;
  const finalPrice = produit.prix_promotion || produit.prix;
  const hasPromo = produit.est_en_promotion && produit.prix_promotion;

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: { xs: 12, md: 8 } }}>
      <Container maxWidth="lg" sx={{ pt: { xs: 3, md: 5 }, pb: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 16, color: '#999' }} />}
          sx={{ mb: 3 }}
        >
          <Link to="/" style={{ textDecoration: 'none', color: '#777', fontSize: '0.85rem' }}>
            Accueil
          </Link>
          <Link to="/boutique" style={{ textDecoration: 'none', color: '#777', fontSize: '0.85rem' }}>
            Boutique
          </Link>
          <Typography sx={{ color: '#111', fontWeight: 500, fontSize: '0.85rem' }}>
            {produit.nom}
          </Typography>
        </Breadcrumbs>

        {/* Bouton retour */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 18 }} />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 4,
            color: '#666',
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            px: 0,
            '&:hover': { backgroundColor: 'transparent', color: '#111' },
          }}
        >
          Retour à la boutique
        </Button>

        <Grid container spacing={{ xs: 4, md: 8 }}>
          {/* ─── COLONNE IMAGE ─────────────────────────────────── */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: { md: 'sticky' }, top: 100 }}>
              {/* Image principale */}
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  backgroundColor: '#F5F5F5',
                  overflow: 'hidden',
                  mb: 2,
                }}
              >
                {hasPromo && (
                  <Chip
                    label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      backgroundColor: '#111',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      height: 28,
                      borderRadius: 0,
                      zIndex: 2,
                    }}
                  />
                )}

                <Box
                  component="img"
                  src={selectedImage || mainImage}
                  alt={produit.nom}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = heroImage;
                  }}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />

                {/* Favori */}
                <IconButton
                  onClick={toggleFavorite}
                  sx={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    backgroundColor: 'rgba(255,255,255,0.92)',
                    width: 40,
                    height: 40,
                    zIndex: 2,
                    '&:hover': { backgroundColor: '#fff' },
                  }}
                >
                  {isFavorite ? (
                    <Favorite sx={{ color: '#111', fontSize: 20 }} />
                  ) : (
                    <FavoriteBorder sx={{ color: '#555', fontSize: 20 }} />
                  )}
                </IconButton>
              </Box>

              {/* Miniatures */}
              {allImages.length > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': { height: 4 },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#DDD' },
                  }}
                >
                  {allImages.map((img, index) => (
                    <Box
                      key={index}
                      component="img"
                      src={img}
                      alt={`Vue ${index + 1}`}
                      onClick={() => setSelectedImage(img)}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = heroImage;
                      }}
                      sx={{
                        width: 72,
                        height: 90,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border:
                          selectedImage === img || (!selectedImage && index === 0)
                            ? '2px solid #111'
                            : '1px solid #E5E5E5',
                        opacity:
                          selectedImage === img || (!selectedImage && index === 0) ? 1 : 0.7,
                        transition: 'all 0.2s ease',
                        flexShrink: 0,
                        '&:hover': { opacity: 1 },
                      }}
                    />
                  ))}
                </Box>
              )}
            </Box>
          </Grid>

          {/* ─── COLONNE DÉTAILS ───────────────────────────────── */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Catégorie */}
              <Typography
                variant="overline"
                sx={{
                  color: '#888',
                  fontWeight: 500,
                  letterSpacing: 1.5,
                  fontSize: '0.7rem',
                  display: 'block',
                  mb: 1,
                }}
              >
                {produit.categorie}
              </Typography>

              {/* Nom */}
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 400,
                  fontSize: { xs: '1.9rem', md: '2.4rem' },
                  color: '#111',
                  lineHeight: 1.2,
                  mb: 2,
                  letterSpacing: -0.3,
                }}
              >
                {produit.nom}
              </Typography>

              {/* Note */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <Rating
                  value={parseFloat(produit.note || 4.5)}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{
                    color: '#111',
                    '& .MuiRating-iconEmpty': { color: '#E0E0E0' },
                  }}
                />
                <Typography sx={{ color: '#888', fontSize: '0.85rem' }}>
                  ({produit.nb_avis || 0} avis)
                </Typography>
              </Box>

              {/* Prix */}
              <Box sx={{ mb: 3 }}>
                {hasPromo ? (
                  <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '1.6rem',
                        color: '#111',
                      }}
                    >
                      {formatPrice(produit.prix_promotion)}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#999',
                        textDecoration: 'line-through',
                        fontSize: '1.1rem',
                      }}
                    >
                      {formatPrice(produit.prix)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.6rem',
                      color: '#111',
                    }}
                  >
                    {formatPrice(produit.prix)}
                  </Typography>
                )}
              </Box>

              {/* Stock */}
              <Box sx={{ mb: 3 }}>
                {isInStock ? (
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 16, color: '#059669 !important' }} />}
                    label={`En stock · ${produit.quantite_stock} pièce${produit.quantite_stock > 1 ? 's' : ''}`}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(5, 150, 105, 0.08)',
                      color: '#059669',
                      fontWeight: 500,
                      height: 28,
                      borderRadius: 0,
                      fontSize: '0.8rem',
                    }}
                  />
                ) : (
                  <Chip
                    label="Rupture de stock"
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(220, 38, 38, 0.08)',
                      color: '#DC2626',
                      fontWeight: 500,
                      height: 28,
                      borderRadius: 0,
                      fontSize: '0.8rem',
                    }}
                  />
                )}
              </Box>

              {/* Description */}
              <Typography
                sx={{
                  color: '#555',
                  lineHeight: 1.75,
                  fontSize: '0.95rem',
                  mb: 4,
                }}
              >
                {produit.description || 'Aucune description disponible pour ce produit.'}
              </Typography>

              <Divider sx={{ mb: 4, borderColor: '#E5E5E5' }} />

              {/* Quantité */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: '#333',
                    fontSize: '0.875rem',
                    mb: 1.5,
                  }}
                >
                  Quantité
                </Typography>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    border: '1px solid #DDD',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantite(Math.max(1, quantite - 1))}
                    disabled={quantite <= 1}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      color: '#111',
                      '&:disabled': { color: '#CCC' },
                    }}
                  >
                    <Remove sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography
                    sx={{
                      minWidth: 48,
                      textAlign: 'center',
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    }}
                  >
                    {quantite}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantite(quantite + 1)}
                    disabled={!isInStock || quantite >= produit.quantite_stock}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      color: '#111',
                      '&:disabled': { color: '#CCC' },
                    }}
                  >
                    <Add sx={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Total + CTA */}
              <Box sx={{ mb: 4 }}>
                <Typography sx={{ color: '#666', fontSize: '0.875rem', mb: 1.5 }}>
                  Total :{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: '#111', fontSize: '1.1rem' }}>
                    {formatPrice(finalPrice * quantite)}
                  </Box>
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    onClick={ajouterAuPanier}
                    disabled={!isInStock}
                    startIcon={
                      addedToCart ? (
                        <CheckCircle sx={{ fontSize: 20 }} />
                      ) : (
                        <ShoppingBag sx={{ fontSize: 20 }} />
                      )
                    }
                    sx={{
                      backgroundColor: addedToCart ? '#059669' : '#111',
                      color: '#fff',
                      borderRadius: 0,
                      px: 4,
                      py: 1.6,
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      textTransform: 'none',
                      flex: 1,
                      minWidth: 200,
                      boxShadow: 'none',
                      transition: 'background-color 0.25s ease',
                      '&:hover': {
                        backgroundColor: addedToCart ? '#047857' : '#333',
                        boxShadow: 'none',
                      },
                      '&.Mui-disabled': {
                        backgroundColor: '#E5E5E5',
                        color: '#999',
                      },
                    }}
                  >
                    {addedToCart ? 'Ajouté au panier' : 'Ajouter au panier'}
                  </Button>

                  <IconButton
                    onClick={toggleFavorite}
                    sx={{
                      border: '1px solid #DDD',
                      borderRadius: 0,
                      width: 52,
                      height: 52,
                      color: isFavorite ? '#111' : '#666',
                      '&:hover': { backgroundColor: '#F5F5F5', borderColor: '#CCC' },
                    }}
                  >
                    {isFavorite ? <Favorite /> : <FavoriteBorder />}
                  </IconButton>

                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                    }}
                    sx={{
                      border: '1px solid #DDD',
                      borderRadius: 0,
                      width: 52,
                      height: 52,
                      color: '#666',
                      '&:hover': { backgroundColor: '#F5F5F5', borderColor: '#CCC' },
                    }}
                  >
                    <Share />
                  </IconButton>
                </Box>
              </Box>

              {/* Trust badges */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                  pt: 3,
                  borderTop: '1px solid #E5E5E5',
                }}
              >
                {[
                  { icon: <LocalShipping sx={{ fontSize: 22 }} />, title: 'Livraison', subtitle: '48h – 72h' },
                  { icon: <Verified sx={{ fontSize: 22 }} />, title: 'Authentique', subtitle: 'Qualité garantie' },
                  { icon: <Payment sx={{ fontSize: 22 }} />, title: 'Paiement', subtitle: 'Sécurisé' },
                  { icon: <Security sx={{ fontSize: 22 }} />, title: 'Retour', subtitle: 'Sous 7 jours' },
                ].map((item, index) => (
                  <Box key={index} sx={{ textAlign: 'center' }}>
                    <Box sx={{ color: '#111', mb: 0.75 }}>{item.icon}</Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        color: '#333',
                        fontSize: '0.8rem',
                        mb: 0.25,
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: '#888', fontSize: '0.75rem' }}>
                      {item.subtitle}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* ─── BARRE STICKY MOBILE ──────────────────────────────── */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderTop: '1px solid #E5E5E5',
          p: 2,
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.06)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '1rem', color: '#111' }}>
              {formatPrice(finalPrice * quantite)}
            </Typography>
            {hasPromo && (
              <Typography
                sx={{
                  color: '#999',
                  textDecoration: 'line-through',
                  fontSize: '0.8rem',
                }}
              >
                {formatPrice(produit.prix * quantite)}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={ajouterAuPanier}
            disabled={!isInStock}
            startIcon={<ShoppingBag sx={{ fontSize: 18 }} />}
            sx={{
              backgroundColor: '#111',
              color: '#fff',
              borderRadius: 0,
              px: 3,
              py: 1.4,
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'none',
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#333', boxShadow: 'none' },
              '&.Mui-disabled': {
                backgroundColor: '#E5E5E5',
                color: '#999',
              },
            }}
          >
            Ajouter
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProduitDetail;