import { Alert, Button, CircularProgress, Stack, Typography } from "@mui/material";

export const TotemRecoveryStep = ({ error, onRecover }) => (
  <Stack spacing={2} alignItems="center" sx={{ p: 4 }}>
    <CircularProgress />
    <Typography role="status">Verificando compras pendientes...</Typography>
    {error && <Alert severity="warning">{error}</Alert>}
    <Button onClick={onRecover}>Reintentar</Button>
  </Stack>
);
