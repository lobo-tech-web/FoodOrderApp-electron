import { useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  Stack,
  Card,
  Typography,
  IconButton,
  Button,
  useTheme,
} from '@mui/material';
import {
  Instagram,
  Facebook,
  WhatsApp,
  Share,
  LocationOn,
} from '@mui/icons-material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
// <--------------------

// ---- CONTEXT ----
import { useProducts } from '@/context/Products.jsx';
// <----------------

// ---- COMPONENTS ----
import { WorkingHours } from './WorkingHours/WorkingHours.jsx';
import { QRCodeHover } from '../CustomQRCode/QRCodeHover.jsx';
import { generateProductCatalogPDF } from '@/views/ControlPanel/AdminPanel/ProductPanel/CreateCatalog/CreateCatalog.jsx';
// --------------------

export const ClientProfileBanner = ({
  logo,
  clientInformation,
  clientWorkingHours,
  clientURL,
}) => {
  const theme = useTheme();
  // Función para abrir las redes sociales en nuevas pestañas
  const handleClickSocial = (url) => {
    window.open(url, '_blank', 'noopener noreferrer');
  };

  const handleShare = (restaurantURL) => {
    const pageTitle = document.title;
    if (navigator.share) {
      navigator
        .share({
          title: pageTitle,
          url: restaurantURL,
        })
        .catch((error) => console.log('Error al compartir:', error));
    } else {
      navigator.clipboard
        .writeText(restaurantURL)
        .then(() => alert('Enlace copiado al portapapeles'))
        .catch((err) => console.error('Error al copiar: ', err));
    }
  };

  const { productState } = useProducts();

  // TRAEMOS LOS PRODUCTOS DEL CONTEXT
  const allProducts = useMemo(
    () => productState.products || [],
    [productState.products]
  );

  const handleGenerateCatalog = async () => {
    try {
      await generateProductCatalogPDF(allProducts, clientInformation?.title);
    } catch (error) {
      console.error('Error al generar el catálogo:', error);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        mt: { xs: 1, sm: 2 },
        mb: { xs: 1, sm: 2 },
      }}
    >
      <Card
        sx={{
          bgcolor: 'background.default',
          borderRadius: { xs: 6, md: 8 },
          width: '100%',
          maxWidth: '1200px',
          p: { xs: 1, sm: 1.5, md: 2 },
          m: 1,
          overflow: 'visible',
        }}
      >
        {/* CONTENEDOR PRINCIPAL: Cambia de Vertical (Column) a Horizontal (Row) en tablets (sm) */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 3, sm: 4, md: 6 }}
          alignItems={{ xs: 'center', sm: 'flex-start' }}
        >
          {/* 1. SECCIÓN LOGO */}
          <Box
            sx={{
              width: { xs: '140px', sm: '180px', md: '220px' },
              flexShrink: 0, // Evita que el logo se achique
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.05))',
              }}
            />
          </Box>

          {/* 2. SECCIÓN INFO CENTRAL (Crecimiento flexible) */}
          <Stack
            spacing={2}
            sx={{
              flexGrow: 1,
              width: '100%',
              textAlign: { xs: 'center', sm: 'left' },
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'center', md: 'center' }}
              spacing={1.5}
            >
              <Typography
                variant="h4"
                sx={{
                  fontFamily: 'fontFamily.primary',
                  color: 'text.primary',
                  letterSpacing: '-0.5px',
                }}
              >
                {clientInformation?.title}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
                maxWidth: '700px',
                lineHeight: 1.2,
              }}
            >
              {clientInformation?.description}
            </Typography>

            <Stack
              direction="row"
              spacing={0.5}
              justifyContent={{ xs: 'center', sm: 'flex-start' }}
              alignItems="center"
            >
              <LocationOn fontSize="small" color="text.primary" />
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  color: 'text.primary',
                }}
              >
                {clientInformation?.location}
              </Typography>
            </Stack>

            <Box>
              <Button
                variant="contained"
                sx={{
                  px: 4,
                  py: 1.2,
                  borderRadius: 10,
                  textTransform: 'none',
                  fontFamily: 'fontFamily.secondary',
                  fontSize: '0.9rem',
                  bgcolor: 'primary.main',
                  color: 'primary.secondary',
                }}
              >
                {clientInformation?.orderButtonDescription}
              </Button>
            </Box>

            {/* INFORMACION EXTRA DEL LOCAL */}
            {clientInformation.extraInformation && (
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'fontFamily.secondary',
                    color: 'text.terciary',
                    fontSize: '0.9rem',
                    lineHeight: 1.2,
                  }}
                >
                  {clientInformation.extraInformation}
                </Typography>
                {clientInformation.extraLink && (
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() =>
                      (window.location.href = clientInformation.extraLink)
                    }
                  >
                    <InsertLinkIcon />
                  </IconButton>
                )}
              </Box>
            )}
          </Stack>

          {/* 3. SECCIÓN ACCIONES Y HORARIOS (Alineada a la derecha en desktop) */}
          <Stack
            spacing={3}
            alignItems={{ xs: 'center', sm: 'flex-end' }}
            sx={{
              minWidth: { sm: '200px', md: '260px' },
              pt: { sm: 1 },
            }}
          >
            {/* Redes Sociales en un contenedor limpio */}
            <Stack direction="row" spacing={1}>
              {clientInformation?.socialMedia?.instagram && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    handleClickSocial(clientInformation.socialMedia.instagram)
                  }
                >
                  <Instagram />
                </IconButton>
              )}
              {clientInformation?.socialMedia?.facebook && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    handleClickSocial(clientInformation.socialMedia.facebook)
                  }
                >
                  <Facebook />
                </IconButton>
              )}
              {clientInformation?.socialMedia?.whatsapp && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    handleClickSocial(clientInformation.socialMedia.whatsapp)
                  }
                >
                  <WhatsApp />
                </IconButton>
              )}
              {clientInformation?.socialMedia?.share && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() =>
                    handleShare(clientInformation.socialMedia.share)
                  }
                >
                  <Share />
                </IconButton>
              )}
              {clientInformation?.socialMedia?.catalog && (
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => handleGenerateCatalog()}
                >
                  <PictureAsPdfIcon />
                </IconButton>
              )}
              {clientURL && (
                <QRCodeHover
                  url={clientURL}
                  logo={logo}
                  icon={
                    <QrCodeScannerIcon
                      sx={{
                        bgcolor: 'none',
                        color: 'text.primary',
                      }}
                    />
                  }
                />
              )}
            </Stack>

            <Box sx={{ width: '100%' }}>
              <WorkingHours clientWorkingHours={clientWorkingHours} />
            </Box>
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
};
