export const optionGroupStyle = {
    display: 'grid',
    gridTemplateColumns: {
        xs: 'repeat(2, minmax(0, 1fr))',
        lg: 'repeat(4, minmax(0, 1fr))',
    },
    gap: 1,
};

export const optionButtonStyle = (active) => ({
    width: '100%',
    minWidth: 0,
    maxWidth: '100%',
    minHeight: 48,
    borderRadius: '8px',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: active ? 'primary.main' : 'text.primary',
    bgcolor: active ? 'button.shadow' : 'background.default',
    color: active ? 'primary.main' : 'text.primary',
    display: 'flex',
    flexDirection: 'column',
    gap: 0.55,
    justifyContent: 'center',
    textTransform: 'uppercase',
    fontFamily: 'fontFamily.primary',
    fontSize: { xs: '10px', sm: '11px' },
    lineHeight: 1,
    p: { xs: 0.65, sm: 0.75 },
    transition: 'border-color 160ms ease, background-color 160ms ease',
    '& .MuiSvgIcon-root': {
        fontSize: { xs: 21, sm: 22 },
    },
    '&:hover': {
        borderColor: 'primary.main',
        bgcolor: active ? 'rgba(245, 166, 35, 0.16)' : 'rgba(245, 166, 35, 0.07)',
    },
});

export const fieldStyles = {
    '& .MuiInputBase-root': {
        fontFamily: 'fontFamily.secondary',
        fontSize: { xs: '13px', sm: '14px' },
        minHeight: { xs: '44px', sm: '48px' },
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

export const compactFieldStyles = {
    ...fieldStyles,
    '& .MuiInputBase-root': {
        ...fieldStyles['& .MuiInputBase-root'],
        minHeight: 34,
    },
    '& .MuiOutlinedInput-input': {
        py: 0.75,
        px: 1.25,
    },
    '& .MuiOutlinedInput-root.MuiInputBase-multiline': {
        py: 0.75,
        px: 1.25,
    },
    '& textarea.MuiOutlinedInput-input': {
        p: 0,
    },
};

export const labelStyle = {
    fontFamily: 'fontFamily.primary',
    color: 'text.primary',
    fontWeight: 'bold',
    fontSize: { xs: '11px', sm: '12px', md: '15px' },
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
    borderColor: 'text.primary',
    borderRadius: '8px',
    p: 1.5,
    mb: 1,
    boxShadow: '0 18px 50px rgba(0, 0, 0, 0.24)',
};

export const innerCardStyle = {
    bgcolor: 'background.default',
    border: '1px solid',
    borderColor: 'text.primary',
    borderRadius: '8px',
    p: 1,
};
