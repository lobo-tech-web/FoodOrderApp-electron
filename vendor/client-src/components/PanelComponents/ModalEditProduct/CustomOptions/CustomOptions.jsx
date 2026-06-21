// ---- MATERIAL UI ----
import {
  Box,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
// ---------------------

export const CustomOptions = ({ selectedOptions }) => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: '1px solid rgba(184,182,186,0.22)',
        borderRadius: 2,
        mt: 2,
      }}
    >
      {selectedOptions.length > 0 ? (
        <Typography
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            mb: 1,
          }}
        >
          Opciones personalizadas asignadas
        </Typography>
      ) : (
        <Typography
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            mb: 1,
          }}
        >
          No tienes personalizado este producto.
        </Typography>
      )}

      {selectedOptions.length > 0 &&
        selectedOptions.map((option) => {
          return (
            <Box key={option.id} sx={{ mb: 3 }}>
              <Typography
                sx={{ fontFamily: 'fontFamily.primary', color: 'text.primary' }}
              >
                {option.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Tipo: {option.type}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mb: 1 }}
              >
                Disponible: {option.status ? 'Sí' : 'No'}
              </Typography>

              {/* Configuración asignada */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                  },
                  gap: 1,
                  mb: 1.5,
                }}
              >
                <Typography variant="body2">
                  Prioridad: {option?.ProductCustomOption.priority}
                </Typography>

                <Typography variant="body2">
                  Requerida:{' '}
                  {option?.ProductCustomOption.required ? 'Sí' : 'No'}
                </Typography>

                <Typography variant="body2">
                  Mínimo seleccionado:{' '}
                  {option?.ProductCustomOption.minSelected || 0}
                </Typography>

                <Typography variant="body2">
                  Máximo seleccionado:{' '}
                  {option?.ProductCustomOption.maxSelected || 0}
                </Typography>
              </Box>

              {/* Items */}
              <Typography
                sx={{
                  fontFamily: 'fontFamily.secondary',
                  fontSize: 13,
                  mb: 0.5,
                }}
              >
                Ítems incluidos:
              </Typography>

              {option.items.length > 0 && (
                <List dense sx={{ pl: 1 }}>
                  {option.items.map((item) => (
                    <ListItem key={item.id} disableGutters>
                      <ListItemText
                        primary={`${item.name}${
                          Number(item.extraCost) > 0
                            ? ` (+$${item.extraCost})`
                            : ' ( $ 0 )'
                        }`}
                        secondary={`Prioridad item: ${item.priority} Disponible: ${item.status ? 'Si' : 'No'}`}
                        primaryTypographyProps={{
                          fontSize: 12,
                        }}
                        secondaryTypographyProps={{
                          fontSize: 10,
                          color: 'text.secondary',
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              )}

              <Divider sx={{ mt: 2 }} />
            </Box>
          );
        })}
    </Paper>
  );
};
