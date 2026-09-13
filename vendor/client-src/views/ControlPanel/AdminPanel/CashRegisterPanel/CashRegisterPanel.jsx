import { useState, useEffect, useMemo, useCallback } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Paper,
  Stack,
  Button,
  Typography,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  PointOfSale as PointOfSaleIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  StarBorder as StarBorderIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  FilterAlt as FilterAltIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { ModalCreateCashRegister } from "@/components/PanelComponents/ModalCreateCashRegister/ModalCreateCashRegister.jsx";
// --------------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Services ----
import {
  getCashRegistersService,
  createCashRegisterService,
  updateCashRegisterService,
} from "@/services/cashRegister.js";
// ------------------

const initialForm = {
  name: "",
  description: "",
  sortOrder: 10,
  isDefault: false,
  isActive: true,
};

const CASH_REGISTER_FILTERS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ALL: "ALL",
};

export const CashRegisterPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [cashRegisters, setCashRegisters] = useState([]);
  const [statusFilter, setStatusFilter] = useState(
    CASH_REGISTER_FILTERS.ACTIVE,
  );
  const [form, setForm] = useState(initialForm);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRegister, setEditingRegister] = useState(null);

  const cashRegisterCounts = useMemo(() => {
    return cashRegisters.reduce(
      (acc, register) => {
        acc.all += 1;

        if (register.isActive) {
          acc.active += 1;
        } else {
          acc.inactive += 1;
        }
        return acc;
      },
      {
        all: 0,
        active: 0,
        inactive: 0,
      },
    );
  }, [cashRegisters]);

  const filteredCashRegisters = useMemo(() => {
    if (statusFilter === CASH_REGISTER_FILTERS.ACTIVE) {
      return cashRegisters.filter((register) => register.isActive === true);
    }

    if (statusFilter === CASH_REGISTER_FILTERS.INACTIVE) {
      return cashRegisters.filter((register) => register.isActive === false);
    }

    return cashRegisters;
  }, [cashRegisters, statusFilter]);

  const loadCashRegisters = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getCashRegistersService({ includeInactive: true });
      setCashRegisters(Array.isArray(response) ? response : []);
    } catch (error) {
      showAlert(error?.message || "No se pudieron obtener las cajas", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  const openCreateDialog = () => {
    setEditingRegister(null);
    setForm(initialForm);
    setDialogOpen(true);
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setEditingRegister(null);
    setForm(initialForm);
  };

  const handleCloseDialog = () => {
    if (saving) return;
    resetDialog();
  };

  const openEditDialog = (register) => {
    setEditingRegister(register);
    setForm({
      name: register.name || "",
      description: register.description || "",
      sortOrder: Number(register.sortOrder ?? 10),
      isDefault: register.isDefault === true,
      isActive: register.isActive !== false,
    });

    setDialogOpen(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    const normalizedName = String(form.name || "").trim();

    if (!normalizedName) {
      showAlert("Debes ingresar un nombre para la caja", "warning");
      return;
    }

    const sortOrder = Number(form.sortOrder);

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      showAlert(
        "El orden debe ser un número entero mayor o igual a cero",
        "warning",
      );
      return;
    }

    setSaving(true);

    try {
      if (editingRegister) {
        await updateCashRegisterService(editingRegister.id, {
          name: normalizedName,
          description: form.description,
          sortOrder,
          isActive: form.isActive,
          isDefault: form.isDefault,
        });

        showAlert("Caja actualizada correctamente", "success");
      } else {
        await createCashRegisterService({
          name: normalizedName,
          description: form.description,
          sortOrder,
          isDefault: form.isDefault,
        });

        showAlert("Caja creada correctamente", "success");
      }

      resetDialog();
      await loadCashRegisters();
    } catch (error) {
      showAlert(error?.message || "No se pudo guardar la caja", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSetDefault = async (register) => {
    if (register.isDefault) return;

    try {
      await updateCashRegisterService(register.id, { isDefault: true });
      showAlert(`${register.name} es ahora la caja predeterminada`, "success");
      await loadCashRegisters();
    } catch (error) {
      showAlert(
        error?.message || "No se pudo cambiar la caja predeterminada",
        "error",
      );
    }
  };

  const handleToggleActive = async (register) => {
    if (register.isDefault && register.isActive) {
      showAlert(
        "Primero debes seleccionar otra caja como predeterminada",
        "warning",
      );
      return;
    }

    try {
      await updateCashRegisterService(register.id, {
        isActive: !register.isActive,
      });

      showAlert(
        register.isActive
          ? "Caja desactivada correctamente"
          : "Caja activada correctamente",
        "success",
      );

      await loadCashRegisters();
    } catch (error) {
      showAlert(
        error?.message || "No se pudo modificar el estado de la caja",
        "error",
      );
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    loadCashRegisters();
  }, [user?.id, loadCashRegisters]);

  return (
    <Box
      sx={{
        width: "100%",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      <Stack spacing={2.5}>
        {/* HEADER */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "primary.main",
            bgcolor: "background.main",
          }}
        >
          <CardContent>
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              spacing={2}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PointOfSaleIcon color="primary" />

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      fontSize: 20,
                      color: "primary.main",
                      textTransform: "uppercase",
                    }}
                  >
                    Cajas del local
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    mt: 0.5,
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: 14,
                  }}
                >
                  Configurá las cajas disponibles para operar en el local.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                width={{ xs: "100%", sm: "auto" }}
              >
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={loadCashRegisters}
                  disabled={loading}
                  sx={{ fontFamily: "fontFamily.primary" }}
                >
                  Actualizar
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={openCreateDialog}
                  sx={{
                    fontFamily: "fontFamily.primary",

                    color: "text.terciary",
                  }}
                >
                  Agregar caja
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <Alert
          severity="info"
          variant="outlined"
          sx={{ fontFamily: "fontFamily.secondary" }}
        >
          Las cajas con historial no se eliminan. Si una deja de utilizarse
          podés desactivarla sin perder sus sesiones, movimientos ni reportes.
        </Alert>

        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            justifyContent="space-between"
          >
            <Box>
              <Box sx={{ display: "flex", gap: 1 }}>
                <FilterAltIcon color="primary" />
                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    fontSize: 16,
                    color: "primary.main",
                  }}
                >
                  FILTRAR CAJAS
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 12,
                  color: "text.primary",
                }}
              >
                Filtrá las cajas según su estado.
              </Typography>
            </Box>

            <ToggleButtonGroup
              exclusive
              size="small"
              value={statusFilter}
              onChange={(_, newFilter) => {
                if (!newFilter) return;
                setStatusFilter(newFilter);
              }}
              sx={{
                width: { xs: "100%", sm: "auto" },
                "& .MuiToggleButton-root": {
                  bgcolor: "background.main",
                  fontFamily: "fontFamily.primary",
                  fontSize: 14,
                  px: { xs: 1, sm: 2 },
                  flex: { xs: 1, sm: "initial" },
                  color: "text.primary",
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                },
                "& .MuiToggleButton-root.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "text.terciary",
                  borderColor: "primary.main",
                },
              }}
            >
              <ToggleButton value={CASH_REGISTER_FILTERS.ACTIVE}>
                ACTIVAS&nbsp; ({cashRegisterCounts.active})
              </ToggleButton>

              <ToggleButton value={CASH_REGISTER_FILTERS.INACTIVE}>
                INACTIVAS&nbsp; ({cashRegisterCounts.inactive})
              </ToggleButton>

              <ToggleButton value={CASH_REGISTER_FILTERS.ALL}>
                TODAS&nbsp; ({cashRegisterCounts.all})
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Paper>

        {loading ? (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              minHeight: 220,
            }}
          >
            <CircularProgress />
          </Box>
        ) : cashRegisters.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
            <CardContent>
              <Typography
                textAlign="center"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                }}
              >
                No hay cajas configuradas.
              </Typography>
            </CardContent>
          </Card>
        ) : filteredCashRegisters.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              bgcolor: "background.main",
            }}
          >
            <CardContent>
              <Stack spacing={1} alignItems="center">
                <PointOfSaleIcon
                  sx={{
                    color: "primary.main",
                    fontSize: 32,
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "primary.main",
                  }}
                >
                  NO HAY CAJAS EN ESTE FILTRO
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: 13,
                    textAlign: "center",
                  }}
                >
                  {statusFilter === CASH_REGISTER_FILTERS.INACTIVE
                    ? "No hay cajas desactivadas."
                    : "No hay cajas activas."}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
                xl: "repeat(3, minmax(0, 1fr))",
              },
              gap: 2,
            }}
          >
            {filteredCashRegisters.map((register) => (
              <Card
                key={register.id}
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: register.isDefault ? "primary.main" : "divider",
                  bgcolor: "background.paper",
                  opacity: register.isActive ? 1 : 0.7,
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                    >
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <PointOfSaleIcon
                            color={register.isActive ? "primary" : "disabled"}
                          />

                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              color: "text.primary",
                              textTransform: "uppercase",
                            }}
                          >
                            {register.name}
                          </Typography>
                        </Stack>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.secondary",
                            fontSize: 12,
                            mt: 0.5,
                          }}
                        >
                          Código de caja: {register.code}
                        </Typography>
                      </Box>

                      <Tooltip title="Editar caja">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => openEditDialog(register)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        size="small"
                        color={register.isActive ? "success" : "default"}
                        variant="outlined"
                        label={register.isActive ? "ACTIVA" : "INACTIVA"}
                        sx={{ fontFamily: "fontFamily.primary" }}
                      />

                      {register.isDefault && (
                        <Chip
                          size="small"
                          color="primary"
                          icon={<StarBorderIcon />}
                          label="PREDETERMINADA"
                          sx={{ fontFamily: "fontFamily.primary" }}
                        />
                      )}
                    </Stack>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                        fontSize: 13,
                        minHeight: 40,
                      }}
                    >
                      {register.description || "Sin descripción"}
                    </Typography>

                    <Divider />

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "primary.main",
                            fontSize: 11,
                          }}
                        >
                          ORDEN
                        </Typography>

                        <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                          {register.sortOrder}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {!register.isDefault && (
                          <Tooltip
                            title={
                              register.isActive
                                ? "Establecer como predeterminada"
                                : "Debes activar la caja antes de establecerla como predeterminada"
                            }
                          >
                            <Box>
                              <IconButton
                                disabled={!register.isActive}
                                color="primary"
                                onClick={() => handleSetDefault(register)}
                              >
                                {register.isActive ? (
                                  <CheckCircleIcon />
                                ) : (
                                  <CancelIcon />
                                )}
                              </IconButton>
                            </Box>
                          </Tooltip>
                        )}

                        <FormControlLabel
                          label={register.isActive ? "Activa" : "Inactiva"}
                          labelPlacement="start"
                          control={
                            <Switch
                              checked={register.isActive}
                              disabled={register.isDefault}
                              onChange={() => handleToggleActive(register)}
                            />
                          }
                          sx={{
                            m: 0,
                            "& .MuiFormControlLabel-label": {
                              fontFamily: "fontFamily.secondary",
                              fontSize: 12,
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Stack>

      <ModalCreateCashRegister
        open={dialogOpen}
        handleClose={handleCloseDialog}
        editingRegister={editingRegister}
        form={form}
        setForm={setForm}
        handleChange={handleChange}
        handleSave={handleSave}
        saving={saving}
      />
      {AlertComponent}
    </Box>
  );
};
