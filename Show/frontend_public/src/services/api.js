// frontend_public/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

// ✅ PAS de token ici ! C'est une API publique.
export default api;