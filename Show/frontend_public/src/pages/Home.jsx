// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ArrowForward,
  ShoppingBag,
  Person,
  People,
  Group,
  PlayArrow,
  Check,
  LiveTv,
} from '@mui/icons-material';
import { forfaitService } from '../services/forfaitService';
import { evenementService } from '../services/evenementService';
import { formationService } from '../services/formationService';

import heroImage from '../assets/images/tibetia.jpeg';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [forfaits, setForfaits] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selfStudyTab, setSelfStudyTab] = useState('elegance');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [forfaitsData, evenementsData, formationsData] = await Promise.all([
          forfaitService.getForfaits(),
          evenementService.getEvenements({ statut: 'A_VENIR' }),
          formationService.getFormations(),
        ]);
        const forfaitsList = Array.isArray(forfaitsData) ? forfaitsData : forfaitsData.results || [];
        const evenementsList = Array.isArray(evenementsData) ? evenementsData : evenementsData.results || [];
        const formationsList = Array.isArray(formationsData) ? formationsData : formationsData.results || [];
        setForfaits(forfaitsList.slice(0, 4));
        setEvenements(evenementsList.slice(0, 3));
        setFormations(formationsList);
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== DONNÉES RELOOKING (statiques) =====
  const relookingData = [
    {
      id: 1,
      title: 'Relooking Homme',
      description: 'Révélez votre style avec élégance et confiance',
      icon: <Person sx={{ fontSize: 42, color: '#666' }} />,
      path: '/relooking/homme',
      items: [
        'Coaching relooking personnalisé',
        'Bilan d\'image complet',
        'Conseil en style vestimentaire',
        'Shopping accompagné',
        'Transformation de votre image',
      ],
    },
    {
      id: 2,
      title: 'Relooking Femme',
      description: 'Révélez votre élégance et votre beauté naturelle',
      icon: <People sx={{ fontSize: 42, color: '#666' }} />,
      path: '/relooking/femme',
      items: [
        'Relooking complet',
        'Soin du visage personnalisé',
        'Conseil vestimentaire',
        'Coiffure et style',
        'Maquillage professionnel',
        'Personnel shopping',
        'Analyse colorimétrie',
      ],
    },
    {
      id: 3,
      title: 'Relooking Atelier',
      description: 'Apprenez et transformez-vous en groupe (2 à 6 personnes)',
      icon: <Group sx={{ fontSize: 42, color: '#666' }} />,
      path: '/relooking/atelier',
      items: [
        'Atelier Style et Élégance',
        'Atelier Relooking de Groupe',
        'Masterclass Image et Confiance',
        'Apprentissage collectif',
        'Transformation en groupe',
      ],
    },
  ];

  // ===== DONNÉES POUR ELEGANCE TIMES ONLINE =====
  const getEleganceData = () => {
    if (formations.length > 0) {
      return formations.map((formation) => ({
        id: formation.id,
        title: formation.titre,
        badge: formation.est_live
          ? 'LIVE'
          : formation.est_replay
          ? 'REPLAY'
          : 'PROGRAMMÉ',
        items: formation.description
          ? formation.description.split('. ').filter((s) => s.length > 0).slice(0, 4)
          : [],
        path: `/formations/${formation.id}`,
        est_live: formation.est_live,
        est_replay: formation.est_replay,
        prix: formation.prix_formate || `${formation.prix} CFA`,
        duree: formation.duree,
        date_live: formation.date_live,
        image: formation.image,
        isFormation: true,
      }));
    }
    // Fallback
    return [
      {
        id: 1,
        title: 'Le protocole gracieux',
        badge: 'Nouveau',
        items: [
          'Langage du corps élégant',
          'Comment rayonner de confiance',
          'Comment entrer dans une pièce',
          'Comment entrer dans une voiture',
        ],
        isFormation: false,
      },
      {
        id: 2,
        title: 'Étiquette essentielle',
        items: [
          'Mœurs de table formelles',
          'Arriver avec le poise',
          'Étiquette de sièges gracieux',
          'Utilisation élégante de serviette',
        ],
        isFormation: false,
      },
      {
        id: 3,
        title: 'Élégance Essentielles',
        items: [
          'Comprendre le style élégant',
          'Construire 12 pièces clés',
          'Garde-robe alignée Lifestyle',
          'Comprendre l\'ajustement et la forme',
        ],
        isFormation: false,
      },
      {
        id: 4,
        title: 'Confiance Gala',
        items: [
          'Construire un état d\'esprit confiant',
          'Où trouver des galas',
          'Codes vestimentaires et quoi porter',
          'Premières impressions élégantes',
        ],
        isFormation: false,
      },
    ];
  };

  const getSelfStudyData = () => {
    return selfStudyTab === 'elegance' ? getEleganceData() : relookingData;
  };

  return (
    <Box sx={{ backgroundColor: '#FAFAFA' }}>
      {/* ===== HERO SECTION ===== */}
      <Box
        sx={{
          minHeight: { xs: '92vh', md: '100vh' },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Image de fond – plus nette */}
        <Box
          component="img"
          src={heroImage}
          alt="Madame Tibetia"
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 18%',
            // Image plus nette : pas de flou, opacity haute
            filter: 'contrast(1.05) brightness(1.02)',
          }}
        />

        {/* Overlay très léger pour garder l’image nette */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.65) 100%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: { xs: '92vh', md: '100vh' },
            py: 8,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: 5,
              fontWeight: 500,
              fontSize: { xs: '0.7rem', md: '0.8rem' },
              display: 'block',
              mb: 2.5,
            }}
          >
            MADAME TIBETIA
          </Typography>

          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.8rem', lg: '4.2rem' },
              fontWeight: 300,
              color: '#FFFFFF',
              lineHeight: 1.15,
              mb: 2.5,
              fontFamily: '"Playfair Display", serif',
              textShadow: '0 2px 24px rgba(0,0,0,0.25)',
              maxWidth: 900,
            }}
          >
            Ressource d’apprentissage pour
            <br />
            <Box
              component="span"
              sx={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              avoir la confiance
            </Box>
            <br />
            <Box
              component="span"
              sx={{
                fontStyle: 'italic',
                fontWeight: 400,
                color: 'rgba(255,255,255,0.92)',
              }}
            >
              et une bonne qualité de vie
            </Box>
          </Typography>

          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 5,
              fontWeight: 300,
              fontSize: { xs: '1rem', md: '1.2rem' },
              letterSpacing: 1.5,
            }}
          >
            SOYEZ LA BIENVENUE
          </Typography>

          <Button
            component={Link}
            to="/forfaits"
            variant="contained"
            size="large"
            sx={{
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              px: { xs: 4, md: 5.5 },
              py: 1.7,
              borderRadius: 50,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 600,
              letterSpacing: 0.4,
              boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
              '&:hover': {
                backgroundColor: '#F5F5F5',
                boxShadow: '0 12px 36px rgba(0,0,0,0.22)',
              },
            }}
            endIcon={<ArrowForward />}
          >
            Commencer à apprendre
          </Button>
        </Container>
      </Box>

      {/* ===== SECTION SELF-STUDY ===== */}
      <Box sx={{ py: { xs: 7, md: 11 }, backgroundColor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              color: '#1A1A1A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.2rem', md: '3.2rem' },
              letterSpacing: -0.5,
            }}
          >
            Self-Study
          </Typography>

          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#666',
              mb: 5,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            Formations en ligne et programmes de relooking
          </Typography>

          {/* Onglets */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              mb: 6,
            }}
          >
            <Button
              onClick={() => setSelfStudyTab('elegance')}
              sx={{
                color: selfStudyTab === 'elegance' ? '#1A1A1A' : '#999',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                fontWeight: selfStudyTab === 'elegance' ? 700 : 400,
                textTransform: 'none',
                borderBottom: selfStudyTab === 'elegance' ? '2.5px solid #1A1A1A' : '2.5px solid transparent',
                borderRadius: 0,
                pb: 0.8,
                px: 1.5,
                minWidth: 'auto',
                '&:hover': {
                  color: '#1A1A1A',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Elegance Times online
            </Button>

            <Typography sx={{ color: '#DDD', fontSize: '1.2rem', mx: 0.5 }}>|</Typography>

            <Button
              onClick={() => setSelfStudyTab('relooking')}
              sx={{
                color: selfStudyTab === 'relooking' ? '#1A1A1A' : '#999',
                fontSize: { xs: '0.95rem', md: '1.05rem' },
                fontWeight: selfStudyTab === 'relooking' ? 700 : 400,
                textTransform: 'none',
                borderBottom: selfStudyTab === 'relooking' ? '2.5px solid #1A1A1A' : '2.5px solid transparent',
                borderRadius: 0,
                pb: 0.8,
                px: 1.5,
                minWidth: 'auto',
                '&:hover': {
                  color: '#1A1A1A',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Relooking
            </Button>
          </Box>

          {/* Grille des cartes */}
          <Grid container spacing={3.5} justifyContent="center">
            {getSelfStudyData().map((item) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={selfStudyTab === 'elegance' ? 3 : 4}
                key={item.id}
                sx={{ display: 'flex' }}
              >
                <Card
                  elevation={0}
                  sx={{
                    width: '100%',
                    borderRadius: 3,
                    border: '1px solid #EEEEEE',
                    overflow: 'hidden',
                    transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                    backgroundColor: '#FFFFFF',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 18px 40px rgba(0,0,0,0.07)',
                    },
                  }}
                >
                  {/* Badge */}
                  {item.badge && (
                    <Chip
                      label={item.badge}
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        zIndex: 2,
                        backgroundColor: item.est_live ? '#E53935' : '#1A1A1A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.6,
                        height: 24,
                        animation: item.est_live ? 'pulse 1.6s infinite' : 'none',
                        '@keyframes pulse': {
                          '0%': { opacity: 1 },
                          '50%': { opacity: 0.55 },
                          '100%': { opacity: 1 },
                        },
                      }}
                    />
                  )}

                  {/* En-tête image / icône */}
                  <Box
                    sx={{
                      height: selfStudyTab === 'elegance' ? 140 : 150,
                      backgroundColor: '#F0F0F0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {selfStudyTab === 'elegance' ? (
                      item.image ? (
                        <CardMedia
                          component="img"
                          image={`${import.meta.env.VITE_MEDIA_URL}${item.image}`}
                          alt={item.title}
                          sx={{
                            height: '100%',
                            width: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      ) : (
                        <Typography sx={{ fontSize: '3.2rem', opacity: 0.25 }}>🎓</Typography>
                      )
                    ) : (
                      item.icon
                    )}

                    {selfStudyTab === 'elegance' && item.est_live && (
                      <Box
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          backgroundColor: 'rgba(229, 57, 53, 0.18)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Chip
                          icon={<PlayArrow sx={{ color: '#fff !important', fontSize: 18 }} />}
                          label="EN DIRECT"
                          sx={{
                            backgroundColor: 'rgba(229, 57, 53, 0.95)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            height: 32,
                            px: 1,
                            borderRadius: 50,
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  <CardContent
                    sx={{
                      flexGrow: 1,
                      p: 2.8,
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1A1A1A',
                        mb: 1.2,
                        fontSize: selfStudyTab === 'elegance' ? '1.05rem' : '1.15rem',
                        fontFamily: '"Playfair Display", serif',
                        lineHeight: 1.3,
                        minHeight: selfStudyTab === 'elegance' ? 48 : 40,
                      }}
                    >
                      {item.title}
                    </Typography>

                    {selfStudyTab === 'relooking' && item.description && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#666',
                          fontSize: '0.85rem',
                          mb: 2,
                          lineHeight: 1.5,
                          minHeight: 42,
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}

                    {/* Prix / Durée pour formations */}
                    {selfStudyTab === 'elegance' && item.isFormation && (
                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                            Prix
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.9rem' }}
                          >
                            {item.prix}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
                          <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                            Durée
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#555', fontSize: '0.85rem' }}>
                            {item.duree}
                          </Typography>
                        </Box>
                        {item.date_live && (
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" sx={{ color: '#999', fontSize: '0.75rem' }}>
                              Date
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555', fontSize: '0.85rem' }}>
                              {new Date(item.date_live).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#999',
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        letterSpacing: 0.8,
                        display: 'block',
                        mb: 1,
                        textTransform: 'uppercase',
                      }}
                    >
                      {selfStudyTab === 'elegance' ? 'Vous apprendrez' : 'Prestations'}
                    </Typography>

                    <List dense disablePadding sx={{ mb: 2, flexGrow: 1 }}>
                      {item.items.slice(0, 4).map((point, idx) => (
                        <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                          <ListItemIcon sx={{ minWidth: 22 }}>
                            <Check sx={{ fontSize: 15, color: '#888' }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={point}
                            primaryTypographyProps={{
                              variant: 'body2',
                              sx: {
                                color: '#555',
                                fontSize: '0.8rem',
                                lineHeight: 1.4,
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                      {item.items.length > 4 && (
                        <ListItem disablePadding sx={{ py: 0.2 }}>
                          <ListItemText
                            primary={`+${item.items.length - 4} autres...`}
                            primaryTypographyProps={{
                              variant: 'caption',
                              sx: {
                                color: '#AAA',
                                fontSize: '0.72rem',
                                fontStyle: 'italic',
                              },
                            }}
                          />
                        </ListItem>
                      )}
                    </List>

                    {/* Boutons */}
                    {selfStudyTab === 'relooking' && item.path && (
                      <Button
                        component={Link}
                        to={item.path}
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 'auto',
                          backgroundColor: '#1A1A1A',
                          color: '#fff',
                          borderRadius: 50,
                          py: 1.1,
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          '&:hover': { backgroundColor: '#333' },
                        }}
                        endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
                      >
                        Découvrir
                      </Button>
                    )}

                    {selfStudyTab === 'elegance' && item.isFormation && (
                      <Button
                        component={Link}
                        to={item.path}
                        variant="contained"
                        fullWidth
                        sx={{
                          mt: 'auto',
                          backgroundColor: item.est_live ? '#E53935' : '#1A1A1A',
                          color: '#fff',
                          borderRadius: 50,
                          py: 1.1,
                          textTransform: 'none',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: item.est_live ? '#C62828' : '#333',
                          },
                        }}
                        endIcon={
                          item.est_live ? (
                            <PlayArrow sx={{ fontSize: 18 }} />
                          ) : (
                            <ArrowForward sx={{ fontSize: 18 }} />
                          )
                        }
                      >
                        {item.est_live ? 'Rejoindre' : 'Détails'}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to={selfStudyTab === 'elegance' ? '/formations' : '/relooking/femme'}
              sx={{
                color: '#1A1A1A',
                fontSize: '0.95rem',
                fontWeight: 500,
                textTransform: 'none',
                letterSpacing: 0.8,
                borderBottom: '1px solid #CCC',
                borderRadius: 0,
                pb: 0.4,
                '&:hover': {
                  color: '#555',
                  backgroundColor: 'transparent',
                  borderColor: '#999',
                },
              }}
            >
              Voir tous les programmes
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== SECTION BOUTIQUE ===== */}
      <Box sx={{ py: { xs: 7, md: 11 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 300,
                  color: '#1A1A1A',
                  mb: 2.5,
                  fontFamily: '"Playfair Display", serif',
                  fontSize: { xs: '2rem', md: '2.7rem' },
                  lineHeight: 1.2,
                }}
              >
                Découvrez notre
                <br />
                <Box component="span" sx={{ fontStyle: 'italic', color: '#666' }}>
                  boutique élégante
                </Box>
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#555',
                  mb: 4,
                  lineHeight: 1.75,
                  fontSize: '1.05rem',
                  maxWidth: 440,
                }}
              >
                Des produits sélectionnés avec soin pour votre bien-être et votre élégance.
              </Typography>
              <Button
                component={Link}
                to="/boutique"
                variant="contained"
                sx={{
                  backgroundColor: '#1A1A1A',
                  color: '#fff',
                  px: 4.5,
                  py: 1.5,
                  borderRadius: 50,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                Voir les produits
              </Button>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  height: { xs: 260, md: 380 },
                  borderRadius: 3,
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, #F0F0F0, #E8E8E8)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #EEE',
                }}
              >
                <ShoppingBag sx={{ fontSize: 72, color: '#BBB' }} />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ===== SECTION ÉVÉNEMENTS ===== */}
      <Box sx={{ py: { xs: 7, md: 11 }, backgroundColor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              color: '#1A1A1A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2.2rem', md: '3rem' },
            }}
          >
            Événements à venir
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#666',
              mb: 6,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            Participez à nos prochains événements pour vivre une expérience unique
          </Typography>

          <Grid container spacing={3.5}>
            {evenements.map((evenement) => (
              <Grid item xs={12} md={4} key={evenement.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #EEEEEE',
                    overflow: 'hidden',
                    height: '100%',
                    transition: 'transform 0.28s ease, box-shadow 0.28s ease',
                    backgroundColor: '#fff',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 18px 40px rgba(0,0,0,0.07)',
                    },
                  }}
                >
                  {evenement.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={`${import.meta.env.VITE_MEDIA_URL}${evenement.image}`}
                      alt={evenement.titre}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#999',
                        fontWeight: 600,
                        letterSpacing: 0.4,
                        fontSize: '0.75rem',
                      }}
                    >
                      {new Date(evenement.date_debut).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: '#1A1A1A',
                        mt: 1,
                        mb: 1,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.15rem',
                      }}
                    >
                      {evenement.titre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                      {evenement.theme}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                      📍 {evenement.lieu}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '0.85rem' }}>
                        Places : {evenement.places_restantes}/{evenement.places_total}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/evenements/${evenement.id}`}
                        variant="outlined"
                        size="small"
                        sx={{
                          borderRadius: 50,
                          borderColor: '#CCC',
                          color: '#1A1A1A',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.2,
                          '&:hover': {
                            borderColor: '#999',
                            backgroundColor: 'rgba(0,0,0,0.03)',
                          },
                        }}
                      >
                        Participer
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to="/evenements"
              variant="outlined"
              sx={{
                borderColor: '#CCC',
                color: '#1A1A1A',
                borderRadius: 50,
                px: 5,
                py: 1.3,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: 'rgba(0,0,0,0.03)',
                },
              }}
            >
              Voir tous les événements
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== BANNIÈRE COOKIES ===== */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#1A1A1A',
          color: '#fff',
          py: 1.8,
          px: { xs: 2, md: 4 },
          zIndex: 1200,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}
        >
          Ce site utilise des cookies pour vous offrir la meilleure expérience.{' '}
          <Link
            to="/privacy"
            style={{
              color: '#CCC',
              textDecoration: 'underline',
            }}
          >
            En savoir plus
          </Link>
        </Typography>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#FFFFFF',
            color: '#1A1A1A',
            borderRadius: 50,
            px: 3.5,
            py: 0.7,
            textTransform: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            '&:hover': { backgroundColor: '#F0F0F0' },
          }}
        >
          Accepter
        </Button>
      </Box>
    </Box>
  );
};

export default Home;