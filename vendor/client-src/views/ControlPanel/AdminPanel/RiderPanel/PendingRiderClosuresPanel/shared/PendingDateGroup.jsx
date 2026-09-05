import { useState } from "react";

// ---- Material UI ----
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// ICONS
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Moped as MopedIcon,
  Payments as PaymentsIcon,
  RequestQuote as RequestQuoteIcon,
  ReceiptLong as ReceiptLongIcon,
  CalendarToday as CalendarTodayIcon,
  PriceCheck as PriceCheckIcon,
  Person as PersonIcon,
  Home as HomeIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

export const PendingDateGroup = ({ group, onOpenClosure }) => {
  const [open, setOpen] = useState(true);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "primary.main",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          bgcolor: "background.main",
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <IconButton size="small" onClick={() => setOpen((prev) => !prev)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 166, 35, 0.12)",
              color: "primary.main",
            }}
          >
            <CalendarTodayIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: "1rem", sm: "1.12rem" },
                lineHeight: 1,
              }}
            >
              {group.dateLabel}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: "0.82rem",
                mt: 0.5,
              }}
            >
              {group.riders.length} RIDER
              {group.riders.length === 1 ? "" : "s"} CON CIERRES PENDIENTES
            </Typography>
          </Box>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Chip
            icon={<MopedIcon />}
            label={`${group.totalTrips} VIAJE/S`}
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />

          <Chip
            icon={<PaymentsIcon />}
            label={`EFECTIVO: ${formatCurrency(group.totalCashCollected)}`}
            color="success"
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />

          <Chip
            icon={<PriceCheckIcon />}
            label={`DELIVERYS: ${formatCurrency(group.totalDeliveryFee)}`}
            color="primary"
            variant="outlined"
            sx={{ fontFamily: "fontFamily.secondary" }}
          />
        </Stack>
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Stack spacing={1.2} sx={{ p: { xs: 1.5, sm: 2 } }}>
          {group.riders.map((rider) => (
            <Paper
              key={rider.riderId}
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2.5,
                bgcolor: "background.main",
                border: "1px solid",
                borderColor: "text.primary",
              }}
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                alignItems={{ xs: "stretch", md: "center" }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: "primary.main",
                      color: "text.terciary",
                      fontFamily: "fontFamily.secondary",
                    }}
                  >
                    {rider.name?.charAt(0) || "R"}
                  </Avatar>

                  <Box>
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        lineHeight: 1.1,
                      }}
                    >
                      {rider.name}
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.secondary",
                        fontSize: "0.8rem",
                        mt: 0.4,
                      }}
                    >
                      {rider.phone || "Sin teléfono"}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", sm: "center" }}
                >
                  <Chip
                    icon={<ReceiptLongIcon />}
                    label={`${rider.trips} PEDIDO/S`}
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Chip
                    icon={<PaymentsIcon />}
                    label={`EFECTIVO: ${formatCurrency(rider.cashCollected)}`}
                    color="success"
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Chip
                    icon={<PriceCheckIcon />}
                    label={`RIDER: ${formatCurrency(rider.deliveryFeeTotal)}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontFamily: "fontFamily.secondary" }}
                  />

                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<RequestQuoteIcon />}
                    onClick={() =>
                      onOpenClosure({
                        id: rider.riderId,
                        name: rider.name,
                        phone: rider.phone,
                        closureDateKey: group.dateKey,
                        closureDateLabel: group.dateLabel,
                      })
                    }
                    sx={{
                      fontFamily: "fontFamily.primary",
                      borderRadius: 2,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Cerrar turno
                  </Button>
                </Stack>
              </Stack>

              <Box
                sx={{
                  mt: 1.2,
                  pt: 1.2,
                  borderTop: "1px dashed",
                  borderColor: "primary.main",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-start",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <MopedIcon color="primary" />
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: "0.85rem",
                      mb: 0.8,
                    }}
                  >
                    PEDIDOS REPARTIDOS
                  </Typography>
                </Box>

                <Stack spacing={0.7}>
                  {rider.deliveries.map((delivery) => (
                    <Box
                      key={delivery.id}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "1fr 1fr 1fr 1fr",
                        },
                        gap: 1,
                        p: 1,
                        borderRadius: 2,
                        bgcolor: "background.paper",
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <ReceiptLongIcon color="primary" />
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "primary.main",
                            fontSize: "0.8rem",
                          }}
                        >
                          #{delivery.orderId}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <PersonIcon fontSize="small" />
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            color: "text.primary",
                            fontSize: "0.8rem",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            textTransform: "uppercase",
                          }}
                        >
                          {delivery.clientName || "Cliente"} -{" "}
                          {delivery.deliveryAddress || "Sin dirección"}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                          fontSize: "0.8rem",
                        }}
                      >
                        {delivery.paymentMethod}
                      </Typography>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.primary",
                          color: "success.main",
                          fontSize: "0.9rem",
                          textAlign: { xs: "left", sm: "right" },
                        }}
                      >
                        {formatCurrency(delivery.orderTotal)}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Paper>
          ))}
        </Stack>
      </Collapse>
    </Paper>
  );
};
