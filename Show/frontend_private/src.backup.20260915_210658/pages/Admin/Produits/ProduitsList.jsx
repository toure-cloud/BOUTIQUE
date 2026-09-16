// src/pages/Admin/Produits/ProduitsList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, Box, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, IconButton, CircularProgress,
  Alert, TextField, InputAdornment, Avatar, Tooltip, Pagination, Dialog,
  DialogTitle, DialogContent, DialogContentText, DialogActions, Snackbar,
  MenuItem, alpha, Grid,
} from "@mui/material";
import {
  Add, Search, Edit, Delete, Visibility, Refresh, ShoppingBag,
  CheckCircle, Cancel, Clear, LocalOffer, Image, Dashboard as DashboardIcon,
  Warning, ErrorOutlined, Inventory,
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
  orange: "#EA580C",
};

const ProduitsList = () => {
  const navigate = useNavigate();
  const [produits, setProduits] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategorie, setFilterCategorie] = useState("all");
  const [filterStock, setFilterStock] = useState("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const categories = ["robes", "accessoires", "chaussures", "bijoux", "sacs", "AUTRE"];

  const getCategorieLabel = (categorie) => {
    const labels = {
      robes: "Robes", accessoires: "Accessoires", chaussures: "Chaussures",
      bijoux: "Bijoux", sacs: "Sacs", AUTRE: "Autre",
    };
    return labels[categorie] || categorie;
  };

  const getCategorieColor = (categorie) => {
    const colors = {
      robes: "#EC4899", accessoires: "#8B5CF6", chaussures: "#F59E0B",
      bijoux: "#06B6D4", sacs: "#10B981", AUTRE: "#6B7280",
    };
    return colors[categorie] || "#6B7280";
  };

  // ✅ STATUT DYNAMIQUE BASÉ SUR LE STOCK
  const getStockStatus = (quantiteStock, estDisponible) => {
    if (!estDisponible) {
      return {
        label: "Désactivé",
        color: T.muted,
        bgcolor: alpha(T.muted, 0.12),
        icon: <Cancel sx={{ fontSize: 14 }} />,
      };
    }
    if (quantiteStock <= 0) {
      return {
        label: "Rupture de stock",
        color: T.danger,
        bgcolor: alpha(T.danger, 0.12),
        icon: <ErrorOutlined sx={{ fontSize: 14 }} />,
      };
    }
    if (quantiteStock <= 3) {
      return {
        label: "Dernières pièces",
        color: T.orange,
        bgcolor: alpha(T.orange, 0.12),
        icon: <Warning sx={{ fontSize: 14 }} />,
      };
    }
    if (quantiteStock <= 10) {
      return {
        label: "Stock faible",
        color: T.warning,
        bgcolor: alpha(T.warning, 0.12),
        icon: <Warning sx={{ fontSize: 14 }} />,
      };
    }
    return {
      label: "En stock",
      color: T.success,
      bgcolor: alpha(T.success, 0.12),
      icon: <CheckCircle sx={{ fontSize: 14 }} />,
    };
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

    if (filterStock !== "all") {
      result = result.filter((p) => {
        const stock = p.quantite_stock || 0;
        if (filterStock === "out") return stock <= 0;
        if (filterStock === "low") return stock > 0 && stock <= 10;
        if (filterStock === "ok") return stock > 10;
        return true;
      });
    }

    setFilteredProducts(result);
    setPage(1);
  }, [searchTerm, filterCategorie, filterStock, produits]);

  const handleDeleteClick = (produit) => {
    setProductToDelete(produit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!productToDelete) return;
    setDeleting(true);
    try {
      await adminService.deleteProduit(productToDelete.id);
      setSnackbar({ open: true, message: `Produit "${productToDelete.nom}" supprimé`, severity: "success" });
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
      style: "currency", currency: "XOF", minimumFractionDigits: 0,
    }).format(price || 0);

  const paginated = filteredProducts.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);

  const stats = {
    total: produits.length,
    outOfStock: produits.filter((p) => p.quantite_stock <= 0).length,
    lowStock: produits.filter((p) => p.quantite_stock > 0 && p.quantite_stock <= 10).length,
    inStock: produits.filter((p) => p.quantite_stock > 10).length,
  };

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
            sx={{ color: T.muted, textTransform: "none", fontWeight: 500, mb: 2.5, px: 0, "&:hover": { color: T.primary, bgcolor: "transparent" } }}
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
                bgcolor: T.primary, borderRadius: 2, textTransform: "none",
                fontWeight: 600, px: 3, py: 1.1, boxShadow: "none",
                "&:hover": { bgcolor: "#1E293B", boxShadow: "none" },
              }}
            >
              Ajouter un produit
            </Button>
          </Box>
        </Box>

        {/* Statistiques */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: "Total", value: stats.total, color: T.primary, icon: <Inventory /> },
            { label: "En stock", value: stats.inStock, color: T.success, icon: <CheckCircle /> },
            { label: "Stock faible", value: stats.lowStock, color: T.warning, icon: <Warning /> },
            { label: "Rupture", value: stats.outOfStock, color: T.danger, icon: <ErrorOutlined /> },
          ].map((stat, i) => (
            <Grid item xs={6} sm={3} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 2, borderRadius: 2.5, border: `1px solid ${T.border}`,
                  display: "flex", alignItems: "center", gap: 1.5,
                }}
              >
                <Avatar sx={{ bgcolor: alpha(stat.color, 0.12), color: stat.color, width: 40, height: 40 }}>
                  {stat.icon}
                </Avatar>
                <Box>
                  <Typography sx={{ color: T.muted, fontSize: "0.75rem", fontWeight: 500 }}>
                    {stat.label}
                  </Typography>
                  <Typography sx={{ fontWeight: 700, color: T.primary, fontSize: "1.2rem" }}>
                    {stat.value}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

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
            placeholder="Rechercher un produit..."
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

          <TextField
            select
            size="small"
            label="Statut du stock"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            sx={{ minWidth: 160, "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: T.bg } }}
          >
            <MenuItem value="all">Tous</MenuItem>
            <MenuItem value="ok">En stock</MenuItem>
            <MenuItem value="low">Stock faible</MenuItem>
            <MenuItem value="out">Rupture</MenuItem>
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
                        {searchTerm || filterCategorie !== "all" || filterStock !== "all"
                          ? "Aucun résultat pour ces critères"
                          : "Ajoutez votre premier produit"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((produit) => {
                    const stockStatus = getStockStatus(produit.quantite_stock, produit.est_disponible);
                    const imageUrl = produit.image_url ||
                      (produit.image_principale ? `${import.meta.env.VITE_MEDIA_URL}${produit.image_principale}` : null);

                    return (
                      <TableRow key={produit.id} hover>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Avatar
                              variant="rounded"
                              sx={{ width: 48, height: 48, bgcolor: T.bg, borderRadius: 1.5 }}
                              src={imageUrl || undefined}
                            >
                              {!imageUrl && <Image sx={{ color: T.muted }} />}
                            </Avatar>
                            <Box sx={{ minWidth: 0 }}>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                <Typography sx={{ fontWeight: 600, color: T.primary, fontSize: "0.9rem" }}>
                                  {produit.nom}
                                </Typography>
                                {produit.est_en_promotion && (
                                  <Chip
                                    icon={<LocalOffer sx={{ fontSize: 12, color: "#fff !important" }} />}
                                    label="Promo"
                                    size="small"
                                    sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, bgcolor: T.danger, color: "#fff" }}
                                  />
                                )}
                              </Box>
                              <Typography sx={{ color: T.muted, fontSize: "0.75rem", mt: 0.2 }}>
                                {produit.description?.substring(0, 45)}
                                {produit.description?.length > 45 ? "…" : ""}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getCategorieLabel(produit.categorie)}
                            size="small"
                            sx={{
                              height: 24, fontWeight: 600, fontSize: "0.72rem",
                              bgcolor: alpha(getCategorieColor(produit.categorie), 0.12),
                              color: getCategorieColor(produit.categorie),
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              fontWeight: 700, fontSize: "0.9rem",
                              color: produit.est_en_promotion ? T.danger : T.primary,
                            }}
                          >
                            {formatPrice(produit.prix_actuel || produit.prix)}
                          </Typography>
                          {produit.est_en_promotion && (
                            <Typography sx={{ color: T.muted, fontSize: "0.75rem", textDecoration: "line-through" }}>
                              {formatPrice(produit.prix)}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={produit.quantite_stock}
                            size="small"
                            sx={{
                              height: 26, fontWeight: 700, minWidth: 40, fontSize: "0.8rem",
                              bgcolor: stockStatus.bgcolor,
                              color: stockStatus.color,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={stockStatus.label}
                            size="small"
                            icon={stockStatus.icon}
                            sx={{
                              height: 26, fontWeight: 600, fontSize: "0.72rem",
                              bgcolor: stockStatus.bgcolor,
                              color: stockStatus.color,
                              "& .MuiChip-icon": { color: stockStatus.color },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Voir">
                            <IconButton size="small" onClick={() => navigate(`/admin/produits/${produit.id}`)} sx={{ color: T.muted }}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Modifier">
                            <IconButton size="small" onClick={() => navigate(`/admin/produits/${produit.id}/edit`)} sx={{ color: T.muted }}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton size="small" onClick={() => handleDeleteClick(produit)} sx={{ color: T.danger }}>
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

          {filteredProducts.length > 0 && (
            <Box
              sx={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                p: 2, borderTop: `1px solid ${T.border}`,
              }}
            >
              <Typography sx={{ color: T.muted, fontSize: "0.8rem" }}>
                {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, filteredProducts.length)} sur {filteredProducts.length}
              </Typography>
              <Pagination
                count={totalPages} page={page} onChange={(e, v) => setPage(v)} size="small"
                sx={{ "& .MuiPaginationItem-root": { borderRadius: 1.5, "&.Mui-selected": { bgcolor: T.primary, color: "#fff" } } }}
              />
            </Box>
          )}
        </Paper>

        {/* Dialog suppression */}
        <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} SlotProps={{ sx: { borderRadius: 2.5 } }}>
          <DialogTitle sx={{ fontWeight: 600, color: T.primary }}>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: T.secondary }}>
              Supprimer le produit <strong>"{productToDelete?.nom}"</strong> ?<br />
              Cette action est irréversible.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: "none", color: T.muted }}>
              Annuler
            </Button>
            <Button
              onClick={handleDeleteConfirm} variant="contained" disabled={deleting}
              sx={{
                bgcolor: T.danger, textTransform: "none", borderRadius: 2,
                boxShadow: "none", "&:hover": { bgcolor: "#B91C1C", boxShadow: "none" },
              }}
            >
              {deleting ? <CircularProgress size={18} color="inherit" /> : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open} autoHideDuration={4000}
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