import { logger } from '../../../lib/logger';
// frontend_private/src/pages/Admin/InscriptionsRelooking.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, Avatar, CircularProgress, 
  Alert, FormControl, InputLabel, Select, MenuItem, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Stack,
  TextField, Snackbar,
} from '@mui/material';
import {
  ArrowBack, Refresh, Visibility, Close, Phone, Email, CalendarToday,
  AccessTime, AttachMoney, CheckCircle, Cancel, Edit,
} from '@mui/icons-material';
import { adminService } from "../../../services/adminService";


const InscriptionsRelooking = () => {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const typeColors = {
    FEMME: { color: '#EC4899', label: 'Relooking Femme' },
    HOMME: { color: '#3B82F6', label: 'Relooking Homme' },
    ATELIER: { color: '#10B981', label: 'Atelier Relooking' },
  };

  const statutColors = {
    EN_ATTENTE: { color: '#F59E0B', label: '⏳ En attente' },
    CONFIRME: { color: '#10B981', label: '✅ Confirmé' },
    ANNULE: { color: '#EF4444', label: '❌ Annulé' },
  };

  useEffect(() => {
    fetchInscriptions();
  }, [filterType]);

  const fetchInscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      const data = await adminService.getInscriptionsRelooking(params);
      setInscriptions(data.results || data || []);
    } catch (err) {
      setError('Erreur lors du chargement des inscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (inscription) => {
    setSelected(inscription);
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const details = await adminService.getInscriptionRelookingById(inscription.id);
      setSelected(details);
    } catch (err) {
      logger.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailOpen(false);
    setSelected(null);
  };

  const handleUpdateStatut = async (id, statut) => {
    try {
      await adminService.updateInscriptionRelooking(id, { statut });
      setSnackbar({ open: true, message: `Statut mis à jour : ${statut}`, severity: 'success' });
      fetchInscriptions();
      handleCloseDetails();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour', severity: 'error' });
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Non précisée';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ mb: 2, color: '#666' }}>
          Retour Dashboard
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: '"Playfair Display", serif', color: '#2C2C2C' }}>
          Inscriptions Relooking
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
          Gérez toutes les inscriptions aux rubriques de relooking
        </Typography>
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Type de relooking</InputLabel>
          <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Type de relooking">
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="FEMME">Relooking Femme</MenuItem>
            <MenuItem value="HOMME">Relooking Homme</MenuItem>
            <MenuItem value="ATELIER">Atelier Relooking</MenuItem>
          </Select>
        </FormControl>
        <Button variant="outlined" startIcon={<Refresh />} onClick={fetchInscriptions}>
          Actualiser
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : inscriptions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">Aucune inscription trouvée</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Prestation</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inscriptions.map((inscription) => (
                <TableRow key={inscription.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: '#E8F5E9', color: '#2E7D32' }}>
                        {inscription.prenom[0]}{inscription.nom[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {inscription.prenom} {inscription.nom}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#999' }}>
                          {inscription.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={typeColors[inscription.type]?.label || inscription.type}
                      size="small"
                      sx={{ bgcolor: `${typeColors[inscription.type]?.color}15`, color: typeColors[inscription.type]?.color, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {inscription.rubrique_nom || inscription.atelier_nom || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Phone sx={{ fontSize: 14, color: '#999' }} /> {inscription.telephone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(inscription.date_souhaitee)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statutColors[inscription.statut]?.label || inscription.statut}
                      size="small"
                      sx={{ bgcolor: `${statutColors[inscription.statut]?.color}15`, color: statutColors[inscription.statut]?.color, fontWeight: 600 }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Voir détails">
                      <IconButton size="small" onClick={() => handleViewDetails(inscription)} sx={{ color: '#6366F1' }}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL DÉTAILS */}
      <Dialog open={detailOpen} onClose={handleCloseDetails} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>Détails de l'inscription</Typography>
          <IconButton onClick={handleCloseDetails}><Close /></IconButton>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : selected ? (
            <Stack spacing={2.5}>
              <Box sx={{ textAlign: 'center', mb: 1 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', bgcolor: '#E8F5E9', color: '#2E7D32', fontSize: 32 }}>
                  {selected.prenom[0]}{selected.nom[0]}
                </Avatar>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  {selected.prenom} {selected.nom}
                </Typography>
                <Chip
                  label={typeColors[selected.type]?.label || selected.type}
                  size="small"
                  sx={{ mt: 1, bgcolor: `${typeColors[selected.type]?.color}15`, color: typeColors[selected.type]?.color, fontWeight: 600 }}
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Informations de contact</Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Email sx={{ fontSize: 16, color: '#999' }} /> {selected.email}
                </Typography>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16, color: '#999' }} /> {selected.telephone}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Prestation</Typography>
                <Typography variant="body2">
                  <strong>Type :</strong> {typeColors[selected.type]?.label || selected.type}
                </Typography>
                <Typography variant="body2">
                  <strong>Prestation :</strong> {selected.rubrique_nom || selected.atelier_nom || 'N/A'}
                </Typography>
                <Typography variant="body2">
                  <strong>Date souhaitée :</strong> {formatDate(selected.date_souhaitee)}
                </Typography>
                {selected.nb_personnes && (
                  <Typography variant="body2">
                    <strong>Nombre de personnes :</strong> {selected.nb_personnes}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Détails</Typography>
                <Typography variant="body2">
                  <strong>Prix :</strong> {selected.prix} CFA
                </Typography>
                <Typography variant="body2">
                  <strong>Durée :</strong> {selected.duree || 'Non précisée'}
                </Typography>
                {selected.message && (
                  <Typography variant="body2" sx={{ mt: 1, p: 1.5, bgcolor: '#F5F5F5', borderRadius: 2 }}>
                    <strong>Message :</strong> {selected.message}
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Statut</Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    onClick={() => handleUpdateStatut(selected.id, 'CONFIRME')}
                    startIcon={<CheckCircle />}
                  >
                    Confirmer
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="error"
                    onClick={() => handleUpdateStatut(selected.id, 'ANNULE')}
                    startIcon={<Cancel />}
                  >
                    Annuler
                  </Button>
                </Stack>
              </Box>
            </Stack>
          ) : (
            <Typography>Erreur de chargement</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: 2 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InscriptionsRelooking;