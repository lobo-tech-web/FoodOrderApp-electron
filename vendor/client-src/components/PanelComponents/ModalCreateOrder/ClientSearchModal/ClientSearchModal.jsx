import { useState, useEffect, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
// ICONS
import {
  Close as CloseIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Search as SearchIcon,
  Stars as StarsIcon,
} from "@mui/icons-material";
// ----------------------

// ---- Context ----
import { useUser } from "@/context/Users";
// ------------------

// ---- Helpers ----
const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();
// -----------------

export const ClientSearchModal = ({
  show,
  handleClose,
  restaurantId,
  onSelectClient,
}) => {
  const [loading, setLoading] = useState(false);
  const [clientsData, setClientsData] = useState([]);
  const [search, setSearch] = useState("");

  const { getUserPointsByRestaurant } = useUser();

  const handleSelectClient = (userPoints) => {
    const user = userPoints?.user;

    if (!user?.id) return;

    onSelectClient?.({
      id: user.id,
      userNumber: user.userNumber || null,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "SIN ESPECIFICAR",
      deliveryAddress: user.address || "SIN ESPECIFICAR",
      points: Number(userPoints?.points || 0),
    });

    handleClose?.();
  };

  useEffect(() => {
    if (!show || !restaurantId) return;

    let active = true;

    const fetchClients = async () => {
      setLoading(true);

      try {
        const response = await getUserPointsByRestaurant(restaurantId);

        if (!active) return;

        const data = (
          Array.isArray(response)
            ? response
            : Array.isArray(response?.userPoints)
              ? response.userPoints
              : []
        ).filter(
          (record) =>
            String(record?.user?.email || "")
              .trim()
              .toLowerCase() !== "lobotech.bb@gmail.com",
        );

        setClientsData(data);
      } catch (error) {
        console.error("Error obteniendo clientes:", error);

        if (active) setClientsData([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchClients();

    return () => {
      active = false;
    };
  }, [show, restaurantId, getUserPointsByRestaurant]);

  useEffect(() => {
    if (show) setSearch("");
  }, [show]);

  const filteredClients = useMemo(() => {
    const query = normalizeText(search);

    if (!query) return clientsData;

    return clientsData.filter((userPoints) => {
      const user = userPoints?.user || {};

      const searchableText = [
        user.userNumber,
        user.name,
        user.email,
        user.phone,
        user.address,
        user.city,
      ]
        .map(normalizeText)
        .join(" ");

      return searchableText.includes(query);
    });
  }, [clientsData, search]);

  return (
    <Dialog
      open={show}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "background.main",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonIcon color="primary" />
          <Box>
            <Typography sx={{ fontFamily: "fontFamily.primary" }}>
              CLIENTES DEL LOCAL
            </Typography>

            <Typography
              sx={{
                fontFamily: "fontFamily.secondary",
                color: "text.secondary",
                fontSize: 13,
              }}
            >
              Buscá y seleccioná un cliente registrado
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ bgcolor: "background.default", p: 2 }}>
        <TextField
          fullWidth
          autoFocus
          placeholder="Buscar por nombre, email, teléfono, dirección..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ fontFamily: "fontFamily.secondary", mt: 1, mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
          }}
        />

        {loading ? (
          <Box
            sx={{
              minHeight: 220,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : filteredClients.length > 0 ? (
          <Stack spacing={1}>
            {filteredClients.map((userPoints) => {
              const user = userPoints?.user || {};
              return (
                <Paper
                  key={userPoints.id || user.id}
                  elevation={0}
                  onClick={() => handleSelectClient(userPoints)}
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "primary.main",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "0.15s ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1.5}>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {String(user.name || "?")
                          .charAt(0)
                          .toUpperCase()}
                      </Avatar>

                      <Box>
                        <Typography
                          sx={{
                            fontFamily: "fontFamily.primary",
                            color: "primary.main",
                            textTransform: "uppercase",
                          }}
                        >
                          {user.name || "Sin nombre"}
                        </Typography>

                        <Stack spacing={0.3} sx={{ mt: 0.5 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <EmailIcon sx={{ fontSize: 15 }} />

                            <Typography
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: 12,
                                color: "text.primary",
                              }}
                            >
                              {user.email || "Sin email"}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <PhoneIcon sx={{ fontSize: 15 }} />

                            <Typography
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: 12,
                                color: "text.primary",
                              }}
                            >
                              {user.phone || "Sin especificar"}
                            </Typography>
                          </Stack>

                          {(user.address || user.city) && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <HomeIcon sx={{ fontSize: 15 }} />

                              <Typography
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  fontSize: 12,
                                  color: "text.primary",
                                }}
                              >
                                {[user.address, user.city]
                                  .filter(Boolean)
                                  .join(", ")}
                              </Typography>
                            </Stack>
                          )}
                        </Stack>
                      </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                      {user.userNumber && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={`#${user.userNumber}`}
                          sx={{ fontFamily: "fontFamily.primary" }}
                        />
                      )}

                      <Chip
                        size="small"
                        color="primary"
                        icon={<StarsIcon />}
                        label={`${Number(userPoints.points || 0)} pts`}
                        sx={{ fontFamily: "fontFamily.primary" }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              );
            })}
          </Stack>
        ) : (
          <Box
            sx={{
              py: 5,
              textAlign: "center",
            }}
          >
            <PersonIcon
              sx={{
                fontSize: 45,
                color: "text.disabled",
              }}
            />

            <Typography fontWeight="bold">
              No se encontraron clientes
            </Typography>

            <Typography fontSize={13} color="text.secondary">
              {search
                ? "Probá con otro criterio de búsqueda."
                : "Todavía no hay clientes registrados para este local."}
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};
