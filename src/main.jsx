import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";

import "@fontsource/roboto";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import "@/main.css";
import "./renderer.css";

const DesktopRoot = lazy(() =>
  import("./DesktopRoot.jsx").then((module) => ({
    default: module.DesktopRoot,
  })),
);

const StartupMessage = ({ children }) => (
  <div
    style={{
      minHeight: "100vh",
      boxSizing: "border-box",
      padding: 32,
      backgroundColor: "#ffffff",
      color: "#111111",
      fontFamily: "Arial, sans-serif",
    }}
  >
    {children}
  </div>
);

class DesktopErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("Error al iniciar Electron:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <StartupMessage>
          <h2>No se pudo iniciar la aplicación</h2>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
            }}
          >
            {this.state.error.message || String(this.state.error)}
          </pre>

          <button onClick={() => window.location.reload()}>Reintentar</button>
        </StartupMessage>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <DesktopErrorBoundary>
      <Suspense
        fallback={<StartupMessage>Cargando aplicación…</StartupMessage>}
      >
        <HashRouter>
          <DesktopRoot />
        </HashRouter>
      </Suspense>
    </DesktopErrorBoundary>
  </React.StrictMode>,
);
