import "@fontsource/roboto";
import { Route, Routes } from "react-router-dom";

// ---- VIEWS ----
import { AdminPanel } from "@/views/ControlPanel/AdminPanel/AdminPanel.jsx";
import { DevPanel } from "@/views/ControlPanel/DevPanel/DevPanel.jsx";
import { StaffPanel } from "@/views/ControlPanel/StaffPanel/StaffPanel.jsx";
import { ContactUs } from "@/views/LoboTech/ContactUs/ContactUs.jsx";
import { MainPage } from "@/views/LoboTech/MainPage/MainPage.jsx";
import { MenuPage } from "@/views/LoboTech/MenuPage/MenuPage.jsx";
import { PlansPage } from "@/views/LoboTech/PlansPage/PlansPage.jsx";
import { UserProfile } from "@/views/UserProfile/UserProfile.jsx";
// ---------------

// ---- COMPONENTS ----
import { Login } from "@/components/Login/Login.jsx";
import { Register } from "@/components/Register/Register.jsx";
import { LoginStaff } from "./components/LoginStaff/LoginStaff.jsx";
// --------------------

// ---- CONTEXT ----
import { useLoginModal } from "@/context/LoginContext.jsx";
import { useRegisterModal } from "@/context/RegisterContext.jsx";
// -----------------

// ---- TORO BURGER ----
import { ToroOrderPreview } from "@/views/Client-views/ToroBurger/ToroOrderPreview/ToroOrderPreview.jsx";
import { ToroProductsPage } from "@/views/Client-views/ToroBurger/ToroProductsPage/ToroProductsPage.jsx";
// ---------------

// ---- TASTING COFFE ----
import { TastingCoffeOrderPreview } from "./views/Client-views/TastingCoffe/TastingCoffeOrderPreview/TastingCoffeOrderPreview.jsx";
import { TastingCoffeProductsPage } from "./views/Client-views/TastingCoffe/TastingCoffeProductsPage/TastingCoffeProductsPage.jsx";
// -----------------------

// ---- DOLCE SUCURSAL MITRE ----
import { DolceSMOrderPreview } from "./views/Client-views/DolceSucursalMitre/DolceSMOrderPreview/DolceSMOrderPreview.jsx";
import { DolceSMProductsPage } from "./views/Client-views/DolceSucursalMitre/DolceSMProductsPage/DolceSMProductsPage.jsx";
// ------------------------------

// ---- LA NACION ----
import { LaNacionOrderPreview } from "./views/Client-views/LaNacion/LaNacionOrderPreview/LaNacionOrderPreview.jsx";
import { LaNacionProductsPage } from "./views/Client-views/LaNacion/LaNacionProductsPage/LaNacionProductsPage.jsx";
// -------------------

// ---- CASANOVA ----
import { CasanovaOrderPreview } from "./views/Client-views/Casanova/CasanovaOrderPreview/CasanovaOrderPreview.jsx";
import { CasanovaProductsPage } from "./views/Client-views/Casanova/CasanovaProductsPage/CasanovaProductsPage.jsx";
// ------------------

// ---- WANNA SABORES ----
import { WannaSaboresOrderPreview } from "./views/Client-views/WannaSabores/WannaSaboresOrderPreview/WannaSaboresOrderPreview.jsx";
import { WannaSaboresProductsPage } from "./views/Client-views/WannaSabores/WannaSaboresProductsPage/WannaSaboresProductsPage.jsx";
// ------------------

function App() {
  // ---- HOOKS ----
  const { openLogin, closeLoginModal } = useLoginModal();
  const { openRegister, closeRegisterModal } = useRegisterModal();

  return (
    <div className="App">
      <div className="content">
        <Routes>
          <Route path="/" element={<MainPage />}></Route>
          <Route path="/menu-digital" element={<MenuPage />}></Route>
          <Route path="/contact-us" element={<ContactUs />}></Route>
          <Route path="/pricing-plan" element={<PlansPage />}></Route>
          <Route path="/control-panel" element={<AdminPanel />}></Route>
          <Route path="/dev-control-panel" element={<DevPanel />}></Route>
          <Route path="/login-staff" element={<LoginStaff />} />
          <Route path="/staff-panel" element={<StaffPanel />} />
          <Route path="/account" element={<UserProfile />}></Route>
          {/* TORO BURGER */}
          <Route
            path="/menu/toro-burger"
            element={<ToroProductsPage />}
          ></Route>
          <Route
            path="/menu/toro-burger/cart"
            element={<ToroOrderPreview />}
          ></Route>
          {/* TASTING COFFE */}
          <Route
            path="/menu/tasting-coffe"
            element={<TastingCoffeProductsPage />}
          ></Route>
          <Route
            path="/menu/tasting-coffe/cart"
            element={<TastingCoffeOrderPreview />}
          ></Route>
          {/* DOLCE SUCURSAL MITRE */}
          <Route
            path="/menu/dolce-mitre"
            element={<DolceSMProductsPage />}
          ></Route>
          <Route
            path="/menu/dolce-mitre/cart"
            element={<DolceSMOrderPreview />}
          ></Route>
          {/* LA NACION */}
          <Route
            path="/menu/la-nacion"
            element={<LaNacionProductsPage />}
          ></Route>
          <Route
            path="/menu/la-nacion/cart"
            element={<LaNacionOrderPreview />}
          ></Route>
          {/* CASANOVA */}
          <Route
            path="/menu/casanova"
            element={<CasanovaProductsPage />}
          ></Route>
          <Route
            path="/menu/casanova/cart"
            element={<CasanovaOrderPreview />}
          ></Route>
          {/* WANNA SABORES */}
          <Route
            path="/menu/wanna-sabores"
            element={<WannaSaboresProductsPage />}
          ></Route>
          <Route
            path="/menu/wanna-sabores/cart"
            element={<WannaSaboresOrderPreview />}
          ></Route>
        </Routes>
        {/* MODAL DE LOGIN / REGISTER */}
        <Login open={openLogin} onClose={closeLoginModal} />
        <Register open={openRegister} onClose={closeRegisterModal} />
      </div>
    </div>
  );
}
export default App;
