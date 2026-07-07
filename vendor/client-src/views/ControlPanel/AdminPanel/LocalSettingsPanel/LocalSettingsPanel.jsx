import { useEffect, useMemo, useState, useRef } from "react";

// ---- Material UI ----
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  Tabs,
  Tab,
  Alert,
} from "@mui/material";
// Icons
import {
  Storefront as StorefrontIcon,
  Feed as FeedIcon,
  Image as ImageIcon,
  ContentCopy as ContentCopyIcon,
  QrCode2 as QrCode2Icon,
  Download as DownloadIcon,
  OpenInNew as OpenInNewIcon,
  Payments as PaymentsIcon,
  DeliveryDining as DeliveryDiningIcon,
  Schedule as ScheduleIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Context ----
import { useUser } from "@/context/Users.jsx";
// -----------------

// ---- Hooks ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Components ----
import { CustomQRCode } from "@/components/CustomQRCode/CustomQRCode.jsx";
// --------------------

// ---- Utils ----
import { buildLocalSettingsPayload } from "@/utils/userUtils";
import { orderTypeOptions } from "@/utils/components/OrderTypeUtils.jsx";
import { paymentMethods } from "@/utils/components/PaymentUtils.jsx";
import { toPng } from "html-to-image";
// ---------------

// ---- Styles ----
const textFieldSx = {
  mb: 2,
  "& .MuiInputBase-root": {
    fontFamily: "fontFamily.secondary",
    color: "text.primary",
    borderRadius: 2,
  },
  "& .MuiInputLabel-root": {
    fontFamily: "fontFamily.secondary",
  },
};
// ----------------

const DEFAULT_PAYMENT_METHODS = paymentMethods.map((method) => method.value);

const DEFAULT_ORDER_TYPES = orderTypeOptions.map((type) => type.value);

const DAYS_OF_WEEK = [
  "LUNES",
  "MARTES",
  "MIÉRCOLES",
  "JUEVES",
  "VIERNES",
  "SÁBADO",
  "DOMINGO",
];

const emptyWorkingHours = DAYS_OF_WEEK.reduce((acc, day) => {
  acc[day] = [];
  return acc;
}, {});

const normalizeWorkingHoursForUI = (workingHours) => {
  return DAYS_OF_WEEK.reduce((acc, day) => {
    const value = workingHours?.[day];

    if (Array.isArray(value)) {
      acc[day] = value;
      return acc;
    }

    if (typeof value === "string" && value.trim()) {
      acc[day] = value
        .split(",")
        .map((time) => time.trim())
        .filter(Boolean);

      return acc;
    }

    acc[day] = [];
    return acc;
  }, {});
};

const createEmptyScheduleRange = () => ({
  open: "",
  close: "",
});

const splitRange = (range) => {
  if (!range || typeof range !== "string") return createEmptyScheduleRange();

  const [open = "", close = ""] = range.split("-");

  return {
    open: open.trim(),
    close: close.trim(),
  };
};

const joinRange = ({ open, close }) => {
  return `${open || ""}-${close || ""}`;
};

const normalizeTimeTyping = (value = "") => {
  const cleanValue = String(value)
    .replace(/[^\d:]/g, "")
    .slice(0, 5);

  if (!cleanValue.includes(":") && cleanValue.length > 2) {
    return `${cleanValue.slice(0, 2)}:${cleanValue.slice(2, 4)}`;
  }

  return cleanValue;
};

const formatTimeOnBlur = (value = "") => {
  const cleanValue = normalizeTimeTyping(value);

  if (!cleanValue) return "";

  const [rawHour = "", rawMinutes = ""] = cleanValue.split(":");

  if (!rawHour) return "";

  const hour = Number(rawHour);
  const minutes = rawMinutes === "" ? 0 : Number(rawMinutes);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minutes) ||
    hour < 0 ||
    hour > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return "";
  }

  return `${String(hour).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
};

const isCompleteTimeRange = (range = "") => {
  return /^\d{2}:\d{2}-\d{2}:\d{2}$/.test(range);
};

const getTimePeriodLabel = (time) => {
  const formattedTime = formatTimeOnBlur(time);

  if (!formattedTime) return "Formato 24 hs";

  const [hourValue] = formattedTime.split(":");
  const hour = Number(hourValue);

  return `${formattedTime} hs · ${hour >= 12 ? "PM" : "AM"}`;
};

export const LocalSettingsPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { userModifier } = useUser();
  const { AlertComponent, showAlert } = useAlert();

  const [loading, setLoading] = useState(false);

  const [localData, setLocalData] = useState({
    id: "",
    businessName: "",
    businessLogoUrl: "",
    businessUrl: "",
    mercadoPagoLink: "",
    transferPaymentAlias: "",
    whatsappNumber: "",
    paymentMethods: DEFAULT_PAYMENT_METHODS,
    enabledOrderTypes: DEFAULT_ORDER_TYPES,
    tablesConfig: [],
    workingHours: emptyWorkingHours,
  });

  const [currentTab, setCurrentTab] = useState(0);
  const qrRef = useRef(null);

  const menuUrl = useMemo(() => {
    return localData.businessUrl?.trim() || "";
  }, [localData.businessUrl]);

  const [businessLogoFile, setBusinessLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  const handleLogoFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showAlert("Debes seleccionar una imagen válida", "warning");
      return;
    }

    setBusinessLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const previewLogo = useMemo(() => {
    return logoPreviewUrl || localData.businessLogoUrl?.trim();
  }, [logoPreviewUrl, localData.businessLogoUrl]);

  const handleChange = ({ target: { name, value } }) => {
    setLocalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleArrayValue = (field, value) => {
    setLocalData((prev) => {
      const currentValues = Array.isArray(prev[field]) ? prev[field] : [];

      const newValues = currentValues.includes(value)
        ? currentValues.filter((item) => item !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [field]: newValues,
      };
    });
  };

  const handleCopyBusinessUrl = async () => {
    try {
      await navigator.clipboard.writeText(localData.businessUrl || "");
      showAlert("URL copiada correctamente", "success");
    } catch {
      showAlert("No se pudo copiar la URL", "error");
    }
  };

  const handleDownloadQR = async () => {
    if (!qrRef.current) {
      showAlert("No se encontró el código QR para descargar", "error");
      return;
    }

    try {
      const dataUrl = await toPng(qrRef.current, {
        cacheBust: true,
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
      });

      const link = document.createElement("a");
      link.download = `qr-${localData.businessName || "menu"}.png`
        .toLowerCase()
        .replace(/\s+/g, "-");

      link.href = dataUrl;
      link.click();

      showAlert("QR descargado correctamente", "success");
    } catch (error) {
      console.error("Error descargando QR:", error);
      showAlert("No se pudo descargar el QR", "error");
    }
  };

  const handleOpenMenu = () => {
    if (!menuUrl) return;

    if (window?.electronAPI?.openExternal) {
      window.electronAPI.openExternal(menuUrl);
      return;
    }

    window.open(menuUrl, "_blank", "noopener,noreferrer");
  };

  const handleToggleDay = (day, checked) => {
    setLocalData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: checked ? ["19:00-23:00"] : [],
      },
    }));
  };

  const handleAddScheduleRange = (day) => {
    setLocalData((prev) => {
      const currentDayHours = prev.workingHours?.[day] || [];

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: [...currentDayHours, ""],
        },
      };
    });
  };

  const handleRemoveScheduleRange = (day, index) => {
    setLocalData((prev) => {
      const currentDayHours = prev.workingHours?.[day] || [];

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: currentDayHours.filter((_, idx) => idx !== index),
        },
      };
    });
  };

  const handleScheduleRangeChange = (day, index, field, value) => {
    const typedValue = normalizeTimeTyping(value);

    setLocalData((prev) => {
      const currentDayHours = [...(prev.workingHours?.[day] || [])];
      const currentRange = splitRange(currentDayHours[index]);

      const updatedRange = {
        ...currentRange,
        [field]: typedValue,
      };

      currentDayHours[index] = joinRange(updatedRange);

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: currentDayHours,
        },
      };
    });
  };

  const handleScheduleRangeBlur = (day, index, field, value) => {
    const formattedValue = formatTimeOnBlur(value);

    if (value && !formattedValue) {
      showAlert(
        "Horario inválido. Usá formato 24 hs, por ejemplo 13:00",
        "warning",
      );
      return;
    }

    setLocalData((prev) => {
      const currentDayHours = [...(prev.workingHours?.[day] || [])];
      const currentRange = splitRange(currentDayHours[index]);

      const updatedRange = {
        ...currentRange,
        [field]: formattedValue,
      };

      currentDayHours[index] = joinRange(updatedRange);

      return {
        ...prev,
        workingHours: {
          ...prev.workingHours,
          [day]: currentDayHours,
        },
      };
    });
  };

  const handleScheduleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const validateBeforeSave = () => {
    if (!localData.id) {
      showAlert("No se encontró el ID del usuario/local", "error");
      return false;
    }

    if (!localData.businessName?.trim()) {
      showAlert("El nombre del local es requerido", "warning");
      return false;
    }

    if (!localData.paymentMethods?.length) {
      showAlert("Debe haber al menos un método de pago activo", "warning");
      return false;
    }

    if (!localData.enabledOrderTypes?.length) {
      showAlert("Debe haber al menos una forma de entrega activa", "warning");
      return false;
    }

    const hasIncompleteSchedule = Object.entries(
      localData.workingHours || {},
    ).some(([, ranges]) => {
      if (!Array.isArray(ranges)) return false;

      return ranges.some((range) => {
        if (!range) return false;
        return !isCompleteTimeRange(range);
      });
    });

    if (hasIncompleteSchedule) {
      showAlert(
        "Hay horarios incompletos. Completá Desde y Hasta en formato 24 hs.",
        "warning",
      );
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateBeforeSave()) return;

    setLoading(true);

    try {
      const payload = buildLocalSettingsPayload({
        ...localData,
        businessLogoFile,
      });

      await userModifier(payload);

      setBusinessLogoFile(null);
      setLogoPreviewUrl("");

      showAlert("Datos del local actualizados correctamente", "success");
    } catch (error) {
      showAlert(
        error?.message || error || "Error al actualizar el local",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    setLocalData({
      id: user.id,
      businessName: user.businessName || user.name || "",
      businessLogoUrl: user.businessLogoUrl || "",
      businessUrl: user.businessUrl || "",
      mercadoPagoLink: user.mercadoPagoLink || "",
      transferPaymentAlias: user.transferPaymentAlias || "",
      whatsappNumber: user.whatsappNumber || "",
      paymentMethods: Array.isArray(user.paymentMethods)
        ? user.paymentMethods
        : DEFAULT_PAYMENT_METHODS,
      enabledOrderTypes: Array.isArray(user.enabledOrderTypes)
        ? user.enabledOrderTypes
        : DEFAULT_ORDER_TYPES,
      tablesConfig: Array.isArray(user.tablesConfig) ? user.tablesConfig : [],
      workingHours: normalizeWorkingHoursForUI(user.workingHours),
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      <Box
        sx={{
          maxWidth: "auto",
          width: "100%",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 3,
            borderRadius: 4,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "center" },
              justifyContent: "space-between",
              gap: 2,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "primary.main",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <StorefrontIcon />
                CONFIGURACIÓN DEL LOCAL
              </Typography>

              <Typography
                sx={{
                  fontFamily: "fontFamily.secondary",
                  color: "text.primary",
                  mt: 0.5,
                }}
              >
                Modificá la información visible en el menú digital.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{
                fontFamily: "fontFamily.primary",
                borderRadius: 3,
                color: "text.terciary",
                minWidth: { xs: "100%", sm: 180 },
              }}
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </Button>
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 3,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
          }}
        >
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontFamily: "fontFamily.primary",
                color: "text.primary",
                minHeight: 52,
                bgcolor: "background.main",
              },
              "& .Mui-selected": {
                color: "primary.main",
              },
              "& .MuiTabs-indicator": {
                bgcolor: "primary.main",
                height: 3,
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <FeedIcon />
                  <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                    Información general
                  </Typography>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: "flex", gap: 1 }}>
                  <ScheduleIcon />
                  <Typography sx={{ fontFamily: "fontFamily.primary" }}>
                    Horarios de atención
                  </Typography>
                </Box>
              }
            />
          </Tabs>
        </Paper>

        {currentTab === 0 && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "360px 1fr" },
              gap: 3,
            }}
          >
            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <ImageIcon color="primary" />
                    LOGO DEL LOCAL
                  </Typography>

                  <Box
                    sx={{
                      width: "100%",
                      height: 180,
                      borderRadius: 3,
                      bgcolor: "background.default",
                      border: "1px dashed",
                      borderColor: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      mb: 2,
                    }}
                  >
                    {previewLogo ? (
                      <Box
                        component="img"
                        src={previewLogo}
                        alt={localData.businessName}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                          p: 2,
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                        }}
                      >
                        No tienes cargado un logo.
                      </Typography>
                    )}
                  </Box>

                  <Button
                    component="label"
                    fullWidth
                    variant="contained"
                    startIcon={<ImageIcon />}
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      borderRadius: 3,
                      color: "text.terciary",
                      mb: 1.5,
                    }}
                  >
                    Seleccionar logo
                    <input
                      hidden
                      type="file"
                      accept="image/*"
                      onChange={handleLogoFileChange}
                    />
                  </Button>

                  {businessLogoFile && (
                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                        fontSize: "0.8rem",
                        textAlign: "center",
                      }}
                    >
                      Imagen seleccionada: {businessLogoFile.name}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <QrCode2Icon color="primary" />
                    QR DEL MENÚ
                  </Typography>

                  {menuUrl ? (
                    <>
                      <Box
                        sx={{
                          width: "100%",
                          display: "flex",
                          justifyContent: "center",
                          mb: 2,
                        }}
                      >
                        <Box
                          ref={qrRef}
                          sx={{
                            bgcolor: "#FFFFFF",
                            p: 1.5,
                            borderRadius: 3,
                            boxShadow: "0 8px 22px rgba(0,0,0,0.18)",
                          }}
                        >
                          <CustomQRCode
                            url={menuUrl}
                            logo={previewLogo}
                            size={220}
                          />
                        </Box>
                      </Box>

                      <Typography
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                          fontSize: "0.85rem",
                          textAlign: "center",
                          mb: 2,
                        }}
                      >
                        Escaneá este QR para acceder directamente al menú
                        digital.
                      </Typography>

                      <Stack spacing={1.2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<ContentCopyIcon />}
                          onClick={handleCopyBusinessUrl}
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            borderRadius: 3,
                          }}
                        >
                          Copiar URL
                        </Button>

                        <Button
                          fullWidth
                          variant="outlined"
                          startIcon={<DownloadIcon />}
                          onClick={handleDownloadQR}
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            borderRadius: 3,
                          }}
                        >
                          Descargar QR
                        </Button>

                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<OpenInNewIcon />}
                          onClick={handleOpenMenu}
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            borderRadius: 3,
                            color: "text.terciary",
                          }}
                        >
                          Abrir menú
                        </Button>
                      </Stack>
                    </>
                  ) : (
                    <Alert
                      severity="warning"
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        borderRadius: 3,
                      }}
                    >
                      Todavía no hay una URL configurada para este menú.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Stack>

            <Stack spacing={3}>
              <Card
                sx={{
                  borderRadius: 4,
                  bgcolor: "background.main",
                  border: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 2,
                    }}
                  >
                    <StorefrontIcon color="primary" />
                    INFORMACIÓN GENERAL
                  </Typography>

                  <TextField
                    label="Nombre del local"
                    name="businessName"
                    value={localData.businessName}
                    onChange={handleChange}
                    fullWidth
                    disabled
                    sx={textFieldSx}
                  />

                  <TextField
                    label="WhatsApp"
                    name="whatsappNumber"
                    placeholder="sin +54"
                    value={localData.whatsappNumber}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldSx}
                  />

                  {/* <TextField
                  label="Link Mercado Pago"
                  name="mercadoPagoLink"
                  value={localData.mercadoPagoLink}
                  onChange={handleChange}
                  fullWidth
                  sx={textFieldSx}
                /> */}

                  <TextField
                    label="Alias transferencia"
                    name="transferPaymentAlias"
                    value={localData.transferPaymentAlias}
                    onChange={handleChange}
                    fullWidth
                    sx={textFieldSx}
                  />
                </CardContent>
              </Card>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    bgcolor: "background.main",
                    border: "1px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <PaymentsIcon color="primary" />
                      MÉTODOS DE PAGO
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                        fontSize: "0.85rem",
                        mb: 2,
                      }}
                    >
                      Activá los medios de pago que utilices.
                    </Typography>

                    <Stack spacing={1}>
                      {paymentMethods.map((method) => (
                        <FormControlLabel
                          key={method.value}
                          control={
                            <Switch
                              checked={localData.paymentMethods.includes(
                                method.value,
                              )}
                              onChange={() =>
                                toggleArrayValue("paymentMethods", method.value)
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {method.icon}
                              <Typography sx={{ fontSize: "0.9rem" }}>
                                {method.value}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            justifyContent: "space-between",
                            width: "100%",
                            ".MuiFormControlLabel-label": {
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                            },
                          }}
                          labelPlacement="start"
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                <Card
                  sx={{
                    borderRadius: 4,
                    bgcolor: "background.main",
                    border: "1px solid",
                    borderColor: "primary.main",
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <DeliveryDiningIcon color="primary" />
                      TIPOS DE ENTREGA
                    </Typography>

                    <Typography
                      sx={{
                        fontFamily: "fontFamily.secondary",
                        color: "text.primary",
                        fontSize: "0.85rem",
                        mb: 2,
                      }}
                    >
                      Definí qué tipos de pedido acepta el local.
                    </Typography>

                    <Stack spacing={1}>
                      {orderTypeOptions.map((type) => (
                        <FormControlLabel
                          key={type.value}
                          control={
                            <Switch
                              checked={localData.enabledOrderTypes.includes(
                                type.value,
                              )}
                              onChange={() =>
                                toggleArrayValue(
                                  "enabledOrderTypes",
                                  type.value,
                                )
                              }
                              color="primary"
                            />
                          }
                          label={
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {type.icon}
                              <Typography sx={{ fontSize: "0.9rem" }}>
                                {type.value}
                              </Typography>
                            </Box>
                          }
                          sx={{
                            m: 0,
                            justifyContent: "space-between",
                            width: "100%",
                            ".MuiFormControlLabel-label": {
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                            },
                          }}
                          labelPlacement="start"
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </Box>
        )}

        {currentTab === 1 && (
          <Box
            sx={{
              p: { xs: 0, sm: 1 },
            }}
          >
            <Card
              sx={{
                borderRadius: 4,
                bgcolor: "background.main",
                border: "1px solid",
                borderColor: "primary.main",
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignContent: "center",
                    justifyItems: "center",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.primary",
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <ScheduleIcon color="primary" />
                    HORARIOS DE ATENCIÓN
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.primary",
                      fontSize: "0.85rem",
                      mb: 2,
                    }}
                  >
                    Podés cargar uno o más rangos por día.
                  </Typography>
                </Box>

                <Stack spacing={2}>
                  {DAYS_OF_WEEK.map((day) => {
                    const dayHours = localData.workingHours?.[day] || [];
                    const isOpen = dayHours.length > 0;

                    return (
                      <Paper
                        key={day}
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          bgcolor: "background.default",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                            mb: isOpen ? 1.5 : 0,
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              gap: 2,
                            }}
                          >
                            <Typography
                              sx={{
                                fontFamily: "fontFamily.primary",
                                color: "text.primary",
                              }}
                            >
                              {day}
                            </Typography>

                            <Chip
                              size="small"
                              label={isOpen ? "Abierto" : "Cerrado"}
                              color={isOpen ? "success" : "error"}
                              sx={{
                                fontFamily: "fontFamily.secondary",
                              }}
                            />
                          </Box>

                          <Switch
                            checked={isOpen}
                            onChange={(event) =>
                              handleToggleDay(day, event.target.checked)
                            }
                            color="primary"
                          />
                        </Box>

                        {isOpen && (
                          <Stack spacing={1.2}>
                            {dayHours.map((range, index) => {
                              const { open, close } = splitRange(range);

                              return (
                                <Box
                                  key={`${day}-${index}`}
                                  sx={{
                                    display: "grid",
                                    gridTemplateColumns: {
                                      xs: "1fr 1fr auto",
                                      sm: "1fr 1fr auto",
                                    },
                                    gap: 1,
                                    alignItems: "center",
                                  }}
                                >
                                  <TextField
                                    label="Desde"
                                    type="text"
                                    value={open}
                                    placeholder="13:00"
                                    onChange={(event) =>
                                      handleScheduleRangeChange(
                                        day,
                                        index,
                                        "open",
                                        event.target.value,
                                      )
                                    }
                                    onBlur={(event) =>
                                      handleScheduleRangeBlur(
                                        day,
                                        index,
                                        "open",
                                        event.target.value,
                                      )
                                    }
                                    onKeyDown={handleScheduleKeyDown}
                                    inputProps={{
                                      inputMode: "numeric",
                                      maxLength: 5,
                                    }}
                                    helperText={getTimePeriodLabel(open)}
                                    sx={textFieldSx}
                                  />

                                  <TextField
                                    label="Hasta"
                                    type="text"
                                    value={close}
                                    placeholder="23:00"
                                    onChange={(event) =>
                                      handleScheduleRangeChange(
                                        day,
                                        index,
                                        "close",
                                        event.target.value,
                                      )
                                    }
                                    onBlur={(event) =>
                                      handleScheduleRangeBlur(
                                        day,
                                        index,
                                        "close",
                                        event.target.value,
                                      )
                                    }
                                    onKeyDown={handleScheduleKeyDown}
                                    inputProps={{
                                      inputMode: "numeric",
                                      maxLength: 5,
                                    }}
                                    helperText={getTimePeriodLabel(close)}
                                    sx={textFieldSx}
                                  />

                                  <Tooltip title="Eliminar rango">
                                    <IconButton
                                      color="error"
                                      onClick={() =>
                                        handleRemoveScheduleRange(day, index)
                                      }
                                    >
                                      <DeleteIcon />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              );
                            })}

                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<AddIcon />}
                              onClick={() => handleAddScheduleRange(day)}
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                alignSelf: "flex-start",
                                borderRadius: 3,
                              }}
                            >
                              Agregar horario
                            </Button>
                          </Stack>
                        )}
                      </Paper>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>
      {AlertComponent}
    </Box>
  );
};
