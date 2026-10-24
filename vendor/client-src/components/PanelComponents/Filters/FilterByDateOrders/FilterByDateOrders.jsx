import { useEffect, useState } from "react";

// ---- DayJS ----
import dayjs from "dayjs";
import "dayjs/locale/es";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { esES } from "@mui/x-date-pickers/locales";
// ---------------

// ---- Material UI ----
import { Box, IconButton, Tooltip } from "@mui/material";
import { FilterAltOutlined } from "@mui/icons-material";
// ---------------------

// ---- Styles ----
const auditCalendarPaperSx = {
  bgcolor: "background.main",
  color: "text.primary",
  border: "1px solid",
  borderColor: "text.primary",
  borderRadius: 2.5,
  // MES + AÑO DEL HEADER
  "& .MuiPickersCalendarHeader-label": {
    fontFamily: "fontFamily.primary",
    color: "text.primary",
    textTransform: "uppercase",
  },
  // LUN, MAR, MIÉ...
  "& .MuiDayCalendar-weekDayLabel": {
    fontFamily: "fontFamily.primary",
    color: "primary.main",
    fontSize: 14,
  },
  // DÍAS
  "& .MuiPickersDay-root": {
    fontFamily: "fontFamily.secondary",
    color: "text.primary",
    "&:hover": {
      bgcolor: "action.hover",
    },
  },
  // DÍA SELECCIONADO
  "& .MuiPickersDay-root.Mui-selected": {
    bgcolor: "primary.main",
    color: "text.terciary",
    "&:hover": {
      bgcolor: "primary.main",
    },
    "&:focus": {
      bgcolor: "primary.main",
    },
  },
  // MESES CUANDO CAMBIÁS DE VISTA
  "& .MuiMonthCalendar-button": {
    fontFamily: "fontFamily.secondary",
    color: "text.primary",
  },
  // AÑOS
  "& .MuiYearCalendar-button": {
    fontFamily: "fontFamily.secondary",
    color: "text.primary",
  },
  // FLECHAS DEL CALENDARIO
  "& .MuiIconButton-root": {
    color: "text.primary",
  },
};
// ----------------

export const FilterByDateOrders = ({
  period,
  date,
  onChange,
  disabled = false,
}) => {
  const [draft, setDraft] = useState(() => dayjs(date));
  const [dateError, setDateError] = useState(null);

  useEffect(() => {
    setDraft(dayjs(date));
    setDateError(null);
  }, [date, period]);

  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        gap: 1,
      }}
    >
      {period !== "all" && (
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="es"
          localeText={
            esES.components.MuiLocalizationProvider.defaultProps.localeText
          }
        >
          <DatePicker
            key={period}
            label={period === "month" ? "Mes de pedidos" : "Fecha de pedidos"}
            views={
              period === "month" ? ["year", "month"] : ["year", "month", "day"]
            }
            format={period === "month" ? "MM-YYYY" : "DD-MM-YYYY"}
            value={draft}
            onChange={setDraft}
            onError={setDateError}
            disabled={disabled}
            slotProps={{
              textField: {
                size: "small",
                error: Boolean(dateError),
                helperText: dateError ? "Ingresá una fecha válida" : undefined,
                sx: { width: period === "month" ? 165 : 185 },
              },
              desktopPaper: { sx: auditCalendarPaperSx },
              mobilePaper: { sx: auditCalendarPaperSx },
            }}
          />

          <Tooltip title="Filtrar fecha">
            <Box component="span">
              <IconButton
                aria-label="Filtrar fecha"
                color="primary"
                disabled={disabled || !draft?.isValid() || Boolean(dateError)}
                onClick={() =>
                  onChange({ period, date: draft.format("YYYY-MM-DD") })
                }
                sx={{
                  width: 40,
                  height: 40,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                }}
              >
                <FilterAltOutlined />
              </IconButton>
            </Box>
          </Tooltip>
        </LocalizationProvider>
      )}
    </Box>
  );
};
