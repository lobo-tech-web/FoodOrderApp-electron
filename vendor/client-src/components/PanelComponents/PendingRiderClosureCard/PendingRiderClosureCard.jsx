// ---- Material UI ----
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  EditNote as EditNoteIcon,
  CheckCircle as CheckCircleIcon,
  Payments as PaymentsIcon,
  TwoWheeler as TwoWheelerIcon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";
// ---------------------

import { formatCurrency } from "@/utils/orderCalculations.js";

export const PendingRiderClosureCard = ({ group, rider, onOpenClosure }) => {
  if (!group || !rider) return null;

  const riderForClosure = {
    id: rider.riderId,
    riderId: rider.riderId,
    name: rider.name,
    phone: rider.phone,
    closureDateKey: group.dateKey,
    closureDateLabel: group.dateLabel,
    trips: rider.trips,
    cashOrdersCount: rider.cashOrdersCount,
    cashCollected: rider.cashCollected,
    deliveryFeeTotal: rider.deliveryFeeTotal,
    deliveries: rider.deliveries || [],
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 3,
        bgcolor: "background.main",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* HEADER */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", md: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "rgba(245, 166, 35, 0.12)",
              border: "1px solid",
              borderColor: "primary.main",
              color: "primary.main",
            }}
          >
            <TwoWheelerIcon />
          </Box>

          <Box>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: "1rem",
              }}
            >
              {rider.name}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: "0.8rem",
              }}
            >
              {rider.phone || "Teléfono sin especificar"}
            </Typography>
          </Box>
        </Stack>

        <Chip
          icon={<ReceiptLongIcon />}
          label={`${rider.trips || 0} viajes pendientes`}
          color="warning"
          variant="outlined"
          sx={{
            fontFamily: "fontFamily.secondary",
            alignSelf: { xs: "flex-start", md: "center" },
          }}
        />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* RESUMEN */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, 1fr)",
          },
          gap: 1.2,
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <ReceiptLongIcon color="primary" fontSize="small" />

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: "0.78rem",
              }}
            >
              PEDIDOS ASIGNADOS
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.7,
              fontFamily: "fontFamily.primary",
              color: "text.primary",
              fontSize: "1.15rem",
            }}
          >
            {rider.trips || 0}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <PaymentsIcon color="success" fontSize="small" />

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: "0.78rem",
              }}
            >
              EFECTIVO COBRADO
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.7,
              fontFamily: "fontFamily.primary",
              color: "success.main",
              fontSize: "1.15rem",
            }}
          >
            {formatCurrency(rider.cashCollected || 0)}
          </Typography>
        </Box>

        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "background.default",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TwoWheelerIcon color="primary" fontSize="small" />

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: "0.78rem",
              }}
            >
              TOTAL EN ENVÍOS
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 0.7,
              fontFamily: "fontFamily.primary",
              color: "primary.main",
              fontSize: "1.15rem",
            }}
          >
            {formatCurrency(rider.deliveryFeeTotal || 0)}
          </Typography>
        </Box>
      </Box>

      {/* PEDIDOS */}
      {Array.isArray(rider.deliveries) && rider.deliveries.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 1,
              mb: 1,
            }}
          >
            <ReceiptLongIcon color="primary" />

            <Typography
              sx={{
                mb: 1,
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: "0.85rem",
              }}
            >
              PEDIDOS REPARTIDOS
            </Typography>
          </Box>

          <Stack
            spacing={0.8}
            sx={{
              maxHeight: 190,
              overflowY: "auto",
              pr: 0.5,
            }}
          >
            {rider.deliveries.map((delivery) => (
              <Box
                key={delivery.id}
                sx={{
                  p: 1.2,
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "100px 1fr 160px 130px",
                  },
                  gap: 1,
                  alignItems: "center",
                  borderRadius: 2,
                  bgcolor: "background.default",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box sx={{ display: "flex", gap: 1 }}>
                  <ReceiptLongIcon color="primary" />
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: "0.82rem",
                    }}
                  >
                    #{delivery.orderId}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                  }}
                >
                  {delivery.clientName || "Cliente"} -{" "}
                  {delivery.deliveryAddress || "Sin dirección"}
                </Typography>

                <Chip
                  size="small"
                  label={delivery.paymentMethod || "SIN ESPECIFICAR"}
                  color={
                    delivery.paymentMethod === "EFECTIVO"
                      ? "success"
                      : "default"
                  }
                  variant="outlined"
                  sx={{
                    fontFamily: "fontFamily.secondary",
                    justifySelf: "start",
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: "fontFamily.primary",
                    color: "success.main",
                    textAlign: { xs: "left", sm: "right" },
                    fontSize: "1rem",
                  }}
                >
                  {formatCurrency(delivery.deliveryCost || 0)}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* ACCIONES */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="flex-end"
      >
        <Button
          variant="outlined"
          color="primary"
          startIcon={<EditNoteIcon />}
          onClick={() => onOpenClosure(riderForClosure, "draft")}
          sx={{
            fontFamily: "fontFamily.primary",
            minWidth: 180,
          }}
        >
          Editar borrador
        </Button>

        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => onOpenClosure(riderForClosure, "close")}
          sx={{
            fontFamily: "fontFamily.primary",
            minWidth: 180,
          }}
        >
          Cerrar turno
        </Button>
      </Stack>
    </Paper>
  );
};
