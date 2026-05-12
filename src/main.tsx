import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ActivityTypeProvider } from "./context/ActivityTypeContext.tsx";
import { CharacterProvider } from "./context/CharacterContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <ActivityTypeProvider>
          <CharacterProvider>
            <App />
          </CharacterProvider>
        </ActivityTypeProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
