// src/pages/Admin/Formations/FormationsList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar,
  MenuItem, alpha,
} from "@mui/material";
import {
  Add, Search, Edit, Delete, Visibility, Refresh, School, PlayArrow,
  Replay, Schedule, CheckCircle, Clear, AccessTime, Dashboard as DashboardIcon,
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

const FormationsList = () => {
  const navigate = useNavigate();
  const [formations, setFormations] = useState([]);
  const [filteredFormations, setFilteredFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formationToDelete, setFormationToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const statuts = [
    { value: "PROGRAMME", label: "Programmé", color: "#3B82F6", icon: <Schedule sx={{ fontSize: 14 }} /> },
    { value: "LIVE", label: "En direct", color: "#EF4444", icon: <PlayArrow sx={{ fontSize: 14 }} /> },
    { value: "REPLAY", label: "Replay", color: "#F59E0B", icon: <Replay sx={{ fontSize: 14 }} /> },
    { value: "TERMINE", label: "Terminé", color: "#10B981", icon: <CheckCircle sx={{ fontSize: 14 }} /> },
  ];

  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFormations();
      const list = Array.isArray(data) ? data : data.results || [];
      setFormations(list);
      setFilteredFormations(list);
    } catch {
      setError("Impossible de charger les formations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = formations;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (f) => f.titre?.toLowerCase().includes(q) || f.description?.toLowerCase().includes(q)
      );
    }
    if (filterStatut !== "all") {
      result = result.filter((f) => f.statut === filterStatut);
    }
    setFilteredFormations(result);
    setPage(1);
  }, [searchTerm, filterStatut, formations]);

  const getStatutChip = (statut) => {
    const config = statuts.find((s) => s.value === statut);
    if (!config) return <Chip label={statut} size="small" />;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          height: 26,
          fontWeight: 600,
          fontSize: "0.72rem",
          bgcolor: alpha(config.color, 0.12),
          color: config.color,
          "& .MuiChip-icon": { color: config.color },
        }}
      />
    );
  };

  const formatPrice = (price) => {
    if (!price) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteClick = (formation) => {
    setFormationToDelete(formation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!formationToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteFormation(formationToDelete.id);
      setSnackbar({
        open: true,
        message: `Formation "${formationToDelete.titre}" supprimée`,
        severity: "success",
      });
      fetchFormations();
    } catch {
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setFormationToDelete(null);
    }
  };

  const paginated = filteredFormations.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredFormations.length / rowsPerPage);

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
          <Button color="inherit" size="small" onClick={fetchFormations} startIcon={<Refresh />}>Réessayer</Button>
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
                Formations
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
                {formations.length} formation{formations.length > 1 ? "s" : ""}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/formations/nouveau")}
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
              Ajouter une formation
            </Button>
          </Box>
        </Box>

        {/* Filters */}
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
            placeholder="Rechercher une formation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 240,
              "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg },
            }}
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

          <TextField
            select
            size="small"
            label="Statut"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg } }}
          >
            <MenuItem value="all">Tous</MenuItem>
            {statuts.map((s) => (
              <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
            ))}
          </TextField>

          <IconButton onClick={fetchFormations} sx={{ color: T.muted }}>
            <Refresh />
          </IconButton>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.bg }}>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Formation</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Durée</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Prix</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Inscriptions</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <School sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600, mb: 0.5 }}>
                        Aucune formation trouvée
                      </Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.875rem" }}>
                        {searchTerm || filterStatut !== "all"
                          ? "Aucun résultat pour ces critères"
                          : "Ajoutez votre première formation"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((formation) => (
                    <TableRow key={formation.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: T.bg, borderRadius: 1.5 }}
                            src={
                              formation.image
                                ? `${import.meta.env.VITE_MEDIA_URL}${formation.image}`
                                : undefined
                            }
                          >
                            {!formation.image && <School sx={{ color: T.muted }} />}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem" }}>
                              {formation.titre}
                            </Typography>
                            <Typography sx={{ color: T.muted, fontSize: "0.75rem" }}>
                              {formation.description?.substring(0, 45)}
                              {formation.description?.length > 45 ? "…" : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                          <AccessTime sx={{ fontSize: 15, color: T.muted }} />
                          <Typography sx={{ fontSize: "0.875rem", color: T.secondary }}>
                            {formation.duree || "—"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: T.primary }}>
                          {formatPrice(formation.prix)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">{getStatutChip(formation.statut)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={formation.inscriptions_count || 0}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            bgcolor: alpha(T.accent, 0.1),
                            color: T.accent,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/formations/${formation.id}`)}
                            sx={{ color: T.muted }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/formations/${formation.id}/edit`)}
                            sx={{ color: T.muted }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(formation)}
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

          {filteredFormations.length > 0 && (
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
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredFormations.length)} sur{" "}
                {filteredFormations.length}
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
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 2.5 } }}
        >
          <DialogTitle sx={{ fontWeight: 600, color: T.primary }}>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: T.secondary }}>
              Supprimer la formation <strong>"{formationToDelete?.titre}"</strong> ?
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

export default FormationsList;