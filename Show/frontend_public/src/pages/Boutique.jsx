// src/pages/Boutique.jsx
import React, { useState, useMemo, useRef } from 'react';
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
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg?url';
import { useNavigate } from 'react-router-dom';

const CATEGORIES = [
  { id: 'robes', label: 'Robes', subtitle: 'Silhouettes élégantes', cover: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80' },
  { id: 'accessoires', label: 'Accessoires', subtitle: 'Détails raffinés', cover: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80' },
  { id: 'chaussures', label: 'Chaussures', subtitle: 'Pas de style', cover: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=800&q=80' },
  { id: 'bijoux', label: 'Bijoux', subtitle: 'Éclat & finesse', cover: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80' },
  { id: 'sacs', label: 'Sacs', subtitle: 'Pièces signature', cover: 'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=800&q=80' },
];

const PRODUITS = [
  // ——— ROBES (5) ———
  { id: 1, nom: 'Robe Longue Satin Ivoire', categorie: 'robes', prix: 89000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 42, quantite_stock: 12, description: 'Coupe fluide, dos croisé, tissu satiné premium', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80' },
  { id: 2, nom: 'Robe Cocktail Noir Élégance', categorie: 'robes', prix: 125000, prix_promotion: 98000, est_en_promotion: true, note: 4.9, nb_avis: 67, quantite_stock: 8, description: 'Silhouette fourreau, encolure bateau', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&q=80' },
  { id: 3, nom: 'Robe Midi Plissée Champagne', categorie: 'robes', prix: 72000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 31, quantite_stock: 15, description: 'Plissé permanent, ceinture fine', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&q=80' },
  { id: 4, nom: 'Robe Asymétrique Soirée', categorie: 'robes', prix: 145000, prix_promotion: null, est_en_promotion: false, note: 5.0, nb_avis: 19, quantite_stock: 5, description: 'Création unique, drapé artistique', image: 'https://images.unsplash.com/photo-1539008835657-9e4415c0d0f5?w=600&q=80' },
  { id: 5, nom: 'Robe Chemise Lin Naturel', categorie: 'robes', prix: 58000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 28, quantite_stock: 20, description: 'Lin lavé, coupe oversized chic', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80' },
  // ——— ACCESSOIRES (5) ———
  { id: 6, nom: 'Écharpe Soie Imprimée', categorie: 'accessoires', prix: 35000, prix_promotion: 28000, est_en_promotion: true, note: 4.7, nb_avis: 54, quantite_stock: 25, description: '100% soie, motif floral exclusif', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80' },
  { id: 7, nom: 'Ceinture Cuir Fine Or', categorie: 'accessoires', prix: 42000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 38, quantite_stock: 18, description: 'Boucle dorée, cuir pleine fleur', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&q=80' },
  { id: 8, nom: 'Lunettes Soleil Cat-Eye', categorie: 'accessoires', prix: 48000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 45, quantite_stock: 14, description: 'Monture acétate, verres polarisés', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&q=80' },
  { id: 9, nom: 'Gants Cuir Beurre', categorie: 'accessoires', prix: 39000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 22, quantite_stock: 10, description: 'Cuir souple, doublure cachemire', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=600&q=80' },
  { id: 10, nom: 'Foulard Soie', categorie: 'accessoires', prix: 25000, prix_promotion: null, est_en_promotion: false, note: 4.4, nb_avis: 15, quantite_stock: 30, description: 'Foulard en soie naturelle, imprimé floral', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=600&q=80' },
  // ——— CHAUSSURES (5) ———
  { id: 11, nom: 'Escarpins Nuance Nude', categorie: 'chaussures', prix: 78000, prix_promotion: null, est_en_promotion: false, note: 4.7, nb_avis: 61, quantite_stock: 16, description: 'Talon 8 cm, bout pointu, cuir italien', image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=600&q=80' },
  { id: 12, nom: 'Sandales à Plateforme Or', categorie: 'chaussures', prix: 92000, prix_promotion: 75000, est_en_promotion: true, note: 4.8, nb_avis: 33, quantite_stock: 9, description: 'Plateforme 4 cm + talon, finition dorée', image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=600&q=80' },
  { id: 13, nom: 'Bottines Cuir Noir', categorie: 'chaussures', prix: 115000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 47, quantite_stock: 11, description: 'Talon block, zip latéral invisible', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=600&q=80' },
  { id: 14, nom: 'Mules Velours Bordeaux', categorie: 'chaussures', prix: 65000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 29, quantite_stock: 13, description: 'Velours côtelé, talon sculptural', image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=600&q=80' },
  { id: 15, nom: 'Baskets Cuir Blanc', categorie: 'chaussures', prix: 85000, prix_promotion: null, est_en_promotion: false, note: 4.3, nb_avis: 20, quantite_stock: 18, description: 'Baskets en cuir blanc, semelle épaisse', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&q=80' },
  // ——— BIJOUX (5) ———
  { id: 16, nom: 'Collier Perles Baroques', categorie: 'bijoux', prix: 55000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 76, quantite_stock: 22, description: 'Perles d’eau douce, fermoir or 18k', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
  { id: 17, nom: 'Boucles d’Oreilles Créoles', categorie: 'bijoux', prix: 32000, prix_promotion: 25000, est_en_promotion: true, note: 4.7, nb_avis: 58, quantite_stock: 30, description: 'Or jaune 14k, diamètre 3 cm', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&q=80' },
  { id: 18, nom: 'Bracelet Jonc Martelé', categorie: 'bijoux', prix: 41000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 41, quantite_stock: 17, description: 'Argent 925, finition martelée artisanale', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&q=80' },
  { id: 19, nom: 'Bague Solitaire Minimal', categorie: 'bijoux', prix: 68000, prix_promotion: null, est_en_promotion: false, note: 5.0, nb_avis: 24, quantite_stock: 7, description: 'Or blanc, diamant 0,15 ct', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&q=80' },
  { id: 20, nom: 'Bracelet Perles', categorie: 'bijoux', prix: 28000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 18, quantite_stock: 25, description: 'Perles de culture, fermoir argent', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' },
  // ——— SACS (5) ———
  { id: 21, nom: 'Sac Bandoulière Cuir Camel', categorie: 'sacs', prix: 135000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 52, quantite_stock: 10, description: 'Cuir grainé, bandoulière ajustable', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
  { id: 22, nom: 'Mini Bag Noir Classique', categorie: 'sacs', prix: 98000, prix_promotion: 82000, est_en_promotion: true, note: 4.9, nb_avis: 39, quantite_stock: 14, description: 'Format soirée, chaîne dorée amovible', image: 'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=600&q=80' },
  { id: 23, nom: 'Tote Bag Lin & Cuir', categorie: 'sacs', prix: 72000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 48, quantite_stock: 19, description: 'Lin naturel, anses cuir, poche intérieure', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&q=80' },
  { id: 24, nom: 'Pochette Soirée Satin', categorie: 'sacs', prix: 45000, prix_promotion: null, est_en_promotion: false, note: 4.7, nb_avis: 27, quantite_stock: 21, description: 'Satin stretch, fermoir cristal', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&q=80' },
  { id: 25, nom: 'Sac Seau Cuir Noir', categorie: 'sacs', prix: 155000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 33, quantite_stock: 6, description: 'Sac seau en cuir pleine fleur, anses en métal', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&q=80' },
];

const Boutique = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const scrollContainerRef = useRef(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [favorites, setFavorites] = useState([]);
  const [panier, setPanier] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const filteredProduits = useMemo(() => {
    let list = [...PRODUITS];

    if (selectedCategorie !== 'all') {
      list = list.filter((p) => p.categorie === selectedCategorie);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.nom.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.categorie.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return (a.prix_promotion || a.prix) - (b.prix_promotion || b.prix);
        case 'price-desc':
          return (b.prix_promotion || b.prix) - (a.prix_promotion || a.prix);
        case 'popular':
        default:
          return (b.note || 0) - (a.note || 0);
      }
    });

    return list;
  }, [selectedCategorie, searchTerm, sortBy]);

  // Fonctions de scroll
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
    PRODUITS.forEach((p) => {
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
    window.scrollTo({ top: 520, behavior: 'smooth' });
  };

  // Rendu d'une carte produit
  const renderProductCard = (produit) => (
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
          '& .product-img': { transform: 'scale(1.05)' },
        },
      }}
    >
      {produit.est_en_promotion && (
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
            px: 0.5,
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
          className="product-img"
          src={produit.image}
          alt={produit.nom}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
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
          {CATEGORIES.find((c) => c.id === produit.categorie)?.label}
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
                color: star <= Math.round(produit.note) ? '#D4A017' : '#E5E5E5',
              }}
            />
          ))}
          <Typography sx={{ color: '#999', ml: 0.5, fontSize: '0.72rem' }}>
            ({produit.nb_avis})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.1, mb: 2 }}>
          {produit.est_en_promotion ? (
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
                      <IconButton size="small" onClick={() => setSearchTerm('')}>
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
                    onChange={(e) => setSortBy(e.target.value)}
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

      {/* ========== PRODUITS - SCROLL HORIZONTAL ========== */}
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
          <Box
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
              Essayez une autre catégorie ou un autre mot-clé
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorie('all');
                setActiveTab(0);
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
          </Box>
        ) : (
          <>
            {/* ===== CONTENEUR SCROLLABLE ===== */}
            <Box sx={{ position: 'relative' }}>
              <IconButton
                onClick={scrollLeft}
                sx={{
                  position: 'absolute',
                  left: { xs: -12, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                  display: { xs: 'none', sm: 'flex' },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowBack />
              </IconButton>

              <Box
                ref={scrollContainerRef}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 3,
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  py: 2,
                  px: 1,
                  scrollBehavior: 'smooth',
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-track': { backgroundColor: '#F0F0F0', borderRadius: 10 },
                  '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: 10 },
                  '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#A0A0A0' },
                }}
              >
                {filteredProduits.map((produit) => renderProductCard(produit))}
              </Box>

              <IconButton
                onClick={scrollRight}
                sx={{
                  position: 'absolute',
                  right: { xs: -12, md: -20 },
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  backgroundColor: 'rgba(255,255,255,0.95)',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                  '&:hover': { backgroundColor: '#FFFFFF' },
                  display: { xs: 'none', sm: 'flex' },
                  width: 40,
                  height: 40,
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>

            {/* ===== "VOIR TOUS" ===== */}
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                component={Link}
                to="/boutique"
                variant="contained"
                sx={{
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  px: 5,
                  py: 1.3,
                  borderRadius: 50,
                  textTransform: 'none',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#333' },
                }}
                endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              >
                Voir tous les produits
              </Button>
            </Box>
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