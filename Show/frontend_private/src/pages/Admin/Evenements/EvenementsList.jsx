import { logger } from '../../../lib/logger';
// src/pages/Admin/Evenements/EvenementsList.jsx
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
  Menu,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import {
  Add,
  Search,
  Edit,
  Delete,
  MoreVert,
  Visibility,
  Refresh,
  Event,
  LocationOn,
  People,
  CalendarToday,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
  FilterList,
  Clear,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const EvenementsList = () => {
  const navigate = useNavigate();
  const [evenements, setEvenements] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(6);
  const [filterStatut, setFilterStatut] = useState("all");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchEvenements();
  }, []);

  const fetchEvenements = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getEvenements();
      const eventsList = Array.isArray(data) ? data : data.results || [];
      setEvenements(eventsList);
      setFilteredEvents(eventsList);
    } catch (err) {
      logger.error("❌ Erreur:", err);
      setError("Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = evenements;

    if (searchTerm) {
      result = result.filter(
        (e) =>
          e.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.theme?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.lieu?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatut !== "all") {
      result = result.filter((e) => e.statut === filterStatut);
    }

    setFilteredEvents(result);
    setPage(1);
  }, [searchTerm, filterStatut, evenements]);

  const handleMenuOpen = (event, evenement) => {
    setAnchorEl(event.currentTarget);
    setSelectedEvent(evenement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedEvent(null);
  };

  const handleDeleteClick = (evenement) => {
    setEventToDelete(evenement);
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;

    setDeleting(true);
    try {
      await adminService.deleteEvenement(eventToDelete.id);
      setSnackbar({
        open: true,
        message: `✅ Événement "${eventToDelete.titre}" supprimé avec succès`,
        severity: "success",
      });
      fetchEvenements();
    } catch (err) {
      logger.error("❌ Erreur suppression:", err);
      setSnackbar({
        open: true,
        message: "❌ Erreur lors de la suppression",
        severity: "error",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const getStatutColor = (statut) => {
    const colors = {
      A_VENIR: {
        bg: "#E3F2FD",
        color: "#0D47A1",
        icon: <Pending sx={{ fontSize: 14 }} />,
        label: "À venir",
      },
      EN_COURS: {
        bg: "#E8F5E9",
        color: "#1B5E20",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
        label: "En cours",
      },
      TERMINE: {
        bg: "#F5F5F5",
        color: "#616161",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
        label: "Terminé",
      },
      ANNULE: {
        bg: "#FFEBEE",
        color: "#C62828",
        icon: <Cancel sx={{ fontSize: 14 }} />,
        label: "Annulé",
      },
    };
    return colors[statut] || colors.A_VENIR;
  };

  const getStatutIcon = (statut) => {
    const icons = {
      A_VENIR: <Pending sx={{ fontSize: 16 }} />,
      EN_COURS: <CheckCircle sx={{ fontSize: 16 }} />,
      TERMINE: <CheckCircle sx={{ fontSize: 16 }} />,
      ANNULE: <Cancel sx={{ fontSize: 16 }} />,
    };
    return icons[statut] || <Pending sx={{ fontSize: 16 }} />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const totalPages = Math.ceil(filteredEvents.length / rowsPerPage);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "#2C2C2C" }} />
        <Typography variant="body2" sx={{ color: "#666666" }}>
          Chargement des événements...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ borderRadius: "12px" }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={fetchEvenements}
              startIcon={<Refresh />}
            >
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
    <Container maxWidth="lg">
      {/* ===== EN-TÊTE AVEC BOUTON DASHBOARD ===== */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<DashboardIcon />}
            onClick={() => navigate("/admin/dashboard")}
            sx={{
              borderColor: "#E0E0E0",
              color: "#666666",
              borderRadius: "50px",
              textTransform: "none",
              fontWeight: 500,
              "&:hover": {
                borderColor: "#2C2C2C",
                color: "#2C2C2C",
                bgcolor: "rgba(44,44,44,0.04)",
              },
              px: 2.5,
            }}
          >
            Dashboard
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#2C2C2C",
                fontFamily: '"Playfair Display", serif',
              }}
            >
              Gestion des événements
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mt: 0.5 }}>
              {evenements.length} événement{evenements.length > 1 ? "s" : ""} au
              total
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => navigate("/admin/evenements/nouveau")}
            sx={{
              bgcolor: "#2C2C2C",
              color: "#FFFFFF",
              "&:hover": { bgcolor: "#1A1A1A" },
              borderRadius: "50px",
              px: 4,
            }}
          >
            Créer un événement
          </Button>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: "Total",
            value: evenements.length,
            icon: <Event />,
            color: "#2C2C2C",
          },
          {
            label: "À venir",
            value: evenements.filter((e) => e.statut === "A_VENIR").length,
            icon: <Pending />,
            color: "#1976D2",
          },
          {
            label: "En cours",
            value: evenements.filter((e) => e.statut === "EN_COURS").length,
            icon: <CheckCircle />,
            color: "#2E7D32",
          },
          {
            label: "Terminés",
            value: evenements.filter((e) => e.statut === "TERMINE").length,
            icon: <CheckCircle />,
            color: "#616161",
          },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Card
              sx={{
                borderRadius: "16px",
                border: "1px solid #F0F0F0",
                boxShadow: "none",
              }}
            >
              <CardContent>
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
                      sx={{ color: "#999999", fontWeight: 500 }}
                    >
                      {stat.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, color: "#2C2C2C", mt: 0.5 }}
                    >
                      {stat.value}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`,
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

      {/* ===== FILTRES ===== */}
      <Paper
        sx={{
          p: 2,
          mb: 3,
          borderRadius: "16px",
          border: "1px solid #F0F0F0",
          boxShadow: "none",
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
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flexGrow: 1,
              maxWidth: "400px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                bgcolor: "#F8F8F8",
              },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#BDBDBD" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            select
            size="small"
            label="Filtrer par statut"
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            sx={{
              minWidth: "150px",
              "& .MuiOutlinedInput-root": { borderRadius: "50px" },
            }}
            SelectProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterList sx={{ color: "#BDBDBD", fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="A_VENIR">À venir</MenuItem>
            <MenuItem value="EN_COURS">En cours</MenuItem>
            <MenuItem value="TERMINE">Terminés</MenuItem>
            <MenuItem value="ANNULE">Annulés</MenuItem>
          </TextField>

          <IconButton onClick={fetchEvenements} sx={{ color: "#666666" }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: "#999999" }}>
            {filteredEvents.length} résultat
            {filteredEvents.length > 1 ? "s" : ""}
          </Typography>
        </Box>
      </Paper>

      {/* ===== TABLEAU ===== */}
      <Paper
        sx={{
          borderRadius: "16px",
          border: "1px solid #F0F0F0",
          boxShadow: "none",
          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8F8F8" }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                >
                  Événement
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                >
                  Thème
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                  align="center"
                >
                  Places
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                  align="center"
                >
                  Statut
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                  align="right"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Event sx={{ fontSize: 48, color: "#BDBDBD", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "#666666", mb: 1 }}>
                        Aucun événement trouvé
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#999999" }}>
                        {searchTerm || filterStatut !== "all"
                          ? "Aucun événement ne correspond à vos critères"
                          : "Commencez par créer votre premier événement"}
                      </Typography>
                      {!searchTerm && filterStatut === "all" && (
                        <Button
                          variant="contained"
                          startIcon={<Add />}
                          onClick={() => navigate("/admin/evenements/nouveau")}
                          sx={{
                            mt: 3,
                            bgcolor: "#2C2C2C",
                            color: "#FFFFFF",
                            borderRadius: "50px",
                          }}
                        >
                          Créer un événement
                        </Button>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEvents.map((evenement) => {
                  const statutStyle = getStatutColor(evenement.statut);
                  const placesDisponibles = evenement.places_restantes || 0;
                  const placesTotal = evenement.places_total || 0;
                  const pourcentage =
                    placesTotal > 0
                      ? (placesDisponibles / placesTotal) * 100
                      : 0;

                  return (
                    <TableRow
                      key={evenement.id}
                      hover
                      sx={{ "&:hover": { bgcolor: "#F8F8F8" } }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 2 }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              borderRadius: "12px",
                              bgcolor: "#F5F5F5",
                            }}
                          >
                            {evenement.image ? (
                              <img
                                src={`${import.meta.env.VITE_MEDIA_URL}${evenement.image}`}
                                alt={evenement.titre}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <Event fontSize="small" />
                            )}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, color: "#2C2C2C" }}
                            >
                              {evenement.titre}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#999999" }}
                            >
                              {evenement.lieu}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={evenement.theme}
                          size="small"
                          sx={{
                            bgcolor: "#F5F5F5",
                            color: "#666666",
                            fontSize: "0.7rem",
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: "#2C2C2C" }}
                          >
                            {placesDisponibles}/{placesTotal}
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={pourcentage}
                            sx={{
                              width: "80px",
                              height: 4,
                              borderRadius: 2,
                              bgcolor: "#F0F0F0",
                              "& .MuiLinearProgress-bar": {
                                bgcolor:
                                  pourcentage > 50
                                    ? "#66BB6A"
                                    : pourcentage > 25
                                      ? "#FFA726"
                                      : "#EF5350",
                              },
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column" }}>
                          <Typography
                            variant="caption"
                            sx={{ color: "#666666", fontWeight: 500 }}
                          >
                            {formatDate(evenement.date_debut)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#999999" }}
                          >
                            Jusqu'au{" "}
                            {new Date(evenement.date_fin).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          icon={getStatutIcon(evenement.statut)}
                          label={statutStyle.label}
                          size="small"
                          sx={{
                            bgcolor: statutStyle.bg,
                            color: statutStyle.color,
                            fontWeight: 600,
                            fontSize: "0.7rem",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/admin/evenements/${evenement.id}`)
                            }
                            sx={{ color: "#666666" }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() =>
                              navigate(`/admin/evenements/${evenement.id}/edit`)
                            }
                            sx={{ color: "#666666" }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(evenement)}
                            sx={{ color: "#EF5350" }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredEvents.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderTop: "1px solid #F0F0F0",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body2" sx={{ color: "#999999" }}>
              Affichage de {(page - 1) * rowsPerPage + 1} à{" "}
              {Math.min(page * rowsPerPage, filteredEvents.length)} sur{" "}
              {filteredEvents.length}
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "8px",
                  "&.Mui-selected": { bgcolor: "#2C2C2C", color: "#FFFFFF" },
                },
              }}
            />
          </Box>
        )}
      </Paper>

      {/* ===== DIALOG SUPPRESSION ===== */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="md"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: "16px", p: 1 } } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#2C2C2C" }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#666666" }}>
            Êtes-vous sûr de vouloir supprimer l'événement{" "}
            <strong>"{eventToDelete?.titre}"</strong> ?<br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: "8px", textTransform: "none" }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            disabled={deleting}
            sx={{
              bgcolor: "#EF5350",
              "&:hover": { bgcolor: "#C62828" },
              borderRadius: "8px",
              textTransform: "none",
            }}
          >
            {deleting ? (
              <CircularProgress size={20} sx={{ color: "#FFFFFF" }} />
            ) : (
              "Supprimer"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===== SNACKBAR ===== */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ borderRadius: "12px", width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EvenementsList;
