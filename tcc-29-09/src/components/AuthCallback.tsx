import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando autenticação...');

  useEffect(() => {
    // A biblioteca do Supabase, com `detectSessionInUrl: true`, já processa o token da URL.
    // O `onAuthStateChange` no AuthProvider irá atualizar o estado do usuário.
    // Nós apenas esperamos por essa mudança.
    if (!loading) {
      if (user) {
        setStatus('success');
        setMessage('Autenticação bem-sucedida! Redirecionando para o painel...');
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 2000);
      } else {
        // Se após o carregamento inicial ainda não houver usuário, pode ter ocorrido um erro.
        setStatus('error');
        setMessage('Falha na autenticação. O link pode ter expirado ou ser inválido. Por favor, tente fazer login novamente.');
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">STOKLY ERP</h1>
        
        {status === 'loading' && (
          <div className="space-y-4">
            <Loader className="w-8 h-8 text-purple-600 mx-auto animate-spin" />
            <p className="text-gray-600">{message}</p>
          </div>
        )}
        
        {status === 'success' && (
          <div className="space-y-4">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto" />
            <p className="text-green-600 font-medium">{message}</p>
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <XCircle className="w-8 h-8 text-red-600 mx-auto" />
            <p className="text-red-600 font-medium">{message}</p>
            <button
              onClick={() => navigate('/', { replace: true })}
              className="w-full px-4 py-2 text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voltar ao Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
