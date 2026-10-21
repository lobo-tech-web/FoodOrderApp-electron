import { useState, useId } from "react";

// ---- Material UI ----
import {
  Box,
  Button,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
// Icons
import {
  LanguageRounded as LanguageIcon,
  AccessibilityNewRounded as AccessibilityIcon,
  LockOutlined as LockIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { OrderTypeCard } from "./shared/TotemOrderTypeCard.jsx";
// ----------------

// ---- Utils ----
import {
  TOTEM_ORDER_TYPES,
  TRANSLATIONS,
} from "../totemCatalogUtils/totemOrderTypes.jsx";
// ---------------

export const TotemOrderTypeStep = ({ onSelect }) => {
  const [language, setLanguage] = useState("es");
  const [languageAnchor, setLanguageAnchor] = useState(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  const menuId = useId();
  const text = TRANSLATIONS[language];

  return (
    <Box
      component="section"
      lang={language}
      aria-labelledby="totem-order-type-title"
      aria-describedby="totem-order-type-subtitle"
      sx={{
        width: "100%",
        flex: "1 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxSizing: "border-box",
        p: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: "background.paper",
          position: "relative",
          isolation: "isolate",
          width: "100%",
          maxWidth: 980,
          borderRadius: { xs: 3, md: 3.5 },
          overflow: "hidden",
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: { xs: 60, sm: 85 },
            bgcolor: "background.default",
            clipPath: "polygon(0 100%, 100% 15%, 100% 100%)",
            pointerEvents: "none",
          }}
        />

        <Stack
          spacing={2}
          useFlexGap
          sx={{
            position: "relative",
            p: { xs: 2, sm: 3 },
            "@media (max-height: 700px)": { p: 1, gap: 1 },
          }}
        >
          <Stack spacing={0.75} alignItems="center" textAlign="center">
            <Typography
              id="totem-order-type-title"
              component="h1"
              sx={{
                fontFamily: "fontFamily.terciary",
                fontWeight: 800,
                fontSize: {
                  xs: accessibilityMode ? "2.2rem" : "1.9rem",
                  sm: accessibilityMode ? "3rem" : "2.6rem",
                },
                lineHeight: 1.15,
              }}
            >
              {text.greeting}
            </Typography>

            <Typography
              id="totem-order-type-subtitle"
              sx={{
                fontFamily: "fontFamily.secondary",
                fontSize: {
                  xs: accessibilityMode ? "1.2rem" : "1.05rem",
                  sm: accessibilityMode ? "1.6rem" : "1.35rem",
                },
                lineHeight: 1.3,
              }}
            >
              {text.subtitle}
            </Typography>
          </Stack>

          <Box
            sx={{
              width: "100%",
              maxWidth: 740,
              mx: "auto",
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: { xs: 1.5, sm: 2.5 },
            }}
          >
            {TOTEM_ORDER_TYPES.map((option) => (
              <OrderTypeCard
                key={option.value}
                title={text[option.titleKey]}
                image={option.image}
                icon={option.icon}
                accessibilityMode={accessibilityMode}
                onClick={() => onSelect(option.value)}
              />
            ))}
          </Box>

          <Stack
            component="footer"
            direction="row"
            spacing={1.5}
            useFlexGap
            justifyContent="center"
            sx={{ flexWrap: "wrap" }}
          >
            <Button
              onClick={(event) => setLanguageAnchor(event.currentTarget)}
              aria-label={text.selectLanguage}
              aria-haspopup="menu"
              aria-controls={languageAnchor ? menuId : undefined}
              aria-expanded={Boolean(languageAnchor)}
              startIcon={<LanguageIcon />}
              sx={{
                bgcolor: "background.main",
                fontFamily: "fontFamily.primary",
                minHeight: 48,
                minWidth: 220,
                px: 2,
              }}
            >
              {text.language}
            </Button>

            <Button
              onClick={() => setAccessibilityMode((current) => !current)}
              aria-pressed={accessibilityMode}
              variant={accessibilityMode ? "contained" : "text"}
              startIcon={<AccessibilityIcon />}
              sx={{
                bgcolor: accessibilityMode ? "primary.main" : "background.main",
                fontFamily: "fontFamily.primary",
                minHeight: 48,
                minWidth: 220,
                px: 2,
              }}
            >
              {text.accessibility}
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <LockIcon sx={{ color: "primary.main", fontSize: 18 }} />

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: accessibilityMode ? "1rem" : "0.85rem",
                textAlign: "center",
              }}
            >
              {text.payment}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      <Menu
        id={menuId}
        anchorEl={languageAnchor}
        open={Boolean(languageAnchor)}
        onClose={() => setLanguageAnchor(null)}
        MenuListProps={{ "aria-label": text.selectLanguage, lang: language }}
        slotProps={{ paper: { sx: { minWidth: 190, borderRadius: 2 } } }}
      >
        {[
          ["es", "Español"],
          ["en", "English"],
        ].map(([value, label]) => (
          <MenuItem
            key={value}
            lang={value}
            selected={language === value}
            onClick={() => {
              setLanguage(value);
              setLanguageAnchor(null);
            }}
          >
            {label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};
