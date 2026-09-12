// frontend_public/src/pages/Boutique.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container, Typography, Box, Grid, Card, Button, Chip,
  IconButton, TextField, InputAdornment, FormControl, Select,
  MenuItem, Alert, Pagination, Skeleton, Snackbar,
} from '@mui/material';
import {
  ShoppingBag, Search, Close, Star, Favorite, FavoriteBorder,
  Add, Remove, ArrowForward, Warning, Receipt,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import { panierService } from '../services/panierService';
import heroImage from '../assets/images/tibetia.jpeg';

const CATEGORIES = [
  { id: 'robes', label: 'Robes' },
  { id: 'accessoires', label: 'Accessoires' },
  { id: 'chaussures', label: 'Chaussures' },
  { id: 'bijoux', label: 'Bijoux' },
  { id: 'sacs', label: 'Sacs' },
];

const Boutique = () => {
  const navigate = useNavigate();

  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [client, setClient] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchProduits();
  }, [selectedCategorie, page, sortBy]);

  useEffect(() => {
    const storedClient = localStorage.getItem('client_data');
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    }
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 12, est_disponible: true };
      if (selectedCategorie !== 'all') params.categorie = selectedCategorie;
      if (sortBy === 'price-asc') params.ordering = 'prix';
      else if (sortBy === 'price-desc') params.ordering = '-prix';
      else params.ordering = '-note';

      const data = await produitService.getProduits(params);
      const produitsList = data.results || data || [];
      setProduits(produitsList);
      setTotalPages(Math.ceil((data.count || produitsList.length || 0) / 12));
    } catch (err) {
      setError('Impossible de charger les produits. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProduits = useMemo(() => {
    let list = [...produits];
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.nom?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categorie?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [produits, searchTerm]);

  const toggleFavorite = (id) =>
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ✅ AJOUT AU PANIER (avec vérification du stock et connexion)
  const ajouterAuPanier = async (produit) => {
    if (produit.quantite_stock <= 0) {
      setSnackbar({
        open: true,
        message: '❌ Ce produit est en rupture de stock',
        severity: 'error',
      });
      return;
    }

    if (!client) {
      setSnackbar({
        open: true,
        message: 'Veuillez vous connecter pour ajouter au panier',
        severity: 'warning',
      });
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      await panierService.ajouterProduit(client.id, produit.id, 1);
      setSnackbar({ open: true, message: '✅ Ajouté au panier !', severity: 'success' });
    } catch (error) {
      if (error.response?.status === 404) {
        localStorage.removeItem('client_data');
        setClient(null);
        setSnackbar({ open: true, message: 'Session expirée. Reconnectez-vous.', severity: 'warning' });
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setSnackbar({ open: true, message: '❌ Erreur lors de l\'ajout', severity: 'error' });
      }
    }
  };

  const handleDetails = (id) => navigate(`/produit/${id}`);

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  // ─── PRODUCT CARD ──────────────────────────────────────────
  const renderProductCard = (produit) => {
    if (!produit) return null;

    const imageUrl = produit.image_url || produit.image_principale || heroImage;
    const isFav = favorites.includes(produit.id);
    const isRupture = produit.quantite_stock <= 0;
    const isLowStock = produit.quantite_stock > 0 && produit.quantite_stock < 5;

    return (
      <Card
        key={produit.id}
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          bgcolor: '#fff',
          overflow: 'hidden',
          opacity: isRupture ? 0.75 : 1,
          transition: 'all 0.25s ease',
          '&:hover': {
            borderColor: '#CBD5E1',
            boxShadow: '0 12px 32px rgba(15,23,42,0.08)',
            transform: isRupture ? 'none' : 'translateY(-4px)',
            '& .product-image': {
              transform: isRupture ? 'none' : 'scale(1.04)',
            },
          },
        }}
      >
        {/* Image */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            aspectRatio: '3 / 4',
            overflow: 'hidden',
            bgcolor: '#F1F5F9',
            flexShrink: 0,
          }}
        >
          <Box
            component="img"
            className="product-image"
            src={imageUrl}
            alt={produit.nom}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = heroImage;
            }}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              filter: isRupture ? 'grayscale(0.6)' : 'none',
            }}
          />

          {/* Badge promotion */}
          {produit.est_en_promotion && produit.prix_promotion && !isRupture && (
            <Chip
              label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#0F172A',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 24,
                zIndex: 2,
              }}
            />
          )}

          {/* Badge rupture de stock */}
          {isRupture && (
            <Chip
              icon={<Warning sx={{ fontSize: 14, color: '#fff !important' }} />}
              label="Rupture"
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#DC2626',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.7rem',
                height: 24,
                zIndex: 2,
              }}
            />
          )}

          {/* Badge stock faible */}
          {isLowStock && !isRupture && (
            <Chip
              icon={<Warning sx={{ fontSize: 14, color: '#fff !important' }} />}
              label={`Plus que ${produit.quantite_stock}`}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                bgcolor: '#D97706',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.65rem',
                height: 24,
                zIndex: 2,
              }}
            />
          )}

          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite(produit.id);
            }}
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              bgcolor: 'rgba(255,255,255,0.95)',
              width: 36,
              height: 36,
              zIndex: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': { bgcolor: '#fff' },
            }}
          >
            {isFav ? (
              <Favorite sx={{ color: '#EF4444', fontSize: 18 }} />
            ) : (
              <FavoriteBorder sx={{ color: '#64748B', fontSize: 18 }} />
            )}
          </IconButton>
        </Box>

        {/* Infos */}
        <Box sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography
            sx={{
              color: '#94A3B8',
              fontWeight: 500,
              letterSpacing: 0.8,
              fontSize: '0.7rem',
              textTransform: 'uppercase',
              mb: 0.6,
            }}
          >
            {CATEGORIES.find((c) => c.id === produit.categorie)?.label || produit.categorie}
          </Typography>

          <Typography
            sx={{
              fontWeight: 500,
              color: isRupture ? '#94A3B8' : '#0F172A',
              fontSize: '0.95rem',
              lineHeight: 1.35,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.7em',
            }}
          >
            {produit.nom}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, mb: 1.5 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                sx={{
                  fontSize: 13,
                  color: star <= Math.round(produit.note || 4.5) ? '#F59E0B' : '#E2E8F0',
                }}
              />
            ))}
            <Typography sx={{ color: '#94A3B8', ml: 0.4, fontSize: '0.75rem' }}>
              ({produit.nb_avis || 0})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 'auto', mb: 1.5 }}>
            {produit.est_en_promotion && produit.prix_promotion && !isRupture ? (
              <>
                <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1.05rem' }}>
                  {formatPrice(produit.prix_promotion)}
                </Typography>
                <Typography sx={{ color: '#94A3B8', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                  {formatPrice(produit.prix)}
                </Typography>
              </>
            ) : (
              <Typography
                sx={{
                  fontWeight: 700,
                  color: isRupture ? '#94A3B8' : '#0F172A',
                  fontSize: '1.05rem',
                }}
              >
                {formatPrice(produit.prix)}
              </Typography>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              onClick={() => handleDetails(produit.id)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.8rem',
                borderColor: '#E2E8F0',
                color: '#475569',
                py: 0.9,
                '&:hover': { borderColor: '#CBD5E1', bgcolor: '#F8FAFC' },
              }}
            >
              Voir
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              disabled={isRupture}
              onClick={() => ajouterAuPanier(produit)}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: isRupture ? '#E2E8F0' : '#0F172A',
                color: isRupture ? '#94A3B8' : '#fff',
                py: 0.9,
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: isRupture ? '#E2E8F0' : '#1E293B',
                  boxShadow: 'none',
                },
                '&.Mui-disabled': {
                  bgcolor: '#E2E8F0',
                  color: '#94A3B8',
                },
              }}
            >
              {isRupture ? 'Rupture' : 'Ajouter'}
            </Button>
          </Box>
        </Box>
      </Card>
    );
  };

  // ─── LOADING ────────────────────────────────────────────────
  if (loading && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
        <Box sx={{ height: { xs: 260, md: 380 }, bgcolor: '#E2E8F0' }} />
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <Grid item xs={6} sm={4} md={3} key={item}>
                <Skeleton variant="rectangular" sx={{ aspectRatio: '3/4', borderRadius: 2.5, mb: 1.5 }} />
                <Skeleton width="40%" height={14} sx={{ mb: 0.5 }} />
                <Skeleton width="80%" height={18} sx={{ mb: 0.5 }} />
                <Skeleton width="30%" height={16} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error && produits.length === 0) {
    return (
      <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh', py: 10 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={fetchProduits}>Réessayer</Button>}
            sx={{ borderRadius: 2 }}
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      {/* HERO */}
      <Box sx={{ position: 'relative', height: { xs: 280, md: 400 }, display: 'flex', alignItems: 'flex-end', overflow: 'hidden', bgcolor: '#E2E8F0' }}>
        <Box component="img" src={heroImage} alt="Boutique" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 30%' }} />
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,23,42,0.65) 0%, rgba(15,23,42,0.25) 50%, rgba(15,23,42,0.1) 100%)' }} />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 4, md: 6 } }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.75)', letterSpacing: 3, fontWeight: 500, fontSize: '0.75rem', textTransform: 'uppercase', mb: 1.5 }}>Madame Tibetia</Typography>
          <Typography sx={{ fontWeight: 500, color: '#fff', fontFamily: '"Playfair Display", serif', fontSize: { xs: '2.4rem', md: '3.4rem' }, lineHeight: 1.1, mb: 1.5, letterSpacing: -0.5 }}>Boutique</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: { xs: '0.95rem', md: '1.1rem' }, maxWidth: 420, lineHeight: 1.5 }}>Pièces sélectionnées pour sublimer votre élégance au quotidien</Typography>
        </Container>
      </Box>

      {/* CATÉGORIES */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', py: 2, '&::-webkit-scrollbar': { display: 'none' } }}>
            <Chip
              label="Tout"
              onClick={() => { setSelectedCategorie('all'); setPage(1); }}
              sx={{
                borderRadius: 2,
                fontWeight: selectedCategorie === 'all' ? 600 : 500,
                bgcolor: selectedCategorie === 'all' ? '#0F172A' : '#F1F5F9',
                color: selectedCategorie === 'all' ? '#fff' : '#475569',
                px: 1,
                '&:hover': { bgcolor: selectedCategorie === 'all' ? '#1E293B' : '#E2E8F0' },
              }}
            />
            {CATEGORIES.map((cat) => (
              <Chip
                key={cat.id}
                label={cat.label}
                onClick={() => { setSelectedCategorie(cat.id); setPage(1); }}
                sx={{
                  borderRadius: 2,
                  fontWeight: selectedCategorie === cat.id ? 600 : 500,
                  bgcolor: selectedCategorie === cat.id ? '#0F172A' : '#F1F5F9',
                  color: selectedCategorie === cat.id ? '#fff' : '#475569',
                  px: 1,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: selectedCategorie === cat.id ? '#1E293B' : '#E2E8F0' },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>

      {/* TOOLBAR */}
      <Box sx={{ bgcolor: '#fff', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 2, gap: 2, flexWrap: 'wrap' }}>
            <TextField
              placeholder="Rechercher une pièce..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              sx={{
                flex: 1,
                maxWidth: { xs: '100%', md: 340 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: '#F8FAFC',
                  fontSize: '0.875rem',
                  '& fieldset': { borderColor: '#E2E8F0' },
                  '&:hover fieldset': { borderColor: '#CBD5E1' },
                  '&.Mui-focused fieldset': { borderColor: '#0F172A' },
                },
              }}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><Search sx={{ color: '#94A3B8', fontSize: 20 }} /></InputAdornment>,
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
                        <Close sx={{ fontSize: 16, color: '#94A3B8' }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                },
              }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {/* ✅ BOUTON MES COMMANDES */}
              <Button
                variant="outlined"
                startIcon={<Receipt sx={{ fontSize: 18 }} />}
                onClick={() => navigate('/panier')}
                sx={{
                  borderRadius: 2,
                  borderColor: '#CBD5E1',
                  color: '#0F172A',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  px: 2,
                  py: 0.8,
                  whiteSpace: 'nowrap',
                  '&:hover': { borderColor: '#0F172A', bgcolor: '#F8FAFC' },
                }}
              >
                Mes commandes
              </Button>

              <Typography sx={{ color: '#64748B', fontSize: '0.875rem', display: { xs: 'none', sm: 'block' } }}>
                {filteredProduits.length} pièce{filteredProduits.length > 1 ? 's' : ''}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                  displayEmpty
                  sx={{
                    borderRadius: 2,
                    fontSize: '0.875rem',
                    bgcolor: '#F8FAFC',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' },
                  }}
                >
                  <MenuItem value="popular">Popularité</MenuItem>
                  <MenuItem value="price-asc">Prix croissant</MenuItem>
                  <MenuItem value="price-desc">Prix décroissant</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* PRODUITS */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {filteredProduits.length === 0 ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <ShoppingBag sx={{ fontSize: 48, color: '#CBD5E1', mb: 2 }} />
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 600, color: '#0F172A', mb: 1 }}>
              Aucune pièce trouvée
            </Typography>
            <Typography sx={{ color: '#64748B', mb: 3, fontSize: '0.95rem' }}>
              {searchTerm ? 'Essayez un autre mot-clé' : 'Aucun produit dans cette catégorie'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => { setSearchTerm(''); setSelectedCategorie('all'); setPage(1); }}
              sx={{
                borderRadius: 2,
                borderColor: '#CBD5E1',
                color: '#0F172A',
                textTransform: 'none',
                px: 3,
                fontWeight: 500,
              }}
            >
              Réinitialiser les filtres
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={{ xs: 2, md: 3 }}>
              {filteredProduits.map((produit) => (
                <Grid item xs={6} sm={4} md={3} key={produit.id}>
                  {renderProductCard(produit)}
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: 2,
                      fontWeight: 500,
                      '&.Mui-selected': {
                        bgcolor: '#0F172A',
                        color: '#fff',
                        '&:hover': { bgcolor: '#1E293B' },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* CTA */}
      <Box sx={{ py: { xs: 8, md: 10 }, bgcolor: '#0F172A', textAlign: 'center' }}>
        <Container maxWidth="sm">
          <Typography sx={{ fontFamily: '"Playfair Display", serif', color: '#fff', fontSize: { xs: '1.8rem', md: '2.3rem' }, fontWeight: 500, mb: 1.5, letterSpacing: -0.3 }}>
            L'élégance commence ici
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', mb: 4, fontSize: '1rem' }}>
            Découvrez également nos forfaits relooking et formations en ligne
          </Typography>
          <Button
            component={Link}
            to="/forfaits"
            variant="contained"
            endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: '#fff',
              color: '#0F172A',
              borderRadius: 2,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
              '&:hover': { bgcolor: '#F1F5F9' },
            }}
          >
            Voir les forfaits
          </Button>
        </Container>
      </Box>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Boutique;