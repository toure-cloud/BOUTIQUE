// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Forfaits from './pages/Forfaits';
import Evenements from './pages/Evenements';
import Boutique from './pages/Boutique';
import APropos from './pages/APropos';
import RelookingHomme from './pages/RelookingHomme';
import RelookingFemme from './pages/RelookingFemme';
import RelookingAtelier from './pages/RelookingAtelier';
import FormationDetail from './pages/FormationDetail'; 
import RelookingHommeDetail from './pages/RelookingHommeDetail'; 
import Panier from './pages/Panier';
import EleganceTimesOnline from './components/EleganceTimesOnline';
import DetailsProduits from './pages/DetailsProduits';

const theme = createTheme({
  // ... votre thème ...
});

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <Box sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/forfaits" element={<Forfaits />} />
                <Route path="/forfaits/:id" element={<Forfaits />} />
                <Route path="/evenements" element={<Evenements />} />
                <Route path="/evenements/:id" element={<Evenements />} />
                <Route path="/boutique" element={<Boutique />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/relooking/homme" element={<RelookingHomme />} />
                <Route path="/relooking/femme" element={<RelookingFemme />} />
                <Route path="/relooking/atelier" element={<RelookingAtelier />} />
                <Route path="/relooking/homme/:id" element={<RelookingHommeDetail />} />
                <Route path="/formations/:id" element={<FormationDetail />} />
                <Route path="/formations" element={<Home />} />
                <Route path="/panier" element={<Panier />} />
                <Route path="/elegance-times" element={<EleganceTimesOnline />} />
                <Route path="/produit/:id" element={<DetailsProduits />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
export default App;