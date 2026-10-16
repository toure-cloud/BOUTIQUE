import { logger } from '../../../lib/logger';
// src/pages/Admin/Formations/InscriptionsFormations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Stack, alpha, Grid,
} from "@mui/material";
import {
  Search, Visibility, Refresh, School, CheckCircle, Cancel, Clear,
  Dashboard as DashboardIcon, Email, Phone, QrCode, Delete,
  Close, Person, CalendarToday, Badge, Info,
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

const InscriptionsFormations = () => {
  const navigate = useNavigate();
  const [inscriptions, setInscriptions] = useState([]);
  const [filteredInscriptions, setFilteredInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  // États modal détails
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // États modal action
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [processing, setProcessing] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getInscriptionsFormations();
      let list = data?.results || (Array.isArray(data) ? data : []);
      list = list.filter((ins) => ins.client !== null);
      setInscriptions(list);
      setFilteredInscriptions(list);
    } catch {
      setError("Impossible de charger les inscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = inscriptions;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((ins) => {
        const client = ins.client_details || {};
        const formation = ins.formation_details || {};
        return (
          client.nom?.toLowerCase().includes(q) ||
          client.prenom?.toLowerCase().includes(q) ||
          client.email?.toLowerCase().includes(q) ||
          formation.titre?.toLowerCase().includes(q)
        );
      });
    }
    setFilteredInscriptions(result);
    setPage(1);
  }, [searchTerm, inscriptions]);

  const handleViewDetails = (inscription) => {
    setSelectedInscription(inscription);
    setDetailDialogOpen(true);
  };

  const handleAction = (inscription, type) => {
    setSelectedInscription(inscription);
    setActionType(type);
    setActionDialogOpen(true);
  };

  // ✅ CORRECTION : utiliser les actions custom du backend
  const handleActionConfirm = async () => {
    setProcessing(true);
    try {
      const ins = selectedInscription;

      if (actionType === "valider") {
        const response = await adminService.validerPaiementInscription(ins.id);
        logger.log("🟢 Valider:", response);
        setSnackbar({
          open: true,
          message: `✅ Inscription validée pour ${ins.client_details?.prenom || ""} ${ins.client_details?.nom || ""}`,
          severity: "success",
        });
      } else if (actionType === "generer_code") {
        const response = await adminService.genererCodeAcces(ins.id);
        logger.log("🟢 Code généré:", response);
        setSnackbar({
          open: true,
          message: `✅ Code d'accès généré : ${response.code || "OK"}`,
          severity: "success",
        });
      } else if (actionType === "refuser") {
        const response = await adminService.refuserInscription(ins.id);
        logger.log("🟢 Refuser:", response);
        setSnackbar({
          open: true,
          message: `❌ Inscription refusée pour ${ins.client_details?.prenom || ""} ${ins.client_details?.nom || ""}`,
          severity: "warning",
        });
      } else if (actionType === "supprimer") {
        await adminService.deleteInscription(ins.id);
        setSnackbar({ open: true, message: `🗑️ Inscription supprimée`, severity: "success" });
      }

      setActionDialogOpen(false);
      setSelectedInscription(null);
      await fetchInscriptions();
    } catch (err) {
      logger.error("🔴 Erreur:", err.response?.data || err);
      const msg =
        err.response?.data?.error ||
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "❌ Erreur lors de l'action";
      setSnackbar({ open: true, message: msg, severity: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
      });
    } catch { return "—"; }
  };

  const getStatutConfig = (statut) => {
    switch (statut) {
      case "EN_ATTENTE": return { label: "En attente", color: T.warning };
      case "PAYEE": return { label: "Payée", color: T.success };
      case "ANNULEE": return { label: "Annulée", color: T.danger };
      case "REMBOURSEE": return { label: "Remboursée", color: "#6366F1" };
      default: return { label: statut || "Inconnu", color: T.muted };
    }
  };

  const paginated = filteredInscriptions.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredInscriptions.length / rowsPerPage);

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
        <Alert severity="error" sx={{ borderRadius: 2 }} action={<Button color="inherit" size="small" onClick={fetchInscriptions} startIcon={<Refresh />}>Réessayer</Button>}>
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
          <Button startIcon={<DashboardIcon sx={{ fontSize: 18 }} />} onClick={() => navigate("/admin/dashboard")} sx={{ color: T.muted, textTransform: "none", fontWeight: 500, mb: 2.5, px: 0, "&:hover": { color: T.primary, bgcolor: "transparent" } }}>
            Retour au dashboard
          </Button>
          <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.6rem", letterSpacing: -0.4 }}>
            Inscriptions formations
          </Typography>
          <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
            {filteredInscriptions.length} inscription{filteredInscriptions.length > 1 ? "s" : ""}
          </Typography>
        </Box>

        {/* Search */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 2.5, border: `1px solid ${T.border}`, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email ou formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 260, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg } }}
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
          <IconButton onClick={fetchInscriptions} sx={{ color: T.muted }}><Refresh /></IconButton>
          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>{filteredInscriptions.length} résultat{filteredInscriptions.length > 1 ? "s" : ""}</Typography>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.bg }}>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Formation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Montant</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <School sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600, mb: 0.5 }}>Aucune inscription</Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.875rem" }}>{searchTerm ? "Aucun résultat" : "Aucune inscription pour le moment"}</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((inscription) => {
                    const client = inscription.client_details || {};
                    const formation = inscription.formation_details || {};
                    const statutCfg = getStatutConfig(inscription.statut);

                    return (
                      <TableRow key={inscription.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar sx={{ width: 38, height: 38, bgcolor: alpha(T.accent, 0.1), color: T.accent, fontSize: "0.85rem", fontWeight: 600 }}>
                              {client.prenom?.[0]}{client.nom?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem" }}>
                                {client.prenom || "—"} {client.nom || ""}
                              </Typography>
                              <Typography sx={{ color: T.muted, fontSize: "0.75rem" }}>ID #{client.id || "N/A"}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              <Email sx={{ fontSize: 14, color: T.muted }} />
                              <Typography sx={{ fontSize: "0.82rem", color: T.secondary }}>{client.email || "—"}</Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              <Phone sx={{ fontSize: 14, color: T.muted }} />
                              <Typography sx={{ fontSize: "0.82rem", color: T.secondary }}>{client.telephone || "—"}</Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500, color: T.primary, fontSize: "0.875rem" }}>
                            {formation.titre || "Formation inconnue"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.primary }}>
                            {inscription.montant || formation.prix || 0} CFA
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={statutCfg.label} size="small" sx={{ height: 24, fontWeight: 600, fontSize: "0.72rem", bgcolor: alpha(statutCfg.color, 0.12), color: statutCfg.color }} />
                          {inscription.code_acces && (<Chip label="Code OK" size="small" sx={{ height: 22, ml: 0.5, fontWeight: 600, fontSize: "0.65rem", bgcolor: alpha(T.success, 0.12), color: T.success }} />)}
                        </TableCell>
                        <TableCell align="center">
                          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>{formatDate(inscription.date_inscription)}</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {inscription.statut === "EN_ATTENTE" && (
                              <>
                                <Tooltip title="Valider">
                                  <IconButton size="small" onClick={() => handleAction(inscription, "valider")} sx={{ color: T.success }}>
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Refuser">
                                  <IconButton size="small" onClick={() => handleAction(inscription, "refuser")} sx={{ color: T.danger }}>
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {inscription.statut === "PAYEE" && !inscription.code_acces && (
                              <Tooltip title="Générer le code d'accès">
                                <IconButton size="small" onClick={() => handleAction(inscription, "generer_code")} sx={{ color: T.accent }}>
                                  <QrCode fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Voir tous les détails">
                              <IconButton size="small" onClick={() => handleViewDetails(inscription)} sx={{ color: "#6366F1" }}>
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer l'inscription">
                              <IconButton size="small" onClick={() => handleAction(inscription, "supprimer")} sx={{ color: T.danger }}>
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

          {filteredInscriptions.length > 0 && (
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, borderTop: `1px solid ${T.border}` }}>
              <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredInscriptions.length)} sur {filteredInscriptions.length}
              </Typography>
              <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} size="small" sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, "&.Mui-selected": { bgcolor: T.primary, color: "#fff" } } }} />
            </Box>
          )}
        </Paper>

        {/* ===== MODAL DÉTAILS ===== */}
        <Dialog
          open={detailDialogOpen}
          onClose={() => setDetailDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
        >
          {selectedInscription && (() => {
            const client = selectedInscription.client_details || {};
            const formation = selectedInscription.formation_details || {};
            const statutCfg = getStatutConfig(selectedInscription.statut);
            return (
              <>
                <DialogTitle sx={{ bgcolor: T.primary, color: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", py: 2.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Info sx={{ fontSize: 24 }} />
                    <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                      Détails de l'inscription #{selectedInscription.id}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => setDetailDialogOpen(false)} sx={{ color: "#fff" }}><Close /></IconButton>
                </DialogTitle>

                <DialogContent sx={{ p: 3 }}>
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Chip label={statutCfg.label} sx={{ bgcolor: alpha(statutCfg.color, 0.12), color: statutCfg.color, fontWeight: 700, fontSize: "0.85rem", height: 32, px: 2 }} />
                  </Box>

                  {/* CLIENT */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${T.border}`, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Person sx={{ color: T.accent, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1rem" }}>Informations Client</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha(T.accent, 0.1), color: T.accent, width: 44, height: 44, fontWeight: 700 }}>
                            {client.prenom?.[0]}{client.nom?.[0]}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.95rem" }}>
                              {client.prenom} {client.nom}
                            </Typography>
                            <Typography sx={{ color: T.muted, fontSize: "0.78rem" }}>ID #{client.id}</Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>EMAIL</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.85rem" }}>{client.email || "—"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>TÉLÉPHONE</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.85rem" }}>{client.telephone || "—"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>ADRESSE</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.85rem" }}>{client.adresse || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* FORMATION */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${T.border}`, mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <School sx={{ color: T.success, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1rem" }}>Formation</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>TITRE</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.95rem", fontWeight: 600 }}>{formation.titre || "—"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>PRIX</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.9rem", fontWeight: 700 }}>{formation.prix || 0} CFA</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>DURÉE</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.9rem" }}>{formation.duree || "—"}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* INSCRIPTION */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: `1px solid ${T.border}` }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                      <Badge sx={{ color: T.warning, fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1rem" }}>Détails de l'inscription</Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>MONTANT PAYÉ</Typography>
                        <Typography sx={{ color: T.success, fontSize: "1rem", fontWeight: 700 }}>{selectedInscription.montant || 0} CFA</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>DATE D'INSCRIPTION</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 0.5 }}>
                          <CalendarToday sx={{ fontSize: 14 }} /> {formatDate(selectedInscription.date_inscription)}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>RÉFÉRENCE PAIEMENT</Typography>
                        <Typography sx={{ color: T.primary, fontSize: "0.85rem" }}>{selectedInscription.reference_paiement || "—"}</Typography>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>CODE D'ACCÈS</Typography>
                        {selectedInscription.code_acces ? (
                          <Chip
                            label={`🔑 ${selectedInscription.code_acces?.code || selectedInscription.code_acces}`}
                            sx={{ bgcolor: alpha(T.success, 0.12), color: T.success, fontWeight: 700, fontSize: "0.78rem" }}
                          />
                        ) : (
                          <Typography sx={{ color: T.muted, fontSize: "0.85rem" }}>Non généré</Typography>
                        )}
                      </Grid>
                      {selectedInscription.notes && (
                        <Grid size={{ xs: 12 }}>
                          <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 600, mb: 0.3 }}>NOTES</Typography>
                          <Paper elevation={0} sx={{ p: 1.5, bgcolor: T.bg, borderRadius: 1.5 }}>
                            <Typography sx={{ color: T.secondary, fontSize: "0.85rem", fontStyle: "italic" }}>{selectedInscription.notes}</Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Paper>
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${T.border}` }}>
                  <Button onClick={() => setDetailDialogOpen(false)} sx={{ textTransform: "none", color: T.muted }}>
                    Fermer
                  </Button>
                  {selectedInscription.statut === "EN_ATTENTE" && (
                    <Button
                      variant="contained"
                      onClick={() => { setDetailDialogOpen(false); handleAction(selectedInscription, "valider"); }}
                      startIcon={<CheckCircle />}
                      sx={{ bgcolor: T.success, textTransform: "none", borderRadius: 2, "&:hover": { bgcolor: "#047857" } }}
                    >
                      Valider
                    </Button>
                  )}
                </DialogActions>
              </>
            );
          })()}
        </Dialog>

        {/* ===== MODAL CONFIRMATION ACTION ===== */}
        <Dialog
          open={actionDialogOpen}
          onClose={() => setActionDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 2.5 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: T.primary }}>
            {actionType === "valider" && "✅ Valider l'inscription"}
            {actionType === "refuser" && "❌ Refuser l'inscription"}
            {actionType === "generer_code" && "🔑 Générer le code d'accès"}
            {actionType === "supprimer" && "🗑️ Supprimer l'inscription"}
          </DialogTitle>
          <DialogContent>
            {selectedInscription && (
              <DialogContentText sx={{ color: T.secondary }}>
                {actionType === "valider" && (<>Valider l'inscription de <strong>{selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}</strong> à la formation <strong>"{selectedInscription.formation_details?.titre}"</strong> ?</>)}
                {actionType === "refuser" && (<>Refuser l'inscription de <strong>{selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}</strong> ?</>)}
                {actionType === "generer_code" && (<>Un code d'accès va être généré pour <strong>{selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}</strong>.</>)}
                {actionType === "supprimer" && (
                  <>
                    <strong>⚠️ ATTENTION :</strong> Vous êtes sur le point de supprimer définitivement l'inscription de{" "}
                    <strong>{selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}</strong> à la formation{" "}
                    <strong>"{selectedInscription.formation_details?.titre}"</strong>. <br /><br />
                    Cette action est <strong>irréversible</strong>.
                  </>
                )}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setActionDialogOpen(false)} sx={{ textTransform: "none", color: T.muted }}>Annuler</Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              disabled={processing}
              sx={{
                bgcolor: actionType === "refuser" || actionType === "supprimer" ? T.danger : T.success,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: actionType === "refuser" || actionType === "supprimer" ? "#B91C1C" : "#047857", boxShadow: "none" },
              }}
            >
              {processing ? <CircularProgress size={18} color="inherit" /> : "Confirmer"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }} onClose={() => setSnackbar({ ...snackbar, open: false })}>{snackbar.message}</Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default InscriptionsFormations;