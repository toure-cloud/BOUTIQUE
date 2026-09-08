// frontend_public/src/pages/Panier.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Alert,
  CircularProgress,
  Skeleton,
  Snackbar, // ✅ AJOUTÉ !
} from "@mui/material";
import {
  ArrowBack,
  Delete,
  ShoppingBag,
  Add,
  Remove,
  CheckCircle,
} from "@mui/icons-material";
import { panierService } from "../services/panierService";

const Panier = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [panier, setPanier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const storedClient = localStorage.getItem("client_data");
    if (storedClient) {
      setClient(JSON.parse(storedClient));
    } else {
      setLoading(false);
      setError("Veuillez vous connecter pour voir votre panier.");
    }
  }, []);

  useEffect(() => {
    if (client) {
      fetchPanier();
    }
  }, [client]);

  const fetchPanier = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await panierService.getPanier(client.id);
      setPanier(data);
      console.log("📋 Panier reçu:", data);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Erreur lors du chargement du panier");
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterQuantite = async (ligne) => {
    try {
      await panierService.ajouterProduit(client.id, ligne.produit, 1);
      fetchPanier();
      setSnackbar({
        open: true,
        message: "✅ Quantité mise à jour",
        severity: "success",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRetirerQuantite = async (ligne) => {
    try {
      await panierService.ajouterProduit(client.id, ligne.produit, -1);
      fetchPanier();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSupprimerLigne = async (ligneId) => {
    try {
      await panierService.supprimerLigne(client.id, ligneId);
      fetchPanier();
      setSnackbar({
        open: true,
        message: "❌ Article supprimé",
        severity: "warning",
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleCommander = async () => {
    try {
      const response = await panierService.passerCommande(client.id, {
        adresse: client.adresse || "",
        ville: client.ville || "",
        codePostal: client.codePostal || "",
        telephone: client.telephone || "",
        notes: "",
      });
      if (response.success) {
        // Rediriger vers la page de confirmation
        navigate("/commande/success");
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: "❌ Erreur lors de la commande",
        severity: "error",
      });
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);

  if (!client) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: "center" }}>
        <Alert severity="warning">
          Veuillez vous connecter pour voir votre panier.
        </Alert>
        <Button component={Link} to="/login" variant="contained" sx={{ mt: 3 }}>
          Se connecter
        </Button>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Mon Panier
        </Typography>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/boutique")}
          sx={{ textTransform: "none" }}
        >
          Continuer mes achats
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {panier?.lignes?.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <ShoppingBag sx={{ fontSize: 60, color: "#CCC", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Votre panier est vide
          </Typography>
          <Typography variant="body2" sx={{ color: "#999", mb: 3 }}>
            Ajoutez des produits depuis la boutique pour les retrouver ici.
          </Typography>
          <Button
            component={Link}
            to="/boutique"
            variant="contained"
            sx={{ mt: 3 }}
          >
            Continuer mes achats
          </Button>
        </Paper>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#F8F8F8" }}>
                  <TableCell>Produit</TableCell>
                  <TableCell>Quantité</TableCell>
                  <TableCell>Prix</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {panier?.lignes?.map((ligne) => (
                  <TableRow key={ligne.id}>
                   
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        {ligne.produit_image ? (
                          <Box
                            component="img"
                            src={ligne.produit_image}
                            alt={ligne.produit_nom}
                            sx={{
                              width: 70,
                              height: 70,
                              objectFit: "cover",
                              borderRadius: 2,
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: 70,
                              height: 70,
                              bgcolor: "#F0F0F0",
                              borderRadius: 2,
                            }}
                          />
                        )}
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {ligne.produit_nom}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => handleRetirerQuantite(ligne)}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            minWidth: 20,
                            textAlign: "center",
                          }}
                        >
                          {ligne.quantite}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleAjouterQuantite(ligne)}
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>{formatPrice(ligne.prix_unitaire)}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {formatPrice(ligne.sous_total)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        onClick={() => handleSupprimerLigne(ligne.id)}
                        sx={{ color: "#EF4444" }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 4,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="h5">
              Total :{" "}
              <span style={{ fontWeight: 800 }}>
                {formatPrice(panier?.total || 0)}
              </span>
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CheckCircle />}
              onClick={handleCommander}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: "50px",
                textTransform: "none",
              }}
            >
              Passer commande
            </Button>
          </Box>
        </>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: "12px" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Panier;
