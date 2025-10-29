// src/App.js
/**
 * @fileoverview Componente raiz da aplicação.
 * Configura o roteamento principal, o provedor de autenticação e o layout básico
 * da aplicação, incluindo cabeçalho e área de conteúdo principal.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import PatientManagementPage from './pages/PatientManagementPage';
import NewMedicalRecordPage from './pages/NewMedicalRecordPage';
import AllRecordsListPage from './pages/AllRecordsListPage';
import './App.css';

/**
 * Componente de Rota Protegida.
 * Verifica se o usuário está autenticado antes de renderizar os componentes filhos.
 * Se o usuário não estiver autenticado, redireciona para a página de login.
 * Exibe uma mensagem de carregamento enquanto o estado de autenticação está sendo verificado.
 *
 * @param {object} props - Propriedades do componente.
 * @param {React.ReactNode} props.children - Os componentes filhos a serem renderizados se o usuário estiver autenticado.
 * @returns {JSX.Element} Retorna os componentes filhos se autenticado, um redirecionamento para a página de login, ou uma mensagem de carregamento.
 */
const ProtectedRoute = ({ children }) => {
  /** @type {{isAuthenticated: boolean, isLoadingAuth: boolean}} */
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return <div className="loading-app">Verificando autenticação...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * Componente DashboardPlaceholder.
 * Exibe o painel principal da aplicação após o login do usuário.
 * Apresenta cards de navegação para as seções principais, como gerenciamento de pacientes
 * e visualização de prontuários.
 * @returns {JSX.Element} O elemento JSX do painel principal.
 */
const DashboardPlaceholder = () => {
  /** @type {{user: import('./contexts/AuthContext').User|null, logout: function(): void}} */
  const { user, logout } = useAuth();

  // URLs para as imagens dos cards.
  // Recomenda-se o uso de imagens locais (armazenadas na pasta `public/images`)
  // ou a importação de componentes SVG para melhor controle e performance.
  // Exemplo com imagem local: const pacientesImageUrl = "/images/pacientes-icon.svg";
  const pacientesImageUrl = "/images/pacientes.png"; // Caminho para a imagem local
  const prontuariosImageUrl = "/images/prontuario.png"; // Caminho para a imagem local

  return (
    <div className="dashboard-container">
      <h2>Painel Principal</h2>
      <p className="welcome-message">Bem-vindo(a), {user?.name || 'Não identificado'}!</p>

      <div className="dashboard-cards-container">
        {/* Card para Gerenciar Pacientes */}
        <Link to="/pacientes" className="dashboard-card-link">
          <div className="dashboard-card">
            <img
              src={pacientesImageUrl}
              alt="Ícone de Gerenciamento de Pacientes"
              className="dashboard-card-image"
              onError={(e) => { 
                e.target.onerror = null; // Previne loop de erro se a imagem de fallback também falhar
                e.target.src="https://placehold.co/300x200/cccccc/FFFFFF?text=Imagem+Indispon%C3%ADvel"; 
              }}
            />
            <div className="dashboard-card-title">
              Gerenciar Pacientes
            </div>
          </div>
        </Link>

        {/* Card para Visualizar Prontuários */}
        <Link to="/prontuarios-todos" className="dashboard-card-link">
          <div className="dashboard-card">
            <img
              src={prontuariosImageUrl}
              alt="Ícone de Visualizar Prontuários"
              className="dashboard-card-image"
              onError={(e) => { 
                e.target.onerror = null; 
                e.target.src="https://placehold.co/300x200/cccccc/FFFFFF?text=Imagem+Indispon%C3%ADvel"; 
              }}
            />
            <div className="dashboard-card-title">
              Visualizar Prontuários
            </div>
          </div>
        </Link>
        {/* Outros cards para funcionalidades futuras podem ser adicionados aqui. */}
      </div>

      <button onClick={logout} className="logout-button">Sair</button>
    </div>
  );
};

/**
 * Componente AppContent.
 * Define a estrutura de rotas da aplicação usando `react-router-dom`.
 * Gerencia a renderização dos componentes de página com base na URL atual
 * e no estado de autenticação do usuário.
 * @returns {JSX.Element} O conjunto de rotas da aplicação.
 */
const AppContent = () => {
  /** @type {{isAuthenticated: boolean, isLoadingAuth: boolean}} */
  const { isAuthenticated, isLoadingAuth } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated && !isLoadingAuth ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPlaceholder />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pacientes"
        element={
          <ProtectedRoute>
            <PatientManagementPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/paciente/:patientId/novo-prontuario"
        element={
          <ProtectedRoute>
            <NewMedicalRecordPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/prontuarios-todos"
        element={
          <ProtectedRoute>
            <AllRecordsListPage />
          </ProtectedRoute>
        }
      />
      {/* Rota curinga para redirecionar usuários com base no estado de autenticação. */}
      <Route
        path="*"
        element={
          isLoadingAuth ? <div className="loading-app">Carregando...</div> :
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
  );
};

/**
 * Componente principal e raiz da aplicação React.
 * Envolve toda a aplicação com o `Router` para habilitar o roteamento e
 * com o `AuthProvider` para disponibilizar o contexto de autenticação.
 * @returns {JSX.Element} A estrutura completa da aplicação.
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <header className="App-header">
            <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
              <h1>Casa de Acompanhamento Espiritual</h1>
            </Link>
          </header>
          <main>
            <AppContent />
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
