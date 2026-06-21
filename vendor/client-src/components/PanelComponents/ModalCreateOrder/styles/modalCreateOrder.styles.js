export const optionButtonStyle = (active) => ({
    minHeight: { xs: 82, sm: 74 },
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: active ? 'primary.main' : 'rgba(184, 182, 186, 0.22)',
    bgcolor: active ? 'rgba(245, 166, 35, 0.12)' : 'rgba(255, 255, 255, 0.03)',
    color: active ? 'primary.main' : 'text.primary',
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    justifyContent: 'center',
    textTransform: 'uppercase',
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '11px', sm: '12px' },
    lineHeight: 1.15,
    p: 1,
    transition: 'border-color 160ms ease, background-color 160ms ease',
    '& .MuiSvgIcon-root': {
        fontSize: { xs: 26, sm: 25 },
    },
    '&:hover': {
        borderColor: 'primary.main',
        bgcolor: active ? 'rgba(245, 166, 35, 0.16)' : 'rgba(245, 166, 35, 0.07)',
    },
});

export const fieldStyles = {
    '& .MuiInputBase-root': {
        fontFamily: 'fontFamily.secondary',
        fontSize: { xs: '13px', sm: '14px', md: '14px' },
        minHeight: { xs: '44px', sm: '48px', md: '48px' },
        color: 'text.primary',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '8px',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: 'rgba(184, 182, 186, 0.3)',
            borderWidth: '1px',
        },
        '&:hover fieldset': {
            borderColor: 'primary.main',
            borderWidth: '1px',
        },
        '&.Mui-focused fieldset': {
            borderColor: 'primary.main',
            borderWidth: '2px',
            boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
        },
    },
    '& .MuiInputAdornment-root .MuiSvgIcon-root': {
        color: 'secondary.main',
    },
    '& .MuiFormHelperText-root': {
        fontFamily: 'fontFamily.secondary',
        color: 'text.secondary',
        ml: 0,
    },
    width: '100%',
    marginBottom: 0,
};

export const labelStyle = {
    fontFamily: 'fontFamily.primary',
    color: 'text.primary',
    fontWeight: 'bold',
    fontSize: { xs: '11px', sm: '12px', md: '12px' },
    lineHeight: 1,
    letterSpacing: 0,
};

export const labelContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    mb: 0.75,
};

export const sectionCardStyle = {
    bgcolor: 'background.paper',
    border: '1px solid',
    borderColor: 'rgba(184, 182, 186, 0.22)',
    borderRadius: '8px',
    p: { xs: 1.5, md: 2 },
    mb: { xs: 1, md: 2 },
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.24)',
};

export const innerCardStyle = {
    bgcolor: 'rgba(33, 37, 41, 0.72)',
    border: '1px solid',
    borderColor: 'rgba(184, 182, 186, 0.18)',
    borderRadius: '8px',
    p: { xs: 1.5, md: 2 },
};