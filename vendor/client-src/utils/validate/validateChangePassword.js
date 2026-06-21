export const changePasswordValidate = (confirmNewPassword, input) => {
    const error = {}

    if (!input.password) error.password = "Ingrese su contraseña actual";
    if (input.newPassword && input.newPassword.length > 0 && input.newPassword.length < 5)
        error.newPassword = "La nueva contraseña debe ser de al menos 5 caracteres";
    if (confirmNewPassword && confirmNewPassword.length > 0 && confirmNewPassword !== input.newPassword)
        error.confirmNewPassword = "La contraseña nueva no coincide con la confirmación de la contraseña";

    return error;
}