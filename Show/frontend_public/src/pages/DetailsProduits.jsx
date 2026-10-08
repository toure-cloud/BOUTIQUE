// frontend_public/src/pages/ProduitDetail.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Typography, Button, IconButton,
  Alert, Divider, Breadcrumbs, Rating, Skeleton, alpha, Stack,
  Fade, Zoom,
} from '@mui/material';
import {
  ArrowBack, Favorite, FavoriteBorder, Share,
  CheckCircle, Add, Remove, LocalShipping, Verified,
  Payment, Security, NavigateNext, ShoppingBag,
  AutoAwesome, LocalOffer,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';

// ═══════════════════════════════════════════
// 🎨 DESIGN TOKENS — PREMIUM
// ═══════════════════════════════════════════
const T = {
  ivory: '#FBF9F6',
  ivoryDeep: '#F5F1EA',
  surface: '#FFFFFF',
  ink: '#0E0E0E',
  inkSoft: '#1F1F1F',
  textPrimary: '#0E0E0E',
  textSecondary: '#5A5A5A',
  textMuted: '#9A9A9A',
  border: '#EAE6DE',
  borderStrong: '#D9D3C7',
  gold: '#B8935A',
  goldSoft: 'rgba(184, 147, 90, 0.12)',
  goldDeep: '#8B6F3F',
  goldGlow: 'rgba(184, 147, 90, 0.25)',
  danger: '#B91C1C',
  success: '#166534',
  fontSerif: '"Playfair Display", Georgia, serif',
  fontSans: '"Inter", -apple-system, sans-serif',
};

const extractUrl = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return img;
  return img.image_url || img.image || img.url || img.file || null;
};

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
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    fetchProduit();
  }, [id]);

  const fetchProduit = async () => {
    setLoading(true);
    setError(null);
    setImageLoaded(false);
    try {
      const data = await produitService.getProduitById(id);
      setProduit(data);
      setSelectedImage(data?.image_url || data?.image_principale || heroImage);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger le produit.');
    } finally {
      setLoading(false);
    }
  };

  const { mainImage, secondaryImages, allImages } = useMemo(() => {
    if (!produit) {
      return { mainImage: heroImage, secondaryImages: [], allImages: [heroImage] };
    }
    const main = produit.image_url || produit.image_principale || heroImage;
    const secondary = Array.isArray(produit.images_secondaires) ? produit.images_secondaires : [];
    const secondaryUrls = secondary.map(extractUrl).filter((u) => typeof u === 'string' && u.length > 0);
    const uniqueSecondaries = [...new Set(secondaryUrls)].filter((u) => u !== main);
    const all = [main, ...uniqueSecondaries].filter(Boolean);
    return { mainImage: main, secondaryImages: uniqueSecondaries, allImages: all };
  }, [produit]);

  const activeImage = selectedImage || mainImage;

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
    setTimeout(() => setAddedToCart(false), 2800);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  // ─────────────────────────────────────────────
  // LOADING
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <Box sx={{ bgcolor: T.ivory, minHeight: '100vh', py: 6 }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' }, gap: { xs: 4, md: 8 } }}>
            <Box>
              <Skeleton variant="rectangular" sx={{ aspectRatio: '4/5', borderRadius: 0.5 }} />
              <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} variant="rectangular" width={72} height={90} sx={{ borderRadius: 0.5 }} />
                ))}
              </Box>
            </Box>
            <Box>
              <Skeleton width="30%" height={18} sx={{ mb: 2 }} />
              <Skeleton width="80%" height={52} sx={{ mb: 2 }} />
              <Skeleton width="40%" height={24} sx={{ mb: 3 }} />
              <Skeleton width="50%" height={40} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={100} sx={{ mb: 3 }} />
              <Skeleton width="100%" height={56} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: T.ivory, minHeight: '100vh', py: 12 }}>
        <Container maxWidth="sm">
          <Alert severity="error" sx={{ borderRadius: 1 }}>
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
  const discountPercent = hasPromo
    ? Math.round((1 - produit.prix_promotion / produit.prix) * 100)
    : 0;

  return (
    <Box sx={{ bgcolor: T.ivory, minHeight: '100vh', pb: { xs: 16, md: 10 } }}>
      <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 }, pb: 4 }}>
        {/* ─── Fil d'Ariane ─────────────────────────── */}
        <Breadcrumbs
          separator={<NavigateNext sx={{ fontSize: 14, color: T.textMuted }} />}
          sx={{ mb: 4 }}
        >
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              color: T.textMuted,
              fontSize: '0.72rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              fontFamily: T.fontSans,
              fontWeight: 500,
            }}
          >
            Accueil
          </Link>
          <Link
            to="/boutique"
            style={{
              textDecoration: 'none',
              color: T.textMuted,
              fontSize: '0.72rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              fontFamily: T.fontSans,
              fontWeight: 500,
            }}
          >
            Boutique
          </Link>
          <Typography
            sx={{
              color: T.textPrimary,
              fontSize: '0.72rem',
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              fontFamily: T.fontSans,
              fontWeight: 600,
            }}
          >
            {produit.nom}
          </Typography>
        </Breadcrumbs>

        {/* ─── Bouton retour ────────────────────────── */}
        <Button
          startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
          onClick={() => navigate(-1)}
          sx={{
            mb: 5,
            color: T.textSecondary,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.8rem',
            px: 0,
            letterSpacing: 0.3,
            fontFamily: T.fontSans,
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              backgroundColor: 'transparent',
              color: T.gold,
              transform: 'translateX(-4px)',
            },
          }}
        >
          Retour à la boutique
        </Button>

        {/* ═══════════════════════════════════════════════
            GRILLE PRINCIPALE
           ═══════════════════════════════════════════════ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
            gap: { xs: 5, md: 8, lg: 12 },
            alignItems: 'flex-start',
          }}
        >
          {/* ═════════════════════════════════════════
              COLONNE GAUCHE — GALERIE
             ═════════════════════════════════════════ */}
          <Box sx={{ display: 'flex', gap: { xs: 1.5, md: 2.5 }, alignItems: 'flex-start' }}>
            {/* Miniatures verticales (desktop) */}
            {allImages.length > 1 && (
              <Stack
                spacing={1.5}
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  position: 'sticky',
                  top: 100,
                  flexShrink: 0,
                }}
              >
                {allImages.map((img, index) => {
                  const isActive = img === activeImage;
                  return (
                    <Box
                      key={`thumb-${index}`}
                      onClick={() => {
                        setSelectedImage(img);
                        setImageLoaded(false);
                      }}
                      sx={{
                        width: 72,
                        height: 90,
                        position: 'relative',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        border: isActive ? `1.5px solid ${T.gold}` : `1px solid ${T.border}`,
                        opacity: isActive ? 1 : 0.55,
                        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: isActive ? `0 0 0 1px ${T.goldGlow}` : 'none',
                        '&:hover': {
                          opacity: 1,
                          borderColor: isActive ? T.gold : T.borderStrong,
                          transform: 'scale(1.03)',
                        },
                      }}
                    >
                      <Box
                        component="img"
                        src={img}
                        alt={`Vue ${index + 1}`}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = heroImage;
                        }}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>
                  );
                })}
              </Stack>
            )}

            {/* Image principale */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box
                sx={{
                  position: 'relative',
                  aspectRatio: '4/5',
                  bgcolor: T.ivoryDeep,
                  overflow: 'hidden',
                  border: `1px solid ${T.border}`,
                }}
              >
                {/* Badge promo */}
                {hasPromo && (
                  <Zoom in timeout={600}>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 24,
                        left: 24,
                        zIndex: 2,
                        bgcolor: T.gold,
                        color: '#fff',
                        px: 1.8,
                        py: 0.7,
                        fontSize: '0.68rem',
                        letterSpacing: 2,
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        fontFamily: T.fontSans,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.8,
                        boxShadow: `0 4px 20px ${T.goldGlow}`,
                      }}
                    >
                      <LocalOffer sx={{ fontSize: 14 }} />
                      -{discountPercent}% Édition limitée
                    </Box>
                  </Zoom>
                )}

                {/* Badge rupture */}
                {!isInStock && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 24,
                      left: 24,
                      zIndex: 2,
                      bgcolor: T.ink,
                      color: '#fff',
                      px: 1.8,
                      py: 0.7,
                      fontSize: '0.68rem',
                      letterSpacing: 2,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      fontFamily: T.fontSans,
                    }}
                  >
                    Épuisé
                  </Box>
                )}

                <Fade in={imageLoaded} timeout={500}>
                  <Box
                    component="img"
                    src={activeImage}
                    alt={produit.nom}
                    onLoad={() => setImageLoaded(true)}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = heroImage;
                      setImageLoaded(true);
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 1.4s cubic-bezier(0.16, 1, 0.3, 1)',
                      opacity: imageLoaded ? 1 : 0,
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />
                </Fade>

                {/* Actions flottantes */}
                <Stack
                  spacing={1.2}
                  sx={{ position: 'absolute', top: 20, right: 20, zIndex: 2 }}
                >
                  <IconButton
                    onClick={() => setIsFavorite(!isFavorite)}
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.92),
                      backdropFilter: 'blur(12px)',
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      border: `1px solid ${T.border}`,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: '#fff',
                        transform: 'scale(1.08)',
                        borderColor: T.gold,
                      },
                    }}
                  >
                    {isFavorite ? (
                      <Favorite sx={{ color: T.gold, fontSize: 18 }} />
                    ) : (
                      <FavoriteBorder sx={{ color: T.inkSoft, fontSize: 18 }} />
                    )}
                  </IconButton>
                  <IconButton
                    onClick={() => navigator.clipboard.writeText(window.location.href)}
                    sx={{
                      bgcolor: alpha('#FFFFFF', 0.92),
                      backdropFilter: 'blur(12px)',
                      width: 44,
                      height: 44,
                      borderRadius: 0,
                      border: `1px solid ${T.border}`,
                      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      '&:hover': {
                        bgcolor: '#fff',
                        transform: 'scale(1.08)',
                        borderColor: T.gold,
                      },
                    }}
                  >
                    <Share sx={{ color: T.inkSoft, fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </Box>

              {/* Miniatures horizontales (mobile) */}
              {allImages.length > 1 && (
                <Box
                  sx={{
                    display: { xs: 'flex', md: 'none' },
                    gap: 1.5,
                    mt: 2,
                    overflowX: 'auto',
                    pb: 1,
                    '&::-webkit-scrollbar': { height: 3 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: T.borderStrong },
                  }}
                >
                  {allImages.map((img, index) => {
                    const isActive = img === activeImage;
                    return (
                      <Box
                        key={`thumb-mobile-${index}`}
                        onClick={() => {
                          setSelectedImage(img);
                          setImageLoaded(false);
                        }}
                        sx={{
                          width: 68,
                          height: 84,
                          flexShrink: 0,
                          cursor: 'pointer',
                          overflow: 'hidden',
                          border: isActive ? `1.5px solid ${T.gold}` : `1px solid ${T.border}`,
                          opacity: isActive ? 1 : 0.55,
                          transition: 'all 0.3s ease',
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`Vue ${index + 1}`}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = heroImage;
                          }}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>

          {/* ═════════════════════════════════════════
              COLONNE DROITE — DÉTAILS
             ═════════════════════════════════════════ */}
          <Box sx={{ pt: { md: 1 } }}>
            {/* Catégorie */}
            <Typography
              sx={{
                color: T.gold,
                fontSize: '0.7rem',
                letterSpacing: 3.2,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: T.fontSans,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <AutoAwesome sx={{ fontSize: 14 }} />
              {produit.categorie}
            </Typography>

            {/* Nom */}
            <Typography
              sx={{
                fontFamily: T.fontSerif,
                fontWeight: 500,
                fontSize: { xs: '2rem', md: '2.65rem' },
                color: T.textPrimary,
                lineHeight: 1.08,
                letterSpacing: -0.8,
                mb: 2.5,
              }}
            >
              {produit.nom}
            </Typography>

            {/* Note + stock */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Rating
                  value={parseFloat(produit.note || 4.5)}
                  precision={0.5}
                  readOnly
                  size="small"
                  sx={{
                    color: T.gold,
                    '& .MuiRating-iconEmpty': { color: T.borderStrong },
                  }}
                />
                <Typography sx={{ color: T.textMuted, fontSize: '0.78rem', fontFamily: T.fontSans }}>
                  ({produit.nb_avis || 0})
                </Typography>
              </Box>
              <Box sx={{ width: 1, height: 14, bgcolor: T.border }} />
              {isInStock ? (
                <Typography
                  sx={{
                    color: T.success,
                    fontSize: '0.72rem',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontFamily: T.fontSans,
                  }}
                >
                  ● En stock
                </Typography>
              ) : (
                <Typography
                  sx={{
                    color: T.danger,
                    fontSize: '0.72rem',
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    fontFamily: T.fontSans,
                  }}
                >
                  ● Épuisé
                </Typography>
              )}
            </Box>

            {/* Prix */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 2.5, mb: 4 }}>
              {hasPromo ? (
                <>
                  <Typography
                    sx={{
                      fontFamily: T.fontSerif,
                      fontWeight: 600,
                      fontSize: '2.1rem',
                      color: T.textPrimary,
                      letterSpacing: -0.6,
                    }}
                  >
                    {formatPrice(produit.prix_promotion)}
                  </Typography>
                  <Typography
                    sx={{
                      color: T.textMuted,
                      textDecoration: 'line-through',
                      fontSize: '1.15rem',
                      fontFamily: T.fontSans,
                    }}
                  >
                    {formatPrice(produit.prix)}
                  </Typography>
                </>
              ) : (
                <Typography
                  sx={{
                    fontFamily: T.fontSerif,
                    fontWeight: 600,
                    fontSize: '2.1rem',
                    color: T.textPrimary,
                    letterSpacing: -0.6,
                  }}
                >
                  {formatPrice(produit.prix)}
                </Typography>
              )}
            </Box>

            <Divider sx={{ borderColor: T.border, mb: 4 }} />

            {/* Description */}
            <Typography
              sx={{
                color: T.textSecondary,
                lineHeight: 1.9,
                fontSize: '0.95rem',
                fontWeight: 300,
                fontFamily: T.fontSans,
                mb: 4.5,
              }}
            >
              {produit.description ||
                'Une pièce soigneusement sélectionnée pour sublimer votre élégance au quotidien.'}
            </Typography>

            {/* Quantité */}
            <Box sx={{ mb: 4.5 }}>
              <Typography
                sx={{
                  color: T.textPrimary,
                  fontSize: '0.7rem',
                  letterSpacing: 2.2,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontFamily: T.fontSans,
                  mb: 2,
                }}
              >
                Quantité
              </Typography>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: `1px solid ${T.borderStrong}`,
                  bgcolor: T.surface,
                  transition: 'border-color 0.3s ease',
                  '&:hover': { borderColor: T.gold },
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => setQuantite(Math.max(1, quantite - 1))}
                  disabled={quantite <= 1}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0,
                    color: T.textPrimary,
                    transition: 'all 0.25s ease',
                    '&:hover': { bgcolor: T.goldSoft, color: T.gold },
                    '&:disabled': { color: T.textMuted },
                  }}
                >
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography
                  sx={{
                    minWidth: 60,
                    textAlign: 'center',
                    fontWeight: 600,
                    fontSize: '1rem',
                    color: T.textPrimary,
                    fontFamily: T.fontSans,
                  }}
                >
                  {quantite}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setQuantite(quantite + 1)}
                  disabled={!isInStock || quantite >= produit.quantite_stock}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 0,
                    color: T.textPrimary,
                    transition: 'all 0.25s ease',
                    '&:hover': { bgcolor: T.goldSoft, color: T.gold },
                    '&:disabled': { color: T.textMuted },
                  }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>

            {/* CTA principal */}
            <Box sx={{ mb: 5 }}>
              <Button
                fullWidth
                onClick={ajouterAuPanier}
                disabled={!isInStock}
                startIcon={
                  addedToCart ? (
                    <CheckCircle sx={{ fontSize: 18 }} />
                  ) : (
                    <ShoppingBag sx={{ fontSize: 18 }} />
                  )
                }
                sx={{
                  bgcolor: addedToCart ? T.success : T.ink,
                  color: '#fff',
                  borderRadius: 0,
                  py: 2.1,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  letterSpacing: 2.8,
                  textTransform: 'uppercase',
                  fontFamily: T.fontSans,
                  boxShadow: 'none',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    bgcolor: addedToCart ? '#14532D' : T.gold,
                    color: '#fff',
                    boxShadow: addedToCart
                      ? 'none'
                      : `0 8px 32px ${T.goldGlow}`,
                    transform: 'translateY(-2px)',
                  },
                  '&.Mui-disabled': {
                    bgcolor: T.border,
                    color: T.textMuted,
                  },
                }}
              >
                {addedToCart
                  ? 'Ajouté au panier'
                  : `Ajouter — ${formatPrice(finalPrice * quantite)}`}
              </Button>
            </Box>

            {/* Trust badges */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
                gap: 2.5,
                pt: 4.5,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              {[
                { icon: <LocalShipping sx={{ fontSize: 20 }} />, title: 'Livraison', subtitle: '48h – 72h' },
                { icon: <Verified sx={{ fontSize: 20 }} />, title: 'Authentique', subtitle: 'Qualité garantie' },
                { icon: <Payment sx={{ fontSize: 20 }} />, title: 'Paiement', subtitle: '100% sécurisé' },
                { icon: <Security sx={{ fontSize: 20 }} />, title: 'Retour', subtitle: 'Sous 7 jours' },
              ].map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    transition: 'transform 0.3s ease',
                    '&:hover': { transform: 'translateY(-3px)' },
                  }}
                >
                  <Box sx={{ color: T.gold, mb: 1.1 }}>{item.icon}</Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      color: T.textPrimary,
                      fontSize: '0.72rem',
                      letterSpacing: 1.1,
                      textTransform: 'uppercase',
                      fontFamily: T.fontSans,
                      mb: 0.3,
                    }}
                  >
                    {item.title}
                  </Typography>
                  <Typography sx={{ color: T.textMuted, fontSize: '0.72rem', fontFamily: T.fontSans }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Container>

      {/* ═══════════════════════════════════════════════
          BARRE STICKY MOBILE
         ═══════════════════════════════════════════════ */}
      <Box
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: alpha('#FBF9F6', 0.97),
          backdropFilter: 'blur(16px)',
          borderTop: `1px solid ${T.border}`,
          p: 2,
          zIndex: 100,
          boxShadow: '0 -8px 32px rgba(0,0,0,0.04)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              sx={{
                fontFamily: T.fontSerif,
                fontWeight: 600,
                fontSize: '1.2rem',
                color: T.textPrimary,
                letterSpacing: -0.4,
              }}
            >
              {formatPrice(finalPrice * quantite)}
            </Typography>
            {hasPromo && (
              <Typography
                sx={{
                  color: T.textMuted,
                  textDecoration: 'line-through',
                  fontSize: '0.75rem',
                }}
              >
                {formatPrice(produit.prix * quantite)}
              </Typography>
            )}
          </Box>
          <Button
            onClick={ajouterAuPanier}
            disabled={!isInStock}
            startIcon={<ShoppingBag sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: addedToCart ? T.success : T.ink,
              color: '#fff',
              borderRadius: 0,
              px: 3.2,
              py: 1.4,
              fontWeight: 600,
              fontSize: '0.72rem',
              letterSpacing: 2.2,
              textTransform: 'uppercase',
              fontFamily: T.fontSans,
              boxShadow: 'none',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: addedToCart ? '#14532D' : T.gold,
                boxShadow: 'none',
              },
              '&.Mui-disabled': { bgcolor: T.border, color: T.textMuted },
            }}
          >
            {addedToCart ? 'Ajouté' : 'Ajouter'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ProduitDetail;