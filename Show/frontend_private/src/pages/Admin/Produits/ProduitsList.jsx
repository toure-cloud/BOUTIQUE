// src/pages/Admin/Produits/ProduitsList.jsx
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
  Add, Search, Edit, Delete, Visibility, Refresh, ShoppingBag,
  CheckCircle, Cancel, Clear, LocalOffer, Image, Dashboard as DashboardIcon,
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

const ProduitsList = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const categories = ["robes", "accessoires", "chaussures", "bijoux", "sacs", "AUTRE"];

  const getCategorieLabel = (categorie) => {
    const labels = {
      robes: "Robes",
      accessoires: "Accessoires",
      chaussures: "Chaussures",
      bijoux: "Bijoux",
      sacs: "Sacs",
      AUTRE: "Autre",
    };
    return labels[categorie] || categorie;
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      robes: "#EC4899",
      accessoires: "#8B5CF6",
      chaussures: "#F59E0B",
      bijoux: "#06B6D4",
      sacs: "#10B981",
      AUTRE: "#6B7280",
    };
    return colors[categorie] || "#6B7280";
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  const fetchProduits = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getProduits();
      const list = Array.isArray(data) ? data : data.results || [];
      setProduits(list);
      setFilteredProducts(list);
    } catch {
      setError("Impossible de charger les produits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = produits;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) => p.nom?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
      );
    }
    if (filterCategorie !== "all") {
      result = result.filter((p) => p.categorie === filterCategorie);
    }
    setFilteredProducts(result);
    setPage(1);
  }, [searchTerm, filterCategorie, produits]);

  const handleDeleteClick = (produit) => {
    setProductToDelete(produit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteProduit(productToDelete.id);
      setSnackbar({
        open: true,
        message: `Produit "${productToDelete.nom}" supprimé`,
        severity: "success",
      });
      fetchProduits();
    } catch {
      setSnackbar({ open: true, message: "Erreur lors de la suppression", severity: "error" });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price || 0);

  const paginated = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

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
          <Button color="inherit" size="small" onClick={fetchProduits} startIcon={<Refresh />}>Réessayer</Button>
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
                Produits
              </Typography>
              <Typography sx={{ color: T.muted, fontSize: "0.9rem", mt: 0.4 }}>
                {produits.length} produit{produits.length > 1 ? "s" : ""}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate("/admin/produits/nouveau")}
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
              Ajouter un produit
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
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              flex: 1,
              minWidth: 240,
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

          <TextField
            select
            size="small"
            label="Catégorie"
            value={filterCategorie}
            onChange={(e) => setFilterCategorie(e.target.value)}
            sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg } }}
          >
            <MenuItem value="all">Toutes</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>{getCategorieLabel(cat)}</MenuItem>
            ))}
          </TextField>

          <IconButton onClick={fetchProduits} sx={{ color: T.muted }}>
            <Refresh />
          </IconButton>
        </Paper>

        {/* Table */}
        <Paper elevation={0} sx={{ borderRadius: 2.5, border: `1px solid ${T.border}`, overflow: "hidden" }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: T.bg }}>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Produit</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }}>Catégorie</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Prix</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Stock</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="center">Statut</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: T.secondary, fontSize: "0.8rem" }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                      <ShoppingBag sx={{ fontSize: 48, color: "#CBD5E1", mb: 1.5 }} />
                      <Typography sx={{ color: T.secondary, fontWeight: 600, mb: 0.5 }}>
                        Aucun produit trouvé
                      </Typography>
                      <Typography sx={{ color: T.muted, fontSize: "0.875rem" }}>
                        {searchTerm || filterCategorie !== "all"
                          ? "Aucun résultat pour ces critères"
                          : "Ajoutez votre premier produit"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((produit) => (
                    <TableRow key={produit.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            variant="rounded"
                            sx={{ width: 44, height: 44, bgcolor: T.bg, borderRadius: 1.5 }}
                            src={
                              produit.image_principale
                                ? `${import.meta.env.VITE_MEDIA_URL}${produit.image_principale}`
                                : undefined
                            }
                          >
                            {!produit.image_principale && <Image sx={{ color: T.muted }} />}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem" }}>
                              {produit.nom}
                            </Typography>
                            <Typography sx={{ color: T.muted, fontSize: "0.75rem" }}>
                              {produit.description?.substring(0, 40)}
                              {produit.description?.length > 40 ? "…" : ""}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getCategorieLabel(produit.categorie)}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor: alpha(getCategorieColor(produit.categorie), 0.12),
                            color: getCategorieColor(produit.categorie),
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          sx={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: produit.est_en_promotion ? T.danger : T.primary,
                          }}
                        >
                          {formatPrice(produit.prix_actuel || produit.prix)}
                        </Typography>
                        {produit.est_en_promotion && (
                          <Typography
                            sx={{
                              color: T.muted,
                              fontSize: "0.75rem",
                              textDecoration: "line-through",
                            }}
                          >
                            {formatPrice(produit.prix)}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={produit.quantite_stock}
                          size="small"
                          sx={{
                            height: 24,
                            fontWeight: 700,
                            minWidth: 36,
                            bgcolor:
                              produit.quantite_stock > 10
                                ? alpha(T.success, 0.12)
                                : produit.quantite_stock > 0
                                ? alpha(T.warning, 0.12)
                                : alpha(T.danger, 0.12),
                            color:
                              produit.quantite_stock > 10
                                ? T.success
                                : produit.quantite_stock > 0
                                ? T.warning
                                : T.danger,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={produit.est_disponible ? "Disponible" : "Indisponible"}
                          size="small"
                          icon={
                            produit.est_disponible ? (
                              <CheckCircle sx={{ fontSize: 14 }} />
                            ) : (
                              <Cancel sx={{ fontSize: 14 }} />
                            )
                          }
                          sx={{
                            height: 24,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            bgcolor: produit.est_disponible
                              ? alpha(T.success, 0.12)
                              : alpha(T.danger, 0.12),
                            color: produit.est_disponible ? T.success : T.danger,
                            "& .MuiChip-icon": {
                              color: produit.est_disponible ? T.success : T.danger,
                            },
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Voir">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/produits/${produit.id}`)}
                            sx={{ color: T.muted }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Modifier">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/produits/${produit.id}/edit`)}
                            sx={{ color: T.muted }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Supprimer">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(produit)}
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

          {filteredProducts.length > 0 && (
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
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredProducts.length)} sur{" "}
                {filteredProducts.length}
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
              Supprimer le produit <strong>"{productToDelete?.nom}"</strong> ?  
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

export default ProduitsList;