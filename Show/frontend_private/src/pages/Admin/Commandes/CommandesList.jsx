// src/pages/Admin/Commandes/CommandesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Snackbar,
  Card, CardContent, Grid, MenuItem, FormControl, InputLabel, alpha, Select,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Stack,
} from "@mui/material";
import {
  ArrowBack, Search, Visibility, Refresh, ShoppingCart, CheckCircle,
  Pending, Cancel, Clear, Dashboard as DashboardIcon, Phone,
  AttachMoney, LocalShipping, Receipt, Delete, Check, Close, Inventory,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const CommandesList = () => {
  const navigate = useNavigate();
  const [commandes, setCommandes] = useState([]);
  const [filteredCommandes, setFilteredCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [actionLoading, setActionLoading] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  
  // ✅ Nouveaux états pour le modal
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ AJOUT DE LA VARIABLE statuts ICI !
  const statuts = [
    { value: "all", label: "Tous" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "PAYEE", label: "Payée" },
    { value: "EN_PREPARATION", label: "En préparation" },
    { value: "EXPEDIEE", label: "Expédiée" },
    { value: "LIVREE", label: "Livrée" },
    { value: "ANNULEE", label: "Annulée" },
  ];

  const handleValiderCommande = async (id) => {
    setActionLoading(id);
    try {
      await adminService.updateCommande(id, { statut: "PAYEE" });
      setSnackbar({ open: true, message: "✅ Commande validée !", severity: "success" });
      fetchCommandes();
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Erreur validation", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnnulerCommande = async (id) => {
    setActionLoading(id);
    try {
      await adminService.updateCommande(id, { statut: "ANNULEE" });
      setSnackbar({ open: true, message: "❌ Commande annulée !", severity: "warning" });
      fetchCommandes();
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Erreur annulation", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSupprimerClient = async (clientId, commandeId) => {
    setActionLoading(commandeId);
    try {
      await adminService.deleteClient(clientId);
      setSnackbar({ open: true, message: "🗑️ Client supprimé !", severity: "success" });
      fetchCommandes();
    } catch (err) {
      setSnackbar({ open: true, message: "❌ Erreur suppression", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleVoirCommande = (commande) => {
    setSelectedCommande(commande);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCommande(null);
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCommandes();
      let commandesList = [];
      if (data && data.results) commandesList = data.results;
      else if (Array.isArray(data)) commandesList = data;
      setCommandes(commandesList);
      setFilteredCommandes(commandesList);
    } catch (err) {
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = commandes;
    if (searchTerm) {
      result = result.filter(
        (cmd) =>
          cmd.id?.toString().includes(searchTerm) ||
          cmd.client_details?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cmd.client_details?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          cmd.client_details?.telephone?.includes(searchTerm) ||
          cmd.adresse_livraison?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatut !== "all") result = result.filter((cmd) => cmd.statut === filterStatut);
    setFilteredCommandes(result);
    setPage(1);
  }, [searchTerm, filterStatut, commandes]);

  const getStatutChip = (statut) => {
    const configs = {
      EN_ATTENTE: { label: "⏳ En attente", color: "#F59E0B" },
      PAYEE: { label: "💳 Payée", color: "#10B981" },
      EN_PREPARATION: { label: "📦 En préparation", color: "#6366F1" },
      EXPEDIEE: { label: "🚚 Expédiée", color: "#3B82F6" },
      LIVREE: { label: "✅ Livrée", color: "#10B981" },
      ANNULEE: { label: "❌ Annulée", color: "#EF4444" },
    };
    const config = configs[statut] || configs.EN_ATTENTE;
    return (
      <Chip label={config.label} size="small" sx={{ bgcolor: alpha(config.color, 0.12), color: config.color, fontWeight: 600 }} />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Date inconnue";
    }
  };

  const formatPrice = (price) => {
    if (!price) return "0 CFA";
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(price);
  };

  const getInitials = (prenom, nom) => {
    if (!prenom && !nom) return "?";
    return `${(prenom || "")[0]}${(nom || "")[0]}`.toUpperCase();
  };

  const paginatedCommandes = filteredCommandes.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredCommandes.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: "#2C2C2C" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ borderRadius: "12px" }} action={<Button color="inherit" size="small" onClick={fetchCommandes} startIcon={<Refresh />}>Réessayer</Button>}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button variant="outlined" startIcon={<DashboardIcon />} onClick={() => navigate("/admin/dashboard")} sx={{ borderColor: "#E0E0E0", color: "#666666", borderRadius: "50px", textTransform: "none", fontWeight: 500, px: 2.5 }}>
            Dashboard
          </Button>
          <Button startIcon={<ArrowBack />} onClick={() => navigate("/admin/dashboard")} sx={{ color: "#666666" }}>
            Retour
          </Button>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#2C2C2C", fontFamily: '"Playfair Display", serif' }}>
          Commandes clients
        </Typography>
        <Typography variant="body2" sx={{ color: "#666666", mt: 0.5 }}>
          {filteredCommandes.length} commande{filteredCommandes.length > 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total commandes", value: commandes.length, icon: <Receipt />, color: "#2C2C2C" },
          { label: "En attente", value: commandes.filter((c) => c.statut === "EN_ATTENTE").length, icon: <Pending />, color: "#F59E0B" },
          { label: "En préparation", value: commandes.filter((c) => c.statut === "EN_PREPARATION").length, icon: <LocalShipping />, color: "#6366F1" },
          { label: "Livrées", value: commandes.filter((c) => c.statut === "LIVREE").length, icon: <CheckCircle />, color: "#10B981" },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={`stat-${index}`}>
            <Card sx={{ borderRadius: "16px", border: "1px solid #F0F0F0", boxShadow: "none" }}>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#999999", fontWeight: 500 }}>{stat.label}</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#2C2C2C", mt: 0.5 }}>{stat.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: `${stat.color}15`, color: stat.color, width: 40, height: 40 }}>{stat.icon}</Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recherche et filtres */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: "16px", border: "1px solid #F0F0F0" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher par ID, client, adresse..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1, maxWidth: "400px", "& .MuiOutlinedInput-root": { borderRadius: "50px", bgcolor: "#F8F8F8" } }}
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start"><Search sx={{ color: "#BDBDBD" }} /></InputAdornment>,
                endAdornment: searchTerm && <InputAdornment position="end"><IconButton size="small" onClick={() => setSearchTerm("")}><Clear sx={{ fontSize: 18, color: "#BDBDBD" }} /></IconButton></InputAdornment>,
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: "150px" }}>
            <InputLabel>Statut</InputLabel>
            <Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} label="Statut" sx={{ borderRadius: "50px" }}>
              {statuts.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={fetchCommandes} sx={{ color: "#666666" }}><Refresh /></IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: "#999999" }}>{filteredCommandes.length} résultat{filteredCommandes.length > 1 ? "s" : ""}</Typography>
        </Box>
      </Paper>

      {/* Tableau */}
      <Paper sx={{ borderRadius: "16px", border: "1px solid #F0F0F0", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8F8F8" }}>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Commande</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Client + Tél</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Total</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCommandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <ShoppingCart sx={{ fontSize: 48, color: "#BDBDBD", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "#666666" }}>Aucune commande</Typography>
                      <Typography variant="body2" sx={{ color: "#999999" }}>
                        {searchTerm || filterStatut !== "all" ? "Aucune commande ne correspond à vos critères" : "Aucune commande pour le moment"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCommandes.map((commande) => (
                  <TableRow key={commande.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2C" }}>#{commande.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: "#E8F5E9", color: "#2E7D32" }}>
                          {getInitials(commande.client_details?.prenom, commande.client_details?.nom)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: "#2C2C2C" }}>
                            {commande.client_details?.prenom || ""} {commande.client_details?.nom || "Client inconnu"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#999999", display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Phone sx={{ fontSize: 12 }} />
                            {commande.client_details?.telephone || "Téléphone non renseigné"}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2C" }}>{formatPrice(commande.total)}</Typography>
                    </TableCell>
                    <TableCell>{getStatutChip(commande.statut)}</TableCell>
                    <TableCell>
                      <Typography variant="caption" sx={{ color: "#666666" }}>{formatDate(commande.date_commande)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        {commande.statut === "EN_ATTENTE" && (
                          <Tooltip title="Valider">
                            <IconButton size="small" onClick={() => handleValiderCommande(commande.id)} disabled={actionLoading === commande.id} sx={{ color: "#10B981" }}>
                              <Check fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {commande.statut !== "ANNULEE" && (
                          <Tooltip title="Annuler">
                            <IconButton size="small" onClick={() => handleAnnulerCommande(commande.id)} disabled={actionLoading === commande.id} sx={{ color: "#EF4444" }}>
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Supprimer le client">
                          <IconButton size="small" onClick={() => handleSupprimerClient(commande.client_details?.id, commande.id)} disabled={actionLoading === commande.id || !commande.client_details?.id} sx={{ color: "#F59E0B" }}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Voir la commande">
                          <IconButton size="small" onClick={() => handleVoirCommande(commande)} sx={{ color: "#6366F1" }}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* ===== MODAL DÉTAILS COMMANDE ===== */}
      <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#2C2C2C", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Receipt sx={{ color: "#6366F1" }} />
            Détails de la commande #{selectedCommande?.id}
          </Box>
          <IconButton onClick={handleCloseModal} size="small">
            <Close fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCommande && (
            <Box>
              {/* Infos Client */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2C2C2C", mb: 1 }}>
                🧑‍💼 Informations Client
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Nom :</strong> {selectedCommande.client_details?.prenom} {selectedCommande.client_details?.nom}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Téléphone :</strong> {selectedCommande.client_details?.telephone || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Email :</strong> {selectedCommande.client_details?.email || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Date :</strong> {formatDate(selectedCommande.date_commande)}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Infos Livraison */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2C2C2C", mb: 1 }}>
                🚚 Informations de livraison
              </Typography>
              <Grid container spacing={1} sx={{ mb: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Adresse :</strong> {selectedCommande.adresse_livraison || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Ville :</strong> {selectedCommande.ville || "N/A"}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: "#666666" }}><strong>Code postal :</strong> {selectedCommande.code_postal || "N/A"}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ mb: 2 }} />

              {/* Produits commandés */}
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#2C2C2C", mb: 1 }}>
                🛒 Produits commandés
              </Typography>
              <Box sx={{ mb: 2 }}>
                {selectedCommande.lignes && selectedCommande.lignes.length > 0 ? (
                  selectedCommande.lignes.map((ligne) => (
                    <Box key={ligne.id} sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5, p: 1, border: "1px solid #F0F0F0", borderRadius: "8px" }}>
                      {ligne.produit_image ? (
                        <Box
                          component="img"
                          src={ligne.produit_image}
                          alt={ligne.produit_nom}
                          sx={{ width: 60, height: 60, objectFit: "cover", borderRadius: "8px" }}
                        />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 60, height: 60, bgcolor: "#F0F0F0" }}>
                          <Inventory />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#2C2C2C" }}>{ligne.produit_nom}</Typography>
                        <Typography variant="caption" sx={{ color: "#666666" }}>Quantité : {ligne.quantite}</Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2C" }}>{formatPrice(ligne.prix_unitaire)}</Typography>
                        <Typography variant="caption" sx={{ color: "#666666" }}>Sous-total : {formatPrice(ligne.sous_total)}</Typography>
                      </Box>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" sx={{ color: "#999999" }}>Aucun produit trouvé</Typography>
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              {/* Total */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#2C2C2C" }}>
                  Total : {formatPrice(selectedCommande.total)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseModal} variant="contained" sx={{ backgroundColor: "#2C2C2C", color: "#fff", borderRadius: "50px", textTransform: "none", "&:hover": { backgroundColor: "#333" } }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: "14px", width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default CommandesList;