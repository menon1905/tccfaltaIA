import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { LoginForm } from './components/LoginForm';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Estoque } from './pages/Estoque';
import { Vendas } from './pages/Vendas';
import { Compras } from './pages/Compras';
import { CRM } from './pages/CRM';
import { Financeiro } from './pages/Financeiro';
import { Relatorios } from './pages/Relatorios';
import { AIAssistant } from './pages/AIAssistant';
import { AIRecommendations } from './pages/AIRecommendations';
import { AuthCallback } from './components/AuthCallback';
import { Comunidade } from './pages/Comunidade';
import { Ajuda } from './pages/Ajuda';

import { RH } from './pages/RH';

import { Configuracoes } from './pages/Configuracoes';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm onLoginSuccess={() => {}} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/ai-recommendations" element={<AIRecommendations />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/vendas" element={<Vendas />} />
          <Route path="/compras" element={<Compras />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/rh" element={<RH />} />
          <Route path="/crm" element={<CRM />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/comunidade" element={<Comunidade />} />
          <Route path="/ajuda" element={<Ajuda />} />
        </Routes>
      </Layout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
