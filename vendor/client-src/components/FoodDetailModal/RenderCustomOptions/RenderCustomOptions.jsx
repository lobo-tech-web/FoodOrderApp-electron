import { useMemo } from 'react';

// ---- MATERIAL UI ----
import {
  Paper,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Stack,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
// ICONS
import { Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
// ---------------------

// ---- COMPONENTS ----
import { RenderCustomLabels } from '../RenderCustomLabel/RenderCustomLabel.jsx';
// --------------------

import { isSelectionLimitEnabled } from '@/utils/migrateCustomOptions.js';

const OptionItemLabel = ({ item }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'fontFamily.secondary',
          color: 'text.terciary',
          fontSize: {
            xs: '0.80rem',
            sm: '1rem',
          },
        }}
      >
        {item.name}
        {Number(item.extraCost) > 0 && <span> +${item.extraCost}</span>}
      </Typography>

      <Box>
        {item.isVeggie && (
          <Tooltip title="Vegetariano" arrow>
            <RenderCustomLabels isActive={item.isVeggie} isVeggie={true} />
          </Tooltip>
        )}

        {item.isSinTacc && (
          <Tooltip title="Sin TACC" arrow>
            <RenderCustomLabels isActive={item.isSinTacc} isVeggie={false} />
          </Tooltip>
        )}
      </Box>
    </Box>
  );
};

export const RenderCustomOptions = ({
  option,
  optionKey,
  customizations,
  handleCustomizationChange,
}) => {
  const getItemKey = (item) => item.id || item.name;

  const sortedItems = useMemo(() => {
    return [...(option.items || [])]
      .filter((item) => item.status !== false)
      .sort((a, b) => {
        const priorityA = Number(a.priority ?? 999);
        const priorityB = Number(b.priority ?? 999);

        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        return String(a.name || '').localeCompare(String(b.name || ''));
      });
  }, [option.items]);

  const isRequired =
    option.required ||
    Number(option.minSelected || 0) > 0 ||
    option.type === 'unique';

  const isLimitEnabled = isSelectionLimitEnabled(option);

  const minSelected = Number(option.minSelected || 0);
  const maxSelected = Number(option.maxSelected || 0);

  const currentOptionTotal = Object.values(
    customizations[optionKey] || {}
  ).reduce((sum, value) => sum + Number(value || 0), 0);

  return (
    <Paper
      key={optionKey}
      elevation={1}
      sx={{
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      {/* TITULO DE LA OPCIÓN */}
      <Typography
        variant="h6"
        sx={{
          fontFamily: 'fontFamily.terciary',
          color: 'text.primary',
          fontSize: { xs: '0.85rem', sm: '1rem' },
          borderBottom: '2px solid',
          borderColor: 'primary.main',
          pb: 1,
          mb: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {option.name}

        {/* Mostrar límite mínimo si existe o si es requerido */}
        {isRequired && (
          <Chip
            label={minSelected > 0 ? `Mín. ${minSelected}` : 'Requerido'}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {isLimitEnabled && maxSelected > 0 && option.type !== 'unique' && (
          <Chip
            label={`Máx. ${maxSelected}`}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Typography>

      {/* CUSTOM OPTION DE TIPO UNICO */}
      {option.type === 'unique' && (
        <RadioGroup
          value={
            Object.entries(customizations[optionKey] || {}).find(
              ([, value]) => Number(value) > 0
            )?.[0] || ''
          }
          onChange={(e) =>
            handleCustomizationChange(optionKey, e.target.value, true, option)
          }
        >
          {sortedItems.map((item) => {
            const itemKey = getItemKey(item);
            return (
              <FormControlLabel
                key={itemKey}
                value={itemKey}
                control={
                  <Radio
                    sx={{
                      color: 'text.primary',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={<OptionItemLabel item={item} />}
              />
            );
          })}
        </RadioGroup>
      )}

      {/* CUSTOM OPTION DE TIPO CHECKBOX */}
      {option.type === 'checkbox' && (
        <Stack spacing={1}>
          {sortedItems.map((item) => {
            const itemKey = getItemKey(item);

            const checked = !!customizations[optionKey]?.[itemKey];

            const disableByMax =
              !checked &&
              isLimitEnabled &&
              maxSelected > 0 &&
              currentOptionTotal >= maxSelected;

            return (
              <FormControlLabel
                key={itemKey}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                }}
                control={
                  <Checkbox
                    checked={!!customizations[optionKey]?.[itemKey]}
                    disabled={disableByMax}
                    onChange={(e) =>
                      handleCustomizationChange(
                        optionKey,
                        itemKey,
                        e.target.checked,
                        option
                      )
                    }
                    sx={{
                      color: 'text.primary',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label={<OptionItemLabel item={item} />}
              />
            );
          })}
        </Stack>
      )}

      {/* CUSTOM OPTION DE TIPO EXTRA MEJORADO */}
      {option.type === 'extra' && (
        <Stack spacing={1}>
          {sortedItems.map((item) => {
            const itemKey = getItemKey(item);
            const currentQuantity =
              Number(customizations[optionKey]?.[itemKey]) || 0;

            const canAddThisItem =
              !isLimitEnabled ||
              !maxSelected ||
              currentOptionTotal < maxSelected;
            return (
              <Box
                key={itemKey}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderRadius: 1,
                }}
              >
                <OptionItemLabel item={item} />

                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <IconButton
                    onClick={() =>
                      handleCustomizationChange(
                        optionKey,
                        itemKey,
                        currentQuantity - 1,
                        option
                      )
                    }
                    disabled={currentQuantity === 0}
                    size="small"
                    sx={{
                      color: 'text.terciary',
                      '&:disabled': {
                        color: 'action.disabled',
                      },
                    }}
                  >
                    <RemoveIcon
                      sx={{
                        fontSize: {
                          xs: '1rem',
                          sm: '1.2rem',
                        },
                      }}
                    />
                  </IconButton>

                  <Typography
                    sx={{
                      mx: 1,
                      fontFamily: 'fontFamily.secondary',
                      color: 'text.terciary',
                      minWidth: '20px',
                      textAlign: 'center',
                      fontSize: {
                        xs: '0.85rem',
                        sm: '1rem',
                      },
                      fontWeight: currentQuantity > 0 ? 'bold' : 'normal',
                    }}
                  >
                    {currentQuantity}
                  </Typography>

                  <IconButton
                    onClick={() =>
                      handleCustomizationChange(
                        optionKey,
                        itemKey,
                        currentQuantity + 1,
                        option
                      )
                    }
                    disabled={!canAddThisItem}
                    size="small"
                    sx={{
                      color: canAddThisItem
                        ? 'text.terciary'
                        : 'action.disabled',
                      '&:disabled': {
                        color: 'action.disabled',
                      },
                    }}
                  >
                    <AddIcon
                      sx={{
                        fontSize: {
                          xs: '1rem',
                          sm: '1.2rem',
                        },
                      }}
                    />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};
