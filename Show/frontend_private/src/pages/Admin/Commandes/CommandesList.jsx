import { logger } from '../../../lib/logger';
// src/pages/Admin/Commandes/CommandesList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Snackbar,
  FormControl, InputLabel, Select, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Divider, Stack, Grid, alpha,
} from "@mui/material";
import {
  Search, Visibility, Refresh, ShoppingCart, Clear, Dashboard as DashboardIcon,
  Phone, Check, Cancel, Close, Inventory, Delete, Warning,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const T = {
  primary: "#0F172A",
  secondary: "#475569",
  muted: "#64748B",
  border: "#E2E8F0",
  bg: "#F8FAFC",
  surface: "#FFFFFF",
  accent: "#4F46E5",
  success: "#059669",
  warning: "#D97706",
  danger: "#DC2626",
};

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

  // ✅ États pour le modal de détails
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ✅ États pour la suppression
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commandeToDelete, setCommandeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const statuts = [
    { value: "all", label: "Tous les statuts" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "PAYEE", label: "Payée" },
    { value: "EN_PREPARATION", label: "En préparation" },
    { value: "EXPEDIEE", label: "Expédiée" },
    { value: "LIVREE", label: "Livrée" },
    { value: "ANNULEE", label: "Annulée" },
  ];

  const statutConfig = {
    EN_ATTENTE: { label: "En attente", color: T.warning },
    PAYEE: { label: "Payée", color: T.success },
    EN_PREPARATION: { label: "En préparation", color: "#6366F1" },
    EXPEDIEE: { label: "Expédiée", color: "#3B82F6" },
    LIVREE: { label: "Livrée", color: T.success },
    ANNULEE: { label: "Annulée", color: T.danger },
  };

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getCommandes();
      const list = data?.results || (Array.isArray(data) ? data : []);
      setCommandes(list);
      setFilteredCommandes(list);
    } catch {
      setError("Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = commandes;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (cmd) =>
          cmd.id?.toString().includes(q) ||
          cmd.client_details?.nom?.toLowerCase().includes(q) ||
          cmd.client_details?.prenom?.toLowerCase().includes(q) ||
          cmd.client_details?.telephone?.includes(searchTerm)
      );
    }
    if (filterStatut !== "all") {
      result = result.filter((cmd) => cmd.statut === filterStatut);
    }
    setFilteredCommandes(result);
    setPage(1);
  }, [searchTerm, filterStatut, commandes]);

  const handleValider = async (id) => {
    setActionLoading(id);
    try {
      await adminService.updateCommande(id, { statut: "PAYEE" });
      setSnackbar({ open: true, message: "✅ Commande validée", severity: "success" });
      fetchCommandes();
    } catch {
      setSnackbar({ open: true, message: "❌ Erreur lors de la validation", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleAnnuler = async (id) => {
    setActionLoading(id);
    try {
      await adminService.updateCommande(id, { statut: "ANNULEE" });
      setSnackbar({ open: true, message: "❌ Commande annulée", severity: "warning" });
      fetchCommandes();
    } catch {
      setSnackbar({ open: true, message: "❌ Erreur lors de l'annulation", severity: "error" });
    } finally {
      setActionLoading(null);
    }
  };

  // ✅ Ouvrir le dialog de suppression
  const handleDeleteClick = (commande) => {
    setCommandeToDelete(commande);
    setDeleteDialogOpen(true);
  };

  // ✅ Confirmer la suppression
  const handleDeleteConfirm = async () => {
    if (!commandeToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteCommande(commandeToDelete.id);
      setSnackbar({ open: true, message: `🗑️ Commande #${commandeToDelete.id} supprimée`, severity: "success" });
      setDeleteDialogOpen(false);
      setCommandeToDelete(null);
      fetchCommandes();
    } catch (err) {
      logger.error("Erreur suppression:", err);
      setSnackbar({ open: true, message: "❌ Erreur lors de la suppression", severity: "error" });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", {
      day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF", minimumFractionDigits: 0 }).format(p || 0);

  const paginated = filteredCommandes.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredCommandes.length / rowsPerPage);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress sx={{ color: T.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }} action={
          <Button color="inherit" size="small" onClick={fetchCommandes} startIcon={<Refresh />}>Réessayer</Button>
        }>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<DashboardIcon sx={{ fontSize: 18 }} />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              color: T.muted, textTransform: "none", fontWeight: 500,
              mb: 2.5, px: 0,
              "&:hover": { color: T.primary, bgcolor: "transparent" },
            }}
          >
            Retour au dashboard
          </Button>

          <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.6rem", letterSpacing: -0.4 }}>
            Commandes
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
            {filteredCommandes.length} commande{filteredCommandes.length > 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Filters */}
        <Paper
          elevation={0}
          sx={{
            p: 2, mb: 3, borderRadius: 2.5, border: `1px solid ${T.border}`,
            display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher par ID, client, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 240, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg } }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: T.muted, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Clear sx={{ fontSize: 18, color: T.muted }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatut}
              label="Statut"
              onChange={(e) => setFilterStatut(e.target.value)}
              sx={{ borderRadius: 2, bgcolor: T.bg }}
            >
              {statuts.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={fetchCommandes} sx={{ color: T.muted }}>
            <Refresh />
          </IconButton>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.bg }}>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Commande</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <ShoppingCart sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600 }}>Aucune commande</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((cmd) => {
                    const cfg = statutConfig[cmd.statut] || { label: cmd.statut, color: T.muted };
                    return (
                      <TableRow key={cmd.id} hover>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "0.9rem" }}>
                            #{cmd.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              sx={{
                                width: 36, height: 36,
                                bgcolor: alpha(T.accent, 0.1),
                                color: T.accent,
                                fontSize: "0.8rem", fontWeight: 600,
                              }}
                            >
                              {cmd.client_details?.prenom?.[0]}
                              {cmd.client_details?.nom?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", color: T.primary }}>
                                {cmd.client_details?.prenom} {cmd.client_details?.nom}
                              </Typography>
                              <Typography sx={{ color: T.muted, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.4 }}>
                                <Phone sx={{ fontSize: 12 }} />
                                {cmd.client_details?.telephone || "—"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.primary }}>
                            {formatPrice(cmd.total)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={cfg.label}
                            size="small"
                            sx={{
                              height: 24, fontWeight: 600, fontSize: "0.72rem",
                              bgcolor: alpha(cfg.color, 0.12),
                              color: cfg.color,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                            {formatDate(cmd.date_commande)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {cmd.statut === "EN_ATTENTE" && (
                              <Tooltip title="Valider">
                                <IconButton
                                  size="small"
                                  onClick={() => handleValider(cmd.id)}
                                  disabled={actionLoading === cmd.id}
                                  sx={{ color: T.success }}
                                >
                                  <Check fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            {cmd.statut !== "ANNULEE" && (
                              <Tooltip title="Annuler">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAnnuler(cmd.id)}
                                  disabled={actionLoading === cmd.id}
                                  sx={{ color: T.warning }}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Voir détails">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedCommande(cmd);
                                  setModalOpen(true);
                                }}
                                sx={{ color: T.accent }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            {/* ✅ Bouton Supprimer */}
                            <Tooltip title="Supprimer la commande">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteClick(cmd)}
                                disabled={actionLoading === cmd.id}
                                sx={{ color: T.danger }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredCommandes.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderTop: `1px solid ${T.border}` }}>
              <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredCommandes.length)} sur {filteredCommandes.length}
              </Typography>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, v) => setPage(v)}
                size="small"
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 1.5,
                    "&.Mui-selected": { bgcolor: T.primary, color: "#fff" },
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        {/* ===== Modal détails commande ===== */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth SlotProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${T.border}` }}>
            <Typography sx={{ fontWeight: 600 }}>Commande #{selectedCommande?.id}</Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <Close sx={{ fontSize: 20, color: T.muted }} />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers>
            {selectedCommande && (
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1.5, color: T.primary }}>Client</Typography>
                <Grid container spacing={1} sx={{ mb: 2.5 }}>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                      <strong>Nom :</strong> {selectedCommande.client_details?.prenom} {selectedCommande.client_details?.nom}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                      <strong>Téléphone :</strong> {selectedCommande.client_details?.telephone || "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                      <strong>Email :</strong> {selectedCommande.client_details?.email || "—"}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                      <strong>Date :</strong> {formatDate(selectedCommande.date_commande)}
                    </Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 2.5 }} />

                <Typography sx={{ fontWeight: 600, mb: 1.5, color: T.primary }}>Produits</Typography>
                {(selectedCommande.lignes || []).length > 0 ? (
                  selectedCommande.lignes.map((l) => (
                    <Box
                      key={l.id}
                      sx={{
                        display: "flex", alignItems: "center", gap: 2, mb: 1.5,
                        p: 1.5, border: `1px solid ${T.border}`, borderRadius: 2,
                      }}
                    >
                      {l.produit_image ? (
                        <Box component="img" src={l.produit_image} alt="" sx={{ width: 52, height: 52, objectFit: "cover", borderRadius: 1.5 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 52, height: 52, bgcolor: T.bg }}>
                          <Inventory sx={{ color: T.muted }} />
                        </Avatar>
                      )}
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{l.produit_nom}</Typography>
                        <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>Qté : {l.quantite}</Typography>
                      </Box>
                      <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {formatPrice(l.sous_total || l.prix_unitaire * l.quantite)}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography sx={{ color: T.muted }}>Aucun produit</Typography>
                )}

                <Divider sx={{ my: 2.5 }} />
                <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                  <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", color: T.primary }}>
                    Total : {formatPrice(selectedCommande.total)}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={() => setModalOpen(false)}
              variant="contained"
              sx={{
                bgcolor: T.primary, textTransform: "none", borderRadius: 2,
                boxShadow: "none", "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
              }}
            >
              Fermer
            </Button>
          </DialogActions>
        </Dialog>

        {/* ===== Dialog de confirmation de suppression ===== */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} SlotProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ fontWeight: 600, color: T.primary, display: "flex", alignItems: "center", gap: 1 }}>
            <Warning sx={{ color: T.danger }} />
            Confirmer la suppression
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: T.secondary }}>
              Êtes-vous sûr de vouloir supprimer la commande <strong>#{commandeToDelete?.id}</strong> ?
              <br /><br />
              Client : <strong>{commandeToDelete?.client_details?.prenom} {commandeToDelete?.client_details?.nom}</strong>
              <br />
              Total : <strong>{formatPrice(commandeToDelete?.total)}</strong>
              <br /><br />
              ⚠️ Cette action est <strong>irréversible</strong>.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
              sx={{ textTransform: "none", color: T.muted }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              disabled={deleting}
              startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
              sx={{
                bgcolor: T.danger, textTransform: "none", borderRadius: 2,
                boxShadow: "none", "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
              }}
            >
              {deleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default CommandesList;