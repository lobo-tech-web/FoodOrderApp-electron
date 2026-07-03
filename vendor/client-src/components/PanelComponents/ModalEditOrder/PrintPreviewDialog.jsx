import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export const PrintPreviewDialog = ({ open, title, html, onClose, onPrint }) => (
  <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
    <DialogTitle
      sx={{
        fontFamily: "fontFamily.primary",
        fontWeight: 900,
        color: "text.primary",
      }}
    >
      {title}
    </DialogTitle>
    <DialogContent dividers sx={{ bgcolor: "background.default", p: 2 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1,
          color: "text.secondary",
          fontFamily: "fontFamily.secondary",
        }}
      >
        Vista aproximada del ticket en formato 80mm.
      </Typography>
      <Box
        sx={{
          width: "100%",
          height: "70vh",
          bgcolor: "#f4f4f4",
          border: "1px solid",
          borderColor: "divider",
          overflow: "auto",
        }}
      >
        <iframe
          title={title}
          srcDoc={html}
          style={{
            width: "100%",
            height: "100%",
            border: 0,
            background: "#f4f4f4",
          }}
        />
      </Box>
    </DialogContent>
    <DialogActions sx={{ p: 2 }}>
      <Button onClick={onClose} sx={{ fontFamily: "fontFamily.primary" }}>
        Cerrar
      </Button>
      <Button
        variant="contained"
        onClick={onPrint}
        sx={{ fontFamily: "fontFamily.primary" }}
      >
        Imprimir
      </Button>
    </DialogActions>
  </Dialog>
);
