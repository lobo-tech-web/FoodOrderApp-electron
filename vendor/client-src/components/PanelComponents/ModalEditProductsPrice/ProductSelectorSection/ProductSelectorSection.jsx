import { useMemo, useState } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  TextField,
  Typography,
  Avatar,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
// --------------------

export const ProductSelectorSection = ({
  products = [],
  selectedProductIds,
  setSelectedProductIds,
}) => {
  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(normalizedSearch)
    );
  }, [products, search]);

  const selectedCount = selectedProductIds.length;

  const isSelected = (productId) => selectedProductIds.includes(productId);

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((id) => id !== productId);
      }

      return [...prev, productId];
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: 'fontFamily.primary',
              fontWeight: 'bold',
              color: 'text.primary',
              fontSize: { xs: '16px', sm: '18px' },
            }}
          >
            Seleccionar productos
          </Typography>

          <Typography
            sx={{
              fontFamily: 'fontFamily.secondary',
              color: 'text.secondary',
              fontSize: '14px',
            }}
          >
            Elegí los productos a los que querés modificarles el precio.
          </Typography>
        </Box>

        <Chip
          label={`${selectedCount} seleccionados`}
          color={selectedCount > 0 ? 'primary' : 'default'}
          size="small"
          sx={{ fontFamily: 'fontFamily.primary', fontWeight: 'bold' }}
        />
      </Box>

      <TextField
        fullWidth
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar producto..."
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
          },
          gap: 1.5,
          maxHeight: { xs: 320, sm: 360 },
          overflowY: 'auto',
          pr: 0.5,
        }}
      >
        {filteredProducts.map((product) => {
          const checked = isSelected(product.id);

          return (
            <Card
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              sx={{
                cursor: 'pointer',
                border: checked
                  ? '2px solid'
                  : '1px solid rgba(255,255,255,0.12)',
                borderColor: checked ? 'primary.main' : 'divider',
                bgcolor: checked ? 'action.selected' : 'background.paper',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  p: 1.5,
                  '&:last-child': {
                    pb: 1.5,
                  },
                }}
              >
                <Checkbox
                  checked={checked}
                  onChange={() => toggleProduct(product.id)}
                  onClick={(event) => event.stopPropagation()}
                />

                <Avatar
                  src={product.image || ''}
                  alt={product.name}
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'background.default',
                  }}
                >
                  {product.name?.charAt(0)}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    noWrap
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      fontSize: '14px',
                    }}
                  >
                    {product.name}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'primary.main',
                      fontWeight: 'bold',
                      fontSize: '14px',
                    }}
                  >
                    ${Number(product.price || 0).toLocaleString('es-AR')}
                  </Typography>

                  {product.category?.name && (
                    <Typography
                      noWrap
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'text.secondary',
                        fontSize: '12px',
                      }}
                    >
                      {product.category.name}
                    </Typography>
                  )}
                </Box>
              </CardContent>
            </Card>
          );
        })}

        {filteredProducts.length === 0 && (
          <Box
            sx={{
              gridColumn: '1 / -1',
              p: 3,
              textAlign: 'center',
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography color="text.secondary">
              No se encontraron productos.
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ mt: 3 }} />
    </Box>
  );
};
