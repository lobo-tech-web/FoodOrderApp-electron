import { useState } from 'react';
// ---- MATERIAL UI ----
import {
  Grow,
  Typography,
  Card,
  CardMedia,
  CardContent,
  CardActionArea,
  useMediaQuery,
  useTheme,
} from '@mui/material';
// <-------------------

export const FoodGridCard = ({ product, imageDefault, onProductClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Estado para manejar error de imagen
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    setImageError(true);
  };

  // Determinar qué imagen mostrar
  const getImageSrc = () => {
    if (!product?.image || product.image === '' || imageError)
      return imageDefault;
    return product.image;
  };

  return (
    <Grow in={true} timeout={500}>
      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
          color: 'text.primary',
          width: '100%',
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 2,
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.03)',
            boxShadow: 6,
          },
        }}
      >
        <CardActionArea onClick={() => onProductClick(product)}>
          <CardMedia
            component="img"
            sx={{
              width: '100%',
              height: isMobile ? 60 : 70,
              objectFit: isMobile ? 'cover' : 'contain',
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
            image={getImageSrc()}
            alt={product?.name}
            onError={handleImageError}
          />
          <CardContent sx={{ flexGrow: 1, p: 1.5, textAlign: 'center' }}>
            <Typography
              variant="subtitle1"
              component="h3"
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.primary',
                fontSize: isMobile ? '1rem' : '1.5rem',
                fontWeight: 'bold',
                minHeight: '1.5em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 0.5,
              }}
            >
              {product.name}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </Grow>
  );
};
