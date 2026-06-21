import { createContext, useContext, useState } from 'react';

const LoginModalContext = createContext();

export const LoginModalProvider = ({ children }) => {
  const [openLogin, setOpenLogin] = useState(false);

  const openLoginModal = () => setOpenLogin(true);
  const closeLoginModal = () => setOpenLogin(false);

  return (
    <LoginModalContext.Provider
      value={{ openLogin, openLoginModal, closeLoginModal }}
    >
      {children}
    </LoginModalContext.Provider>
  );
};

export const useLoginModal = () => useContext(LoginModalContext);
