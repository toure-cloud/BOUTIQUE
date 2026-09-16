// src/components/FormAlert.jsx
import React from 'react';
import { Alert, AlertTitle, Box, List, ListItem, ListItemText } from '@mui/material';

/**
 * Affiche un message de succès ou d'erreur dans le formulaire.
 *
 * Props :
 * - type      : 'success' | 'error' | 'warning' | 'info'
 * - title     : titre optionnel
 * - message   : message principal (string)
 * - details   : objet { champ: [erreurs] } pour les erreurs de validation
 * - onClose   : callback optionnel pour fermer
 */
const FormAlert = ({ type = 'info', title, message, details, onClose }) => {
  if (!message && (!details || Object.keys(details).length === 0)) return null;

  // Formate les détails de validation (backend Django)
  const detailEntries = details
    ? Object.entries(details).map(([champ, msgs]) => ({
        champ,
        msgs: Array.isArray(msgs) ? msgs : [String(msgs)],
      }))
    : [];

  return (
    <Alert
      severity={type}
      onClose={onClose}
      sx={{
        mb: 2.5,
        borderRadius: '12px',
        alignItems: 'flex-start',
        '& .MuiAlert-message': { width: '100%' },
      }}
    >
      {title && <AlertTitle sx={{ fontWeight: 700 }}>{title}</AlertTitle>}

      {message && (
        <Box component="span" sx={{ display: 'block', whiteSpace: 'pre-line' }}>
          {message}
        </Box>
      )}

      {detailEntries.length > 0 && (
        <List dense disablePadding sx={{ mt: 0.5 }}>
          {detailEntries.map(({ champ, msgs }) => (
            <ListItem key={champ} disablePadding sx={{ py: 0.2 }}>
              <ListItemText
                primary={
                  <Box component="span" sx={{ fontSize: '0.85rem' }}>
                    <strong>{champ} :</strong>{' '}
                    {msgs.map((m, i) => (
                      <span key={i}>
                        {i > 0 && ' · '}
                        {String(m).replace(/^"|"$/g, '')}
                      </span>
                    ))}
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Alert>
  );
};

export default FormAlert;