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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
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

export const CategoryTable = ({ allCategorys, handleOpen }) => {
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
        }}
      >
        CATEGORIAS
      </Typography>
      {allCategorys && allCategorys.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow sx={{ fontFamily: 'fontFamily.primary' }}>
                <TableCell sx={tableHeadStyle}>ID</TableCell>
                <TableCell sx={tableHeadStyle}>NAME</TableCell>
                <TableCell sx={tableHeadStyle}>MODIF.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ textAlign: 'center' }}>
              {allCategorys.map((category) => (
                <TableRow key={category.id}>
                  <TableCell component="th" scope="row" sx={tableBodyStyle}>
                    {category.id}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>{category.name}</TableCell>
                  <TableCell align="center">
                    <Button onClick={() => handleOpen(category)}>
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
                NO HAY INFORMACIÓN DE CATEGORIAS DISPONIBLE.
              </TableCell>
            </TableRow>
          </TableHead>
        </TableContainer>
      )}
    </>
  );
};
