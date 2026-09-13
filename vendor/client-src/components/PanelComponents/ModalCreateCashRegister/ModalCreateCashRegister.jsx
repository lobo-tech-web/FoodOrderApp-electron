// ---- Material UI ----
import {
  Typography,
  Box,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";
// Icons
import {
  PointOfSale as PointOfSaleIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Styles ----
import {
  textFieldStyle,
  labelStyle,
  labelContainerStyle,
} from "./styles/styles.js";
// ----------------

export const ModalCreateCashRegister = ({
  open,
  handleClose,
  editingRegister,
  form,
  setForm,
  handleChange,
  handleSave,
  saving,
}) => {
  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: "background.main" }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <PointOfSaleIcon color="primary" />

          <Typography variant="h6" sx={{ fontFamily: "fontFamily.primary" }}>
            {editingRegister ? "EDITAR CAJA" : "AGREGAR CAJA"}
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", pt: 2 }}>
        <Stack spacing={2} sx={{ mt: 2 }}>
          {editingRegister && (
            <Alert
              severity="info"
              variant="outlined"
              sx={{ fontFamily: "fontFamily.secondary" }}
            >
              Código de caja: {editingRegister.code}
            </Alert>
          )}

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>NOMBRE DE LA CAJA</Typography>
            </Box>
            <TextField
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              autoFocus
              inputProps={{ maxLength: 100 }}
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>DESCRIPCIÓN</Typography>
            </Box>
            <TextField
              name="description"
              value={form.description}
              onChange={handleChange}
              fullWidth
              multiline
              minRows={2}
              inputProps={{ maxLength: 255 }}
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            <Box sx={labelContainerStyle}>
              <Typography sx={labelStyle}>ORDEN DE VISUALIZACIÓN</Typography>
            </Box>

            <TextField
              name="sortOrder"
              type="number"
              value={form.sortOrder}
              onChange={handleChange}
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              sx={textFieldStyle}
            />
          </Box>

          <Box>
            {!editingRegister && (
              <FormControlLabel
                label="Usar como caja predeterminada"
                control={
                  <Switch
                    checked={form.isDefault}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        isDefault: event.target.checked,
                      }))
                    }
                  />
                }
                sx={{
                  m: 0,
                  "& .MuiFormControlLabel-label": {
                    fontFamily: "fontFamily.secondary",
                    color: "text.primary",
                    fontSize: 13,
                  },
                }}
              />
            )}

            {editingRegister && (
              <>
                <FormControlLabel
                  label="Caja activa"
                  control={
                    <Switch
                      checked={form.isActive}
                      disabled={editingRegister.isDefault}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          isActive: event.target.checked,
                        }))
                      }
                    />
                  }
                  sx={{
                    m: 0,
                    "& .MuiFormControlLabel-label": {
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                      fontSize: 13,
                    },
                  }}
                />

                <FormControlLabel
                  label="Caja predeterminada"
                  control={
                    <Switch
                      checked={form.isDefault}
                      disabled={editingRegister.isDefault || !form.isActive}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          isDefault: event.target.checked,
                        }))
                      }
                    />
                  }
                  sx={{
                    m: 0,
                    "& .MuiFormControlLabel-label": {
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                      fontSize: 13,
                    },
                  }}
                />
              </>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ bgcolor: "background.paper", p: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleClose}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          Cancelar
        </Button>

        <Button
          variant="contained"
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SaveIcon />
            )
          }
          onClick={handleSave}
          disabled={saving}
          sx={{ fontFamily: "fontFamily.primary" }}
        >
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
