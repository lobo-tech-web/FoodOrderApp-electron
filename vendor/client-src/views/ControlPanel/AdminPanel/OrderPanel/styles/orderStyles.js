export const tableHeadStyle = {
    fontFamily: "fontFamily.primary",
    color: "primary.main",
    textAlign: "center",
};

export const tableBodyStyle = {
    fontFamily: "fontFamily.secondary",
    fontSize: "0.85rem",
    color: "text.primary",
    textAlign: "center",
    py: 1.5,
};

export const auditCalendarPaperSx = {
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