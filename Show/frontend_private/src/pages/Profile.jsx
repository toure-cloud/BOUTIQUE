// src/pages/Profile.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Container, Paper, Typography, Box, Avatar, Grid, Divider, Chip, Button,
} from '@mui/material';
import { Person, Email, Phone, Badge, Edit } from '@mui/icons-material';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Container maxWidth="md">
      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2C2C2C', mb: 4 }}>Mon profil</Typography>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
          <Avatar sx={{ width: 100, height: 100, bgcolor: '#EEEEEE', color: '#2C2C2C', fontSize: 40 }}>
            {user?.first_name?.[0] || 'A'}
          </Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#2C2C2C' }}>
              {user?.first_name} {user?.last_name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666666' }}>{user?.email}</Typography>
            <Chip label="Administrateur" size="small" sx={{ mt: 1, bgcolor: '#F5F5F5' }} />
          </Box>
          <Button variant="outlined" startIcon={<Edit />} sx={{ ml: 'auto' }}>Modifier</Button>
        </Box>
        <Divider sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Person sx={{ color: '#BDBDBD' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Nom d'utilisateur</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2C2C2C' }}>{user?.username}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Email sx={{ color: '#BDBDBD' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Email</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2C2C2C' }}>{user?.email}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Phone sx={{ color: '#BDBDBD' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Téléphone</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2C2C2C' }}>{user?.phone || 'Non renseigné'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge sx={{ color: '#BDBDBD' }} />
              <Box>
                <Typography variant="caption" sx={{ color: '#999999', display: 'block' }}>Rôle</Typography>
                <Typography variant="body1" sx={{ fontWeight: 500, color: '#2C2C2C' }}>Administrateur</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="caption" sx={{ color: '#999999' }}>
          Membre depuis le {new Date(user?.date_joined).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </Typography>
      </Paper>
    </Container>
  );
};

export default Profile;