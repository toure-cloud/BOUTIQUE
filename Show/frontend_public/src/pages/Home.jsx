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
} from '@mui/icons-material';
import { forfaitService } from '../services/forfaitService';
import { evenementService } from '../services/evenementService';
import { formationService } from '../services/formationService';
import { getMediaUrl } from '../utils/media';
import heroImage from '../assets/images/tibetia.jpeg?url';

const Home = () => {
  const [forfaits, setForfaits] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selfStudyTab, setSelfStudyTab] = useState('elegance');

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

  const relookingData = [
    {
      id: 1,
      title: 'Relooking Homme',
      description: 'Révélez votre style avec élégance et confiance',
      icon: <Person sx={{ fontSize: 42, color: '#64748B' }} />,
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
      icon: <People sx={{ fontSize: 42, color: '#64748B' }} />,
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
      icon: <Group sx={{ fontSize: 42, color: '#64748B' }} />,
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
    if (ref.current) ref.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = (ref) => {
    if (ref.current) ref.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  // ─── CARTE SELF-STUDY ───────────────────────────────────────
  const renderSelfStudyCard = (item) => (
    <Card
      key={item.id}
      elevation={0}
      sx={{
        minWidth: { xs: 250, sm: 270, md: 290 },
        maxWidth: { xs: 250, sm: 270, md: 290 },
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
          borderColor: '#CBD5E1',
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
            bgcolor: item.est_live ? '#EF4444' : '#0F172A',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.65rem',
            height: 24,
            borderRadius: 1,
          }}
        />
      )}

      <Box
        sx={{
          height: 150,
          bgcolor: '#F1F5F9',
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
              image={getMediaUrl(item.image)}
              alt={item.title}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
              sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography sx={{ fontSize: '2.8rem', opacity: 0.2 }}>🎓</Typography>
          )
        ) : (
          item.icon
        )}

        {selfStudyTab === 'elegance' && item.est_live && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              bgcolor: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Chip
              icon={<PlayArrow sx={{ color: '#fff !important', fontSize: 16 }} />}
              label="EN DIRECT"
              sx={{
                bgcolor: '#EF4444',
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.7rem',
                height: 28,
                borderRadius: 1.5,
              }}
            />
          </Box>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: '#0F172A',
            mb: 1,
            fontSize: '1.05rem',
            fontFamily: '"Playfair Display", serif',
            lineHeight: 1.3,
            minHeight: 48,
          }}
        >
          {item.title}
        </Typography>

        {selfStudyTab === 'relooking' && item.description && (
          <Typography sx={{ color: '#64748B', fontSize: '0.82rem', mb: 2, lineHeight: 1.5 }}>
            {item.description}
          </Typography>
        )}

        {selfStudyTab === 'elegance' && item.isFormation && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>Prix</Typography>
              <Typography sx={{ color: '#0F172A', fontWeight: 600, fontSize: '0.85rem' }}>
                {item.prix}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ color: '#94A3B8', fontSize: '0.72rem' }}>Durée</Typography>
              <Typography sx={{ color: '#475569', fontSize: '0.82rem' }}>{item.duree}</Typography>
            </Box>
          </Box>
        )}

        <Typography
          sx={{
            color: '#94A3B8',
            fontWeight: 600,
            fontSize: '0.68rem',
            letterSpacing: 0.6,
            mb: 1,
            textTransform: 'uppercase',
          }}
        >
          {selfStudyTab === 'elegance' ? 'Vous apprendrez' : 'Prestations'}
        </Typography>

        <List dense disablePadding sx={{ mb: 2.5, flexGrow: 1 }}>
          {item.items.slice(0, 4).map((point, idx) => (
            <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 22 }}>
                <Check sx={{ fontSize: 14, color: '#94A3B8' }} />
              </ListItemIcon>
              <ListItemText
                primary={point}
                slotProps={{
                  primary: {
                    sx: { color: '#475569', fontSize: '0.78rem', lineHeight: 1.35 },
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
              bgcolor: '#0F172A',
              color: '#fff',
              borderRadius: 2,
              py: 1.1,
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              '&:hover': { bgcolor: '#1E293B' },
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
            fullWidth
            sx={{
              mt: 'auto',
              bgcolor: item.est_live ? '#EF4444' : '#0F172A',
              color: '#fff',
              borderRadius: 2,
              py: 1.1,
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 600,
              '&:hover': {
                bgcolor: item.est_live ? '#DC2626' : '#1E293B',
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

  // ─── CARTE BOUTIQUE ─────────────────────────────────────────
  const renderBoutiqueCard = (product) => (
    <Card
      key={product.id}
      elevation={0}
      sx={{
        minWidth: { xs: 230, sm: 250, md: 270 },
        maxWidth: { xs: 230, sm: 250, md: 270 },
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        bgcolor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
          borderColor: '#CBD5E1',
          '& .product-img': { transform: 'scale(1.05)' },
        },
      }}
    >
      <Box
        sx={{
          height: 200,
          overflow: 'hidden',
          position: 'relative',
          bgcolor: '#F1F5F9',
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
            transition: 'transform 0.5s ease',
          }}
        />
        <Chip
          icon={<Star sx={{ fontSize: 12, color: '#F59E0B !important' }} />}
          label={product.rating}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            bgcolor: 'rgba(255,255,255,0.95)',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 26,
            borderRadius: 1.5,
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Typography
          sx={{
            fontWeight: 600,
            color: '#0F172A',
            mb: 0.6,
            fontFamily: '"Playfair Display", serif',
            fontSize: '1.05rem',
            lineHeight: 1.3,
            minHeight: 44,
          }}
        >
          {product.title}
        </Typography>
        <Typography
          sx={{
            color: '#64748B',
            fontSize: '0.82rem',
            mb: 2,
            lineHeight: 1.45,
            flexGrow: 1,
          }}
        >
          {product.description}
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontWeight: 700, color: '#0F172A', fontSize: '1rem' }}>
            {product.price}
          </Typography>
          <Button
            component={Link}
            to="/boutique"
            size="small"
            sx={{
              color: '#0F172A',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.78rem',
              borderRadius: 2,
              px: 2,
              border: '1px solid #E2E8F0',
              '&:hover': {
                bgcolor: '#0F172A',
                color: '#fff',
                borderColor: '#0F172A',
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
    <Box sx={{ bgcolor: '#F8FAFC' }}>
      {/* ─── HERO ─────────────────────────────────────────────── */}
      <Box
        sx={{
          minHeight: { xs: '88vh', md: '95vh' },
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
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.55) 50%, rgba(15,23,42,0.75) 100%)',
          }}
        />

        <Container
          maxWidth="lg"
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            py: 8,
          }}
        >
          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              letterSpacing: 4,
              fontWeight: 500,
              fontSize: { xs: '0.7rem', md: '0.8rem' },
              mb: 2.5,
              textTransform: 'uppercase',
            }}
          >
            Madame Tibetia
          </Typography>

          <Typography
            sx={{
              fontSize: { xs: '2.1rem', sm: '2.8rem', md: '3.6rem', lg: '4rem' },
              fontWeight: 400,
              color: '#fff',
              lineHeight: 1.2,
              mb: 2.5,
              fontFamily: '"Playfair Display", serif',
              maxWidth: 880,
              mx: 'auto',
            }}
          >
            Ressource d’apprentissage pour
            <br />
            <Box component="span" sx={{ fontStyle: 'italic' }}>
              avoir la confiance
            </Box>
            <br />
            <Box component="span" sx={{ fontStyle: 'italic' }}>
              et une bonne qualité de vie
            </Box>
          </Typography>

          <Typography
            sx={{
              color: 'rgba(255,255,255,0.8)',
              mb: 5,
              fontWeight: 300,
              fontSize: { xs: '1rem', md: '1.15rem' },
              letterSpacing: 1,
            }}
          >
            SOYEZ LA BIENVENUE
          </Typography>

          <Button
            component={Link}
            to="/formations"
            variant="contained"
            size="large"
            sx={{
              bgcolor: '#fff',
              color: '#0F172A',
              px: { xs: 4, md: 5 },
              py: 1.6,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: { xs: '0.9rem', md: '1rem' },
              fontWeight: 600,
              boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#F1F5F9',
                boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
              },
            }}
            endIcon={<ArrowForward />}
          >
            Commencer à apprendre
          </Button>
        </Container>
      </Box>

      {/* ─── SELF-STUDY ───────────────────────────────────────── */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              color: '#0F172A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '2.8rem' },
            }}
          >
            Self-Study
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#64748B',
              mb: 4,
              maxWidth: 480,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            Formations en ligne et programmes de relooking
          </Typography>

          {/* Onglets */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 5 }}>
            {['elegance', 'relooking'].map((tab) => (
              <Button
                key={tab}
                onClick={() => setSelfStudyTab(tab)}
                sx={{
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: selfStudyTab === tab ? 600 : 500,
                  fontSize: '0.95rem',
                  bgcolor: selfStudyTab === tab ? '#0F172A' : 'transparent',
                  color: selfStudyTab === tab ? '#fff' : '#64748B',
                  '&:hover': {
                    bgcolor: selfStudyTab === tab ? '#1E293B' : '#F1F5F9',
                  },
                }}
              >
                {tab === 'elegance' ? 'Elegance Times online' : 'Relooking'}
              </Button>
            ))}
          </Box>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -8, md: -16 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: '#F8FAFC' },
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
                py: 1,
                px: 0.5,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 5 },
                '&::-webkit-scrollbar-track': { bgcolor: '#F1F5F9', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 10 },
              }}
            >
              {getSelfStudyData().map((item) => renderSelfStudyCard(item))}
            </Box>

            <IconButton
              onClick={() => scrollRight(selfStudyScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -8, md: -16 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              <ArrowForward sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              component={Link}
              to={selfStudyTab === 'elegance' ? '/formations' : '/relooking/femme'}
              sx={{
                color: '#0F172A',
                fontSize: '0.9rem',
                fontWeight: 500,
                textTransform: 'none',
                borderBottom: '1px solid #CBD5E1',
                borderRadius: 0,
                pb: 0.4,
                '&:hover': { borderColor: '#0F172A', bgcolor: 'transparent' },
              }}
            >
              Voir tous les programmes →
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── BOUTIQUE ─────────────────────────────────────────── */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              color: '#0F172A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '2.8rem' },
            }}
          >
            Boutique élégante
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#64748B',
              mb: 5,
              maxWidth: 480,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            Des produits sélectionnés avec soin pour votre bien-être et votre élégance
          </Typography>

          <Box sx={{ position: 'relative' }}>
            <IconButton
              onClick={() => scrollLeft(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                left: { xs: -8, md: -16 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: '#F8FAFC' },
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
                py: 1,
                px: 0.5,
                scrollBehavior: 'smooth',
                '&::-webkit-scrollbar': { height: 5 },
                '&::-webkit-scrollbar-track': { bgcolor: '#F1F5F9', borderRadius: 10 },
                '&::-webkit-scrollbar-thumb': { bgcolor: '#CBD5E1', borderRadius: 10 },
              }}
            >
              {produitsBoutique.map((product) => renderBoutiqueCard(product))}
            </Box>

            <IconButton
              onClick={() => scrollRight(boutiqueScrollRef)}
              sx={{
                position: 'absolute',
                right: { xs: -8, md: -16 },
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                bgcolor: '#fff',
                border: '1px solid #E2E8F0',
                width: 40,
                height: 40,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { bgcolor: '#F8FAFC' },
              }}
            >
              <ArrowForward sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 5 }}>
            <Button
              component={Link}
              to="/boutique"
              variant="contained"
              sx={{
                bgcolor: '#0F172A',
                color: '#fff',
                px: 4.5,
                py: 1.4,
                borderRadius: 2.5,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 600,
                '&:hover': { bgcolor: '#1E293B' },
              }}
              endIcon={<ArrowForward sx={{ fontSize: 18 }} />}
            >
              Voir toute la boutique
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── ÉVÉNEMENTS ───────────────────────────────────────── */}
      <Box sx={{ py: { xs: 7, md: 10 }, bgcolor: '#F8FAFC' }}>
        <Container maxWidth="lg">
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 500,
              color: '#0F172A',
              mb: 1.5,
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '2rem', md: '2.8rem' },
            }}
          >
            Événements à venir
          </Typography>
          <Typography
            sx={{
              textAlign: 'center',
              color: '#64748B',
              mb: 5,
              maxWidth: 480,
              mx: 'auto',
              fontSize: '1.05rem',
            }}
          >
            Participez à nos prochains événements pour vivre une expérience unique
          </Typography>

          <Grid container spacing={3}>
            {evenements.map((evenement) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={evenement.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: '1px solid #E2E8F0',
                    overflow: 'hidden',
                    height: '100%',
                    bgcolor: '#fff',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      boxShadow: '0 16px 40px rgba(15,23,42,0.08)',
                      borderColor: '#CBD5E1',
                    },
                  }}
                >
                  {evenement.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={getMediaUrl(evenement.image)}
                      alt={evenement.titre}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      sx={{ objectFit: 'cover' }}
                    />
                  )}
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      sx={{
                        color: '#94A3B8',
                        fontWeight: 500,
                        fontSize: '0.78rem',
                        letterSpacing: 0.3,
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
                        fontWeight: 600,
                        color: '#0F172A',
                        mt: 1,
                        mb: 1,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: '1.15rem',
                      }}
                    >
                      {evenement.titre}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 0.5 }}>
                      {evenement.theme}
                    </Typography>
                    <Typography sx={{ color: '#64748B', fontSize: '0.9rem', mb: 2.5 }}>
                      📍 {evenement.lieu}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Typography sx={{ color: '#94A3B8', fontSize: '0.82rem' }}>
                        Places : {evenement.places_restantes}/{evenement.places_total}
                      </Typography>
                      <Button
                        component={Link}
                        to={`/evenements/${evenement.id}`}
                        size="small"
                        sx={{
                          borderRadius: 2,
                          border: '1px solid #E2E8F0',
                          color: '#0F172A',
                          textTransform: 'none',
                          fontWeight: 600,
                          px: 2.2,
                          '&:hover': {
                            borderColor: '#0F172A',
                            bgcolor: '#F8FAFC',
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
              sx={{
                border: '1px solid #E2E8F0',
                color: '#0F172A',
                borderRadius: 2.5,
                px: 4.5,
                py: 1.3,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  borderColor: '#0F172A',
                  bgcolor: '#F8FAFC',
                },
              }}
            >
              Voir tous les événements
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ─── COOKIE BANNER ────────────────────────────────────── */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          bgcolor: '#0F172A',
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
        <Typography sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.82rem' }}>
          Ce site utilise des cookies pour vous offrir la meilleure expérience.{' '}
          <Link to="/privacy" style={{ color: '#CBD5E1', textDecoration: 'underline' }}>
            En savoir plus
          </Link>
        </Typography>
        <Button
          variant="contained"
          sx={{
            bgcolor: '#fff',
            color: '#0F172A',
            borderRadius: 2,
            px: 3,
            py: 0.8,
            textTransform: 'none',
            fontSize: '0.82rem',
            fontWeight: 600,
            '&:hover': { bgcolor: '#F1F5F9' },
          }}
        >
          Accepter
        </Button>
      </Box>
    </Box>
  );
};

export default Home;