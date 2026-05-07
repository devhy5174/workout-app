import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { CharacterProvider } from "./context/CharacterContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <CharacterProvider>
        <App />
      </CharacterProvider>
    </ThemeProvider>
  </StrictMode>,
);
