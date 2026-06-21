// ---- MATERIAL UI ----
import {
  Box,
  Button,
  TextField,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Paper,
  Switch,
  Stack,
  Chip,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
// ---------------------

// ---- UTILS ----
import { handleInputChange } from '@/utils/productUtils.js';
// ---------------

// ---- STYLES ----
const textFieldStyle = {
  '& .MuiInputBase-root': {
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    minHeight: { xs: '48px', sm: '56px', md: '56px' },
    color: 'text.primary',
    bgcolor: 'background.default',
    borderRadius: { xs: '8px', sm: '12px' },
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(184, 182, 186, 0.3)',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '2px',
      boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
    },
  },
  width: '100%',
  marginBottom: { xs: '16px', sm: '20px', md: '20px' },
};

const labelStyle = {
  fontFamily: 'fontFamily.primary',
  color: 'primary.main',
  fontWeight: 'bold',
  fontSize: { xs: '14px', sm: '16px', md: '16px' },
  lineHeight: 1,
  mb: 0,
};

const labelContainerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: { xs: 1, sm: 1.5, md: 1.5 },
  mb: { xs: 1, sm: 1.5, md: 1 },
};

const switchCardStyle = {
  p: 2,
  border: '1px solid',
  borderColor: 'rgba(184, 182, 186, 0.22)',
  borderRadius: 2,
  bgcolor: 'background.default',
};

const switchLabelStyle = {
  fontFamily: 'fontFamily.secondary',
  color: 'text.primary',
  fontSize: { xs: '14px', sm: '15px' },
};

const switchDescriptionStyle = {
  fontFamily: 'fontFamily.secondary',
  color: 'text.secondary',
  fontSize: { xs: '12px', sm: '13px' },
};

const BooleanSwitchRow = ({
  checked,
  name,
  title,
  description,
  activeLabel,
  inactiveLabel,
  setProduct,
}) => {
  const isActive = Boolean(checked);

  return (
    <Paper elevation={0} sx={switchCardStyle}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Box>
          <Typography sx={switchLabelStyle}>{title}</Typography>

          {description && (
            <Typography sx={switchDescriptionStyle}>{description}</Typography>
          )}

          {(activeLabel || inactiveLabel) && (
            <Chip
              size="small"
              label={isActive ? activeLabel : inactiveLabel}
              color={isActive ? 'success' : 'default'}
              variant={isActive ? 'filled' : 'outlined'}
              sx={{
                mt: 1,
                fontFamily: 'fontFamily.secondary',
              }}
            />
          )}
        </Box>

        <Switch
          checked={isActive}
          name={name}
          onChange={(e) => handleInputChange(setProduct, e)}
          color="primary"
        />
      </Box>
    </Paper>
  );
};
// --------------------

export const ProductInfo = ({
  product,
  setProduct,
  allCategories,
  imagePreview,
  handleImageUpload,
}) => {
  // ---- OPCIONES PARA TÍTULOS ESPECIALES ----
  const specialTitleExamples = [
    'Limitado',
    'Oferta',
    'Oferta del mes',
    'Especial',
    'Nuevo',
    'Sugerencia',
    'Popular',
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.primary',
            textAlign: 'center',
            color: 'primary.main',
            mb: 2,
          }}
        >
          INFORMACIÓN GENERAL
        </Typography>

        {/* NOMBRE DEL PRODUCTO */}
        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>NOMBRE DEL PRODUCTO</Typography>
        </Box>
        <TextField
          fullWidth
          required
          name="name"
          placeholder="Ej: Empanada de Carne"
          value={product.name || ''}
          onChange={(e) => handleInputChange(setProduct, e)}
          sx={textFieldStyle}
        />

        {/* TITULO ESPECIAL (Múltiple) */}
        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>ETIQUETAS ESPECIALES</Typography>
        </Box>
        <FormControl fullWidth sx={textFieldStyle}>
          <Select
            value={product.specialTitle || ''}
            onChange={(e) =>
              setProduct((prev) => ({ ...prev, specialTitle: e.target.value }))
            }
            sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <Typography
                    sx={{
                      fontFamily: 'fontFamily.secondary',
                      color: 'text.secondary',
                    }}
                  >
                    Etiquetas especiales para tu producto
                  </Typography>
                );
              }
              return selected;
            }}
          >
            <MenuItem
              value=""
              sx={{
                fontFamily: 'fontFamily.terciary',
                color: 'primary.main',
              }}
            >
              SIN ETIQUETA
            </MenuItem>
            {specialTitleExamples.map((title) => (
              <MenuItem
                key={title}
                value={title}
                sx={{
                  fontFamily: 'fontFamily.terciary',
                  color: 'text.primary',
                }}
              >
                {title.toUpperCase()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* DESCRIPTION */}
        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>DESCRIPCIÓN</Typography>
        </Box>
        <TextField
          fullWidth
          name="description"
          multiline
          rows={3}
          value={product.description || ''}
          onChange={(e) => handleInputChange(setProduct, e)}
          sx={textFieldStyle}
        />

        <Box>
          <Box sx={labelContainerStyle}>
            <Typography sx={labelStyle}>CATEGORIAS</Typography>
          </Box>
          <FormControl fullWidth required sx={textFieldStyle}>
            <Select
              value={product.category || ''}
              sx={{ fontFamily: 'fontFamily.terciary', color: 'text.primary' }}
              onChange={(e) => {
                const selectedCategory = allCategories.find(
                  (category) => category?.name === e.target.value
                );
                if (selectedCategory) {
                  setProduct((prev) => ({
                    ...prev,
                    category: selectedCategory?.name,
                    categoryId: selectedCategory?.id,
                  }));
                }
              }}
              error={!product.category}
              helperText={!product.category ? 'Seleccione una categoría' : ''}
              displayEmpty
              renderValue={(selected) => {
                if (!selected) {
                  return (
                    <Typography sx={{ color: 'text.secondary' }}>
                      Selecciona una categoria
                    </Typography>
                  );
                }
                return selected;
              }}
            >
              {allCategories.map((category) => (
                <MenuItem
                  key={category?.id}
                  value={category?.name}
                  sx={{
                    fontFamily: 'fontFamily.terciary',
                    color: 'text.primary',
                  }}
                >
                  {category?.name?.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderRadius: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: 'fontFamily.primary',
            textAlign: 'center',
            color: 'primary.main',
            mb: 2,
          }}
        >
          PRECIO / DESCUENTO / PUNTOS
        </Typography>
        {[
          { label: 'PRECIO', name: 'price', type: 'text', required: true },
          {
            label: 'DESCUENTO %',
            name: 'discount',
            type: 'text',
            inputProps: { min: 0, max: 100 },
            required: true,
          },
          {
            label: 'PTOS. RECOMPENSA',
            name: 'rewardPoints',
            type: 'text',
          },
          {
            label: 'PTOS. CANJE',
            name: 'redeemPoints',
            type: 'text',
          },
        ].map((field) => (
          <Box key={field.name}>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>{field.label}</Typography>
            </Box>
            <TextField
              fullWidth
              name={field.name}
              type={field.type}
              required={field.required}
              value={product[field.name]}
              onChange={(e) => handleInputChange(setProduct, e)}
              sx={textFieldStyle}
            />
          </Box>
        ))}

        <Box sx={labelContainerStyle}>
          <Typography sx={labelStyle}>VISIBILIDAD Y CONFIGURACIÓN</Typography>
        </Box>

        <Stack spacing={1.5}>
          <BooleanSwitchRow
            name="status"
            checked={product.status}
            title="Producto visible en el menú"
            description="Si está desactivado, el cliente no debería poder comprarlo desde el menú."
            activeLabel="Visible"
            inactiveLabel="Oculto"
            setProduct={setProduct}
          />

          <BooleanSwitchRow
            name="allowComment"
            checked={product.allowComment}
            title="Permitir comentarios del cliente"
            description="Activa esta opción si el cliente puede dejar indicaciones como: sin cebolla, salsa aparte, sin sal, etc."
            activeLabel="Comentarios activos"
            inactiveLabel="Comentarios bloqueados"
            setProduct={setProduct}
          />

          <BooleanSwitchRow
            name="isSinTacc"
            checked={product.isSinTacc}
            title="Producto sin TACC"
            description="Marcá esta opción si el producto es apto sin TACC."
            activeLabel="Sin TACC"
            inactiveLabel="No marcado"
            setProduct={setProduct}
          />

          <BooleanSwitchRow
            name="isVeggie"
            checked={product.isVeggie}
            title="Producto vegetariano"
            description="Marcá esta opción si el producto corresponde a una opción vegetariana."
            activeLabel="Vegetariano"
            inactiveLabel="No marcado"
            setProduct={setProduct}
          />
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          bgcolor: 'background.paper',
          borderRadius: 2,
          border: '1px dashed #f5a623',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            mb: 2,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          IMAGEN DEL PRODUCTO
        </Typography>
        {imagePreview ? (
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <img
              src={imagePreview}
              alt="Vista previa"
              style={{
                maxWidth: '100%',
                maxHeight: '200px',
                borderRadius: '8px',
              }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              width: '100%',
              height: '150px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'background.default',
              borderRadius: '8px',
              mb: 2,
            }}
          >
            <Typography sx={{ color: 'text.primary' }}>
              No hay imagen seleccionada
            </Typography>
          </Box>
        )}
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="raised-button-file"
          type="file"
          onChange={handleImageUpload}
        />
        <label htmlFor="raised-button-file">
          <Button
            color="primary"
            variant="contained"
            component="span"
            startIcon={<CloudUploadIcon />}
            sx={{ fontFamily: 'fontFamily.primary' }}
          >
            {imagePreview ? 'Cambiar Imagen' : 'Subir Imagen'}
          </Button>
        </label>
      </Paper>
    </Box>
  );
};
