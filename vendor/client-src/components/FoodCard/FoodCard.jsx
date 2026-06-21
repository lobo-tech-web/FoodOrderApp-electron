import { useState } from 'react';

// ---- MATERIAL UI ----
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  useMediaQuery,
  useTheme,
  Box,
  Chip,
  Grow,
  Tooltip,
  CardActionArea,
} from '@mui/material';
//<--------------------

// FONT-AWESOME ------->
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faWheatAwn,
  faSeedling,
  faStar,
  faFire,
} from '@fortawesome/free-solid-svg-icons';
// <-------------------

export const FoodCard = ({ product, imageDefault, onProductClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  // Estado para manejar error de imagen
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  // Determinar qué imagen mostrar
  const getImageSrc = () => {
    // Si no hay imagen o está vacía, o hubo error, usar logo del local
    if (!product?.image || product.image === '' || imageError)
      return imageDefault;
    return product.image;
  };

  // COMPONENTE PARA RE-UTILIZAR LAS ETIQUETAS DE VEGGIE Y SIN TACC
  const renderCustomLabels = (isActive, icon, color, label) => {
    if (!isActive) return null;
    return (
      <Tooltip title={label} arrow>
        <Chip
          icon={<FontAwesomeIcon icon={icon} style={{ color }} />}
          label={label}
          variant="outlined"
          size={isMobile ? 'small' : 'medium'}
          sx={{
            fontFamily: 'fontFamily.secondary',
            color,
            borderColor: color,
            m: 0.5,
            '& .MuiChip-icon': {
              color,
            },
            '& .MuiChip-label': {
              fontSize: isMobile ? '0.7rem' : '0.8rem',
            },
          }}
        />
      </Tooltip>
    );
  };

  const originalPrice = Math.round(product.price).toLocaleString('es-AR');
  const discountedPrice =
    product.discount > 0
      ? (
          Math.round((product.price * (1 - product.discount / 100)) / 100) * 100
        ).toLocaleString('es-AR')
      : originalPrice;

  return (
    <Grow in={true} timeout={500}>
      <Box sx={{ position: 'relative', display: 'block', width: '100%' }}>
        <Card
          sx={{
            display: 'flex',
            flexDirection: 'row',
            bgcolor: 'background.default',
            color: 'text.primary',
            transition: 'all 0.3s ease',
            transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: isHovered ? 6 : 2,
            width: '100%',
            borderRadius: { xs: 2, sm: 3 },
            overflow: 'visible',
            position: 'relative',
            border: isHovered ? '1px solid' : 'none',
            borderColor: 'text.primary',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* TITULO ESPECIAL */}
          {product.specialTitle && (
            <Box
              sx={{
                position: 'absolute',
                top: isMobile ? 8 : 12,
                left: isMobile ? 8 : 16,
                zIndex: 10,
                bgcolor: 'text.primary',
                color: 'text.secondary',
                padding: isMobile ? '4px 6px' : '6px 12px',
                borderRadius: '12px',
                fontSize: isMobile ? '0.6rem' : '0.8rem',
                fontFamily: 'fontFamily.secondary',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.3)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.3s ease',
              }}
            >
              <FontAwesomeIcon
                icon={faFire}
                style={{ fontSize: isMobile ? '0.6rem' : '0.7rem' }}
              />
              {product.specialTitle}
            </Box>
          )}
          <CardActionArea
            onClick={() => onProductClick(product)}
            sx={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'nowrap',
              width: '100%',
            }}
          >
            <CardContent
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: 1.5, sm: 2.5 },
                minWidth: 0,
                overflow: 'hidden',
                pt: product.specialTitle
                  ? { xs: 4, sm: 4.5 }
                  : { xs: 2, sm: 3 },
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                {/* NOMBRE DEL PRODUCTO */}
                <Typography
                  variant="div"
                  sx={{
                    fontFamily: 'fontFamily.primary',
                    color: 'text.primary',
                    fontSize: { xs: '1rem', sm: '1.2rem', md: '2rem' },
                    lineHeight: 1.2,
                    mb: 1,
                    mt: { xs: 0.5, sm: 0 },
                    wordWrap: 'break-word',
                    width: '100%',
                  }}
                >
                  {product.name}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    mb: 1,
                  }}
                >
                  {product.isVeggie &&
                    renderCustomLabels(
                      product.isVeggie,
                      faSeedling,
                      '#4caf50',
                      'Vegetariano'
                    )}
                  {product.isSinTacc &&
                    renderCustomLabels(
                      product.isSinTacc,
                      faWheatAwn,
                      '#ffc107',
                      'Sin TACC'
                    )}
                </Box>

                {/* DESCRIPCIÓN */}
                {product.description && (
                  <Typography
                    variant="body1"
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'text.terciary',
                      fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.9rem' },
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      minHeight: { xs: '1.3rem', sm: '1.8rem' },
                      mb: 1,
                    }}
                  >
                    {product.description}
                  </Typography>
                )}

                {product.discount > 0 && (
                  <Chip
                    label={`-${Math.floor(product.discount)}% OFF`}
                    variant="filled"
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      fontSize: isMobile ? '0.65rem' : '0.8rem',
                    }}
                  />
                )}
              </Box>

              {/* PRECIO */}
              {product.price > 0 && (
                <Box
                  sx={{
                    mt: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    {product.discount > 0 && (
                      <Typography
                        variant="body2"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'gray',
                          fontSize: {
                            xs: '0.7rem',
                            sm: '0.8rem',
                            md: '0.9rem',
                          },
                          fontFamily: 'fontFamily.secondary',
                        }}
                      >
                        ${originalPrice}
                      </Typography>
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'text.primary',
                        fontSize: {
                          xs: '1rem',
                          sm: '1.2rem',
                          md: '1.4rem',
                        },
                      }}
                    >
                      ${discountedPrice}
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* PUNTOS */}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: 1,
                  mt: 1,
                }}
              >
                {/* PUNTOS ACUMULABLES */}
                {product.rewardPoints > 0 && (
                  <Chip
                    icon={
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ fontSize: '0.7rem' }}
                      />
                    }
                    label={`+${product.rewardPoints} pts.`}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      '& .MuiChip-label': {
                        fontSize: isMobile ? '0.65rem' : '0.75rem',
                      },
                    }}
                  />
                )}
                {/* PUNTOS CANJEABLES */}
                {product.redeemPoints > 0 && (
                  <Chip
                    icon={
                      <FontAwesomeIcon
                        icon={faStar}
                        style={{ fontSize: '0.7rem' }}
                      />
                    }
                    label={`- ${product.redeemPoints} pts.`}
                    color="primary"
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      '& .MuiChip-label': {
                        fontSize: isMobile ? '0.80rem' : '0.75rem',
                      },
                    }}
                  />
                )}
              </Box>
            </CardContent>

            <Box
              sx={{
                position: 'relative',
                width: { xs: '35%', sm: '30%' },
                minWidth: { xs: '100px', sm: '120px' },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  width: isMobile ? '100%' : 151,
                  height: isMobile ? '100%' : 'auto',
                  objectFit: isMobile ? 'cover' : 'contain',
                  transition: 'transform 0.3s ease',
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                }}
                image={getImageSrc()}
                alt={product?.name}
                onError={handleImageError}
              />
            </Box>
          </CardActionArea>
        </Card>
      </Box>
    </Grow>
  );
};
