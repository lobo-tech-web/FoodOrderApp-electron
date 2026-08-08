import { Box, TextField } from "@mui/material";
// ICONS
import {
  Badge as BadgeIcon,
  Comment as CommentIcon,
  Email as EmailIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
// ---------------------

// ---- Shared ----
import { ClientInfoBox } from "../../shared/ClientInfoBox.jsx";
import { ModalSection } from "../../shared/ModalSection.jsx";
// ----------------

// ---- Styles ----
import { fieldStyles } from "../../styles/modalEditOrder.styles.js";
// ----------------

export const ClientInfoSection = ({
  order,
  handleInputChange,
  handleQuickEditOpen,
  editCapabilities,
}) => {
  return (
    <ModalSection
      title="Datos del cliente"
      icon={<PersonIcon color="primary" />}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
          },
          gap: 1.2,
        }}
      >
        <ClientInfoBox
          icon={<BadgeIcon fontSize="small" color="primary" />}
          label="Nombre"
          value={order.clientName}
          onDisable={!editCapabilities.canEditClient}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: "order",
              field: "clientName",
              value: order.clientName,
            })
          }
        />

        <ClientInfoBox
          icon={<EmailIcon fontSize="small" color="primary" />}
          label="Email"
          value={order.clientEmail}
          onDisable={!editCapabilities.canEditClient}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: "order",
              field: "clientEmail",
              value: order.clientEmail,
            })
          }
        />

        <ClientInfoBox
          icon={<PhoneIcon fontSize="small" color="primary" />}
          label="Tel"
          value={order.contactPhone}
          onDisable={!editCapabilities.canEditClient}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: "order",
              field: "contactPhone",
              value: order.contactPhone,
            })
          }
        />

        <ClientInfoBox
          icon={<HomeIcon fontSize="small" color="primary" />}
          label="Domicilio"
          value={order.deliveryAddress}
          onDisable={!editCapabilities.canEditClient}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: "order",
              field: "deliveryAddress",
              value: order.deliveryAddress,
            })
          }
        />
      </Box>

      <ModalSection
        title="Comentarios del pedido"
        icon={<CommentIcon color="primary" />}
        sx={{ mt: 2 }}
      >
        <TextField
          fullWidth
          multiline
          rows={2}
          placeholder="Agregar comentarios especiales para el pedido..."
          name="comentary"
          value={order?.comentary || ""}
          disabled={!editCapabilities.canEditCommentary}
          onChange={handleInputChange}
          sx={fieldStyles}
        />
      </ModalSection>
    </ModalSection>
  );
};
