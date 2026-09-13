import { useState, useCallback } from "react";

// ---- Material UI ----
import { Box, Stack, Button, Paper, Chip, Typography } from "@mui/material";
import {
  PointOfSale as PointOfSaleIcon,
  CurrencyExchange as CurrencyExchangeIcon,
  LockClock as CloseIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Components ----
import { CashRegisterGate } from "../../StaffPanel/CashRegisterGate/CashRegisterGate.jsx";
import { CashMovementModal } from "../../StaffPanel/CashMovementModal/CashMovementModal.jsx";
import { CashCloseModal } from "../../StaffPanel/CashCloseModal/CashCloseModal.jsx";
import { CashRegisterHistoryPanel } from "../../StaffPanel/CashRegisterHistoryPanel/CashRegisterHistoryPanel.jsx";
// --------------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import { formatMoney } from "@/utils/cashRegisterUtils.js";
// ---------------

export const CashRegisterSessions = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();

  const [selectedCashRegisterId, setSelectedCashRegisterId] = useState(null);
  const [cashRefreshKey, setCashRefreshKey] = useState(0);
  const [cashSession, setCashSession] = useState(null);
  const [cashMovementOpen, setCashMovementOpen] = useState(false);
  const [cashCloseOpen, setCashCloseOpen] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const refreshCashHistory = useCallback(() => {
    setHistoryRefreshKey((prev) => prev + 1);
  }, []);

  const handleCashSessionChange = useCallback((session) => {
    setCashSession(session || null);

    if (session?.id) {
      setHistoryRefreshKey((prev) => prev + 1);
    }
  }, []);

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
      <Stack spacing={2}>
        <CashRegisterGate
          user={user}
          cashSession={cashSession}
          selectedCashRegisterId={selectedCashRegisterId}
          onCashRegisterChange={(cashRegisterId) => {
            setSelectedCashRegisterId(cashRegisterId || null);
          }}
          onCashSessionChange={handleCashSessionChange}
          showAlert={showAlert}
          refreshKey={cashRefreshKey}
          showPrompt
          variant="full"
        />

        {cashSession && (
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "success.main",
              bgcolor: "background.paper",
            }}
          >
            <Stack spacing={2}>
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
                spacing={1}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PointOfSaleIcon color="primary" />
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        textTransform: "uppercase",
                      }}
                    >
                      {cashSession.registerName || "Caja Principal"}
                    </Typography>

                    <Chip
                      label="ABIERTA"
                      color="success"
                      size="small"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        fontSize: 11,
                      }}
                    />
                  </Stack>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      fontSize: 13,
                      color: "text.primary",
                      mt: 0.5,
                    }}
                  >
                    Monto inicial: {formatMoney(cashSession.openingAmount)}
                  </Typography>
                </Box>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={1}
                  width={{
                    xs: "100%",
                    sm: "auto",
                  }}
                >
                  <Button
                    variant="outlined"
                    startIcon={<CurrencyExchangeIcon />}
                    onClick={() => setCashMovementOpen(true)}
                    sx={{ fontFamily: "fontFamily.primary" }}
                  >
                    Registrar movimiento
                  </Button>

                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={<CloseIcon />}
                    onClick={() => setCashCloseOpen(true)}
                    sx={{ fontFamily: "fontFamily.primary" }}
                  >
                    Cerrar caja
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        )}

        <CashRegisterHistoryPanel
          user={user}
          refreshKey={historyRefreshKey}
          showAlert={showAlert}
        />
      </Stack>

      <CashMovementModal
        open={cashMovementOpen}
        user={user}
        cashSession={cashSession}
        showAlert={showAlert}
        onClose={() => setCashMovementOpen(false)}
        onMovementCreated={() => {
          setCashMovementOpen(false);
          refreshCashHistory();
        }}
      />

      <CashCloseModal
        open={cashCloseOpen}
        user={user}
        cashSession={cashSession}
        showAlert={showAlert}
        onClose={() => setCashCloseOpen(false)}
        onClosed={() => {
          setCashCloseOpen(false);
          setCashSession(null);
          setCashRefreshKey((prev) => prev + 1);
          refreshCashHistory();
        }}
      />
      {AlertComponent}
    </Box>
  );
};
