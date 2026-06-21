import React, { createContext, useContext, useState } from 'react';

const RegisterModalContext = createContext();

export const RegisterModalProvider = ({ children }) => {
  const [openRegister, setOpenRegister] = useState(false);

  const openRegisterModal = () => setOpenRegister(true);
  const closeRegisterModal = () => setOpenRegister(false);

  return (
    <RegisterModalContext.Provider
      value={{ openRegister, openRegisterModal, closeRegisterModal }}
    >
      {children}
    </RegisterModalContext.Provider>
  );
};

export const useRegisterModal = () => useContext(RegisterModalContext);
