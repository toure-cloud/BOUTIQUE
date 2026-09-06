// src/pages/Admin/Clients/ClientsList.jsx
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
  Card,
  CardContent,
  Grid,
  Avatar,
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
  Visibility,
  Refresh,
  People,
  Person,
  Email,
  Phone,
  CheckCircle,
  Cancel,
  Clear,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getClients();
      const clientsList = Array.isArray(data) ? data : data.results || [];
      setClients(clientsList);
      setFilteredClients(clientsList);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = clients;

    if (searchTerm) {
      result = result.filter(
        (c) =>
          c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.telephone?.includes(searchTerm)
      );
    }

    setFilteredClients(result);
    setPage(1);
  }, [searchTerm, clients]);

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteClient(clientToDelete.id);
      setSnackbar({
        open: true,
        message: `✅ Client "${clientToDelete.nom} ${clientToDelete.prenom}" supprimé avec succès`,
        severity: 'success'
      });
      fetchClients();
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
      setClientToDelete(null);
    }
  };

  const paginatedClients = filteredClients.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#2C2C2C' }} />
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Chargement des clients...
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
            <Button color="inherit" size="small" onClick={fetchClients} startIcon={<Refresh />}>
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
              Gestion des clients
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              {clients.length} client{clients.length > 1 ? 's' : ''} au total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate('/admin/clients/nouveau')}
            sx={{
              bgcolor: '#2C2C2C',
              color: '#FFFFFF',
              '&:hover': { bgcolor: '#1A1A1A' },
              borderRadius: '50px',
              px: 4,
            }}
          >
            Ajouter un client
          </Button>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total', value: clients.length, icon: <People />, color: '#2C2C2C' },
          { label: 'Avec compte', value: clients.filter((c) => c.user).length, icon: <CheckCircle />, color: '#2E7D32' },
          { label: 'Sans compte', value: clients.filter((c) => !c.user).length, icon: <Person />, color: '#F59E0B' },
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
            placeholder="Rechercher un client..."
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

          <IconButton onClick={fetchClients} sx={{ color: '#666666' }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>
            {filteredClients.length} résultat{filteredClients.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* ===== TABLEAU ===== */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Téléphone</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <People sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>Aucun client trouvé</Typography>
                      <Typography variant="body2" sx={{ color: '#999999' }}>Commencez par ajouter votre premier client</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow key={client.id} hover sx={{ '&:hover': { bgcolor: '#F8F8F8' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                          {client.prenom?.[0]}{client.nom?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                            {client.prenom} {client.nom}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999999' }}>
                            Inscrit le {new Date(client.created_at).toLocaleDateString('fr-FR')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email sx={{ fontSize: 14, color: '#BDBDBD' }} />
                        <Typography variant="body2">{client.email}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone sx={{ fontSize: 14, color: '#BDBDBD' }} />
                        <Typography variant="body2">{client.telephone}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={client.user ? '✅ Inscrit' : '❌ Invité'}
                        size="small"
                        sx={{
                          bgcolor: client.user ? '#E8F5E9' : '#FFF3E0',
                          color: client.user ? '#2E7D32' : '#F57C00',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Voir">
                        <IconButton size="small" onClick={() => navigate(`/admin/clients/${client.id}`)} sx={{ color: '#666666' }}>
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Modifier">
                        <IconButton size="small" onClick={() => navigate(`/admin/clients/${client.id}/edit`)} sx={{ color: '#666666' }}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton size="small" onClick={() => handleDeleteClick(client)} sx={{ color: '#EF5350' }}>
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

        {filteredClients.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderTop: '1px solid #F0F0F0', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Affichage de {((page - 1) * rowsPerPage) + 1} à {Math.min(page * rowsPerPage, filteredClients.length)} sur {filteredClients.length}
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
            Êtes-vous sûr de vouloir supprimer le client <strong>"{clientToDelete?.prenom} {clientToDelete?.nom}"</strong> ?<br />
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

export default ClientsList;