// src/components/EleganceTimesOnline.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
  IconButton,
  Avatar,
  Paper,
  Stack,
  Tabs,
  Tab,
  TextField,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  YouTube,
  Email,
  Share,
  Favorite,
  FavoriteBorder,
  Comment,
  Visibility,
  ArrowForward,
  ArrowBack,
  Bookmark,
  BookmarkBorder,
} from '@mui/icons-material';

// ─── Helpers ────────────────────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const AVATAR_COLORS = ['#C62828', '#1A1A1A', '#6D4C41', '#37474F', '#4A148C', '#004D40'];

// ─── Données ────────────────────────────────────────────
const ARTICLES = [
  {
    id: 1,
    title: 'Les Tendances Mode Automne/Hiver 2024',
    excerpt:
      'Découvrez les couleurs, matières et silhouettes qui feront la mode cette saison. Du cuir au velours en passant par les coupes oversized...',
    content:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua...',
    category: 'Mode',
    date: '15 Novembre 2024',
    author: 'Marie Dubois',
    readTime: 5,
    views: 1234,
    likes: 89,
    comments: 23,
    image:
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80',
    featured: true,
    tags: ['Mode', 'Tendances', 'Automne'],
  },
  {
    id: 2,
    title: 'Comment Choisir la Robe Parfaite pour un Mariage',
    excerpt:
      'Guide complet pour trouver la robe idéale en fonction de votre morphologie, du code vestimentaire et de la saison...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    category: 'Conseils',
    date: '10 Novembre 2024',
    author: 'Sophie Martin',
    readTime: 7,
    views: 856,
    likes: 67,
    comments: 15,
    image:
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    featured: false,
    tags: ['Mariage', 'Robes', 'Conseils'],
  },
  {
    id: 3,
    title: 'Les Accessoires Indispensables de la Saison',
    excerpt:
      'Des bijoux aux sacs en passant par les chaussures, voici les accessoires qui sublimeront vos tenues...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    category: 'Accessoires',
    date: '5 Novembre 2024',
    author: 'Julie Petit',
    readTime: 4,
    views: 2341,
    likes: 156,
    comments: 42,
    image:
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    featured: false,
    tags: ['Accessoires', 'Tendances', 'Bijoux'],
  },
  {
    id: 4,
    title: "Les Couleurs de l'Élégance : Palette 2024",
    excerpt:
      "Explorez la palette de couleurs qui définit l'élégance moderne. Du beige au bordeaux en passant par le vert sauge...",
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    category: 'Tendances',
    date: '28 Octobre 2024',
    author: 'Emma Laurent',
    readTime: 6,
    views: 1678,
    likes: 112,
    comments: 31,
    image:
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    featured: false,
    tags: ['Couleurs', 'Palette', 'Élégance'],
  },
  {
    id: 5,
    title: "L'Art du Relooking : Transformer sa Garde-Robe",
    excerpt:
      'Apprenez à donner une seconde vie à vos vêtements et à créer des looks uniques avec votre garde-robe existante...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    category: 'Relooking',
    date: '20 Octobre 2024',
    author: 'Claire Moreau',
    readTime: 8,
    views: 945,
    likes: 78,
    comments: 19,
    image:
      'https://images.unsplash.com/photo-1566206091556-7f2bf6f0b9ae?auto=format&fit=crop&w=800&q=80',
    featured: true,
    tags: ['Relooking', 'Garde-robe', 'Style'],
  },
  {
    id: 6,
    title: 'Les Grands Créateurs à Découvrir',
    excerpt:
      'Portrait de jeunes créateurs talentueux qui réinventent la mode avec audace et créativité...',
    content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    category: 'Designers',
    date: '15 Octobre 2024',
    author: 'Pierre Dubois',
    readTime: 6,
    views: 734,
    likes: 56,
    comments: 14,
    // ✅ Image différente de l'article 1
    image:
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=800&q=80',
    featured: false,
    tags: ['Designers', 'Créateurs', 'Mode'],
  },
];

const ARTICLES_POPULAIRES = ARTICLES.slice(0, 4);

const CATEGORIES = [
  'Tous',
  'Mode',
  'Tendances',
  'Accessoires',
  'Conseils',
  'Relooking',
  'Designers',
];

// ─── Composant ──────────────────────────────────────────
const EleganceTimesOnline = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [likedArticles, setLikedArticles] = useState({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 3;

  // Hydratation depuis localStorage
  useEffect(() => {
    try {
      const savedLikes = localStorage.getItem('elegance_likes');
      if (savedLikes) setLikedArticles(JSON.parse(savedLikes));
      const savedBookmarks = localStorage.getItem('elegance_bookmarks');
      if (savedBookmarks) setBookmarkedArticles(JSON.parse(savedBookmarks));
    } catch (e) {
      console.error('Erreur lecture localStorage:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('elegance_likes', JSON.stringify(likedArticles));
      localStorage.setItem('elegance_bookmarks', JSON.stringify(bookmarkedArticles));
    } catch (e) {
      console.error('Erreur écriture localStorage:', e);
    }
  }, [likedArticles, bookmarkedArticles]);

  const handleLike = (articleId) => {
    setLikedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  const handleBookmark = (articleId) => {
    setBookmarkedArticles((prev) => ({
      ...prev,
      [articleId]: !prev[articleId],
    }));
  };

  // ✅ Reset pagination au changement de catégorie
  const handleCategoryChange = (e, newValue) => {
    setSelectedCategory(newValue);
    setCurrentPage(0);
  };

  const filteredArticles = useMemo(
    () =>
      selectedCategory === 'Tous'
        ? ARTICLES
        : ARTICLES.filter((a) => a.category === selectedCategory),
    [selectedCategory]
  );

  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const displayedArticles = useMemo(
    () =>
      filteredArticles.slice(
        currentPage * articlesPerPage,
        (currentPage + 1) * articlesPerPage
      ),
    [filteredArticles, currentPage]
  );

  const featuredArticle = useMemo(
    () => ARTICLES.find((a) => a.featured),
    []
  );

  return (
    <Box sx={{ backgroundColor: '#FAFAF8', minHeight: '100vh' }}>
      {/* ─── HEADER ─────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: '#1A1A1A',
          color: '#FFF',
          py: { xs: 4, md: 6 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.03)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -150,
            left: -150,
            width: 400,
            height: 400,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.02)',
          }}
        />
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              fontWeight: 300,
              fontSize: { xs: '2.5rem', md: '4rem' },
              letterSpacing: '4px',
              mb: 1,
            }}
          >
            Elegance Times
          </Typography>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 300,
              letterSpacing: '8px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: { xs: '0.8rem', md: '1rem' },
            }}
          >
            L'EXCELLENCE DE LA MODE
          </Typography>
          <Divider
            sx={{
              width: 80,
              mx: 'auto',
              my: 3,
              borderColor: 'rgba(255,255,255,0.2)',
            }}
          />
          <Typography
            sx={{
              maxWidth: 600,
              mx: 'auto',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '1.05rem',
              fontWeight: 300,
            }}
          >
            Découvrez l'actualité de la mode, les tendances, les conseils et
            l'élégance au quotidien
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        <Grid container spacing={4}>
          {/* ─── MAIN CONTENT ─────────────────────────── */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Article en vedette */}
            {featuredArticle && (
              <Card
                sx={{
                  mb: 4,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  position: 'relative',
                  backgroundColor: '#FFF',
                }}
              >
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    image={featuredArticle.image}
                    alt={featuredArticle.title}
                    sx={{
                      height: { xs: 250, md: 400 },
                      objectFit: 'cover',
                    }}
                  />
                  <Chip
                    label="À la une"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      backgroundColor: '#C62828',
                      color: '#FFF',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                      letterSpacing: '1px',
                    }}
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Chip
                      label={featuredArticle.category}
                      size="small"
                      sx={{
                        backgroundColor: '#1A1A1A',
                        color: '#FFF',
                        fontWeight: 600,
                        fontSize: '0.7rem',
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#999' }}>
                      {featuredArticle.date}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Visibility sx={{ fontSize: 14, color: '#999' }} />
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {featuredArticle.views}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontFamily: '"Playfair Display", serif',
                      fontWeight: 700,
                      color: '#1A1A1A',
                      mb: 1.5,
                      fontSize: { xs: '1.5rem', md: '2rem' },
                    }}
                  >
                    {featuredArticle.title}
                  </Typography>
                  <Typography sx={{ color: '#666', mb: 2, lineHeight: 1.8 }}>
                    {featuredArticle.excerpt}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 2,
                    }}
                  >
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          bgcolor: '#1A1A1A',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                      >
                        {getInitials(featuredArticle.author)}
                      </Avatar>
                      <Typography variant="body2" sx={{ color: '#555' }}>
                        {featuredArticle.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        • {featuredArticle.readTime} min de lecture
                      </Typography>
                    </Box>
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => handleLike(featuredArticle.id)}
                        sx={{
                          color: likedArticles[featuredArticle.id]
                            ? '#C62828'
                            : '#999',
                        }}
                      >
                        {likedArticles[featuredArticle.id] ? (
                          <Favorite />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {featuredArticle.likes +
                          (likedArticles[featuredArticle.id] ? 1 : 0)}
                      </Typography>
                      <IconButton size="small" sx={{ color: '#999' }}>
                        <Comment fontSize="small" />
                      </IconButton>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {featuredArticle.comments}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleBookmark(featuredArticle.id)}
                        sx={{
                          color: bookmarkedArticles[featuredArticle.id]
                            ? '#1A1A1A'
                            : '#999',
                        }}
                      >
                        {bookmarkedArticles[featuredArticle.id] ? (
                          <Bookmark />
                        ) : (
                          <BookmarkBorder />
                        )}
                      </IconButton>
                      <IconButton size="small" sx={{ color: '#999' }}>
                        <Share fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Catégories Tabs */}
            <Box sx={{ mb: 4, borderBottom: '1px solid #E0E0E0' }}>
              <Tabs
                value={selectedCategory}
                onChange={handleCategoryChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    color: '#666',
                    '&.Mui-selected': { color: '#1A1A1A' },
                  },
                  '& .MuiTabs-indicator': { backgroundColor: '#1A1A1A' },
                }}
              >
                {CATEGORIES.map((category) => (
                  <Tab key={category} label={category} value={category} />
                ))}
              </Tabs>
            </Box>

            {/* Grille articles */}
            <Grid container spacing={3}>
              {displayedArticles.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 5,
                      textAlign: 'center',
                      borderRadius: 2,
                      border: '1px dashed #E0E0E0',
                      backgroundColor: '#FFF',
                    }}
                  >
                    <Typography sx={{ color: '#999' }}>
                      Aucun article dans cette catégorie pour le moment.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                displayedArticles.map((article) => (
                  <Grid size={{ xs: 12 }} key={article.id}>
                    <Card
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                        transition:
                          'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                        },
                        backgroundColor: '#FFF',
                      }}
                    >
                      <CardMedia
                        component="img"
                        image={article.image}
                        alt={article.title}
                        sx={{
                          width: { xs: '100%', sm: 240 },
                          height: { xs: 200, sm: 220 },
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                      <CardContent
                        sx={{
                          flex: 1,
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <Chip
                            label={article.category}
                            size="small"
                            sx={{
                              backgroundColor: '#F5F5F5',
                              color: '#1A1A1A',
                              fontWeight: 600,
                              fontSize: '0.65rem',
                            }}
                          />
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            {article.date}
                          </Typography>
                        </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 600,
                            color: '#1A1A1A',
                            mb: 1,
                            fontSize: '1.1rem',
                          }}
                        >
                          {article.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666',
                            mb: 2,
                            flex: 1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {article.excerpt}
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor:
                                  AVATAR_COLORS[
                                    article.id % AVATAR_COLORS.length
                                  ],
                                fontSize: '0.65rem',
                                fontWeight: 600,
                              }}
                            >
                              {getInitials(article.author)}
                            </Avatar>
                            <Typography
                              variant="caption"
                              sx={{ color: '#777' }}
                            >
                              {article.author}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() => handleLike(article.id)}
                              sx={{
                                color: likedArticles[article.id]
                                  ? '#C62828'
                                  : '#999',
                                p: 0.5,
                              }}
                            >
                              {likedArticles[article.id] ? (
                                <Favorite sx={{ fontSize: 16 }} />
                              ) : (
                                <FavoriteBorder sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                            <Typography
                              variant="caption"
                              sx={{ color: '#999', mr: 1 }}
                            >
                              {article.likes +
                                (likedArticles[article.id] ? 1 : 0)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => handleBookmark(article.id)}
                              sx={{
                                color: bookmarkedArticles[article.id]
                                  ? '#1A1A1A'
                                  : '#999',
                                p: 0.5,
                              }}
                            >
                              {bookmarkedArticles[article.id] ? (
                                <Bookmark sx={{ fontSize: 16 }} />
                              ) : (
                                <BookmarkBorder sx={{ fontSize: 16 }} />
                              )}
                            </IconButton>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))
              )}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 2,
                  mt: 4,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  sx={{
                    borderRadius: 50,
                    borderColor: '#DDD',
                    color: '#1A1A1A',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#1A1A1A' },
                  }}
                >
                  <ArrowBack sx={{ fontSize: 18, mr: 1 }} />
                  Précédent
                </Button>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  {currentPage + 1} / {totalPages}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  sx={{
                    borderRadius: 50,
                    borderColor: '#DDD',
                    color: '#1A1A1A',
                    textTransform: 'none',
                    '&:hover': { borderColor: '#1A1A1A' },
                  }}
                >
                  Suivant
                  <ArrowForward sx={{ fontSize: 18, ml: 1 }} />
                </Button>
              </Box>
            )}
          </Grid>

          {/* ─── SIDEBAR ──────────────────────────────── */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* About */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                textAlign: 'center',
                backgroundColor: '#FFF',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  backgroundColor: '#1A1A1A',
                }}
              >
                <Typography sx={{ fontSize: '2rem', fontWeight: 300 }}>
                  E
                </Typography>
              </Avatar>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  mb: 1,
                }}
              >
                Elegance Times
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#777', lineHeight: 1.8 }}
              >
                Votre magazine de mode et d'élégance. Découvrez les tendances,
                les conseils et l'inspiration pour un style raffiné.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1,
                  mt: 2,
                }}
              >
                {[Facebook, Twitter, Instagram, YouTube].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      color: '#1A1A1A',
                      border: '1px solid #E0E0E0',
                      borderRadius: 2,
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Paper>

            {/* Articles populaires */}
            <Paper
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 2,
                backgroundColor: '#FFF',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  color: '#1A1A1A',
                  mb: 2,
                }}
              >
                Articles populaires
              </Typography>
              {ARTICLES_POPULAIRES.map((article, idx) => (
                <Box key={article.id} sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box
                      component="img"
                      src={article.image}
                      alt={article.title}
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      sx={{
                        width: 70,
                        height: 70,
                        borderRadius: 1,
                        objectFit: 'cover',
                        flexShrink: 0,
                        backgroundColor: '#F5F5F5',
                      }}
                    />
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: '#1A1A1A',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.85rem',
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {article.date}
                      </Typography>
                    </Box>
                  </Box>
                  {idx < ARTICLES_POPULAIRES.length - 1 && (
                    <Divider sx={{ mt: 2 }} />
                  )}
                </Box>
              ))}
            </Paper>

            {/* Newsletter */}
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                backgroundColor: '#1A1A1A',
                color: '#FFF',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Newsletter
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}
              >
                Recevez nos articles et actualités chaque semaine.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  placeholder="Votre email"
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: 2,
                      '& input': { color: '#FFF' },
                      '& fieldset': {
                        borderColor: 'rgba(255,255,255,0.2)',
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#FFF',
                    color: '#1A1A1A',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': { backgroundColor: '#F0F0F0' },
                  }}
                >
                  OK
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ─── FOOTER ─────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: '#1A1A1A',
          color: 'rgba(255,255,255,0.7)',
          py: 4,
          mt: 4,
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.5rem',
                  color: '#FFF',
                  fontWeight: 300,
                  mb: 1,
                }}
              >
                Elegance Times
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
                L'excellence de la mode et de l'élégance au quotidien.
              </Typography>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#FFF', fontWeight: 600, mb: 1 }}
              >
                Catégories
              </Typography>
              <Stack spacing={0.5}>
                {['Mode', 'Tendances', 'Accessoires', 'Conseils'].map((c) => (
                  <Typography
                    key={c}
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      '&:hover': { color: '#FFF' },
                    }}
                  >
                    {c}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#FFF', fontWeight: 600, mb: 1 }}
              >
                Liens
              </Typography>
              <Stack spacing={0.5}>
                {[
                  'À propos',
                  'Contact',
                  'Mentions légales',
                  'Politique de confidentialité',
                ].map((l) => (
                  <Typography
                    key={l}
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      '&:hover': { color: '#FFF' },
                    }}
                  >
                    {l}
                  </Typography>
                ))}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#FFF', fontWeight: 600, mb: 1 }}
              >
                Contact
              </Typography>
              <Typography
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                <Email sx={{ fontSize: 16 }} />
                contact@elegancetimes.com
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Abidjan, Côte d'Ivoire
              </Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.05)' }} />
          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '0.8rem',
            }}
          >
            © 2024 Elegance Times. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default EleganceTimesOnline;