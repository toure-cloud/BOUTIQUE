// src/hooks/useFormMessages.js
import { useCallback, useState } from 'react';

export function useFormMessages() {
  const [message, setMessage] = useState(null);
  // message = { type: 'success'|'error'|'warning'|'info', title, text, details }

  const success = useCallback((text, title = 'Succès') => {
    setMessage({ type: 'success', title, text, details: null });
  }, []);

  const error = useCallback((text, details = null, title = 'Erreur') => {
    setMessage({ type: 'error', title, text, details });
  }, []);

  const warning = useCallback((text, title = 'Attention') => {
    setMessage({ type: 'warning', title, text, details: null });
  }, []);

  const info = useCallback((text, title) => {
    setMessage({ type: 'info', title, text, details: null });
  }, []);

  const clear = useCallback(() => setMessage(null), []);

  return { message, success, error, warning, info, clear, setMessage };
}

export default useFormMessages;