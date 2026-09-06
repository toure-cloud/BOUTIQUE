// src/components/Layout/PrivateLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemIcon, ListItemText,
  Divider, IconButton, Avatar, Menu, MenuItem, useTheme, useMediaQuery, Badge, Collapse,
} from '@mui/material';
import {
  Menu as MenuIcon, Dashboard, Event, ShoppingBag, Person, School, Settings, Logout,
  Notifications, ExpandLess, ExpandMore, Storefront, People, Assignment, Receipt, TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Tableau de bord', icon: <Dashboard />, path: '/dashboard' },
  {
    text: 'Produits', icon: <Storefront />, path: '/admin/produits',
    children: [
      { text: 'Tous les produits', path: '/admin/produits' },
      { text: 'Ajouter un produit', path: '/admin/produits/nouveau' },
    ],
  },
{
  text: 'Événements',
  icon: <Event />,
  path: '/admin/evenements',
  children: [
    { text: 'Tous les événements', path: '/admin/evenements' },
    { text: 'Créer un événement', path: '/admin/evenements/nouveau' },
    { text: 'Inscriptions', path: '/admin/inscriptions' }, 
  ],
},
  {
    text: 'Formations', icon: <School />, path: '/admin/formations',
    children: [
      { text: 'Toutes les formations', path: '/admin/formations' },
      { text: 'Ajouter une formation', path: '/admin/formations/nouveau' },
    ],
  },
  { text: 'Forfaits', icon: <Assignment />, path: '/admin/forfaits' },
  { text: 'Utilisateurs', icon: <People />, path: '/admin/utilisateurs' },
  { text: 'Paiements', icon: <Receipt />, path: '/admin/paiements' },
  { text: 'Commandes', icon: <ShoppingBag />, path: '/admin/commandes' },
  { text: 'Statistiques', icon: <TrendingUp />, path: '/admin/statistiques' },
  { text: 'Paramètres', icon: <Settings />, path: '/admin/parametres' },
];

const PrivateLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (text) => setOpenMenus((prev) => ({ ...prev, [text]: !prev[text] }));
  const isMenuOpen = (text) => !!openMenus[text];

  const handleLogout = () => { setAnchorEl(null); logout(); navigate('/login'); };

  const drawer = (
    <Box sx={{ height: '100%', bgcolor: '#FFFFFF', color: '#2C2C2C' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#2C2C2C', letterSpacing: '-0.5px' }}>Madame Tibetia</Typography>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, py: 2 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem
              button
              onClick={() => {
                if (item.children) { toggleMenu(item.text); } else { navigate(item.path); if (isMobile) setMobileOpen(false); }
              }}
              sx={{ borderRadius: '8px', mb: 0.5, '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' } }}
            >
              <ListItemIcon sx={{ color: '#9E9E9E', minWidth: 36 }}>{item.icon}</ListItemIcon>
              {/* ✅ Suppression de primaryTypographyProps */}
              <ListItemText primary={<Typography sx={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.text}</Typography>} />
              {item.children && (isMenuOpen(item.text) ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            {item.children && (
              <Collapse in={isMenuOpen(item.text)} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.children.map((child) => (
                    <ListItem
                      button key={child.text}
                      onClick={() => { navigate(child.path); if (isMobile) setMobileOpen(false); }}
                      sx={{ pl: 4, borderRadius: '8px' }}
                    >
                      {/* ✅ Suppression de primaryTypographyProps */}
                      <ListItemText primary={<Typography sx={{ fontSize: '0.85rem', fontWeight: 400, color: '#666666' }}>{child.text}</Typography>} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F8F8' }}>
      <AppBar position="fixed" sx={{ width: { md: `calc(100% - ${drawerWidth}px)` }, ml: { md: `${drawerWidth}px` }, bgcolor: '#FFFFFF', color: '#2C2C2C', boxShadow: 'none', borderBottom: '1px solid #F0F0F0' }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(!mobileOpen)} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, fontSize: '1.1rem' }}>Tableau de bord</Typography>
          <IconButton sx={{ color: '#9E9E9E' }}><Badge badgeContent={3} color="error"><Notifications /></Badge></IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 1 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: '#EEEEEE', color: '#2C2C2C' }}>{user?.first_name?.[0] || 'A'}</Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} sx={{ mt: 1 }}>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/profile'); }}><ListItemIcon><Person fontSize="small" /></ListItemIcon>Mon profil</MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); navigate('/admin/parametres'); }}><ListItemIcon><Settings fontSize="small" /></ListItemIcon>Paramètres</MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: '#EF5350' }}><ListItemIcon><Logout fontSize="small" sx={{ color: '#EF5350' }} /></ListItemIcon>Déconnexion</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer variant="temporary" open={mobileOpen} onClose={() => setMobileOpen(false)} ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth } }}
        >
          {drawer}
        </Drawer>
        <Drawer variant="permanent" sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' } }} open>
          {drawer}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3 }, mt: '64px', bgcolor: '#F8F8F8', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default PrivateLayout;