export const fieldStyles = {
    fontFamily: 'fontFamily.primary',
    width: '100%',
    '& .MuiInputBase-root': {
        minHeight: { xs: 40, sm: 44, md: 46 },
        borderRadius: '10px',
        fontFamily: 'fontFamily.primary',
        color: 'text.primary',
        bgcolor: 'background.default',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'background.default',
        },
        '&:hover fieldset': {
            borderColor: 'primary.main',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
            boxShadow: '0 0 0 2px rgba(245, 158, 11, 0.18)',
        },
    },
    '& .MuiInputBase-input': {
        fontFamily: 'fontFamily.terciary',
        py: { xs: 0.8, sm: 0.9 },
        fontSize: { xs: '0.78rem', sm: '0.85rem', md: '0.9rem' },
        fontWeight: 700,
    },
    '& .MuiSelect-select': {
        py: { xs: 0.8, sm: 0.9 },
        display: 'flex',
        alignItems: 'center',
    },
    '& .MuiInputAdornment-root svg': {
        fontSize: { xs: '1rem', sm: '1.1rem' },
    },
};

export const labelStyle = {
    fontFamily: 'fontFamily.primary',
    color: 'text.primary',
    fontWeight: 800,
    fontSize: { xs: '11px', sm: '12px' },
    letterSpacing: '0.7px',
    textTransform: 'uppercase',
    mb: 1,
};

export const labelContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 0.5, sm: 1, md: 1 },
    mb: { xs: 0.5, sm: 1, md: 0.5 },
};

export const sectionTitleStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 0.8,
    fontFamily: 'fontFamily.primary',
    color: 'primary.main',
    fontWeight: 900,
    fontSize: { xs: '14px', sm: '16px', md: '17px' },
    textTransform: 'uppercase',
};

export const panelSx = {
    bgcolor: 'background.main',
    border: '1px solid',
    borderColor: 'primary.main',
    borderRadius: { xs: '14px', md: '18px' },
};

export const actionButtonSx = {
    minHeight: 42,
    borderRadius: '12px',
    fontFamily: 'fontFamily.terciary',
    fontWeight: 900,
    letterSpacing: '0.4px',
};

export const sectionInfoCardStyle = {
    p: { xs: 1.4, sm: 1.6 },
    borderRadius: 3,
    bgcolor: "background.main",
    border: "1px solid",
    borderColor: "rgba(245, 166, 35, 0.28)",
    minWidth: 0,
};

export const sectionInfoHeaderStyle = {
    display: "flex",
    alignItems: "center",
    gap: 1,
    mb: 1.4,
};

export const sectionInfoTitleStyle = {
    fontFamily: "fontFamily.primary",
    color: "text.primary",
    fontSize: { xs: "0.82rem", sm: "0.9rem" },
    fontWeight: 900,
    textTransform: "uppercase",
    lineHeight: 1,
};

export const optionInfoGridStyle = {
    display: "grid",
    gap: 1,
};