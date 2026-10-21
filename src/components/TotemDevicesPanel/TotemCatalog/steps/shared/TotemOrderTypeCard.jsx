import { useState, useEffect } from "react";

// ---- Material UI ----
import { ButtonBase, Box, Typography } from "@mui/material";
// ---------------------

export const OrderTypeCard = ({
  image,
  title,
  icon,
  onClick,
  accessibilityMode = false,
}) => {
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false);
  }, [image]);

  return (
    <ButtonBase
      onClick={onClick}
      aria-label={title}
      sx={{
        width: "100%",
        minWidth: 0,
        display: "flex",
        flexDirection: { xs: "row", sm: "column" },
        textAlign: "center",
        bgcolor: "background.default",
        borderRadius: 2.5,
        overflow: "hidden",
        border: "2px solid",
        borderColor: accessibilityMode ? "primary.main" : "transparent",
        boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
        transition: "transform 200ms, box-shadow 200ms",
        "@media (hover: hover)": {
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 28px rgba(0,0,0,0.2)",
          },
          "&:hover .order-type-image": { transform: "scale(1.035)" },
        },
        "&.Mui-focusVisible": {
          outline: "3px solid",
          outlineColor: "primary.main",
          outlineOffset: 3,
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover, & .order-type-image, &:hover .order-type-image": {
            transform: "none",
            transition: "none",
          },
        },
      }}
    >
      <Box
        sx={{
          width: { xs: 112, sm: "100%" },
          height: { xs: 112, sm: "clamp(150px, 27dvh, 240px)" },
          "@media (max-width: 599px) and (max-height: 700px)": { height: 100 },
          flexShrink: 0,
          overflow: "hidden",
          bgcolor: "background.default",
          "@media (min-width: 600px) and (max-height: 700px)": {
            height: "clamp(96px, 18dvh, 125px)",
          },
        }}
      >
        {image && !imageError ? (
          <Box
            component="img"
            className="order-type-image"
            src={image}
            alt=""
            onError={() => setImageError(true)}
            sx={{
              width: "100%",
              height: "100%",
              display: "block",
              objectFit: "cover",
              transition: "transform 200ms",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              background: (theme) =>
                `linear-gradient(135deg, ${theme.palette.background.main}, ${theme.palette.background.default})`,
              color: "primary.main",
              "& .MuiSvgIcon-root": { fontSize: 44 },
            }}
          >
            {icon}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          width: "100%",
          minWidth: 0,
          minHeight: { xs: 112, sm: 90 },
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: { xs: 0.5, sm: 1 },
          p: { xs: 0.75, sm: 1.5 },
          pt: { xs: 0.75, sm: 4 },
          "@media (max-width: 599px) and (max-height: 700px)": {
            minHeight: 100,
          },
        }}
      >
        <Box
          aria-hidden="true"
          sx={{
            position: { xs: "static", sm: "absolute" },
            top: -24,
            left: "50%",
            transform: { sm: "translateX(-50%)" },
            width: 48,
            height: 48,
            "@media (max-width: 599px) and (max-height: 700px)": {
              width: 40,
              height: 40,
            },
            flexShrink: 0,
            borderRadius: "50%",
            bgcolor: "background.main",
            border: "3px solid",
            borderColor: "primary.main",
            color: "primary.main",
            display: "grid",
            placeItems: "center",
            "& .MuiSvgIcon-root": { fontSize: 26 },
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontFamily: "fontFamily.secondary",
            color: "text.primary",
            lineHeight: 1.2,
            fontSize: {
              xs: accessibilityMode ? "1.45rem" : "1.2rem",
              sm: accessibilityMode ? "1.8rem" : "1.5rem",
            },
          }}
        >
          {title}
        </Typography>
      </Box>
    </ButtonBase>
  );
};
