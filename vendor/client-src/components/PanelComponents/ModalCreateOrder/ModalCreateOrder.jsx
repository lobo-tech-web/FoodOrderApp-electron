import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import _ from 'lodash';

// ---- MATERIAL UI ----
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Chip,
  IconButton,
  useTheme,
} from '@mui/material';
// ICONS
import {
  Close as CloseIcon,
  Add as AddIcon,
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
// ----------------------

// ---- CONTEXT ----
import { useUser } from '@/context/Users.jsx';
import { useOrders } from '@/context/Orders.jsx';
import { useProducts } from '@/context/Products.jsx';
// -----------------

// ---- COMPONENTS ----
import { LoadingComponent } from '@/components/LoadingComponent/LoadingComponent.jsx';
import { ConfirmDialogClose } from '@/components/ConfirmDialogClose/ConfirmDialogClose.jsx';
import { ModalSelectProducts } from '../ModalEditOrder/ModalSelectProducts/ModalSelectProducts.jsx';
import { OrderSummary } from './OrderSummary/OrderSummary.jsx';
import { ClientSearchModal } from './ClientSearchModal/ClientSearchModal.jsx';
import { ClientInfoTab } from './ClientInfoTab/ClientInfoTab.jsx';

// ---- TABS ----
import { OrderDetailsTab } from './OrderDetailsTab/OrderDetailsTab.jsx';
// ------------------

// ---- UTILS ----
import { taxAmount } from '@/utils/lobotechUtils.js'; // TARIFA DE SERVICIO
import {
  cleanMoneyValue,
  calculateFinalProductPrice,
  calculateProductTotals,
  calculateDiscount,
  calculateFinalTotal,
} from '@/utils/orderCalculations.js';
import { getProductOptionsForUI } from '@/utils/migrateCustomOptions.js';
// ---------------

const workflowSteps = ['PEDIDO', 'CLIENTE'];

export const ModalCreateOrder = ({
  show,
  onClose,
  showAlert,
  refreshOrders,
}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);

  // REFERENCES
  const [currentTab, setCurrentTab] = useState(0);
  const orderDetailsRef = useRef(null);
  const clientInfoRef = useRef(null);
  const contentRef = useRef(null);

  const handleTabChange = (index) => {
    setCurrentTab(index);

    const container = contentRef.current;

    const target =
      index === 0 ? orderDetailsRef.current : clientInfoRef.current;

    if (!container || !target) return;

    container.scrollTo({
      top: target.offsetTop - 20,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    const container = contentRef.current;

    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollTop;

      const clientTop = clientInfoRef.current.offsetTop;

      if (scrollPosition >= clientTop - 120) {
        setCurrentTab(1);
      } else {
        setCurrentTab(0);
      }
    };

    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const { userState } = useUser();
  const { addOrder } = useOrders();
  const { productState } = useProducts();

  const [addServiceTax, setAddServiceTax] = useState(false);
  const [modalState, setModalState] = useState({
    clientsData: false,
  });
  // ABRIR/CERRAR MODALES
  const toggleModal = (modal, value) => {
    setModalState((prevState) => ({ ...prevState, [modal]: value }));
  };

  const currentUser = useMemo(() => userState?.user || {}, [userState?.user]);

  const [order, setOrder] = useState({
    userId: '',
    restaurantId: '',
    restaurantName: '',
    tableid: '',
    cartItems: [],
    totalRewardPoints: 0,
    totalRedeemPoints: 0,
    deliverycost: 0,
    servicetax: 0,
    discount: 0,
    discountamount: 0,
    totalAmount: 0,
    paymentMethod: 'MERCADO PAGO',
    clientEmail: '',
    clientName: '',
    deliveryAddress: '',
    contactPhone: '',
    orderType: '',
    comentary: '',
    status: 'PENDIENTE A CONFIRMAR',
  });
  const [orderCopy, setOrderCopy] = useState(null);
  const [showConfirmClose, setShowConfirmClose] = useState(false);

  const handleConfirmModalClose = (confirmation) => {
    if (confirmation) {
      setLoading(false);
      setOrder({
        userId: '',
        restaurantId: '',
        restaurantName: '',
        tableid: '',
        cartItems: [],
        totalRewardPoints: 0,
        totalRedeemPoints: 0,
        deliverycost: 0,
        servicetax: 0,
        discount: 0,
        discountamount: 0,
        totalAmount: 0,
        paymentMethod: 'MERCADO PAGO',
        clientEmail: '',
        clientName: '',
        deliveryAddress: '',
        contactPhone: '',
        orderType: '',
        comentary: '',
        status: 'PENDIENTE A CONFIRMAR',
      });
      setOrderCopy(null);
      onClose();
    }
    setShowConfirmClose(false);
  };

  const hasChanges = useMemo(() => {
    if (!orderCopy) return false;
    const omitFields = [
      'totalAmount',
      'totalRewardPoints',
      'totalRedeemPoints',
      'discountamount',
    ];

    return !_.isEqual(_.omit(order, omitFields), _.omit(orderCopy, omitFields));
  }, [order, orderCopy]);

  const handleClose = useCallback(() => {
    if (hasChanges) {
      setShowConfirmClose(true);
    } else {
      onClose();
    }
  }, [hasChanges, onClose]);

  const [ignoreEmail, setIgnoreEmail] = useState(false);
  const DEFAULT_EMAIL = 'lobotech.bb@gmail.com';

  const handleIgnoreEmail = (e) => {
    const checked = e.target.checked;
    setIgnoreEmail(checked);
    if (checked) {
      setOrder((prev) => ({
        ...prev,
        clientEmail: currentUser?.email || DEFAULT_EMAIL,
      }));
    } else {
      setOrder((prev) => ({
        ...prev,
        clientEmail: '',
      }));
    }
  };

  const [isDiscount, setIsDiscount] = useState('SIN DESCUENTO');

  // Estados para la interfaz
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const handleCloseProductSelector = () => {
    setShowProductSelector(false);
    setEditingProductIndex(null);
    setEditingProduct(null);
  };

  // Estados para el pedido
  const statusOptions = [
    {
      value: 'PENDIENTE A CONFIRMAR',
      color: 'warning',
      icon: <PendingIcon sx={{ color: '#ff9800' }} />,
    },
    {
      value: 'EN PREPARACIÓN',
      color: 'info',
      icon: <FactCheckIcon sx={{ color: '#2196f3' }} />,
    },
    {
      value: 'EN ENVIO',
      color: 'secondary',
      icon: <DeliveryDiningIcon sx={{ color: '#9c27b0' }} />,
    },
    {
      value: 'FINALIZADO',
      color: 'success',
      icon: <CheckCircleIcon sx={{ color: '#4caf50' }} />,
    },
    {
      value: 'CANCELADO',
      color: 'error',
      icon: <CancelIcon sx={{ color: '#f44336' }} />,
    },
  ];

  // ✅ CALCULAR TOTALES AUTOMÁTICAMENTE
  const calculatedProductTotals = useMemo(() => {
    return calculateProductTotals(order.cartItems);
  }, [order.cartItems]);

  // ✅ CALCULAR EL DESCUENTO
  const calculatedDiscount = useMemo(() => {
    if (isDiscount === 'MONTO') {
      return {
        discountamount: cleanMoneyValue(order.discountamount).toNumber(),
        discountPercentage: 0,
      };
    } else if (isDiscount === 'SIN DESCUENTO') {
      return {
        discountamount: 0,
        discountPercentage: 0,
      };
    } else {
      const cleanedDiscount = Number(order.discount);
      return calculateDiscount(
        calculatedProductTotals.subtotalProducts,
        cleanedDiscount
      );
    }
  }, [
    calculatedProductTotals.subtotalProducts,
    order.discount,
    order.discountamount,
    isDiscount,
  ]);

  // ✅ CALCULAR EL TOTAL FINAL DEL PEDIDO (incluyendo delivery y service tax)
  const finalOrderTotal = useMemo(() => {
    const service = cleanMoneyValue(order.servicetax).toNumber(); // ✅ Usar servicetax
    const delivery = cleanMoneyValue(order.deliverycost).toNumber(); //✅ Usar deliverycost

    return calculateFinalTotal(
      calculatedProductTotals.subtotalProducts,
      calculatedDiscount.discountamount,
      service,
      delivery
    );
  }, [
    calculatedProductTotals.subtotalProducts,
    calculatedDiscount.discountamount,
    order.servicetax,
    order.deliverycost,
  ]);

  // ✅ ACTUALIZAR TOTALES CUANDO CAMBIAN LOS PRODUCTOS O DESCUENTO
  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      totalAmount: finalOrderTotal,
      totalRewardPoints: calculatedProductTotals.totalRewardPoints,
      totalRedeemPoints: calculatedProductTotals.totalRedeemPoints,
      discountamount: calculatedDiscount.discountamount,
      discount: calculatedDiscount.discountPercentage,
    }));
  }, [
    finalOrderTotal,
    calculatedProductTotals,
    calculatedDiscount.discountamount,
    calculatedDiscount.discountPercentage,
  ]);

  useEffect(() => {
    setOrder((prev) => ({
      ...prev,
      servicetax: addServiceTax ? taxAmount : 0,
    }));
  }, [addServiceTax]);

  // Obtener el color del estado actual
  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(
      (option) => option.value === status
    );
    return statusOption ? statusOption.color : 'default';
  };

  // ✅ MANEJAR CAMBIOS EN CAMPOS BÁSICOS
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'deliverycost' || name === 'discountamount') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const parsedValue = Number(value);
        setOrder((prev) => ({ ...prev, [name]: parsedValue }));
      }
      return;
    }

    // ✅ NUEVO: Manejar campo de descuento en %
    if (name === 'discount') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        const parsedValue = Number(value);
        if (!isNaN(parsedValue) && parsedValue >= 0 && parsedValue <= 100) {
          setOrder((prev) => ({
            ...prev,
            discount: parsedValue,
          }));
        }
      }
      return;
    }

    setOrder((prev) => ({ ...prev, [name]: value }));
  };

  const handleDiscountChange = (discountType) => {
    setIsDiscount(discountType);
    if (discountType === 'SIN DESCUENTO') {
      setOrder((prev) => ({
        ...prev,
        discount: 0,
        discountamount: 0,
      }));
    } else if (discountType === 'PORCENTAJE') {
      setOrder((prev) => ({
        ...prev,
        discountamount: 0,
      }));
    } else if (discountType === 'MONTO') {
      setOrder((prev) => ({
        ...prev,
        discount: 0,
      }));
    }
  };

  // ✅ AGREGAR PRODUCTO AL PEDIDO
  const handleAddProduct = (productWithCustomizations) => {
    const finalPrice = calculateFinalProductPrice(productWithCustomizations);

    const newItem = {
      ...productWithCustomizations,
      productId:
        productWithCustomizations.productId || productWithCustomizations.id,
      price: finalPrice,
      quantity: 1,
    };

    setOrder((prev) => ({
      ...prev,
      cartItems: [...prev.cartItems, newItem],
    }));

    setShowProductSelector(false);
    showAlert('Producto agregado al pedido', 'success');
  };

  const handleProductModified = (modifiedProduct) => {
    if (editingProductIndex !== null) {
      const updatedCartItems = [...order.cartItems];

      const finalPrice = calculateFinalProductPrice(modifiedProduct);

      const newItemModified = {
        ...modifiedProduct,
        productId: modifiedProduct.productId || modifiedProduct.id,
        price: finalPrice,
        quantity:
          modifiedProduct.quantity ||
          updatedCartItems[editingProductIndex].quantity,
      };

      updatedCartItems[editingProductIndex] = {
        ...updatedCartItems[editingProductIndex],
        ...newItemModified,
      };

      setOrder((prev) => ({
        ...prev,
        cartItems: updatedCartItems,
      }));

      // Reset editing states
      setEditingProductIndex(null);
      setEditingProduct(null);
      setShowProductSelector(false);

      showAlert('Producto modificado en el pedido', 'success');
    }
  };

  // ✅ EDITAR PRODUCTO DEL PEDIDO
  const handleEditProduct = (item, index) => {
    // Find the original product from productState to get full product data including customOptions
    const originalProduct = productState.allProducts.find(
      (p) => p.id === item.productId || p.id === item.id || p.name === item.name
    );

    if (!originalProduct) {
      showAlert(
        'No se encontró el producto original para modificar',
        'warning'
      );
      return;
    }

    const productOptions = getProductOptionsForUI(originalProduct);

    if (productOptions.length === 0) {
      showAlert('Este producto no tiene opciones personalizadas', 'info');
      return;
    }

    setEditingProductIndex(index);
    setEditingProduct({
      ...originalProduct,
    });
    setShowProductSelector(true);
  };

  // ✅ MODIFICAR CANTIDAD DE PRODUCTO
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;

    setOrder((prev) => ({
      ...prev,
      cartItems: prev.cartItems.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item
      ),
    }));
  };

  // ✅ ELIMINAR PRODUCTO DEL PEDIDO
  const handleRemoveProduct = (index) => {
    setOrder((prev) => ({
      ...prev,
      cartItems: prev.cartItems.filter((_, i) => i !== index),
    }));
    showAlert('Producto eliminado del pedido', 'info');
  };

  const handleCreateOrder = useCallback(async () => {
    if (!order.status) {
      showAlert('Debe seleccionar un estado para el pedido', 'warning');
      return;
    }

    if (order.cartItems.length === 0) {
      showAlert('El pedido debe tener al menos un producto', 'warning');
      return;
    }

    if (!order.clientName.trim()) {
      showAlert('El nombre del cliente es requerido', 'warning');
      return;
    }

    if (!order.clientEmail.trim()) {
      showAlert('El email del cliente es requerido', 'warning');
      return;
    }

    if (!order.contactPhone.trim()) {
      showAlert('El teléfono de contacto es requerido', 'warning');
      return;
    }

    if (!order.orderType) {
      showAlert('Debe seleccionar un tipo de entrega', 'warning');
      return;
    }

    setLoading(true);
    try {
      const createData = {
        userId: currentUser.id,
        restaurantId: currentUser.id,
        restaurantName: currentUser.businessName,
        cartItems: order.cartItems,
        totalRewardPoints: calculatedProductTotals.totalRewardPoints,
        totalRedeemPoints: calculatedProductTotals.totalRedeemPoints,
        deliverycost: cleanMoneyValue(order.deliverycost).toNumber(),
        servicetax: cleanMoneyValue(order.servicetax).toNumber(),
        discount: Number(order.discount) || 0.0,
        discountamount: calculatedDiscount.discountamount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        clientEmail: order.clientEmail,
        clientName: order.clientName,
        deliveryAddress: order.deliveryAddress,
        contactPhone: order.contactPhone,
        orderType: order.orderType,
        comentary: order.comentary,
        status: order.status,
      };

      await addOrder(createData);
      showAlert('Pedido creado correctamente!', 'success');
      onClose();
    } catch (error) {
      const errorMessage = error.message || 'Error desconocido';
      showAlert(errorMessage, 'error');
    } finally {
      setLoading(false);
      setTimeout(() => {
        refreshOrders();
      }, 1500);
    }
  }, [
    order,
    calculatedDiscount.discountamount,
    calculatedProductTotals.totalRedeemPoints,
    calculatedProductTotals.totalRewardPoints,
    currentUser.businessName,
    currentUser.id,
    showAlert,
    onClose,
    addOrder,
    refreshOrders,
  ]);

  useEffect(() => {
    if (show) {
      const initialOrder = {
        userId: currentUser.id || '',
        restaurantId: currentUser.id || '',
        restaurantName: currentUser.businessName || '',
        tableid: '',
        cartItems: [],
        totalRewardPoints: 0,
        totalRedeemPoints: 0,
        deliverycost: 0,
        servicetax: 0,
        discount: 0,
        discountamount: 0,
        totalAmount: 0,
        paymentMethod: 'MERCADO PAGO',
        clientEmail: '',
        clientName: '',
        deliveryAddress: '',
        contactPhone: '',
        orderType: '',
        comentary: '',
        status: 'PENDIENTE A CONFIRMAR',
      };
      setOrder(initialOrder);
      setOrderCopy(_.cloneDeep(initialOrder));
      setCurrentTab(0);
      setIsDiscount('SIN DESCUENTO');
    }
  }, [show, currentUser.businessName, currentUser.id]);

  if (loading) return <LoadingComponent message={'Creando pedido...'} />;

  return (
    <>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          elevation: 0,
          sx: {
            width: 'min(1180px, calc(100vw - 28px))',
            maxHeight: 'calc(100vh - 28px)',
            borderRadius: '10px',
            overflow: 'hidden',
            bgcolor: 'background.default',
            background:
              theme.palette.mode === 'dark'
                ? 'linear-gradient(180deg, #212529 0%, #2c3034 100%)'
                : 'linear-gradient(180deg, #edede9 0%, #f8f9fa 100%)',
            border: '1px solid',
            borderColor: 'rgba(184, 182, 186, 0.22)',
            boxShadow: '0 28px 90px rgba(0, 0, 0, 0.45)',
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: 'background.main',
            borderBottom: '1px solid',
            borderColor: 'rgba(184, 182, 186, 0.18)',
            p: { xs: 1.5, md: 2 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  width: { xs: 28, sm: 30 },
                  height: { xs: 28, sm: 30 },
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'rgba(184, 182, 186, 0.22)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'primary.main',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  flexShrink: 0,
                }}
              >
                <AddIcon />
              </Box>
              <Typography
                sx={{
                  fontFamily: 'fontFamily.primary',
                  color: 'text.primary',
                  fontSize: { xs: '13px', sm: '20px' },
                  lineHeight: 1,
                  whiteSpace: { xs: 'normal', sm: 'nowrap' },
                }}
              >
                CREAR NUEVO PEDIDO
              </Typography>
              <FormControl
                size="small"
                sx={{
                  minWidth: { xs: 145, sm: 205 },
                  display: { xs: 'none', sm: 'block' },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '999px',
                    bgcolor: 'primary.main',
                    color: 'text.terciary',
                    fontFamily: 'fontFamily.primary',
                    fontSize: '13px',
                    minHeight: 34,
                    '& fieldset': { borderColor: 'primary.main' },
                    '&:hover fieldset': { borderColor: 'primary.light' },
                    '&.Mui-focused fieldset': { borderColor: 'primary.light' },
                  },
                  '& .MuiSelect-icon': { color: 'text.terciary' },
                }}
              >
                <Select
                  name="status"
                  value={order.status}
                  onChange={handleInputChange}
                  renderValue={(value) => value}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {status.icon}
                        <Typography sx={{ fontFamily: 'fontFamily.terciary' }}>
                          {status.value}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Chip
                label={order.status}
                color={getStatusColor(order.status)}
                size="small"
                sx={{
                  display: { xs: 'inline-flex', sm: 'none' },
                  fontFamily: 'fontFamily.primary',
                  color: 'text.terciary',
                }}
              />
            </Box>
            <IconButton
              onClick={handleClose}
              size="small"
              sx={{ color: 'text.secondary', flexShrink: 0 }}
            >
              <CloseIcon fontSize="medium" />
            </IconButton>
          </Box>
        </DialogTitle>

        <Box
          sx={{
            bgcolor: 'background.main',
            borderBottom: '1px solid',
            borderColor: 'rgba(184, 182, 186, 0.18)',
            px: { xs: 1.5, md: 2 },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              maxWidth: 840,
            }}
          >
            {workflowSteps.map((step, index) => {
              const active = currentTab === index;
              return (
                <Button
                  key={step}
                  onClick={() => handleTabChange(index)}
                  disableRipple
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 1.2,
                    py: 1.6,
                    px: { xs: 0.5, sm: 1.5 },
                    borderRadius: 0,
                    color: active ? 'text.primary' : 'text.secondary',
                    borderBottom: active
                      ? '3px solid'
                      : '3px solid transparent',
                    borderColor: active ? 'primary.main' : 'transparent',
                    '&:hover': { bgcolor: 'rgba(245, 166, 35, 0.06)' },
                  }}
                >
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      border: '1px solid',
                      borderColor: active
                        ? 'primary.main'
                        : 'rgba(184, 182, 186, 0.25)',
                      display: 'grid',
                      placeItems: 'center',
                      color: active ? 'primary.main' : 'text.secondary',
                      fontFamily: 'fontFamily.terciary',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: 'fontFamily.primary',
                      fontSize: { xs: '12px', sm: '14px' },
                      lineHeight: 1,
                    }}
                  >
                    {step}
                  </Typography>
                </Button>
              );
            })}
          </Box>
        </Box>

        <DialogContent
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: 'background.default',
            overflow: 'auto',
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 304px' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Box
              ref={contentRef}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxHeight: '70vh',
                overflowY: 'auto',
                pr: 1,
              }}
            >
              <Box ref={orderDetailsRef}>
                <OrderDetailsTab
                  order={order}
                  setOrder={setOrder}
                  handleInputChange={handleInputChange}
                  isDiscount={isDiscount}
                  handleDiscountChange={handleDiscountChange}
                  calculatedDiscount={calculatedDiscount}
                  addServiceTax={addServiceTax}
                  setAddServiceTax={setAddServiceTax}
                  handleQuantityChange={handleQuantityChange}
                  handleRemoveProduct={handleRemoveProduct}
                  handleEditProduct={handleEditProduct}
                  setShowProductSelector={setShowProductSelector}
                />
              </Box>

              <Box ref={clientInfoRef}>
                <ClientInfoTab
                  order={order}
                  handleInputChange={handleInputChange}
                  ignoreEmail={ignoreEmail}
                  handleIgnoreEmail={handleIgnoreEmail}
                  onSearchClient={() => toggleModal('clientsData', true)}
                />
              </Box>
            </Box>

            <OrderSummary
              order={order}
              calculatedProductTotals={calculatedProductTotals}
              calculatedDiscount={calculatedDiscount}
              finalOrderTotal={finalOrderTotal}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'flex-end',
            gap: 1.5,
            p: { xs: 1.5, md: 2 },
            bgcolor: 'background.main',
            borderTop: '1px solid',
            borderColor: 'rgba(184, 182, 186, 0.18)',
          }}
        >
          <Button
            onClick={handleClose}
            variant="outlined"
            startIcon={<CloseIcon />}
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              borderColor: 'rgba(184, 182, 186, 0.35)',
              borderRadius: '8px',
              minWidth: { xs: 130, sm: 170 },
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(245, 166, 35, 0.06)',
              },
            }}
          >
            CANCELAR
          </Button>
          <Button
            onClick={handleCreateOrder}
            variant="contained"
            color="primary"
            startIcon={<CheckCircleIcon />}
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.terciary',
              borderRadius: '8px',
              minWidth: { xs: 150, sm: 190 },
              boxShadow: '0 8px 20px rgba(245, 166, 35, 0.25)',
            }}
            disabled={order.cartItems.length === 0}
          >
            CREAR PEDIDO
          </Button>
        </DialogActions>
      </Dialog>

      {showConfirmClose && (
        <ConfirmDialogClose
          showConfirmClose={showConfirmClose}
          setShowConfirmClose={setShowConfirmClose}
          handleConfirmModalClose={handleConfirmModalClose}
        />
      )}

      {/* ✅ MODAL PARA SELECCIONAR PRODUCTOS */}
      {showProductSelector && (
        <ModalSelectProducts
          open={showProductSelector}
          onClose={handleCloseProductSelector}
          onSelectProduct={
            editingProduct ? handleProductModified : handleAddProduct
          }
          products={
            editingProduct ? [editingProduct] : productState.allProducts
          }
          editingProduct={Boolean(editingProduct)}
        />
      )}

      {/* MODAL DE MOSTRAR CLIENTES */}
      {modalState.clientsData && (
        <ClientSearchModal
          show={modalState.clientsData}
          handleClose={() => toggleModal('clientsData', false)}
          restaurantId={currentUser.id}
        />
      )}
    </>
  );
};
