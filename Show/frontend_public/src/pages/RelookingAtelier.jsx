// src/pages/RelookingAtelier.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  ArrowForward,
  School,
  Star,
  Group,
  Check,
} from '@mui/icons-material';
import heroImage from '../assets/images/tibetia.jpeg?url';

const ATELIERS = [
  {
    id: 1,
    nom: 'Atelier Style et Élégance',
    categorie: 'Style',
    description: "Un atelier collectif pour maîtriser les codes de l'élégance au quotidien.",
    youWillLearn: [
      'Les fondamentaux du style élégant',
      'Comment choisir les bonnes couleurs',
      'Les associations de vêtements réussies',
      'Les accessoires qui font la différence',
      'La posture et la présence',
    ],
    prix: '75 000 CFA',
    duree: '1 journée',
    participants: '2 - 6 personnes',
    note: 4.8,
    icon: <School sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 2,
    nom: 'Atelier Relooking de Groupe',
    categorie: 'Groupe',
    description: 'Un atelier en petit groupe pour une transformation collective.',
    youWillLearn: [
      'Analyse collective des styles',
      'Conseils personnalisés',
      'Shopping en groupe',
      'Défilé de mode',
      'Photos professionnelles',
    ],
    prix: '120 000 CFA',
    duree: '2 jours',
    participants: '2 - 6 personnes',
    note: 4.9,
    icon: <Group sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
  {
    id: 3,
    nom: 'Masterclass Image et Confiance',
    categorie: 'Masterclass',
    description: 'Une masterclass intensive pour révéler votre charisme et votre image.',
    youWillLearn: [
      "Psychologie de l'image",
      'Communication non verbale',
      'Style et élégance',
      'Prise de parole',
      'Développement personnel',
    ],
    prix: '180 000 CFA',
    duree: '3 jours',
    participants: '2 - 6 personnes',
    note: 5.0,
    icon: <Star sx={{ fontSize: 40, color: '#A0A0A0' }} />,
  },
];

const RelookingAtelier = () => {
  const navigate = useNavigate();

  const handleViewDetails = (id) => {
    navigate(`/relooking/atelier/${id}`);
  };

  return (
    <Box>
      {/* HERO */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '180px', md: '250px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          backgroundColor: '#2C2C2C',
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Ateliers"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            opacity: 0.3,
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(44,44,44,0.8) 0%, rgba(44,44,44,0.4) 100%)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Typography
            variant="overline"
            sx={{
              color: '#A0A0A0',
              letterSpacing: 3,
              fontWeight: 600,
              fontSize: '0.7rem',
              display: 'block',
              mb: 1,
            }}
          >
            MADAME TIBETIA
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              color: '#FFFFFF',
              fontFamily: '"Playfair Display", serif',
              fontSize: { xs: '1.8rem', md: '3rem' },
            }}
          >
            Ateliers Relooking
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: '#E8E8E8', mt: 1, fontSize: { xs: '0.9rem', md: '1.1rem' } }}
          >
            Apprenez et transformez-vous en groupe (2 à 6 personnes)
          </Typography>
        </Container>
      </Box>

      {/* TITRE */}
      <Box sx={{ py: 3, backgroundColor: '#FFFFFF', borderBottom: '1px solid #F0F0F0' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: '#2C2C2C',
              fontFamily: '"Playfair Display", serif',
              mb: 1,
              textAlign: 'center',
              fontSize: { xs: '1.5rem', md: '2rem' },
            }}
          >
            Nos Ateliers en Groupe
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666666',
              textAlign: 'center',
              maxWidth: '700px',
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '0.85rem', md: '1rem' },
            }}
          >
            Rejoignez nos ateliers collectifs (2 à 6 personnes) pour apprendre, échanger et vous transformer.
          </Typography>
        </Container>
      </Box>

      {/* CARTES SCROLLABLES */}
      <Box
        sx={{
          py: { xs: 3, md: 5 },
          px: { xs: 2, md: 4 },
          overflowX: 'auto',
          overflowY: 'hidden',
          whiteSpace: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { height: '6px' },
          '&::-webkit-scrollbar-track': { backgroundColor: '#F5F5F5', borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#D0D0D0', borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#A0A0A0' },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, width: 'fit-content', mx: 'auto' }}>
          {ATELIERS.map((item) => (
            <Card
              key={item.id}
              sx={{
                minWidth: { xs: '250px', sm: '280px', md: '300px' },
                maxWidth: { xs: '250px', sm: '280px', md: '300px' },
                borderRadius: '16px',
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.08)',
                },
                display: 'flex',
                flexDirection: 'column',
                height: { xs: '440px', md: '500px' },
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  height: { xs: 80, md: 110 },
                  backgroundColor: '#F5F5F5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: 0.5,
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {item.icon}
                <Typography
                  variant="caption"
                  sx={{
                    color: '#A0A0A0',
                    fontSize: { xs: '0.45rem', md: '0.55rem' },
                    fontWeight: 500,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.categorie}
                </Typography>
                <Chip
                  label={`⭐ ${item.note}`}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.5rem',
                    height: 18,
                  }}
                />
              </Box>

              <CardContent
                sx={{
                  flexGrow: 1,
                  p: { xs: 1.5, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: '#2C2C2C',
                    fontSize: { xs: '0.85rem', md: '1rem' },
                    fontFamily: '"Playfair Display", serif',
                    lineHeight: 1.2,
                    mb: 0.5,
                    minHeight: { xs: '40px', md: '48px' },
                  }}
                >
                  {item.nom}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#666666',
                    fontSize: { xs: '0.65rem', md: '0.75rem' },
                    lineHeight: 1.3,
                    mb: 1,
                    minHeight: { xs: '32px', md: '40px' },
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {item.description}
                </Typography>

                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#A0A0A0',
                      fontWeight: 600,
                      fontSize: { xs: '0.55rem', md: '0.65rem' },
                      letterSpacing: 0.3,
                      display: 'block',
                      mb: 0.3,
                    }}
                  >
                    VOUS ALLEZ APPRENDRE :
                  </Typography>
                  <List dense disablePadding>
                    {item.youWillLearn.slice(0, 4).map((point, index) => (
                      <ListItem key={index} disablePadding sx={{ py: 0.1 }}>
                        <ListItemIcon sx={{ minWidth: 16 }}>
                          <Check sx={{ fontSize: 12, color: '#A0A0A0' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={point}
                          slotProps={{
                            primary: {
                              variant: 'caption',
                              sx: {
                                color: '#666666',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                lineHeight: 1.2,
                              },
                            },
                          }}
                        />
                      </ListItem>
                    ))}
                    {item.youWillLearn.length > 4 && (
                      <ListItem disablePadding sx={{ py: 0.1 }}>
                        <ListItemText
                          primary={`+${item.youWillLearn.length - 4} autres...`}
                          slotProps={{
                            primary: {
                              variant: 'caption',
                              sx: {
                                color: '#A0A0A0',
                                fontSize: { xs: '0.5rem', md: '0.6rem' },
                                fontStyle: 'italic',
                              },
                            },
                          }}
                        />
                      </ListItem>
                    )}
                  </List>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 0.3,
                    pt: 0.8,
                    borderTop: '1px solid #F0F0F0',
                    mb: 1,
                    flexShrink: 0,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>
                      Prix
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#2C2C2C',
                        fontWeight: 700,
                        fontSize: { xs: '0.7rem', md: '0.8rem' },
                      }}
                    >
                      {item.prix}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>
                      Durée
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#666666', fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                    >
                      {item.duree}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" sx={{ color: '#999999', fontSize: '0.5rem' }}>
                      Participants
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: '#666666', fontSize: { xs: '0.65rem', md: '0.75rem' } }}
                    >
                      {item.participants}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => handleViewDetails(item.id)}
                  sx={{
                    backgroundColor: '#2C2C2C',
                    color: '#FFFFFF',
                    borderRadius: '50px',
                    py: 0.6,
                    textTransform: 'none',
                    fontSize: { xs: '0.6rem', md: '0.7rem' },
                    '&:hover': { backgroundColor: '#A0A0A0' },
                    flexShrink: 0,
                  }}
                  endIcon={<ArrowForward sx={{ fontSize: 14 }} />}
                >
                  Voir les détails
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default RelookingAtelier;