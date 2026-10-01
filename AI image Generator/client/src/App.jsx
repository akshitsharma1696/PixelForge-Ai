import styled, { ThemeProvider } from "styled-components";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { darkTheme } from "./utils/Theme";
import { AppProvider } from "./context/AppContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Community from "./pages/Community";
import Create from "./pages/Create";
import Library from "./pages/Library";
import Billing from "./pages/Billing";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Social from "./pages/Social";
import Profile from "./pages/Profile";

const Root = styled.div`
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  overflow: hidden;
`;

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <AppProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(18, 18, 24, 0.88)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              color: "#F3F4F6",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "14px",
              boxShadow: "0 12px 36px 0 rgba(0, 0, 0, 0.5), 0 0 16px 0 rgba(139, 92, 246, 0.2)",
              padding: "12px 18px",
              fontSize: "14px",
              fontWeight: 500,
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#0a0a0a",
              },
              style: {
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#0a0a0a",
              },
              style: {
                border: "1px solid rgba(239, 68, 68, 0.3)",
              },
            },
          }}
        />
        <Root>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Auth mode="login" />} />
              <Route path="/signup" element={<Auth mode="signup" />} />

              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/community" element={<Community />} />
                <Route path="/billing" element={<Billing />} />
                <Route
                  path="/create"
                  element={
                    <ProtectedRoute>
                      <Create />
                    </ProtectedRoute>
                  }
                />                                                                                                                                                                                                                                                                                                                                               nmmmmmmmmmmmmmmm
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <Library />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/social"
                  element={
                    <ProtectedRoute>
                      <Social />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/u/:username"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route path="/post" element={<Navigate to="/create" replace />} />
                <Route path="/gallery" element={<Navigate to="/community" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </Root>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
