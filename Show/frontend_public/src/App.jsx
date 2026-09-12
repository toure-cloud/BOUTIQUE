// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import Formations from './pages/Formations';
import Forfaits from './pages/Forfaits';
import Evenements from './pages/Evenements';
import Boutique from './pages/Boutique';
import APropos from './pages/APropos';
import RelookingHomme from './pages/RelookingHomme';
import RelookingFemme from './pages/RelookingFemme';
import RelookingAtelier from './pages/RelookingAtelier';
import FormationDetail from './pages/FormationDetail'; 
import RelookingHommeDetail from './pages/RelookingHommeDetail'; 
import RelookingFemmeDetail from './pages/RelookingFemmeDetail';
import RelookingAtelierDetail from './pages/RelookingAtelierDetail';
import Panier from './pages/Panier'; // ✅ UN SEUL IMPORT
import EleganceTimesOnline from './components/EleganceTimesOnline';
import DetailsProduits from './pages/ProduitDetail';
import Register from "./pages/Register";
import EvenementDetail from './pages/EvenementDetail';
import VerifierCode from './pages/VerifierCode';
import FormationLive from './pages/FormationLive';
import CommandeSuccess from './pages/CommandeSuccess';
import Commande from './pages/Commande';
import Login from './pages/Login';
import EvenementInscription from "./pages/EvenementInscription";

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
                <Route path="/evenements/:id" element={<EvenementDetail />} />
                <Route path="/boutique" element={<Boutique />} />
                <Route path="/a-propos" element={<APropos />} />
                <Route path="/relooking/homme" element={<RelookingHomme />} />
                <Route path="/relooking/femme" element={<RelookingFemme />} />
                <Route path="/relooking/atelier" element={<RelookingAtelier />} />
                <Route path="/relooking/homme/:id" element={<RelookingHommeDetail />} />
                <Route path="/relooking/femme/:id" element={<RelookingFemmeDetail />} />
                <Route path="/relooking/atelier/:id" element={<RelookingAtelierDetail />} />
                <Route path="/formations/:id" element={<FormationDetail />} />
                <Route path="/formations" element={<Formations />} />
                <Route path="/panier" element={<Panier />} /> {/* ✅ UNE SEULE ROUTE */}
                <Route path="/elegance-times" element={<EleganceTimesOnline />} />
                <Route path="/produit/:id" element={<DetailsProduits />} />
                <Route path="/verifier-code" element={<VerifierCode />} />
                <Route path="/formation/:id/live" element={<FormationLive />} />
                <Route path="/commande/success" element={<CommandeSuccess />} />
                <Route path="/commande" element={<Commande />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/evenements/:id/inscription" element={<EvenementInscription />} />
                <Route path="/relooking/femme/:id" element={<RelookingFemmeDetail />} />
                <Route path="/relooking/atelier/:id" element={<RelookingAtelierDetail />} />
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