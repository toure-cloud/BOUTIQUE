// src/pages/Admin/Utilisateurs/UtilisateursList.jsx
import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, Box, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress, Alert,
  TextField, InputAdornment,
} from '@mui/material';
import { Search, Edit, Block, CheckCircle, Refresh } from '@mui/icons-material';
import { adminService } from '../../../services/adminService';

const UtilisateursList = () => {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchUtilisateurs(); }, []);

  const fetchUtilisateurs = async () => {
    setLoading(true);
    try {
      const data = await adminService.getUtilisateurs();
      setUtilisateurs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError('Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = utilisateurs.filter((u) =>
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><CircularProgress sx={{ color: '#BDBDBD' }} /></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C' }}>Gestion des utilisateurs</Typography>
        <Typography variant="body2" sx={{ color: '#666666' }}>{utilisateurs.length} utilisateurs inscrits</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
  size="small"
  placeholder="Rechercher un utilisateur..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  slotProps={{
    input: {
      startAdornment: (
        <InputAdornment position="start">
          <Search sx={{ color: '#BDBDBD' }} />
        </InputAdornment>
      ),
    },
  }}
  sx={{ flexGrow: 1, maxWidth: '400px' }}
/>
          <IconButton onClick={fetchUtilisateurs}><Refresh /></IconButton>
        </Box>
        <TableContainer>
          <Table>
            // src/pages/Admin/Utilisateurs/UtilisateursList.jsx - Table corrigée

<TableHead>
  <TableRow sx={{ bgcolor: '#F8F8F8' }}>
    <TableCell sx={{ fontWeight: 600 }}>Utilisateur</TableCell>
    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
    <TableCell sx={{ fontWeight: 600 }}>Date d'inscription</TableCell>
    <TableCell sx={{ fontWeight: 600 }} align="center">Statut</TableCell>
    <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
  </TableRow>
</TableHead>
<TableBody>
  {filteredUsers.length === 0 ? (
    <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography variant="body2" sx={{ color: '#BDBDBD' }}>Aucun utilisateur</Typography></TableCell></TableRow>
  ) : (
    filteredUsers.map((u) => (
      <TableRow key={u.id} hover>
        <TableCell sx={{ fontWeight: 500 }}>{u.username}</TableCell>
        <TableCell>{u.email}</TableCell>
        <TableCell>{new Date(u.date_joined).toLocaleDateString('fr-FR')}</TableCell>
        <TableCell align="center"><Chip label={u.is_active ? 'Actif' : 'Inactif'} size="small" sx={{ bgcolor: u.is_active ? '#E8F5E9' : '#FFEBEE', color: u.is_active ? '#2E7D32' : '#C62828' }} /></TableCell>
        <TableCell align="right">
          <IconButton size="small" sx={{ color: u.is_active ? '#EF5350' : '#66BB6A' }}>{u.is_active ? <Block fontSize="small" /> : <CheckCircle fontSize="small" />}</IconButton>
          <IconButton size="small"><Edit fontSize="small" /></IconButton>
        </TableCell>
      </TableRow>
    ))
  )}
</TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default UtilisateursList;