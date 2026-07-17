import { useState, useMemo, useCallback } from "react";

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
  TablePagination,
} from "@mui/material";
//  Icons
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Restore as RestoreIcon,
  ContentCopy as ContentCopyIcon,
  AlternateEmail as AlternateEmailIcon,
  Tag as TagIcon,
  Person as PersonIcon,
  Smartphone as SmartphoneIcon,
  Badge as BadgeIcon,
  Home as HomeIcon,
  FmdGood as FmdGoodIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
// ------------------

// ------ COMPONENTS ----->
import { LoadingComponent } from "@/components/LoadingComponent/LoadingComponent.jsx";
import { ModalEditUser } from "@/components/PanelComponents/ModalEditUser/ModalEditUser.jsx";
import { RestoreUserPassword } from "@/components/PanelComponents/RestoreUserPassword/RestoreUserPassword.jsx";
import { DevPanelNavBar } from "@/components/PanelComponents/DevPanelNavBar/DevPanelNavBar.jsx";
// <-----------------------

// ---- CONTEXT ----
import { useUser } from "@/context/Users.jsx";
// <----------------

// ---- HOOKS ----
import { useAlert } from "@/hooks/Alert.jsx";
// ---------------

// ---- Utils ----
import { writeClipboardText } from "@/utils/clipboard.js";
// ---------------

// ---- STYLES ----
const tableHeadStyle = {
  color: "primary.main",
  textAlign: "center",
  fontFamily: "fontFamily.primary",
};

const tableCellStyle = {
  color: "text.primary",
  textAlign: "center",
  fontFamily: "fontFamily.secondary",
};
// ----------------

export const UsersPanel = () => {
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

  // FUNCIÓN PARA COPIAR TEXTO
  const copyToClipboard = async (text) => {
    try {
      const copiedText = await writeClipboardText(text);
      showAlert(`Copiado: ${copiedText}`, "success");
    } catch (error) {
      showAlert(`Error al copiar al portapapeles: ${error.message}`, "error");
    }
  };

  // CONTEXT
  const { userState, getAllUsers } = useUser();

  // ME TRAIGO A TODOS LOS USUARIOS
  const allUsers = useMemo(
    () => userState?.showUsers || [],
    [userState?.showUsers],
  );

  // ESTADO PARA MODAL EDIT USER
  const [selectedUser, setSelectedUser] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpenEditUser = useCallback((user) => {
    setSelectedUser(user);
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  // ESTADO PARA MODAL RESTORE USER PASSWORD
  const [openRestorePassword, setOpenRestorePassword] = useState(false);
  const handleOpenRestorePassword = useCallback((user) => {
    setSelectedUser(user);
    setOpenRestorePassword(true);
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      await getAllUsers();
      setPage(0);
    } catch (error) {
      showAlert(`Error al obtener usuarios: ${error}`, error);
    } finally {
      setLoading(false);
    }
  };

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
        <DevPanelNavBar isUsersPanel={true} refreshUsers={fetchUsers} />
        {allUsers && allUsers?.length > 0 ? (
          <Paper
            sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: "background.paper" }}>
                  <TableRow sx={{ textAlign: "center" }}>
                    <TableCell sx={tableHeadStyle}>RESET PASS</TableCell>
                    <TableCell sx={tableHeadStyle}>ID</TableCell>
                    <TableCell sx={tableHeadStyle}>EMAIL</TableCell>
                    <TableCell sx={tableHeadStyle}>DATOS</TableCell>
                    <TableCell sx={tableHeadStyle}>CUIT</TableCell>
                    <TableCell sx={tableHeadStyle}>UBICACIÓN</TableCell>
                    <TableCell sx={tableHeadStyle}>STATUS/ROLE</TableCell>
                    <TableCell sx={tableHeadStyle}>ULT. CONEX.</TableCell>
                    <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ fontFamily: "fontFamily.terciary" }}>
                  {(rowsPerPage > 0
                    ? allUsers.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                    : allUsers
                  ).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button onClick={() => handleOpenRestorePassword(user)}>
                          <RestoreIcon
                            sx={{
                              color: "primary.main",
                              textAlign: "center",
                              "&:hover": {
                                color: "primary.main",
                              },
                            }}
                          />
                        </Button>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
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
                            onClick={() => copyToClipboard(user.id)}
                            sx={{
                              color: "primary.main",
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
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <AlternateEmailIcon
                              sx={{ color: "primary.main", fontSize: "1.2rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.85rem",
                                color: "text.primary",
                              }}
                            >
                              {user.email}
                            </Typography>
                          </Box>

                          <Button
                            onClick={() => copyToClipboard(user.email)}
                            sx={{
                              color: "text.secondary",
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
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                flexWrap: "wrap",
                                textAlign: "center",
                                flexDirection: "row",
                                gap: 0.5,
                              }}
                            >
                              <TagIcon
                                sx={{ color: "primary.main", fontSize: "1rem" }}
                              />
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: "fontFamily.secondary",
                                  fontSize: "0.85rem",
                                  color: "text.primary",
                                }}
                              >
                                {user?.userNumber}
                              </Typography>
                            </Box>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <PersonIcon
                              sx={{ color: "primary.main", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.85rem",
                                color: "text.primary",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user?.name}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <SmartphoneIcon
                              sx={{ color: "primary.main", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.85rem",
                                color: "text.primary",
                              }}
                            >
                              {user?.phone}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              justifyContent: "center",
                              alignItems: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <BadgeIcon
                              sx={{ color: "primary.main", fontSize: "1.3rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.85rem",
                                color: "text.primary",
                              }}
                            >
                              {user.cuit}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            flexDirection: "column",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <HomeIcon
                              sx={{ color: "primary.main", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.85rem",
                                color: "text.primary",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.address}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <FmdGoodIcon
                              sx={{ color: "primary.main", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.75rem",
                                color: "text.primary",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.city}
                            </Typography>
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              textAlign: "center",
                              flexDirection: "row",
                              gap: 0.5,
                            }}
                          >
                            <PublicIcon
                              sx={{ color: "primary.main", fontSize: "1rem" }}
                            />
                            <Typography
                              variant="caption"
                              sx={{
                                fontFamily: "fontFamily.secondary",
                                fontSize: "0.75rem",
                                color: "text.primary",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {user.state}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "fontFamily.terciary",
                              color: "text.primary",
                              textAlign: "center",
                              textTransform: "uppercase",
                            }}
                          >
                            {user.role}
                          </Typography>
                          {user.status ? (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontFamily: "fontFamily.terciary",
                                  color: "success.main",
                                }}
                              >
                                ACTIVO
                              </Typography>
                              <CheckIcon
                                sx={{
                                  color: "success.main",
                                  fontSize: "0.85rem",
                                }}
                              />
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: "fontFamily.terciary",
                                  color: "error.main",
                                  textAlign: "center",
                                }}
                              >
                                DESACTIVADO
                              </Typography>
                              <ClearIcon
                                sx={{
                                  color: "error.main",
                                  fontSize: "0.85rem",
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {user?.lastLoginAt && user.lastLoginAt?.day ? (
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: "fontFamily.terciary",
                                color: "text.primary",
                                textAlign: "center",
                              }}
                            >
                              {`${user.lastLoginAt?.day}/${user.lastLoginAt?.month}/${user.lastLoginAt?.year}`}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "fontFamily.terciary",
                              color: "text.primary",
                              textAlign: "center",
                            }}
                          >
                            SIN DATOS
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenEditUser(user)}>
                          <EditIcon
                            sx={{
                              color: "primary.main",
                              textAlign: "center",
                            }}
                          />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {allUsers.length > 0 && (
                <TablePagination
                  rowsPerPageOptions={[10, 20, 30, 50]}
                  component="div"
                  count={allUsers.length}
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
              )}
            </TableContainer>
          </Paper>
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
            NO HAY USUARIOS DISPONIBLES.
          </Typography>
        )}
        <ModalEditUser
          show={open}
          handleClose={handleClose}
          isEditing={true}
          showUser={selectedUser}
        />
        <RestoreUserPassword
          show={openRestorePassword}
          handleClose={() => setOpenRestorePassword(false)}
          showUser={selectedUser}
        />
      </Box>
      {AlertComponent}
    </Box>
  );
};
