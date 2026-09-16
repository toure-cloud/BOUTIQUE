import { logger } from '../../../lib/logger';
// src/pages/Admin/Evenements/InscriptionsList.jsx
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
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Avatar,
  Stack,
  Tooltip,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  Badge,
  Snackbar,
} from '@mui/material';
import {
  Search,
  Refresh,
  CheckCircle,
  Cancel,
  Pending,
  MoreVert,
  Visibility,
  Delete,
  Download,
  Email,
  Phone,
  Person,
  Event,
  CalendarToday,
  LocationOn,
  Print,
  FilterList,
  Clear,
} from '@mui/icons-material';
import { inscriptionService } from '../../../services/inscriptionService';
import { evenementService } from '../../../services/evenementService';

// Composant de statistiques
const StatCard = ({ title, value, icon, color, bgColor }) => (
  <Card sx={{ borderRadius: '12px', border: '1px solid #F0F0F0', boxShadow: 'none' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>
            {title}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C2C2C', mt: 0.5 }}>
            {value}
          </Typography>
        </Box>
        <Avatar sx={{ bgcolor: bgColor, color: color, width: 40, height: 40 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const InscriptionsList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState([]);
  const [evenement, setEvenement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('all');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmes: 0,
    en_attente: 0,
    annules: 0,
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Récupérer les inscriptions
      const inscriptionsData = await inscriptionService.getInscriptionsByEvenement(id);
      const inscriptionsList = Array.isArray(inscriptionsData) ? inscriptionsData : inscriptionsData.results || [];
      setInscriptions(inscriptionsList);
      setFilteredInscriptions(inscriptionsList);

      // Récupérer les détails de l'événement
      if (id) {
        const evenementData = await evenementService.getEvenementById(parseInt(id));
        setEvenement(evenementData);
      }

      // Calculer les statistiques
      const statsData = {
        total: inscriptionsList.length,
        confirmes: inscriptionsList.filter((i) => i.statut === 'CONFIRME').length,
        en_attente: inscriptionsList.filter((i) => i.statut === 'EN_ATTENTE').length,
        annules: inscriptionsList.filter((i) => i.statut === 'ANNULE').length,
      };
      setStats(statsData);
    } catch (err) {
      logger.error('Erreur:', err);
      setError('Impossible de charger les inscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = inscriptions;

    if (searchTerm) {
      result = result.filter(
        (i) =>
          i.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatut !== 'all') {
      result = result.filter((i) => i.statut === filterStatut);
    }

    setFilteredInscriptions(result);
    setPage(1);
  }, [searchTerm, filterStatut, inscriptions]);

  const handleMenuOpen = (event, inscription) => {
    setAnchorEl(event.currentTarget);
    setSelectedInscription(inscription);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedInscription(null);
  };

  const handleDialogOpen = (inscription, action) => {
    setSelectedInscription(inscription);
    setDialogAction(action);
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedInscription(null);
    setDialogAction('');
  };

  const handleConfirm = async () => {
    try {
      await inscriptionService.confirmer(selectedInscription.id);
      setSnackbarMessage('Inscription confirmée avec succès');
      setSnackbarSeverity('success');
      fetchData();
    } catch (err) {
      setSnackbarMessage('Erreur lors de la confirmation');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const handleAnnuler = async () => {
    try {
      await inscriptionService.annuler(selectedInscription.id);
      setSnackbarMessage('Inscription annulée avec succès');
      setSnackbarSeverity('success');
      fetchData();
    } catch (err) {
      setSnackbarMessage('Erreur lors de l\'annulation');
      setSnackbarSeverity('error');
    }
    setSnackbarOpen(true);
    handleDialogClose();
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const blob = await inscriptionService.exporterCSV(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inscriptions_${evenement?.titre || 'evenement'}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      setSnackbarMessage('Export CSV réussi');
      setSnackbarSeverity('success');
    } catch (err) {
      setSnackbarMessage('Erreur lors de l\'export');
      setSnackbarSeverity('error');
    }
    setExporting(false);
    setSnackbarOpen(true);
  };

  const getStatutChip = (statut) => {
    const configs = {
      CONFIRME: { label: 'Confirmé', color: '#2E7D32', bg: '#E8F5E9', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
      EN_ATTENTE: { label: 'En attente', color: '#ED6C02', bg: '#FFF3E0', icon: <Pending sx={{ fontSize: 14 }} /> },
      ANNULE: { label: 'Annulé', color: '#C62828', bg: '#FFEBEE', icon: <Cancel sx={{ fontSize: 14 }} /> },
    };
    return configs[statut] || configs.EN_ATTENTE;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const paginatedInscriptions = filteredInscriptions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const totalPages = Math.ceil(filteredInscriptions.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#2C2C2C' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Button
              startIcon={<Event />}
              onClick={() => navigate('/admin/evenements')}
              sx={{ color: '#666666', mb: 1 }}
            >
              Retour aux événements
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
              Gestion des inscriptions
            </Typography>
            {evenement && (
              <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>
                {evenement.titre} - {evenement.lieu}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExportCSV}
              disabled={exporting || inscriptions.length === 0}
              sx={{
                borderColor: '#E0E0E0',
                color: '#666666',
                borderRadius: '50px',
                px: 3,
                '&:hover': { borderColor: '#2C2C2C', color: '#2C2C2C' },
              }}
            >
              {exporting ? 'Export...' : 'Exporter CSV'}
            </Button>
            <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={fetchData}
              sx={{
                bgcolor: '#2C2C2C',
                color: '#FFFFFF',
                borderRadius: '50px',
                px: 3,
                '&:hover': { bgcolor: '#1A1A1A' },
              }}
            >
              Actualiser
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total"
            value={stats.total}
            icon={<Event />}
            color="#2C2C2C"
            bgColor="#F5F5F5"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Confirmés"
            value={stats.confirmes}
            icon={<CheckCircle />}
            color="#2E7D32"
            bgColor="#E8F5E9"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="En attente"
            value={stats.en_attente}
            icon={<Pending />}
            color="#ED6C02"
            bgColor="#FFF3E0"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Annulés"
            value={stats.annules}
            icon={<Cancel />}
            color="#C62828"
            bgColor="#FFEBEE"
          />
        </Grid>
      </Grid>

      {/* Filtres et recherche */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', border: '1px solid #F0F0F0', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher un inscrit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: '400px',
              '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: '#F8F8F8' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#BDBDBD' }} />
                  </InputAdornment>
                ),
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

          <FormControl size="small" sx={{ minWidth: '150px' }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              label="Statut"
              sx={{ borderRadius: '50px' }}
              startAdornment={
                <InputAdornment position="start">
                  <FilterList sx={{ color: '#BDBDBD', fontSize: 18 }} />
                </InputAdornment>
              }
            >
              <MenuItem value="all">Tous</MenuItem>
              <MenuItem value="CONFIRME">Confirmés</MenuItem>
              <MenuItem value="EN_ATTENTE">En attente</MenuItem>
              <MenuItem value="ANNULE">Annulés</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>
            {filteredInscriptions.length} inscription{filteredInscriptions.length > 1 ? 's' : ''}
          </Typography>
        </Box>
      </Paper>

      {/* Tableau des inscriptions */}
      <Paper sx={{ borderRadius: '12px', border: '1px solid #F0F0F0', boxShadow: 'none', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }}>Date d'inscription</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Person sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#666666', mb: 1 }}>
                        Aucune inscription
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#999999' }}>
                        {searchTerm || filterStatut !== 'all'
                          ? 'Aucune inscription ne correspond à vos critères'
                          : 'Aucune inscription pour cet événement'}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInscriptions.map((inscription, index) => {
                  const statut = getStatutChip(inscription.statut);
                  return (
                    <TableRow key={inscription.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ bgcolor: '#F5F5F5', color: '#2C2C2C', width: 36, height: 36 }}>
                            {inscription.prenom?.[0] || '?'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                              {inscription.prenom} {inscription.nom}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999999' }}>
                              {inscription.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85rem' }}>
                              {inscription.telephone || 'Non renseigné'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ color: '#666666', fontSize: '0.85rem' }}>
                              {inscription.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: '#666666' }}>
                          {formatDate(inscription.date_inscription)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={statut.icon}
                          label={statut.label}
                          size="small"
                          sx={{
                            bgcolor: statut.bg,
                            color: statut.color,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir les détails">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/inscriptions/${inscription.id}`)}
                            sx={{ color: '#666666' }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Plus d'options">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, inscription)}
                            sx={{ color: '#666666' }}
                          >
                            <MoreVert fontSize="small" />
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

        {/* Pagination */}
        {filteredInscriptions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              p: 2,
              borderTop: '1px solid #F0F0F0',
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: '#999999' }}>
              Affichage de {((page - 1) * rowsPerPage) + 1} à{' '}
              {Math.min(page * rowsPerPage, filteredInscriptions.length)} sur {filteredInscriptions.length}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: '8px',
                  '&.Mui-selected': {
                    bgcolor: '#2C2C2C',
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#1A1A1A' },
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* Menu contextuel */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        sx={{
          '& .MuiPaper-root': {
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            minWidth: '180px',
          },
        }}
      >
        {selectedInscription?.statut === 'EN_ATTENTE' && (
          <MenuItem onClick={() => handleDialogOpen(selectedInscription, 'confirm')}>
            <CheckCircle sx={{ mr: 1.5, fontSize: 20, color: '#2E7D32' }} />
            Confirmer l'inscription
          </MenuItem>
        )}
        {selectedInscription?.statut !== 'ANNULE' && (
          <MenuItem onClick={() => handleDialogOpen(selectedInscription, 'cancel')}>
            <Cancel sx={{ mr: 1.5, fontSize: 20, color: '#C62828' }} />
            Annuler l'inscription
          </MenuItem>
        )}
        <MenuItem onClick={() => { handleMenuClose(); /* Voir détails */ }}>
          <Visibility sx={{ mr: 1.5, fontSize: 20, color: '#666666' }} />
          Voir les détails
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => { handleMenuClose(); /* Supprimer */ }} sx={{ color: '#C62828' }}>
          <Delete sx={{ mr: 1.5, fontSize: 20, color: '#C62828' }} />
          Supprimer
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C2C2C' }}>
            {dialogAction === 'confirm' ? 'Confirmer l\'inscription' : 'Annuler l\'inscription'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#666666' }}>
            {dialogAction === 'confirm'
              ? `Êtes-vous sûr de vouloir confirmer l'inscription de ${selectedInscription?.prenom} ${selectedInscription?.nom} ?`
              : `Êtes-vous sûr de vouloir annuler l'inscription de ${selectedInscription?.prenom} ${selectedInscription?.nom} ?`
            }
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={handleDialogClose} sx={{ color: '#666666' }}>
            Annuler
          </Button>
          <Button
            onClick={dialogAction === 'confirm' ? handleConfirm : handleAnnuler}
            variant="contained"
            sx={{
              bgcolor: dialogAction === 'confirm' ? '#2E7D32' : '#C62828',
              color: '#FFFFFF',
              borderRadius: '50px',
              px: 4,
              '&:hover': {
                bgcolor: dialogAction === 'confirm' ? '#1B5E20' : '#B71C1C',
              },
            }}
            startIcon={dialogAction === 'confirm' ? <CheckCircle /> : <Cancel />}
          >
            {dialogAction === 'confirm' ? 'Confirmer' : 'Annuler'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%', borderRadius: '12px' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InscriptionsList;