import { useState } from 'react';

// ---- MATERIAL UI ----
import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
// <--------------------

// ---- STYLES ----
const buttonStyle = {
  bgcolor: 'primary.main',
  color: 'text.terciary',
  fontFamily: 'fontFamily.terciary',
  borderRadius: '8px',
  px: 3,
  py: 1,
  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  '&:hover': {
    bgcolor: 'background.paper',
    color: 'primary.main',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
  },
};
// ----------------

export const CustomOptionNavBar = ({ handleRefresh, addCustom }) => {
  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{
        width: '100%',
        borderRadius: '8px',
        mb: 2,
        bgcolor: 'background.main',
      }}
    >
      <Toolbar
        sx={{
          display: 'flex',
          overflow: 'auto',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          px: { xs: 1, sm: 2 },
          py: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            alignItems: 'center',
            justifyContent: 'flex-start',
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          <Button onClick={handleRefresh}>
            <RefreshIcon
              sx={{
                fontSize: '2rem',
                bgcolor: 'transparent',
                color: 'primary.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'transparent',
                },
              }}
            />
          </Button>
          <Button
            startIcon={<AddIcon />}
            onClick={addCustom}
            variant="contained"
            sx={{ ...buttonStyle, bgcolor: 'success.main' }}
          >
            Nueva Personalización
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
