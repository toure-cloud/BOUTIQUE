// src/pages/Home.jsx
import React, { useEffect, useState, useRef } from 'react';
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
  IconButton,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Person,
  People,
  Group,
  PlayArrow,
  Check,
  ShoppingBag,
  Star,
} from '@mui/icons-material';
import { forfaitService } from '../services/forfaitService';
import { evenementService } from '../services/evenementService';
import { formationService } from '../services/formationService';

import heroImage from '../assets/images/tibetia.jpeg?url';

const Home = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [forfaits, setForfaits] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selfStudyTab, setSelfStudyTab] = useState('elegance');

  // Refs pour le scroll horizontal
  const selfStudyScrollRef = useRef(null);
  const boutiqueScrollRef = useRef(null);

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
        "Bilan d'image complet",
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

  // ===== DONNÉES PRODUITS BOUTIQUE =====
  const produitsBoutique = [
    {
      id: 1,
      title: 'Parfum Signature',
      description: 'Fragrance raffinée aux notes florales et boisées',
      price: '45 000 CFA',
      image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&q=80',
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Bijou Élégance',
      description: 'Collier minimaliste en or 18 carats',
      price: '28 500 CFA',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80',
      rating: 4.9,
    },
    {
      id: 3,
      title: 'Sérum Lumière',
      description: 'Soin visage hydratant et illuminateur',
      price: '32 000 CFA',
      image: 'https://images.unsplash.com/photo-1571781926291-c77df8097c1f?w=400&q=80',
      rating: 4.7,
    },
    {
      id: 4,
      title: 'Montre Classique',
      description: 'Montre en acier inoxydable avec cadran bleu',
      price: '65 000 CFA',
      image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80',
      rating: 4.6,
    },
    {
      id: 5,
      title: 'Sac à Main Cuir',
      description: 'Sac en cuir véritable avec finitions dorées',
      price: '85 000 CFA',
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80',
      rating: 4.8,
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
          "Garde-robe alignée Lifestyle",
          "Comprendre l'ajustement et la forme",
        ],
        isFormation: false,
      },
      {
        id: 4,
        title: 'Confiance Gala',
        items: [
          "Construire un état d'esprit confiant",
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

  // ===== FONCTIONS DE SCROLL =====
  const scrollLeft = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -320, behavior: 'smooth' });
    }
  };

  const scrollRight = (ref) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 320, behavior: 'smooth' });
    }
  };

  // ===== RENDU D'UNE CARTE SELF-STUDY =====
  const renderSelfStudyCard = (item) => (
    <Card
      key={item.id}
      sx={{
        minWidth: { xs: 240, sm: 260, md: 280 },
        maxWidth: { xs: 240, sm: 260, md: 280 },
        borderRadius: 3,
        border: '1px solid #EEEEEE',
        overflow: 'hidden',
        transition: 'transform 0.28s ease, box-shadow 0.28s ease',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
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
          p: 2.5,
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
            fontSize: selfStudyTab === 'elegance' ? '1rem' : '1.1rem',
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
              fontSize: '0.8rem',
              mb: 2,
              lineHeight: 1.5,
              minHeight: 40,
            }}
          >
            {item.description}
          </Typography>
        )}

        {/* Prix / Durée pour formations */}
        {selfStudyTab === 'elegance' && item.isFormation && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
              <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>Prix</Typography>
              <Typography variant="body2" sx={{ color: '#1A1A1A', fontWeight: 700, fontSize: '0.85rem' }}>
                {item.prix}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.4 }}>
              <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>Durée</Typography>
              <Typography variant="body2" sx={{ color: '#555', fontSize: '0.8rem' }}>
                {item.duree}
              </Typography>
            </Box>
            {item.date_live && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="caption" sx={{ color: '#999', fontSize: '0.7rem' }}>Date</Typography>
                <Typography variant="body2" sx={{ color: '#555', fontSize: '0.8rem' }}>
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
            fontSize: '0.65rem',
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
            <ListItem key={idx} disablePadding sx={{ py: 0.2 }}>
              <ListItemIcon sx={{ minWidth: 20 }}>
                <Check sx={{ fontSize: 14, color: '#888' }} />
              </ListItemIcon>
              <ListItemText
                primary={point}
                primaryTypographyProps={{
                  variant: 'body2',
                  sx: {
                    color: '#555',
                    fontSize: '0.75rem',
                    lineHeight: 1.3,
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
                  sx: { color: '#AAA', fontSize: '0.7rem', fontStyle: 'italic' },
                }}
              />
            </ListItem>
          )}
        </List>

        {/* Bouton */}
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
              py: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#333' },
            }}
            endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
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
              py: 1,
              textTransform: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: item.est_live ? '#C62828' : '#333',
              },
            }}
            endIcon={
              item.est_live ? (
                <PlayArrow sx={{ fontSize: 16 }} />
              ) : (
                <ArrowForward sx={{ fontSize: 16 }} />
              )
            }
          >
            {item.est_live ? 'Rejoindre' : 'Détails'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // ===== RENDU D'UNE CARTE BOUTIQUE =====
  const renderBoutiqueCard = (product) => (
    <Card
      key={product.id}
      sx={{
        minWidth: { xs: 220, sm: 240, md: 260 },
        maxWidth: { xs: 220, sm: 240, md: 260 },
        borderRadius: 3,
        border: '1px solid #EEEEEE',
        overflow: 'hidden',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'transform 0.35s ease, box-shadow 0.35s ease',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 44px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#F8F8F8',
        }}
      >
        <Box
          component="img"
          src={product.image}
          alt={product.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            '.MuiCard-root:hover &': {
              transform: 'scale(1.05)',
            },
          }}
        />
        <Chip
          icon={<Star sx={{ fontSize: 12, color: '#FFB400 !important' }} />}
          label={product.rating}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            backgroundColor: 'rgba(255,255,255,0.9)',
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 24,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: '#1A1A1A',
            mb: 0.5,
            fontFamily: '"Playfair Display", serif',
            fontSize: '1rem',
            lineHeight: 1.3,
            minHeight: 44,
          }}
        >
          {product.title}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#666',
            fontSize: '0.8rem',
            mb: 2,
            lineHeight: 1.4,
            flexGrow: 1,
            minHeight: 40,
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
          <Typography sx={{ fontWeight: 700, color: '#1A1A1A', fontSize: '0.95rem' }}>
            {product.price}
          </Typography>
          <Button
            component={Link}
            to="/boutique"
            size="small"
            sx={{
              color: '#1A1A1A',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.75rem',
              borderRadius: 50,
              px: 2,
              border: '1px solid #DDD',
              '&:hover': {
                backgroundColor: '#1A1A1A',
                color: '#fff',
                borderColor: '#1A1A1A',
              },
            }}
          >
            Voir
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

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
            filter: 'contrast(1.05) brightness(1.02)',
          }}
        />

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
      <Box sx={{ py: { xs: 6, md: 9 }, backgroundColor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              color: '#1A1A1A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '3rem' },
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
              mb: 4,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '1rem',
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
              mb: 4,
            }}
          >
            <Button
              onClick={() => setSelfStudyTab('elegance')}
              sx={{
                color: selfStudyTab === 'elegance' ? '#1A1A1A' : '#999',
                fontSize: { xs: '0.9rem', md: '1rem' },
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
                fontSize: { xs: '0.9rem', md: '1rem' },
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

          {/* Conteneur avec scroll horizontal */}
          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -12, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
                width: 40,
                height: 40,
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box
              ref={selfStudyScrollRef}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 3,
                overflowX: 'auto',
                overflowY: 'hidden',
                py: 2,
                px: 1,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-track': { backgroundColor: '#F0F0F0', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#A0A0A0' },
              }}
            >
              {getSelfStudyData().map((item) => renderSelfStudyCard(item))}
            </Box>

            <IconButton
              onClick={() => scrollRight(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -12, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
                width: 40,
                height: 40,
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to={selfStudyTab === 'elegance' ? '/formations' : '/relooking/femme'}
              sx={{
                color: '#1A1A1A',
                fontSize: '0.9rem',
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
              Voir tous les programmes →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== SECTION BOUTIQUE ===== */}
      <Box sx={{ py: { xs: 6, md: 9 }, backgroundColor: '#FFFFFF' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              color: '#1A1A1A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Boutique élégante
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#666',
              mb: 4,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '1rem',
            }}
          >
            Des produits sélectionnés avec soin pour votre bien-être et votre élégance
          </Typography>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -12, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
                width: 40,
                height: 40,
              }}
            >
              <ArrowBack />
            </IconButton>

            <Box
              ref={boutiqueScrollRef}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 3,
                overflowX: 'auto',
                overflowY: 'hidden',
                py: 2,
                px: 1,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 6 },
                '&::-webkit-scrollbar-track': { backgroundColor: '#F0F0F0', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#A0A0A0' },
              }}
            >
              {produitsBoutique.map((product) => renderBoutiqueCard(product))}
            </Box>

            <IconButton
              onClick={() => scrollRight(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -12, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                backgroundColor: 'rgba(255,255,255,0.95)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                '&:hover': { backgroundColor: '#FFFFFF' },
                display: { xs: 'none', sm: 'flex' },
                width: 40,
                height: 40,
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              component={Link}
              to="/boutique"
              variant="contained"
              sx={{
                backgroundColor: '#1A1A1A',
                color: '#fff',
                px: 5,
                py: 1.4,
                borderRadius: 50,
                textTransform: 'none',
                fontSize: '0.9rem',
                fontWeight: 600,
                '&:hover': { backgroundColor: '#333' },
              }}
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            >
              Voir toute la boutique
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ===== SECTION ÉVÉNEMENTS ===== */}
      <Box sx={{ py: { xs: 6, md: 9 }, backgroundColor: '#FAFAFA' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              textAlign: 'center',
              fontWeight: 300,
              color: '#1A1A1A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Événements à venir
          </Typography>
          <Typography
            variant="body1"
            sx={{
              textAlign: 'center',
              color: '#666',
              mb: 4,
              maxWidth: 520,
              mx: 'auto',
              fontSize: '1rem',
            }}
          >
            Participez à nos prochains événements pour vivre une expérience unique
          </Typography>

          <Grid container spacing={3}>
            {evenements.map((evenement) => (
              <Grid item xs={12} sm={6} md={4} key={evenement.id}>
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
                        fontSize: '1.1rem',
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
                      <Typography variant="body2" sx={{ color: '#999', fontSize: '0.8rem' }}>
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

          <Box sx={{ textAlign: 'center', mt: 5 }}>
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
          sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.8rem' }}
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
            fontSize: '0.8rem',
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