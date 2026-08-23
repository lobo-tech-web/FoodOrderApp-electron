import { useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Box,
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
  Badge as BadgeIcon,
  AttachMoney as AttachMoneyIcon,
  LocalDining as LocalDiningIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { StaffPermissionsEditor } from "./StaffPermissionsEditor/StaffPermissionsEditor.jsx";
// --------------------

// ---- Utils ----
import {
  initialForm,
  normalizeStaffUsername,
  ROLE_OPTIONS,
  getStaffRolePermissions,
} from "@/utils/restaurantStaffUtils.js";
// ---------------

const StaffFormFields = ({ form, onChange, isEditing = false }) => {
  const normalizedUsername = useMemo(() => {
    return normalizeStaffUsername(form.name);
  }, [form.name]);

  const selectedRoleInfo = useMemo(() => {
    return ROLE_OPTIONS.find((role) => role.value === form.staffRole);
  }, [form.staffRole]);

  const getEmployeeIcon = (role) => {
    if (role === "manager") return <BadgeIcon color="primary" />;
    if (role === "cashier") return <AttachMoneyIcon color="primary" />;
    return <LocalDiningIcon color="primary" />;
  };

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
        sx={{ fontFamily: "fontFamily.secondary" }}
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
        sx={{ fontFamily: "fontFamily.secondary" }}
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
        sx={{ fontFamily: "fontFamily.secondary" }}
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
        sx={{ fontFamily: "fontFamily.secondary" }}
      />

      <FormControl fullWidth>
        <InputLabel sx={{ fontFamily: "fontFamily.secondary" }}>
          Rol del empleado
        </InputLabel>

        <Select
          label="Rol del empleado"
          value={form.staffRole}
          onChange={(event) => onChange("staffRole", event.target.value)}
          startAdornment={
            <InputAdornment position="start">
              {getEmployeeIcon(form.staffRole)}
            </InputAdornment>
          }
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {ROLE_OPTIONS.map((role) => (
            <MenuItem
              key={role.value}
              value={role.value}
              sx={{ fontFamily: "fontFamily.primary" }}
            >
              {role.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedRoleInfo && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: "background.default",
            display: "flex",
            flexDirection: "column",
            gap: 1,
            p: 2,
          }}
        >
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {getEmployeeIcon(form.staffRole)}
            <Typography
              variant="subtitle1"
              sx={{ fontFamily: "fontFamily.primary", color: "text.primary" }}
            >
              {selectedRoleInfo.label}
            </Typography>
          </Box>

          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
              fontSize: 13,
            }}
          >
            {selectedRoleInfo.description}
          </Typography>
        </Paper>
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

    const staffRole = staff.staffRole || "cashier";

    setEditForm({
      name: staff.name || "",
      email: staff.email || "",
      password: "",
      phone: staff.phone || "",
      staffRole,
      permissions: staff.permissions
        ? JSON.parse(JSON.stringify(staff.permissions))
        : getStaffRolePermissions(staffRole),
    });
  }, [staff]);

  const handleChange = (field, value) => {
    if (field === "staffRole") {
      setEditForm((prev) => ({
        ...prev,
        staffRole: value,
        permissions: getStaffRolePermissions(value),
      }));

      return;
    }

    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePermissionChange = (moduleName, permissionName, checked) => {
    setEditForm((prev) => ({
      ...prev,

      permissions: {
        ...prev.permissions,

        [moduleName]: {
          ...prev.permissions?.[moduleName],

          [permissionName]: checked,
        },
      },
    }));
  };

  const handleSave = () => {
    onSave(editForm);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: "90vh",
          borderRadius: 3,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "background.main",
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

          <IconButton disabled={saving} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", pt: 3 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 0.85fr) minmax(0, 1.15fr)",
            },
            gap: 2,
            mt: 1,
          }}
        >
          {/* INFORMACIÓN PRINCIPAL */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "background.main",
              alignSelf: "start",
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                fontWeight: "bold",
                mb: 2,
              }}
            >
              INFORMACIÓN DEL EMPLEADO
            </Typography>

            <StaffFormFields
              form={editForm}
              onChange={handleChange}
              isEditing
            />
          </Paper>

          {/* PERMISOS */}
          <StaffPermissionsEditor
            permissions={editForm.permissions}
            onChange={handlePermissionChange}
          />
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          p: 2,
        }}
      >
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
