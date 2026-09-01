// src/pages/DetailsProduits.jsx
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
} from '@mui/icons-material';

const PRODUITS = [
  { id: 1, nom: 'Robe Longue Satin Ivoire', categorie: 'robes', prix: 89000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 42, quantite_stock: 12, description: 'Coupe fluide, dos croisé, tissu satiné premium', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
      'https://images.unsplash.com/photo-1539008835657-9e4415c0d0f5?w=400&q=80',
    ] },
  { id: 2, nom: 'Robe Cocktail Noir Élégance', categorie: 'robes', prix: 125000, prix_promotion: 98000, est_en_promotion: true, note: 4.9, nb_avis: 67, quantite_stock: 8, description: 'Silhouette fourreau, encolure bateau', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
    ] },
  { id: 3, nom: 'Robe Midi Plissée Champagne', categorie: 'robes', prix: 72000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 31, quantite_stock: 15, description: 'Plissé permanent, ceinture fine', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&q=80',
    ] },
  { id: 4, nom: 'Robe Asymétrique Soirée', categorie: 'robes', prix: 145000, prix_promotion: null, est_en_promotion: false, note: 5.0, nb_avis: 19, quantite_stock: 5, description: 'Création unique, drapé artistique', image: 'https://images.unsplash.com/photo-1539008835657-9e4415c0d0f5?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1539008835657-9e4415c0d0f5?w=400&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80',
    ] },
  { id: 5, nom: 'Robe Chemise Lin Naturel', categorie: 'robes', prix: 58000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 28, quantite_stock: 20, description: 'Lin lavé, coupe oversized chic', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80',
    ] },
  { id: 6, nom: 'Écharpe Soie Imprimée', categorie: 'accessoires', prix: 35000, prix_promotion: 28000, est_en_promotion: true, note: 4.7, nb_avis: 54, quantite_stock: 25, description: '100% soie, motif floral exclusif', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
    ] },
  { id: 7, nom: 'Ceinture Cuir Fine Or', categorie: 'accessoires', prix: 42000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 38, quantite_stock: 18, description: 'Boucle dorée, cuir pleine fleur', image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80',
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80',
    ] },
  { id: 8, nom: 'Lunettes Soleil Cat-Eye', categorie: 'accessoires', prix: 48000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 45, quantite_stock: 14, description: 'Monture acétate, verres polarisés', image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80',
    ] },
  { id: 9, nom: 'Gants Cuir Beurre', categorie: 'accessoires', prix: 39000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 22, quantite_stock: 10, description: 'Cuir souple, doublure cachemire', image: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&q=80',
    ] },
  { id: 10, nom: 'Foulard Soie', categorie: 'accessoires', prix: 25000, prix_promotion: null, est_en_promotion: false, note: 4.4, nb_avis: 15, quantite_stock: 30, description: 'Foulard en soie naturelle, imprimé floral', image: 'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400&q=80',
    ] },
  { id: 11, nom: 'Escarpins Nuance Nude', categorie: 'chaussures', prix: 78000, prix_promotion: null, est_en_promotion: false, note: 4.7, nb_avis: 61, quantite_stock: 16, description: 'Talon 8 cm, bout pointu, cuir italien', image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1543163521-1a9243229229?w=400&q=80',
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=400&q=80',
    ] },
  { id: 12, nom: 'Sandales à Plateforme Or', categorie: 'chaussures', prix: 92000, prix_promotion: 75000, est_en_promotion: true, note: 4.8, nb_avis: 33, quantite_stock: 9, description: 'Plateforme 4 cm + talon, finition dorée', image: 'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1562273138-f46be4ebdf33?w=400&q=80',
      'https://images.unsplash.com/photo-1543163521-1a9243229229?w=400&q=80',
    ] },
  { id: 13, nom: 'Bottines Cuir Noir', categorie: 'chaussures', prix: 115000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 47, quantite_stock: 11, description: 'Talon block, zip latéral invisible', image: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80',
    ] },
  { id: 14, nom: 'Mules Velours Bordeaux', categorie: 'chaussures', prix: 65000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 29, quantite_stock: 13, description: 'Velours côtelé, talon sculptural', image: 'https://images.unsplash.com/photo-1543163521-1a9243229229?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1543163521-1a9243229229?w=400&q=80',
    ] },
  { id: 15, nom: 'Baskets Cuir Blanc', categorie: 'chaussures', prix: 85000, prix_promotion: null, est_en_promotion: false, note: 4.3, nb_avis: 20, quantite_stock: 18, description: 'Baskets en cuir blanc, semelle épaisse', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80',
    ] },
  { id: 16, nom: 'Collier Perles Baroques', categorie: 'bijoux', prix: 55000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 76, quantite_stock: 22, description: 'Perles d’eau douce, fermoir or 18k', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
    ] },
  { id: 17, nom: 'Boucles d’Oreilles Créoles', categorie: 'bijoux', prix: 32000, prix_promotion: 25000, est_en_promotion: true, note: 4.7, nb_avis: 58, quantite_stock: 30, description: 'Or jaune 14k, diamètre 3 cm', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80',
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    ] },
  { id: 18, nom: 'Bracelet Jonc Martelé', categorie: 'bijoux', prix: 41000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 41, quantite_stock: 17, description: 'Argent 925, finition martelée artisanale', image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80',
    ] },
  { id: 19, nom: 'Bague Solitaire Minimal', categorie: 'bijoux', prix: 68000, prix_promotion: null, est_en_promotion: false, note: 5.0, nb_avis: 24, quantite_stock: 7, description: 'Or blanc, diamant 0,15 ct', image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80',
    ] },
  { id: 20, nom: 'Bracelet Perles', categorie: 'bijoux', prix: 28000, prix_promotion: null, est_en_promotion: false, note: 4.5, nb_avis: 18, quantite_stock: 25, description: 'Perles de culture, fermoir argent', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
    ] },
  { id: 21, nom: 'Sac Bandoulière Cuir Camel', categorie: 'sacs', prix: 135000, prix_promotion: null, est_en_promotion: false, note: 4.8, nb_avis: 52, quantite_stock: 10, description: 'Cuir grainé, bandoulière ajustable', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=400&q=80',
    ] },
  { id: 22, nom: 'Mini Bag Noir Classique', categorie: 'sacs', prix: 98000, prix_promotion: 82000, est_en_promotion: true, note: 4.9, nb_avis: 39, quantite_stock: 14, description: 'Format soirée, chaîne dorée amovible', image: 'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a67437a?w=400&q=80',
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    ] },
  { id: 23, nom: 'Tote Bag Lin & Cuir', categorie: 'sacs', prix: 72000, prix_promotion: null, est_en_promotion: false, note: 4.6, nb_avis: 48, quantite_stock: 19, description: 'Lin naturel, anses cuir, poche intérieure', image: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&q=80',
    ] },
  { id: 24, nom: 'Pochette Soirée Satin', categorie: 'sacs', prix: 45000, prix_promotion: null, est_en_promotion: false, note: 4.7, nb_avis: 27, quantite_stock: 21, description: 'Satin stretch, fermoir cristal', image: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=400&q=80',
    ] },
  { id: 25, nom: 'Sac Seau Cuir Noir', categorie: 'sacs', prix: 155000, prix_promotion: null, est_en_promotion: false, note: 4.9, nb_avis: 33, quantite_stock: 6, description: 'Sac seau en cuir pleine fleur, anses en métal', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=80', images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
    ] },
];

const CATEGORIES = {
  robes: 'Robes',
  accessoires: 'Accessoires',
  chaussures: 'Chaussures',
  bijoux: 'Bijoux',
  sacs: 'Sacs',
};

const DetailsProduits = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [produit, setProduit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantite, setQuantite] = useState(1);
  const [favoris, setFavoris] = useState(false);
  const [panier, setPanier] = useState({});
  const [imagePrincipale, setImagePrincipale] = useState('');

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

  const [commandeOk, setCommandeOk] = useState(false);
  const [loadingPaiement, setLoadingPaiement] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  useEffect(() => {
    const found = PRODUITS.find((p) => p.id === parseInt(id));
    if (found) {
      setProduit(found);
      setImagePrincipale(found.image);
    }
    setLoading(false);

    try {
      const saved = localStorage.getItem('tibetia_panier');
      if (saved) setPanier(JSON.parse(saved));
    } catch (e) {}
  }, [id]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <CircularProgress sx={{ color: '#2E7D32' }} thickness={4} size={60} />
      </Box>
    );
  }

  if (!produit) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ mb: 2, fontFamily: '"Playfair Display", serif' }}>
          Produit non trouvé
        </Typography>
        <Button component={Link} to="/boutique" variant="contained" sx={{ borderRadius: 50, backgroundColor: '#1A1A1A' }}>
          Retour à la boutique
        </Button>
      </Container>
    );
  }

  // Images du produit (si disponibles)
  const imagesList = produit.images || [produit.image];

  return (
    <Box sx={{ backgroundColor: '#FAFAFA', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Bouton retour */}
        <Button
          component={Link}
          to="/boutique"
          startIcon={<ArrowBack />}
          sx={{ mb: 3, color: '#666', fontWeight: 500, '&:hover': { backgroundColor: 'transparent' } }}
        >
          Retour à la boutique
        </Button>

        {/* ===== GRILLE : 3 COLONNES (MINIATURES | IMAGE PRINCIPALE | DÉTAILS) ===== */}
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
              {imagesList.map((img, index) => (
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
                    src={img}
                    alt={`${produit.nom} - vue ${index + 1}`}
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
            <Box
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                backgroundColor: '#FFF',
                border: '1px solid #EEE',
                position: 'sticky',
                top: 20,
              }}
            >
              <Box
                component="img"
                src={imagePrincipale || produit.image}
                alt={produit.nom}
                sx={{
                  width: '100%',
                  height: { xs: 300, sm: 400, md: 500 },
                  objectFit: 'cover',
                  transition: 'all 0.3s ease',
                }}
              />
              {produit.est_en_promotion && (
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
            </Box>
          </Grid>

          {/* ===== COLONNE 3 : DÉTAILS ===== */}
          <Grid item xs={12} sm={4} md={5}>
            <Paper sx={{ p: 4, borderRadius: 3, border: '1px solid #EEE', backgroundColor: '#FFF', height: '100%' }}>
              
              {/* Catégorie */}
              <Typography variant="overline" sx={{ color: '#999', fontWeight: 600, fontSize: '0.7rem', letterSpacing: 1 }}>
                {CATEGORIES[produit.categorie] || produit.categorie}
              </Typography>

              {/* Nom du produit */}
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
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    sx={{
                      fontSize: 18,
                      color: star <= Math.round(produit.note) ? '#D4A017' : '#E5E5E5',
                    }}
                  />
                ))}
                <Typography sx={{ color: '#999', fontSize: '0.85rem' }}>
                  ({produit.nb_avis} avis)
                </Typography>
              </Box>

              {/* ===== PRIX ===== */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                {produit.est_en_promotion ? (
                  <>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: '#C62828', fontSize: { xs: '1.6rem', md: '2rem' } }}>
                      {formatPrice(produit.prix_promotion)}
                    </Typography>
                    <Typography sx={{ color: '#AAA', textDecoration: 'line-through', fontSize: '1rem' }}>
                      {formatPrice(produit.prix)}
                    </Typography>
                    <Chip
                      label={`-${Math.round((1 - produit.prix_promotion / produit.prix) * 100)}%`}
                      size="small"
                      sx={{ backgroundColor: '#C62828', color: '#fff', fontWeight: 700 }}
                    />
                  </>
                ) : (
                  <Typography variant="h3" sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: { xs: '1.6rem', md: '2rem' } }}>
                    {formatPrice(produit.prix)}
                  </Typography>
                )}
              </Box>

              {/* Stock */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  label={produit.quantite_stock > 0 ? `✅ En stock (${produit.quantite_stock} pièces)` : '❌ Rupture de stock'}
                  sx={{
                    backgroundColor: produit.quantite_stock > 0 ? '#E8F5E9' : '#FFEBEE',
                    color: produit.quantite_stock > 0 ? '#2E7D32' : '#C62828',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {/* Description */}
              <Typography variant="body1" sx={{ color: '#555', lineHeight: 1.8, mb: 3 }}>
                {produit.description}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Quantité */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3, flexWrap: 'wrap' }}>
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
                  <IconButton size="small" onClick={() => updateQuantite(-1)} disabled={quantite <= 1}>
                    <Remove fontSize="small" />
                  </IconButton>
                  <Typography sx={{ fontWeight: 700, minWidth: 36, textAlign: 'center' }}>
                    {quantite}
                  </Typography>
                  <IconButton size="small" onClick={() => updateQuantite(1)} disabled={quantite >= produit.quantite_stock}>
                    <Add fontSize="small" />
                  </IconButton>
                </Box>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Total : <strong style={{ color: '#1A1A1A' }}>{formatPrice(prixTotal())}</strong>
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
                  onClick={() => setFavoris(!favoris)}
                  sx={{ border: '1px solid #E0E0E0', borderRadius: 50, width: 56, height: 56 }}
                >
                  {favoris ? <Favorite sx={{ color: '#C62828' }} /> : <FavoriteBorder />}
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
        <Paper sx={{ mt: 4, p: 4, borderRadius: 3, border: '1px solid #EEE', backgroundColor: '#FFF' }}>
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
                    label="Nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    error={!!formErrors.nom}
                    helperText={formErrors.nom}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Person sx={{ color: '#2E7D32' }} /></InputAdornment>,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Prénom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    error={!!formErrors.prenom}
                    helperText={formErrors.prenom}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Person sx={{ color: '#2E7D32' }} /></InputAdornment>,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Email sx={{ color: '#2E7D32' }} /></InputAdornment>,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Téléphone"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleChange}
                    error={!!formErrors.telephone}
                    helperText={formErrors.telephone}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><Phone sx={{ color: '#2E7D32' }} /></InputAdornment>,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Adresse de livraison"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    error={!!formErrors.adresse}
                    helperText={formErrors.adresse}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start"><LocationOn sx={{ color: '#2E7D32' }} /></InputAdornment>,
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ville"
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
                    label="Code postal"
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

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Total : <strong style={{ color: '#1A1A1A', fontSize: '1.2rem' }}>{formatPrice(prixTotal())}</strong>
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
        <Paper sx={{ mt: 3, p: 3, borderRadius: 3, border: '1px solid #E8F5E9', backgroundColor: '#FAFFFA' }}>
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
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>💳 Confirmation de la commande</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Vous confirmez la commande de <strong>{quantite} x {produit.nom}</strong> pour un total de{' '}
            <strong style={{ color: '#2E7D32', fontSize: '1.2rem' }}>{formatPrice(prixTotal())}</strong>
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
            sx={{ backgroundColor: '#2E7D32', '&:hover': { backgroundColor: '#1B5E20' } }}
          >
            {loadingPaiement ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Confirmer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={() => setSnackbarOpen(false)}>
        <Alert severity={snackbarSeverity} sx={{ borderRadius: 2.5 }}>{snackbarMessage}</Alert>
      </Snackbar>
    </Box>
  );
};

export default DetailsProduits;