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
  IconButton,
  alpha,
  Fade,
} from '@mui/material';
import {
  ArrowForward,
  ArrowBack,
  Person,
  People,
  Group,
  PlayArrow,
  Check,
  Star,
  AutoAwesome,
} from '@mui/icons-material';
import { forfaitService } from '../services/forfaitService';
import { evenementService } from '../services/evenementService';
import { formationService } from '../services/formationService';
import { getMediaUrl } from '../utils/media';
import heroImage from '../assets/images/tibetia.jpeg?url';

// ═══════════════════════════════════════════════════════════
// 🎨 DESIGN TOKENS — PREMIUM LUXURY
// ═══════════════════════════════════════════════════════════
const T = {
  ivory: '#F8F7F4',
  ivoryDeep: '#F2EFE9',
  surface: '#FFFFFF',
  ink: '#121212',
  inkSoft: '#1E1E1E',
  textPrimary: '#121212',
  textSecondary: '#5C5C5C',
  textMuted: '#8A8A8A',
  border: '#E8E4DC',
  borderStrong: '#D6D0C6',
  gold: '#C9A84C',
  goldSoft: 'rgba(201, 168, 76, 0.12)',
  goldDeep: '#A88B3A',
  goldGlow: 'rgba(201, 168, 76, 0.25)',
  danger: '#B91C1C',
  success: '#166534',
  fontSerif: '"Playfair Display", Georgia, serif',
  fontSans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};

const Home = () => {
  const [forfaits, setForfaits] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selfStudyTab, setSelfStudyTab] = useState('elegance');
  const [cookieAccepted, setCookieAccepted] = useState(false);

  const selfStudyScrollRef = useRef(null);
  const boutiqueScrollRef = useRef(null);

  useEffect(() => {
    const accepted = localStorage.getItem('tibetia_cookies');
    if (accepted) setCookieAccepted(true);

    const fetchData = async () => {
      try {
        const [forfaitsData, evenementsData, formationsData] = await Promise.all([
          forfaitService.getForfaits(),
          evenementService.getEvenements({ statut: 'A_VENIR' }),
          formationService.getFormations(),
        ]);
        const forfaitsList = Array.isArray(forfaitsData)
          ? forfaitsData
          : forfaitsData.results || [];
        const evenementsList = Array.isArray(evenementsData)
          ? evenementsData
          : evenementsData.results || [];
        const formationsList = Array.isArray(formationsData)
          ? formationsData
          : formationsData.results || [];
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

  const acceptCookies = () => {
    localStorage.setItem('tibetia_cookies', 'true');
    setCookieAccepted(true);
  };

  const relookingData = [
    {
      id: 1,
      title: 'Relooking Homme',
      description: 'Révélez votre style avec élégance et confiance',
      icon: <Person sx={{ fontSize: 42, color: T.gold }} />,
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
      icon: <People sx={{ fontSize: 42, color: T.gold }} />,
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
      icon: <Group sx={{ fontSize: 42, color: T.gold }} />,
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
          ? formation.description
              .split('. ')
              .filter((s) => s.length > 0)
              .slice(0, 4)
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
          'Garde-robe alignée Lifestyle',
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

  const scrollLeft = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 340, behavior: 'smooth' });
  };

  // ─── CARTE SELF-STUDY ───────────────────────────────────────
  const renderSelfStudyCard = (item) => (
    <Card
      key={item.id}
      elevation={0}
      sx={{
        minWidth: { xs: 260, sm: 280, md: 300 },
        maxWidth: { xs: 260, sm: 280, md: 300 },
        borderRadius: 2.5,
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
        bgcolor: T.surface,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 28px 56px -12px ${alpha(T.ink, 0.12)}`,
          borderColor: alpha(T.gold, 0.4),
          '& .card-img': { transform: 'scale(1.06)' },
        },
      }}
    >
      {item.badge && (
        <Chip
          label={item.badge}
          size="small"
          sx={{
            position: 'absolute',
            top: 14,
            right: 14,
            zIndex: 2,
            bgcolor: item.est_live ? T.danger : T.ink,
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.62rem',
            letterSpacing: 1.2,
            height: 24,
            borderRadius: 1.5,
            fontFamily: T.fontSans,
          }}
        />
      )}

      <Box
        sx={{
          height: 168,
          bgcolor: T.ivoryDeep,
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
              className="card-img"
              image={getMediaUrl(item.image)}
              alt={item.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              sx={{
                height: '100%',
                width: '100%',
                objectFit: 'cover',
                transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            />
          ) : (
            <Typography sx={{ fontSize: '2.8rem', opacity: 0.15 }}>🎓</Typography>
          )
        ) : (
          item.icon
        )}

        {selfStudyTab === 'elegance' && item.est_live && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(185,28,28,0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Chip
              icon={<PlayArrow sx={{ color: '#fff !important', fontSize: 16 }} />}
              label="EN DIRECT"
              sx={{
                bgcolor: T.danger,
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.68rem',
                letterSpacing: 1,
                height: 28,
                borderRadius: 1.5,
                fontFamily: T.fontSans,
              }}
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontWeight: 500,
            color: T.textPrimary,
            mb: 1.2,
            fontSize: '1.15rem',
            fontFamily: T.fontSerif,
            lineHeight: 1.3,
            minHeight: 52,
          }}
        >
          {item.title}
        </Typography>

        {selfStudyTab === 'relooking' && item.description && (
          <Typography
            sx={{
              color: T.textSecondary,
              fontSize: '0.84rem',
              mb: 2,
              lineHeight: 1.55,
              fontFamily: T.fontSans,
            }}
          >
            {item.description}
          </Typography>
        )}

        {selfStudyTab === 'elegance' && item.isFormation && (
          <Box sx={{ mb: 2.2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.6 }}>
              <Typography
                sx={{
                  color: T.textMuted,
                  fontSize: '0.7rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: T.fontSans,
                }}
              >
                Prix
              </Typography>
              <Typography
                sx={{
                  color: T.textPrimary,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  fontFamily: T.fontSans,
                }}
              >
                {item.prix}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography
                sx={{
                  color: T.textMuted,
                  fontSize: '0.7rem',
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  fontFamily: T.fontSans,
                }}
              >
                Durée
              </Typography>
              <Typography
                sx={{ color: T.textSecondary, fontSize: '0.84rem', fontFamily: T.fontSans }}
              >
                {item.duree}
              </Typography>
            </Box>
          </Box>
        )}

        <Typography
          sx={{
            color: T.gold,
            fontWeight: 600,
            fontSize: '0.65rem',
            letterSpacing: 1.8,
            mb: 1.2,
            textTransform: 'uppercase',
            fontFamily: T.fontSans,
          }}
        >
          {selfStudyTab === 'elegance' ? 'Vous apprendrez' : 'Prestations'}
        </Typography>

        <List dense disablePadding sx={{ mb: 2.5, flexGrow: 1 }}>
          {item.items.slice(0, 4).map((point, idx) => (
            <ListItem key={idx} disablePadding sx={{ py: 0.3 }}>
              <ListItemIcon sx={{ minWidth: 22 }}>
                <Check sx={{ fontSize: 14, color: T.gold }} />
              </ListItemIcon>
              <ListItemText
                primary={point}
                slotProps={{
                  primary: {
                    sx: {
                      color: T.textSecondary,
                      fontSize: '0.8rem',
                      lineHeight: 1.4,
                      fontFamily: T.fontSans,
                    },
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        {selfStudyTab === 'relooking' && item.path && (
          <Button
            component={Link}
            to={item.path}
            fullWidth
            sx={{
              mt: 'auto',
              bgcolor: T.ink,
              color: '#fff',
              borderRadius: 2,
              py: 1.3,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: 2,
              fontWeight: 600,
              fontFamily: T.fontSans,
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: T.gold,
                boxShadow: `0 8px 24px ${T.goldGlow}`,
              },
            }}
            endIcon={<ArrowForward sx={{ fontSize: 15 }} />}
          >
            Découvrir
          </Button>
        )}

        {selfStudyTab === 'elegance' && item.isFormation && (
          <Button
            component={Link}
            to={item.path}
            fullWidth
            sx={{
              mt: 'auto',
              bgcolor: item.est_live ? T.danger : T.ink,
              color: '#fff',
              borderRadius: 2,
              py: 1.3,
              textTransform: 'uppercase',
              fontSize: '0.72rem',
              letterSpacing: 2,
              fontWeight: 600,
              fontFamily: T.fontSans,
              transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
              '&:hover': {
                bgcolor: item.est_live ? '#991B1B' : T.gold,
                boxShadow: item.est_live
                  ? '0 8px 24px rgba(185,28,28,0.25)'
                  : `0 8px 24px ${T.goldGlow}`,
              },
            }}
            endIcon={
              item.est_live ? (
                <PlayArrow sx={{ fontSize: 15 }} />
              ) : (
                <ArrowForward sx={{ fontSize: 15 }} />
              )
            }
          >
            {item.est_live ? 'Rejoindre' : 'Détails'}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  // ─── CARTE BOUTIQUE ─────────────────────────────────────────
  const renderBoutiqueCard = (product) => (
    <Card
      key={product.id}
      elevation={0}
      sx={{
        minWidth: { xs: 240, sm: 260, md: 280 },
        maxWidth: { xs: 240, sm: 260, md: 280 },
        borderRadius: 2.5,
        border: `1px solid ${T.border}`,
        overflow: 'hidden',
        bgcolor: T.surface,
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: `0 28px 56px -12px ${alpha(T.ink, 0.12)}`,
          borderColor: alpha(T.gold, 0.4),
          '& .product-img': { transform: 'scale(1.06)' },
        },
      }}
    >
      <Box
        sx={{
          height: 210,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: T.ivoryDeep,
        }}
      >
        <Box
          component="img"
          className="product-img"
          src={product.image}
          alt={product.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
        <Chip
          icon={<Star sx={{ fontSize: 12, color: `${T.gold} !important` }} />}
          label={product.rating}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            bgcolor: alpha('#fff', 0.95),
            backdropFilter: 'blur(8px)',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 26,
            borderRadius: 1.5,
            fontFamily: T.fontSans,
            border: `1px solid ${T.border}`,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontWeight: 500,
            color: T.textPrimary,
            mb: 0.8,
            fontFamily: T.fontSerif,
            fontSize: '1.1rem',
            lineHeight: 1.3,
            minHeight: 48,
          }}
        >
          {product.title}
        </Typography>
        <Typography
          sx={{
            color: T.textSecondary,
            fontSize: '0.84rem',
            mb: 2.5,
            lineHeight: 1.5,
            flexGrow: 1,
            fontFamily: T.fontSans,
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography
            sx={{
              fontWeight: 600,
              color: T.textPrimary,
              fontSize: '1.05rem',
              fontFamily: T.fontSerif,
            }}
          >
            {product.price}
          </Typography>
          <Button
            component={Link}
            to="/boutique"
            size="small"
            sx={{
              color: T.textPrimary,
              textTransform: 'uppercase',
              fontWeight: 600,
              fontSize: '0.68rem',
              letterSpacing: 1.5,
              borderRadius: 1.5,
              px: 2.2,
              py: 0.8,
              border: `1px solid ${T.borderStrong}`,
              fontFamily: T.fontSans,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: T.ink,
                color: '#fff',
                borderColor: T.ink,
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
    <Box sx={{ bgcolor: T.ivory }}>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          minHeight: { xs: '90vh', md: '100vh' },
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
            objectPosition: 'center 20%',
            transform: 'scale(1.02)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(18,18,18,0.28) 0%, rgba(18,18,18,0.52) 45%, rgba(18,18,18,0.82) 100%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            py: 10,
          }}
        >
          <Fade in timeout={900}>
            <Box>
              <Typography
                sx={{
                  color: alpha('#fff', 0.75),
                  letterSpacing: 6,
                  fontWeight: 500,
                  fontSize: { xs: '0.7rem', md: '0.78rem' },
                  textTransform: 'uppercase',
                  mb: 3,
                  fontFamily: T.fontSans,
                }}
              >
                Madame Tibetia
              </Typography>

              <Typography
                sx={{
                  color: '#fff',
                  fontFamily: T.fontSerif,
                  fontWeight: 400,
                  fontSize: { xs: '2.8rem', sm: '3.6rem', md: '4.6rem' },
                  lineHeight: 1.08,
                  letterSpacing: -1.2,
                  mb: 2.5,
                  maxWidth: 820,
                  mx: 'auto',
                }}
              >
                L’élégance est un art
                <br />
                <Box component="span" sx={{ fontStyle: 'italic', color: alpha('#fff', 0.92) }}>
                  et une bonne qualité de vie
                </Box>
              </Typography>

              <Typography
                sx={{
                  color: alpha('#fff', 0.7),
                  mb: 6,
                  fontWeight: 300,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  letterSpacing: 2.5,
                  textTransform: 'uppercase',
                  fontFamily: T.fontSans,
                }}
              >
                Soyez la bienvenue
              </Typography>

              <Button
                component={Link}
                to="/formations"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#fff',
                  color: T.ink,
                  px: { xs: 4.5, md: 6 },
                  py: 1.8,
                  borderRadius: 2.5,
                  textTransform: 'uppercase',
                  fontSize: { xs: '0.78rem', md: '0.85rem' },
                  letterSpacing: 2.5,
                  fontWeight: 600,
                  fontFamily: T.fontSans,
                  boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    bgcolor: T.gold,
                    color: '#fff',
                    boxShadow: `0 16px 48px ${T.goldGlow}`,
                    transform: 'translateY(-3px)',
                  },
                }}
                endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
              >
                Commencer à apprendre
              </Button>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* ─── SELF-STUDY ───────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: T.ivory }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                color: T.gold,
                fontSize: '0.7rem',
                letterSpacing: 3.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: T.fontSans,
                mb: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              <AutoAwesome sx={{ fontSize: 14 }} />
              Apprentissage
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                color: T.textPrimary,
                mb: 1.5,
                fontFamily: T.fontSerif,
                fontSize: { xs: '2.2rem', md: '3rem' },
                letterSpacing: -0.5,
              }}
            >
              Self-Study
            </Typography>
            <Typography
              sx={{
                color: T.textSecondary,
                maxWidth: 460,
                mx: 'auto',
                fontSize: '1rem',
                fontFamily: T.fontSans,
                fontWeight: 300,
              }}
            >
              Formations en ligne et programmes de relooking
            </Typography>
          </Box>

          {/* Onglets */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1.5, mb: 6 }}>
            {['elegance', 'relooking'].map((tab) => (
              <Button
                key={tab}
                onClick={() => setSelfStudyTab(tab)}
                sx={{
                  px: 3.5,
                  py: 1.2,
                  borderRadius: 2,
                  textTransform: 'uppercase',
                  fontWeight: 600,
                  fontSize: '0.72rem',
                  letterSpacing: 2,
                  fontFamily: T.fontSans,
                  bgcolor: selfStudyTab === tab ? T.ink : 'transparent',
                  color: selfStudyTab === tab ? '#fff' : T.textSecondary,
                  border: selfStudyTab === tab ? 'none' : `1px solid ${T.borderStrong}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: selfStudyTab === tab ? T.inkSoft : T.goldSoft,
                    color: selfStudyTab === tab ? '#fff' : T.gold,
                    borderColor: selfStudyTab === tab ? 'transparent' : T.gold,
                  },
                }}
              >
                {tab === 'elegance' ? 'Elegance Times' : 'Relooking'}
              </Button>
            ))}
          </Box>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                width: 44,
                height: 44,
                borderRadius: 2,
                display: { xs: 'none', sm: 'flex' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: T.ink,
                  color: '#fff',
                  borderColor: T.ink,
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              ref={selfStudyScrollRef}
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                py: 1.5,
                px: 0.5,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: T.ivoryDeep },
                '&::-webkit-scrollbar-thumb': { bgcolor: T.borderStrong, borderRadius: 2 },
              }}
            >
              {getSelfStudyData().map((item) => renderSelfStudyCard(item))}
            </Box>

            <IconButton
              onClick={() => scrollRight(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                width: 44,
                height: 44,
                borderRadius: 2,
                display: { xs: 'none', sm: 'flex' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: T.ink,
                  color: '#fff',
                  borderColor: T.ink,
                },
              }}
            >
              <ArrowForward sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to={selfStudyTab === 'elegance' ? '/formations' : '/relooking/femme'}
              sx={{
                color: T.textPrimary,
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 2,
                borderBottom: `1px solid ${T.borderStrong}`,
                borderRadius: 0,
                pb: 0.6,
                fontFamily: T.fontSans,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: T.gold,
                  color: T.gold,
                  bgcolor: 'transparent',
                },
              }}
            >
              Voir tous les programmes →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── BOUTIQUE ─────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: T.surface }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                color: T.gold,
                fontSize: '0.7rem',
                letterSpacing: 3.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: T.fontSans,
                mb: 1.5,
              }}
            >
              Sélection
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                color: T.textPrimary,
                mb: 1.5,
                fontFamily: T.fontSerif,
                fontSize: { xs: '2.2rem', md: '3rem' },
                letterSpacing: -0.5,
              }}
            >
              Boutique élégante
            </Typography>
            <Typography
              sx={{
                color: T.textSecondary,
                maxWidth: 480,
                mx: 'auto',
                fontSize: '1rem',
                fontFamily: T.fontSans,
                fontWeight: 300,
              }}
            >
              Des produits sélectionnés avec soin pour votre bien-être et votre élégance
            </Typography>
          </Box>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                width: 44,
                height: 44,
                borderRadius: 2,
                display: { xs: 'none', sm: 'flex' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: T.ink,
                  color: '#fff',
                  borderColor: T.ink,
                },
              }}
            >
              <ArrowBack sx={{ fontSize: 18 }} />
            </IconButton>

            <Box
              ref={boutiqueScrollRef}
              sx={{
                display: 'flex',
                gap: 3,
                overflowX: 'auto',
                py: 1.5,
                px: 0.5,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 4 },
                '&::-webkit-scrollbar-track': { bgcolor: T.ivoryDeep },
                '&::-webkit-scrollbar-thumb': { bgcolor: T.borderStrong, borderRadius: 2 },
              }}
            >
              {produitsBoutique.map((product) => renderBoutiqueCard(product))}
            </Box>

            <IconButton
              onClick={() => scrollRight(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -10, md: -20 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: T.surface,
                border: `1px solid ${T.border}`,
                width: 44,
                height: 44,
                borderRadius: 2,
                display: { xs: 'none', sm: 'flex' },
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: T.ink,
                  color: '#fff',
                  borderColor: T.ink,
                },
              }}
            >
              <ArrowForward sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              component={Link}
              to="/boutique"
              variant="contained"
              sx={{
                bgcolor: T.ink,
                color: '#fff',
                px: 5,
                py: 1.6,
                borderRadius: 2.5,
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: 2.5,
                fontWeight: 600,
                fontFamily: T.fontSans,
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  bgcolor: T.gold,
                  boxShadow: `0 12px 32px ${T.goldGlow}`,
                  transform: 'translateY(-2px)',
                },
              }}
              endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
            >
              Voir toute la boutique
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── ÉVÉNEMENTS ───────────────────────────────────────── */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: T.ivory }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              sx={{
                color: T.gold,
                fontSize: '0.7rem',
                letterSpacing: 3.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontFamily: T.fontSans,
                mb: 1.5,
              }}
            >
              Agenda
            </Typography>
            <Typography
              sx={{
                fontWeight: 400,
                color: T.textPrimary,
                mb: 1.5,
                fontFamily: T.fontSerif,
                fontSize: { xs: '2.2rem', md: '3rem' },
                letterSpacing: -0.5,
              }}
            >
              Événements à venir
            </Typography>
            <Typography
              sx={{
                color: T.textSecondary,
                maxWidth: 460,
                mx: 'auto',
                fontSize: '1rem',
                fontFamily: T.fontSans,
                fontWeight: 300,
              }}
            >
              Participez à nos prochains événements pour vivre une expérience unique
            </Typography>
          </Box>

          <Grid container spacing={3.5}>
            {evenements.map((evenement) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={evenement.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    border: `1px solid ${T.border}`,
                    overflow: 'hidden',
                    height: '100%',
                    bgcolor: T.surface,
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 28px 56px -12px ${alpha(T.ink, 0.12)}`,
                      borderColor: alpha(T.gold, 0.4),
                      '& .event-img': { transform: 'scale(1.05)' },
                    },
                  }}
                >
                  {evenement.image && (
                    <Box sx={{ height: 200, overflow: 'hidden' }}>
                      <CardMedia
                        component="img"
                        className="event-img"
                        height="200"
                        image={getMediaUrl(evenement.image)}
                        alt={evenement.titre}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                        sx={{
                          objectFit: 'cover',
                          transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                        }}
                      />
                    </Box>
                  )}
                  <CardContent sx={{ p: 3.5 }}>
                    <Typography
                      sx={{
                        color: T.gold,
                        fontWeight: 600,
                        fontSize: '0.68rem',
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                        fontFamily: T.fontSans,
                        mb: 1.2,
                      }}
                    >
                      {new Date(evenement.date_debut).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </Typography>
                    <Typography
                      sx={{
                        fontWeight: 500,
                        color: T.textPrimary,
                        mb: 1,
                        fontFamily: T.fontSerif,
                        fontSize: '1.25rem',
                        lineHeight: 1.25,
                      }}
                    >
                      {evenement.titre}
                    </Typography>
                    <Typography
                      sx={{
                        color: T.textSecondary,
                        fontSize: '0.88rem',
                        mb: 0.5,
                        fontFamily: T.fontSans,
                      }}
                    >
                      {evenement.theme}
                    </Typography>
                    <Typography
                      sx={{
                        color: T.textMuted,
                        fontSize: '0.85rem',
                        mb: 3,
                        fontFamily: T.fontSans,
                      }}
                    >
                      📍 {evenement.lieu}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography
                        sx={{
                          color: T.textMuted,
                          fontSize: '0.78rem',
                          fontFamily: T.fontSans,
                        }}
                      >
                        Places : {evenement.places_restantes}/{evenement.places_total}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/evenements/${evenement.id}`}
                        size="small"
                        sx={{
                          borderRadius: 1.5,
                          border: `1px solid ${T.borderStrong}`,
                          color: T.textPrimary,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          letterSpacing: 1.5,
                          px: 2.5,
                          py: 0.9,
                          fontFamily: T.fontSans,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: T.ink,
                            bgcolor: T.ink,
                            color: '#fff',
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
              sx={{
                border: `1px solid ${T.borderStrong}`,
                color: T.textPrimary,
                borderRadius: 2.5,
                px: 5,
                py: 1.5,
                textTransform: 'uppercase',
                fontWeight: 600,
                fontSize: '0.72rem',
                letterSpacing: 2,
                fontFamily: T.fontSans,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: T.ink,
                  bgcolor: T.ink,
                  color: '#fff',
                },
              }}
            >
              Voir tous les événements
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── COOKIE BANNER ────────────────────────────────────── */}
      {!cookieAccepted && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: alpha(T.ink, 0.97),
            backdropFilter: 'blur(12px)',
            color: '#fff',
            py: 2,
            px: { xs: 2.5, md: 5 },
            zIndex: 1200,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
            borderTop: `1px solid rgba(255,255,255,0.08)`,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '0.82rem',
              fontFamily: T.fontSans,
              fontWeight: 300,
            }}
          >
            Ce site utilise des cookies pour vous offrir la meilleure expérience.{' '}
            <Link
              to="/privacy"
              style={{ color: T.gold, textDecoration: 'underline' }}
            >
              En savoir plus
            </Link>
          </Typography>
          <Button
            onClick={acceptCookies}
            variant="contained"
            sx={{
              bgcolor: '#fff',
              color: T.ink,
              borderRadius: 2,
              px: 3.5,
              py: 1,
              textTransform: 'uppercase',
              fontSize: '0.7rem',
              letterSpacing: 1.8,
              fontWeight: 600,
              fontFamily: T.fontSans,
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: T.gold,
                color: '#fff',
              },
            }}
          >
            Accepter
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Home;