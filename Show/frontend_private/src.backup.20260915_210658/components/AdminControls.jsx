// frontend_private/src/components/AdminControls.jsx
import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import {
  Mic,
  MicOff,
  Videocam,
  VideocamOff,
  ScreenShare,
  StopScreenShare,
  CheckCircle,
  Cancel,
} from '@mui/icons-material';

const AdminControls = ({ participant, onControlChange }) => {
  const [controls, setControls] = useState({
    micAllowed: true,
    cameraAllowed: true,
    canShareScreen: true,
  });

  const handleToggle = (control) => {
    const newState = !controls[control];
    setControls({ ...controls, [control]: newState });
    if (onControlChange) {
      onControlChange({ ...controls, [control]: newState });
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        🎮 Contrôles admin
        <Chip
          label="En direct"
          size="small"
          sx={{ bgcolor: '#E53935', color: '#FFFFFF', fontWeight: 700 }}
        />
      </Typography>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={2}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {controls.micAllowed ? <Mic sx={{ color: '#2E7D32' }} /> : <MicOff sx={{ color: '#EF4444' }} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Microphone
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={controls.micAllowed}
                onChange={() => handleToggle('micAllowed')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2E7D32',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: '#2E7D32',
                  },
                }}
              />
            }
            label={controls.micAllowed ? 'Autorisé' : 'Bloqué'}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {controls.cameraAllowed ? <Videocam sx={{ color: '#2E7D32' }} /> : <VideocamOff sx={{ color: '#EF4444' }} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Caméra
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={controls.cameraAllowed}
                onChange={() => handleToggle('cameraAllowed')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2E7D32',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: '#2E7D32',
                  },
                }}
              />
            }
            label={controls.cameraAllowed ? 'Autorisée' : 'Bloquée'}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {controls.canShareScreen ? <ScreenShare sx={{ color: '#2E7D32' }} /> : <StopScreenShare sx={{ color: '#EF4444' }} />}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              Partage d'écran
            </Typography>
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={controls.canShareScreen}
                onChange={() => handleToggle('canShareScreen')}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#2E7D32',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    bgcolor: '#2E7D32',
                  },
                }}
              />
            }
            label={controls.canShareScreen ? 'Autorisé' : 'Bloqué'}
          />
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Alert severity="info" sx={{ borderRadius: '8px' }}>
        <Typography variant="caption" sx={{ display: 'block' }}>
          🔒 Les contrôles s'appliquent en temps réel au participant.
        </Typography>
      </Alert>

      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#2E7D32',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#1B5E20' },
          }}
          onClick={() => {
            setControls({ micAllowed: true, cameraAllowed: true, canShareScreen: true });
            if (onControlChange) {
              onControlChange({ micAllowed: true, cameraAllowed: true, canShareScreen: true });
            }
          }}
        >
          ✅ Tout autoriser
        </Button>
        <Button
          variant="contained"
          fullWidth
          sx={{
            bgcolor: '#C62828',
            color: '#FFFFFF',
            '&:hover': { bgcolor: '#B71C1C' },
          }}
          onClick={() => {
            setControls({ micAllowed: false, cameraAllowed: false, canShareScreen: false });
            if (onControlChange) {
              onControlChange({ micAllowed: false, cameraAllowed: false, canShareScreen: false });
            }
          }}
        >
          🚫 Tout bloquer
        </Button>
      </Box>
    </Paper>
  );
};

export default AdminControls;