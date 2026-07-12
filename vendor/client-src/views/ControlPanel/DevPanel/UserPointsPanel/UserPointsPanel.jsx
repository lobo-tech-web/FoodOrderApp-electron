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
  TablePagination,
} from "@mui/material";
// ICONS
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
// ------------------

// ------ COMPONENTS ------
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { DevPanelNavBar } from "@/components/PanelComponents/DevPanelNavBar/DevPanelNavBar.jsx";
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
// ----------------

export const UserPointsPanel = () => {
  const isElectronApp =
    typeof window !== "undefined" && Boolean(window.electronAPI);
  const { AlertComponent, showAlert } = useAlert();
  const [loading, setLoading] = useState(false);

  // PAGINADO
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // CONTEXT
  const { userState, getAllUserPoints } = useUser();

  // ME TRAIGO A TODOS LOS USUARIOS
  const allUserPoints = useMemo(
    () => userState?.userPoints || [],
    [userState?.userPoints],
  );

  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("points");

  // FUNCIÓN PARA COPIAR TEXTO
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showAlert(`Copiado: ${text}`, "success");
      })
      .catch((err) => {
        showAlert(`Error al copiar al portapapeles: ${err}`, "error");
      });
  };

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
      await getAllUserPoints();
      setPage(0);
    } catch (error) {
      showAlert(`Error al obtener los puntos de usuarios: ${error}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserPoints();
  }, []);

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
        <DevPanelNavBar
          showAlert={showAlert}
          isUserPointsPanel={true}
          refreshUserPoints={fetchUserPoints}
        />
        {allUserPoints?.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: "background.main" }}>
                <TableRow sx={{ fontFamily: "fontFamily.primary" }}>
                  <TableCell sx={tableHeadStyle}>USERPOINTS ID</TableCell>
                  <TableCell sx={tableHeadStyle}>CLIENTE ID</TableCell>
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
                  <TableCell sx={tableHeadStyle}>RESTAURANT ID</TableCell>
                  <TableCell
                    sx={tableHeadStyle}
                    sortDirection={orderBy === "restaurantName" ? order : false}
                  >
                    <TableSortLabel
                      sx={tableSortLabelStyle}
                      active={orderBy === "restaurantName"}
                      direction={orderBy === "restaurantName" ? order : "asc"}
                      onClick={() => handleRequestSort("restaurantName")}
                    >
                      NOMBRE DEL LOCAL
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={tableHeadStyle}>DUEÑO DEL LOCAL</TableCell>
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
                </TableRow>
              </TableHead>
              <TableBody sx={{ fontFamily: "fontFamily.terciary" }}>
                {stableSort(allUserPoints, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((userPoints) => (
                    <TableRow key={userPoints.id}>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              fontSize: "0.80rem",
                              color: "text.primary",
                            }}
                          >
                            USERPOINTS ID
                          </Typography>
                          <Button
                            onClick={() => copyToClipboard(userPoints?.id)}
                            sx={{
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              color="primary"
                              sx={{ fontSize: 16 }}
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
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              fontSize: "0.80rem",
                              color: "text.primary",
                            }}
                          >
                            USER ID
                          </Typography>
                          <Button
                            onClick={() => copyToClipboard(userPoints?.userId)}
                            sx={{
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              color="primary"
                              sx={{ fontSize: 16 }}
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
                          {userPoints?.user?.email}
                          <Button
                            onClick={() =>
                              copyToClipboard(userPoints?.user?.email)
                            }
                            sx={{
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              color="primary"
                              sx={{ fontSize: 16 }}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints?.user?.name}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: "fontFamily.secondary",
                              fontSize: "0.80rem",
                              color: "text.primary",
                            }}
                          >
                            RESTAURANT ID
                          </Typography>
                          <Button
                            onClick={() =>
                              copyToClipboard(userPoints?.restaurantId)
                            }
                            sx={{
                              minWidth: "auto",
                              ml: 1,
                            }}
                          >
                            <ContentCopyIcon
                              color="primary"
                              sx={{ fontSize: 16 }}
                            />
                          </Button>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints?.restaurantName}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints?.restaurant?.name}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableBodyStyle}>
                        {userPoints.points}
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
    </Box>
  );
};
