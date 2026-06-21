import { useMemo, useState } from 'react';

// ---- MATERIAL UI ----
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
// ICONS
import {
  Category as CategoryIcon,
  LocalDrink as LocalDrinkIcon,
  RestaurantMenu as RestaurantMenuIcon,
  Sell as SellIcon,
  Fastfood as FastfoodIcon,
} from '@mui/icons-material';
// ---------------------

// ---- UTILS ----
import { formatCurrency } from '@/utils/orderCalculations.js';
import {
  buildCategoryRows,
  buildCustomOptionCategoryRows,
  buildFriesSummary,
  buildCustomOptionGroupsForTables,
  buildDrinkRows,
  buildTopCustomOptionsRows,
} from '@/utils/statsReportUtils.js';
// ---------------

const tableHeadStyle = {
  color: 'primary.main',
  textAlign: 'center',
  fontFamily: 'fontFamily.primary',
};

const tableBodyStyle = {
  color: 'text.primary',
  textAlign: 'center',
  fontFamily: 'fontFamily.secondary',
};

const getMonthLabel = (stats) =>
  `${stats?.date?.monthName || 'Mes'} - ${stats?.date?.year || ''}`;

const SummaryMetric = ({ icon, label, value }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
      minHeight: 96,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {icon}
      <Typography
        variant="body2"
        sx={{
          fontFamily: 'fontFamily.primary',
          color: 'primary.main',
        }}
      >
        {label}
      </Typography>
    </Box>
    <Typography
      variant="h5"
      sx={{
        fontFamily: 'fontFamily.terciary',
        color: 'text.primary',
      }}
    >
      {value}
    </Typography>
  </Paper>
);

const ReportTableCard = ({ title, children, maxHeight = 360 }) => (
  <Paper
    sx={{
      width: '100%',
      borderRadius: 2,
      overflow: 'hidden',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
    }}
  >
    <Typography
      variant="h6"
      sx={{
        fontFamily: 'fontFamily.primary',
        color: 'text.primary',
        textAlign: 'center',
        px: 2,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {title}
    </Typography>

    <TableContainer
      sx={{
        maxHeight,
        overflowX: 'auto',
        '&::-webkit-scrollbar': {
          height: 8,
          width: 8,
        },
        '&::-webkit-scrollbar-thumb': {
          bgcolor: 'primary.main',
          borderRadius: 2,
        },
      }}
    >
      {children}
    </TableContainer>
  </Paper>
);

export const CategorySalesReport = ({ monthlyStats }) => {
  const [selectedMonthKey, setSelectedMonthKey] = useState('');

  const reportOptions = useMemo(
    () =>
      monthlyStats.map((stats) => ({
        key: `${stats?.date?.year}-${stats?.date?.month}`,
        label: getMonthLabel(stats),
        stats,
      })),
    [monthlyStats]
  );

  const selectedReport = useMemo(() => {
    if (reportOptions.length === 0) return null;
    return (
      reportOptions.find((option) => option.key === selectedMonthKey)?.stats ||
      reportOptions[0].stats
    );
  }, [reportOptions, selectedMonthKey]);

  const categoryRows = useMemo(
    () => buildCategoryRows(selectedReport?.productsByCategory || {}),
    [selectedReport]
  );

  const drinkRows = useMemo(
    () =>
      buildDrinkRows({
        productsByCategory: selectedReport?.productsByCategory || {},
        groupedCustomOptionsNormalized:
          selectedReport?.groupedCustomOptionsNormalized || [],
        groupedCustomOptions: selectedReport?.groupedCustomOptions || [],
      }),
    [selectedReport]
  );

  const customOptionCategoryRows = useMemo(
    () =>
      buildCustomOptionCategoryRows(
        selectedReport?.groupedCustomOptionsNormalized || []
      ),
    [selectedReport]
  );

  const friesSummary = useMemo(
    () =>
      buildFriesSummary(selectedReport?.groupedCustomOptionsNormalized || []),
    [selectedReport]
  );

  const customOptionGroupsForTables = useMemo(
    () =>
      buildCustomOptionGroupsForTables(
        selectedReport?.groupedCustomOptionsNormalized || []
      ),
    [selectedReport]
  );

  const topCustomOptions = useMemo(
    () => buildTopCustomOptionsRows(selectedReport?.groupedCustomOptions || []),
    [selectedReport]
  );

  const topProducts = useMemo(
    () => selectedReport?.productsSales?.slice(0, 10) || [],
    [selectedReport]
  );

  if (!selectedReport) {
    return (
      <Typography
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          paddingTop: '10rem',
          fontFamily: 'fontFamily.primary',
        }}
      >
        NO HAY REPORTES MENSUALES DISPONIBLES.
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'center' }}
          justifyContent="space-between"
        >
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: 'fontFamily.primary',
                color: 'text.primary',
              }}
            >
              REPORTE DE VENTAS POR CATEGORIA
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.secondary',
              }}
            >
              Datos calculados con pedidos finalizados del mes seleccionado.
            </Typography>
          </Box>

          <FormControl sx={{ minWidth: { xs: '100%', md: 260 } }}>
            <InputLabel id="category-report-month-label">
              Mes del reporte
            </InputLabel>
            <Select
              labelId="category-report-month-label"
              value={selectedMonthKey || reportOptions[0]?.key || ''}
              label="Mes del reporte"
              onChange={(event) => setSelectedMonthKey(event.target.value)}
              sx={{
                fontFamily: 'fontFamily.secondary',
                color: 'text.primary',
              }}
            >
              {reportOptions.map((option) => (
                <MenuItem key={option.key} value={option.key}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
          gap: 2,
          mb: 2,
        }}
      >
        <SummaryMetric
          icon={<SellIcon color="primary" />}
          label="Venta total"
          value={formatCurrency(selectedReport?.totalAmount || 0)}
        />
        <SummaryMetric
          icon={<RestaurantMenuIcon color="primary" />}
          label="Unidades vendidas"
          value={selectedReport?.totalProductsSold || 0}
        />
        <SummaryMetric
          icon={<CategoryIcon color="primary" />}
          label="Categorias con venta"
          value={categoryRows.length}
        />
        <SummaryMetric
          icon={<FastfoodIcon color="primary" />}
          label="Papas vendidas"
          value={friesSummary.quantity}
        />
        <SummaryMetric
          icon={<LocalDrinkIcon color="primary" />}
          label="Tipos de bebida"
          value={drinkRows.length}
        />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', xl: '1.2fr 0.8fr' },
          gap: 2,
        }}
      >
        <Paper
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              textAlign: 'center',
              m: 2,
            }}
          >
            VENTAS POR CATEGORIA
          </Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.paper' }}>
                <TableRow>
                  <TableCell sx={tableHeadStyle}>CATEGORIA</TableCell>
                  <TableCell sx={tableHeadStyle}>UNIDADES</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                  <TableCell sx={tableHeadStyle}>
                    PRODUCTO MAS VENDIDO
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: 'background.default' }}>
                {categoryRows.map((row) => {
                  const topProduct = row.products[0];

                  return (
                    <TableRow key={row.categoryName}>
                      <TableCell sx={tableBodyStyle}>
                        {row.categoryName.toUpperCase()}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {row.totalQuantity}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {formatCurrency(row.totalAmount)}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {topProduct
                          ? `${topProduct.name} (${topProduct.quantity})`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper
          sx={{
            width: '100%',
            borderRadius: 2,
            overflow: 'hidden',
            bgcolor: 'background.paper',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontFamily: 'fontFamily.primary',
              color: 'text.primary',
              textAlign: 'center',
              m: 2,
            }}
          >
            BEBIDAS POR TIPO
          </Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'background.paper' }}>
                <TableRow>
                  <TableCell sx={tableHeadStyle}>BEBIDA</TableCell>
                  <TableCell sx={tableHeadStyle}>CANT.</TableCell>
                  <TableCell sx={tableHeadStyle}>ORIGEN</TableCell>
                  <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ bgcolor: 'background.default' }}>
                {drinkRows.length > 0 ? (
                  drinkRows.map((drink) => (
                    <TableRow key={drink.name}>
                      <TableCell sx={tableBodyStyle}>
                        {drink.name.toUpperCase()}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {drink.quantity}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {drink.sourcesLabel}
                      </TableCell>
                      <TableCell sx={tableBodyStyle}>
                        {formatCurrency(drink.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} sx={tableBodyStyle}>
                      NO HAY BEBIDAS DETECTADAS EN ESTE MES.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'primary.main',
            mb: 2,
            textAlign: 'center',
          }}
        >
          EXTRAS / OPCIONES VENDIDAS
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: 'repeat(2, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {customOptionGroupsForTables.length > 0 ? (
            customOptionGroupsForTables.map((group) => (
              <ReportTableCard
                key={group.key}
                title={`${group.label} - ${group.quantity} u.`}
                maxHeight={320}
              >
                <Table stickyHeader size="small" sx={{ minWidth: 520 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={tableHeadStyle}>ITEM</TableCell>
                      <TableCell sx={tableHeadStyle}>OPCIÓN</TableCell>
                      <TableCell sx={tableHeadStyle}>CANT.</TableCell>
                      <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody sx={{ bgcolor: 'background.default' }}>
                    {group.rows.map((row) => (
                      <TableRow key={`${group.key}-${row.itemId || row.name}`}>
                        <TableCell sx={tableBodyStyle}>
                          {String(row.name || '').toUpperCase()}

                          {row.varieties?.length > 0 && (
                            <Typography
                              variant="caption"
                              sx={{
                                display: 'block',
                                fontFamily: 'fontFamily.secondary',
                                color: 'text.secondary',
                                mt: 0.5,
                              }}
                            >
                              Incluye: {row.varieties.join(', ')}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          {row.optionName || '-'}
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          {row.effectiveQuantity ?? row.quantity ?? 0}
                        </TableCell>

                        <TableCell sx={tableBodyStyle}>
                          {formatCurrency(row.totalCost || 0)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ReportTableCard>
            ))
          ) : (
            <Paper
              sx={{
                p: 3,
                textAlign: 'center',
                bgcolor: 'background.paper',
                gridColumn: '1 / -1',
              }}
            >
              <Typography sx={{ fontFamily: 'fontFamily.primary' }}>
                NO HAY EXTRAS DETECTADOS EN ESTE PERIODO.
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      <Paper
        sx={{
          width: '100%',
          mt: 2,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.primary',
            textAlign: 'center',
            m: 2,
          }}
        >
          TOP 10 PRODUCTOS DEL MES
        </Typography>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 600 }}>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell sx={tableHeadStyle}>PRODUCTO</TableCell>
                <TableCell sx={tableHeadStyle}>UNIDADES</TableCell>
                <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ bgcolor: 'background.default' }}>
              {topProducts.map((product) => (
                <TableRow key={product.name}>
                  <TableCell sx={tableBodyStyle}>
                    {product.name.toUpperCase()}
                  </TableCell>
                  <TableCell sx={tableBodyStyle}>{product.quantity}</TableCell>
                  <TableCell sx={tableBodyStyle}>
                    {formatCurrency(product.totalPrice)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Paper
        sx={{
          width: '100%',
          mt: 2,
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: 'fontFamily.primary',
            color: 'text.primary',
            textAlign: 'center',
            m: 2,
          }}
        >
          TOP 10 EXTRAS / OPCIONES
        </Typography>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell sx={tableHeadStyle}>ITEM</TableCell>
                <TableCell sx={tableHeadStyle}>CANT.</TableCell>
                <TableCell sx={tableHeadStyle}>OPCIONES</TableCell>
                <TableCell sx={tableHeadStyle}>TOTAL</TableCell>
              </TableRow>
            </TableHead>

            <TableBody sx={{ bgcolor: 'background.default' }}>
              {topCustomOptions.length > 0 ? (
                topCustomOptions.slice(0, 10).map((option) => (
                  <TableRow key={option.name}>
                    <TableCell sx={tableBodyStyle}>
                      {String(option.name || '').toUpperCase()}
                    </TableCell>

                    <TableCell sx={tableBodyStyle}>{option.quantity}</TableCell>

                    <TableCell sx={tableBodyStyle}>
                      {option.optionNames?.length > 0
                        ? option.optionNames.join(', ')
                        : '-'}
                    </TableCell>

                    <TableCell sx={tableBodyStyle}>
                      {formatCurrency(option.totalCost || 0)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} sx={tableBodyStyle}>
                    NO HAY EXTRAS DETECTADOS EN ESTE PERIODO.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};
