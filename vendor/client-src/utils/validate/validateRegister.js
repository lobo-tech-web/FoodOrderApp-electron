export const validateRegister = (form, confirmPassword) => {
    const errors = {};

    // VALIDAMOS EL EMAIL
    if (form.email.trim()) {
        if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = 'Email inválido';
    }

    // VALIDAMOS EL NOMBRE DEL USUARIO
    if (form.email.trim() && !form.name.trim()) errors.name = 'El nombre es obligatorio';

    // VALIDAMOS EL PASSWORD DEL USUARIO
    if (form.name.trim() && !form.password.trim()) {
        errors.password = 'La contraseña es obligatoria';
    } else if (form.password && form.password.length < 5) {
        errors.password = 'Debe tener al menos 5 caracteres';
    }

    // VALIDAMOS LA CONFIRMACIÓN DEL PASSWORD
    if (form.password && !confirmPassword.trim()) {
        errors.confirmPassword = 'Debe repetir la contraseña';
    } else if (form.password && confirmPassword && form.password !== confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    // VALIDAMOS EL CUIT / CUIL / DNI
    if (confirmPassword && !form.cuit.trim()) errors.cuit = 'El CUIT/CUIL/DNI es obligatorio';
    else if (form.cuit.trim() && !/^\d+$/.test(form.cuit.trim())) errors.cuit = 'El CUIT/CUIL/DNI debe contener solo números';

    // VALIDAMOS EL TELÉFONO
    if (form.cuit.trim() && !form.phone.trim()) errors.phone = 'El teléfono es obligatorio';
    else if (form.phone.trim() && !/^\d+$/.test(form.phone.trim())) errors.phone = 'El teléfono debe contener solo números';

    // VALIDAMOS LA DIRECCIÓN
    if (form.phone.trim() && !form.address.trim()) errors.address = 'La dirección es obligatoria';

    // VALIDAMOS LA CIUDAD
    if (form.address.trim() && !form.city.trim()) errors.city = 'La ciudad es obligatoria';

    // VALIDAMOS LA PROVINCIA
    if (form.city.trim() && !form.state.trim()) errors.state = 'La provincia es obligatoria';

    // VALIDAMOS EL CP
    if (form.state.trim() && !form.postalCode.trim()) errors.postalCode = 'El código postal es obligatorio';

    return errors;
};