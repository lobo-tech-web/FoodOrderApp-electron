// ---- MATERIAL UI ----
import { Box, Typography, Divider, Chip } from '@mui/material';
// ---------------------

const mainLabelStyle = {
  fontFamily: 'fontFamily.primary',
  color: 'primary.main',
  mb: 1,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const ProductsListSection = ({ showProducts, hasValidPreview }) => {
  return (
    <Box>
      <Typography variant="body1" sx={mainLabelStyle}>
        PRODUCTOS {hasValidPreview && '- PREVIEW'}
      </Typography>

      <Divider sx={{ bgcolor: 'primary.main', mb: 1 }} />

      {showProducts.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {showProducts.map((product) => (
            <Box
              key={product.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: hasValidPreview
                  ? 'primary.main'
                  : 'background.paper',
                borderRadius: 2,
                p: 2,
                bgcolor: hasValidPreview
                  ? 'rgba(245, 166, 35, 0.05)'
                  : 'background.main',
                mt: 2,
                transition: 'all 0.3s ease',
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontFamily: 'fontFamily.primary',
                  fontWeight: 'bold',
                  color: 'primary.main',
                  mt: 2,
                  mb: 2,
                  textAlign: 'center',
                }}
              >
                {product?.name?.toUpperCase()}
              </Typography>

              {/* PRECIO DEL PRODUCTO CON PREVIEW */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 2,
                }}
              >
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Precio Actual
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: 'fontFamily.terciary',
                      color: hasValidPreview
                        ? 'text.secondary'
                        : 'success.main',
                      textDecoration: hasValidPreview ? 'line-through' : 'none',
                    }}
                  >
                    ${product.price}
                  </Typography>
                </Box>

                {hasValidPreview && product.newPrice !== undefined && (
                  <>
                    <Typography variant="h5" color="primary.main">
                      →
                    </Typography>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Precio Nuevo
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: 'success.main',
                          fontWeight: 'bold',
                        }}
                      >
                        ${product.newPrice.toFixed(2)}
                      </Typography>
                      <Chip
                        label={`${
                          product.priceDifference >= 0 ? '+' : ''
                        }${product.priceDifference.toFixed(2)}`}
                        size="small"
                        color={
                          product.priceDifference >= 0 ? 'success' : 'error'
                        }
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};
