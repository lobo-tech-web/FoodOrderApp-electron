// ---- CONTEXT ----
import { CartProvider } from './context/Cart.jsx';
import { ProductProvider } from './context/Products.jsx';
import { UserProvider } from './context/Users.jsx';
import { OrderProvider } from './context/Orders.jsx';
import { LoginModalProvider } from './context/LoginContext.jsx';
import { RegisterModalProvider } from './context/RegisterContext.jsx';
// -----------------

export const AppProviders = ({ children }) => (
  <ProductProvider>
    <CartProvider>
      <UserProvider>
        <OrderProvider>
          <LoginModalProvider>
            <RegisterModalProvider>{children}</RegisterModalProvider>
          </LoginModalProvider>
        </OrderProvider>
      </UserProvider>
    </CartProvider>
  </ProductProvider>
);
