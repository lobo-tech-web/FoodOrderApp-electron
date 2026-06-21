import { Stack } from '@mui/material';

// ---- Sections ----
import { InfoSection } from './sections/InfoSection.jsx';
import { CartProductSection } from './sections/CartProductSection.jsx';
import { ClientInfoSection } from './sections/ClientInfoSection.jsx';
// ------------------

export const OrderManagementPanel = ({
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
  handleEditProduct,
  handleQuantityChange,
  handleRemoveProduct,
  setShowProductSelector,
  handleQuickEditOpen,
}) => {
  return (
    <Stack spacing={{ xs: 1.2, sm: 1.4 }}>
      <InfoSection
        order={order}
        setOrder={setOrder}
        handleInputChange={handleInputChange}
        isDiscount={isDiscount}
        handleDiscountChange={handleDiscountChange}
        availableRiders={availableRiders}
        editingRider={editingRider}
        selectedRider={selectedRider}
        setEditingRider={setEditingRider}
        setOpenSelectRider={setOpenSelectRider}
        openSelectRider={openSelectRider}
      />

      <CartProductSection
        order={order}
        handleEditProduct={handleEditProduct}
        handleQuantityChange={handleQuantityChange}
        handleRemoveProduct={handleRemoveProduct}
        setShowProductSelector={setShowProductSelector}
        handleQuickEditOpen={handleQuickEditOpen}
      />

      <ClientInfoSection
        order={order}
        handleInputChange={handleInputChange}
        handleQuickEditOpen={handleQuickEditOpen}
      />
    </Stack>
  );
};
