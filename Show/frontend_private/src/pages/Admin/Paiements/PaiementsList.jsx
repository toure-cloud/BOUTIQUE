import { logger } from '../../../lib/logger';
// src/pages/Admin/Paiements/PaiementsList.jsx
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
  Card,
  CardContent,
  Grid,
  Avatar,
  Tooltip,
  Pagination,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Search,
  Refresh,
  People,
  AttachMoney,
  CheckCircle,
  Cancel,
  Pending,
  Clear,
  Dashboard as DashboardIcon,
  Receipt,
  Visibility,
  Print,
  FilterList,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

const PaiementsList = () => {
  const navigate = useNavigate();
  const [paiements, setPaiements] = useState([]);
  const [filteredPaiements, setFilteredPaiements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const statuts = [
    { value: "all", label: "Tous" },
    { value: "EN_ATTENTE", label: "En attente" },
    { value: "REUSSI", label: "Réussi" },
    { value: "ECHOUE", label: "Échoué" },
    { value: "ANNULE", label: "Annulé" },
    { value: "REMBOURSE", label: "Remboursé" },
  ];

  useEffect(() => {
    fetchPaiements();
  }, []);

  const fetchPaiements = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Utiliser la route correcte
      const data = await adminService.getPaiements();
      logger.log("📋 Paiements reçus:", data);

      const paiementsList = Array.isArray(data) ? data : data.results || [];
      setPaiements(paiementsList);
      setFilteredPaiements(paiementsList);
    } catch (err) {
      logger.error("❌ Erreur:", err);
      setError("Impossible de charger les paiements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = paiements;

    if (searchTerm) {
      result = result.filter(
        (p) =>
          p.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatut !== "all") {
      result = result.filter((p) => p.statut === filterStatut);
    }

    setFilteredPaiements(result);
    setPage(1);
  }, [searchTerm, filterStatut, paiements]);

  const formatPrice = (price) => {
    if (!price) return "0 CFA";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatutChip = (statut) => {
    const configs = {
      EN_ATTENTE: {
        label: "En attente",
        color: "#F59E0B",
        icon: <Pending sx={{ fontSize: 14 }} />,
      },
      REUSSI: {
        label: "Réussi",
        color: "#10B981",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
      },
      ECHOUE: {
        label: "Échoué",
        color: "#EF4444",
        icon: <Cancel sx={{ fontSize: 14 }} />,
      },
      ANNULE: {
        label: "Annulé",
        color: "#6B7280",
        icon: <Cancel sx={{ fontSize: 14 }} />,
      },
      REMBOURSE: {
        label: "Remboursé",
        color: "#3B82F6",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
      },
    };
    const config = configs[statut] || configs.EN_ATTENTE;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        size="small"
        sx={{
          bgcolor: `${config.color}20`,
          color: config.color,
          fontWeight: 600,
        }}
      />
    );
  };

  const paginatedPaiements = filteredPaiements.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const totalPages = Math.ceil(filteredPaiements.length / rowsPerPage);

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
          Chargement des paiements...
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
              onClick={fetchPaiements}
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

  const totalMontant = filteredPaiements
    .filter((p) => p.statut === "REUSSI")
    .reduce((acc, p) => acc + parseFloat(p.montant || 0), 0);

  return (
    <Container maxWidth="lg">
      {/* ===== EN-TÊTE ===== */}
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
              Gestion des paiements
            </Typography>
            <Typography variant="body2" sx={{ color: "#666666", mt: 0.5 }}>
              {filteredPaiements.length} paiement
              {filteredPaiements.length > 1 ? "s" : ""}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ===== STATISTIQUES ===== */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          {
            label: "Total paiements",
            value: filteredPaiements.length,
            icon: <Receipt />,
            color: "#2C2C2C",
          },
          {
            label: "En attente",
            value: filteredPaiements.filter((p) => p.statut === "EN_ATTENTE")
              .length,
            icon: <Pending />,
            color: "#F59E0B",
          },
          {
            label: "Réussis",
            value: filteredPaiements.filter((p) => p.statut === "REUSSI")
              .length,
            icon: <CheckCircle />,
            color: "#10B981",
          },
          {
            label: "Montant total",
            value: formatPrice(totalMontant),
            icon: <AttachMoney />,
            color: "#6366F1",
          },
        ].map((stat, index) => (
          <Grid item xs={6} sm={3} key={`stat-${index}`}>
            {" "}
            {/* ✅ Clé unique */}
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
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

          <FormControl size="small" sx={{ minWidth: "150px" }}>
            <InputLabel>Statut</InputLabel>
            <Select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              label="Statut"
              sx={{ borderRadius: "50px" }}
            >
              {statuts.map((s) => (
                <MenuItem key={`statut-${s.value}`} value={s.value}>
                  {" "}
                  {/* ✅ Clé unique */}
                  {s.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton onClick={fetchPaiements} sx={{ color: "#666666" }}>
            <Refresh />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: "#999999" }}>
            {filteredPaiements.length} résultat
            {filteredPaiements.length > 1 ? "s" : ""}
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
                  Référence
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                >
                  Client
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                  align="right"
                >
                  Montant
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    color: "#2C2C2C",
                    fontSize: "0.85rem",
                  }}
                >
                  Moyen paiement
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
                  align="center"
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedPaiements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Receipt sx={{ fontSize: 48, color: "#BDBDBD", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "#666666", mb: 1 }}>
                        Aucun paiement
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#999999" }}>
                        {searchTerm || filterStatut !== "all"
                          ? "Aucun paiement ne correspond à vos critères"
                          : "Aucun paiement enregistré"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPaiements.map(
                  (
                    paiement,
                    index, // ✅ Utiliser index comme fallback
                  ) => (
                    <TableRow
                      key={paiement.id || `paiement-${index}`} // ✅ Clé unique
                      hover
                      sx={{ "&:hover": { bgcolor: "#F8F8F8" } }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: "#2C2C2C" }}
                        >
                          {paiement.reference || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 500, color: "#2C2C2C" }}
                          >
                            {paiement.client_nom || "Client inconnu"}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "#999999" }}
                          >
                            {paiement.client_email || "Email non renseigné"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: "#2C2C2C" }}
                        >
                          {formatPrice(paiement.montant)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#666666" }}>
                          {paiement.moyen_paiement_nom || "Non spécifié"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStatutChip(paiement.statut)}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: "#666666" }}>
                          {paiement.date_creation
                            ? new Date(
                                paiement.date_creation,
                              ).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "N/A"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ),
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredPaiements.length > 0 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              p: 2,
              borderTop: "1px solid #F0F0F0",
            }}
          >
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: "8px",
                  "&.Mui-selected": {
                    bgcolor: "#2C2C2C",
                    color: "#FFFFFF",
                  },
                },
              }}
            />
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaiementsList;
