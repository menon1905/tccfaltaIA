import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle, Send, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface LoginFormProps {
  onLoginSuccess: () => void;
}

type View = 'login' | 'register' | 'forgotPassword';

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<View>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });

  const clearMessages = () => {
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (!isSupabaseConfigured()) {
      setError('Sistema não configurado. Entre em contato com o suporte.');
      setLoading(false);
      return;
    }

    try {
      if (view === 'login') {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;

        if (data.user) {
          onLoginSuccess();
        }
      } else if (view === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/#/auth/callback`,
            data: {
              name: formData.name,
            }
          }
        });

        if (signUpError) throw signUpError;

        if (data.user && !data.user.email_confirmed_at) {
          setInfo('Conta criada! Verifique seu email para confirmar sua conta antes de fazer login.');
          setView('login');
          setLoading(false);
          return;
        }

        if (data.user) {
          onLoginSuccess();
        }
      }
    } catch (err: any) {
      // Usando console.warn para evitar que o ambiente de desenvolvimento trate como erro fatal
      console.warn('Falha na autenticação:', err);
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

      if (err && err.message) {
        const message = err.message;
        if (message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique seus dados e tente novamente.';
        } else if (message.includes('Email not confirmed')) {
          errorMessage = 'Email não confirmado. Verifique sua caixa de entrada e clique no link de confirmação.';
        } else if (message.includes('User already registered')) {
          errorMessage = 'Este email já está cadastrado. Tente fazer login ou recuperar sua senha.';
        } else if (message.includes('Password should be at least 6 characters')) {
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
        } else if (message.includes('As senhas não coincidem')) {
          errorMessage = 'As senhas não coincidem.';
        } else if (message.includes('over_email_send_rate_limit')) {
          errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        } else {
          errorMessage = `Erro: ${message}`;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/#/auth/callback`,
      });
      if (error) throw error;
      setInfo('Se uma conta com este email existir, um link para redefinir a senha foi enviado.');
      setView('login');
    } catch (err: any) {
      console.warn('Erro ao redefinir senha:', err);
      setError('Não foi possível enviar o email de redefinição. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const getTitle = () => {
    if (view === 'login') return 'Entre na sua conta';
    if (view === 'register') return 'Crie sua conta';
    return 'Recuperar Senha';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">STOKLY ERP</h1>
          <p className="text-gray-600 mt-2">{getTitle()}</p>
        </div>

        {/* Info/Error messages */}
        {info && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-lg">
            <p>{info}</p>
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg" role="alert">
            <div className="flex">
              <div className="py-1"><AlertCircle className="w-5 h-5 mr-3"/></div>
              <div>
                <p className="font-bold">Ocorreu um erro</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Forms */}
        {view === 'forgotPassword' ? (
          <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Digite o email da sua conta"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Link de Recuperação
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={view === 'register'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="seu@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Sua senha (mínimo 6 caracteres)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {view === 'login' && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setView('forgotPassword');
                      clearMessages();
                    }}
                    className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Esqueceu sua senha?
                  </button>
                </div>
              )}
            </div>
            {view === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={view === 'register'}
                    minLength={6}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Confirme sua senha"
                  />
                </div>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  {view === 'login' ? 'Entrar' : 'Criar Conta'}
                </>
              )}
            </button>
          </form>
        )}

        {/* Toggle */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setView(view === 'login' ? 'register' : 'login');
              clearMessages();
            }}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            {view === 'login' && 'Não tem uma conta? Criar conta'}
            {view === 'register' && 'Já tem uma conta? Fazer login'}
            {view === 'forgotPassword' && (
              <span className="flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Voltar para o login
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
