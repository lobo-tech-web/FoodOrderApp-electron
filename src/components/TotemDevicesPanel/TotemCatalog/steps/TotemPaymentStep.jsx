import { useEffect, useRef, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  CheckCircleOutline,
  PrintOutlined,
  Refresh,
} from "@mui/icons-material";
// ---------------------

import { money } from "../totemCart.js";

export const TotemPaymentStep = ({
  checkout,
  error,
  busy,
  onRecover,
  onCancel,
  onFinish,
}) => {
  const [printResult, setPrintResult] = useState(null);
  const [printing, setPrinting] = useState(false);
  const printJob = useRef(null);

  const completed = checkout?.status === "COMPLETED";
  const terminal = ["CANCELED", "FAILED", "EXPIRED"].includes(checkout?.status);

  useEffect(() => {
    if (!completed) return;
    let active = true;

    if (printJob.current?.id !== checkout.id) {
      printJob.current = {
        id: checkout.id,
        promise: window.totemAPI.printReceipt(checkout.id),
      };
    }

    setPrinting(true);

    printJob.current.promise
      .then((result) => {
        if (active) setPrintResult(result);
      })
      .catch(() => {
        if (active) setPrintResult({ printed: false });
      })
      .finally(() => {
        if (active) setPrinting(false);
      });
    return () => {
      active = false;
    };
  }, [completed, checkout?.id]);

  useEffect(() => {
    if (!completed || !printResult || printing || busy || error) return;

    const timer = setTimeout(onFinish, 20000);
    return () => clearTimeout(timer);
  }, [completed, printResult, printing, busy, error, onFinish]);

  const reprint = async () => {
    setPrinting(true);
    try {
      setPrintResult(await window.totemAPI.printReceipt(checkout.id));
    } catch {
      setPrintResult({ printed: false });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 620, width: "100%", mx: "auto", p: 3 }}>
      <Stack spacing={3} alignItems="center" sx={{ py: 4 }}>
        {completed ? (
          <CheckCircleOutline color="success" sx={{ fontSize: 64 }} />
        ) : (
          !terminal && <CircularProgress />
        )}
        <Typography variant="h5" textAlign="center">
          {completed
            ? "Pedido creado exitosamente"
            : terminal
              ? "El pago no se completó"
              : "Estamos verificando tu pago"}
        </Typography>
        {completed ? (
          <>
            <Typography variant="h4" fontWeight={700}>
              Pedido #{checkout.order.dailyOrderNumber}
            </Typography>
            <Typography>Te llamamos con este número</Typography>
          </>
        ) : (
          <Typography textAlign="center">
            {terminal
              ? "No se generó un pedido pagado."
              : "Completá el pago en la terminal del local. No vuelvas a pagar mientras verificamos esta compra."}
          </Typography>
        )}
        {checkout && (
          <Typography variant="h6">{money(checkout.totalAmount)}</Typography>
        )}
        {error && <Alert severity="warning">{error}</Alert>}
        {printing && <Typography>Imprimiendo tu ticket...</Typography>}
        {printResult?.printed === false && (
          <Alert severity="warning">
            Tu pedido está confirmado. No pudimos imprimir el ticket; solicitá
            ayuda al local indicando el número de pedido.
          </Alert>
        )}
        {completed && (
          <Button
            startIcon={<PrintOutlined />}
            variant="outlined"
            disabled={printing || busy}
            onClick={reprint}
          >
            Volver a imprimir
          </Button>
        )}
        {completed || terminal ? (
          <Button
            size="large"
            variant="contained"
            disabled={busy || printing}
            onClick={onFinish}
          >
            Finalizar
          </Button>
        ) : (
          <>
            <Button startIcon={<Refresh />} disabled={busy} onClick={onRecover}>
              Verificar estado
            </Button>
            {checkout && (
              <Button color="error" disabled={busy} onClick={onCancel}>
                Cancelar pago
              </Button>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
};
