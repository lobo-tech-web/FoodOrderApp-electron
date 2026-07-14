import {
  Paper,
  Stack,
  Box,
  Typography,
  TextField,
  Button,
} from "@mui/material";
// Icons
import { Palette as PaletteIcon } from "@mui/icons-material";

const isValidHexColor = (value) => /^#[0-9A-Fa-f]{6}$/.test(value);

const getReadableTextColor = (hexColor) => {
  if (!isValidHexColor(hexColor)) return "#FFFFFF";

  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 155 ? "#111827" : "#FFFFFF";
};

export const ColorPickerCard = ({
  title,
  description,
  value,
  onChange,
  icon,
  previewLabel,
}) => {
  const isInvalid = !isValidHexColor(value);

  const handleTextChange = (event) => {
    const nextValue = event.target.value.toUpperCase();

    if (!nextValue.startsWith("#")) {
      onChange(`#${nextValue}`);
      return;
    }

    onChange(nextValue);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.3, sm: 1.6 },
        borderRadius: 2.5,
        bgcolor: "background.paper",
        borderColor: isInvalid ? "error.main" : "rgba(184, 182, 186, 0.22)",
      }}
    >
      <Stack spacing={1.2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: value,
              color: getReadableTextColor(value),
              border: "1px solid",
              borderColor: "rgba(184, 182, 186, 0.26)",
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                fontSize: { xs: 13, sm: 15 },
                lineHeight: 1.1,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "primary.main",
                fontSize: { xs: 11, sm: 12 },
                lineHeight: 1.25,
                mt: 0.3,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1,
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <Box>
              <Box sx={{ position: "relative", width: "100%" }}>
                <Button
                  variant="outlined"
                  startIcon={<PaletteIcon />}
                  sx={{
                    minHeight: 42,
                    justifyContent: "center",
                    borderRadius: 2,
                    borderColor: isInvalid ? "error.main" : "primary.main",
                    color: "text.primary",
                    fontFamily: "fontFamily.primary",
                    textTransform: "none",
                    px: 1.2,
                    pointerEvents: "none",
                  }}
                >
                  ELEGIR COLOR
                </Button>
                <input
                  type="color"
                  value={isValidHexColor(value) ? value : "#000000"}
                  onChange={(event) =>
                    onChange(event.target.value.toUpperCase())
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "30%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    border: 0,
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  minHeight: 20,
                  mt: 0.4,
                  ml: 1,
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                }}
              >
                Selección manual
              </Typography>
            </Box>

            <TextField
              size="small"
              label="Código HEX"
              value={value}
              onChange={handleTextChange}
              error={isInvalid}
              helperText={isInvalid ? "Usá formato HEX. Ej: #F5B400" : " "}
              placeholder="#F5B400"
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": {
                  height: 42,
                  borderRadius: 2,
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "fontFamily.secondary",
                  color: "text.secondary",
                },
                "& .MuiInputBase-input": {
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  fontSize: 13,
                  textTransform: "uppercase",
                },
                "& .MuiFormHelperText-root": {
                  minHeight: 20,
                  mt: 0.4,
                  fontFamily: "fontFamily.secondary",
                  fontSize: 11,
                },
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            borderRadius: 2,
            p: 1,
            bgcolor: value,
            color: getReadableTextColor(value),
            textAlign: "center",
            border: "1px solid",
            borderColor: "rgba(184, 182, 186, 0.24)",
          }}
        >
          <Typography
            sx={{
              fontFamily: "fontFamily.primary",
              fontSize: 12,
            }}
          >
            {previewLabel}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
};
