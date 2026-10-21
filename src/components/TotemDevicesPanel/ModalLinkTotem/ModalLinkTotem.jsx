import { useEffect, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from "@mui/material";
// Icons
import {
  Computer as ComputerIcon,
  Share as ShareIcon,
  VpnKey as VpnKeyIcon,
  ContentCopy,
  Check,
} from "@mui/icons-material";
// ---------------------

// ---- Utils ----
import { writeClipboardText } from "@/utils/clipboard.js";
import { formatDate } from "./formatPairingDate.js";
// ---------------

export const ModalLinkTotem = ({ open, onClose, pairing }) => {
  const [copyFeedback, setCopyFeedback] = useState(null);
  const [copying, setCopying] = useState(false);

  const copy = async (field, value) => {
    setCopying(true);
    setCopyFeedback(null);
    try {
      await writeClipboardText(value);
      setCopyFeedback({
        field,
        severity: "success",
        message:
          field === "deviceId"
            ? "ID del dispositivo copiado"
            : "Código de vinculación copiado",
      });
    } catch {
      setCopyFeedback({
        field,
        severity: "error",
        message:
          "No se pudo copiar. Podés seleccionar el texto y copiarlo manualmente.",
      });
    } finally {
      setCopying(false);
    }
  };

  const copyButton = (field, value, label) => (
    <InputAdornment position="end">
      <Tooltip title={label}>
        <Box>
          <IconButton
            aria-label={label}
            onClick={() => copy(field, value)}
            disabled={!value || copying}
            edge="end"
            color="primary"
          >
            {copyFeedback?.field === field &&
            copyFeedback.severity === "success" ? (
              <Check />
            ) : (
              <ContentCopy />
            )}
          </IconButton>
        </Box>
      </Tooltip>
    </InputAdornment>
  );

  useEffect(() => {
    setCopyFeedback(null);
  }, [open, pairing]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ShareIcon color="primary" />

          <Typography
            sx={{ fontFamily: "fontFamily.primary", fontSize: "1.5rem" }}
          >
            VINCULAR ESTE TOTEM
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default" }}>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography
            sx={{
              fontFamily: "fontFamily.secondary",
              color: "primary.main",
            }}
          >
            Iniciá la aplicación en modo tótem e ingresá estos datos.
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Stack direction="row" spacing={1}>
              <ComputerIcon color="primary" />

              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  whiteSpace: "nowrap",
                }}
              >
                ID DEL DISPOSITIVO
              </Typography>
            </Stack>

            <TextField
              value={pairing?.device?.id || ""}
              inputProps={{ "aria-label": "ID del dispositivo" }}
              InputProps={{
                readOnly: true,
                endAdornment: copyButton(
                  "deviceId",
                  pairing?.device?.id,
                  "Copiar ID del dispositivo",
                ),
              }}
              onFocus={(event) => event.target.select()}
              fullWidth
            />
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
            <Stack direction="row" spacing={1}>
              <VpnKeyIcon color="primary" />

              <Typography
                sx={{
                  fontFamily: "fontFamily.primary",
                  whiteSpace: "nowrap",
                }}
              >
                CÓDIGO DE VINCULACIÓN
              </Typography>
            </Stack>

            <TextField
              value={pairing?.pairingCode || ""}
              inputProps={{ "aria-label": "Código de vinculación" }}
              InputProps={{
                readOnly: true,
                endAdornment: copyButton(
                  "pairingCode",
                  pairing?.pairingCode,
                  "Copiar código de vinculación",
                ),
              }}
              onFocus={(event) => event.target.select()}
              fullWidth
              multiline
            />

            <Alert severity="info">
              El código de vinculación es de un solo uso. Vence{" "}
              {pairing?.pairingCodeExpiresAt
                ? formatDate(pairing.pairingCodeExpiresAt)
                : ""}
              .
            </Alert>
          </Box>

          {copyFeedback && (
            <Alert severity={copyFeedback.severity}>
              {copyFeedback.message}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.main" }}>
        <Button fullWidth variant="contained" onClick={onClose}>
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};
