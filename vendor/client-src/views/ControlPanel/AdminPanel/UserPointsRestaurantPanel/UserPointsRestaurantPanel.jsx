import { useState, useEffect, useMemo } from "react";

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
  IconButton,
  Tooltip,
  TablePagination,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
// ------------------

// ------ COMPONENTS ----->
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { PanelNavBar } from "@/components/PanelComponents/PanelNavBar/PanelNavBar.jsx";
import { RestaurantUserPoints } from "./RestaurantUserPoints/RestaurantUserPoints.jsx";
// <-----------------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- CONTEXT ----
import { useUser } from "@/context/Users.jsx";
// <----------------

// ---- STYLES ----
const tableSortLabelStyle = {
  color: "primary.main",
  "&:hover": { color: "text.primary" },
  "& .MuiTableSortLabel-icon": {
    opacity: 1,
    color: "primary.main",
  },
  "&.Mui-active": {
    color: "primary.main",
    "& .MuiTableSortLabel-icon": {
      color: "primary.main",
    },
  },
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
// -----------------

export const UserPointsRestaurantPanel = ({ user }) => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  // CONTEXT
  const { userState, getUserPointsByRestaurant } = useUser();

  // ME TRAIGO A TODOS LOS USUARIOS
  const allUserPoints = useMemo(
    () => userState?.userPoints || [],
    [userState?.userPoints],
  );

  const countAllUserPoints = useMemo(
    () => userState?.userPoints.length || 0,
    [userState?.userPoints],
  );

  const [selectedUserPoints, setSelectedUserPoints] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(Number(event.target.value));
    setPage(0); // Volver a la primera página
  };

  // -------------------------------------------------------------

  // Estado para el popover de modificación rápida
  const [popoverState, setPopoverState] = useState({
    open: false,
    anchorEl: null,
    isAddingPoints: true,
  });

  // Abrir popover para modificar puntos
  const handleOpenPopover = (event, userPoints, isAdding) => {
    setSelectedUserPoints(userPoints);
    setPopoverState({
      open: true,
      anchorEl: event.currentTarget,
      isAddingPoints: isAdding,
    });
  };

  // Cerrar popover
  const handleClosePopover = () => {
    setPopoverState({
      ...popoverState,
      open: false,
    });
  };

  // ----------------------------------------------------------------

  // FUNCIÓN PARA COPIAR TEXTO
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showAlert(`Copiado: ${text}`, "success");
      })
      .catch((err) => {
        showAlert(`No se pudo copiar al portapapeles. ${err}`, "error");
      });
  };

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("points");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const descendingComparator = (a, b, orderBy) => {
    const aValue =
      orderBy === "name"
        ? a.user?.name || ""
        : orderBy === "email"
          ? a.user?.email || ""
          : a[orderBy];

    const bValue =
      orderBy === "name"
        ? b.user?.name || ""
        : orderBy === "email"
          ? b.user?.email || ""
          : b[orderBy];

    // Para strings
    if (typeof aValue === "string" && typeof bValue === "string")
      return bValue.localeCompare(aValue);

    // Para números (como points)
    if (typeof aValue === "number" && typeof bValue === "number")
      return bValue - aValue;

    return 0;
  };

  const getComparator = (order, orderBy) => {
    return order === "desc"
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
  };

  const fetchUserPoints = async () => {
    setLoading(true);
    try {
      if (user?.id) await getUserPointsByRestaurant(user.id);
    } catch (error) {
      showAlert(`Error al obtener los puntos de usuarios: ${error}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchUserPoints();
  }, [user]);

  if (loading) return <LoadingComponent />;

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
      <Box sx={{ maxWidth: "auto", width: "100%" }}>
        <PanelNavBar
          isUserPointsPanel={true}
          handleRefresh={fetchUserPoints}
          selectedUserPoints={selectedUserPoints}
          countAllUserPoints={countAllUserPoints}
          showAlert={showAlert}
        />
        {allUserPoints?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "background.paper" }}>
                <TableRow sx={{ textAlign: "center" }}>
                  <TableCell sx={tableHeadStyle}>N° DE USUARIO</TableCell>
                  <TableCell
                    sx={tableHeadStyle}
                    sortDirection={orderBy === "email" ? order : false}
                  >
                    <TableSortLabel
                      sx={tableSortLabelStyle}
                      active={orderBy === "email"}
                      direction={orderBy === "email" ? order : "asc"}
                      onClick={() => handleRequestSort("email")}
                    >
                      EMAIL DEL CLIENTE
                    </TableSortLabel>
                  </TableCell>
                  <TableCell
                    sx={tableHeadStyle}
                    sortDirection={orderBy === "name" ? order : false}
                  >
                    <TableSortLabel
                      sx={tableSortLabelStyle}
                      active={orderBy === "name"}
                      direction={orderBy === "name" ? order : "asc"}
                      onClick={() => handleRequestSort("name")}
                    >
                      NOMBRE DEL CLIENTE
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={tableHeadStyle}>
                    TELÉFONO DEL CLIENTE
                  </TableCell>
                  <TableCell sx={tableHeadStyle}>NOMBRE DEL LOCAL</TableCell>
                  <TableCell
                    sx={tableHeadStyle}
                    sortDirection={orderBy === "points" ? order : false}
                  >
                    <TableSortLabel
                      sx={tableSortLabelStyle}
                      active={orderBy === "points"}
                      direction={orderBy === "points" ? order : "asc"}
                      onClick={() => handleRequestSort("points")}
                    >
                      PUNTOS
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={tableHeadStyle}>ACCIONES</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: "background.default" }}>
                {stableSort(allUserPoints, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((userPoints) => (
                    <TableRow key={userPoints.id}>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints?.user?.userNumber}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {userPoints?.user?.email}
                          <Button
                            onClick={() =>
                              copyToClipboard(userPoints?.user?.email)
                            }
                            sx={{
                              color: "text.primary",
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              sx={{ color: "primary.main", fontSize: 16 }}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {userPoints?.user?.name}
                          <Button
                            onClick={() =>
                              copyToClipboard(userPoints?.user?.name)
                            }
                            sx={{
                              color: "text.primary",
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              sx={{ color: "primary.main", fontSize: 16 }}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {userPoints?.user?.phone}
                          <Button
                            onClick={() =>
                              copyToClipboard(userPoints?.user?.phone)
                            }
                            sx={{
                              color: "text.primary",
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              sx={{ color: "primary.main", fontSize: 16 }}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints?.restaurantName}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints.points}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        <Tooltip title="Agregar puntos" arrow>
                          <IconButton
                            onClick={(e) =>
                              handleOpenPopover(e, userPoints, true)
                            }
                            size="small"
                          >
                            <AddCircleOutlineIcon
                              sx={{ color: "success.main" }}
                            />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Restar puntos" arrow>
                          <IconButton
                            onClick={(e) =>
                              handleOpenPopover(e, userPoints, false)
                            }
                            size="small"
                            sx={{ ml: 1 }}
                          >
                            <RemoveCircleOutlineIcon
                              sx={{ color: "error.main" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[10, 20, 30, 50]}
              component="div"
              count={allUserPoints.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Mostrar por página:"
              labelDisplayedRows={({ from, to, count }) =>
                `${from}–${to} de ${count !== -1 ? count : `más de ${to}`}`
              }
              sx={{
                fontFamily: "fontFamily.primary",
                bgcolor: "background.paper",
                color: "text.primary",
              }}
            />
          </TableContainer>
        ) : (
          <Typography
            sx={{
              display: "flex",
              alignContent: "center",
              justifyContent: "center",
              width: "100%",
              paddingTop: "10rem",
              fontFamily: "fontFamily.primary",
              color: "text.primary",
            }}
          >
            NO HAY INFORMACIÓN SOBRE PUNTOS ACUMULADOS POR USUARIOS.
          </Typography>
        )}
      </Box>
      {AlertComponent}
      <RestaurantUserPoints
        anchorEl={popoverState.anchorEl}
        open={popoverState.open}
        onClose={handleClosePopover}
        showAlert={showAlert}
        selectedUserPoints={selectedUserPoints}
        isAddingPoints={popoverState.isAddingPoints}
        refreshUserPoints={fetchUserPoints}
      />
    </Box>
  );
};
