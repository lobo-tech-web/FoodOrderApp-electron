import { useEffect, useMemo, useState } from 'react';

// ---- MATERIAL UI ----
import {
  Avatar,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  Switch,
  TextField,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
// ICONS
import {
  Search as SearchIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  AttachMoney as MoneyIcon,
  LocalDining as LocalDiningIcon,
  LunchDining as LunchDiningIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
// ---------------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
import { useUser } from '@/context/Users.jsx';
// -----------------

// ---- STYLES ----
const cancelButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.dark',
  color: 'text.primary',
};

const submitButtonStyle = {
  fontFamily: 'fontFamily.primary',
  bgcolor: 'primary.main',
  color: 'text.terciary',
};
// ----------------

const DEFAULT_LINK_VALUES = {
  priority: 10,
  required: false,
  minSelected: 0,
  maxSelected: 1,
  limitsEnabled: false,
};

const sanitizeOnlyNumbers = (value) => {
  return String(value).replace(/\D/g, '');
};

const normalizeNumber = (value, fallback = 0) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) return fallback;

  return parsedValue;
};

const normalizePriority = (value) => {
  const parsedValue = normalizeNumber(value, DEFAULT_LINK_VALUES.priority);

  if (parsedValue < 0) return DEFAULT_LINK_VALUES.priority;

  return parsedValue;
};

const getInitialSelectedProducts = (option) => {
  if (!Array.isArray(option?.products)) return [];

  return option.products.map((product) => {
    const relation = product.ProductCustomOption || {};

    const minSelected = relation.minSelected ?? 0;
    const maxSelected = relation.maxSelected ?? 1;
    const required = relation.required ?? false;

    const limitsEnabled =
      Boolean(required) || Number(minSelected) > 0 || Number(maxSelected) > 1;

    return {
      productId: product.id,
      priority: relation.priority ?? DEFAULT_LINK_VALUES.priority,
      limitsEnabled,
      required,
      minSelected,
      maxSelected,
    };
  });
};

export const ModalAssignProductsCustomOption = ({
  open,
  option,
  onClose,
  onSaved,
  showAlert,
}) => {
  const [loading, setLoading] = useState(false);
  const { userState } = useUser();

  const { productState, getAllProducts, assignProductsToCustomOption } =
    useProducts();

  const [search, setSearch] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);

  useEffect(() => {
    if (open && option) {
      setSelectedProducts(getInitialSelectedProducts(option));
    }
  }, [open, option]);

  useEffect(() => {
    if (open && userState?.user?.id) {
      getAllProducts(userState.user.id);
    }
  }, [open, userState?.user?.id, getAllProducts]);

  const products = useMemo(
    () => productState.allProducts || [],
    [productState.allProducts]
  );

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return products;

    return products.filter((product) =>
      product.name?.toLowerCase().includes(term)
    );
  }, [products, search]);

  const isSelected = (productId) => {
    return selectedProducts.some((link) => link.productId === productId);
  };

  const getSelectedLink = (productId) => {
    return selectedProducts.find((link) => link.productId === productId);
  };

  const toggleProduct = (product) => {
    if (isSelected(product.id)) {
      setSelectedProducts((prev) =>
        prev.filter((link) => link.productId !== product.id)
      );
      return;
    }

    setSelectedProducts((prev) => [
      ...prev,
      {
        productId: product.id,
        ...DEFAULT_LINK_VALUES,
      },
    ]);
  };

  const updateLinkField = (productId, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((link) =>
        link.productId === productId
          ? {
              ...link,
              [field]: value,
            }
          : link
      )
    );
  };

  const updateNumericLinkField = (productId, field, value) => {
    const sanitizedValue = sanitizeOnlyNumbers(value);

    updateLinkField(productId, field, sanitizedValue);
  };

  const handleToggleLimits = (productId, checked) => {
    setSelectedProducts((prev) =>
      prev.map((link) => {
        if (link.productId !== productId) return link;

        if (!checked) {
          return {
            ...link,
            limitsEnabled: false,
            required: false,
            minSelected: 0,
            maxSelected: 1,
          };
        }

        return {
          ...link,
          limitsEnabled: true,
          required: Number(link.minSelected || 1) > 0,
          minSelected: Number(link.minSelected) > 0 ? link.minSelected : 1,
          maxSelected:
            Number(link.maxSelected) >= Number(link.minSelected || 1)
              ? link.maxSelected
              : Number(link.minSelected || 1),
        };
      })
    );
  };

  const handleSave = async () => {
    if (!option?.id) return;

    for (const link of selectedProducts) {
      if (!link.limitsEnabled) continue;

      const minSelected = normalizeNumber(link.minSelected, 0);
      const maxSelected = normalizeNumber(link.maxSelected, 1);

      if (minSelected < 0) {
        showAlert('El mínimo seleccionado no puede ser menor a 0', 'warning');
        return;
      }

      if (maxSelected < 1) {
        showAlert('El máximo seleccionado debe ser al menos 1', 'warning');
        return;
      }

      if (maxSelected < minSelected) {
        showAlert(
          'El máximo seleccionado no puede ser menor que el mínimo',
          'warning'
        );
        return;
      }
    }

    setLoading(true);

    try {
      await assignProductsToCustomOption({
        customOptionId: option.id,
        userId: userState.user.id,
        products: selectedProducts.map((link) => {
          const limitsEnabled = Boolean(link.limitsEnabled);

          const minSelected = limitsEnabled
            ? normalizeNumber(link.minSelected, 0)
            : 0;

          const maxSelected = limitsEnabled
            ? normalizeNumber(link.maxSelected, 1)
            : 1;

          return {
            productId: link.productId,
            priority: normalizePriority(link.priority),
            required: limitsEnabled && minSelected > 0,
            minSelected,
            maxSelected,
          };
        }),
      });

      showAlert('Productos asignados correctamente', 'success');
      onClose();
    } catch (error) {
      showAlert(error || 'Error al asignar productos', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'primary.main',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography
            variant="subtitle1"
            sx={{ fontFamily: 'fontFamily.primary', color: 'primary.main' }}
          >
            ASIGNAR PRODUCTOS A
          </Typography>
          <Typography
            variant="h6"
            sx={{ fontFamily: 'fontFamily.secondary', color: 'text.primary' }}
          >
            {option?.name}
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          placeholder="Buscar producto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ fontFamily: 'fontFamily.primary', mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 1.5,
          }}
        >
          {filteredProducts.map((product) => {
            const selected = isSelected(product.id);
            const link = getSelectedLink(product.id);

            return (
              <Paper
                key={product.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  border: '1px solid',
                  borderColor: selected
                    ? 'primary.main'
                    : 'rgba(184, 182, 186, 0.22)',
                  borderRadius: 2,
                  bgcolor: selected
                    ? 'rgba(245, 166, 35, 0.08)'
                    : 'background.paper',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Checkbox
                    checked={selected}
                    onChange={() => toggleProduct(product)}
                  />

                  <Avatar
                    src={product.image || undefined}
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      bgcolor: 'background.default',
                    }}
                  />

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.primary',
                        color: 'text.primary',
                        lineHeight: 1.1,
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.secondary',
                        color: 'text.secondary',
                        fontSize: 12,
                      }}
                    >
                      {product.category?.name || 'Sin categoría'} · $
                      {product.price}
                    </Typography>

                    {!product.status && (
                      <Chip
                        label="INACTIVO"
                        size="small"
                        color="primary"
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          mt: 0.5,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {selected && (
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                      },
                      gap: 1,
                      mt: 1.5,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{ fontFamily: 'fontFamily.secondary' }}
                      >
                        Prioridad
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        type="text"
                        value={link?.priority ?? ''}
                        onChange={(e) =>
                          updateNumericLinkField(
                            product.id,
                            'priority',
                            e.target.value
                          )
                        }
                        onBlur={() => {
                          if (
                            link?.priority === '' ||
                            link?.priority === undefined
                          ) {
                            updateNumericLinkField(
                              product.id,
                              'priority',
                              '10'
                            );
                          }
                        }}
                        inputProps={{
                          inputMode: 'numeric',
                          pattern: '[0-9]*',
                          maxLength: 3,
                        }}
                        sx={{
                          fontFamily: 'fontFamily.secondary',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '& fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        pt: { xs: 0, sm: 2.4 },
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Switch
                            checked={Boolean(link?.limitsEnabled)}
                            onChange={(e) =>
                              handleToggleLimits(product.id, e.target.checked)
                            }
                            color="primary"
                          />
                        }
                        label={
                          <Typography
                            sx={{
                              fontFamily: 'fontFamily.secondary',
                              color: 'text.primary',
                              fontSize: '0.85rem',
                            }}
                          >
                            Activar min/máx.
                          </Typography>
                        }
                      />
                    </Box>

                    {link?.limitsEnabled && (
                      <>
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'fontFamily.secondary' }}
                          >
                            Mínimo a seleccionar
                          </Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type="text"
                            value={link?.minSelected ?? ''}
                            onChange={(e) =>
                              updateNumericLinkField(
                                product.id,
                                'minSelected',
                                e.target.value
                              )
                            }
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              maxLength: 2,
                            }}
                            sx={{
                              fontFamily: 'fontFamily.secondary',
                            }}
                          />
                        </Box>

                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ fontFamily: 'fontFamily.secondary' }}
                          >
                            Máximo a seleccionar
                          </Typography>

                          <TextField
                            fullWidth
                            size="small"
                            type="text"
                            value={link?.maxSelected ?? ''}
                            onChange={(e) =>
                              updateNumericLinkField(
                                product.id,
                                'maxSelected',
                                e.target.value
                              )
                            }
                            inputProps={{
                              inputMode: 'numeric',
                              pattern: '[0-9]*',
                              maxLength: 2,
                            }}
                            sx={{
                              fontFamily: 'fontFamily.secondary',
                            }}
                          />
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<CancelIcon />}
          variant="contained"
          onClick={onClose}
          sx={cancelButtonStyle}
        >
          Cancelar
        </Button>

        <Button
          startIcon={<SaveIcon />}
          disabled={loading}
          variant="contained"
          color="primary"
          onClick={handleSave}
          sx={submitButtonStyle}
        >
          {loading ? 'Guardando...' : 'Guardar asignaciones'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
