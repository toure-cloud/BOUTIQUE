// src/pages/Admin/Parametres/Parametres.jsx
import React, { useState } from 'react';
import {
  Container, Paper, Typography, Box, Grid, TextField, Button, Switch,
  FormControlLabel, Divider, Alert,
} from '@mui/material';
import { Save, Refresh } from '@mui/icons-material';

const Parametres = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Madame Tibetia',
    site_description: "L'élégance du coaching personnalisé",
    contact_email: 'contact@madametibetia.com',
    contact_phone: '+33 6 12 34 56 78',
    contact_address: '123 Avenue de l\'Élégance, 75001 Paris',
    maintenance_mode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', mb: 4 }}>Paramètres du site</Typography>
      <Paper sx={{ p: 4 }}>
        {success && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>Paramètres mis à jour avec succès !</Alert>}
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Informations générales</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}><TextField fullWidth label="Nom du site" name="site_name" value={settings.site_name} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description du site" name="site_description" value={settings.site_description} onChange={handleChange} multiline rows={2} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Email de contact" name="contact_email" value={settings.contact_email} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Téléphone" name="contact_phone" value={settings.contact_phone} onChange={handleChange} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Adresse" name="contact_address" value={settings.contact_address} onChange={handleChange} multiline rows={2} /></Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Maintenance</Typography>
          <FormControlLabel control={<Switch name="maintenance_mode" checked={settings.maintenance_mode} onChange={handleChange} />} label="Mode maintenance (site inaccessible aux visiteurs)" />
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" startIcon={<Refresh />}>Réinitialiser</Button>
            <Button type="submit" variant="contained" startIcon={<Save />} disabled={loading} sx={{ bgcolor: '#2C2C2C', color: '#FFFFFF' }}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Parametres;