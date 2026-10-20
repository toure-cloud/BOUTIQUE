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
  Fade,
  Grow,
  alpha,
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
  AccessTime,
} from '@mui/icons-material';

// ─────────────────────────────────────────────────────────────
// PALETTE PREMIUM (cohérente avec Boutique)
// ─────────────────────────────────────────────────────────────
const T = {
  bg: '#F8F7F4',
  surface: '#FFFFFF',
  dark: '#1A1A1A',
  darkSoft: '#2C2C2C',
  textPrimary: '#1A1A1A',
  textSecondary: '#5C5C5C',
  textMuted: '#8A8A8A',
  border: '#EAEAEA',
  accent: '#C9A84C',
  accentSoft: 'rgba(201, 168, 76, 0.12)',
  accentHover: '#B8943A',
  danger: '#B91C1C',
};

// ─── Helpers ────────────────────────────────────────────────
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

const AVATAR_COLORS = [
  '#C9A84C',
  '#1A1A1A',
  '#6D4C41',
  '#37474F',
  '#4A148C',
  '#004D40',
];

// Image de secours élégante (fallback unique et fiable)
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80';

// ─── Données (images distinctes + fiables) ──────────────────
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
      'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80',
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
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80',
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
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80',
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
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80',
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
      'https://images.unsplash.com/photo-1566206091556-7f2bf6f0b9ae?auto=format&fit=crop&w=900&q=80',
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
    image:
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d?auto=format&fit=crop&w=900&q=80',
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

// ─── Composant ──────────────────────────────────────────────
const EleganceTimesOnline = () => {
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [likedArticles, setLikedArticles] = useState({});
  const [bookmarkedArticles, setBookmarkedArticles] = useState({});
  const [currentPage, setCurrentPage] = useState(0);
  const articlesPerPage = 3;

  // Hydratation localStorage
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
    () => ARTICLES.find((a) => a.featured) || ARTICLES[0],
    []
  );

  // Helper image robuste
  const handleImageError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  return (
    <Box sx={{ backgroundColor: T.bg, minHeight: '100vh' }}>
      {/* ─── HERO PREMIUM ──────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: T.dark,
          color: '#FFF',
          py: { xs: 6, md: 9 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Cercles décoratifs subtils */}
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 340,
            height: 340,
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.03),
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -160,
            left: -100,
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: alpha('#FFFFFF', 0.02),
          }}
        />

        {/* Ligne dorée haute */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 70,
            height: 3,
            bgcolor: T.accent,
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Fade in timeout={700}>
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontWeight: 300,
                  fontSize: { xs: '2.6rem', md: '4.2rem' },
                  letterSpacing: '3px',
                  mb: 1.5,
                  lineHeight: 1.05,
                }}
              >
                Elegance Times
              </Typography>
              <Typography
                sx={{
                  fontWeight: 400,
                  letterSpacing: '6px',
                  color: alpha('#FFFFFF', 0.55),
                  fontSize: { xs: '0.75rem', md: '0.9rem' },
                  textTransform: 'uppercase',
                  mb: 3,
                }}
              >
                L'excellence de la mode
              </Typography>
              <Divider
                sx={{
                  width: 60,
                  mx: 'auto',
                  mb: 3.5,
                  borderColor: alpha(T.accent, 0.6),
                  borderWidth: 1.5,
                }}
              />
              <Typography
                sx={{
                  maxWidth: 520,
                  mx: 'auto',
                  color: alpha('#FFFFFF', 0.72),
                  fontSize: { xs: '0.98rem', md: '1.1rem' },
                  fontWeight: 300,
                  lineHeight: 1.7,
                }}
              >
                Découvrez l'actualité de la mode, les tendances, les conseils et
                l'élégance au quotidien
              </Typography>
            </Box>
          </Fade>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 7 } }}>
        <Grid container spacing={4.5}>
          {/* ─── CONTENU PRINCIPAL ─────────────────────── */}
          <Grid size={{ xs: 12, md: 8 }}>
            {/* Article en vedette */}
            {featuredArticle && (
              <Grow in timeout={500}>
                <Card
                  elevation={0}
                  sx={{
                    mb: 5,
                    borderRadius: 3.5,
                    overflow: 'hidden',
                    border: `1px solid ${T.border}`,
                    backgroundColor: T.surface,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: `0 28px 56px -18px ${alpha(T.dark, 0.14)}`,
                      borderColor: alpha(T.accent, 0.35),
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <CardMedia
                      component="img"
                      image={featuredArticle.image}
                      alt={featuredArticle.title}
                      onError={handleImageError}
                      sx={{
                        height: { xs: 260, md: 420 },
                        objectFit: 'cover',
                        transition: 'transform 0.7s ease',
                        '&:hover': { transform: 'scale(1.03)' },
                      }}
                    />
                    <Chip
                      label="À la une"
                      sx={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        bgcolor: T.accent,
                        color: T.dark,
                        fontWeight: 700,
                        fontSize: '0.68rem',
                        letterSpacing: '0.8px',
                        height: 28,
                        borderRadius: 1.5,
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      }}
                    />
                  </Box>

                  <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        mb: 2,
                        flexWrap: 'wrap',
                      }}
                    >
                      <Chip
                        label={featuredArticle.category}
                        size="small"
                        sx={{
                          bgcolor: T.dark,
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.68rem',
                          height: 26,
                          borderRadius: 1.5,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{ color: T.textMuted, fontWeight: 500 }}
                      >
                        {featuredArticle.date}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Visibility sx={{ fontSize: 14, color: T.textMuted }} />
                        <Typography variant="caption" sx={{ color: T.textMuted }}>
                          {featuredArticle.views.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTime sx={{ fontSize: 14, color: T.textMuted }} />
                        <Typography variant="caption" sx={{ color: T.textMuted }}>
                          {featuredArticle.readTime} min
                        </Typography>
                      </Box>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: '"Playfair Display", serif',
                        fontWeight: 600,
                        color: T.textPrimary,
                        mb: 1.75,
                        fontSize: { xs: '1.55rem', md: '2.1rem' },
                        lineHeight: 1.25,
                        letterSpacing: -0.4,
                      }}
                    >
                      {featuredArticle.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: T.textSecondary,
                        mb: 3,
                        lineHeight: 1.75,
                        fontSize: '1.02rem',
                      }}
                    >
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
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 36,
                            height: 36,
                            bgcolor: T.dark,
                            fontSize: '0.78rem',
                            fontWeight: 600,
                          }}
                        >
                          {getInitials(featuredArticle.author)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ color: T.textPrimary, fontWeight: 600 }}
                          >
                            {featuredArticle.author}
                          </Typography>
                          <Typography variant="caption" sx={{ color: T.textMuted }}>
                            {featuredArticle.readTime} min de lecture
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleLike(featuredArticle.id)}
                          sx={{
                            color: likedArticles[featuredArticle.id]
                              ? T.danger
                              : T.textMuted,
                            transition: 'all 0.2s',
                            '&:hover': { transform: 'scale(1.12)' },
                          }}
                        >
                          {likedArticles[featuredArticle.id] ? (
                            <Favorite fontSize="small" />
                          ) : (
                            <FavoriteBorder fontSize="small" />
                          )}
                        </IconButton>
                        <Typography variant="caption" sx={{ color: T.textMuted, mr: 0.5 }}>
                          {featuredArticle.likes +
                            (likedArticles[featuredArticle.id] ? 1 : 0)}
                        </Typography>

                        <IconButton size="small" sx={{ color: T.textMuted }}>
                          <Comment fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" sx={{ color: T.textMuted, mr: 0.5 }}>
                          {featuredArticle.comments}
                        </Typography>

                        <IconButton
                          size="small"
                          onClick={() => handleBookmark(featuredArticle.id)}
                          sx={{
                            color: bookmarkedArticles[featuredArticle.id]
                              ? T.dark
                              : T.textMuted,
                          }}
                        >
                          {bookmarkedArticles[featuredArticle.id] ? (
                            <Bookmark fontSize="small" />
                          ) : (
                            <BookmarkBorder fontSize="small" />
                          )}
                        </IconButton>

                        <IconButton size="small" sx={{ color: T.textMuted }}>
                          <Share fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grow>
            )}

            {/* Tabs catégories */}
            <Box
              sx={{
                mb: 4.5,
                borderBottom: `1px solid ${T.border}`,
              }}
            >
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
                    color: T.textMuted,
                    minHeight: 48,
                    '&.Mui-selected': {
                      color: T.dark,
                      fontWeight: 600,
                    },
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: T.accent,
                    height: 2.5,
                    borderRadius: 2,
                  },
                }}
              >
                {CATEGORIES.map((category) => (
                  <Tab key={category} label={category} value={category} />
                ))}
              </Tabs>
            </Box>

            {/* Liste articles */}
            <Grid container spacing={3}>
              {displayedArticles.length === 0 ? (
                <Grid size={{ xs: 12 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 6,
                      textAlign: 'center',
                      borderRadius: 3,
                      border: `1px dashed ${T.border}`,
                      backgroundColor: T.surface,
                    }}
                  >
                    <Typography sx={{ color: T.textMuted, fontSize: '1rem' }}>
                      Aucun article dans cette catégorie pour le moment.
                    </Typography>
                  </Paper>
                </Grid>
              ) : (
                displayedArticles.map((article, index) => (
                  <Grid size={{ xs: 12 }} key={article.id}>
                    <Grow in timeout={400 + index * 80}>
                      <Card
                        elevation={0}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          borderRadius: 3,
                          overflow: 'hidden',
                          border: `1px solid ${T.border}`,
                          backgroundColor: T.surface,
                          transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            boxShadow: `0 20px 40px -14px ${alpha(T.dark, 0.12)}`,
                            borderColor: alpha(T.accent, 0.4),
                            '& .article-img': {
                              transform: 'scale(1.05)',
                            },
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: '100%', sm: 260 },
                            height: { xs: 200, sm: 210 },
                            flexShrink: 0,
                            overflow: 'hidden',
                            position: 'relative',
                          }}
                        >
                          <CardMedia
                            component="img"
                            className="article-img"
                            image={article.image}
                            alt={article.title}
                            onError={handleImageError}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              transition: 'transform 0.6s ease',
                            }}
                          />
                        </Box>

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
                              gap: 1.25,
                              mb: 1.25,
                            }}
                          >
                            <Chip
                              label={article.category}
                              size="small"
                              sx={{
                                bgcolor: alpha(T.accent, 0.12),
                                color: T.accentHover,
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 24,
                                borderRadius: 1.5,
                              }}
                            />
                            <Typography
                              variant="caption"
                              sx={{ color: T.textMuted, fontWeight: 500 }}
                            >
                              {article.date}
                            </Typography>
                          </Box>

                          <Typography
                            sx={{
                              fontFamily: '"Playfair Display", serif',
                              fontWeight: 600,
                              color: T.textPrimary,
                              mb: 1.25,
                              fontSize: '1.15rem',
                              lineHeight: 1.35,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {article.title}
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: T.textSecondary,
                              mb: 2.5,
                              flex: 1,
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              lineHeight: 1.6,
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
                              gap: 1.5,
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Avatar
                                sx={{
                                  width: 28,
                                  height: 28,
                                  bgcolor:
                                    AVATAR_COLORS[article.id % AVATAR_COLORS.length],
                                  fontSize: '0.68rem',
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(article.author)}
                              </Avatar>
                              <Typography
                                variant="caption"
                                sx={{ color: T.textSecondary, fontWeight: 500 }}
                              >
                                {article.author}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleLike(article.id)}
                                sx={{
                                  color: likedArticles[article.id]
                                    ? T.danger
                                    : T.textMuted,
                                  p: 0.6,
                                }}
                              >
                                {likedArticles[article.id] ? (
                                  <Favorite sx={{ fontSize: 17 }} />
                                ) : (
                                  <FavoriteBorder sx={{ fontSize: 17 }} />
                                )}
                              </IconButton>
                              <Typography
                                variant="caption"
                                sx={{ color: T.textMuted, mr: 1 }}
                              >
                                {article.likes +
                                  (likedArticles[article.id] ? 1 : 0)}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={() => handleBookmark(article.id)}
                                sx={{
                                  color: bookmarkedArticles[article.id]
                                    ? T.dark
                                    : T.textMuted,
                                  p: 0.6,
                                }}
                              >
                                {bookmarkedArticles[article.id] ? (
                                  <Bookmark sx={{ fontSize: 17 }} />
                                ) : (
                                  <BookmarkBorder sx={{ fontSize: 17 }} />
                                )}
                              </IconButton>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
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
                  gap: 2.5,
                  mt: 6,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                  startIcon={<ArrowBack sx={{ fontSize: 17 }} />}
                  sx={{
                    borderRadius: 50,
                    borderColor: T.border,
                    color: T.dark,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    '&:hover': {
                      borderColor: T.accent,
                      color: T.accent,
                      bgcolor: T.accentSoft,
                    },
                    '&.Mui-disabled': {
                      borderColor: T.border,
                      color: T.textMuted,
                    },
                  }}
                >
                  Précédent
                </Button>

                <Typography
                  variant="body2"
                  sx={{ color: T.textMuted, fontWeight: 500, minWidth: 50, textAlign: 'center' }}
                >
                  {currentPage + 1} / {totalPages}
                </Typography>

                <Button
                  variant="outlined"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={currentPage === totalPages - 1}
                  endIcon={<ArrowForward sx={{ fontSize: 17 }} />}
                  sx={{
                    borderRadius: 50,
                    borderColor: T.border,
                    color: T.dark,
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 2.5,
                    py: 1,
                    '&:hover': {
                      borderColor: T.accent,
                      color: T.accent,
                      bgcolor: T.accentSoft,
                    },
                    '&.Mui-disabled': {
                      borderColor: T.border,
                      color: T.textMuted,
                    },
                  }}
                >
                  Suivant
                </Button>
              </Box>
            )}
          </Grid>

          {/* ─── SIDEBAR ──────────────────────────────── */}
          <Grid size={{ xs: 12, md: 4 }}>
            {/* About */}
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                mb: 3.5,
                borderRadius: 3,
                textAlign: 'center',
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
              }}
            >
              <Avatar
                sx={{
                  width: 84,
                  height: 84,
                  mx: 'auto',
                  mb: 2.25,
                  backgroundColor: T.dark,
                  border: `2px solid ${T.accent}`,
                }}
              >
                <Typography
                  sx={{
                    fontSize: '2.1rem',
                    fontWeight: 300,
                    fontFamily: '"Playfair Display", serif',
                    color: T.accent,
                  }}
                >
                  E
                </Typography>
              </Avatar>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  color: T.textPrimary,
                  mb: 1.25,
                }}
              >
                Elegance Times
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: T.textSecondary, lineHeight: 1.75, mb: 2.5 }}
              >
                Votre magazine de mode et d'élégance. Découvrez les tendances,
                les conseils et l'inspiration pour un style raffiné.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 1.25,
                }}
              >
                {[Facebook, Twitter, Instagram, YouTube].map((Icon, i) => (
                  <IconButton
                    key={i}
                    size="small"
                    sx={{
                      color: T.dark,
                      border: `1px solid ${T.border}`,
                      borderRadius: 2,
                      width: 38,
                      height: 38,
                      transition: 'all 0.25s',
                      '&:hover': {
                        borderColor: T.accent,
                        color: T.accent,
                        bgcolor: T.accentSoft,
                      },
                    }}
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                ))}
              </Box>
            </Paper>

            {/* Articles populaires */}
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                mb: 3.5,
                borderRadius: 3,
                backgroundColor: T.surface,
                border: `1px solid ${T.border}`,
              }}
            >
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  color: T.textPrimary,
                  mb: 2.5,
                }}
              >
                Articles populaires
              </Typography>

              {ARTICLES_POPULAIRES.map((article, idx) => (
                <Box key={article.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 2,
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'opacity 0.2s',
                      '&:hover': { opacity: 0.85 },
                    }}
                  >
                    <Box
                      component="img"
                      src={article.image}
                      alt={article.title}
                      onError={handleImageError}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        objectFit: 'cover',
                        flexShrink: 0,
                        backgroundColor: '#F3F2EF',
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: T.textPrimary,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          fontSize: '0.88rem',
                          lineHeight: 1.4,
                          mb: 0.5,
                        }}
                      >
                        {article.title}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: T.textMuted, fontWeight: 500 }}
                      >
                        {article.date}
                      </Typography>
                    </Box>
                  </Box>
                  {idx < ARTICLES_POPULAIRES.length - 1 && (
                    <Divider sx={{ my: 2.25, borderColor: T.border }} />
                  )}
                </Box>
              ))}
            </Paper>

            {/* Newsletter */}
            <Paper
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3,
                backgroundColor: T.dark,
                color: '#FFF',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: -40,
                  right: -40,
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  bgcolor: alpha(T.accent, 0.08),
                }}
              />
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  mb: 1.25,
                  position: 'relative',
                }}
              >
                Newsletter
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: alpha('#FFFFFF', 0.7),
                  mb: 2.5,
                  lineHeight: 1.6,
                  position: 'relative',
                }}
              >
                Recevez nos articles et actualités chaque semaine.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.25, position: 'relative' }}>
                <TextField
                  placeholder="Votre email"
                  size="small"
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: alpha('#FFFFFF', 0.08),
                      borderRadius: 2,
                      '& input': {
                        color: '#FFF',
                        fontSize: '0.9rem',
                      },
                      '& fieldset': {
                        borderColor: alpha('#FFFFFF', 0.15),
                      },
                      '&:hover fieldset': {
                        borderColor: alpha(T.accent, 0.5),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: T.accent,
                      },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: T.accent,
                    color: T.dark,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    px: 2.5,
                    minWidth: 64,
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: T.accentHover,
                      boxShadow: 'none',
                    },
                  }}
                >
                  OK
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* ─── FOOTER ───────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: T.dark,
          color: alpha('#FFFFFF', 0.7),
          py: 6,
          mt: 6,
          borderTop: `1px solid ${alpha('#FFFFFF', 0.06)}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography
                sx={{
                  fontFamily: '"Playfair Display", serif',
                  fontSize: '1.6rem',
                  color: '#FFF',
                  fontWeight: 300,
                  mb: 1.5,
                }}
              >
                Elegance Times
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.8, maxWidth: 280 }}>
                L'excellence de la mode et de l'élégance au quotidien.
              </Typography>
            </Grid>

            <Grid size={{ xs: 6, md: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: '#FFF', fontWeight: 600, mb: 1.75, letterSpacing: 0.5 }}
              >
                Catégories
              </Typography>
              <Stack spacing={1}>
                {['Mode', 'Tendances', 'Accessoires', 'Conseils'].map((c) => (
                  <Typography
                    key={c}
                    variant="body2"
                    component="a"
                    href="#"
                    sx={{
                      color: alpha('#FFFFFF', 0.55),
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: T.accent },
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
                sx={{ color: '#FFF', fontWeight: 600, mb: 1.75, letterSpacing: 0.5 }}
              >
                Liens
              </Typography>
              <Stack spacing={1}>
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
                      color: alpha('#FFFFFF', 0.55),
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      '&:hover': { color: T.accent },
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
                sx={{ color: '#FFF', fontWeight: 600, mb: 1.75, letterSpacing: 0.5 }}
              >
                Contact
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  mb: 1,
                }}
              >
                <Email sx={{ fontSize: 17, color: T.accent }} />
                contact@elegancetimes.com
              </Typography>
              <Typography variant="body2">Abidjan, Côte d'Ivoire</Typography>
            </Grid>
          </Grid>

          <Divider
            sx={{ my: 4, borderColor: alpha('#FFFFFF', 0.08) }}
          />

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: alpha('#FFFFFF', 0.4),
              fontSize: '0.82rem',
            }}
          >
            © 2024–2026 Elegance Times. Tous droits réservés.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default EleganceTimesOnline;