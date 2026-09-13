export const textFieldStyle = {
    '& .MuiInputBase-root': {
        fontSize: { xs: '14px', sm: '16px', md: '16px' },
        minHeight: { xs: '48px', sm: '56px', md: '56px' },
        color: 'text.primary',
        bgcolor: 'background.default',
        borderRadius: { xs: '8px', sm: '12px' },
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
    fontFamily: 'fontFamily.secondary',
    width: '100%',
    marginBottom: { xs: '3px', sm: '5px', md: '5px' },
};

export const labelStyle = {
    fontFamily: 'fontFamily.primary',
    color: 'primary.main',
    fontWeight: 'bold',
    fontSize: { xs: '14px', sm: '16px', md: '16px' },
    lineHeight: 1,
    mb: 0,
};

export const labelContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: { xs: 1, sm: 1.5, md: 1.5 },
    mb: { xs: 1, sm: 1.5, md: 1 },
};