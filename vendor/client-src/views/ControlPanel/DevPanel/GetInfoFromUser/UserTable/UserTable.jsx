// ---- MATERIAL UI ----
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
// ------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- Utils ----
import { writeClipboardText } from '@/utils/clipboard.js';
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

export const UserTable = ({ user }) => {
  const { AlertComponent, showAlert } = useAlert();
  // FUNCIÓN PARA COPIAR TEXTO
  const copyToClipboard = async (text) => {
    try {
      const copiedText = await writeClipboardText(text);
      showAlert(`Copiado: ${copiedText}`, 'success');
    } catch (error) {
      showAlert(`Error al copiar al portapapeles: ${error.message}`, 'error');
    }
  };

  return (
    <>
      {user.id ? (
        <>
          <Typography
            variant="h5"
            sx={{
              display: 'flex',
              alignContent: 'center',
              justifyContent: 'center',
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              m: 2,
            }}
          >
            USUARIO
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ bgcolor: 'background.paper' }}>
                <TableRow sx={{ fontFamily: 'fontFamily.primary' }}>
                  <TableCell sx={tableHeadStyle}>ID</TableCell>
                  <TableCell sx={tableHeadStyle}>EMAIL</TableCell>
                  <TableCell sx={tableHeadStyle}>NAME</TableCell>
                  <TableCell sx={tableHeadStyle}>CUIT</TableCell>
                  <TableCell sx={tableHeadStyle}>BUSINESS NAME</TableCell>
                  <TableCell sx={tableHeadStyle}>WHATSAPPNUMBER</TableCell>
                  <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ textAlign: 'center' }}>
                <TableRow>
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
                  <TableCell sx={tableCellStyle}>
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
                  <TableCell sx={tableCellStyle}>{user.name}</TableCell>
                  <TableCell sx={tableCellStyle}>{user.cuit}</TableCell>
                  <TableCell sx={tableCellStyle}>{user.businessName}</TableCell>
                  <TableCell sx={tableCellStyle}>
                    {user.whatsappNumber}
                  </TableCell>
                  <TableCell align="center">
                    {user.status ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'fontFamily.terciary',
                          color: 'success.main',
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
                        }}
                      >
                        DESACTIVADO
                        <ClearIcon />
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : (
        <Typography
          sx={{
            display: 'flex',
            alignContent: 'center',
            justifyContent: 'center',
            width: '100%',
            paddingTop: '10rem',
            fontFamily: 'fontFamily.primary',
          }}
        >
          NO HAY INFORMACIÓN DE USUARIO DISPONIBLE.
        </Typography>
      )}
      {AlertComponent}
    </>
  );
};
