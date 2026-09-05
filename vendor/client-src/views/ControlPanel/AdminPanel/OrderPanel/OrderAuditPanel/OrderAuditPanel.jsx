import { useCallback, useEffect, useMemo, useState } from "react";

import dayjs from "dayjs";
import "dayjs/locale/es";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
// Icons
import {
  Cancel as CancelIcon,
  History as HistoryIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  ReceiptLong as ReceiptIcon,
  SwapHoriz as ChangeIcon,
  FilterAltOutlined as FilterIcon,
} from "@mui/icons-material";
// ---------------------

// ---- COMPONENTS ----
import { ModalOrderAudit } from "@/components/PanelComponents/ModalOrderAudit/ModalOrderAudit.jsx";
// --------------------

// ---- SERVICES ----
import { getDailyOrderAuditService } from "@/services/orderAudit.js";
// ------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import {
  ACTION_SHORT_LABELS,
  ACTION_COLORS,
  AUDIT_FILTER_OPTIONS,
  getArgentinaToday,
  formatDate,
} from "@/utils/orderAuditUtils";
import { statusOptions } from "@/utils/components/StatusUtils.jsx";
// ---------------

// ---- STYLES ----
import {
  tableHeadStyle,
  tableBodyStyle,
  auditCalendarPaperSx,
} from "../styles/orderStyles.js";
// ----------------

export const OrderAuditPanel = ({ user }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(getArgentinaToday);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [auditData, setAuditData] = useState({
    summary: {},
    orders: [],
  });

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const getStatusOption = (status) => {
    return statusOptions.find((option) => option.value === status) || null;
  };

  const canReadAudit =
    user?.role === "admin" ||
    user?.role === "dev" ||
    (user?.role === "staff" && user?.permissions?.orders?.readAudit === true);

  const fetchAudit = useCallback(async () => {
    if (!selectedDate || !canReadAudit) {
      return;
    }

    setLoading(true);

    try {
      const response = await getDailyOrderAuditService({
        date: selectedDate,
        changeType: selectedFilter,
      });

      setAuditData({
        summary: response?.summary || {},
        orders: Array.isArray(response?.orders) ? response.orders : [],
      });
    } catch (error) {
      showAlert(error?.message || "Error al obtener auditorías", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedFilter, canReadAudit, showAlert]);

  useEffect(() => {
    fetchAudit();
  }, [fetchAudit]);

  const summaryCards = useMemo(
    () => [
      {
        title: "PEDIDOS MODIFICADOS",
        value: auditData.summary?.affectedOrders || 0,
        icon: <ReceiptIcon />,
      },

      {
        title: "CAMBIOS REGISTRADOS",
        value: auditData.summary?.totalEvents || 0,
        icon: <ChangeIcon />,
      },

      {
        title: "CANCELACIONES",
        value: auditData.summary?.cancellations || 0,
        icon: <CancelIcon />,
      },

      {
        title: "CAMBIOS DE PAGO",
        value: auditData.summary?.paymentChanges || 0,
        icon: <PaymentIcon />,
      },
    ],
    [auditData.summary],
  );

  const handleOpenOrderAudit = (orderId) => {
    setSelectedOrderId(orderId);
    setAuditModalOpen(true);
  };

  if (!canReadAudit) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",

            color: "text.secondary",
          }}
        >
          No tenés permisos para visualizar las auditorías de pedidos.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Stack spacing={2}>
        {/* HEADER */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
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
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
          >
            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <HistoryIcon color="primary" />

                <Typography
                  sx={{ fontFamily: "fontFamily.primary", fontSize: 20 }}
                >
                  AUDITORÍA DE PEDIDOS
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 0.5,
                  fontFamily: "fontFamily.secondary",
                  color: "primary.main",
                  fontSize: 14,
                }}
              >
                Revisá las modificaciones realizadas en los pedidos durante un
                día.
              </Typography>
            </Box>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
            >
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="es"
              >
                <DatePicker
                  label="Fecha"
                  format="DD-MM-YYYY"
                  value={selectedDate ? dayjs(selectedDate) : null}
                  maxDate={dayjs(getArgentinaToday())}
                  onChange={(newValue) => {
                    if (!newValue || !newValue.isValid()) {
                      setSelectedDate("");
                      return;
                    }
                    setSelectedDate(newValue.format("YYYY-MM-DD"));
                  }}
                  slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        minWidth: {
                          xs: "100%",
                          sm: 175,
                        },
                        "& .MuiInputBase-input": {
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                        },
                        "& .MuiInputLabel-root": {
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: "primary.main",
                        },
                        "& .MuiSvgIcon-root": {
                          color: "primary.main",
                        },
                      },
                    },
                    desktopPaper: {
                      sx: auditCalendarPaperSx,
                    },
                    mobilePaper: {
                      sx: auditCalendarPaperSx,
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
                  }}
                />
              </LocalizationProvider>

              <FormControl
                size="small"
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 210,
                  },
                }}
              >
                <InputLabel
                  id="order-audit-filter-label"
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                  }}
                >
                  Tipo de cambio
                </InputLabel>

                <Select
                  labelId="order-audit-filter-label"
                  value={selectedFilter}
                  label="Tipo de cambio"
                  onChange={(event) => setSelectedFilter(event.target.value)}
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                  }}
                >
                  {AUDIT_FILTER_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                      }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <RefreshIcon />
                  )
                }
                disabled={loading}
                onClick={fetchAudit}
                sx={{
                  fontFamily: "fontFamily.primary",
                }}
              >
                Actualizar
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {selectedFilter !== "ALL" && (
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ bgcolor: "background.main", p: 2, borderRadius: "10px" }}
          >
            <FilterIcon
              sx={{
                fontSize: 22,
                color: "primary.main",
              }}
            />

            <Typography
              sx={{ fontFamily: "fontFamily.secondary", fontSize: 14 }}
            >
              Filtros aplicados:
            </Typography>

            <Chip
              size="small"
              color="primary"
              variant="outlined"
              label={
                AUDIT_FILTER_OPTIONS.find(
                  (option) => option.value === selectedFilter,
                )?.label || selectedFilter
              }
              onDelete={() => setSelectedFilter("ALL")}
              sx={{
                fontFamily: "fontFamily.secondary",
                fontSize: 14,
                textTransform: "uppercase",
              }}
            />
          </Stack>
        )}

        {/* RESUMEN */}

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {summaryCards.map((item) => (
            <Paper
              key={item.title}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "primary.main",
                bgcolor: "background.main",
              }}
            >
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
                      color: "text.primary",
                      fontSize: 11,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      fontFamily: "fontFamily.primary",
                      fontSize: 24,
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>

                <Box sx={{ color: "primary.main" }}>{item.icon}</Box>
              </Stack>
            </Paper>
          ))}
        </Box>

        {/* LISTADO */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          {loading ? (
            <Box
              sx={{
                py: 8,
                display: "grid",
                placeItems: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : auditData.orders.length === 0 ? (
            <Box
              sx={{
                py: 7,
                textAlign: "center",
              }}
            >
              <HistoryIcon
                sx={{
                  fontSize: 42,
                  color: "text.disabled",
                }}
              />

              <Typography sx={{ mt: 1, fontFamily: "fontFamily.primary" }}>
                SIN MODIFICACIONES
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "primary.main",
                  fontSize: 13,
                }}
              >
                {selectedFilter === "ALL"
                  ? "No se registraron cambios en pedidos durante esta fecha."
                  : "No se encontraron modificaciones de este tipo durante la fecha seleccionada."}
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "background.main" }}>
                  <TableRow>
                    <TableCell sx={tableHeadStyle}>PEDIDO</TableCell>
                    <TableCell sx={tableHeadStyle}>CLIENTE</TableCell>
                    <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                    <TableCell sx={tableHeadStyle}>CAMBIOS</TableCell>
                    <TableCell sx={tableHeadStyle}>USUARIOS</TableCell>
                    <TableCell sx={tableHeadStyle}>ÚLTIMO CAMBIO</TableCell>
                    <TableCell sx={tableHeadStyle}>DETALLE</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody sx={{ bgcolor: "background.paper" }}>
                  {auditData.orders.map((order) => {
                    const status = getStatusOption(order.currentStatus);
                    return (
                      <TableRow key={order.orderId} hover>
                        <TableCell sx={tableBodyStyle}>
                          <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                            #{order.orderId}
                          </Typography>
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              textTransform: "uppercase",
                              fontSize: 14,
                            }}
                          >
                            {order.clientName}
                          </Typography>
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Chip
                            icon={status?.icon || undefined}
                            size="small"
                            label={status?.value || "SIN ESTADO"}
                            color={status?.color || "default"}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {Object.entries(order.actionCounts || {}).map(
                              ([action, count]) => (
                                <Chip
                                  key={action}
                                  size="small"
                                  color={ACTION_COLORS[action] || "default"}
                                  label={`${
                                    ACTION_SHORT_LABELS[action] || action
                                  } · ${count}`}
                                  sx={{
                                    fontFamily: "fontFamily.primary",
                                    textTransform: "uppercase",
                                  }}
                                />
                              ),
                            )}
                          </Stack>
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Stack spacing={0.3}>
                            {(order.actors || []).map((actor, index) => (
                              <Typography
                                key={`${actor.type}-${actor.name}-${index}`}
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  fontSize: 14,
                                  textTransform: "uppercase",
                                }}
                              >
                                {actor.name}{" "}
                                <Box
                                  component="span"
                                  sx={{ color: "primary.main" }}
                                >
                                  ({actor.type})
                                </Box>
                              </Typography>
                            ))}
                          </Stack>
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Typography
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              fontSize: 14,
                            }}
                          >
                            {formatDate(order.lastChangedAt)}
                          </Typography>
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<HistoryIcon />}
                            onClick={() => handleOpenOrderAudit(order.orderId)}
                            sx={{
                              fontFamily: "fontFamily.primary",
                            }}
                          >
                            Historial
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Stack>

      <ModalOrderAudit
        open={auditModalOpen}
        orderId={selectedOrderId}
        showAlert={showAlert}
        onClose={() => {
          setAuditModalOpen(false);
          setSelectedOrderId(null);
        }}
      />

      {AlertComponent}
    </Box>
  );
};
