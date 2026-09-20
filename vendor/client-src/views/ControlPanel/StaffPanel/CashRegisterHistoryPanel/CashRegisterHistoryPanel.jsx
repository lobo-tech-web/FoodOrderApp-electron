import { useState, useEffect, useMemo, useRef } from "react";
import dayjs from "dayjs";
import "dayjs/locale/es";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Divider,
  CircularProgress,
} from "@mui/material";
// Icons
import {
  History as HistoryIcon,
  ReceiptLong as ReceiptIcon,
  Refresh as RefreshIcon,
  PointOfSale as PointOfSaleIcon,
  FilterAlt as FilterIcon,
  Cancel as CancelIcon,
  Assessment as AssessmentIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// -----------------------

// ---- Components ----
import { ModalCashSessionReport } from "./ModalCashSessionReport.jsx";
// --------------------

// ---- Shared ----
import { MetricCard } from "./shared/MetricCard.jsx";
// ----------------

// ---- Services ----
import {
  getCashRegistersService,
  getCashSessionsService,
  getCashConsolidatedReportService,
  getCashSessionReportService,
} from "@/services/cashRegister.js";
// ------------------

// ---- Utils ----
import {
  formatMoney,
  hasPermission,
  createInitialCashFilters,
} from "@/utils/cashRegisterUtils.js";
// ---------------

const HISTORY_LIMIT = 100;

const CASH_DATE_PICKER_SLOT_PROPS = {
  textField: {
    size: "small",
    fullWidth: true,
    sx: {
      width: "100%",
      "& .MuiInputBase-input": {
        fontFamily: "fontFamily.secondary",
        color: "text.primary",
      },
      "& .MuiInputLabel-root": {
        fontFamily: "fontFamily.secondary",
        color: "text.primary",
      },
      "& .MuiInputLabel-root.Mui-focused": { color: "primary.main" },
      "& .MuiSvgIcon-root": { color: "primary.main" },
    },
  },
  day: {
    sx: { fontFamily: "fontFamily.secondary" },
  },
  monthButton: {
    sx: { fontFamily: "fontFamily.secondary" },
  },
  yearButton: {
    sx: { fontFamily: "fontFamily.secondary" },
  },
};

const getDatePickerValue = (value) => {
  if (!value) return null;

  const date = dayjs(value);
  return date.isValid() ? date : null;
};

const money = (value) => formatMoney(Number(value || 0));

const formatArgentinaDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const differenceColor = (value) => {
  const difference = Number(value || 0);
  if (Math.abs(difference) < 0.009) return "success.main";
  return difference < 0 ? "error.main" : "warning.main";
};

export const CashRegisterHistoryPanel = ({
  user,
  refreshKey = 0,
  showAlert,
}) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const [loading, setLoading] = useState(false);

  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingRegisters, setLoadingRegisters] = useState(false);

  const [reportLoading, setReportLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const restaurantId = useMemo(
    () => (user?.role === "staff" ? user.restaurantId : user?.id),
    [user?.id, user?.restaurantId, user?.role],
  );

  const canReadReport = hasPermission(user, "cashRegister", "readReport");

  const [cashRegisters, setCashRegisters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [consolidated, setConsolidated] = useState(null);

  const [draftFilters, setDraftFilters] = useState(createInitialCashFilters);

  const [appliedFilters, setAppliedFilters] = useState(
    createInitialCashFilters,
  );

  const reportRequestId = useRef(0);

  const selectedRegister = useMemo(
    () =>
      cashRegisters.find(
        (register) => register.id === appliedFilters.cashRegisterId,
      ) || null,
    [cashRegisters, appliedFilters.cashRegisterId],
  );

  const updateDraftFilter = (field, value) => {
    setDraftFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    if (
      draftFilters.from &&
      draftFilters.to &&
      draftFilters.from > draftFilters.to
    ) {
      showAlert?.(
        "La fecha desde no puede ser posterior a la fecha hasta",
        "warning",
      );
      return;
    }

    setAppliedFilters({ ...draftFilters });
  };

  const clearFilters = () => {
    const initialFilters = createInitialCashFilters();

    setDraftFilters(initialFilters);
    setAppliedFilters(initialFilters);
  };

  const [reloadKey, setReloadKey] = useState(0);

  const handleRefresh = () => {
    setReloadKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!restaurantId || !canReadReport) return;

    let active = true;

    const loadRegisters = async () => {
      setLoadingRegisters(true);

      try {
        const response = await getCashRegistersService({
          restaurantId,
          includeInactive: true,
        });

        if (!active) return;

        setCashRegisters(Array.isArray(response) ? response : []);
      } catch (error) {
        if (active) {
          showAlert?.(error?.message || "Error al obtener las cajas", "error");
        }
      } finally {
        if (active) setLoadingRegisters(false);
      }
    };

    loadRegisters();

    return () => {
      active = false;
    };
  }, [restaurantId, canReadReport]);

  useEffect(() => {
    if (!restaurantId || !canReadReport) return;

    let active = true;

    const loadReports = async () => {
      setLoading(true);

      try {
        const params = {
          restaurantId,
          cashRegisterId:
            appliedFilters.cashRegisterId === "ALL"
              ? null
              : appliedFilters.cashRegisterId,
          status:
            appliedFilters.status === "ALL" ? null : appliedFilters.status,
          from: appliedFilters.from || null,
          to: appliedFilters.to || null,
        };

        const [sessionsResponse, consolidatedResponse] = await Promise.all([
          getCashSessionsService({
            ...params,
            limit: HISTORY_LIMIT,
          }),
          getCashConsolidatedReportService(params),
        ]);

        if (!active) return;

        setSessions(Array.isArray(sessionsResponse) ? sessionsResponse : []);
        setConsolidated(consolidatedResponse || null);
      } catch (error) {
        if (!active) return;

        setSessions([]);
        setConsolidated(null);
        showAlert?.(
          error?.message || "Error al obtener el historial de cajas",
          "error",
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadReports();

    return () => {
      active = false;
    };
  }, [
    restaurantId,
    canReadReport,
    appliedFilters.cashRegisterId,
    appliedFilters.status,
    appliedFilters.from,
    appliedFilters.to,
    refreshKey,
    reloadKey,
  ]);

  const handleViewReport = async (session) => {
    const currentRequestId = ++reportRequestId.current;

    setSelectedSession(session);
    setSelectedReport(null);
    setReportLoading(true);

    try {
      const response = await getCashSessionReportService(session.id);
      if (reportRequestId.current !== currentRequestId) {
        return;
      }

      setSelectedReport(response);
    } catch (error) {
      if (reportRequestId.current !== currentRequestId) {
        return;
      }

      showAlert?.(error?.message || "Error al obtener el detalle", "error");
    } finally {
      if (reportRequestId.current === currentRequestId) {
        setReportLoading(false);
      }
    }
  };

  const closeReport = () => {
    reportRequestId.current += 1;

    setSelectedSession(null);
    setSelectedReport(null);
    setReportLoading(false);
  };

  if (!canReadReport) return null;

  const summary = consolidated?.summary || {};
  const registers = consolidated?.cashRegisters || [];
  const methods = consolidated?.paymentMethods || [];
  const riders = consolidated?.riders || [];
  const unassigned = consolidated?.unassigned || {};

  const totalCashActivity =
    Number(summary.assignedCashSalesAmount || 0) +
    Number(summary.totalCashIn || 0) -
    Number(summary.totalCashOut || 0) +
    Number(summary.totalRiderCashImpact || 0);

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
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mb: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.main",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <HistoryIcon color="primary" />

            <Box>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  fontWeight: "bold",
                }}
              >
                HISTORIAL Y REPORTES DE CAJAS
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  fontSize: 13,
                  color: "text.secondary",
                }}
              >
                Consulta de sesiones y consolidado financiero del restaurante.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
            sx={{ fontFamily: "fontFamily.primary", fontSize: 12 }}
          >
            Actualizar
          </Button>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          spacing={2}
          sx={{ mb: 2 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <FilterIcon
              sx={{ color: "primary.main", fontSize: 21, flexShrink: 0 }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  fontSize: 14,
                  lineHeight: 1.3,
                }}
              >
                FILTRAR REPORTES
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: 12,
                  mt: 0.25,
                }}
              >
                Seleccioná una caja, su estado y el período que querés
                consultar.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent={{ xs: "flex-end", md: "flex-end" }}
            flexWrap="wrap"
            gap={1}
            sx={{ flexShrink: 0 }}
          >
            <Button
              variant="outlined"
              startIcon={<CancelIcon />}
              onClick={clearFilters}
              disabled={loading}
              sx={{
                fontFamily: "fontFamily.primary",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              Limpiar filtros
            </Button>

            <Button
              variant="contained"
              startIcon={<FilterIcon />}
              onClick={applyFilters}
              disabled={loading}
              sx={{
                fontFamily: "fontFamily.primary",
                fontSize: 14,
                whiteSpace: "nowrap",
              }}
            >
              Aplicar filtros
            </Button>
          </Stack>
        </Stack>

        {/* FILTROS */}
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "repeat(4, minmax(0, 1fr))",
              },
              gap: 1.5,
            }}
          >
            <TextField
              select
              fullWidth
              size="small"
              label="Caja"
              value={draftFilters.cashRegisterId}
              onChange={(event) =>
                updateDraftFilter("cashRegisterId", event.target.value)
              }
              disabled={loadingRegisters}
              InputLabelProps={{ shrink: true }}
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                textTransform: "uppercase",
              }}
            >
              <MenuItem value="ALL" sx={{ fontFamily: "fontFamily.primary" }}>
                TODAS LAS CAJAS
              </MenuItem>

              {cashRegisters.map((register) => (
                <MenuItem
                  key={register.id}
                  value={register.id}
                  sx={{
                    fontFamily: "fontFamily.primary",
                    textTransform: "uppercase",
                  }}
                >
                  {register.name}
                  {!register.isActive ? " · Inactiva" : ""}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              fullWidth
              size="small"
              label="Estado de sesión"
              value={draftFilters.status}
              onChange={(event) =>
                updateDraftFilter("status", event.target.value)
              }
              sx={{
                fontFamily: "fontFamily.primary",
                textTransform: "uppercase",
              }}
            >
              <MenuItem value="ALL" sx={{ fontFamily: "fontFamily.primary" }}>
                TODAS
              </MenuItem>
              <MenuItem value="OPEN" sx={{ fontFamily: "fontFamily.primary" }}>
                ABIERTAS
              </MenuItem>
              <MenuItem
                value="CLOSED"
                sx={{ fontFamily: "fontFamily.primary" }}
              >
                CERRADAS
              </MenuItem>
            </TextField>

            <DatePicker
              label="Desde"
              format="DD-MM-YYYY"
              value={getDatePickerValue(draftFilters.from)}
              onChange={(newValue) => {
                if (newValue === null) {
                  updateDraftFilter("from", "");
                  return;
                }
                if (!newValue.isValid()) {
                  return;
                }
                updateDraftFilter("from", newValue.format("YYYY-MM-DD"));
              }}
              slotProps={CASH_DATE_PICKER_SLOT_PROPS}
            />

            <DatePicker
              label="Hasta"
              format="DD-MM-YYYY"
              value={getDatePickerValue(draftFilters.to)}
              onChange={(newValue) => {
                if (newValue === null) {
                  updateDraftFilter("to", "");
                  return;
                }
                if (!newValue.isValid()) {
                  return;
                }
                updateDraftFilter("to", newValue.format("YYYY-MM-DD"));
              }}
              slotProps={CASH_DATE_PICKER_SLOT_PROPS}
            />
          </Box>
        </LocalizationProvider>
      </Paper>

      {loading && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={26} />
        </Box>
      )}

      {!loading && consolidated && (
        <Stack spacing={2.5}>
          {/* CONSOLIDADO */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 2.5 },
              borderRadius: 3,
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              spacing={1}
              sx={{ mb: 2 }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AssessmentIcon color="primary" />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "text.primary",
                    fontSize: 16,
                  }}
                >
                  REPORTE CONSOLIDADO
                </Typography>
              </Stack>

              <Chip
                label={`${summary.totalSessions || 0} sesiones`}
                color="primary"
                variant="filled"
                size="small"
                sx={{ fontFamily: "fontFamily.secondary" }}
              />
            </Stack>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: 14,
                mb: 2,
              }}
            >
              <>
                {selectedRegister ? selectedRegister.name : "Todas las cajas"}
                {" · "}
                {appliedFilters.status === "ALL"
                  ? "Todos los estados"
                  : appliedFilters.status === "OPEN"
                    ? "Sesiones abiertas"
                    : "Sesiones cerradas"}
                {appliedFilters.from && (
                  <>
                    {" · Desde: "}
                    {dayjs(appliedFilters.from).format("DD/MM/YYYY")}
                  </>
                )}

                {appliedFilters.to && (
                  <>
                    {" · Hasta: "}
                    {dayjs(appliedFilters.to).format("DD/MM/YYYY")}
                  </>
                )}
              </>
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  md: "repeat(3, minmax(0, 1fr))",
                  xl: "repeat(4, minmax(0, 1fr))",
                },
                gap: 1.25,
              }}
            >
              <MetricCard
                label="VENTAS COBRADAS"
                value={money(summary.totalSalesAmount)}
                subtitle="Incluye ventas sin caja cuando corresponde"
                color="success.main"
              />

              <MetricCard
                label="EFECTIVO DE VENTAS ASIGNADAS"
                value={money(summary.assignedCashSalesAmount)}
                subtitle="Sólo pedidos vinculados a una sesión"
              />

              <MetricCard
                label="PENDIENTE DE COBRO"
                value={money(summary.totalUnpaidAmount)}
                color="warning.main"
              />

              <MetricCard
                label="ACTIVIDAD NETA EFECTIVO"
                value={money(totalCashActivity)}
                subtitle="Sin sumar nuevamente fondos iniciales"
              />

              <MetricCard
                label="PAGOS A RIDERS"
                value={money(summary.totalRiderPayout)}
              />

              <MetricCard
                label="IMPACTO NETO RIDERS"
                value={money(summary.totalRiderCashImpact)}
              />

              <MetricCard
                label="ESPERADO ACUMULADO POR SESIÓN"
                value={money(summary.totalExpectedCashAmount)}
                subtitle="No representa el saldo actual del local"
              />

              <MetricCard
                label="DIFERENCIAS DE CIERRES"
                value={money(summary.totalDifferenceAmount)}
                subtitle="Sólo sesiones cerradas"
                color={differenceColor(summary.totalDifferenceAmount)}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Chip
                size="small"
                color="success"
                variant="outlined"
                label={`ABIERTAS: ${summary.totalOpenSessions || 0}`}
                sx={{ fontFamily: "fontFamily.primary" }}
              />

              <Chip
                size="small"
                color="error"
                label={`CERRADAS: ${summary.totalClosedSessions || 0}`}
                variant="outlined"
                sx={{ fontFamily: "fontFamily.primary" }}
              />

              <Chip
                size="small"
                color="primary"
                variant="outlined"
                label={`PEDIDOS COBRADOS: ${summary.totalPaidOrders || 0}`}
                sx={{ fontFamily: "fontFamily.primary" }}
              />
            </Stack>
          </Paper>

          {/* DESGLOSE POR CAJA */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.main",
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                mb: 1.5,
              }}
            >
              DESGLOSE POR CAJA
            </Typography>

            {registers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No hay sesiones para los filtros seleccionados.
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {registers.map((register) => (
                  <Paper
                    key={register.cashRegisterId}
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <PointOfSaleIcon color="primary" fontSize="small" />

                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.primary",
                              fontSize: "1rem",
                              color: "text.primary",
                              textTransform: "uppercase",
                            }}
                          >
                            {register.registerName}
                          </Typography>

                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.secondary",
                            }}
                          >
                            {register.registerCode}
                          </Typography>
                        </Box>

                        <Chip
                          label={`${register.totals.totalSessions} sesiones`}
                          size="small"
                          variant="outlined"
                          sx={{ fontFamily: "fontFamily.secondary" }}
                        />
                      </Stack>

                      <Divider />

                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        VENTAS COBRADAS:{" "}
                        {money(register.totals.totalSalesAmount)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        VENTAS EFECTIVO:{" "}
                        {money(register.totals.totalCashSalesAmount)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        IMPACTO RIDERS:{" "}
                        {money(register.totals.totalRiderCashImpact)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "fontFamily.primary" }}
                      >
                        ESPERADO ACUMULADO:{" "}
                        {money(register.totals.totalExpectedCashAmount)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "fontFamily.primary",
                          color: differenceColor(
                            register.totals.totalDifferenceAmount,
                          ),
                        }}
                      >
                        DIFERENCIA DE CIERRES:{" "}
                        {money(register.totals.totalDifferenceAmount)}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            )}
          </Paper>

          {/* SIN CAJA */}
          {unassigned.includedInSummary && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.main",
              }}
            >
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentsIcon color="primary" />

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                    }}
                  >
                    SIN CAJA ASOCIADA
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                  }}
                >
                  Ventas registradas sin una sesión de caja. No se imputan
                  artificialmente a una caja física.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 1,
                  }}
                >
                  <MetricCard
                    label="VENTAS COBRADAS"
                    value={money(unassigned.totalSalesAmount)}
                  />

                  <MetricCard
                    label="VENTAS EN EFECTIVO"
                    value={money(unassigned.totalCashSalesAmount)}
                  />

                  <MetricCard
                    label="PENDIENTE DE COBRO"
                    value={money(unassigned.totalUnpaidAmount)}
                  />
                </Box>

                {(unassigned.paymentMethods || []).map((method) => (
                  <Stack
                    key={method.paymentMethod}
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    >
                      {method.paymentMethod} · {method.totalOrders} pedidos
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    >
                      {money(method.totalAmount)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}

          {/* MÉTODOS DE PAGO */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.main",
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                mb: 1.5,
              }}
            >
              COBROS POR MÉTODO DE PAGO
            </Typography>

            {methods.length === 0 ? (
              <Typography
                variant="body2"
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                }}
              >
                No hay cobros para este período.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {methods.map((method) => (
                  <Stack
                    key={method.paymentMethod}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "fontFamily.secondary" }}
                    >
                      {method.paymentMethod} · {method.totalOrders} pedidos
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        fontSize: 14,
                        color: "text.primary",
                      }}
                    >
                      {money(method.totalAmount)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Paper>

          {/* RIDERS */}
          {riders.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.main",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  mb: 1.5,
                }}
              >
                LIQUIDACIONES DE RIDERS
              </Typography>

              <Stack spacing={1}>
                {riders.map((rider) => (
                  <Stack
                    key={rider.riderId || rider.riderName}
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{
                      p: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.primary",
                          fontSize: "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {rider.riderName}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                        }}
                      >
                        {rider.totalClosures} cierres · {rider.totalOrders}{" "}
                        viajes
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: "1rem",
                        }}
                      >
                        Pagado: {money(rider.totalPayout)}
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: "0.85rem",
                        }}
                      >
                        Impacto caja: {money(rider.totalCashImpact)}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          )}
        </Stack>
      )}

      {/* HISTORIAL INDIVIDUAL */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 2.5 },
          mt: { xs: 2.5, sm: 3 },
          borderRadius: 3,
          bgcolor: "background.main",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          sx={{ mb: 2 }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: "1rem",
              color: "text.primary",
            }}
          >
            HISTORIAL DE SESIONES
          </Typography>

          <Chip
            size="small"
            variant="outlined"
            label={`${sessions.length} registros mostrados`}
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Stack>

        {!loading &&
          consolidated &&
          Number(summary.totalSessions || 0) > sessions.length && (
            <Alert
              severity="info"
              sx={{ mb: 2, fontFamily: "fontFamily.secondary" }}
            >
              El historial muestra hasta {HISTORY_LIMIT} sesiones. El reporte
              consolidado incluye todas las sesiones que coinciden con los
              filtros.
            </Alert>
          )}

        {sessions.length === 0 && !loading ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 4 }}
          >
            No se encontraron sesiones con estos filtros.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {sessions.map((session) => (
              <Paper
                key={session.id}
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: "background.paper",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      flexWrap="wrap"
                    >
                      <PointOfSaleIcon color="primary" fontSize="small" />

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.primary",
                          fontSize: "1rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {session.registerName}
                      </Typography>

                      <Chip
                        size="small"
                        label={
                          session.status === "OPEN" ? "ABIERTA" : "CERRADA"
                        }
                        color={session.status === "OPEN" ? "success" : "error"}
                        sx={{ fontFamily: "fontFamily.primary" }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: 12,
                        color: "text.secondary",
                        mt: 0.75,
                      }}
                    >
                      Apertura: {formatArgentinaDateTime(session.openedAt)}
                    </Typography>

                    {session.closedAt && (
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: 12,
                          color: "text.secondary",
                        }}
                      >
                        Cierre: {formatArgentinaDateTime(session.closedAt)}
                      </Typography>
                    )}

                    <Typography
                      variant="body2"
                      sx={{ fontFamily: "fontFamily.secondary", mt: 0.75 }}
                    >
                      Monto inicial: {money(session.openingAmount)}
                    </Typography>

                    {session.status === "CLOSED" && (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: differenceColor(session.differenceAmount),
                        }}
                      >
                        Diferencia: {money(session.differenceAmount)}
                      </Typography>
                    )}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ReceiptIcon />}
                    onClick={() => handleViewReport(session)}
                    sx={{
                      alignSelf: "flex-start",
                      fontFamily: "fontFamily.primary",
                    }}
                  >
                    Ver detalle
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>

      <ModalCashSessionReport
        open={Boolean(selectedSession)}
        onClose={closeReport}
        session={selectedSession}
        report={selectedReport}
        loading={reportLoading}
      />
    </Box>
  );
};
