// src/pages/Admin/Formations/InscriptionsFormations.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Stack, alpha,
} from "@mui/material";
import {
  Search, Visibility, Refresh, School, CheckCircle, Cancel, Clear,
  Dashboard as DashboardIcon, Email, Phone, QrCode,
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

  const [selectedInscription, setSelectedInscription] = useState(null);
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

  const handleAction = (inscription, type) => {
    setSelectedInscription(inscription);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const handleActionConfirm = async () => {
    setProcessing(true);
    try {
      const ins = selectedInscription;
      if (actionType === "valider") {
        await adminService.updateInscription(ins.id, { statut: "PAYEE" });
        setSnackbar({
          open: true,
          message: `Inscription validée pour ${ins.client_details?.prenom || ""} ${ins.client_details?.nom || ""}`,
          severity: "success",
        });
      } else if (actionType === "generer_code") {
        const code = "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await adminService.genererCodeAcces(ins.id, { code });
        setSnackbar({ open: true, message: `Code d'accès généré : ${code}`, severity: "success" });
      } else if (actionType === "refuser") {
        await adminService.updateInscription(ins.id, { statut: "ANNULEE" });
        setSnackbar({
          open: true,
          message: `Inscription refusée pour ${ins.client_details?.prenom || ""} ${ins.client_details?.nom || ""}`,
          severity: "warning",
        });
      }
      setActionDialogOpen(false);
      fetchInscriptions();
    } catch {
      setSnackbar({ open: true, message: "Erreur lors de l'action", severity: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const getStatutConfig = (statut) => {
    switch (statut) {
      case "EN_ATTENTE":
        return { label: "En attente", color: T.warning };
      case "PAYEE":
        return { label: "Payée", color: T.success };
      case "ANNULEE":
        return { label: "Annulée", color: T.danger };
      case "REMBOURSEE":
        return { label: "Remboursée", color: "#6366F1" };
      default:
        return { label: statut || "Inconnu", color: T.muted };
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
        <Alert
          severity="error"
          sx={{ borderRadius: 2 }}
          action={
            <Button color="inherit" size="small" onClick={fetchInscriptions} startIcon={<Refresh />}>
              Réessayer
            </Button>
          }
        >
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
              color: T.muted,
              textTransform: "none",
              fontWeight: 500,
              mb: 2.5,
              px: 0,
              "&:hover": { color: T.primary, bgcolor: "transparent" },
            }}
          >
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
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            border: `1px solid ${T.border}`,
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher par nom, email ou formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 260,
              "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg },
            }}
            InputProps={{
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
            }}
          />
          <IconButton onClick={fetchInscriptions} sx={{ color: T.muted }}>
            <Refresh />
          </IconButton>
          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
            {filteredInscriptions.length} résultat{filteredInscriptions.length > 1 ? "s" : ""}
          </Typography>
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
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">
                    Montant
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">
                    Statut
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">
                    Date
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                      <School sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600, mb: 0.5 }}>
                        Aucune inscription
                      </Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.875rem" }}>
                        {searchTerm ? "Aucun résultat pour cette recherche" : "Aucune inscription pour le moment"}
                      </Typography>
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
                            <Avatar
                              sx={{
                                width: 38,
                                height: 38,
                                bgcolor: alpha(T.accent, 0.1),
                                color: T.accent,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              {client.prenom?.[0]}
                              {client.nom?.[0]}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem" }}>
                                {client.prenom || "—"} {client.nom || ""}
                              </Typography>
                              <Typography sx={{ color: T.muted, fontSize: "0.75rem" }}>
                                ID #{client.id || "N/A"}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              <Email sx={{ fontSize: 14, color: T.muted }} />
                              <Typography sx={{ fontSize: "0.82rem", color: T.secondary }}>
                                {client.email || "—"}
                              </Typography>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                              <Phone sx={{ fontSize: 14, color: T.muted }} />
                              <Typography sx={{ fontSize: "0.82rem", color: T.secondary }}>
                                {client.telephone || "—"}
                              </Typography>
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
                          <Chip
                            label={statutCfg.label}
                            size="small"
                            sx={{
                              height: 24,
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              bgcolor: alpha(statutCfg.color, 0.12),
                              color: statutCfg.color,
                            }}
                          />
                          {inscription.code_acces && (
                            <Chip
                              label="Code OK"
                              size="small"
                              sx={{
                                height: 22,
                                ml: 0.5,
                                fontWeight: 600,
                                fontSize: "0.65rem",
                                bgcolor: alpha(T.success, 0.12),
                                color: T.success,
                              }}
                            />
                          )}
                        </TableCell>

                        <TableCell align="center">
                          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                            {formatDate(inscription.date_inscription)}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            {inscription.statut === "EN_ATTENTE" && (
                              <>
                                <Tooltip title="Valider">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAction(inscription, "valider")}
                                    sx={{ color: T.success }}
                                  >
                                    <CheckCircle fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Refuser">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleAction(inscription, "refuser")}
                                    sx={{ color: T.danger }}
                                  >
                                    <Cancel fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </>
                            )}
                            {inscription.statut === "PAYEE" && !inscription.code_acces && (
                              <Tooltip title="Générer le code d'accès">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAction(inscription, "generer_code")}
                                  sx={{ color: T.accent }}
                                >
                                  <QrCode fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Tooltip title="Voir le client">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/clients/${client.id}`)}
                                disabled={!client.id}
                                sx={{ color: T.muted }}
                              >
                                <Visibility fontSize="small" />
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredInscriptions.length)} sur{" "}
                {filteredInscriptions.length}
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

        {/* Dialog confirmation */}
        <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ fontWeight: 600, color: T.primary }}>
            {actionType === "valider" && "Valider l'inscription"}
            {actionType === "refuser" && "Refuser l'inscription"}
            {actionType === "generer_code" && "Générer le code d'accès"}
          </DialogTitle>
          <DialogContent>
            {selectedInscription && (
              <DialogContentText sx={{ color: T.secondary }}>
                {actionType === "valider" && (
                  <>
                    Valider l'inscription de{" "}
                    <strong>
                      {selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}
                    </strong>{" "}
                    à la formation{" "}
                    <strong>"{selectedInscription.formation_details?.titre}"</strong> ?
                  </>
                )}
                {actionType === "refuser" && (
                  <>
                    Refuser l'inscription de{" "}
                    <strong>
                      {selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}
                    </strong>{" "}
                    ?
                  </>
                )}
                {actionType === "generer_code" && (
                  <>
                    Un code d'accès va être généré pour{" "}
                    <strong>
                      {selectedInscription.client_details?.prenom} {selectedInscription.client_details?.nom}
                    </strong>
                    .
                  </>
                )}
              </DialogContentText>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setActionDialogOpen(false)} sx={{ textTransform: "none", color: T.muted }}>
              Annuler
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="contained"
              disabled={processing}
              sx={{
                bgcolor: actionType === "refuser" ? T.danger : T.success,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: actionType === "refuser" ? "#B91C1C" : "#047857",
                  boxShadow: "none",
                },
              }}
            >
              {processing ? <CircularProgress size={18} color="inherit" /> : "Confirmer"}
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

export default InscriptionsFormations;