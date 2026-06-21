// ---- Material UI ----
import {
  Box,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Typography,
  IconButton,
  InputAdornment,
} from '@mui/material';
// Icons
import {
  Edit as EditIcon,
  Pending as PendingIcon,
  TwoWheeler as TwoWheelerIcon,
  Percent as PercentIcon,
  AttachMoney as MoneyIcon,
  Moped as MopedIcon,
} from '@mui/icons-material';

// ---- STLYES ----
import { fieldStyles } from '../../styles/modalEditOrder.styles.js';
// ----------------

// ---- Shared ----
import { ModalSection } from '../../shared/ModalSection.jsx';
import { FieldBlock } from '../../shared/FieldBlock.jsx';
// ----------------

// ---- Utils ----
import { paymentMethods } from '@/utils/components/PaymentUtils.jsx';
import { orderTypeOptions } from '@/utils/components/OrderTypeUtils.jsx';
import { statusOptions } from '@/utils/components/StatusUtils.jsx';
import { discountMethods } from '@/utils/components/DiscountUtils.jsx';
// ---------------------

export const InfoSection = ({
  order,
  setOrder,
  handleInputChange,
  isDiscount,
  handleDiscountChange,
  availableRiders,
  editingRider,
  selectedRider,
  setEditingRider,
  setOpenSelectRider,
  openSelectRider,
}) => {
  const getPaymentIcon = (method) => {
    return (
      paymentMethods.find((payment) => payment.value === method)?.icon || (
        <MoneyIcon color="warning" />
      )
    );
  };

  const getOrderTypeIcon = (type) => {
    return (
      orderTypeOptions.find((item) => item.value === type)?.icon || (
        <TwoWheelerIcon color="info" />
      )
    );
  };

  const getStatusIcon = (status) => {
    return (
      statusOptions.find((item) => item.value === status)?.icon || (
        <PendingIcon color="warning" />
      )
    );
  };

  const getDiscountIcon = (discountType) => {
    return (
      discountMethods.find((item) => item.value === discountType)?.icon || (
        <PercentIcon color="primary" />
      )
    );
  };

  const renderSelectValue = (value, icon, placeholder = 'Seleccionar...') => {
    if (!value) {
      return (
        <Typography
          sx={{
            color: 'text.secondary',
            fontFamily: 'fontFamily.terciary',
          }}
        >
          {placeholder}
        </Typography>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        {icon}
        <Typography
          sx={{
            color: 'text.primary',
            fontFamily: 'fontFamily.terciary',
            fontWeight: 900,
          }}
        >
          {String(value).toUpperCase()}
        </Typography>
      </Box>
    );
  };

  return (
    <ModalSection>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: { xs: 1, sm: 1.2, md: 1.4 },
        }}
      >
        <FieldBlock label="Método de pago">
          <FormControl fullWidth sx={fieldStyles}>
            <Select
              name="paymentMethod"
              value={order.paymentMethod}
              onChange={handleInputChange}
              renderValue={(value) =>
                renderSelectValue(
                  value,
                  getPaymentIcon(value),
                  'Seleccionar pago'
                )
              }
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {method.icon}
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        fontWeight: 800,
                      }}
                    >
                      {method.value}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldBlock>

        <FieldBlock label="Tipo de entrega">
          <FormControl fullWidth sx={fieldStyles}>
            <Select
              name="orderType"
              value={order.orderType}
              onChange={handleInputChange}
              renderValue={(value) =>
                renderSelectValue(
                  value,
                  getOrderTypeIcon(value),
                  'Seleccionar tipo'
                )
              }
            >
              {orderTypeOptions.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        fontWeight: 800,
                      }}
                    >
                      {type.value}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldBlock>

        <FieldBlock label="Estado del pedido">
          <FormControl fullWidth sx={fieldStyles}>
            <Select
              name="status"
              value={order.status}
              onChange={handleInputChange}
              renderValue={(value) =>
                renderSelectValue(
                  value,
                  getStatusIcon(value),
                  'Seleccionar estado'
                )
              }
            >
              {statusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status.icon}
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        fontWeight: 800,
                      }}
                    >
                      {status.value}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldBlock>

        {order.orderType === 'DELIVERY' && (
          <>
            <FieldBlock label="Costo de delivery">
              <TextField
                type="text"
                name="deliverycost"
                value={order.deliverycost}
                onChange={handleInputChange}
                sx={fieldStyles}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MoneyIcon color="success" />
                    </InputAdornment>
                  ),
                }}
              />
            </FieldBlock>

            {availableRiders.length > 0 && (
              <FieldBlock
                label={
                  order.riderId && !editingRider
                    ? 'Rider seleccionado'
                    : 'Selecciona el rider'
                }
              >
                {order.riderId && !editingRider ? (
                  <TextField
                    type="text"
                    value={selectedRider?.name || ''}
                    sx={fieldStyles}
                    InputProps={{
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <MopedIcon color="primary" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => {
                              setEditingRider(true);
                              setOpenSelectRider(true);
                            }}
                          >
                            <EditIcon color="primary" />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                ) : (
                  <FormControl fullWidth sx={fieldStyles}>
                    <Select
                      value={order.riderId || ''}
                      open={openSelectRider}
                      onClose={() => {
                        setOpenSelectRider(false);
                        setEditingRider(false);
                      }}
                      onOpen={() => setOpenSelectRider(true)}
                      onChange={(e) => {
                        const riderId = e.target.value || null;
                        const selectedRiderData =
                          availableRiders.find(
                            (rider) => rider.id === riderId
                          ) || null;

                        setOrder((prev) => ({
                          ...prev,
                          riderId,
                          rider: selectedRiderData,
                        }));
                        setEditingRider(false);
                        setOpenSelectRider(false);
                      }}
                      displayEmpty
                      renderValue={(value) => {
                        const rider = availableRiders.find(
                          (r) => r.id === value
                        );

                        return renderSelectValue(
                          rider?.name || '',
                          <MopedIcon color="secondary" />,
                          'Seleccionar rider...'
                        );
                      }}
                    >
                      <MenuItem value="">
                        <Typography sx={{ fontFamily: 'fontFamily.terciary' }}>
                          Sin asignar
                        </Typography>
                      </MenuItem>

                      {availableRiders.map((rider) => (
                        <MenuItem key={rider.id} value={rider.id}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <MopedIcon color="primary" />
                            <Typography
                              sx={{
                                fontFamily: 'fontFamily.terciary',
                                fontWeight: 800,
                              }}
                            >
                              {rider.name.toUpperCase()}{' '}
                              {rider?.phone && `(${rider.phone})`}
                            </Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              </FieldBlock>
            )}
          </>
        )}

        <FieldBlock label="Descuento">
          <FormControl fullWidth sx={fieldStyles}>
            <Select
              name="isDiscount"
              value={isDiscount}
              onChange={(e) => handleDiscountChange(e.target.value)}
              displayEmpty
              renderValue={(value) =>
                renderSelectValue(
                  value,
                  getDiscountIcon(value),
                  'Seleccionar descuento'
                )
              }
            >
              {discountMethods.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {type.icon}
                    <Typography
                      sx={{
                        fontFamily: 'fontFamily.terciary',
                        fontWeight: 800,
                      }}
                    >
                      {type.value}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </FieldBlock>

        {isDiscount === 'PORCENTAJE' && (
          <FieldBlock label="Descuento %">
            <TextField
              type="text"
              name="discount"
              value={order.discount}
              onChange={handleInputChange}
              sx={fieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PercentIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldBlock>
        )}
        {isDiscount === 'MONTO' && (
          <FieldBlock label="Descuento $">
            <TextField
              type="text"
              name="discountamount"
              value={order.discountamount}
              onChange={handleInputChange}
              sx={fieldStyles}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon color="success" />
                  </InputAdornment>
                ),
              }}
            />
          </FieldBlock>
        )}
      </Box>
    </ModalSection>
  );
};
