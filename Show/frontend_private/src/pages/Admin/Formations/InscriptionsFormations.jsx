// src/pages/Admin/Formations/InscriptionsFormations.jsx
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
  Snackbar,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  alpha,
} from "@mui/material";
import {
  ArrowBack,
  Search,
  Visibility,
  Refresh,
  School,
  CheckCircle,
  Pending,
  Cancel,
  Clear,
  Dashboard as DashboardIcon,
  Email,
  Phone,
  QrCode,
  AttachMoney,
} from "@mui/icons-material";
import { adminService } from "../../../services/adminService";

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
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getInscriptionsFormations();
      console.log("📋 Inscriptions formations reçues:", data);

      // ✅ Extraire les résultats
      let inscriptionsList = [];
      if (data && data.results) {
        inscriptionsList = data.results;
      } else if (Array.isArray(data)) {
        inscriptionsList = data;
      }

      // ✅ Filtrer les inscriptions sans client
      inscriptionsList = inscriptionsList.filter((ins) => ins.client !== null);

      console.log("📋 Inscriptions après filtrage:", inscriptionsList);

      setInscriptions(inscriptionsList);
      setFilteredInscriptions(inscriptionsList);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError("Impossible de charger les inscriptions");
      setSnackbar({
        open: true,
        message: "❌ Erreur lors du chargement des inscriptions",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = inscriptions;
    if (searchTerm) {
      result = result.filter((ins) => {
        const client = ins.client_details || {};
        const formation = ins.formation_details || {};
        return (
          client.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          formation.titre?.toLowerCase().includes(searchTerm.toLowerCase())
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
      const inscription = selectedInscription;
      if (actionType === "valider") {
        await adminService.updateInscription(inscription.id, {
          statut: "PAYEE",
        });
        setSnackbar({
          open: true,
          message: `✅ Inscription validée pour ${inscription.client_details?.prenom || ""} ${inscription.client_details?.nom || ""}`,
          severity: "success",
        });
      } else if (actionType === "generer_code") {
        const code =
          "ACCES-" + Math.random().toString(36).substring(2, 10).toUpperCase();
        await adminService.genererCodeAcces(inscription.id, { code });
        setSnackbar({
          open: true,
          message: `✅ Code d'accès généré : ${code}`,
          severity: "success",
        });
      } else if (actionType === "refuser") {
        await adminService.updateInscription(inscription.id, {
          statut: "ANNULEE",
        });
        setSnackbar({
          open: true,
          message: `❌ Inscription refusée pour ${inscription.client_details?.prenom || ""} ${inscription.client_details?.nom || ""}`,
          severity: "warning",
        });
      }
      setActionDialogOpen(false);
      fetchInscriptions();
    } catch (err) {
      console.error("Erreur:", err);
      setSnackbar({
        open: true,
        message: "❌ Erreur lors de l'action",
        severity: "error",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date inconnue";
    try {
      return new Date(dateString).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Date inconnue";
    }
  };

  const getInitials = (prenom, nom) => {
    if (!prenom && !nom) return "?";
    return `${(prenom || "")[0]}${(nom || "")[0]}`.toUpperCase();
  };

  const getStatutColor = (statut) => {
    switch (statut) {
      case "EN_ATTENTE":
        return { bg: alpha("#F59E0B", 0.12), color: "#F59E0B", label: "⏳ En attente" };
      case "PAYEE":
        return { bg: alpha("#10B981", 0.12), color: "#10B981", label: "✅ Payée" };
      case "ANNULEE":
        return { bg: alpha("#EF4444", 0.12), color: "#EF4444", label: "❌ Annulée" };
      case "REMBOURSEE":
        return { bg: alpha("#6366F1", 0.12), color: "#6366F1", label: "🔄 Remboursée" };
      default:
        return { bg: alpha("#94A3B8", 0.12), color: "#94A3B8", label: statut || "Inconnu" };
    }
  };

  const paginatedInscriptions = filteredInscriptions.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage,
  );

  const totalPages = Math.ceil(filteredInscriptions.length / rowsPerPage);

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
        <Alert severity="error" sx={{ borderRadius: "12px" }} action={<Button color="inherit" size="small" onClick={fetchInscriptions} startIcon={<Refresh />}>Réessayer</Button>}>
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
          Inscriptions aux formations
        </Typography>
        <Typography variant="body2" sx={{ color: "#666666", mt: 0.5 }}>
          {filteredInscriptions.length} inscription{filteredInscriptions.length > 1 ? "s" : ""}
        </Typography>
      </Box>

      {/* Statistiques */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: "Total inscriptions", value: inscriptions.length, icon: <School />, color: "#2C2C2C" },
          { label: "En attente", value: inscriptions.filter((i) => i.statut === "EN_ATTENTE").length, icon: <Pending />, color: "#F59E0B" },
          { label: "Payées", value: inscriptions.filter((i) => i.statut === "PAYEE").length, icon: <CheckCircle />, color: "#2E7D32" },
          { label: "Annulées", value: inscriptions.filter((i) => i.statut === "ANNULEE").length, icon: <Cancel />, color: "#EF4444" },
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

      {/* Recherche */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: "16px", border: "1px solid #F0F0F0" }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            size="small"
            placeholder="Rechercher par nom, email, formation..."
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
          <IconButton onClick={fetchInscriptions} sx={{ color: "#666666" }}><Refresh /></IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Typography variant="caption" sx={{ color: "#999999" }}>{filteredInscriptions.length} résultat{filteredInscriptions.length > 1 ? "s" : ""}</Typography>
        </Box>
      </Paper>

      {/* Tableau */}
      <Paper sx={{ borderRadius: "16px", border: "1px solid #F0F0F0", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F8F8F8" }}>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Client</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }}>Formation</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }} align="center">Montant</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }} align="center">Statut</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }} align="center">Date</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#2C2C2C" }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedInscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <School sx={{ fontSize: 48, color: "#BDBDBD", mb: 2 }} />
                      <Typography variant="h6" sx={{ color: "#666666" }}>Aucune inscription</Typography>
                      <Typography variant="body2" sx={{ color: "#999999" }}>{searchTerm ? "Aucune inscription ne correspond à votre recherche" : "Aucune inscription pour le moment"}</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedInscriptions.map((inscription, index) => {
                  // ✅ Utiliser les données enrichies du backend
                  const client = inscription.client_details || {};
                  const formation = inscription.formation_details || {};

                  return (
                    <TableRow key={inscription.id || `inscription-${index}`} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40, bgcolor: client.id ? "#E8F5E9" : "#FFF3E0", color: client.id ? "#2E7D32" : "#F57C00" }}>
                            {getInitials(client.prenom, client.nom)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#2C2C2C" }}>
                              {client.prenom || "Prénom non renseigné"} {client.nom || "Nom non renseigné"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#999999" }}>
                              ID: #{client.id || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Email sx={{ fontSize: 14, color: "#BDBDBD" }} />
                            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{client.email || "Email non renseigné"}</Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Phone sx={{ fontSize: 14, color: "#BDBDBD" }} />
                            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>{client.telephone || "Téléphone non renseigné"}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: "#2C2C2C" }}>{formation.titre || "Formation inconnue"}</Typography>
                          <Typography variant="caption" sx={{ color: "#999999" }}>ID: #{formation.id || "N/A"}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 700, color: "#2C2C2C" }}>{inscription.montant || formation.prix || 0} CFA</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={getStatutColor(inscription.statut).label} size="small" sx={{ bgcolor: getStatutColor(inscription.statut).bg, color: getStatutColor(inscription.statut).color, fontWeight: 600 }} />
                        {inscription.code_acces && (
                          <Chip label="🔑 Code" size="small" sx={{ bgcolor: alpha("#6366F1", 0.12), color: "#6366F1", fontWeight: 600, fontSize: "0.6rem", ml: 0.5 }} />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="caption" sx={{ color: "#666666" }}>{formatDate(inscription.date_inscription)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          {inscription.statut === "EN_ATTENTE" && (
                            <>
                              <Tooltip title="Valider l'inscription">
                                <IconButton size="small" onClick={() => handleAction(inscription, "valider")} sx={{ color: "#10B981" }}><CheckCircle fontSize="small" /></IconButton>
                              </Tooltip>
                              <Tooltip title="Refuser l'inscription">
                                <IconButton size="small" onClick={() => handleAction(inscription, "refuser")} sx={{ color: "#EF4444" }}><Cancel fontSize="small" /></IconButton>
                              </Tooltip>
                            </>
                          )}
                          {inscription.statut === "PAYEE" && !inscription.code_acces && (
                            <Tooltip title="Générer le code d'accès">
                              <IconButton size="small" onClick={() => handleAction(inscription, "generer_code")} sx={{ color: "#6366F1" }}><QrCode fontSize="small" /></IconButton>
                            </Tooltip>
                          )}
                          {inscription.code_acces && (
                            <Tooltip title={`Code: ${inscription.code_acces.code || "N/A"}`}>
                              <Chip label="🔑 OK" size="small" sx={{ bgcolor: alpha("#10B981", 0.12), color: "#10B981", fontWeight: 600, fontSize: "0.55rem" }} />
                            </Tooltip>
                          )}
                          <Tooltip title="Voir le client">
                            <IconButton size="small" onClick={() => navigate(`/admin/clients/${client.id}`)} sx={{ color: "#6366F1" }} disabled={!client.id}><Visibility fontSize="small" /></IconButton>
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
          <Box sx={{ display: "flex", justifyContent: "center", p: 2, borderTop: "1px solid #F0F0F0" }}>
            <Pagination count={totalPages} page={page} onChange={(e, value) => setPage(value)} color="primary" sx={{ "& .MuiPaginationItem-root": { borderRadius: "8px", "&.Mui-selected": { bgcolor: "#2C2C2C", color: "#FFFFFF" } } }} />
          </Box>
        )}
      </Paper>

      {/* Dialog de confirmation */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)} PaperProps={{ sx: { borderRadius: "16px", p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#2C2C2C" }}>
          {actionType === "valider" && "✅ Valider l'inscription"}
          {actionType === "refuser" && "❌ Refuser l'inscription"}
          {actionType === "generer_code" && "🔑 Générer le code d'accès"}
        </DialogTitle>
        <DialogContent>
          {selectedInscription && (
            <DialogContentText sx={{ color: "#666666" }}>
              {actionType === "valider" && (
                <>Êtes-vous sûr de vouloir valider l'inscription de <strong>{selectedInscription.client_details?.prenom || ""} {selectedInscription.client_details?.nom || ""}</strong> à la formation <strong>"{selectedInscription.formation_details?.titre || ""}"</strong> ?</>
              )}
              {actionType === "refuser" && (
                <>Êtes-vous sûr de vouloir refuser l'inscription de <strong>{selectedInscription.client_details?.prenom || ""} {selectedInscription.client_details?.nom || ""}</strong> ?</>
              )}
              {actionType === "generer_code" && (
                <>Un code d'accès va être généré pour <strong>{selectedInscription.client_details?.prenom || ""} {selectedInscription.client_details?.nom || ""}</strong>.</>
              )}
            </DialogContentText>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={() => setActionDialogOpen(false)} variant="outlined" sx={{ borderRadius: "8px", textTransform: "none" }}>Annuler</Button>
          <Button onClick={handleActionConfirm} variant="contained" disabled={processing} sx={{ bgcolor: actionType === "refuser" ? "#EF4444" : "#10B981", borderRadius: "8px", textTransform: "none", "&:hover": { bgcolor: actionType === "refuser" ? "#DC2626" : "#059669" } }}>
            {processing ? <CircularProgress size={20} sx={{ color: "#FFFFFF" }} /> : "Confirmer"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ borderRadius: "12px" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default InscriptionsFormations;