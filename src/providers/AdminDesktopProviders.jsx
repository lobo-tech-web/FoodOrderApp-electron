import { CartProvider } from '@/context/Cart.jsx';
import { LobotechThemeProvider } from '@/context/ThemeContext.jsx';
import { ProductProvider } from '@/context/Products.jsx';
import { UserProvider } from '@/context/Users.jsx';
import { OrderProvider } from '@/context/Orders.jsx';

export const AdminDesktopProviders = ({ children }) => (
  <LobotechThemeProvider>
    <ProductProvider>
      <CartProvider>
        <UserProvider>
          <OrderProvider>{children}</OrderProvider>
        </UserProvider>
      </CartProvider>
    </ProductProvider>
  </LobotechThemeProvider>
);
