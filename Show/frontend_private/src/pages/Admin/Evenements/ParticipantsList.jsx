import { logger } from '../../../lib/logger';
// src/pages/Admin/Evenements/ParticipantsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  Stack,
  Tooltip,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
} from '@mui/material';
import {
  ArrowBack,
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
  Event,
  CalendarToday,
  LocationOn,
  Print,
  Download,
  BarChart,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const ParticipantsList = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
  setLoading(true);
  setError(null);
  try {
    const eventData = await adminService.getEvenementById(parseInt(id));
    setEvenement(eventData);

    const data = await adminService.getParticipantsByEvenement(parseInt(id));
    logger.log('📋 Participants reçus:', data);
    
    // ✅ Extraire correctement les résultats
    let participantsList = [];
    if (data && data.results) {
      participantsList = data.results;
    } else if (Array.isArray(data)) {
      participantsList = data;
    }
    
    // ✅ Vérifier que chaque participation a un client
    participantsList = participantsList.filter(p => p.client !== null);
    
    logger.log('📋 Participants après filtrage:', participantsList);
    
    setParticipants(participantsList);
    setFilteredParticipants(participantsList);
    setTotalCount(participantsList.length);
  } catch (err) {
    logger.error('❌ Erreur:', err);
    setError('Impossible de charger les participants');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    let result = participants;

    if (searchTerm) {
      result = result.filter(
        (p) => {
          const client = p.client;
          return (
            client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client?.telephone?.includes(searchTerm)
          );
        }
      );
    }

    setFilteredParticipants(result);
    setTotalCount(result.length);
    setPage(0);
  }, [searchTerm, participants]);

  const handleDeleteClick = (participant) => {
    setParticipantToDelete(participant);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!participantToDelete) return;
    
    setDeleting(true);
    try {
      await adminService.deleteParticipation(participantToDelete.id);
      setSnackbar({
        open: true,
        message: `✅ Participation supprimée avec succès`,
        severity: 'success'
      });
      fetchData();
    } catch (err) {
      logger.error('❌ Erreur suppression:', err);
      setSnackbar({
        open: true,
        message: '❌ Erreur lors de la suppression',
        severity: 'error'
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setParticipantToDelete(null);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const paginatedParticipants = filteredParticipants.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', flexDirection: 'column', gap: 2 }}>
        <CircularProgress sx={{ color: '#2C2C2C' }} />
        <Typography variant="body2" sx={{ color: '#666666' }}>
          Chargement des participants...
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
            <Button color="inherit" size="small" onClick={fetchData} startIcon={<Refresh />}>
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
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate('/admin/evenements')}
            sx={{ color: '#666666', '&:hover': { color: '#2C2C2C' } }}
          >
            Retour aux événements
          </Button>
        </Box>

        {/* ===== INFORMATIONS DE L'ÉVÉNEMENT ===== */}
        {evenement && (
          <Box
            sx={{
              p: 3,
              mb: 3,
              borderRadius: '16px',
              background: `linear-gradient(135deg, #F8FAFC 0%, #EEF2FF 100%)`,
              border: '1px solid #E2E8F0',
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={7}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: '#6366F1',
                      color: '#FFFFFF',
                    }}
                  >
                    <Event />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1E293B' }}>
                      {evenement.titre}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      <Chip
                        icon={<CalendarToday sx={{ fontSize: 16 }} />}
                        label={formatDate(evenement.date_debut)}
                        size="small"
                        sx={{ bgcolor: '#EEF2FF', color: '#6366F1' }}
                      />
                      <Chip
                        icon={<LocationOn sx={{ fontSize: 16 }} />}
                        label={evenement.lieu}
                        size="small"
                        sx={{ bgcolor: '#EEF2FF', color: '#6366F1' }}
                      />
                      <Chip
                        icon={<People sx={{ fontSize: 16 }} />}
                        label={`${totalCount} participant${totalCount > 1 ? 's' : ''}`}
                        size="small"
                        sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}
                      />
                      <Chip
                        label={evenement.statut === 'A_VENIR' ? 'À venir' : evenement.statut}
                        size="small"
                        sx={{
                          bgcolor: evenement.statut === 'A_VENIR' ? '#E3F2FD' : '#F5F5F5',
                          color: evenement.statut === 'A_VENIR' ? '#0D47A1' : '#616161',
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <Button
                    variant="outlined"
                    startIcon={<Print />}
                    sx={{ borderRadius: '50px', textTransform: 'none' }}
                  >
                    Exporter
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<Event />}
                    onClick={() => navigate(`/admin/evenements/${id}`)}
                    sx={{
                      bgcolor: '#2C2C2C',
                      color: '#FFFFFF',
                      '&:hover': { bgcolor: '#1A1A1A' },
                      borderRadius: '50px',
                      textTransform: 'none',
                    }}
                  >
                    Voir l'événement
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif' }}>
              Liste des participants
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
              {totalCount} participant{totalCount > 1 ? 's' : ''} inscrit{totalCount > 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total inscrits', value: totalCount, icon: <People />, color: '#2C2C2C' },
          { label: 'Places totales', value: evenement?.places_total || 0, icon: <Event />, color: '#6366F1' },
          { label: 'Places restantes', value: evenement?.places_restantes || 0, icon: <CheckCircle />, color: '#2E7D32' },
          { 
            label: 'Taux de remplissage', 
            value: evenement?.places_total ? Math.round(((evenement.places_total - evenement.places_restantes) / evenement.places_total) * 100) : 0, 
            icon: <BarChart />, 
            color: '#F59E0B' 
          },
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
                      {stat.label === 'Taux de remplissage' && '%'}
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
            placeholder="Rechercher un participant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '400px', '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: '#F8F8F8' } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: '#BDBDBD' }} /></InputAdornment>,
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Clear sx={{ fontSize: 18, color: '#BDBDBD' }} />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <IconButton onClick={fetchData} sx={{ color: '#666666' }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>
            {filteredParticipants.length} résultat{filteredParticipants.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* ===== TABLEAU DES PARTICIPANTS ===== */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>
                  Participant
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>
                  Contact
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>
                  Date d'inscription
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">
                  Statut
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="right">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedParticipants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <People sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
                        Aucun participant
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        {searchTerm ? 'Aucun participant ne correspond à votre recherche' : 'Aucune inscription pour cet événement'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedParticipants.map((participation) => {
                  const client = participation.client;
                  return (
                    <TableRow
                      key={participation.id}
                      hover
                      sx={{
                        '&:hover': { bgcolor: '#F8F8F8' },
                        transition: 'background-color 0.2s ease',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              bgcolor: client?.id ? '#E8F5E9' : '#FFF3E0',
                              color: client?.id ? '#2E7D32' : '#F57C00',
                              fontWeight: 600,
                              fontSize: '1rem',
                            }}
                          >
                            {client?.prenom?.[0]}{client?.nom?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                              {client?.prenom} {client?.nom || 'Client inconnu'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" sx={{ color: '#999999' }}>
                                ID: #{client?.id || 'N/A'}
                              </Typography>
                              {client?.user && (
                                <Chip
                                  label="Utilisateur"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.55rem',
                                    bgcolor: '#E8F5E9',
                                    color: '#2E7D32',
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#2C2C2C' }}>
                              {client?.email || 'Email non renseigné'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#2C2C2C' }}>
                              {client?.telephone || 'Téléphone non renseigné'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#2C2C2C' }}>
                          {formatDate(participation.date_inscription)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={participation.statut === 'INSCRIT' ? '✅ Inscrit' : participation.statut}
                          size="small"
                          sx={{
                            bgcolor: participation.statut === 'INSCRIT' ? '#E8F5E9' : '#FFF3E0',
                            color: participation.statut === 'INSCRIT' ? '#2E7D32' : '#F57C00',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir le client">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/clients/${client?.id}`)}
                            sx={{ color: '#6366F1' }}
                            disabled={!client?.id}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier le statut">
                          <IconButton
                            size="small"
                            sx={{ color: '#F59E0B' }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer l'inscription">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(participation)}
                            sx={{ color: '#EF5350' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredParticipants.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredParticipants.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} sur ${count}`
            }
            sx={{
              borderTop: '1px solid #F0F0F0',
              '& .MuiTablePagination-select': { fontSize: '0.85rem' },
              '& .MuiTablePagination-displayedRows': { fontSize: '0.85rem' },
            }}
          />
        )}
      </Paper>

      {/* ===== DIALOG SUPPRESSION ===== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        SlotProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: '#2C2C2C' }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#666666' }}>
            Êtes-vous sûr de vouloir supprimer l'inscription de{' '}
            <strong>
              {participantToDelete?.client?.prenom} {participantToDelete?.client?.nom}
            </strong>{' '}
            à l'événement <strong>{evenement?.titre}</strong> ?
            <br />
            Cette action est irréversible et libérera une place.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            sx={{
              bgcolor: '#EF5350',
              '&:hover': { bgcolor: '#C62828' },
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            {deleting ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: '12px', width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ParticipantsList;