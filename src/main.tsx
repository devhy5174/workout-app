import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "./context/ThemeContext.tsx";
import { ActivityTypeProvider } from "./context/ActivityTypeContext.tsx";
import { CharacterProvider } from "./context/CharacterContext.tsx";
import { UserProvider } from "./context/UserContext.tsx";
import { PremiumProvider } from "./context/PremiumContext.tsx";
import { ActiveBubbleProvider } from "./context/ActiveBubbleContext.tsx";
import { ActiveFrameProvider } from "./context/ActiveFrameContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <PremiumProvider>
          <ActiveBubbleProvider>
            <ActiveFrameProvider>
            <ActivityTypeProvider>
              <CharacterProvider>
                <App />
              </CharacterProvider>
            </ActivityTypeProvider>
            </ActiveFrameProvider>
          </ActiveBubbleProvider>
        </PremiumProvider>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>,
);
