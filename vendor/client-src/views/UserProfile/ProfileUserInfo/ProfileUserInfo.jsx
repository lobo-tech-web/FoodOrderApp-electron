import { useState } from 'react';

import {
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  Stack,
  Divider,
  Avatar,
  Fade,
} from '@mui/material';
import {
  Email,
  Business,
  Phone,
  Home,
  LocationCity,
  Public,
  MarkunreadMailbox,
  WhatsApp,
  Payment,
  Person,
} from '@mui/icons-material';

// INFORMACION DE LA TARJETA
const InfoItem = ({ icon, label, value }) => (
  <ListItem
    sx={{
      px: 0,
      py: 1.5,
      borderRadius: 2,
      '&:hover': {
        bgcolor: 'action.hover',
      },
    }}
  >
    <ListItemIcon sx={{ minWidth: 48 }}>
      <Avatar
        sx={{
          bgcolor: 'background.main',
          width: 40,
          height: 40,
          color: 'primary.main',
        }}
      >
        {icon}
      </Avatar>
    </ListItemIcon>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        variant="caption"
        sx={{
          fontFamily: 'fontFamily.secondary',
          color: 'text.secondary',
          display: 'block',
          textTransform: 'uppercase',
          fontSize: '0.75 rem',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontFamily: 'fontFamily.secondary',
          color: 'text.primary',
          wordBreak: 'break-word',
        }}
      >
        {value || 'No especificado'}
      </Typography>
    </Box>
  </ListItem>
);

// TARJETA
const SectionCard = ({ title, icon, children, elevation = 2 }) => (
  <Card
    elevation={elevation}
    sx={{
      borderRadius: 3,
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      '&:hover': {
        boxShadow: 6,
        transform: 'translateY(-2px)',
      },
    }}
  >
    <Box
      sx={{
        bgcolor: 'primary.main',
        py: 2,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Avatar
        sx={{
          bgcolor: 'background.main',
          color: 'primary.main',
          width: 32,
          height: 32,
        }}
      >
        {icon}
      </Avatar>
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'text.terciary',
        }}
      >
        {title}
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

export const ProfileUserInfo = ({ user }) => {
  const [showAnimation, setShowAnimation] = useState(true);

  return (
    <Fade in={showAnimation} timeout={600}>
      <Box>
        {/* Información de contacto */}
        <Stack spacing={3}>
          <SectionCard title="Información de Contacto" icon={<Person />}>
            <List disablePadding>
              <InfoItem icon={<Email />} label="EMAIL" value={user.email} />
              <Divider variant="inset" component="li" />
              <InfoItem
                icon={<Business />}
                label="CUIT/CUIL/DNI"
                value={user.cuit}
              />
              <Divider variant="inset" component="li" />
              <InfoItem icon={<Phone />} label="TEL." value={user.phone} />
              {user.whatsappNumber && (
                <>
                  <Divider variant="inset" component="li" />
                  <InfoItem
                    icon={<WhatsApp />}
                    label="WHATSAPP"
                    value={user.whatsappNumber}
                  />
                </>
              )}
            </List>
          </SectionCard>

          <SectionCard title="Información de Ubicación" icon={<LocationCity />}>
            <List disablePadding>
              <InfoItem
                icon={<Home />}
                label="DIRECCIÓN"
                value={user.address}
              />
              <Divider variant="inset" component="li" />
              <InfoItem
                icon={<LocationCity />}
                label="LOCALIDAD"
                value={user.city}
              />
              <Divider variant="inset" component="li" />
              <InfoItem
                icon={<Public />}
                label="PROVINCIA"
                value={user.state}
              />
              <Divider variant="inset" component="li" />
              <InfoItem
                icon={<MarkunreadMailbox />}
                label="CP"
                value={user.postalCode}
              />
            </List>
          </SectionCard>

          {(user.mercadoPagoLink || user.transferPaymentAlias) && (
            <SectionCard title="Información de Pagos" icon={<Payment />}>
              <List disablePadding>
                {user.mercadoPagoLink && (
                  <>
                    <InfoItem
                      icon={<Payment />}
                      label="MERCADO PAGO"
                      value={user.mercadoPagoLink}
                    />
                    {user.transferPaymentAlias && (
                      <Divider variant="inset" component="li" />
                    )}
                  </>
                )}

                {user.transferPaymentAlias && (
                  <InfoItem
                    icon={<Payment />}
                    label="ALIAS BANCARIO"
                    value={user.transferPaymentAlias}
                  />
                )}
              </List>
            </SectionCard>
          )}
        </Stack>
      </Box>
    </Fade>
  );
};
