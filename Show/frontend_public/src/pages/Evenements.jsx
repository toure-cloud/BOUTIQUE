// src/pages/Evenements.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
} from "@mui/material";
import {
  Search,
  Event,
  CalendarToday,
  LocationOn,
  People,
  AttachMoney,
  ArrowForward,
  Clear,
  CheckCircle,
  Pending,
  Cancel,
} from "@mui/icons-material";
import { evenementService } from "../services/evenementService";
import heroImage from "../assets/images/tibetia.jpeg";

const Evenements = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const statuts = [
    { value: "A_VENIR", label: "À venir", color: "#2563EB" },
    { value: "EN_COURS", label: "En cours", color: "#DC2626" },
    { value: "TERMINE", label: "Terminé", color: "#059669" },
    { value: "ANNULE", label: "Annulé", color: "#6B7280" },
  ];

  useEffect(() => {
    fetchEvenements();
  }, [page, filterStatut]);

  const fetchEvenements = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, page_size: 10 }; // 10 pour bien remplir 2 lignes de 5
      if (filterStatut) params.statut = filterStatut;

      const data = await evenementService.getEvenements(params);
      const list = data.results || data || [];
      setEvenements(list);
      setTotalCount(data.count || list.length || 0);
      setTotalPages(Math.ceil((data.count || list.length || 0) / 10));
    } catch (err) {
      setError("Impossible de charger les événements. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (searchTerm.trim()) {
      const filtered = evenements.filter(
        (e) =>
          e.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.theme?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setEvenements(filtered);
    } else {
      fetchEvenements();
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchEvenements();
  };

  const getStatutChip = (statut) => {
    const config = statuts.find((s) => s.value === statut);
    if (!config) return null;

    let icon = null;
    if (statut === "A_VENIR") icon = <Pending sx={{ fontSize: 12 }} />;
    else if (statut === "EN_COURS" || statut === "TERMINE")
      icon = <CheckCircle sx={{ fontSize: 12 }} />;
    else if (statut === "ANNULE") icon = <Cancel sx={{ fontSize: 12 }} />;

    return (
      <Chip
        icon={icon}
        label={config.label}
        size="small"
        sx={{
          height: 20,
          fontSize: "0.65rem",
          fontWeight: 600,
          borderRadius: 0.5,
          backgroundColor: `${config.color}14`,
          color: config.color,
          "& .MuiChip-icon": { color: config.color },
        }}
      />
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date à confirmer";
    const date = new Date(dateString);
    return isNaN(date)
      ? "Date à confirmer"
      : date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return "Gratuit";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
        <Box sx={{ height: { xs: 200, md: 260 }, backgroundColor: "#111" }} />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Grid container spacing={2}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={item}>
                <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 1, mb: 1 }} />
                <Skeleton width="70%" height={16} sx={{ mb: 0.5 }} />
                <Skeleton width="50%" height={14} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh", py: 8 }}>
        <Container maxWidth="sm">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={fetchEvenements}>
                Réessayer
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}>
      {/* HERO */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 180, md: 240 },
          display: "flex",
          alignItems: "flex-end",
          overflow: "hidden",
          backgroundColor: "#111",
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Événements"
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.6,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.2) 100%)",
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, pb: 3.5 }}>
          <Typography
            variant="overline"
            sx={{
              color: "rgba(255,255,255,0.65)",
              letterSpacing: 3,
              fontSize: "0.68rem",
              display: "block",
              mb: 0.5,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: "#FFF",
              fontSize: { xs: "1.8rem", md: "2.3rem" },
              fontWeight: 400,
              letterSpacing: -0.3,
            }}
          >
            Événements
          </Typography>
        </Container>
      </Box>

      {/* TOOLBAR */}
      <Box
        sx={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #EAEAEA",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 1.5,
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <TextField
              placeholder="Rechercher un événement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              size="small"
              sx={{
                flex: 1,
                maxWidth: { xs: "100%", md: 300 },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  backgroundColor: "#F7F7F7",
                  fontSize: "0.85rem",
                  "& fieldset": { borderColor: "transparent" },
                  "&:hover fieldset": { borderColor: "#DDD" },
                  "&.Mui-focused fieldset": { borderColor: "#111" },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "#999", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <Clear
                      sx={{ fontSize: 16, color: "#999", cursor: "pointer" }}
                      onClick={handleClearSearch}
                    />
                  </InputAdornment>
                ) : null,
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography sx={{ color: "#777", fontSize: "0.82rem", display: { xs: "none", sm: "block" } }}>
                {totalCount} événement{totalCount > 1 ? "s" : ""}
              </Typography>

              <FormControl size="small" sx={{ minWidth: 120 }}>
                <Select
                  value={filterStatut}
                  onChange={(e) => {
                    setFilterStatut(e.target.value);
                    setPage(1);
                  }}
                  displayEmpty
                  sx={{
                    borderRadius: 1,
                    fontSize: "0.82rem",
                    backgroundColor: "#F7F7F7",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                  }}
                >
                  <MenuItem value="">Tous</MenuItem>
                  {statuts.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* GRILLE - MAXIMUM 5 PAR LIGNE */}
      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        {evenements.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <Event sx={{ fontSize: 40, color: "#DDD", mb: 1.5 }} />
            <Typography sx={{ fontFamily: '"Playfair Display", serif', fontSize: "1.3rem", color: "#111", mb: 1 }}>
              Aucun événement trouvé
            </Typography>
            <Typography sx={{ color: "#888", fontSize: "0.9rem" }}>
              {searchTerm || filterStatut ? "Modifiez vos filtres" : "Revenez plus tard"}
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {evenements.map((evenement) => {
                const isFull = (evenement.places_restantes ?? 0) === 0;
                const isCancelled = evenement.statut === "ANNULE";
                const isDisabled = isFull || isCancelled;

                return (
                  <Grid
                    item
                    xs={12}      // 1 par ligne sur mobile
                    sm={6}       // 2 par ligne sur tablette
                    md={4}       // 3 par ligne
                    lg={2.4}     // ← 5 par ligne sur grand écran
                    key={evenement.id}
                  >
                    <Card
                      elevation={0}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 1.5,
                        border: "1px solid #EAEAEA",
                        backgroundColor: "#fff",
                        overflow: "hidden",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "#DDD",
                          boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                          "& .event-img": {
                            transform: "scale(1.04)",
                          },
                        },
                      }}
                    >
                      {/* Image plus petite */}
                      <Box
                        sx={{
                          position: "relative",
                          height: 130,
                          overflow: "hidden",
                          backgroundColor: "#F4F4F4",
                        }}
                      >
                        <Box
                          component="img"
                          className="event-img"
                          src={evenement.image_url || heroImage}
                          alt={evenement.titre}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.35s ease",
                          }}
                        />
                        <Box sx={{ position: "absolute", top: 8, right: 8 }}>
                          {getStatutChip(evenement.statut)}
                        </Box>
                      </Box>

                      <CardContent
                        sx={{
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          p: 1.8,
                          "&:last-child": { pb: 1.8 },
                        }}
                      >
                        {evenement.theme && (
                          <Typography
                            sx={{
                              color: "#999",
                              fontSize: "0.65rem",
                              fontWeight: 500,
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                              mb: 0.5,
                            }}
                          >
                            {evenement.theme}
                          </Typography>
                        )}

                        <Typography
                          sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 500,
                            color: "#111",
                            fontSize: "0.95rem",
                            lineHeight: 1.3,
                            mb: 1.2,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: 40,
                          }}
                        >
                          {evenement.titre}
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 1.5 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <CalendarToday sx={{ fontSize: 13, color: "#AAA" }} />
                            <Typography sx={{ color: "#555", fontSize: "0.75rem" }}>
                              {formatDate(evenement.date_debut)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <LocationOn sx={{ fontSize: 13, color: "#AAA" }} />
                            <Typography
                              sx={{
                                color: "#555",
                                fontSize: "0.75rem",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {evenement.lieu || "Lieu à confirmer"}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <People sx={{ fontSize: 13, color: "#AAA" }} />
                            <Typography sx={{ color: "#555", fontSize: "0.75rem" }}>
                              {evenement.places_restantes ?? 0} place
                              {(evenement.places_restantes ?? 0) > 1 ? "s" : ""}
                            </Typography>
                          </Box>
                        </Box>

                        <Box
                          sx={{
                            mt: "auto",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            gap: 1,
                          }}
                        >
                          <Typography sx={{ fontWeight: 600, color: "#111", fontSize: "0.85rem" }}>
                            {formatPrice(evenement.prix)}
                          </Typography>

                          <Button
                            component={Link}
                            to={`/evenements/${evenement.id}`}
                            size="small"
                            variant="contained"
                            disabled={isDisabled}
                            sx={{
                              backgroundColor: isDisabled ? "#E8E8E8" : "#111",
                              color: isDisabled ? "#999" : "#fff",
                              borderRadius: 1,
                              px: 1.5,
                              py: 0.5,
                              minWidth: 0,
                              textTransform: "none",
                              fontWeight: 600,
                              fontSize: "0.72rem",
                              boxShadow: "none",
                              "&:hover": {
                                backgroundColor: isDisabled ? "#E8E8E8" : "#333",
                                boxShadow: "none",
                              },
                            }}
                          >
                            {isFull ? "Complet" : isCancelled ? "Annulé" : "Voir"}
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(e, value) => setPage(value)}
                  size="small"
                  sx={{
                    "& .MuiPaginationItem-root": {
                      borderRadius: 1,
                      fontWeight: 500,
                      "&.Mui-selected": {
                        backgroundColor: "#111",
                        color: "#fff",
                      },
                    },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Container>

      {/* CTA */}
      <Box sx={{ py: 6, backgroundColor: "#111", textAlign: "center" }}>
        <Container maxWidth="sm">
          <Typography
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: "#FFF",
              fontSize: { xs: "1.4rem", md: "1.7rem" },
              mb: 1,
            }}
          >
            Envie de plus d’élégance ?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.6)", mb: 2.5, fontSize: "0.9rem" }}>
            Découvrez aussi nos formations
          </Typography>
          <Button
            component={Link}
            to="/formations"
            variant="contained"
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: "#fff",
              color: "#111",
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.85rem",
              boxShadow: "none",
              "&:hover": { backgroundColor: "#f0f0f0", boxShadow: "none" },
            }}
          >
            Voir les formations
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Evenements;