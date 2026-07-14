import { useState, useEffect } from "react";

// ---- Material UI ----
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  Paper,
  Stack,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
// Icons
import {
  PictureAsPdf as PictureAsPdfIcon,
  Close as CloseIcon,
  Palette as PaletteIcon,
  FormatColorText as TextColorIcon,
  FormatColorFill as BackgroundColorIcon,
  AutoAwesome as AccentColorIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { SettingSwitch } from "./shared/SettingSwitch.jsx";
import { ColorPickerCard } from "./shared/ColorPickerCard.jsx";
// ----------------

const CATALOG_TEMPLATES = {
  PROFESSIONAL: "PROFESSIONAL",
  SIMPLE: "SIMPLE",
  LOCAL_MENU: "LOCAL_MENU",
};

const COLOR_PRESETS = [
  {
    name: "Clásico",
    backgroundColor: "#FFFFFF",
    textColor: "#111827",
    accentColor: "#F5B400",
  },
  {
    name: "Elegante",
    backgroundColor: "#111827",
    textColor: "#FFFFFF",
    accentColor: "#F5B400",
  },
  {
    name: "Minimal",
    backgroundColor: "#F8FAFC",
    textColor: "#1F2937",
    accentColor: "#2563EB",
  },
  {
    name: "Gastronómico",
    backgroundColor: "#FFF7ED",
    textColor: "#2B1A12",
    accentColor: "#EA580C",
  },
];

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

export const CatalogModal = ({ open, onClose, onGenerate, defaultName }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [restaurantName, setRestaurantName] = useState(defaultName || "");
  const [template, setTemplate] = useState(CATALOG_TEMPLATES.PROFESSIONAL);
  const [useBusinessLogoAsFallback, setUseBusinessLogoAsFallback] =
    useState(true);
  const [useBusinessLogoWatermark, setUseBusinessLogoWatermark] =
    useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [textColor, setTextColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#F5B400");
  const [showImages, setShowImages] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [showRewards, setShowRewards] = useState(true);
  const [showDiscounts, setShowDiscounts] = useState(true);

  const hasValidColors =
    isValidHexColor(backgroundColor) &&
    isValidHexColor(textColor) &&
    isValidHexColor(accentColor);

  const handleApplyPreset = (preset) => {
    setBackgroundColor(preset.backgroundColor);
    setTextColor(preset.textColor);
    setAccentColor(preset.accentColor);
  };

  const handleTemplateChange = (value) => {
    setTemplate(value);

    if (value === CATALOG_TEMPLATES.SIMPLE) {
      setShowImages(false);
      setShowDescription(true);
      setShowRewards(false);
      setShowDiscounts(true);
    }

    if (value === CATALOG_TEMPLATES.LOCAL_MENU) {
      setShowImages(false);
      setShowDescription(false);
      setShowRewards(false);
      setShowDiscounts(true);
    }

    if (value === CATALOG_TEMPLATES.PROFESSIONAL) {
      setShowImages(true);
      setShowDescription(true);
      setShowRewards(true);
      setShowDiscounts(true);
    }
  };

  const handleGenerate = () => {
    if (!restaurantName.trim()) return;

    onGenerate({
      restaurantName: restaurantName.trim(),
      template,
      useBusinessLogoAsFallback,
      useBusinessLogoWatermark,
      backgroundColor,
      textColor,
      accentColor,
      showImages,
      showDescription,
      showRewards,
      showDiscounts,
    });

    onClose();
  };

  useEffect(() => {
    if (open) {
      setRestaurantName(defaultName || "");
    }
  }, [open, defaultName]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 3 },
          bgcolor: "background.main",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        component="div"
        sx={{
          minHeight: 65,
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          borderBottom: "1px solid",
          borderColor: "primary.main",
          bgcolor: "background.main",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
            }}
          >
            <PictureAsPdfIcon color="primary" />
            <Typography
              sx={{
                color: "text.primary",
                fontFamily: "fontFamily.primary",
                fontSize: { xs: "14px", sm: "18px", md: "22px" },
                lineHeight: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              GENERAR CATÁLOGO PDF
            </Typography>
          </Box>
          <Typography
            sx={{
              mt: 0.6,
              color: "text.secondary",
              fontFamily: "fontFamily.secondary",
              fontSize: { xs: 11, sm: 12 },
            }}
          >
            Configurá diseño, colores y contenido antes de generar el PDF.
          </Typography>
        </Box>
        <IconButton onClick={onClose} color="primary">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 1.5, sm: 2.2, md: 3 },
          bgcolor: "background.default",
          overflow: "auto",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Box sx={{ mt: 1 }}>
            <Typography
              variant="body1"
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                mb: 1,
              }}
            >
              INGRESA EL NOMBRE DEL LOCAL PARA EL CATÁLOGO
            </Typography>

            <TextField
              autoFocus
              fullWidth
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Ej: Toro Burger & Beer"
              sx={{
                bgcolor: "background.main",
                border: "2px solid",
                borderColor: "primary.main",
                "& .MuiInputBase-input": {
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                },
              }}
            />
          </Box>

          <Divider sx={{ bgcolor: "text.primary" }} />

          <FormControl>
            <FormLabel
              sx={{
                fontFamily: "fontFamily.primary",
                color: "primary.main",
                mb: 1,
              }}
            >
              TIPO DE CATÁLOGO
            </FormLabel>

            <RadioGroup
              value={template}
              onChange={(e) => handleTemplateChange(e.target.value)}
            >
              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "background.main",
                  borderRadius: "12px",
                  p: 1.5,
                  mb: 1,
                }}
              >
                <FormControlLabel
                  value={CATALOG_TEMPLATES.PROFESSIONAL}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                        CATÁLOGO PROFESIONAL
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                        }}
                      >
                        Diseño más visual, con imágenes, categorías y detalles.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "background.main",
                  borderRadius: "12px",
                  p: 1.5,
                  mb: 1,
                }}
              >
                <FormControlLabel
                  value={CATALOG_TEMPLATES.SIMPLE}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                        LISTA SIMPLE
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                        }}
                      >
                        Más liviano, ideal para compartir rápido.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  bgcolor: "background.main",
                  borderRadius: "12px",
                  p: 1.5,
                }}
              >
                <FormControlLabel
                  value={CATALOG_TEMPLATES.LOCAL_MENU}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                        CARTA PARA LOCAL
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "primary.main",
                        }}
                      >
                        Más legible para imprimir y usar en mesas o mostrador.
                      </Typography>
                    </Box>
                  }
                />
              </Paper>
            </RadioGroup>
          </FormControl>

          <Divider sx={{ bgcolor: "text.primary" }} />

          <Paper
            elevation={0}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 3,
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "rgba(184, 182, 186, 0.18)",
            }}
          >
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PaletteIcon sx={{ color: "primary.main" }} />

                <Box>
                  <Typography
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "primary.main",
                      fontSize: { xs: 15, sm: 18 },
                      lineHeight: 1.1,
                    }}
                  >
                    COLORES DEL CATÁLOGO
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                      fontSize: { xs: 12, sm: 13 },
                      mt: 0.4,
                    }}
                  >
                    Personalizá el fondo, el texto y el color de resalte del
                    PDF.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "1fr",
                  },
                  gap: 2,
                }}
              >
                <Stack spacing={1.5}>
                  <ColorPickerCard
                    title="COLOR DE FONDO"
                    description="Base visual del catálogo."
                    value={backgroundColor}
                    onChange={setBackgroundColor}
                    icon={<BackgroundColorIcon fontSize="small" />}
                    previewLabel="FONDO"
                  />

                  <ColorPickerCard
                    title="COLOR DEL TEXTO"
                    description="Color principal para títulos y descripciones de los productos."
                    value={textColor}
                    onChange={setTextColor}
                    icon={<TextColorIcon fontSize="small" />}
                    previewLabel="TEXTO"
                  />

                  <ColorPickerCard
                    title="COLOR DE RESALTE"
                    description="Usalo para los fondos de categorias, puntos de local y descuentos."
                    value={accentColor}
                    onChange={setAccentColor}
                    icon={<AccentColorIcon fontSize="small" />}
                    previewLabel="RESALTE"
                  />
                </Stack>

                <Stack spacing={1.5}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      bgcolor: "background.paper",
                      borderColor: "rgba(184, 182, 186, 0.22)",
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        fontSize: 13,
                        mb: 1,
                      }}
                    >
                      PALETAS RÁPIDAS
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr 1fr",
                          sm: "repeat(4, 1fr)",
                          md: "1fr 1fr",
                        },
                        gap: 1,
                      }}
                    >
                      {COLOR_PRESETS.map((preset) => (
                        <Button
                          key={preset.name}
                          onClick={() => handleApplyPreset(preset)}
                          variant="outlined"
                          sx={{
                            justifyContent: "flex-start",
                            minHeight: 48,
                            borderRadius: 2,
                            borderColor: "rgba(184, 182, 186, 0.26)",
                            color: "text.primary",
                            fontFamily: "fontFamily.secondary",
                            textTransform: "none",
                            px: 1,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.8,
                              minWidth: 0,
                            }}
                          >
                            <Box sx={{ display: "flex" }}>
                              {[
                                preset.backgroundColor,
                                preset.textColor,
                                preset.accentColor,
                              ].map((color) => (
                                <Box
                                  key={color}
                                  sx={{
                                    width: 14,
                                    height: 28,
                                    bgcolor: color,
                                    border: "1px solid",
                                    borderColor: "rgba(184, 182, 186, 0.34)",
                                    "&:first-of-type": {
                                      borderRadius: "8px 0 0 8px",
                                    },
                                    "&:last-of-type": {
                                      borderRadius: "0 8px 8px 0",
                                    },
                                  }}
                                />
                              ))}
                            </Box>

                            <Typography
                              noWrap
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: 12,
                                color: "text.primary",
                              }}
                            >
                              {preset.name}
                            </Typography>
                          </Box>
                        </Button>
                      ))}
                    </Box>
                  </Paper>
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Divider sx={{ bgcolor: "text.primary" }} />

          <Box
            sx={{
              bgcolor: "background.main",
              border: "1px solid",
              borderColor: "primary.main",
              p: { xs: 1, sm: 2, md: 3 },
            }}
          >
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: "13px", md: "20px" },
                mb: 1,
                borderBottom: "1px solid",
                borderColor: "primary.main",
              }}
            >
              AJUSTES DEL CONTENIDO
            </Typography>

            <SettingSwitch
              label="USAR LOGO DEL LOCAL SI EL PRODUCTO NO TIENE IMAGEN"
              checked={useBusinessLogoAsFallback}
              onChange={setUseBusinessLogoAsFallback}
            />

            <SettingSwitch
              label="USAR LOGO DE LOCAL COMO MARCA DE AGUA"
              checked={useBusinessLogoWatermark}
              onChange={setUseBusinessLogoWatermark}
            />

            <SettingSwitch
              label="MOSTRAR IMÁGENES DE PRODUCTOS"
              checked={showImages}
              onChange={setShowImages}
            />

            <SettingSwitch
              label="MOSTRAR DESCRIPCIÓN DE LOS PRODUCTOS"
              checked={showDescription}
              onChange={setShowDescription}
            />

            <SettingSwitch
              label="MOSTRAR PUNTOS / RECOMPENSAS DE LOCAL"
              checked={showRewards}
              onChange={setShowRewards}
            />

            <SettingSwitch
              label="MOSTRAR DESCUENTOS"
              checked={showDiscounts}
              onChange={setShowDiscounts}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          bgcolor: "background.paper",
          p: { xs: 1.5, sm: 2 },
          borderTop: "1px solid",
          borderColor: "rgba(184, 182, 186, 0.18)",
          flexDirection: { xs: "column-reverse", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
          }}
        >
          CANCELAR
        </Button>
        <Button
          variant="contained"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleGenerate}
          disabled={!restaurantName.trim() || !hasValidColors}
          sx={{
            bgcolor: "error.main",
            color: "white",
            fontFamily: "fontFamily.primary",
            minHeight: 42,
            "&:hover": {
              bgcolor: "error.dark",
            },
          }}
        >
          GENERAR PDF
        </Button>
      </DialogActions>
    </Dialog>
  );
};
