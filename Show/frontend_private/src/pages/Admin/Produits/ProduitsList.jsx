// src/pages/Admin/Produits/ProduitsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Refresh,
  ShoppingBag,
  Category,
  AttachMoney,
  Inventory,
  CheckCircle,
  Cancel,
  FilterList,
  Clear,
  LocalOffer,
  Image,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const ProduitsList = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [filterCategorie, setFilterCategorie] = useState('all');
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const categories = ['robes', 'accessoires', 'chaussures', 'bijoux', 'sacs', 'AUTRE'];

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getProduits();
      const productsList = Array.isArray(data) ? data : data.results || [];
      setProduits(productsList);
      setFilteredProducts(productsList);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les produits');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = produits;

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategorie !== 'all') {
      result = result.filter((p) => p.categorie === filterCategorie);
    }

    setFilteredProducts(result);
    setPage(1);
  }, [searchTerm, filterCategorie, produits]);

  const handleMenuOpen = (event, produit) => {
    setAnchorEl(event.currentTarget);
    setSelectedProduct(produit);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProduct(null);
  };

  const handleDeleteClick = (produit) => {
    setProductToDelete(produit);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteProduit(productToDelete.id);
      setSnackbar({
        open: true,
        message: `✅ Produit "${productToDelete.nom}" supprimé avec succès`,
        severity: 'success'
      });
      fetchProduits();
    } catch (err) {
      console.error('❌ Erreur suppression:', err);
      setSnackbar({
        open: true,
        message: '❌ Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getCategorieLabel = (categorie) => {
    const labels = {
      robes: 'Robes',
      accessoires: 'Accessoires',
      chaussures: 'Chaussures',
      bijoux: 'Bijoux',
      sacs: 'Sacs',
      AUTRE: 'Autre',
    };
    return labels[categorie] || categorie;
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      robes: '#EC4899',
      accessoires: '#8B5CF6',
      chaussures: '#F59E0B',
      bijoux: '#06B6D4',
      sacs: '#10B981',
      AUTRE: '#6B7280',
    };
    return colors[categorie] || '#6B7280';
  };

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#2C2C2C' }} />
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Chargement des produits...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: '12px' }}
          action={
            <Button color="inherit" size="small" onClick={fetchProduits} startIcon={<Refresh />}>
              Réessayer
            </Button>
          }
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* ===== EN-TÊTE AVEC BOUTON DASHBOARD ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate('/admin/dashboard')}
            sx={{
              borderColor: '#E0E0E0',
              color: '#666666',
              borderRadius: '50px',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#2C2C2C',
                color: '#2C2C2C',
                bgcolor: 'rgba(44,44,44,0.04)',
              },
              px: 2.5,
            }}
          >
            Dashboard
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif' }}>
              Gestion des produits
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              {produits.length} produit{produits.length > 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/produits/nouveau')}
            sx={{
              bgcolor: '#2C2C2C',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1A1A1A' },
              borderRadius: '50px',
              px: 4,
            }}
          >
            Ajouter un produit
          </Button>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total', value: produits.length, icon: <ShoppingBag />, color: '#2C2C2C' },
          { label: 'Disponibles', value: produits.filter((p) => p.est_disponible).length, icon: <CheckCircle />, color: '#2E7D32' },
          { label: 'En promotion', value: produits.filter((p) => p.est_en_promotion).length, icon: <LocalOffer />, color: '#F59E0B' },
          { label: 'Rupture de stock', value: produits.filter((p) => p.quantite_stock === 0).length, icon: <Cancel />, color: '#EF4444' },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C2C2C', mt: 0.5 }}>
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 40, height: 40 }}>
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ===== FILTRES ===== */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '400px', '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: '#F8F8F8' } }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search sx={{ color: '#BDBDBD' }} /></InputAdornment>,
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Clear sx={{ fontSize: 18, color: '#BDBDBD' }} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            size="small"
            label="Filtrer par catégorie"
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            sx={{ minWidth: '150px', '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
            SelectProps={{
              startAdornment: <InputAdornment position="start"><FilterList sx={{ color: '#BDBDBD', fontSize: 18 }} /></InputAdornment>,
            }}
          >
            <MenuItem value="all">Toutes</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{getCategorieLabel(cat)}</MenuItem>
            ))}
          </TextField>

          <IconButton onClick={fetchProduits} sx={{ color: '#666666' }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>
            {filteredProducts.length} résultat{filteredProducts.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* ===== TABLEAU ===== */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Produit</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Catégorie</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Prix</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Stock</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <ShoppingBag sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>Aucun produit trouvé</Typography>
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        {searchTerm || filterCategorie !== 'all' ? 'Aucun produit ne correspond à vos critères' : 'Commencez par ajouter votre premier produit'}
                      </Typography>
                      {!searchTerm && filterCategorie === 'all' && (
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/produits/nouveau')} sx={{ mt: 3, bgcolor: '#2C2C2C', color: '#FFFFFF', borderRadius: '50px' }}>
                          Ajouter un produit
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedProducts.map((produit) => (
                  <TableRow key={produit.id} hover sx={{ '&:hover': { bgcolor: '#F8F8F8' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 48, height: 48, borderRadius: '10px', bgcolor: '#F5F5F5' }}>
                          {produit.image_principale ? (
                            <img src={`${import.meta.env.VITE_MEDIA_URL}${produit.image_principale}`} alt={produit.nom} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Image sx={{ color: '#BDBDBD' }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>{produit.nom}</Typography>
                          <Typography variant="caption" sx={{ color: '#999999' }}>{produit.description?.substring(0, 40)}...</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={getCategorieLabel(produit.categorie)} size="small" sx={{ bgcolor: `${getCategorieColor(produit.categorie)}20`, color: getCategorieColor(produit.categorie), fontWeight: 600 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: produit.est_en_promotion ? '#EF4444' : '#2C2C2C' }}>
                          {formatPrice(produit.prix_actuel || produit.prix)}
                        </Typography>
                        {produit.est_en_promotion && (
                          <Typography variant="caption" sx={{ color: '#999999', textDecoration: 'line-through' }}>
                            {formatPrice(produit.prix)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={produit.quantite_stock}
                        size="small"
                        sx={{
                          bgcolor: produit.quantite_stock > 10 ? '#E8F5E9' : produit.quantite_stock > 0 ? '#FFF3E0' : '#FFEBEE',
                          color: produit.quantite_stock > 10 ? '#2E7D32' : produit.quantite_stock > 0 ? '#F57C00' : '#C62828',
                          fontWeight: 700,
                          minWidth: 40,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={produit.est_disponible ? 'Disponible' : 'Indisponible'}
                        size="small"
                        sx={{
                          bgcolor: produit.est_disponible ? '#E8F5E9' : '#FFEBEE',
                          color: produit.est_disponible ? '#2E7D32' : '#C62828',
                          fontWeight: 600,
                        }}
                        icon={produit.est_disponible ? <CheckCircle sx={{ fontSize: 14 }} /> : <Cancel sx={{ fontSize: 14 }} />}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir">
                        <IconButton size="small" onClick={() => navigate(`/admin/produits/${produit.id}`)} sx={{ color: '#666666' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/admin/produits/${produit.id}/edit`)} sx={{ color: '#666666' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => handleDeleteClick(produit)} sx={{ color: '#EF5350' }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredProducts.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #F0F0F0', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Affichage de {((page - 1) * rowsPerPage) + 1} à {Math.min(page * rowsPerPage, filteredProducts.length)} sur {filteredProducts.length}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': { borderRadius: '8px', '&.Mui-selected': { bgcolor: '#2C2C2C', color: '#FFFFFF' } }
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ===== DIALOG SUPPRESSION ===== */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2C2C2C' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#666666' }}>
            Êtes-vous sûr de vouloir supprimer le produit <strong>"{productToDelete?.nom}"</strong> ?<br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined" sx={{ borderRadius: '8px', textTransform: 'none' }}>Annuler</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" disabled={deleting} sx={{ bgcolor: '#EF5350', '&:hover': { bgcolor: '#C62828' }, borderRadius: '8px', textTransform: 'none' }}>
            {deleting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: '12px', width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProduitsList;