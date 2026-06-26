export const buttonStyle1 = {
    fontFamily: 'fontFamily.terciary',
    fontSize: { xs: '0.80rem', md: '0.9rem' },
    py: 1.5,
    px: 4,
    borderRadius: 8,
    background:
        'linear-gradient(45deg, #f5a623 30%, #f8e71c 90%)',
    color: '#000',
    fontWeight: 'bold',
    boxShadow: '0 4px 20px rgba(245, 166, 35, 0.5)',
    transition: 'all 0.3s',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 6px 25px rgba(245, 166, 35, 0.6)',
    },
}