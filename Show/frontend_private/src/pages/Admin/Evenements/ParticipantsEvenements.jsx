// src/pages/Admin/Evenements/ParticipantsEvenements.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Card,
  CardContent, Grid, Snackbar,
} from '@mui/material';
import {
  ArrowBack, Search, Visibility, Refresh, People, CheckCircle, Cancel,
  Email, Phone, LocationOn, Clear, Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const ParticipantsEvenements = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchParticipants(); }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getParticipantsEvenements();
      
      let participantsList = [];
      if (data && data.results) {
        participantsList = data.results;
      } else if (Array.isArray(data)) {
        participantsList = data;
      }
      
      // ✅ NORMALISATION : On adapte les données selon l'ancienne ou la nouvelle API
      participantsList = participantsList.map((p, index) => ({
        ...p,
        id: p.id || `temp-${index}`,
        date_inscription: p.date_inscription || null,
        statut: p.statut || 'INSCRIT',
        // On gère les deux formats : ancien (client_name) et nouveau (client_details)
        client: p.client_details || {
          id: p.client,
          nom: p.client_name ? p.client_name.split(' ')[1] || '' : '',
          prenom: p.client_name ? p.client_name.split(' ')[0] || '' : '',
          email: p.client_email || '',
          telephone: ''
        },
        evenement: p.evenement_details || {
          titre: p.evenement_titre || '',
          lieu: ''
        }
      }));

      setParticipants(participantsList);
      setFilteredParticipants(participantsList);
    } catch (err) {
      console.error('❌ Erreur:', err);
      setError('Impossible de charger les participants');
      setSnackbar({ open: true, message: '❌ Erreur lors du chargement', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = participants;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const client = p.client || {};
        const evenement = p.evenement || {};
        
        return (
          (client.nom || '').toLowerCase().includes(term) ||
          (client.prenom || '').toLowerCase().includes(term) ||
          (client.email || '').toLowerCase().includes(term) ||
          (evenement.titre || '').toLowerCase().includes(term)
        );
      });
    }
    setFilteredParticipants(result);
    setPage(1);
  }, [searchTerm, participants]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    const date = new Date(dateString);
    return isNaN(date) ? 'Date inconnue' : date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (prenom, nom) => {
    const p = (prenom || '').trim();
    const n = (nom || '').trim();
    return (!p && !n) ? '?' : `${p[0] || ''}${n[0] || ''}`.toUpperCase();
  };

  const paginatedParticipants = filteredParticipants.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.max(1, Math.ceil(filteredParticipants.length / rowsPerPage));

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress sx={{ color: '#2C2C2C' }} /></Box>;
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: '12px' }} action={<Button color="inherit" size="small" onClick={fetchParticipants} startIcon={<Refresh />}>Réessayer</Button>}>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button variant="outlined" startIcon={<DashboardIcon />} onClick={() => navigate('/admin/dashboard')} sx={{ borderColor: '#E0E0E0', color: '#666666', borderRadius: '50px', textTransform: 'none', fontWeight: 500, px: 2.5 }}>Dashboard</Button>
          <Button startIcon={<ArrowBack />} onClick={() => navigate('/admin/dashboard')} sx={{ color: '#666666' }}>Retour</Button>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', fontFamily: '"Playfair Display", serif' }}>Participants aux événements</Typography>
        <Typography variant="body2" sx={{ color: '#666666', mt: 0.5 }}>{filteredParticipants.length} participant{filteredParticipants.length > 1 ? 's' : ''}</Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total inscriptions', value: participants.length, icon: <People />, color: '#2C2C2C' },
          { label: 'Inscrits', value: participants.filter(p => p.statut === 'INSCRIT').length, icon: <CheckCircle />, color: '#2E7D32' },
          { label: 'Présents', value: participants.filter(p => p.statut === 'PRESENT').length, icon: <CheckCircle />, color: '#1976D2' },
          { label: 'Absents', value: participants.filter(p => p.statut === 'ABSENT').length, icon: <Cancel />, color: '#EF4444' },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={`stat-${index}`}>
            <Card sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', boxShadow: 'none' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999999', fontWeight: 500 }}>{stat.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2C2C2C', mt: 0.5 }}>{stat.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 40, height: 40 }}>{stat.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recherche */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', border: '1px solid #F0F0F0' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email, événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: '400px', '& .MuiOutlinedInput-root': { borderRadius: '50px', bgcolor: '#F8F8F8' } }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search sx={{ color: '#BDBDBD' }} /></InputAdornment>, endAdornment: searchTerm && (<InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm('')}><Clear sx={{ fontSize: 18, color: '#BDBDBD' }} /></IconButton></InputAdornment>) } }}
          />
          <IconButton onClick={fetchParticipants} sx={{ color: '#666666' }}><Refresh /></IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: '#999999' }}>{filteredParticipants.length} résultat{filteredParticipants.length > 1 ? 's' : ''}</Typography>
        </Box>
      </Paper>

      {/* Tableau */}
      <Paper sx={{ borderRadius: '16px', border: '1px solid #F0F0F0', overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8F8F8' }}>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Participant</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }}>Événement</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: '#2C2C2C', fontSize: '0.85rem' }} align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedParticipants.length === 0 ? (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6 }}><Box sx={{ textAlign: 'center' }}><People sx={{ fontSize: 48, color: '#BDBDBD', mb: 2 }} /><Typography variant="h6" sx={{ color: '#666666' }}>Aucun participant</Typography><Typography variant="body2" sx={{ color: '#999999' }}>{searchTerm ? 'Aucun résultat' : 'Aucune inscription'}</Typography></Box></TableCell></TableRow>
              ) : (
                paginatedParticipants.map((participant, index) => {
                  const client = participant.client || {};
                  const evenement = participant.evenement || {};
                  
                  const nom = client.nom || '';
                  const prenom = client.prenom || '';
                  const email = client.email || '';
                  const telephone = client.telephone || '';
                  const clientId = client.id;
                  
                  const eventTitre = evenement.titre || '';
                  const eventLieu = evenement.lieu || '';
                  
                  return (
                    <TableRow key={participant.id || `participant-${index}`} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: '#E8F5E9', color: '#2E7D32' }}>{getInitials(prenom, nom)}</Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
                              {prenom} {nom || 'Client inconnu'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#999999' }}>
                              ID: #{clientId || 'N/A'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#2C2C2C' }}>
                              {email || 'Email non renseigné'}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: '#BDBDBD' }} />
                            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: '#2C2C2C' }}>
                              {telephone || 'Téléphone non renseigné'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: '#2C2C2C' }}>
                            {eventTitre || 'Événement inconnu'}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#999999' }}>
                            <LocationOn sx={{ fontSize: 12, verticalAlign: 'middle' }} /> {eventLieu || 'Lieu non défini'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={participant.statut === 'INSCRIT' ? '✅ Inscrit' : participant.statut || 'Inconnu'}
                          size="small"
                          sx={{
                            bgcolor: participant.statut === 'INSCRIT' ? '#E8F5E9' : '#FFF3E0',
                            color: participant.statut === 'INSCRIT' ? '#2E7D32' : '#F57C00',
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: '#666666' }}>
                          {formatDate(participant.date_inscription)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={clientId ? "Voir le client" : "Client non disponible"}>
                          <span>
                            <IconButton 
                              size="small" 
                              onClick={() => clientId && navigate(`/admin/clients/${clientId}`)} 
                              sx={{ color: '#6366F1' }}
                              disabled={!clientId}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </span>
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
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, borderTop: '1px solid #F0F0F0' }}>
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: '12px' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ParticipantsEvenements;