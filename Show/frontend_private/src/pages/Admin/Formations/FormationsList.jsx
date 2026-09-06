// src/pages/Admin/Formations/FormationsList.jsx
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
  School,
  VideoLibrary,
  AttachMoney,
  PlayArrow,
  Replay,
  Schedule,
  CheckCircle,
  Cancel,
  FilterList,
  Clear,
  AccessTime,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const FormationsList = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedFormation, setSelectedFormation] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const [filterStatut, setFilterStatut] = useState('all');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const statuts = [
    { value: 'PROGRAMME', label: 'Programmé', color: '#3B82F6' },
    { value: 'LIVE', label: 'En direct', color: '#EF4444' },
    { value: 'REPLAY', label: 'Replay', color: '#F59E0B' },
    { value: 'TERMINE', label: 'Terminé', color: '#10B981' },
  ];

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFormations();
      const formationsList = Array.isArray(data) ? data : data.results || [];
      setFormations(formationsList);
      setFilteredFormations(formationsList);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les formations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = formations;

    if (searchTerm) {
      result = result.filter(
        (f) =>
          f.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatut !== 'all') {
      result = result.filter((f) => f.statut === filterStatut);
    }

    setFilteredFormations(result);
    setPage(1);
  }, [searchTerm, filterStatut, formations]);

  const getStatutChip = (statut) => {
    const config = statuts.find(s => s.value === statut);
    if (!config) return <Chip label={statut} size="small" />;
    
    let icon = null;
    if (statut === 'LIVE') icon = <PlayArrow sx={{ fontSize: 14 }} />;
    else if (statut === 'REPLAY') icon = <Replay sx={{ fontSize: 14 }} />;
    else if (statut === 'PROGRAMME') icon = <Schedule sx={{ fontSize: 14 }} />;
    else if (statut === 'TERMINE') icon = <CheckCircle sx={{ fontSize: 14 }} />;
    
    return (
      <Chip
        icon={icon}
        label={config.label}
        size="small"
        sx={{
          backgroundColor: `${config.color}20`,
          color: config.color,
          fontWeight: 600,
          '& .MuiChip-icon': { color: config.color },
        }}
      />
    );
  };

  const formatPrice = (price) => {
    if (!price) return 'Gratuit';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteClick = (formation) => {
    setFormationToDelete(formation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formationToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteFormation(formationToDelete.id);
      setSnackbar({
        open: true,
        message: `✅ Formation "${formationToDelete.titre}" supprimée avec succès`,
        severity: 'success'
      });
      fetchFormations();
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
      setFormationToDelete(null);
    }
  };

  const paginatedFormations = filteredFormations.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredFormations.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#2C2C2C' }} />
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Chargement des formations...
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
            <Button color="inherit" size="small" onClick={fetchFormations} startIcon={<Refresh />}>
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
              Gestion des formations
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              {formations.length} formation{formations.length > 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/formations/nouveau')}
            sx={{
              bgcolor: '#2C2C2C',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1A1A1A' },
              borderRadius: '50px',
              px: 4,
            }}
          >
            Ajouter une formation
          </Button>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total', value: formations.length, icon: <VideoLibrary />, color: '#2C2C2C' },
          { label: 'En direct', value: formations.filter((f) => f.statut === 'LIVE').length, icon: <PlayArrow />, color: '#EF4444' },
          { label: 'Replays', value: formations.filter((f) => f.statut === 'REPLAY').length, icon: <Replay />, color: '#F59E0B' },
          { label: 'Programmées', value: formations.filter((f) => f.statut === 'PROGRAMME').length, icon: <Schedule />, color: '#3B82F6' },
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
                  <Avatar sx={{ bgcolor: `${stat.color}20`, color: stat.color, width: 40, height: 40 }}>
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
            placeholder="Rechercher une formation..."
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
            label="Filtrer par statut"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            sx={{ minWidth: '150px', '& .MuiOutlinedInput-root': { borderRadius: '50px' } }}
            SelectProps={{
              startAdornment: <InputAdornment position="start"><FilterList sx={{ color: '#BDBDBD', fontSize: 18 }} /></InputAdornment>,
            }}
          >
            <MenuItem value="all">Tous</MenuItem>
            {statuts.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </TextField>

          <IconButton onClick={fetchFormations} sx={{ color: '#666666' }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>
            {filteredFormations.length} résultat{filteredFormations.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* ===== TABLEAU ===== */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Formation</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Durée</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Prix</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Inscriptions</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedFormations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <School sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>Aucune formation trouvée</Typography>
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        {searchTerm || filterStatut !== 'all' ? 'Aucune formation ne correspond à vos critères' : 'Commencez par ajouter votre première formation'}
                      </Typography>
                      {!searchTerm && filterStatut === 'all' && (
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/admin/formations/nouveau')} sx={{ mt: 3, bgcolor: '#2C2C2C', color: '#FFFFFF', borderRadius: '50px' }}>
                          Ajouter une formation
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFormations.map((formation) => (
                  <TableRow key={formation.id} hover sx={{ '&:hover': { bgcolor: '#F8F8F8' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 48, height: 48, borderRadius: '10px', bgcolor: '#F5F5F5' }}>
                          {formation.image ? (
                            <img src={`${import.meta.env.VITE_MEDIA_URL}${formation.image}`} alt={formation.titre} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <School sx={{ color: '#BDBDBD' }} />
                          )}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                            {formation.titre}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999999' }}>
                            {formation.description?.substring(0, 40)}...
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTime sx={{ fontSize: 14, color: '#BDBDBD' }} />
                        <Typography variant="body2">{formation.duree || 'Non définie'}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
                        {formatPrice(formation.prix)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getStatutChip(formation.statut)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={formation.inscriptions_count || 0}
                        size="small"
                        sx={{ bgcolor: '#EEF2FF', color: '#6366F1', fontWeight: 600 }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir">
                        <IconButton size="small" onClick={() => navigate(`/admin/formations/${formation.id}`)} sx={{ color: '#666666' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/admin/formations/${formation.id}/edit`)} sx={{ color: '#666666' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => handleDeleteClick(formation)} sx={{ color: '#EF5350' }}>
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

        {filteredFormations.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #F0F0F0', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Affichage de {((page - 1) * rowsPerPage) + 1} à {Math.min(page * rowsPerPage, filteredFormations.length)} sur {filteredFormations.length}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{ '& .MuiPaginationItem-root': { borderRadius: '8px', '&.Mui-selected': { bgcolor: '#2C2C2C', color: '#FFFFFF' } } }}
            />
          </Box>
        )}
      </Paper>

      {/* ===== DIALOG SUPPRESSION ===== */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: '#2C2C2C' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#666666' }}>
            Êtes-vous sûr de vouloir supprimer la formation <strong>"{formationToDelete?.titre}"</strong> ?<br />
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

export default FormationsList;