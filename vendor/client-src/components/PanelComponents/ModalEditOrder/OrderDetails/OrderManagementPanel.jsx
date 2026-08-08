import { Stack } from "@mui/material";

// ---- Sections ----
import { CartProductSection } from "./sections/CartProductSection.jsx";
import { ClientInfoSection } from "./sections/ClientInfoSection.jsx";
import { InfoSection } from "./sections/InfoSection.jsx";
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
  originalStatus,
  cancelReason,
  setCancelReason,
  editCapabilities,
  availableStatuses,
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
        originalStatus={originalStatus}
        cancelReason={cancelReason}
        setCancelReason={setCancelReason}
        editCapabilities={editCapabilities}
        availableStatuses={availableStatuses}
      />

      <CartProductSection
        order={order}
        handleEditProduct={handleEditProduct}
        handleQuantityChange={handleQuantityChange}
        handleRemoveProduct={handleRemoveProduct}
        setShowProductSelector={setShowProductSelector}
        handleQuickEditOpen={handleQuickEditOpen}
        editCapabilities={editCapabilities}
      />

      <ClientInfoSection
        order={order}
        handleInputChange={handleInputChange}
        handleQuickEditOpen={handleQuickEditOpen}
        editCapabilities={editCapabilities}
      />
    </Stack>
  );
};
