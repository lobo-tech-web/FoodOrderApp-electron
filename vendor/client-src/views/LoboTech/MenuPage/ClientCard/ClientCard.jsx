import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Fade,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// ICONS
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
// ---------------------

export const ClientCard = ({ name, location, logo, route }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      sx={{
        borderRadius: 4,
        overflow: 'visible',
        position: 'relative',
        width: isMobile ? '100%' : 'auto',
        display: 'flex',
        flexDirection: 'row',
        background:
          'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 100%)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-10px)' : 'translateY(0)',
        boxShadow: isHovered
          ? '0 12px 20px rgba(0,0,0,0.3)'
          : '0 4px 12px rgba(0,0,0,0.2)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* LOGO */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: '25%', sm: '20%' },
          minWidth: { xs: '100px', sm: '120px' },
          bgcolor: 'rgba(0,0,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={logo}
          alt={name}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.5s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background:
              'radial-gradient(circle, rgba(0,0,0,0) 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          p: 3,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontFamily: 'fontFamily.terciary',
            color: 'white',
            fontSize: isMobile ? '1rem' : '1.5rem',
            fontWeight: 'bold',
            mb: 1,
          }}
        >
          {name}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            mt: 1,
            mb: 2,
          }}
        >
          <LocationOnIcon sx={{ color: '#FFF', mr: 1, fontSize: '1rem' }} />
          <Typography
            variant="body1"
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: '#FFF',
              fontSize: isMobile ? '0.7rem' : '1rem',
            }}
          >
            {location}
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1 }} />

        <Fade in={true} timeout={300}>
          <Button
            variant="contained"
            fullWidth
            size={isMobile ? 'small' : 'medium'}
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate(route)}
            sx={{
              mt: 2,
              fontFamily: 'fontFamily.secondary',
              fontWeight: 'bold',
              py: 1,
              borderRadius: 8,
              background: 'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
              color: '#000',
              boxShadow: '0 4px 12px rgba(245, 166, 35, 0.5)',
              transition: 'all 0.3s',
              '&:hover': {
                boxShadow: '0 6px 15px rgba(245, 166, 35, 0.6)',
              },
            }}
          >
            VER MENÚ
          </Button>
        </Fade>
      </CardContent>
    </Card>
  );
};
