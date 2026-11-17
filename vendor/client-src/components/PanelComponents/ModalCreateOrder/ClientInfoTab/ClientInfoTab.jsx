// ---- Material UI ----
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
// Icons
import {
  Search as SearchIcon,
  EmailOutlined as EmailIcon,
  PhoneOutlined as PhoneIcon,
  PersonOutline as PersonOutlineIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { SectionHeading } from "../shared/SectionHeading.jsx";
import { FieldLabel } from "../shared/FieldLabel.jsx";
// ----------------

// ---- Styles ----
import {
  compactFieldStyles,
  sectionCardStyle,
} from "../styles/modalCreateOrder.styles.js";
// ----------------

export const ClientInfoTab = ({
  order,
  handleInputChange,
  ignoreEmail,
  handleIgnoreEmail,
  canSearchClients = true,
  onSearchClient,
}) => (
  <Paper elevation={0} sx={{ ...sectionCardStyle, mb: 0, flexShrink: 0 }}>
    <SectionHeading
      step={1}
      icon={<PersonIcon />}
      title="CLIENTE"
      description={"ingresa los datos del cliente"}
      action={
        <Button
          size="small"
          onClick={onSearchClient}
          disabled={!canSearchClients}
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          sx={{ fontFamily: "fontFamily.primary", whiteSpace: "nowrap" }}
        >
          BUSCAR CLIENTES
        </Button>
      }
    />

    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
        },
        gap: 1,
      }}
    >
      <Box>
        <FieldLabel icon={<PersonOutlineIcon fontSize="small" />}>
          NOMBRE DEL CLIENTE
        </FieldLabel>

        <TextField
          size="small"
          fullWidth
          name="clientName"
          placeholder="Ingresa el nombre del cliente"
          value={order.clientName}
          onChange={handleInputChange}
          sx={compactFieldStyles}
        />
      </Box>

      <Box>
        <FieldLabel icon={<PhoneIcon fontSize="small" />}>
          TELEFONO DE CONTACTO
        </FieldLabel>

        <TextField
          size="small"
          fullWidth
          name="contactPhone"
          placeholder="Ingresa el telefono de contacto"
          value={order.contactPhone}
          onChange={handleInputChange}
          sx={compactFieldStyles}
          required
        />
      </Box>

      <Box sx={{ gridColumn: "1 / -1" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: 20,
            mb: 0.75,
            "& > .MuiBox-root": { mb: 0 },
          }}
        >
          <FieldLabel icon={<EmailIcon fontSize="small" />}>EMAIL</FieldLabel>

          <FormControlLabel
            control={
              <Checkbox
                checked={ignoreEmail}
                onChange={handleIgnoreEmail}
                size="small"
                sx={{
                  p: 0,
                  color: "primary.main",
                  "&.Mui-checked": { color: "primary.main" },
                }}
              />
            }
            label={
              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 12,
                  color: "text.primary",
                  whiteSpace: "nowrap",
                }}
              >
                Omitir email
              </Typography>
            }
            sx={{ m: 0, gap: 0.5 }}
          />
        </Box>

        <TextField
          size="small"
          fullWidth
          type="email"
          name="clientEmail"
          placeholder="ejemplo@correo.com"
          value={order.clientEmail}
          onChange={handleInputChange}
          sx={compactFieldStyles}
          required
          disabled={ignoreEmail}
        />
      </Box>
    </Box>
  </Paper>
);
