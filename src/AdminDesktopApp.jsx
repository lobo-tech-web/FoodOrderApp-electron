import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AdminLogin } from "./components/AdminLogin/AdminLogin.jsx";
import { LocalOrders } from "./components/LocalOrders/LocalOrders.jsx";
import { AdminPanel } from "@/views/ControlPanel/AdminPanel/AdminPanel.jsx";
import { PrinterConfigModal } from "@/components/PanelComponents/ModalEditOrder/PrinterConfig/PrinterConfigModal.jsx";
import { useUser } from "@/context/Users.jsx";

const ElectronBridge = ({ onOpenPrinterConfig }) => {
  const navigate = useNavigate();
  const { userState } = useUser();

  useEffect(() => {
    if (!window.electronAPI?.onNavigate) return undefined;

    return window.electronAPI.onNavigate((path) => {
      const user = userState.user || {};
      navigate(user.id && user.role === "admin" ? path : "/");
    });
  }, [navigate, userState.user]);

  useEffect(() => {
    if (!window.electronAPI?.onOpenPrinterConfig) return undefined;

    return window.electronAPI.onOpenPrinterConfig(onOpenPrinterConfig);
  }, [onOpenPrinterConfig]);

  return null;
};

export const AdminDesktopApp = () => {
  const [printerConfigOpen, setPrinterConfigOpen] = useState(false);

  return (
    <>
      <ElectronBridge onOpenPrinterConfig={() => setPrinterConfigOpen(true)} />
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/control-panel" element={<AdminPanel />} />
        <Route path="/local-orders" element={<LocalOrders />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <PrinterConfigModal
        open={printerConfigOpen}
        onClose={() => setPrinterConfigOpen(false)}
      />
    </>
  );
};
