// ---- MATERIAL UI ----
import {
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
// ICONS
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
// ------------------

// ---- STYLE ----
const tableHeadStyle = {
  color: 'primary.main',
  textAlign: 'center',
  fontFamily: 'fontFamily.primary',
};

const tableBodyStyle = {
  color: 'text.primary',
  textAlign: 'center',
  fontFamily: 'fontFamily.secondary',
};
// ----------------

export const ProductsTable = ({ allProducts, handleOpen }) => {
  return (
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
          pt: 5,
        }}
      >
        PRODUCTOS
      </Typography>
      {allProducts && allProducts.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow sx={{ textAlign: 'center' }}>
                <TableCell sx={tableHeadStyle}>NOMBRE</TableCell>
                <TableCell sx={tableHeadStyle}>DESCRIPCIÓN</TableCell>
                <TableCell sx={tableHeadStyle}>CATEGORIA</TableCell>
                <TableCell sx={tableHeadStyle}>PRECIO</TableCell>
                <TableCell sx={tableHeadStyle}>DESCUENTO</TableCell>
                <TableCell sx={tableHeadStyle}>RECOMPENSA</TableCell>
                <TableCell sx={tableHeadStyle}>CANJE</TableCell>
                <TableCell sx={tableHeadStyle}>ESTADO</TableCell>
                <TableCell sx={tableHeadStyle}>MODIFICAR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ textAlign: 'center' }}>
              {allProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell component="th" scope="row" sx={tableBodyStyle}>
                    {product.name}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {product.description}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {product?.category?.name}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>${product.price}</TableCell>
                  <TableCell sx={tableBodyStyle}>{product.discount}</TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {product.rewardPoints}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {product.redeemPoints}
                  </TableCell>
                  <TableCell align="center">
                    {product.status ? (
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
                  <TableCell align="center">
                    <Button onClick={() => handleOpen(product)}>
                      <EditIcon color="primary" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper}>
          <TableHead
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignContent: 'center',
              bgcolor: 'background.default',
            }}
          >
            <TableRow
              sx={{
                fontFamily: 'fontFamily.primary',
              }}
            >
              <TableCell
                align="center"
                sx={{
                  color: 'text.primary',
                }}
              >
                NO HAY INFORMACIÓN DE PRODUCTOS DISPONIBLE.
              </TableCell>
            </TableRow>
          </TableHead>
        </TableContainer>
      )}
    </>
  );
};
