import { useState, useMemo, useCallback } from 'react';

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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import RestoreIcon from '@mui/icons-material/Restore';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// ------------------

// ------ COMPONENTS ----->
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { ModalEditUser } from '@/components/PanelComponents/ModalEditUser/ModalEditUser.jsx';
import { RestoreUserPassword } from '@/components/PanelComponents/RestoreUserPassword/RestoreUserPassword.jsx';
import { DevPanelNavBar } from '@/components/PanelComponents/DevPanelNavBar/DevPanelNavBar.jsx';
// <-----------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
// <----------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- STYLES ----
const tableHeadStyle = {
  color: 'primary.main',
  textAlign: 'center',
  fontFamily: 'fontFamily.primary',
};

const tableCellStyle = {
  color: 'text.primary',
  textAlign: 'center',
  fontFamily: 'fontFamily.secondary',
};
// ----------------

export const UsersPanel = () => {
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
  const copyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showAlert(`Copiado: ${text}`, 'success');
      })
      .catch((err) => {
        showAlert(`Error al copiar al portapapeles: ${err}`, 'error');
      });
  };

  // CONTEXT
  const { userState, getAllUsers } = useUser();

  // ME TRAIGO A TODOS LOS USUARIOS
  const allUsers = useMemo(
    () => userState?.showUsers || [],
    [userState?.showUsers]
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
    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
      <Box sx={{ maxWidth: 'auto', width: '100%' }}>
        <DevPanelNavBar isUsersPanel={true} refreshUsers={fetchUsers} />
        {allUsers && allUsers?.length > 0 ? (
          <Paper
            sx={{ width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}
          >
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'background.paper' }}>
                  <TableRow sx={{ textAlign: 'center' }}>
                    <TableCell sx={tableHeadStyle}>RESET PASS</TableCell>
                    <TableCell sx={tableHeadStyle}>ID</TableCell>
                    <TableCell sx={tableHeadStyle}>N° USUARIO</TableCell>
                    <TableCell sx={tableHeadStyle}>EMAIL</TableCell>
                    <TableCell sx={tableHeadStyle}>NOMBRE</TableCell>
                    <TableCell sx={tableHeadStyle}>CUIT</TableCell>
                    <TableCell sx={tableHeadStyle}>TEL.</TableCell>
                    <TableCell sx={tableHeadStyle}>DIRECCIÓN</TableCell>
                    <TableCell sx={tableHeadStyle}>CIUDAD</TableCell>
                    <TableCell sx={tableHeadStyle}>PROVINCIA</TableCell>
                    <TableCell sx={tableHeadStyle}>CP</TableCell>
                    <TableCell sx={tableHeadStyle}>ROLE</TableCell>
                    <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                    <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody sx={{ fontFamily: 'fontFamily.terciary' }}>
                  {(rowsPerPage > 0
                    ? allUsers.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                    : allUsers
                  ).map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Button onClick={() => handleOpenRestorePassword(user)}>
                          <RestoreIcon
                            sx={{
                              color: 'primary.main',
                              textAlign: 'center',
                              '&:hover': {
                                color: 'primary.main',
                              },
                            }}
                          />
                        </Button>
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {user.id}
                          <Button
                            onClick={() => copyToClipboard(user.id)}
                            sx={{
                              color: 'primary.main',
                              minWidth: 'auto',
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
                        {user.userNumber}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {user.email}
                          <Button
                            onClick={() => copyToClipboard(user.email)}
                            sx={{
                              color: 'text.secondary',
                              minWidth: 'auto',
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
                        {user.name}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.cuit}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.phone}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.address}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.city}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.state}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.postalCode}
                      </TableCell>
                      <TableCell component="th" scope="row" sx={tableCellStyle}>
                        {user.role}
                      </TableCell>
                      <TableCell>
                        {user.status ? (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'fontFamily.terciary',
                              color: 'success.main',
                              textAlign: 'center',
                            }}
                          >
                            ACTIVO
                            <CheckIcon />
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: 'fontFamily.terciary',
                              color: 'error.main',
                              textAlign: 'center',
                            }}
                          >
                            DESACTIVADO
                            <ClearIcon />
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button onClick={() => handleOpenEditUser(user)}>
                          <EditIcon
                            sx={{
                              color: 'primary.main',
                              textAlign: 'center',
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
                    fontFamily: 'fontFamily.primary',
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                  }}
                />
              )}
            </TableContainer>
          </Paper>
        ) : (
          <Typography
            sx={{
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'center',
              width: '100%',
              paddingTop: '10rem',
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
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
