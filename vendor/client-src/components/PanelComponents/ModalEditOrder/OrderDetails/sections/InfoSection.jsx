// ---- Material UI ----
import {
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
// Icons
import {
  Edit as EditIcon,
  AttachMoney as MoneyIcon,
  Moped as MopedIcon,
  Pending as PendingIcon,
  Percent as PercentIcon,
  TwoWheeler as TwoWheelerIcon,
} from "@mui/icons-material";

// ---- STLYES ----
import {
  fieldStyles,
  sectionInfoCardStyle,
  sectionInfoHeaderStyle,
  sectionInfoTitleStyle,
  optionInfoGridStyle,
} from "../../styles/modalEditOrder.styles.js";
// ----------------

// ---- Shared ----
import { FieldBlock } from "../../shared/FieldBlock.jsx";
import { ModalSection } from "../../shared/ModalSection.jsx";
import { OptionButton } from "../../shared/OptionButton.jsx";
// ----------------

// ---- Utils ----
import { discountMethods } from "@/utils/components/DiscountUtils.jsx";
import { orderTypeOptions } from "@/utils/components/OrderTypeUtils.jsx";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
import { statusOptions } from "@/utils/components/StatusUtils.jsx";
// ---------------------

const getStatusColor = (status) => {
  if (status === "PENDIENTE A CONFIRMAR") return "#f5a623";
  if (status === "EN PREPARACIÓN") return "#2196f3";
  if (status === "EN ENVIO") return "#9c27b0";
  if (status === "FINALIZADO") return "#4caf50";
  if (status === "CANCELADO") return "#f44336";
  return "#f5a623";
};

const SectionCard = ({ icon, title, children }) => {
  return (
    <Box sx={sectionInfoCardStyle}>
      <Box sx={sectionInfoHeaderStyle}>
        {icon}
        <Typography sx={sectionInfoTitleStyle}>{title}</Typography>
      </Box>
      {children}
    </Box>
  );
};

export const InfoSection = ({
  order,
  setOrder,
  handleInputChange,
  isDiscount,
  handleDiscountChange,
  availableRiders,
  editingRider,
  selectedRider,
  setEditingRider,
  setOpenSelectRider,
  openSelectRider,
  originalStatus,
  cancelReason,
  setCancelReason,
  editCapabilities,
  availableStatuses,
}) => {
  const visibleStatusOptions = statusOptions.filter((status) => {
    return (
      status.value === order.status || availableStatuses.includes(status.value)
    );
  });

  return (
    <ModalSection>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gridTemplateAreas: {
            xs: `
              "payment"
              "status"
              "delivery"
              "discount"
            `,
            md: `
              "payment status"
              "delivery discount"
            `,
          },
          gap: { xs: 1.2, md: 1.4 },
        }}
      >
        {/* MÉTODO DE PAGO */}
        <Box sx={{ gridArea: "payment", minWidth: 0 }}>
          <SectionCard
            title="Método de pago"
            icon={<MoneyIcon sx={{ color: "primary.main" }} />}
          >
            <Box
              sx={{
                ...optionInfoGridStyle,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(4, minmax(0, 1fr))",
                  md: "repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              {paymentMethods.map((method) => {
                const selected = order.paymentMethod === method.value;
                return (
                  <OptionButton
                    key={method.value}
                    selected={selected}
                    icon={method.icon}
                    label={method.label || method.value}
                    disabled={!editCapabilities.canEditPayment}
                    onClick={() =>
                      handleInputChange({
                        target: {
                          name: "paymentMethod",
                          value: method.value,
                        },
                      })
                    }
                  />
                );
              })}
            </Box>
          </SectionCard>
        </Box>

        {/* ESTADO DEL PEDIDO */}
        <Box sx={{ gridArea: "status", minWidth: 0 }}>
          <SectionCard
            title="Estado del pedido"
            icon={<PendingIcon sx={{ color: "primary.main" }} />}
          >
            <Box
              sx={{
                ...optionInfoGridStyle,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(3, minmax(0, 1fr))",
                  lg: "repeat(5, minmax(0, 1fr))",
                },
              }}
            >
              {visibleStatusOptions.map((status) => {
                const selected = order.status === status.value;
                const statusColor = getStatusColor(status.value);
                return (
                  <OptionButton
                    key={status.value}
                    selected={selected}
                    icon={status.icon}
                    label={status.label || status.value}
                    customColor={statusColor}
                    disabled={!editCapabilities.canUpdateStatus}
                    onClick={() =>
                      handleInputChange({
                        target: {
                          name: "status",
                          value: status.value,
                        },
                      })
                    }
                  />
                );
              })}
            </Box>

            {order.status === "CANCELADO" && originalStatus !== "CANCELADO" && (
              <Box sx={{ mt: 1.4 }}>
                <FieldBlock label="Motivo de cancelación">
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    value={cancelReason}
                    onChange={(event) => setCancelReason(event.target.value)}
                    placeholder="Ej: el cliente solicitó cancelar el pedido"
                    sx={fieldStyles}
                  />
                </FieldBlock>
              </Box>
            )}
          </SectionCard>
        </Box>

        {/* TIPO DE ENTREGA */}
        <Box sx={{ gridArea: "delivery", minWidth: 0 }}>
          <SectionCard
            title="Tipo de entrega"
            icon={<TwoWheelerIcon sx={{ color: "primary.main" }} />}
          >
            <Box
              sx={{
                ...optionInfoGridStyle,
                gridTemplateColumns: {
                  xs: "repeat(2, minmax(0, 1fr))",
                  sm: "repeat(4, minmax(0, 1fr))",
                },
              }}
            >
              {orderTypeOptions.map((type) => {
                const selected = order.orderType === type.value;
                return (
                  <OptionButton
                    key={type.value}
                    selected={selected}
                    icon={type.icon}
                    label={type.label || type.value}
                    disabled={!editCapabilities.canEditDelivery}
                    onClick={() =>
                      handleInputChange({
                        target: {
                          name: "orderType",
                          value: type.value,
                        },
                      })
                    }
                  />
                );
              })}
            </Box>

            {order.orderType === "DELIVERY" && (
              <Box
                sx={{
                  mt: 1.2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm:
                      availableRiders.length > 0
                        ? "minmax(0, 1fr) minmax(0, 1fr)"
                        : "1fr",
                  },
                  gap: 1,
                }}
              >
                <TextField
                  fullWidth
                  type="text"
                  label="Costo de envío"
                  name="deliverycost"
                  value={order.deliverycost}
                  disabled={!editCapabilities.canEditDelivery}
                  onChange={handleInputChange}
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon color="success" />
                      </InputAdornment>
                    ),
                  }}
                />

                {availableRiders.length > 0 && (
                  <>
                    {order.riderId && !editingRider ? (
                      <TextField
                        fullWidth
                        type="text"
                        label="Rider seleccionado"
                        value={selectedRider?.name || ""}
                        sx={fieldStyles}
                        InputProps={{
                          readOnly: true,
                          startAdornment: (
                            <InputAdornment position="start">
                              <MopedIcon color="primary" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                disabled={!editCapabilities.canEditRider}
                                onClick={() => {
                                  setEditingRider(true);
                                  setOpenSelectRider(true);
                                }}
                              >
                                <EditIcon color="primary" />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    ) : (
                      <TextField
                        select
                        fullWidth
                        label="Seleccionar rider"
                        value={order.riderId || ""}
                        sx={fieldStyles}
                        SelectProps={{
                          open: openSelectRider,
                          onClose: () => {
                            setOpenSelectRider(false);
                            setEditingRider(false);
                          },
                          onOpen: () => setOpenSelectRider(true),
                        }}
                        disabled={!editCapabilities.canEditRider}
                        onChange={(e) => {
                          const riderId = e.target.value || null;

                          const selectedRiderData =
                            availableRiders.find(
                              (rider) => rider.id === riderId,
                            ) || null;

                          setOrder((prev) => ({
                            ...prev,
                            riderId,
                            rider: selectedRiderData,
                          }));

                          setEditingRider(false);
                          setOpenSelectRider(false);
                        }}
                      >
                        <MenuItem value="">
                          <Typography
                            sx={{ fontFamily: "fontFamily.terciary" }}
                          >
                            Sin asignar
                          </Typography>
                        </MenuItem>

                        {availableRiders.map((rider) => (
                          <MenuItem key={rider.id} value={rider.id}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <MopedIcon color="primary" />
                              <Typography
                                sx={{ fontFamily: "fontFamily.terciary" }}
                              >
                                {rider?.name?.toUpperCase()}
                                {rider?.phone ? ` (${rider.phone})` : ""}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </>
                )}
              </Box>
            )}
          </SectionCard>
        </Box>

        {/* DESCUENTO */}
        <Box sx={{ gridArea: "discount", minWidth: 0 }}>
          <SectionCard
            title="Descuento"
            icon={<PercentIcon sx={{ color: "primary.main" }} />}
          >
            <Box
              sx={{
                ...optionInfoGridStyle,
                gridTemplateColumns: {
                  xs: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {discountMethods.map((type) => {
                const selected = isDiscount === type.value;

                return (
                  <OptionButton
                    key={type.value}
                    selected={selected}
                    icon={type.icon}
                    label={type.value}
                    disabled={!editCapabilities.canEditPayment}
                    onClick={() => handleDiscountChange(type.value)}
                  />
                );
              })}
            </Box>

            {isDiscount === "PORCENTAJE" && (
              <Box sx={{ mt: 1.2 }}>
                <TextField
                  fullWidth
                  type="text"
                  label="Valor del descuento"
                  name="discount"
                  value={order.discount}
                  disabled={!editCapabilities.canEditPayment}
                  onChange={handleInputChange}
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PercentIcon color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <Chip
                          size="small"
                          label="%"
                          color="primary"
                          variant="outlined"
                          sx={{
                            fontFamily: "fontFamily.terciary",
                            fontWeight: 800,
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {isDiscount === "MONTO" && (
              <Box sx={{ mt: 1.2 }}>
                <TextField
                  fullWidth
                  type="text"
                  label="Valor del descuento"
                  name="discountamount"
                  value={order.discountamount}
                  disabled={!editCapabilities.canEditPayment}
                  onChange={handleInputChange}
                  sx={fieldStyles}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MoneyIcon color="success" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}

            {isDiscount === "SIN DESCUENTO" && (
              <Typography
                sx={{
                  mt: 1.2,
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                  fontSize: "0.82rem",
                }}
              >
                El pedido no tiene descuentos aplicados.
              </Typography>
            )}
          </SectionCard>
        </Box>
      </Box>
    </ModalSection>
  );
};
