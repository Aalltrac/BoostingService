import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import { Toaster } from "sonner";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import HomePage from "./pages/HomePage";
import GamePage from "./pages/GamePage";
import OrderBoostingPage from "./pages/OrderBoostingPage";
import OrderAccountPage from "./pages/OrderAccountPage";
import ChatPage from "./pages/ChatPage";
import DashboardPage from "./pages/DashboardPage";
import BecomeBoosterPage from "./pages/BecomeBoosterPage";
import BoosterCreateOfferPage from "./pages/BoosterCreateOfferPage";
import AdminPage from "./pages/AdminPage";
import CGUPage from "./pages/CGUPage";
import LandingPage from "./pages/LandingPage";

const Protected = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono-label text-xs">
        Chargement…
      </div>
    );
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const CreatorOnly = ({ children }) => {
  const { isCreator, loading } = useAuth();
  if (loading) return null;
  if (!isCreator) return <Navigate to="/games" replace />;
  return children;
};

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            theme="dark"
            position="top-right"
            toastOptions={{
              style: {
                background: "#0A0A0E",
                color: "#fff",
                border: "1px solid rgba(157,76,221,0.3)",
                borderRadius: 4,
              },
            }}
          />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/cgu" element={<Layout><CGUPage /></Layout>} />
            <Route
              path="/games"
              element={
                <Protected>
                  <Layout>
                    <HomePage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/games/:gameId"
              element={
                <Protected>
                  <Layout>
                    <GamePage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/order/boosting/:gameId/:boosterUid"
              element={
                <Protected>
                  <Layout>
                    <OrderBoostingPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/order/account/:listingId"
              element={
                <Protected>
                  <Layout>
                    <OrderAccountPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/chat/:conversationId"
              element={
                <Protected>
                  <Layout>
                    <ChatPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Protected>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/become-booster"
              element={
                <Protected>
                  <Layout>
                    <BecomeBoosterPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/booster/create"
              element={
                <Protected>
                  <Layout>
                    <BoosterCreateOfferPage />
                  </Layout>
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected>
                  <CreatorOnly>
                    <Layout>
                      <AdminPage />
                    </Layout>
                  </CreatorOnly>
                </Protected>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
