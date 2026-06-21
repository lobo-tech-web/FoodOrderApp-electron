import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ---- MATERIAL UI ----
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Badge,
  Slide,
} from '@mui/material';
// ICONS
import ReceiptIcon from '@mui/icons-material/Receipt';
// ---------------------

// ---- CONTEXT ----
import { useCart } from '@/context/Cart.jsx';
// -----------------

export const CartNavBar = ({ linkToCart }) => {
  // DETECTAMOS SI EL USUARIO ESTA EN MÓVIL
  const themeMobile = useTheme();
  const isMobile = useMediaQuery(themeMobile.breakpoints.down('sm'));
  const [showAnimation, setShowAnimation] = useState(false);
  const [prevCartLength, setPrevCartLength] = useState(0);

  const { cartItems, totalOrderAmount, totalRedeemPoints } = useCart();

  useEffect(() => {
    if (cartItems.length > prevCartLength) {
      setShowAnimation(true);
      const timer = setTimeout(() => {
        setShowAnimation(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    setPrevCartLength(cartItems.length);
  }, [cartItems.length, prevCartLength]);

  const totalItems = cartItems.reduce((acc, item) => acc + 1, 0);

  if (cartItems.length === 0) return null;

  return (
    <Slide direction="up" in={true}>
      <AppBar
        position="fixed"
        sx={{
          top: 'auto',
          bottom: 15,
          left: 0,
          right: 0,
          mx: 'auto',
          width: { xs: '90%', sm: '70%' },
          bgcolor: 'primary.main',
          color: 'text.secondary',
          boxShadow: '0px -2px 8px rgba(0,0,0,0.15)',
          borderRadius: isMobile ? '30px' : '20px',
          transition: 'transform 0.3s ease',
          transform: showAnimation ? 'scale(1.03)' : 'scale(1)',
        }}
      >
        <Toolbar sx={{ px: isMobile ? 1 : 2 }}>
          <Button
            component={Link}
            to={linkToCart}
            color="inherit"
            sx={{
              width: '100%',
              textTransform: 'none',
              fontSize: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255,255,255,0.08)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Badge
                badgeContent={totalItems}
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: isMobile ? '0.5rem' : '0.9rem',
                    animation: showAnimation ? 'pulse 1s' : 'none',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(1)' },
                      '50%': { transform: 'scale(1.3)' },
                      '100%': { transform: 'scale(1)' },
                    },
                  },
                }}
              >
                <ReceiptIcon
                  sx={{
                    fontSize: isMobile ? '1.2rem' : '1.8rem',
                    animation: showAnimation ? 'wiggle 0.5s ease' : 'none',
                    '@keyframes wiggle': {
                      '0%': { transform: 'rotate(0deg)' },
                      '25%': { transform: 'rotate(-10deg)' },
                      '50%': { transform: 'rotate(10deg)' },
                      '75%': { transform: 'rotate(-5deg)' },
                      '100%': { transform: 'rotate(0deg)' },
                    },
                  }}
                />
              </Badge>

              <Typography
                variant={isMobile ? 'body2' : 'h6'}
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  ml: 0.5,
                }}
              >
                VER MI PEDIDO
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography
                variant={isMobile ? 'body2' : 'h6'}
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  animation: showAnimation ? 'fadeIn 0.5s' : 'none',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              >
                {totalOrderAmount > 0 &&
                  `TOTAL: $${totalOrderAmount.toLocaleString('es-AR')}`}
              </Typography>
              <Typography
                variant={isMobile ? 'body2' : 'h6'}
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  animation: showAnimation ? 'fadeIn 0.5s' : 'none',
                  '@keyframes fadeIn': {
                    '0%': { opacity: 0.5 },
                    '100%': { opacity: 1 },
                  },
                }}
              >
                {totalRedeemPoints > 0 && `${totalRedeemPoints} PTS.`}
              </Typography>
            </Box>
          </Button>
        </Toolbar>
      </AppBar>
    </Slide>
  );
};
