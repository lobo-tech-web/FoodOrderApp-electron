import { useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  Edit as EditIcon,
  ExpandLess,
  ExpandMore,
  Settings as SettingsIcon,
  Star as StarIcon,
  LocalOffer as DiscountIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
} from '@mui/icons-material';

// ---- LOGO ----
import lobotechLogo from '@/assets/main/logo-lobotech-oj.png';
// --------------

const formatCurrency = (value) => {
  const number = Number(value) || 0;

  return number.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  });
};

const getDiscountedPrice = (price, discount) => {
  const parsedPrice = Number(price) || 0;
  const parsedDiscount = Number(discount) || 0;

  if (parsedDiscount <= 0) return parsedPrice;

  return Math.round((parsedPrice * (1 - parsedDiscount / 100)) / 100) * 100;
};

const getRelationData = (option) => {
  return (
    option?.ProductCustomOption ||
    option?.productCustomOption ||
    option?.product_custom_option ||
    {}
  );
};

export const ProductCard = ({ product, onEditProduct }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [imageError, setImageError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isActive = Boolean(product.status);

  const hasProductCustomOptions =
    Array.isArray(product.productCustomOptions) &&
    product.productCustomOptions.length > 0;

  const imageSrc =
    product?.image && product.image !== '' && !imageError
      ? product.image
      : lobotechLogo;

  const originalPrice = Number(product.price) || 0;
  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const hasDiscount = Number(product.discount) > 0;

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: isActive ? 'background.paper' : 'rgba(120, 120, 120, 0.18)',
        color: isActive ? 'text.primary' : 'text.secondary',
        borderRadius: 2,
        border: '1px solid',
        borderColor: hasProductCustomOptions
          ? 'primary.main'
          : 'rgba(184, 182, 186, 0.22)',
        opacity: isActive ? 1 : 0.65,
        overflow: 'hidden',
        transition: 'transform 180ms ease, box-shadow 180ms ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 104px', sm: '1fr 118px' },
          minHeight: 150,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 1.5, sm: 2 },
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.primary',
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontSize: { xs: 15, sm: 17 },
                  lineHeight: 1.15,
                  wordBreak: 'break-word',
                }}
              >
                {product.name}
              </Typography>

              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.primary',
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                CATEGORIA:{' '}
                {product.category?.name || product.category || 'Sin categoría'}
              </Typography>
            </Box>

            <Tooltip
              title={
                hasProductCustomOptions
                  ? 'Tiene opciones nuevas asignadas'
                  : 'Sin opciones nuevas'
              }
              arrow
            >
              <Chip
                size="small"
                icon={<SettingsIcon sx={{ fontSize: 15 }} />}
                label={hasProductCustomOptions ? 'NUEVAS' : 'SIN OPC.'}
                color={hasProductCustomOptions ? 'primary' : 'default'}
                variant={hasProductCustomOptions ? 'filled' : 'outlined'}
                sx={{
                  fontFamily: 'fontFamily.primary',
                  fontSize: 10,
                  height: 24,
                }}
              />
            </Tooltip>
          </Box>

          {product.description && (
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: isActive ? 'text.terciary' : 'text.secondary',
                fontSize: 12,
                mt: 1,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {product.description}
            </Typography>
          )}

          <Box
            sx={{
              mt: 'auto',
              pt: 1.2,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.7,
              alignItems: 'center',
            }}
          >
            <Chip
              size="small"
              icon={isActive ? <ActiveIcon /> : <InactiveIcon />}
              label={isActive ? 'ACTIVO' : 'DESACTIVADO'}
              color={isActive ? 'success' : 'default'}
              sx={{
                fontFamily: 'fontFamily.primary',
                fontSize: 10,
              }}
            />

            {hasDiscount && (
              <Chip
                size="small"
                icon={<DiscountIcon />}
                label={`${Number(product.discount)}% OFF`}
                color="primary"
                sx={{
                  fontFamily: 'fontFamily.primary',
                  fontSize: 10,
                }}
              />
            )}
          </Box>
        </CardContent>

        <Box
          sx={{
            position: 'relative',
            bgcolor: 'rgba(0, 0, 0, 0.08)',
            display: 'grid',
            placeItems: 'center',
          }}
        >
          <CardMedia
            component="img"
            image={imageSrc}
            alt={product.name}
            onError={() => setImageError(true)}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: isActive ? 'none' : 'grayscale(1)',
            }}
          />
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'primary.main' }} />

      <Box
        sx={{
          px: { xs: 1.5, sm: 2 },
          py: 1.2,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <Box>
          {hasDiscount && (
            <Typography
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.secondary',
                fontSize: 12,
                textDecoration: 'line-through',
                lineHeight: 1,
              }}
            >
              {formatCurrency(originalPrice)}
            </Typography>
          )}

          <Typography
            sx={{
              fontFamily: 'fontFamily.primary',
              color: isActive ? 'primary.main' : 'text.secondary',
              fontSize: { xs: 18, sm: 20 },
              lineHeight: 1.1,
            }}
          >
            {formatCurrency(discountedPrice)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 0.7,
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          {Number(product.rewardPoints) > 0 && (
            <Chip
              size="small"
              icon={<StarIcon />}
              label={`+${product.rewardPoints} pts`}
              color="primary"
              variant="outlined"
              sx={{ fontFamily: 'fontFamily.secondary', fontSize: 11 }}
            />
          )}

          {Number(product.redeemPoints) > 0 && (
            <Chip
              size="small"
              icon={<StarIcon />}
              label={`Canje ${product.redeemPoints}`}
              color="primary"
              variant="outlined"
              sx={{ fontFamily: 'fontFamily.secondary', fontSize: 11 }}
            />
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: 'primary.main' }} />

      <Box
        sx={{
          px: { xs: 1, sm: 1.5 },
          py: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        <Button
          size="small"
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => onEditProduct(product)}
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.terciary',
            borderRadius: 1.5,
          }}
        >
          Modificar
        </Button>

        {hasProductCustomOptions && (
          <Button
            size="small"
            variant="outlined"
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={() => setExpanded((prev) => !prev)}
            sx={{
              fontFamily: 'fontFamily.primary',
              borderRadius: 1.5,
            }}
          >
            Opciones
          </Button>
        )}
      </Box>

      {hasProductCustomOptions && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider sx={{ borderColor: 'rgba(184, 182, 186, 0.16)' }} />

          <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: 'rgba(0, 0, 0, 0.08)' }}>
            <Typography
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'primary.main',
                fontSize: 14,
                mb: 1,
              }}
            >
              Opciones personalizadas asignadas
            </Typography>

            {product.productCustomOptions.map((option) => {
              const relation = getRelationData(option);

              return (
                <Box
                  key={option.id}
                  sx={{
                    mb: 1.5,
                    pb: 1.5,
                    borderBottom: '1px solid rgba(184, 182, 186, 0.14)',
                    '&:last-of-type': {
                      mb: 0,
                      pb: 0,
                      borderBottom: 'none',
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: 'fontFamily.primary',
                          color: 'text.primary',
                          fontSize: 13,
                          lineHeight: 1.2,
                        }}
                      >
                        {option.name}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          color: 'text.secondary',
                          fontSize: 11,
                        }}
                      >
                        Tipo: {option.type} · Prioridad:{' '}
                        {relation.priority ?? option.priority ?? 10}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={relation.required ? 'Requerida' : 'Opcional'}
                      color={relation.required ? 'primary' : 'default'}
                      variant={relation.required ? 'filled' : 'outlined'}
                      sx={{ fontFamily: 'fontFamily.secondary', fontSize: 10 }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'text.secondary',
                      fontSize: 11,
                      mt: 0.5,
                    }}
                  >
                    Selección: mín. {relation.minSelected ?? 0} · máx.{' '}
                    {relation.maxSelected ?? 1}
                  </Typography>

                  {Array.isArray(option.items) && option.items.length > 0 && (
                    <List dense disablePadding sx={{ mt: 0.8 }}>
                      {option.items.map((item) => (
                        <ListItem
                          key={item.id}
                          disableGutters
                          sx={{ py: 0.15 }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontFamily: 'fontFamily.secondary',
                                  color: 'text.primary',
                                  fontSize: 12,
                                }}
                              >
                                {item.name}
                                {Number(item.extraCost) > 0
                                  ? ` · +${formatCurrency(item.extraCost)}`
                                  : ''}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              );
            })}
          </Box>
        </Collapse>
      )}
    </Card>
  );
};
