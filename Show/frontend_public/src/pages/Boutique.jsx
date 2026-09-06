// frontend_public/src/pages/Boutique.jsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  useTheme,
  useMediaQuery,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Pagination,
  Paper,
  Skeleton,
} from '@mui/material';
import {
  ShoppingBag,
  Search,
  Close,
  Star,
  Favorite,
  FavoriteBorder,
  Add,
  Remove,
  ArrowForward,
  ArrowBack,
  LocalOffer,
  Visibility,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { produitService } from '../services/produitService';
import heroImage from '../assets/images/tibetia.jpeg';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'robes', label: 'Robes', subtitle: 'Silhouettes élégantes', cover: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { id: 'accessoires', label: 'Accessoires', subtitle: 'Détails raffinés', cover: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
  { id: 'chaussures', label: 'Chaussures', subtitle: 'Pas de style', cover: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=800&q=80' },
  { id: 'bijoux', label: 'Bijoux', subtitle: 'Éclat & finesse', cover: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80' },
  { id: 'sacs', label: 'Sacs', subtitle: 'Pièces signature', cover: 'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=800&q=80' },
];

const Boutique = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  // ✅ État
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [panier, setPanier] = useState({});
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Chargement des produits depuis l'API
  useEffect(() => {
    fetchProduits();
  }, [selectedCategorie, page, sortBy]);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: page,
        page_size: 12,
        est_disponible: true,
      };
      
      if (selectedCategorie !== 'all') {
        params.categorie = selectedCategorie;
      }

      // Trier
      if (sortBy === 'price-asc') {
        params.ordering = 'prix';
      } else if (sortBy === 'price-desc') {
        params.ordering = '-prix';
      } else {
        params.ordering = '-note';
      }

      const data = await produitService.getProduits(params);
      console.log('📋 Produits reçus:', data);
      
      const produitsList = data.results || data || [];
      setProduits(produitsList);
      setTotalCount(data.count || produitsList.length || 0);
      setTotalPages(Math.ceil((data.count || produitsList.length || 0) / 12));
    } catch (err) {
      console.error('❌ Erreur chargement produits:', err);
      setError('Impossible de charger les produits. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Filtrage local (recherche)
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

  // ✅ Gestion du panier (localStorage)
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

  // ✅ Fonctions de scroll
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const ajouterAuPanier = (id) => {
    setPanier((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const retirerDuPanier = (id) => {
    setPanier((prev) => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const handleDetails = (id) => {
    navigate(`/produit/${id}`);
  };

  const getTotalPanier = () => {
    let total = 0;
    let count = 0;
    produits.forEach((p) => {
      if (panier[p.id]) {
        const price = p.prix_promotion || p.prix;
        total += price * panier[p.id];
        count += panier[p.id];
      }
    });
    return { total, count };
  };

  const { total, count } = getTotalPanier();

  const formatPrice = (price) =>
    new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);

  const handleCategoryClick = (catId) => {
    setSelectedCategorie(catId);
    setActiveTab(CATEGORIES.findIndex((c) => c.id === catId) + 1);
    setPage(1);
    window.scrollTo({ top: 520, behavior: 'smooth' });
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      // La recherche est déjà filtrée via useMemo
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // ✅ Rendu d'une carte produit
  const renderProductCard = (produit) => {
    if (!produit) return null;
    
    const imageUrl = produit.image_principale 
      ? `${import.meta.env.VITE_MEDIA_URL}${produit.image_principale}` 
      : heroImage;

    return (
      <Card
        key={produit.id}
        sx={{
          minWidth: { xs: 220, sm: 240, md: 260 },
          maxWidth: { xs: 220, sm: 240, md: 260 },
          borderRadius: 2.5,
          border: '1px solid #EEEEEE',
          overflow: 'hidden',
          backgroundColor: '#fff',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          transition: 'transform 0.35s cubic-bezier(0.25,0.8,0.25,1), box-shadow 0.35s ease',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 44px rgba(0,0,0,0.1)',
          },
        }}
      >
        {produit.est_en_promotion && produit.prix_promotion && (
          <Chip
            icon={<LocalOffer sx={{ fontSize: 14, color: '#fff !important' }} />}
            label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              backgroundColor: '#C62828',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.68rem',
              height: 26,
              zIndex: 2,
            }}
          />
        )}

        <IconButton
          size="small"
          onClick={() => toggleFavorite(produit.id)}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.92)',
            zIndex: 2,
            width: 36,
            height: 36,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            '&:hover': { backgroundColor: '#fff' },
          }}
        >
          {favorites.includes(produit.id) ? (
            <Favorite sx={{ color: '#C62828', fontSize: 18 }} />
          ) : (
            <FavoriteBorder sx={{ color: '#555', fontSize: 18 }} />
          )}
        </IconButton>

        <Box
          sx={{
            height: 220,
            backgroundColor: '#F7F7F7',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt={produit.nom}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.05)',
              },
            }}
          />
        </Box>

        <CardContent
          sx={{
            p: 2.2,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#999',
              fontWeight: 600,
              letterSpacing: 0.8,
              fontSize: '0.68rem',
              textTransform: 'uppercase',
              mb: 0.6,
            }}
          >
            {CATEGORIES.find((c) => c.id === produit.categorie)?.label || produit.categorie}
          </Typography>

          <Typography
            sx={{
              fontWeight: 600,
              color: '#1A1A1A',
              fontSize: '0.95rem',
              lineHeight: 1.35,
              mb: 0.8,
              minHeight: 42,
              fontFamily: '"Playfair Display", serif',
            }}
          >
            {produit.nom}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mb: 1.2 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                sx={{
                  fontSize: 14,
                  color: star <= Math.round(produit.note || 4.5) ? '#D4A017' : '#E5E5E5',
                }}
              />
            ))}
            <Typography sx={{ color: '#999', ml: 0.5, fontSize: '0.72rem' }}>
              ({produit.nb_avis || 0})
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.1, mb: 2 }}>
            {produit.est_en_promotion && produit.prix_promotion ? (
              <>
                <Typography sx={{ fontWeight: 700, color: '#C62828', fontSize: '1.1rem' }}>
                  {formatPrice(produit.prix_promotion)}
                </Typography>
                <Typography
                  sx={{
                    color: '#AAA',
                    textDecoration: 'line-through',
                    fontSize: '0.82rem',
                  }}
                >
                  {formatPrice(produit.prix)}
                </Typography>
              </>
            ) : (
              <Typography sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.1rem' }}>
                {formatPrice(produit.prix)}
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 'auto', display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleDetails(produit.id)}
              startIcon={<Visibility sx={{ fontSize: 16 }} />}
              sx={{
                flex: 1,
                borderRadius: 50,
                borderColor: '#CCC',
                color: '#1A1A1A',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.7rem',
                '&:hover': {
                  borderColor: '#1A1A1A',
                  backgroundColor: '#F5F5F5',
                },
              }}
            >
              Détails
            </Button>
            {panier[produit.id] ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F4F4F4',
                  borderRadius: 50,
                  px: 0.4,
                  py: 0.2,
                  minWidth: 70,
                }}
              >
                <IconButton size="small" onClick={() => retirerDuPanier(produit.id)}>
                  <Remove fontSize="small" />
                </IconButton>
                <Typography sx={{ fontWeight: 700, minWidth: 18, textAlign: 'center', fontSize: '0.8rem' }}>
                  {panier[produit.id]}
                </Typography>
                <IconButton size="small" onClick={() => ajouterAuPanier(produit.id)}>
                  <Add fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => ajouterAuPanier(produit.id)}
                sx={{
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  borderRadius: 50,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.7rem',
                  px: 2,
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                Ajouter
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  // ✅ Skeleton de chargement
  if (loading && produits.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Skeleton variant="text" width={200} height={30} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={300} height={50} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={400} height={25} sx={{ mx: 'auto' }} />
          </Box>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item}>
                <Card sx={{ borderRadius: '16px' }}>
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="60%" />
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="rectangular" height={36} sx={{ mt: 2, borderRadius: '50px' }} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error && produits.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 6 }}>
        <Container maxWidth="lg">
          <Alert 
            severity="error" 
            sx={{ borderRadius: '12px' }}
            action={
              <Button color="inherit" size="small" onClick={fetchProduits}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh' }}>
      {/* ========== HERO ========== */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 260, md: 380 },
          display: 'flex',
          alignItems: 'flex-end',
          overflow: 'hidden',
          backgroundColor: '#111',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Boutique Madame Tibetia"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            filter: 'contrast(1.06) brightness(1.02)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to top, rgba(15,15,15,0.94) 0%, rgba(15,15,15,0.45) 55%, rgba(15,15,15,0.2) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, pb: { xs: 4, md: 5.5 } }}>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.65)',
              letterSpacing: 5,
              fontWeight: 500,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1.2,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontWeight: 300,
              color: '#FFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              lineHeight: 1.1,
              mb: 1.2,
            }}
          >
            Boutique
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.78)',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              fontWeight: 300,
              maxWidth: 420,
            }}
          >
            Mode & accessoires sélectionnés pour révéler votre élégance
          </Typography>
        </Container>
      </Box>

      {/* ========== CATÉGORIES ========== */}
      <Box sx={{ py: { xs: 5, md: 7 }, backgroundColor: '#FFF' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.9rem', md: '2.5rem' },
              color: '#1A1A1A',
              mb: 1,
            }}
          >
            Nos univers
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#777',
              mb: 4.5,
              fontSize: '1rem',
            }}
          >
            Explorez nos collections soigneusement choisies
          </Typography>

          <Grid container spacing={2.5}>
            {CATEGORIES.map((cat) => (
              <Grid item xs={6} sm={4} md key={cat.id}>
                <Box
                  onClick={() => handleCategoryClick(cat.id)}
                  sx={{
                    position: 'relative',
                    height: { xs: 160, md: 220 },
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.35s ease, box-shadow 0.35s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
                      '& img': { transform: 'scale(1.08)' },
                    },
                  }}
                >
                  <Box
                    component="img"
                    src={cat.cover}
                    alt={cat.label}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.5s ease',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      p: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: { xs: '0.95rem', md: '1.05rem' },
                        fontFamily: '"Playfair Display", serif',
                      }}
                    >
                      {cat.label}
                    </Typography>
                    <Typography
                      sx={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: '0.75rem',
                        mt: 0.3,
                      }}
                    >
                      {cat.subtitle}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ========== BARRE RECHERCHE ========== */}
      <Box
        sx={{
          py: 2.2,
          backgroundColor: '#FFF',
          borderTop: '1px solid #F0F0F0',
          borderBottom: '1px solid #EEE',
          position: 'sticky',
          top: 0,
          zIndex: 30,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2} sx={{ alignItems: 'center' }}>
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                placeholder="Rechercher une pièce..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 50,
                    backgroundColor: '#FAFAFA',
                    '& fieldset': { borderColor: '#E8E8E8' },
                    '&:hover fieldset': { borderColor: '#CCC' },
                    '&.Mui-focused fieldset': { borderColor: '#1A1A1A' },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: '#999', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={handleClearSearch}>
                        <Close sx={{ fontSize: 16, color: '#999' }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                }}
              />
            </Grid>

            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.2,
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Tabs
                  value={activeTab}
                  onChange={(_, v) => {
                    setActiveTab(v);
                    setSelectedCategorie(v === 0 ? 'all' : CATEGORIES[v - 1].id);
                    setPage(1);
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    minHeight: 36,
                    '& .MuiTab-root': {
                      minHeight: 36,
                      textTransform: 'none',
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: '#888',
                      px: 1.5,
                      '&.Mui-selected': { color: '#1A1A1A', fontWeight: 700 },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#1A1A1A',
                      height: 2.5,
                    },
                  }}
                >
                  <Tab label="Tout" />
                  {CATEGORIES.map((c) => (
                    <Tab key={c.id} label={c.label} />
                  ))}
                </Tabs>

                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel sx={{ color: '#666', fontSize: '0.85rem' }}>Trier</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setPage(1);
                    }}
                    label="Trier"
                    sx={{
                      borderRadius: 50,
                      fontSize: '0.85rem',
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E0E0E0' },
                    }}
                  >
                    <MenuItem value="popular">Popularité</MenuItem>
                    <MenuItem value="price-asc">Prix ↑</MenuItem>
                    <MenuItem value="price-desc">Prix ↓</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ========== PRODUITS ========== */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3.5,
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Typography sx={{ color: '#666', fontWeight: 500, fontSize: '0.9rem' }}>
            {filteredProduits.length} pièce{filteredProduits.length > 1 ? 's' : ''}
            {selectedCategorie !== 'all' && (
              <Chip
                label={CATEGORIES.find((c) => c.id === selectedCategorie)?.label}
                size="small"
                onDelete={() => {
                  setSelectedCategorie('all');
                  setActiveTab(0);
                  setPage(1);
                }}
                sx={{
                  ml: 1.5,
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  fontWeight: 600,
                  height: 26,
                  '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' },
                }}
              />
            )}
          </Typography>

          {count > 0 && (
            <Chip
              icon={<ShoppingBag sx={{ fontSize: 16, color: '#fff !important' }} />}
              label={`${count} • ${formatPrice(total)}`}
              sx={{
                backgroundColor: '#1A1A1A',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.8rem',
                height: 34,
                px: 0.5,
              }}
            />
          )}
        </Box>

        {filteredProduits.length === 0 ? (
          <Paper
            sx={{
              py: 10,
              textAlign: 'center',
              borderRadius: 3,
              border: '1px solid #EEE',
              backgroundColor: '#fff',
            }}
          >
            <ShoppingBag sx={{ fontSize: 52, color: '#DDD', mb: 2 }} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Playfair Display", serif',
                color: '#1A1A1A',
                mb: 1,
              }}
            >
              Aucune pièce trouvée
            </Typography>
            <Typography sx={{ color: '#888', mb: 3 }}>
              {searchTerm ? 'Essayez un autre mot-clé' : 'Aucun produit dans cette catégorie'}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('all');
                setActiveTab(0);
                setPage(1);
              }}
              sx={{
                borderRadius: 50,
                borderColor: '#CCC',
                color: '#1A1A1A',
                textTransform: 'none',
                px: 3,
              }}
            >
              Réinitialiser
            </Button>
          </Paper>
        ) : (
          <>
            <Grid container spacing={3}>
              {filteredProduits.map((produit) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={produit.id}>
                  {renderProductCard(produit)}
                </Grid>
              ))}
            </Grid>

            {/* ===== PAGINATION ===== */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => {
                    setPage(value);
                    window.scrollTo({ top: 520, behavior: 'smooth' });
                  }}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      '&.Mui-selected': {
                        backgroundColor: '#1A1A1A',
                        color: '#FFFFFF',
                        '&:hover': { backgroundColor: '#333' },
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* ========== BANDEAU CTA ========== */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          backgroundColor: '#1A1A1A',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: '#FFF',
              fontSize: { xs: '1.7rem', md: '2.2rem' },
              fontWeight: 300,
              mb: 1.5,
            }}
          >
            L'élégance commence ici
          </Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 3.5, fontSize: '1rem' }}>
            Découvrez aussi nos forfaits relooking et formations en ligne
          </Typography>
          <Button
            component={Link}
            to="/forfaits"
            variant="contained"
            endIcon={<ArrowForward />}
            sx={{
              backgroundColor: '#FFF',
              color: '#1A1A1A',
              borderRadius: 50,
              px: 4,
              py: 1.4,
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.95rem',
              '&:hover': { backgroundColor: '#F0F0F0' },
            }}
          >
            Voir les forfaits
          </Button>
        </Container>
      </Box>

      {/* ========== BOUTON PANIER FLOTTANT ========== */}
      {count > 0 && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 28,
            right: 28,
            zIndex: 1200,
          }}
        >
          <Button
            component={Link}
            to="/panier"
            variant="contained"
            startIcon={<ShoppingBag />}
            sx={{
              backgroundColor: '#1A1A1A',
              color: '#fff',
              borderRadius: 50,
              px: 3.5,
              py: 1.55,
              fontWeight: 600,
              fontSize: '0.9rem',
              textTransform: 'none',
              boxShadow: '0 12px 32px rgba(0,0,0,0.28)',
              '&:hover': {
                backgroundColor: '#333',
                boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
              },
            }}
          >
            {count} article{count > 1 ? 's' : ''} • {formatPrice(total)}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Boutique;