import { useEffect, useRef, useState } from "react";

// ---- Material UI ----
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// Icons
import {
  ArrowBack,
  ArrowForwardRounded,
  ConfirmationNumberOutlined,
  LockOutlined,
  PersonSearch,
} from "@mui/icons-material";
// ---------------------

export const TotemIdentifyCustomer = ({
  restaurant,
  requiresIdentification = false,
  onIdentified,
  onGuest,
  onBack,
}) => {
  const [logoFailed, setLogoFailed] = useState(false);
  const [showLookup, setShowLookup] = useState(false);
  const [cuit, setCuit] = useState("");

  const [searching, setSearching] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const requestRef = useRef(0);

  useEffect(
    () => () => {
      requestRef.current++;
    },
    [],
  );

  const find = async (event) => {
    event.preventDefault();

    if (searching || !/^[0-9]{1,11}$/.test(cuit)) return;

    const request = ++requestRef.current;
    setSearching(true);
    setLookupError("");

    try {
      const result = await window.totemAPI.findCustomer(cuit);

      if (request !== requestRef.current) return;

      if (!result?.ok) {
        throw new Error(
          result?.message || "No se pudo buscar la cuenta. Intentá nuevamente.",
        );
      }

      if (!result.found || !result.customer) {
        setLookupError(
          requiresIdentification
            ? "No encontramos una cuenta con ese documento, revisá el número o volvé al carrito para modificar los canjes."
            : "No encontramos una cuenta con ese documento, revisá el número o volvé para continuar sin identificarte.",
        );
        return;
      }

      onIdentified({ ...result.customer, cuit });
    } catch (error) {
      if (request === requestRef.current) {
        setLookupError(
          error.message || "No se pudo buscar la cuenta. Intentá nuevamente.",
        );
      }
    } finally {
      if (request === requestRef.current) setSearching(false);
    }
  };

  const backToChoice = () => {
    requestRef.current++;
    setSearching(false);
    setLookupError("");
    setShowLookup(false);
  };

  const choices = [
    {
      title: "¡Identificate y sumá puntos!",
      icon: <ConfirmationNumberOutlined />,
      onClick: () => setShowLookup(true),
      disabled: false,
    },
    {
      title: "Continuar sin identificarme",
      icon: <ArrowForwardRounded />,
      onClick: onGuest,
      disabled: requiresIdentification,
    },
  ];

  return (
    <Box
      component="section"
      aria-labelledby="totem-identify-title"
      sx={{
        flex: "1 0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      <Stack spacing={2} sx={{ width: "100%", maxWidth: 860 }}>
        <Paper
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            borderRadius: 3,
            p: { xs: 2.5, sm: 4 },
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
          }}
        >
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 60,
              bgcolor: "background.default",
              clipPath: "polygon(0 100%, 100% 15%, 100% 100%)",
            }}
          />

          <Stack spacing={2.5} sx={{ position: "relative" }}>
            {restaurant?.businessLogoUrl && !logoFailed && (
              <Box
                component="img"
                src={restaurant.businessLogoUrl}
                alt={restaurant.businessName || "Logo del local"}
                onError={() => setLogoFailed(true)}
                sx={{
                  width: { xs: 100, sm: 140 },
                  height: { xs: 65, sm: 85 },
                  objectFit: "contain",
                  alignSelf: "center",
                }}
              />
            )}

            <Typography
              id="totem-identify-title"
              component="h1"
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.primary",
                fontSize: { xs: "1.35rem", sm: "1.8rem" },
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {showLookup
                ? "Buscá tu cuenta"
                : "Identificate y sumá puntos para canjear por beneficios exclusivos en la app"}
            </Typography>

            {requiresIdentification && (
              <Alert
                severity="warning"
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  borderRadius: 8,
                }}
              >
                <Typography sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                  Tu pedido incluye canjes de puntos, necesitás identificarte
                  para continuar.
                </Typography>
              </Alert>
            )}

            {showLookup ? (
              <Box component="form" onSubmit={find}>
                <Stack spacing={2}>
                  <Stack
                    direction="column"
                    spacing={1.5}
                    useFlexGap
                    alignItems="center"
                  >
                    <TextField
                      autoFocus
                      fullWidth
                      label="DNI / CUIT / CUIL"
                      value={cuit}
                      helperText="Solo números, sin puntos ni guiones."
                      disabled={searching}
                      inputProps={{ inputMode: "numeric", maxLength: 11 }}
                      onChange={(event) => {
                        setCuit(
                          event.target.value.replace(/\D/g, "").slice(0, 11),
                        );
                        setLookupError("");
                      }}
                      sx={{ flex: 1, minWidth: 0 }}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      aria-busy={searching}
                      startIcon={
                        searching ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          <PersonSearch />
                        )
                      }
                      disabled={searching || !/^[0-9]{1,11}$/.test(cuit)}
                      sx={{
                        height: 56,
                        minWidth: { sm: 200 },
                        width: { xs: "100%", sm: "auto" },
                        flexShrink: 0,
                        px: 2.5,
                      }}
                    >
                      {searching ? "Buscando..." : "Buscar"}
                    </Button>
                  </Stack>

                  {lookupError && <Alert severity="error">{lookupError}</Alert>}
                </Stack>
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                  },
                }}
              >
                {choices.map(({ title, icon, onClick, disabled }, index) => (
                  <Box
                    key={title}
                    sx={{
                      p: { xs: 1, sm: 2 },
                      borderLeft: { sm: index ? "1px solid" : "none" },
                      borderTop: {
                        xs: index ? "1px solid" : "none",
                        sm: "none",
                      },
                      borderColor: "divider",
                    }}
                  >
                    <ButtonBase
                      onClick={onClick}
                      disabled={disabled}
                      sx={{
                        width: "100%",
                        minHeight: { xs: 100, sm: 200 },
                        p: 1.5,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: { xs: "row", sm: "column" },
                        gap: 2,
                        "&.Mui-disabled": { opacity: 0.5 },
                        "&.Mui-focusVisible": {
                          outline: "3px solid",
                          outlineColor: "primary.main",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          width: { xs: 64, sm: 100 },
                          height: { xs: 64, sm: 100 },
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          color: "primary.contrastText",
                          "& .MuiSvgIcon-root": {
                            fontSize: { xs: 32, sm: 48 },
                          },
                        }}
                      >
                        {icon}
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          fontSize: { xs: "1.1rem", sm: "1.3rem" },
                          maxWidth: 240,
                          textAlign: "center",
                        }}
                      >
                        {title}
                      </Typography>
                    </ButtonBase>
                  </Box>
                ))}
              </Box>
            )}
          </Stack>
        </Paper>

        <Button
          startIcon={<ArrowBack />}
          variant="outlined"
          onClick={showLookup ? backToChoice : onBack}
          sx={{ minHeight: 48, alignSelf: "center", px: 3 }}
        >
          {showLookup ? "Volver a las opciones" : "Volver al carrito"}
        </Button>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
        >
          <LockOutlined sx={{ color: "primary.main", fontSize: 20 }} />

          <Typography
            variant="body2"
            sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
          >
            Exclusivo pago electrónico
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};
