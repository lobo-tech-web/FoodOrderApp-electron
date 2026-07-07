import { useState, useEffect, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tabs,
  Tab,
  TablePagination,
  Card,
  Stack,
  IconButton,
  Collapse,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
// ICONS
import {
  Edit as EditIcon,
  Moped as MopedIcon,
  CalendarToday as CalendarTodayIcon,
  QueryStats as QueryStatsIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Person as PersonIcon,
  AttachMoney as AttachMoneyIcon,
  SwapVertOutlined as SwapVertOutlinedIcon,
} from "@mui/icons-material";
// ---------------------

// ---- COMPONENTS ----
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { ModalCreateEditRider } from "@/components/PanelComponents/ModalCreateEditRider/ModalCreateEditRider.jsx";
// --------------------

// ---- CONTEXT ----
import { useOrders } from "@/context/Orders.jsx";
// -----------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- UTILS ----
import { getDateNowDayjs } from "@/utils/clientWorking.js";
import { formatCurrency } from "@/utils/orderCalculations.js";
// ---------------

// ---- STYLES ----
const tabStyles = {
  fontFamily: "fontFamily.primary",
  color: "text.secondary",
  borderRadius: 1,
};

const tableHeadStyle = {
  color: "primary.main",
  textAlign: "center",
  fontFamily: "fontFamily.primary",
};

const tableBodyStyle = {
  color: "text.primary",
  textAlign: "center",
  fontFamily: "fontFamily.secondary",
};
// ----------------

const CollapsibleRow = ({ group, isMobile, sortBy, sortOrder, handleSort }) => {
  const [open, setOpen] = useState(false);

  const sortedRiders = useMemo(() => {
    const ridersCopy = [...group.riders];

    ridersCopy.sort((a, b) => {
      if (sortBy === "trips") {
        return sortOrder === "desc" ? b.trips - a.trips : a.trips - b.trips;
      }

      return sortOrder === "desc"
        ? b.totalDelivery - a.totalDelivery
        : a.totalDelivery - b.totalDelivery;
    });

    return ridersCopy;
  }, [group.riders, sortBy, sortOrder]);

  return (
    <>
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          bgcolor: open ? "primary.main" : "inherit",
          textAlign: "center",
        }}
      >
        <TableCell width="50px">
          <IconButton size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={tableBodyStyle}>
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
          >
            {group.date}
          </Typography>
        </TableCell>
        {!isMobile && (
          <TableCell sx={tableBodyStyle}>
            <Typography
              variant="body2"
              sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
            >
              {group.riders.length} cadetes
            </Typography>
          </TableCell>
        )}
        <TableCell sx={tableBodyStyle}>
          <Typography
            variant="subtitle2"
            color="primary.main"
            sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
          >
            {group.totalTrips} viajes
          </Typography>
        </TableCell>
        <TableCell sx={tableBodyStyle}>
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: "fontFamily.secondary", color: "text.primary" }}
          >
            {formatCurrency(group.totalAmount)}
          </Typography>
        </TableCell>
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box
              sx={{
                margin: 1,
                py: 1,
                borderLeft: "4px solid",
                borderColor: "primary.main",
                pl: 2,
              }}
            >
              <Typography
                variant="subtitle1"
                gutterBottom
                sx={{
                  fontFamily: "fontFamily.primary",
                  color: "text.primary",
                  borderBottom: "1px solid",
                  borderColor: "primary.main",
                }}
              >
                DETALLE DE REPARTIDORES
              </Typography>
              <Table size="small">
                <TableHead
                  sx={{
                    bgcolor: "background.paper",
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                      }}
                    >
                      CADETE
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("trips")}
                      align="center"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        cursor: "pointer",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <SwapVertOutlinedIcon color="primary" />
                        VIAJES
                      </Stack>
                    </TableCell>
                    <TableCell
                      onClick={() => handleSort("amount")}
                      align="center"
                      sx={{
                        fontFamily: "fontFamily.primary",
                        color: "text.primary",
                        cursor: "pointer",
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="center"
                      >
                        <SwapVertOutlinedIcon color="primary" />
                        MONTO
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRiders.map((rider, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              fontSize: "0.7rem",
                              bgcolor: "primary.main",
                              color: "text.terciary",
                              fontFamily: "fontFamily.secondary",
                            }}
                          >
                            {rider.name.charAt(0)}
                          </Avatar>
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              color: "text.primary",
                            }}
                          >
                            {rider.name}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                        }}
                      >
                        {rider.trips}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          fontFamily: "fontFamily.secondary",
                          color: "text.primary",
                        }}
                      >
                        {formatCurrency(rider.totalDelivery)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export const RiderPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [sortBy, setSortBy] = useState("trips");
  const [sortOrder, setSortOrder] = useState("desc");

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // MODAL PARA EDITAR RIDER !
  const [modalEditRider, setModalEditRider] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);

  const handleOpenEditRider = (rider) => {
    setSelectedRider(rider);
    setModalEditRider(true);
  };

  const handleCloseEditRider = () => {
    setModalEditRider(false);
    setSelectedRider(null);
  };

  // OBTENER DIA
  const [date, setDate] = useState({});

  // TABS
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cambiar de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Resetear la paginación al cambiar de pestaña
  };

  const {
    orderState,
    getRidersByRestaurant,
    getDailyRidersStats,
    getAllRidersStats,
  } = useOrders();

  // Memoización para agrupar las filas por fecha
  const groupedStats = useMemo(() => {
    const rows = orderState.ridersStats?.rows || [];
    if (activeTab === 2) return []; // No aplica para la pestaña de lista

    const groups = rows.reduce((acc, curr) => {
      const dateKey = curr.period || "Sin fecha";
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          riders: [],
          totalTrips: 0,
          totalAmount: 0,
        };
      }
      acc[dateKey].riders.push(curr);
      acc[dateKey].totalTrips += Number(curr.trips || 0);
      acc[dateKey].totalAmount += Number(curr.totalDelivery || 0);
      return acc;
    }, {});

    return Object.values(groups);
  }, [orderState.ridersStats, activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      if (activeTab === 0) {
        await getDailyRidersStats(user.id);
      } else if (activeTab === 1) {
        await getAllRidersStats(user.id);
      } else {
        await getRidersByRestaurant(user.id);
      }
      setPage(0);
      const today = getDateNowDayjs();
      setDate(today);
      showAlert("Riders actualizados correctamente!", "success");
    } catch (error) {
      console.error("Error al obtener las estadisticas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [activeTab, user.id]);

  if (loading) return <LoadingComponent message={"Cargando riders..."} />;
  return (
    <Box
      sx={{
        width: "100%",
        pb: 4,
        height: isElectronApp ? "calc(100vh - 112px)" : "auto",
        overflowY: isElectronApp ? "auto" : "visible",
        overflowX: isElectronApp ? "auto" : "visible",
        pr: isElectronApp ? 1 : 0,
        pb: isElectronApp ? 3 : 0,
      }}
    >
      {/* PANELNAVBAR DE LOS RIDERS */}
      <PanelNavBar
        isRidersPanel={true}
        handleRefresh={fetchStats}
        showAlert={showAlert}
      />

      <Card sx={{ mb: 2, borderRadius: 2, overflow: "hidden" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={"standard"}
            sx={{
              px: 2,
              pt: 1,
              "& .MuiTabs-indicator": {
                bgcolor: "primary.main",
              },
            }}
          >
            <Tab
              icon={<CalendarTodayIcon sx={{ color: "primary.main" }} />}
              iconPosition="start"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                    gap: 1,
                  }}
                >
                  ENVIOS DEL MES
                  <Typography
                    variant="body2"
                    sx={{ color: "text.primary" }}
                  >{`${date.month}/${date.year}`}</Typography>
                </Box>
              }
              sx={tabStyles}
            />

            <Tab
              icon={<QueryStatsIcon sx={{ color: "primary.main" }} />}
              iconPosition="start"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                  }}
                >
                  ESTADISTICAS TOTALES
                </Box>
              }
              sx={tabStyles}
            />

            <Tab
              icon={<MopedIcon sx={{ color: "primary.main" }} />}
              iconPosition="start"
              label={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    color: "primary.main",
                  }}
                >
                  RIDERS (CADETES)
                </Box>
              }
              sx={tabStyles}
            />
          </Tabs>
        </Box>
      </Card>

      {/* CARDS DE RESUMEN - RESPONSIVE */}
      {activeTab !== 2 && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          {[
            {
              label: "CADETES",
              val: orderState.ridersStats.summary?.totalRiders,
              icon: <PersonIcon />,
            },
            {
              label: "VIAJES",
              val: orderState.ridersStats.summary?.totalTrips,
              icon: <MopedIcon />,
            },
            {
              label: "RECAUDACIÓN",
              val: formatCurrency(
                orderState.ridersStats.summary?.totalDelivery || 0,
              ),
              icon: <AttachMoneyIcon />,
            },
          ].map((item, i) => (
            <Card
              key={i}
              sx={{
                flex: 1,
                p: 2,
                bgcolor: "primary.main",
                color: "text.terciary",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      fontFamily: "fontFamily.primary",
                      color: "text.terciary",
                      opacity: 0.8,
                    }}
                  >
                    {item.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: "fontFamily.secondary",
                      color: "text.terciary",
                    }}
                  >
                    {item.val}
                  </Typography>
                </Box>
                {item.icon}
              </Stack>
            </Card>
          ))}
        </Stack>
      )}

      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead sx={{ bgcolor: "background.paper" }}>
            {activeTab !== 2 ? (
              <TableRow sx={{ textAlign: "center" }}>
                <TableCell />
                <TableCell sx={tableHeadStyle}>FECHA / PERIODO</TableCell>
                {!isMobile && (
                  <TableCell sx={tableHeadStyle}>CANT. CADETES</TableCell>
                )}
                <TableCell sx={tableHeadStyle}>TOTAL VIAJES</TableCell>
                <TableCell sx={tableHeadStyle}>TOTAL RECAUDACIÓN</TableCell>
              </TableRow>
            ) : (
              <TableRow sx={{ textAlign: "center" }}>
                <TableCell sx={tableHeadStyle}>CADETE</TableCell>
                <TableCell sx={tableHeadStyle}>CONTACTO</TableCell>
                <TableCell sx={tableHeadStyle}>ACCIONES</TableCell>
              </TableRow>
            )}
          </TableHead>
          <TableBody>
            {activeTab !== 2
              ? groupedStats
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((group, index) => (
                    <CollapsibleRow
                      key={index}
                      group={group}
                      isMobile={isMobile}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      handleSort={handleSort}
                    />
                  ))
              : orderState.riders.map((r) => (
                  <TableRow key={r.id} sx={{ textAlign: "center" }}>
                    <TableCell sx={tableBodyStyle}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 2,
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            color: "text.terciary",
                            fontFamily: "fontFamily.secondary",
                          }}
                        >
                          {r.name.charAt(0)}
                        </Avatar>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontFamily: "fontFamily.secondary",
                            width: 140,
                            textAlign: "left",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {r.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>{r.phone}</TableCell>
                    <TableCell sx={tableBodyStyle}>
                      <IconButton onClick={() => handleOpenEditRider(r)}>
                        <EditIcon color="primary" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={
            activeTab !== 2 ? groupedStats.length : orderState.riders.length
          }
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) =>
            setRowsPerPage(parseInt(e.target.value, 10))
          }
        />
      </TableContainer>

      {AlertComponent}
      {modalEditRider && (
        <ModalCreateEditRider
          show={modalEditRider}
          handleClose={handleCloseEditRider}
          showAlert={showAlert}
          showRider={selectedRider}
          isEditing={true}
        />
      )}
    </Box>
  );
};
