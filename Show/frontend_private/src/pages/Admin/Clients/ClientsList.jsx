// src/pages/Admin/Clients/ClientsList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar, alpha,
} from "@mui/material";
import {
  Add, Search, Edit, Delete, Visibility, Refresh, People, Email, Phone,
  Clear, Dashboard as DashboardIcon,
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

const ClientsList = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getClients();
      const list = Array.isArray(data) ? data : data.results || [];
      setClients(list);
      setFilteredClients(list);
    } catch (err) {
      setError("Impossible de charger les clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = clients;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.nom?.toLowerCase().includes(q) ||
          c.prenom?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.telephone?.includes(searchTerm)
      );
    }
    setFilteredClients(result);
    setPage(1);
  }, [searchTerm, clients]);

  const handleDeleteClick = (client) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!clientToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteClient(clientToDelete.id);
      setSnackbar({
        open: true,
        message: `Client "${clientToDelete.prenom} ${clientToDelete.nom}" supprimé`,
        severity: "success",
      });
      fetchClients();
    } catch {
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setClientToDelete(null);
    }
  };

  const paginatedClients = filteredClients.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredClients.length / rowsPerPage);

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
            <Button color="inherit" size="small" onClick={fetchClients} startIcon={<Refresh />}>
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

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.6rem", letterSpacing: -0.4 }}>
                Clients
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
                {clients.length} client{clients.length > 1 ? "s" : ""} au total
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/clients/nouveau")}
              sx={{
                bgcolor: T.primary,
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.1,
                boxShadow: "none",
                "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
              }}
            >
              Ajouter un client
            </Button>
          </Box>
        </Box>

        {/* Search bar */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            border: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher par nom, email ou téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 260,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: T.bg,
                "& fieldset": { borderColor: T.border },
              },
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
          <IconButton onClick={fetchClients} sx={{ color: T.muted }}>
            <Refresh />
          </IconButton>
          <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
            {filteredClients.length} résultat{filteredClients.length > 1 ? "s" : ""}
          </Typography>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.bg }}>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Client</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Téléphone</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">
                    Statut
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="right">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <People sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600, mb: 0.5 }}>
                        Aucun client trouvé
                      </Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.875rem" }}>
                        {searchTerm ? "Essayez un autre terme de recherche" : "Ajoutez votre premier client"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedClients.map((client) => (
                    <TableRow key={client.id} hover sx={{ "&:hover": { bgcolor: alpha(T.accent, 0.02) } }}>
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
                              {client.prenom} {client.nom}
                            </Typography>
                            <Typography sx={{ color: T.muted, fontSize: "0.75rem" }}>
                              {client.created_at
                                ? `Inscrit le ${new Date(client.created_at).toLocaleDateString("fr-FR")}`
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Email sx={{ fontSize: 15, color: T.muted }} />
                          <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                            {client.email || "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                          <Phone sx={{ fontSize: 15, color: T.muted }} />
                          <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                            {client.telephone || "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={client.user ? "Inscrit" : "Invité"}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor: client.user ? alpha(T.success, 0.1) : alpha(T.warning, 0.1),
                            color: client.user ? T.success : T.warning,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/clients/${client.id}`)}
                            sx={{ color: T.muted }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/clients/${client.id}/edit`)}
                            sx={{ color: T.muted }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(client)}
                            sx={{ color: T.danger }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredClients.length > 0 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                p: 2,
                borderTop: `1px solid ${T.border}`,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredClients.length)} sur{" "}
                {filteredClients.length}
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

        {/* Dialog suppression */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} PaperProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ fontWeight: 600, color: T.primary }}>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: T.secondary }}>
              Supprimer le client <strong>{clientToDelete?.prenom} {clientToDelete?.nom}</strong> ?  
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", color: T.muted }}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              variant="contained"
              disabled={deleting}
              sx={{
                bgcolor: T.danger,
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "none",
                "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
              }}
            >
              {deleting ? <CircularProgress size={18} color="inherit" /> : "Supprimer"}
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

export default ClientsList;