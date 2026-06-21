import { Box, TextField } from '@mui/material';
// ICONS
import {
  Person as PersonIcon,
  Badge as BadgeIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  Comment as CommentIcon,
} from '@mui/icons-material';
// ---------------------

// ---- Shared ----
import { ModalSection } from '../../shared/ModalSection.jsx';
import { ClientInfoBox } from '../../shared/ClientInfoBox.jsx';
// ----------------

// ---- Styles ----
import { fieldStyles } from '../../styles/modalEditOrder.styles.js';
// ----------------

export const ClientInfoSection = ({
  order,
  handleInputChange,
  handleQuickEditOpen,
}) => {
  return (
    <ModalSection
      title="Datos del cliente"
      icon={<PersonIcon color="primary" />}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 1.2,
        }}
      >
        <ClientInfoBox
          icon={<BadgeIcon fontSize="small" color="primary" />}
          label="Nombre"
          value={order.clientName}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: 'order',
              field: 'clientName',
              value: order.clientName,
            })
          }
        />

        <ClientInfoBox
          icon={<EmailIcon fontSize="small" color="primary" />}
          label="Email"
          value={order.clientEmail}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: 'order',
              field: 'clientEmail',
              value: order.clientEmail,
            })
          }
        />

        <ClientInfoBox
          icon={<PhoneIcon fontSize="small" color="primary" />}
          label="Tel"
          value={order.contactPhone}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: 'order',
              field: 'contactPhone',
              value: order.contactPhone,
            })
          }
        />

        <ClientInfoBox
          icon={<HomeIcon fontSize="small" color="primary" />}
          label="Domicilio"
          value={order.deliveryAddress}
          onEdit={(event) =>
            handleQuickEditOpen(event, {
              target: 'order',
              field: 'deliveryAddress',
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
          value={order?.comentary || ''}
          onChange={handleInputChange}
          sx={fieldStyles}
        />
      </ModalSection>
    </ModalSection>
  );
};
