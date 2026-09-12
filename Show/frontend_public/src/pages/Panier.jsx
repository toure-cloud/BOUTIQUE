// frontend_public/src/pages/Panier.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container, Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Alert, CircularProgress,
  Skeleton, Snackbar, Chip, Divider, Stack, Accordion, AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  ArrowBack, Delete, ShoppingBag, Add, Remove, CheckCircle, Warning,
  LocalShipping, Lock, ExpandMore, Receipt, CalendarToday, AttachMoney,
  Inventory,
} from "@mui/icons-material";
import { panierService } from "../services/panierService";
import { commandeService } from "../services/commandeService";

const Panier = () => {
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [panier, setPanier] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommandes, setLoadingCommandes] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

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
      fetchCommandes();
    }
  }, [client]);

  const fetchPanier = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await panierService.getPanier(client.id);
      setPanier(data);
    } catch (err) {
      if (err.response?.status === 404) {
        localStorage.removeItem("client_data");
        setClient(null);
        setError("Votre session a expiré. Reconnectez-vous.");
      } else {
        setError("Erreur lors du chargement du panier");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchCommandes = async () => {
    setLoadingCommandes(true);
    try {
      const data = await commandeService.getCommandesClient(client.id);
      setCommandes(data.results || data || []);
    } catch (err) {
      console.error("Erreur commandes:", err);
    } finally {
      setLoadingCommandes(false);
    }
  };

  const handleAjouterQuantite = async (ligne) => {
    if (ligne.produit_stock <= ligne.quantite) {
      setSnackbar({ open: true, message: `⚠️ Stock maximum atteint (${ligne.produit_stock} disponibles)`, severity: "warning" });
      return;
    }
    try {
      await panierService.ajouterProduit(client.id, ligne.produit, 1);
      fetchPanier();
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Erreur lors de la mise à jour", severity: "error" });
    }
  };

  const handleRetirerQuantite = async (ligne) => {
    try {
      await panierService.ajouterProduit(client.id, ligne.produit, -1);
      fetchPanier();
    } catch (err) { console.error(err); }
  };

  const handleSupprimerLigne = async (ligneId) => {
    try {
      await panierService.supprimerLigne(client.id, ligneId);
      fetchPanier();
      setSnackbar({ open: true, message: "❌ Article supprimé", severity: "warning" });
    } catch (err) { console.error(err); }
  };

  const hasRupture = panier?.lignes?.some((l) => l.produit_stock <= 0);

  const handleCommander = async () => {
    if (hasRupture) {
      setSnackbar({ open: true, message: "❌ Retirez les produits en rupture avant de commander.", severity: "error" });
      return;
    }
    try {
      const response = await panierService.passerCommande(client.id, {
        adresse: client.adresse || "",
        ville: client.ville || "",
        codePostal: client.codePostal || "",
        telephone: client.telephone || "",
        notes: "",
      });
      if (response.success) navigate("/commande/success");
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Erreur lors de la commande", severity: "error" });
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price);

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  // ✅ Calculer la période de livraison estimée
  const getLivraisonEstimee = (dateCommande) => {
    const date = new Date(dateCommande);
    const debut = new Date(date);
    debut.setDate(debut.getDate() + 3);
    const fin = new Date(date);
    fin.setDate(fin.getDate() + 5);
    return `Du ${debut.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })} au ${fin.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`;
  };

  // ✅ Statut de la commande (label + couleur)
  const getStatutConfig = (statut) => {
    const configs = {
      EN_ATTENTE: { label: "⏳ En attente", color: "#F59E0B", bgcolor: "#FEF3C7" },
      PAYEE: { label: "💳 Payée", color: "#10B981", bgcolor: "#D1FAE5" },
      EN_PREPARATION: { label: "📦 En préparation", color: "#6366F1", bgcolor: "#E0E7FF" },
      EXPEDIEE: { label: "🚚 Expédiée", color: "#3B82F6", bgcolor: "#DBEAFE" },
      LIVREE: { label: "✅ Livrée", color: "#10B981", bgcolor: "#D1FAE5" },
      ANNULEE: { label: "❌ Annulée", color: "#EF4444", bgcolor: "#FEE2E2" },
    };
    return configs[statut] || { label: statut, color: "#64748B", bgcolor: "#F1F5F9" };
  };

  if (!client) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: "center" }}>
        <Box sx={{ bgcolor: "#fff", borderRadius: 3, p: 5, border: "1px solid #E2E8F0" }}>
          <ShoppingBag sx={{ fontSize: 60, color: "#CBD5E1", mb: 2 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>Connexion requise</Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>Connectez-vous pour accéder à votre panier et passer commande.</Typography>
          <Button component={Link} to="/login" variant="contained" sx={{ borderRadius: 2, bgcolor: "#0F172A", textTransform: "none", fontWeight: 600, px: 4, py: 1.2, "&:hover": { bgcolor: "#1E293B" } }}>Se connecter</Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Skeleton variant="text" width={220} height={45} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: "#F8FAFC", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* HEADER */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Button variant="text" startIcon={<ArrowBack />} onClick={() => navigate("/boutique")} sx={{ color: "#64748B", textTransform: "none", fontWeight: 500, mb: 1 }}>
              Retour à la boutique
            </Button>
            <Typography variant="h4" sx={{ fontWeight: 600, color: "#0F172A", fontFamily: '"Playfair Display", serif', letterSpacing: -0.5 }}>
              Mon Panier
            </Typography>
          </Box>
          {panier?.lignes?.length > 0 && (
            <Chip label={`${panier.lignes.length} article${panier.lignes.length > 1 ? "s" : ""}`} sx={{ bgcolor: "#E2E8F0", color: "#0F172A", fontWeight: 600, fontSize: "0.85rem", height: 32 }} />
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        {/* PANIER */}
        {panier?.lignes?.length === 0 ? (
          <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 3, border: "1px solid #E2E8F0", mb: 4 }}>
            <ShoppingBag sx={{ fontSize: 60, color: "#CBD5E1", mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>Votre panier est vide</Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 4 }}>Ajoutez des produits depuis la boutique pour les retrouver ici.</Typography>
            <Button component={Link} to="/boutique" variant="contained" sx={{ borderRadius: 2, bgcolor: "#0F172A", textTransform: "none", fontWeight: 600, px: 4, py: 1.2, "&:hover": { bgcolor: "#1E293B" } }}>Découvrir la boutique</Button>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 3, alignItems: "flex-start", mb: 4 }}>
            {/* TABLEAU PANIER */}
            <Box sx={{ flex: 1, minWidth: 0, width: "100%" }}>
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell sx={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem", py: 2 }}>Produit</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>Quantité</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>Prix</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.85rem" }}>Total</TableCell>
                      <TableCell align="center" sx={{ width: 60 }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {panier?.lignes?.map((ligne) => {
                      const isRupture = ligne.produit_stock <= 0;
                      const isLowStock = ligne.produit_stock > 0 && ligne.produit_stock < 5;
                      return (
                        <TableRow key={ligne.id} hover sx={{ "&:hover": { bgcolor: "#F8FAFC" }, opacity: isRupture ? 0.65 : 1 }}>
                          <TableCell sx={{ py: 2.5 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                              {ligne.produit_image ? (
                                <Box component="img" src={ligne.produit_image} alt={ligne.produit_nom} sx={{ width: 70, height: 70, objectFit: "cover", borderRadius: 2, border: "1px solid #E2E8F0", flexShrink: 0 }} />
                              ) : (
                                <Box sx={{ width: 70, height: 70, bgcolor: "#F1F5F9", borderRadius: 2, flexShrink: 0 }} />
                              )}
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.95rem", mb: 0.5 }}>{ligne.produit_nom}</Typography>
                                {isRupture && (<Chip icon={<Warning sx={{ fontSize: 14, color: "#DC2626 !important" }} />} label="Rupture de stock" size="small" sx={{ bgcolor: "#FEE2E2", color: "#DC2626", fontWeight: 600, fontSize: "0.7rem", height: 22 }} />)}
                                {isLowStock && (<Chip icon={<Warning sx={{ fontSize: 14, color: "#D97706 !important" }} />} label={`Plus que ${ligne.produit_stock} en stock`} size="small" sx={{ bgcolor: "#FEF3C7", color: "#D97706", fontWeight: 600, fontSize: "0.7rem", height: 22 }} />)}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, border: "1px solid #E2E8F0", borderRadius: 50, bgcolor: "#F8FAFC", px: 0.5 }}>
                              <IconButton size="small" onClick={() => handleRetirerQuantite(ligne)} disabled={ligne.quantite <= 1}><Remove sx={{ fontSize: 16 }} /></IconButton>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", minWidth: 28, textAlign: "center", color: "#0F172A" }}>{ligne.quantite}</Typography>
                              <IconButton size="small" onClick={() => handleAjouterQuantite(ligne)} disabled={isRupture || ligne.quantite >= ligne.produit_stock}><Add sx={{ fontSize: 16 }} /></IconButton>
                            </Box>
                          </TableCell>
                          <TableCell align="right"><Typography sx={{ fontSize: "0.9rem", color: "#64748B" }}>{formatPrice(ligne.prix_unitaire)}</Typography></TableCell>
                          <TableCell align="right"><Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>{formatPrice(ligne.sous_total)}</Typography></TableCell>
                          <TableCell align="center"><IconButton onClick={() => handleSupprimerLigne(ligne.id)} sx={{ color: "#94A3B8", "&:hover": { color: "#EF4444", bgcolor: "#FEE2E2" } }}><Delete fontSize="small" /></IconButton></TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* RÉCAPITULATIF */}
            <Box sx={{ width: { xs: "100%", lg: 340 }, flexShrink: 0, position: { lg: "sticky" }, top: { lg: 100 } }}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #E2E8F0", bgcolor: "#fff" }}>
                <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "1.1rem", mb: 2.5 }}>Récapitulatif</Typography>
                <Stack spacing={1.5} sx={{ mb: 2.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Articles</Typography><Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>{panier?.lignes?.reduce((acc, l) => acc + l.quantite, 0) || 0}</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Sous-total</Typography><Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.9rem" }}>{formatPrice(panier?.total || 0)}</Typography></Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}><Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Livraison</Typography><Typography sx={{ fontWeight: 600, color: "#10B981", fontSize: "0.9rem" }}>Gratuite</Typography></Box>
                </Stack>
                <Divider sx={{ mb: 2.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "1rem" }}>Total</Typography>
                  <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.2rem" }}>{formatPrice(panier?.total || 0)}</Typography>
                </Box>
                {hasRupture && (<Alert severity="error" icon={<Warning />} sx={{ mb: 2, borderRadius: 2, fontSize: "0.8rem" }}>Certains produits sont en rupture. Retirez-les pour continuer.</Alert>)}
                <Button variant="contained" fullWidth startIcon={<CheckCircle />} onClick={handleCommander} disabled={hasRupture} sx={{ bgcolor: hasRupture ? "#E2E8F0" : "#0F172A", color: hasRupture ? "#94A3B8" : "#fff", borderRadius: 2, py: 1.5, textTransform: "none", fontWeight: 600, fontSize: "0.9rem", boxShadow: "none", "&:hover": { bgcolor: hasRupture ? "#E2E8F0" : "#1E293B", boxShadow: "none" }, "&.Mui-disabled": { bgcolor: "#E2E8F0", color: "#94A3B8" } }}>
                  {hasRupture ? "Commande bloquée" : "Passer commande"}
                </Button>
                <Box sx={{ mt: 3, pt: 2, borderTop: "1px solid #F1F5F9", display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><LocalShipping sx={{ fontSize: 16, color: "#94A3B8" }} /><Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Livraison estimée : 3-5 jours ouvrés</Typography></Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}><Lock sx={{ fontSize: 16, color: "#94A3B8" }} /><Typography sx={{ fontSize: "0.75rem", color: "#64748B" }}>Paiement 100% sécurisé</Typography></Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {/* ✅ HISTORIQUE DES COMMANDES */}
        <Box sx={{ mt: 6 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Receipt sx={{ color: "#0F172A", fontSize: 26 }} />
            <Typography variant="h5" sx={{ fontWeight: 600, color: "#0F172A", fontFamily: '"Playfair Display", serif' }}>
              Mes commandes
            </Typography>
            <Chip label={commandes.length} size="small" sx={{ bgcolor: "#0F172A", color: "#fff", fontWeight: 600, ml: 1 }} />
          </Box>

          {loadingCommandes ? (
            <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress sx={{ color: "#0F172A" }} /></Box>
          ) : commandes.length === 0 ? (
            <Paper elevation={0} sx={{ p: 5, textAlign: "center", borderRadius: 3, border: "1px solid #E2E8F0" }}>
              <Inventory sx={{ fontSize: 48, color: "#CBD5E1", mb: 2 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: "#0F172A", mb: 1 }}>Aucune commande pour le moment</Typography>
              <Typography variant="body2" sx={{ color: "#64748B" }}>Vos futures commandes apparaîtront ici.</Typography>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {commandes.map((cmd) => {
                const config = getStatutConfig(cmd.statut);
                const lignes = cmd.lignes || [];
                return (
                  <Accordion key={cmd.id} elevation={0} sx={{ borderRadius: 3, border: "1px solid #E2E8F0", "&:before": { display: "none" }, "&.Mui-expanded": { margin: 0 } }}>
                    <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 3, py: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", flexWrap: "wrap", gap: 2, pr: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ bgcolor: "#F1F5F9", color: "#0F172A", width: 44, height: 44 }}>
                            <Receipt sx={{ fontSize: 22 }} />
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.95rem" }}>
                              Commande #{cmd.id}
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
                              <CalendarToday sx={{ fontSize: 13 }} /> {formatDate(cmd.date_commande)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                          <Chip label={config.label} size="small" sx={{ bgcolor: config.bgcolor, color: config.color, fontWeight: 600, fontSize: "0.75rem" }} />
                          <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1rem" }}>
                            {formatPrice(cmd.total)}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ px: 3, pt: 0, pb: 3 }}>
                      <Divider sx={{ mb: 2.5 }} />

                      {/* Livraison estimée */}
                      <Box sx={{ bgcolor: "#F8FAFC", borderRadius: 2, p: 2, mb: 2.5, display: "flex", alignItems: "center", gap: 1.5 }}>
                        <LocalShipping sx={{ color: "#6366F1", fontSize: 20 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem" }}>Livraison estimée</Typography>
                          <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>{getLivraisonEstimee(cmd.date_commande)}</Typography>
                        </Box>
                      </Box>

                      {/* Adresse */}
                      {cmd.adresse_livraison && (
                        <Box sx={{ mb: 2.5 }}>
                          <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem", mb: 0.5 }}>Adresse de livraison</Typography>
                          <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                            {cmd.adresse_livraison} {cmd.ville && `- ${cmd.ville}`} {cmd.code_postal && `(${cmd.code_postal})`}
                          </Typography>
                        </Box>
                      )}

                      {/* Articles */}
                      <Typography sx={{ fontWeight: 600, color: "#0F172A", fontSize: "0.85rem", mb: 1.5 }}>
                        Articles ({lignes.length})
                      </Typography>
                      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #E2E8F0", borderRadius: 2 }}>
                        <Table size="small">
                          <TableHead>
                            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                              <TableCell sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>Produit</TableCell>
                              <TableCell align="center" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>Quantité</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>Prix unitaire</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600, color: "#475569", fontSize: "0.8rem" }}>Sous-total</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {lignes.map((ligne, i) => (
                              <TableRow key={i}>
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                    {ligne.produit_image && (<Box component="img" src={ligne.produit_image} alt={ligne.produit_nom} sx={{ width: 40, height: 40, objectFit: "cover", borderRadius: 1.5 }} />)}
                                    <Typography sx={{ fontWeight: 500, color: "#0F172A", fontSize: "0.85rem" }}>{ligne.produit_nom}</Typography>
                                  </Box>
                                </TableCell>
                                <TableCell align="center"><Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>{ligne.quantite}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>{formatPrice(ligne.prix_unitaire)}</Typography></TableCell>
                                <TableCell align="right"><Typography sx={{ fontWeight: 700, color: "#0F172A", fontSize: "0.85rem" }}>{formatPrice(ligne.sous_total)}</Typography></TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Total */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 1, mt: 2 }}>
                        <Typography sx={{ color: "#64748B", fontSize: "0.9rem" }}>Total :</Typography>
                        <Typography sx={{ fontWeight: 800, color: "#0F172A", fontSize: "1.1rem" }}>{formatPrice(cmd.total)}</Typography>
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* SNACKBAR */}
        <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default Panier;