import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
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
  Button,
  Tooltip,
} from '@mui/material';
import {
  Refresh,
  Visibility,
  Receipt,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
} from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const PaiementsList = () => {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getPaiements();
      setPaiements(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error('Erreur:', err);
      setError('Impossible de charger les paiements');
    } finally {
      setLoading(false);
    }
  };

  const getStatutChip = (statut) => {
    const configs = {
      REUSSI: { label: 'Réussi', color: '#10B981', bg: '#D1FAE5', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
      EN_ATTENTE: { label: 'En attente', color: '#F59E0B', bg: '#FEF3C7', icon: <Pending sx={{ fontSize: 14 }} /> },
      ECHOUE: { label: 'Échoué', color: '#EF4444', bg: '#FEE2E2', icon: <Cancel sx={{ fontSize: 14 }} /> },
      ANNULE: { label: 'Annulé', color: '#6B7280', bg: '#F3F4F6', icon: <Cancel sx={{ fontSize: 14 }} /> },
      REMBOURSE: { label: 'Remboursé', color: '#8B5CF6', bg: '#EDE9FE', icon: <CheckCircle sx={{ fontSize: 14 }} /> },
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#6366F1' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Gestion des paiements
          </Typography>
          <Typography variant="body2" sx={{ color: '#666666' }}>
            {paiements.length} paiement{paiements.length > 1 ? 's' : ''} au total
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchPaiements}
          sx={{ borderRadius: '12px', textTransform: 'none' }}
        >
          Actualiser
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}

      <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontWeight: 600 }}>Référence</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Formation</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Montant</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Receipt sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
                    <Typography variant="body2" sx={{ color: '#94A3B8' }}>
                      Aucun paiement trouvé
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paiements.map((paiement) => {
                  const statut = getStatutChip(paiement.statut);
                  return (
                    <TableRow key={paiement.id} hover>
                      <TableCell sx={{ fontWeight: 500, fontSize: '0.85rem' }}>
                        {paiement.reference || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {paiement.client_nom || paiement.client || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {paiement.inscription_formation || 'N/A'}
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {paiement.montant} CFA
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ color: '#666666' }}>
                          {formatDate(paiement.date_creation)}
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
                      <TableCell align="center">
                        <Tooltip title="Voir les détails">
                          <IconButton size="small" sx={{ color: '#6366F1' }}>
                            <Visibility fontSize="small" />
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
      </Paper>
    </Container>
  );
};

export default PaiementsList;