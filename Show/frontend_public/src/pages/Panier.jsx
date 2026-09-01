// src/pages/Panier.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  IconButton,
  Divider,
  TextField,
  Chip,
  Paper,
} from '@mui/material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import LockIcon from '@mui/icons-material/Lock';

const PRODUITS = [
  { id: 1, nom: 'Robe Longue Satin Ivoire', categorie: 'Robes', prix: 89000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80' },
  { id: 2, nom: 'Robe Cocktail Noir Élégance', categorie: 'Robes', prix: 125000, prix_promotion: 98000, image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80' },
  { id: 3, nom: 'Robe Midi Plissée Champagne', categorie: 'Robes', prix: 72000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80' },
  { id: 4, nom: 'Robe Asymétrique Soirée', categorie: 'Robes', prix: 145000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1539008835657-9e4415c0d0f5?w=400&q=80' },
  { id: 5, nom: 'Robe Chemise Lin Naturel', categorie: 'Robes', prix: 58000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80' },
  { id: 6, nom: 'Écharpe Soie Imprimée', categorie: 'Accessoires', prix: 35000, prix_promotion: 28000, image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80' },
  { id: 7, nom: 'Ceinture Cuir Fine Or', categorie: 'Accessoires', prix: 42000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80' },
  { id: 8, nom: 'Lunettes Soleil Cat-Eye', categorie: 'Accessoires', prix: 48000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80' },
  { id: 9, nom: 'Gants Cuir Beurre', categorie: 'Accessoires', prix: 39000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&q=80' },
  { id: 10, nom: 'Escarpins Nuance Nude', categorie: 'Chaussures', prix: 78000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=400&q=80' },
  { id: 11, nom: 'Sandales à Plateforme Or', categorie: 'Chaussures', prix: 92000, prix_promotion: 75000, image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=400&q=80' },
  { id: 12, nom: 'Bottines Cuir Noir', categorie: 'Chaussures', prix: 115000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80' },
  { id: 13, nom: 'Mules Velours Bordeaux', categorie: 'Chaussures', prix: 65000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=400&q=80' },
  { id: 14, nom: 'Collier Perles Baroques', categorie: 'Bijoux', prix: 55000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
  { id: 15, nom: 'Boucles d\'Oreilles Créoles', categorie: 'Bijoux', prix: 32000, prix_promotion: 25000, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
  { id: 16, nom: 'Bracelet Jonc Martelé', categorie: 'Bijoux', prix: 41000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80' },
  { id: 17, nom: 'Bague Solitaire Minimal', categorie: 'Bijoux', prix: 68000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80' },
  { id: 18, nom: 'Sac Bandoulière Cuir Camel', categorie: 'Sacs', prix: 135000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80' },
  { id: 19, nom: 'Mini Bag Noir Classique', categorie: 'Sacs', prix: 98000, prix_promotion: 82000, image: 'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=400&q=80' },
  { id: 20, nom: 'Tote Bag Lin & Cuir', categorie: 'Sacs', prix: 72000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80' },
  { id: 21, nom: 'Pochette Soirée Satin', categorie: 'Sacs', prix: 45000, prix_promotion: null, image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80' },
];

const formatPrice = (price) =>
  new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(price);

const Panier = () => {
  const [panier, setPanier] = useState({});
  const [codePromo, setCodePromo] = useState('');
  const [promoApplique, setPromoApplique] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tibetia_panier');
      if (saved) setPanier(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tibetia_panier', JSON.stringify(panier));
  }, [panier]);

  const items = Object.entries(panier)
    .map(([id, qty]) => {
      const produit = PRODUITS.find((p) => p.id === Number(id));
      if (!produit) return null;
      return { ...produit, quantite: qty };
    })
    .filter(Boolean);

  const sousTotal = items.reduce((acc, item) => {
    const price = item.prix_promotion || item.prix;
    return acc + price * item.quantite;
  }, 0);

  const fraisLivraison = sousTotal > 150000 ? 0 : 5000;
  const reduction = promoApplique === 'ELEGANCE10' ? Math.round(sousTotal * 0.1) : 0;
  const total = sousTotal + fraisLivraison - reduction;

  const updateQty = (id, delta) => {
    setPanier((prev) => {
      const next = { ...prev };
      const current = next[id] || 0;
      const newQty = current + delta;
      if (newQty <= 0) delete next[id];
      else next[id] = newQty;
      return next;
    });
  };

  const removeItem = (id) => {
    setPanier((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const appliquerPromo = () => {
    if (codePromo.trim().toUpperCase() === 'ELEGANCE10') {
      setPromoApplique('ELEGANCE10');
    } else {
      setPromoApplique(null);
      alert('Code promo invalide. Essayez : ELEGANCE10');
    }
  };

  if (items.length === 0) {
    return (
      <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: '50%',
                backgroundColor: '#F0F0F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 3,
              }}
            >
              <ShoppingBagIcon sx={{ fontSize: 44, color: '#BBB' }} />
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontFamily: '"Playfair Display", serif',
                fontWeight: 300,
                color: '#1A1A1A',
                mb: 1.5,
                fontSize: { xs: '1.8rem', md: '2.4rem' },
              }}
            >
              Votre panier est vide
            </Typography>
            <Typography sx={{ color: '#777', mb: 4, fontSize: '1.05rem' }}>
              Découvrez nos pièces sélectionnées et commencez votre shopping
            </Typography>
            <Button
              component={Link}
              to="/boutique"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: '#1A1A1A',
                color: '#fff',
                borderRadius: 50,
                px: 4.5,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                '&:hover': { backgroundColor: '#333' },
              }}
            >
              Continuer mes achats
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', pb: 8 }}>
      <Box sx={{ backgroundColor: '#FFF', borderBottom: '1px solid #EEE', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              component={Link}
              to="/boutique"
              sx={{
                border: '1px solid #E0E0E0',
                borderRadius: 2,
                '&:hover': { backgroundColor: '#F5F5F5' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 300,
                  color: '#1A1A1A',
                  fontSize: { xs: '1.6rem', md: '2rem' },
                }}
              >
                Mon panier
              </Typography>
              <Typography sx={{ color: '#888', fontSize: '0.9rem' }}>
                {items.length} article{items.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{ borderRadius: 3, border: '1px solid #EEE', overflow: 'hidden', backgroundColor: '#FFF' }}
            >
              {items.map((item, index) => (
                <Box key={item.id}>
                  {index > 0 && <Divider />}
                  <Box
                    sx={{
                      p: { xs: 2, md: 3 },
                      display: 'flex',
                      gap: { xs: 2, md: 3 },
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: 90, md: 120 },
                        height: { xs: 110, md: 140 },
                        borderRadius: 2,
                        overflow: 'hidden',
                        flexShrink: 0,
                        backgroundColor: '#F5F5F5',
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.nom}
                        sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </Box>

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#999',
                          fontWeight: 600,
                          letterSpacing: 0.6,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase',
                        }}
                      >
                        {item.categorie}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                          color: '#1A1A1A',
                          fontSize: { xs: '0.95rem', md: '1.05rem' },
                          mt: 0.3,
                          mb: 1,
                        }}
                      >
                        {item.nom}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
                        {item.prix_promotion ? (
                          <>
                            <Typography sx={{ fontWeight: 700, color: '#C62828', fontSize: '1rem' }}>
                              {formatPrice(item.prix_promotion)}
                            </Typography>
                            <Typography sx={{ color: '#AAA', textDecoration: 'line-through', fontSize: '0.85rem' }}>
                              {formatPrice(item.prix)}
                            </Typography>
                          </>
                        ) : (
                          <Typography sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1rem' }}>
                            {formatPrice(item.prix)}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            backgroundColor: '#F5F5F5',
                            borderRadius: 50,
                            px: 0.5,
                          }}
                        >
                          <IconButton size="small" onClick={() => updateQty(item.id, -1)}>
                            <RemoveIcon fontSize="small" />
                          </IconButton>
                          <Typography sx={{ fontWeight: 700, minWidth: 28, textAlign: 'center', fontSize: '0.95rem' }}>
                            {item.quantite}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQty(item.id, 1)}>
                            <AddIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => removeItem(item.id)}
                          sx={{ color: '#999', '&:hover': { color: '#C62828', backgroundColor: 'rgba(198,40,40,0.06)' } }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'right', minWidth: 110 }}>
                      <Typography sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.05rem' }}>
                        {formatPrice((item.prix_promotion || item.prix) * item.quantite)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              ))}
            </Paper>

            <Button
              component={Link}
              to="/boutique"
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 2.5, color: '#555', textTransform: 'none', fontWeight: 500, '&:hover': { backgroundColor: 'transparent', color: '#1A1A1A' } }}
            >
              Continuer mes achats
            </Button>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid #EEE',
                backgroundColor: '#FFF',
                position: 'sticky',
                top: 24,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                  color: '#1A1A1A',
                  mb: 2.5,
                }}
              >
                Récapitulatif
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Sous-total</Typography>
                <Typography sx={{ fontWeight: 600, color: '#1A1A1A' }}>{formatPrice(sousTotal)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ color: '#666', fontSize: '0.95rem' }}>Livraison</Typography>
                <Typography sx={{ fontWeight: 600, color: fraisLivraison === 0 ? '#2E7D32' : '#1A1A1A' }}>
                  {fraisLivraison === 0 ? 'Offerte' : formatPrice(fraisLivraison)}
                </Typography>
              </Box>

              {reduction > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography sx={{ color: '#2E7D32', fontSize: '0.95rem' }}>Réduction (ELEGANCE10)</Typography>
                  <Typography sx={{ fontWeight: 600, color: '#2E7D32' }}>−{formatPrice(reduction)}</Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#1A1A1A' }}>Total</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A' }}>{formatPrice(total)}</Typography>
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                <TextField
                  size="small"
                  placeholder="Code promo"
                  value={codePromo}
                  onChange={(e) => setCodePromo(e.target.value)}
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, backgroundColor: '#FAFAFA' } }}
                />
                <Button
                  variant="outlined"
                  onClick={appliquerPromo}
                  sx={{ borderRadius: 2, borderColor: '#DDD', color: '#1A1A1A', textTransform: 'none', fontWeight: 600, px: 2, whiteSpace: 'nowrap' }}
                >
                  OK
                </Button>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  borderRadius: 50,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  mb: 2,
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                Passer commande
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, color: '#888', fontSize: '0.8rem' }}>
                <LockIcon sx={{ fontSize: 14 }} />
                Paiement sécurisé
              </Box>

              {fraisLivraison === 0 ? (
                <Chip
                  icon={<LocalShippingIcon sx={{ fontSize: 16 }} />}
                  label="Livraison offerte"
                  size="small"
                  sx={{ mt: 2, width: '100%', backgroundColor: '#E8F5E9', color: '#2E7D32', fontWeight: 600, height: 32 }}
                />
              ) : (
                <Typography sx={{ mt: 2, textAlign: 'center', color: '#888', fontSize: '0.8rem' }}>
                  Livraison offerte dès 150 000 CFA
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Panier;