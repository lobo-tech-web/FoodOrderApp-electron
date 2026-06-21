// ---- Icons ----
import {
  Pending as PendingIcon,
  FactCheck as FactCheckIcon,
  DeliveryDining as DeliveryDiningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
// ---------------

export const statusOptions = [
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
