// src/pages/Admin/Evenements/ParticipantsEvenements.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  Avatar,
  Tooltip,
  Pagination,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
} from "@mui/material";
import {
  ArrowBack,
  Search,
  Visibility,
  Refresh,
  People,
  CheckCircle,
  Cancel,
  Email,
  Phone,
  LocationOn,
  Clear,
  Dashboard as DashboardIcon,
  Delete,
  Info,
  Close,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const ParticipantsEvenements = () => {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Dialogs
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchParticipants();
  }, []);

  const fetchParticipants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getParticipantsEvenements();

      let list = [];
      if (data?.results) {
        list = data.results;
      } else if (Array.isArray(data)) {
        list = data;
      }

      const normalized = list.map((p, index) => {
        const client = p.client_details || {};
        const evenement = p.evenement_details || {};

        return {
          id: p.id || `temp-${index}`,
          date_inscription: p.date_inscription || null,
          statut: p.statut || "INSCRIT",
          notes: p.notes || "",
          client: {
            id: client.id || null,
            nom: client.nom || "",
            prenom: client.prenom || "",
            email: client.email || "",
            telephone: client.telephone || "",
          },
          evenement: {
            id: evenement.id || null,
            titre: evenement.titre || "Événement inconnu",
            lieu: evenement.lieu || "",
            date_debut: evenement.date_debut || null,
          },
        };
      });

      setParticipants(normalized);
      setFilteredParticipants(normalized);
    } catch (err) {
      console.error("❌ Erreur chargement participants:", err);
      setError("Impossible de charger les participants");
      setSnackbar({
        open: true,
        message: "Erreur lors du chargement des participants",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrage
  useEffect(() => {
    let result = [...participants];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((p) => {
        const client = p.client || {};
        const evenement = p.evenement || {};
        return (
          (client.nom || "").toLowerCase().includes(term) ||
          (client.prenom || "").toLowerCase().includes(term) ||
          (client.email || "").toLowerCase().includes(term) ||
          (evenement.titre || "").toLowerCase().includes(term)
        );
      });
    }

    setFilteredParticipants(result);
    setPage(1);
  }, [searchTerm, participants]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return isNaN(date)
      ? "—"
      : date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
  };

  const getInitials = (prenom, nom) => {
    const p = (prenom || "").trim();
    const n = (nom || "").trim();
    if (!p && !n) return "?";
    return `${p.charAt(0)}${n.charAt(0)}`.toUpperCase();
  };

  const getStatutChip = (statut) => {
    switch (statut) {
      case "INSCRIT":
        return { label: "Inscrit", bg: "#E8F5E9", color: "#2E7D32" };
      case "PRESENT":
        return { label: "Présent", bg: "#E3F2FD", color: "#1565C0" };
      case "ABSENT":
        return { label: "Absent", bg: "#FFEBEE", color: "#C62828" };
      case "ANNULE":
        return { label: "Annulé", bg: "#F5F5F5", color: "#757575" };
      default:
        return { label: statut || "Inconnu", bg: "#F5F5F5", color: "#757575" };
    }
  };

  // ===== ACTIONS =====
  const handleOpenDetail = (participant) => {
    setSelectedParticipant(participant);
    setDetailOpen(true);
  };

  const handleOpenDelete = (participant) => {
    setSelectedParticipant(participant);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedParticipant) return;

    setDeleting(true);
    try {
      await adminService.deleteParticipation(selectedParticipant.id);

      // Mise à jour locale
      setParticipants((prev) =>
        prev.filter((p) => p.id !== selectedParticipant.id)
      );

      setSnackbar({
        open: true,
        message: "Participant supprimé avec succès",
        severity: "success",
      });
      setDeleteOpen(false);
      setSelectedParticipant(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
      setSnackbar({
        open: true,
        message: "Erreur lors de la suppression",
        severity: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const paginated = filteredParticipants.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredParticipants.length / rowsPerPage)
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress sx={{ color: "#111" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchParticipants}
              startIcon={<Refresh />}
            >
              Réessayer
            </Button>
          }
          sx={{ borderRadius: 1 }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* En-tête */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              borderColor: "#E0E0E0",
              color: "#555",
              borderRadius: 1,
              textTransform: "none",
              fontWeight: 500,
            }}
          >
            Dashboard
          </Button>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{ color: "#666", textTransform: "none" }}
          >
            Retour
          </Button>
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            color: "#111",
            fontFamily: '"Playfair Display", serif',
            fontSize: { xs: "1.6rem", md: "1.9rem" },
          }}
        >
          Participants aux événements
        </Typography>
        <Typography variant="body2" sx={{ color: "#777", mt: 0.5 }}>
          {filteredParticipants.length} participant
          {filteredParticipants.length > 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          {
            label: "Total",
            value: participants.length,
            icon: <People />,
            color: "#111",
          },
          {
            label: "Inscrits",
            value: participants.filter((p) => p.statut === "INSCRIT").length,
            icon: <CheckCircle />,
            color: "#2E7D32",
          },
          {
            label: "Présents",
            value: participants.filter((p) => p.statut === "PRESENT").length,
            icon: <CheckCircle />,
            color: "#1565C0",
          },
          {
            label: "Absents / Annulés",
            value: participants.filter((p) =>
              ["ABSENT", "ANNULE"].includes(p.statut)
            ).length,
            icon: <Cancel />,
            color: "#C62828",
          },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 1.5,
                border: "1px solid #EEE",
                height: "100%",
              }}
            >
              <CardContent sx={{ py: 2, "&:last-child": { pb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{ color: "#888", fontWeight: 500 }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#111", mt: 0.3 }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}14`,
                      color: stat.color,
                      width: 40,
                      height: 40,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Recherche */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 1.5,
          border: "1px solid #EEE",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <TextField
            size="small"
            placeholder="Rechercher par nom, email, événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: 420,
              "& .MuiOutlinedInput-root": {
                borderRadius: 1,
                backgroundColor: "#FAFAFA",
              },
            }}
            SlotProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#BBB", fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm("")}>
                    <Clear sx={{ fontSize: 18, color: "#BBB" }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />
          <IconButton onClick={fetchParticipants} sx={{ color: "#666" }}>
            <Refresh />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: "#888" }}>
            {filteredParticipants.length} résultat
            {filteredParticipants.length > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Paper>

      {/* Tableau */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 1.5,
          border: "1px solid #EEE",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#FAFAFA" }}>
                <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Participant
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Contact
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Événement
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Statut
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Date d'inscription
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, color: "#333", fontSize: "0.85rem" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                    <People sx={{ fontSize: 48, color: "#DDD", mb: 1.5 }} />
                    <Typography sx={{ color: "#666", fontWeight: 500 }}>
                      Aucun participant trouvé
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#999", mt: 0.5 }}>
                      {searchTerm
                        ? "Aucun résultat pour cette recherche"
                        : "Aucune inscription pour le moment"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((participant) => {
                  const client = participant.client || {};
                  const evenement = participant.evenement || {};
                  const statutStyle = getStatutChip(participant.statut);

                  return (
                    <TableRow key={participant.id} hover>
                      {/* Participant */}
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 38,
                              height: 38,
                              bgcolor: "#E8F5E9",
                              color: "#2E7D32",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                            }}
                          >
                            {getInitials(client.prenom, client.nom)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#111" }}>
                              {client.prenom} {client.nom || "—"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#999" }}>
                              #{client.id || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Contact */}
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Email sx={{ fontSize: 14, color: "#BBB" }} />
                            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                              {client.email || "—"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <Phone sx={{ fontSize: 14, color: "#BBB" }} />
                            <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                              {client.telephone || "—"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      {/* Événement */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#111", mb: 0.3 }}>
                          {evenement.titre}
                        </Typography>
                        {evenement.lieu && (
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#888",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.3,
                            }}
                          >
                            <LocationOn sx={{ fontSize: 12 }} />
                            {evenement.lieu}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Statut */}
                      <TableCell align="center">
                        <Chip
                          label={statutStyle.label}
                          size="small"
                          sx={{
                            bgcolor: statutStyle.bg,
                            color: statutStyle.color,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            height: 24,
                          }}
                        />
                      </TableCell>

                      {/* Date */}
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: "#666" }}>
                          {formatDate(participant.date_inscription)}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="Voir les détails">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetail(participant)}
                              sx={{ color: "#1565C0" }}
                            >
                              <Info fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="Supprimer">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDelete(participant)}
                              sx={{ color: "#C62828" }}
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

        {filteredParticipants.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              borderTop: "1px solid #EEE",
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 1,
                  "&.Mui-selected": {
                    backgroundColor: "#111",
                    color: "#fff",
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ===== DIALOG DÉTAILS ===== */}
      <Dialog
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        maxWidth="sm"
        fullWidth
        SlotProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Détails du participant
          </Typography>
          <IconButton onClick={() => setDetailOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {selectedParticipant && (
            <Box>
              {/* Participant */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: "#E8F5E9",
                    color: "#2E7D32",
                    fontSize: "1.2rem",
                    fontWeight: 600,
                  }}
                >
                  {getInitials(
                    selectedParticipant.client?.prenom,
                    selectedParticipant.client?.nom
                  )}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedParticipant.client?.prenom}{" "}
                    {selectedParticipant.client?.nom}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ID Client : #{selectedParticipant.client?.id || "N/A"}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedParticipant.client?.email || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Téléphone
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedParticipant.client?.telephone || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">
                    Événement
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedParticipant.evenement?.titre || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Lieu
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {selectedParticipant.evenement?.lieu || "—"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Date d'inscription
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(selectedParticipant.date_inscription)}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">
                    Statut
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={getStatutChip(selectedParticipant.statut).label}
                      size="small"
                      sx={{
                        bgcolor: getStatutChip(selectedParticipant.statut).bg,
                        color: getStatutChip(selectedParticipant.statut).color,
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Grid>

                {selectedParticipant.notes && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {selectedParticipant.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetailOpen(false)} sx={{ textTransform: "none" }}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== DIALOG SUPPRESSION ===== */}
      <Dialog
        open={deleteOpen}
        onClose={() => !deleting && setDeleteOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer la participation de{" "}
            <strong>
              {selectedParticipant?.client?.prenom}{" "}
              {selectedParticipant?.client?.nom}
            </strong>{" "}
            à l'événement{" "}
            <strong>{selectedParticipant?.evenement?.titre}</strong> ?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setDeleteOpen(false)}
            disabled={deleting}
            sx={{ textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={16} color="inherit" /> : <Delete />}
            sx={{ textTransform: "none" }}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: 1 }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ParticipantsEvenements;