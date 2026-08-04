import { useCallback, useEffect, useMemo, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
// Icons
import {
  Add as AddIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Services ----
import {
  createRestaurantStaffService,
  getRestaurantStaffService,
  updateRestaurantStaffService,
} from "@/services/restaurantStaff.js";
// ------------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import {
  DEFAULT_STAFF_PERMISSIONS,
  ROLE_OPTIONS,
  getRoleLabel,
  initialForm,
  normalizeStaffUsername,
} from "@/utils/restaurantStaffUtils.js";
// ---------------

// ---- Components ----
import { ModalEditRestaurantStaff } from "@/components/PanelComponents/ModalEditRestaurantStaff/ModalEditRestaurantStaff.jsx";
// --------------------

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

export const RestaurantStaffPanel = ({ user }) => {
  const { AlertComponent, showAlert } = useAlert();

  const [staffList, setStaffList] = useState([]);
  const [createForm, setCreateForm] = useState(initialForm);
  const [editingStaff, setEditingStaff] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const normalizedUsername = useMemo(() => {
    return normalizeStaffUsername(createForm.name);
  }, [createForm.name]);

  const handleOpenEditModal = (staff) => {
    setEditingStaff(staff);
    setOpenEditModal(true);
  };

  const handleCloseEditModal = () => {
    setEditingStaff(null);
    setOpenEditModal(false);
  };

  const fetchStaff = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const response = await getRestaurantStaffService(user.id);
      setStaffList(Array.isArray(response) ? response : []);
    } catch (error) {
      showAlert(error?.message || "Error al obtener empleados", "error");
    } finally {
      setLoading(false);
    }
  }, [user?.id, showAlert]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const resetCreateForm = () => {
    setCreateForm(initialForm);
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildPayload = (form) => {
    const payload = {
      name: normalizeStaffUsername(form.name),
      email: form.email.trim().toLowerCase(),
      phone: form.phone || "SIN ESPECIFICAR",
      staffRole: form.staffRole,
      permissions: DEFAULT_STAFF_PERMISSIONS[form.staffRole],
    };

    if (form.password.trim()) {
      payload.password = form.password.trim();
    }

    return payload;
  };

  const validateForm = (form, isEditing = false) => {
    if (!form.name.trim()) {
      showAlert("Ingresá un usuario para el empleado", "warning");
      return false;
    }

    if (!form.email.trim()) {
      showAlert("Ingresá un email para el empleado", "warning");
      return false;
    }

    if (!isEditing && !form.password.trim()) {
      showAlert("Ingresá una contraseña para el empleado", "warning");
      return false;
    }

    return true;
  };

  const handleCreateStaff = async () => {
    if (!validateForm(createForm, false)) return;

    setSaving(true);

    try {
      const payload = buildPayload(createForm);

      await createRestaurantStaffService(payload);

      showAlert("Empleado creado correctamente", "success");

      resetCreateForm();
      await fetchStaff();
    } catch (error) {
      showAlert(error?.message || "Error al crear empleado", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStaff = async (editForm) => {
    if (!editingStaff) return;
    if (!validateForm(editForm, true)) return;

    setSaving(true);

    try {
      const payload = buildPayload(editForm);

      await updateRestaurantStaffService(editingStaff.id, payload);

      showAlert("Empleado actualizado correctamente", "success");

      handleCloseEditModal();
      await fetchStaff();
    } catch (error) {
      showAlert(error?.message || "Error al actualizar empleado", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (staff) => {
    setSaving(true);

    try {
      await updateRestaurantStaffService(staff.id, {
        status: !staff.status,
      });

      showAlert(
        staff.status
          ? "Empleado desactivado correctamente"
          : "Empleado activado correctamente",
        "success",
      );

      await fetchStaff();
    } catch (error) {
      showAlert(
        error?.message || "Error al cambiar estado del empleado",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.main",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <WorkIcon color="primary" />

              <Typography
                variant="h5"
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                PERSONAL DEL LOCAL
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                mt: 0.5,
              }}
            >
              Creá usuarios para caja, cocina o encargados sin dar acceso al
              panel administrativo completo.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={
              loading ? <CircularProgress size={18} /> : <RefreshIcon />
            }
            onClick={fetchStaff}
            disabled={loading}
            sx={{
              alignSelf: { xs: "stretch", md: "center" },
              px: 2.5,
              py: 1.1,
              borderRadius: 2,
              fontFamily: "fontFamily.secondary",
              fontWeight: "bold",
              textTransform: "none",
              minWidth: { xs: "100%", md: 150 },
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": {
                borderColor: "primary.dark",
                bgcolor: "rgba(245,166,35,0.08)",
              },
            }}
          >
            {loading ? "Actualizando..." : "Actualizar lista"}
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              lg: "420px 1fr",
            },
            gap: 3,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.default",
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 2 }}
            >
              <AddIcon color="primary" />

              <Typography
                variant="h6"
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                CREAR EMPLEADO
              </Typography>
            </Stack>

            <StaffFormFields
              form={createForm}
              onChange={handleCreateFormChange}
            />

            <Button
              fullWidth
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleCreateStaff}
              disabled={saving}
              sx={{
                mt: 2,
                fontFamily: "fontFamily.primary",
              }}
            >
              {saving ? "Guardando..." : "Crear empleado"}
            </Button>

            {normalizedUsername && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: 12,
                  color: "text.secondary",
                  fontFamily: "fontFamily.secondary",
                }}
              >
                El empleado ingresará con el usuario:{" "}
                <strong>{normalizedUsername}</strong>
              </Typography>
            )}
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              bgcolor: "background.default",
              minHeight: 340,
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                EMPLEADOS CREADOS
              </Typography>

              <Chip
                label={`${staffList.length} empleados`}
                color="primary"
                variant="outlined"
              />
            </Stack>

            {loading ? (
              <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
                <CircularProgress />
              </Box>
            ) : staffList.length === 0 ? (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                  color: "text.secondary",
                }}
              >
                <PersonIcon sx={{ fontSize: 48, mb: 1, opacity: 0.5 }} />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                  }}
                >
                  No hay empleados creados todavía.
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: 13,
                  }}
                >
                  Creá un cajero, encargado o usuario de cocina.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {staffList.map((staff) => (
                  <Paper
                    key={staff.id}
                    elevation={0}
                    sx={{
                      p: 1.5,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.5}
                      alignItems={{ xs: "flex-start", md: "center" }}
                      justifyContent="space-between"
                    >
                      <Box>
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              fontWeight: "bold",
                            }}
                          >
                            {staff.name}
                          </Typography>

                          <Chip
                            size="small"
                            label={getRoleLabel(staff.staffRole)}
                            color="primary"
                            variant="outlined"
                          />

                          <Chip
                            size="small"
                            label={staff.status ? "Activo" : "Desactivado"}
                            color={staff.status ? "success" : "default"}
                          />
                        </Stack>

                        <Typography
                          sx={{
                            mt: 0.5,
                            color: "text.secondary",
                            fontSize: 13,
                          }}
                        >
                          {staff.email}
                          {staff.phone ? ` · ${staff.phone}` : ""}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title="Editar empleado">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenEditModal(staff)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            staff.status
                              ? "Desactivar empleado"
                              : "Activar empleado"
                          }
                        >
                          <Box>
                            <Switch
                              checked={Boolean(staff.status)}
                              onChange={() => handleToggleStatus(staff)}
                              disabled={saving}
                            />
                          </Box>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>
      </Paper>

      <ModalEditRestaurantStaff
        open={openEditModal}
        staff={editingStaff}
        saving={saving}
        onClose={handleCloseEditModal}
        onSave={handleUpdateStaff}
      />
      {AlertComponent}
    </Box>
  );
};
