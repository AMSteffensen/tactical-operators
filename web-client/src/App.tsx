
import { Routes, Route, useLocation } from 'react-router-dom';
import { GameProvider } from './state/GameContext';
import { AuthProvider } from './contexts/AuthContext';
import { Navigation } from './components/navigation/Navigation';
import { ProtectedRoute, PublicOnlyRoute } from './components/auth/ProtectedRoute';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Home } from './features/Home';
import { ResponsiveGame } from './features/ResponsiveGame';
import { SingleCharacterGame } from './features/SingleCharacterGame';
import { Character } from './features/character/Character';
import { Guild } from './features/guild/Guild';
import { Campaign } from './features/campaign/Campaign';

function App() {
  const location = useLocation();
  const isGameRoute = ['/game', '/single-game'].includes(location.pathname);
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <AuthProvider>
      <GameProvider>
        <div className="app">
          {!isGameRoute && !isAuthRoute && <Navigation />}
          <main className={isGameRoute ? "game-main" : isAuthRoute ? "auth-main" : "main-content"}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              
              {/* Auth routes - redirect if already logged in */}
              <Route 
                path="/login" 
                element={
                  <PublicOnlyRoute>
                    <LoginForm />
                  </PublicOnlyRoute>
                } 
              />
              <Route 
                path="/register" 
                element={
                  <PublicOnlyRoute>
                    <RegisterForm />
                  </PublicOnlyRoute>
                } 
              />
              
              {/* Protected routes - require authentication */}
              <Route 
                path="/game" 
                element={
                  <ProtectedRoute>
                    <ResponsiveGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/single-game" 
                element={
                  <ProtectedRoute>
                    <SingleCharacterGame />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/characters" 
                element={
                  <ProtectedRoute>
                    <Character />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/character" 
                element={
                  <ProtectedRoute>
                    <Character />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/guild" 
                element={
                  <ProtectedRoute>
                    <Guild />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/campaign" 
                element={
                  <ProtectedRoute>
                    <Campaign />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
