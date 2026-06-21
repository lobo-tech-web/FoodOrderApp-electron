import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
// ICONS
import {
  Search as SearchIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  PersonOutline as PersonOutlineIcon,
  LocationOnOutlined as LocationIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// ---- SHARED ----
import { SectionHeading } from '../shared/SectionHeading.jsx';
import { FieldLabel } from '../shared/FieldLabel.jsx';
// ----------------

// ---- STYLES ----
import {
  fieldStyles,
  sectionCardStyle,
  innerCardStyle,
} from '../styles/modalCreateOrder.styles.js';
// ----------------

export const ClientInfoTab = ({
  order,
  handleInputChange,
  ignoreEmail,
  handleIgnoreEmail,
  onSearchClient,
}) => {
  return (
    <Paper elevation={0} sx={sectionCardStyle}>
      <SectionHeading
        icon={<PersonIcon />}
        title="INFORMACION DEL CLIENTE"
        action={
          <Button
            onClick={onSearchClient}
            variant="contained"
            color="primary"
            startIcon={<SearchIcon />}
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.terciary',
              borderRadius: '8px',
              px: 2,
              whiteSpace: 'nowrap',
            }}
          >
            BUSCAR CLIENTES
          </Button>
        }
      />

      <Typography
        sx={{
          fontFamily: 'fontFamily.secondary',
          color: 'text.secondary',
          fontSize: 13,
          mt: -1,
          mb: 2,
        }}
      >
        Completa los datos de tu cliente para continuar con el pedido.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.15fr 0.85fr' },
          gap: 2,
        }}
      >
        <Paper elevation={0} sx={innerCardStyle}>
          <Typography
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'primary.main',
              fontSize: 17,
              mb: 1.5,
            }}
          >
            DATOS BASICOS
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            <Box>
              <FieldLabel icon={<PersonOutlineIcon fontSize="small" />}>
                NOMBRE DEL CLIENTE
              </FieldLabel>
              <TextField
                fullWidth
                name="clientName"
                placeholder="Ingresa el nombre del cliente"
                value={order.clientName}
                onChange={handleInputChange}
                sx={fieldStyles}
                required
              />
            </Box>

            <Box>
              <FieldLabel icon={<EmailIcon fontSize="small" />}>
                EMAIL
              </FieldLabel>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr auto' },
                  gap: 1,
                  alignItems: 'center',
                }}
              >
                <TextField
                  fullWidth
                  type="email"
                  name="clientEmail"
                  placeholder="ejemplo@correo.com"
                  value={order.clientEmail}
                  onChange={handleInputChange}
                  sx={fieldStyles}
                  required
                  disabled={ignoreEmail}
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={ignoreEmail}
                      onChange={handleIgnoreEmail}
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&.Mui-checked': { color: 'primary.main' },
                      }}
                    />
                  }
                  label={
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.primary',
                        fontSize: 12,
                        color: 'text.primary',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      OMITIR EMAIL
                    </Typography>
                  }
                  sx={{ mr: 0 }}
                />
              </Box>
            </Box>

            <Box>
              <FieldLabel icon={<PhoneIcon fontSize="small" />}>
                TELEFONO DE CONTACTO
              </FieldLabel>
              <TextField
                fullWidth
                name="contactPhone"
                placeholder="Ingresa el telefono de contacto"
                value={order.contactPhone}
                onChange={handleInputChange}
                sx={fieldStyles}
                required
              />
            </Box>
          </Box>
        </Paper>

        <Paper elevation={0} sx={innerCardStyle}>
          <Typography
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'primary.main',
              fontSize: 17,
              mb: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
            }}
          >
            <LocationIcon fontSize="small" />
            DATOS DE ENTREGA
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.4 }}>
            <Box>
              <FieldLabel>DIRECCION DE ENTREGA</FieldLabel>
              <TextField
                fullWidth
                name="deliveryAddress"
                placeholder="Ingresa la direccion completa de entrega"
                value={order.deliveryAddress}
                onChange={handleInputChange}
                sx={fieldStyles}
                multiline
                rows={3}
              />
            </Box>

            <Box>
              <FieldLabel>COMENTARIOS PARA EL PEDIDO</FieldLabel>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Agregar comentarios especiales para el pedido..."
                name="comentary"
                value={order.comentary}
                onChange={handleInputChange}
                sx={fieldStyles}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
};
