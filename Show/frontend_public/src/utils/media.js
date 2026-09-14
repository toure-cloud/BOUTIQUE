
export const getMediaUrl = (path) => {
  if (!path) return '';

  // Si c'est déjà une URL absolue (http, https, data, blob), on la retourne telle quelle
  if (/^(https?:)?\/\//i.test(path) || /^(data|blob):/i.test(path)) {
    return path;
  }

  // Récupère la base depuis l'env (ex: http://localhost:8000)
  const baseUrl = (import.meta.env.VITE_MEDIA_URL || '').replace(/\/+$/, '');

  // Si VITE_MEDIA_URL contient déjà /media, on évite le doublon
  const hasMediaSuffix = /\/media$/.test(baseUrl);
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // Si le chemin commence déjà par /media/, on ne rajoute pas /media
  if (cleanPath.startsWith('/media/')) {
    return `${baseUrl.replace(/\/media$/, '')}${cleanPath}`;
  }

  return `${baseUrl}${hasMediaSuffix ? '' : '/media'}${cleanPath}`;
};
