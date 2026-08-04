import { useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import {
  initialForm,
  normalizeStaffUsername,
  ROLE_OPTIONS,
} from "@/utils/restaurantStaffUtils.js";
// ---------------

const StaffFormFields = ({ form, onChange, isEditing = false }) => {
  const normalizedUsername = useMemo(() => {
    return normalizeStaffUsername(form.name);
  }, [form.name]);

  const selectedRoleInfo = useMemo(() => {
    return ROLE_OPTIONS.find((role) => role.value === form.staffRole);
  }, [form.staffRole]);

  return (
    <Stack spacing={2}>
      <TextField
        label="Usuario"
        value={form.name}
        onChange={(event) => onChange("name", event.target.value)}
        fullWidth
        helperText={
          normalizedUsername
            ? `Login: ${normalizedUsername}`
            : "Ejemplo: juancaja"
        }
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Email"
        value={form.email}
        onChange={(event) => onChange("email", event.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label={isEditing ? "Nueva contraseña opcional" : "Contraseña"}
        type="password"
        value={form.password}
        onChange={(event) => onChange("password", event.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        label="Teléfono"
        value={form.phone}
        onChange={(event) => onChange("phone", event.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PhoneIcon color="primary" />
            </InputAdornment>
          ),
        }}
      />

      <FormControl fullWidth>
        <InputLabel>Rol del empleado</InputLabel>

        <Select
          label="Rol del empleado"
          value={form.staffRole}
          onChange={(event) => onChange("staffRole", event.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <WorkIcon color="primary" />
            </InputAdornment>
          }
        >
          {ROLE_OPTIONS.map((role) => (
            <MenuItem key={role.value} value={role.value}>
              {role.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRoleInfo && (
        <Alert severity="info">
          <Typography sx={{ fontWeight: "bold" }}>
            {selectedRoleInfo.label}
          </Typography>

          <Typography sx={{ fontSize: 13 }}>
            {selectedRoleInfo.description}
          </Typography>
        </Alert>
      )}
    </Stack>
  );
};

export const ModalEditRestaurantStaff = ({
  open,
  staff,
  saving,
  onClose,
  onSave,
}) => {
  const [editForm, setEditForm] = useState(initialForm);

  useEffect(() => {
    if (!staff) return;

    setEditForm({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      phone: staff.phone || "",
      staffRole: staff.staffRole || "cashier",
    });
  }, [staff]);

  const handleChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <EditIcon color="primary" />

            <Typography
              variant="h6"
              sx={{
                fontFamily: "fontFamily.primary",
                fontWeight: "bold",
              }}
            >
              EDITAR EMPLEADO
            </Typography>
          </Stack>

          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", pt: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mt: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          <StaffFormFields form={editForm} onChange={handleChange} isEditing />
        </Paper>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.paper", p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
