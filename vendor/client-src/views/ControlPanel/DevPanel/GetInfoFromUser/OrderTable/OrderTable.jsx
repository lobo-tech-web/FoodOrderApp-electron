import React from 'react';
import { useState } from 'react';

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
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
// ICONS
import { ReceiptLong as ReceiptLongIcon } from '@mui/icons-material';
// ------------------

// ---- HOOKS ----
import { useAlert } from '@/hooks/Alert.jsx';
// ---------------

// ---- COMPONENTS ----
import { ModalEditOrder } from '@/components/PanelComponents/ModalEditOrder/ModalEditOrder.jsx';
// --------------------

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

export const OrderTable = ({ allOrders }) => {
  const { AlertComponent, showAlert } = useAlert();
  const [orderDetail, setOrderDetail] = useState(null);
  const reverseIndex = orderDetail !== null ? orderDetail.id : 1;
  const [openDetailsModal, setOpenDetailsModal] = useState(false);

  const handleOpenDetailsModal = (order) => {
    setOrderDetail(order);
    setOpenDetailsModal(true);
  };
  const handleCloseDetailsModal = () => setOpenDetailsModal(false);

  const handleColor = (status) => {
    if (status === 'FINALIZADO') return 'success';
    if (status === 'CANCELADO') return 'error';
    if (status === 'EN PREPARACIÓN') return 'info';
    return 'warning';
  };

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
        PEDIDOS
      </Typography>
      {allOrders && allOrders.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow sx={{ textAlign: 'center' }}>
                <TableCell sx={tableHeadStyle}>N° PEDIDO</TableCell>
                <TableCell sx={tableHeadStyle}>EMAIL DEL CLIENTE</TableCell>
                <TableCell sx={tableHeadStyle}>NOMBRE DEL CLIENTE</TableCell>
                <TableCell sx={tableHeadStyle}>
                  NOMBRE DEL RESTAURANTE
                </TableCell>
                <TableCell sx={tableHeadStyle}>RECOMPENSA</TableCell>
                <TableCell sx={tableHeadStyle}>CANJE</TableCell>
                <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                <TableCell sx={tableHeadStyle}>STATUS</TableCell>
                <TableCell sx={tableHeadStyle}>FECHA</TableCell>
                <TableCell sx={tableHeadStyle}>HORA</TableCell>
                <TableCell sx={tableHeadStyle}>VER PEDIDO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ textAlign: 'center' }}>
              {allOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <TableRow>
                    <TableCell component="th" scope="row" sx={tableBodyStyle}>
                      {order.id}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.clientEmail}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.clientName}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.restaurantName}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.totalRewardPoints}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.totalRedeemPoints}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {order.totalAmount}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      <Chip
                        label={order.status}
                        color={handleColor(order.status)}
                        sx={{ fontFamily: 'fontFamily.primary' }}
                      />
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {`${order.orderDate.day}/${order.orderDate.month}/${order.orderDate.year}`}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      {`${order.orderDate.hour}:${order.orderDate.minute}:${order.orderDate.second}`}
                    </TableCell>
                    <TableCell sx={tableBodyStyle}>
                      <Tooltip title="Ver detalles" arrow>
                        <IconButton
                          onClick={() => handleOpenDetailsModal(order)}
                          size="small"
                          sx={{ color: 'primary.main', mr: 1 }}
                        >
                          <ReceiptLongIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
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
                NO HAY INFORMACIÓN DE PEDIDOS DISPONIBLE.
              </TableCell>
            </TableRow>
          </TableHead>
        </TableContainer>
      )}
      <ModalEditOrder
        show={openDetailsModal}
        onClose={handleCloseDetailsModal}
        showAlert={showAlert}
        showOrder={orderDetail}
        showOrderIndex={reverseIndex}
      />
      {AlertComponent}
    </>
  );
};
