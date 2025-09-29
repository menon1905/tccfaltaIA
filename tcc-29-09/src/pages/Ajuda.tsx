import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  Book, 
  MessageCircle, 
  Mail, 
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Download,
  Play,
  FileText,
  Video,
  Headphones,
  Users,
  Zap,
  Shield,
  X,
  Send
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  helpful: number;
  isHelpful?: boolean;
}

interface SupportTicket {
  id: string;
  title: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  date: string;
  category: string;
  description?: string;
}

export const Ajuda: React.FC = () => {
  const [activeTab, setActiveTab] = useState('faq');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [helpfulFAQs, setHelpfulFAQs] = useState<Set<string>>(new Set());
  const [notHelpfulFAQs, setNotHelpfulFAQs] = useState<Set<string>>(new Set());

  const faqs: FAQ[] = [
    {
      id: '1',
      question: 'Como faço para adicionar meu primeiro produto no estoque?',
      answer: 'Para adicionar um produto, vá até a página "Estoque" no menu lateral, clique em "Adicionar Produto" e preencha as informações necessárias como nome, SKU, categoria, preço e quantidade inicial.',
      category: 'Estoque',
      helpful: 45
    },
    {
      id: '2',
      question: 'Como configurar alertas de estoque baixo?',
      answer: 'Ao cadastrar um produto, defina o "Estoque Mínimo". O sistema automaticamente criará alertas quando o estoque atingir esse nível. Você pode visualizar esses alertas no painel principal.',
      category: 'Estoque',
      helpful: 38
    },
    {
      id: '3',
      question: 'Como registrar uma venda no sistema?',
      answer: 'Acesse a página "Vendas", clique em "Nova Venda", selecione o cliente e produto, informe a quantidade e confirme. O sistema atualizará automaticamente o estoque.',
      category: 'Vendas',
      helpful: 52
    },
    {
      id: '4',
      question: 'Como gerar relatórios financeiros?',
      answer: 'Na página "Relatórios", selecione "Relatório Financeiro", escolha o período desejado e clique em "Gerar". Você pode exportar o relatório em PDF.',
      category: 'Financeiro',
      helpful: 29
    },
    {
      id: '5',
      question: 'Como adicionar novos usuários ao sistema?',
      answer: 'Atualmente, cada conta STOKLY é individual. Para empresas que precisam de múltiplos usuários, entre em contato com nosso suporte para soluções empresariais.',
      category: 'Conta',
      helpful: 18
    },
    {
      id: '6',
      question: 'Como fazer backup dos meus dados?',
      answer: 'Seus dados são automaticamente salvos na nuvem. Para exportar dados, use a função "Exportar" disponível em cada módulo (Estoque, Vendas, etc.).',
      category: 'Dados',
      helpful: 33
    }
  ];

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-001',
      title: 'Problema com sincronização de estoque',
      status: 'in-progress',
      priority: 'high',
      date: '2 horas atrás',
      category: 'Técnico',
      description: 'O estoque não está sincronizando corretamente após as vendas. Alguns produtos mostram quantidade incorreta.'
    },
    {
      id: 'TICK-002',
      title: 'Dúvida sobre relatórios personalizados',
      status: 'resolved',
      priority: 'medium',
      date: '1 dia atrás',
      category: 'Funcionalidade',
      description: 'Gostaria de saber como criar relatórios personalizados com filtros específicos para minha empresa.'
    }
  ]);

  // Form states
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const [contactForm, setContactForm] = useState({
    subject: '',
    message: ''
  });

  const categories = [
    { id: 'all', name: 'Todas as Categorias', count: faqs.length },
    { id: 'Estoque', name: 'Estoque', count: faqs.filter(f => f.category === 'Estoque').length },
    { id: 'Vendas', name: 'Vendas', count: faqs.filter(f => f.category === 'Vendas').length },
    { id: 'Financeiro', name: 'Financeiro', count: faqs.filter(f => f.category === 'Financeiro').length },
    { id: 'Conta', name: 'Conta', count: faqs.filter(f => f.category === 'Conta').length },
    { id: 'Dados', name: 'Dados', count: faqs.filter(f => f.category === 'Dados').length }
  ];

  const handleMarkHelpful = (faqId: string, isHelpful: boolean) => {
    if (isHelpful) {
      setHelpfulFAQs(prev => new Set([...prev, faqId]));
      setNotHelpfulFAQs(prev => {
        const newSet = new Set(prev);
        newSet.delete(faqId);
        return newSet;
      });
    } else {
      setNotHelpfulFAQs(prev => new Set([...prev, faqId]));
      setHelpfulFAQs(prev => {
        const newSet = new Set(prev);
        newSet.delete(faqId);
        return newSet;
      });
    }
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTicket: SupportTicket = {
      id: `TICK-${String(supportTickets.length + 1).padStart(3, '0')}`,
      title: newTicketForm.title,
      status: 'open',
      priority: newTicketForm.priority as 'low' | 'medium' | 'high',
      date: 'Agora',
      category: newTicketForm.category,
      description: newTicketForm.description
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    setNewTicketForm({ title: '', category: '', priority: 'medium', description: '' });
    setShowNewTicketForm(false);
    alert('Ticket criado com sucesso! Nossa equipe entrará em contato em breve.');
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate sending message
    alert('Mensagem enviada com sucesso! Responderemos em até 24 horas.');
    setContactForm({ subject: '', message: '' });
    setShowContactForm(false);
  };

  const handleViewTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  const handleDownloadManual = () => {
    // Simulate PDF download
    alert('Download do manual iniciado! O arquivo será baixado em instantes.');
  };

  const handleOpenDocumentation = () => {
    alert('Redirecionando para a documentação completa...');
  };

  const handleOpenVideoTutorials = () => {
    alert('Abrindo biblioteca de vídeo tutoriais...');
  };

  const handleOpenLiveChat = () => {
    alert('Iniciando chat ao vivo com nossa equipe de suporte...');
  };

  const handleOpenCommunity = () => {
    alert('Redirecionando para a comunidade STOKLY...');
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in-progress': return 'Em Andamento';
      case 'resolved': return 'Resolvido';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajuda & Suporte</h1>
          <p className="text-gray-600">Encontre respostas e obtenha ajuda quando precisar</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleDownloadManual}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Manual PDF
          </button>
          <button 
            onClick={() => setShowContactForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <MessageCircle className="w-4 h-4 mr-2" />
            Contatar Suporte
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div 
          onClick={handleOpenDocumentation}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Book className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Documentação</h3>
              <p className="text-sm text-gray-600">Guias completos</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Acesse nossa documentação completa com tutoriais passo a passo.</p>
        </div>

        <div 
          onClick={handleOpenVideoTutorials}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Vídeo Tutoriais</h3>
              <p className="text-sm text-gray-600">Aprenda assistindo</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Assista vídeos explicativos sobre todas as funcionalidades.</p>
        </div>

        <div 
          onClick={handleOpenLiveChat}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Chat ao Vivo</h3>
              <p className="text-sm text-gray-600">Suporte imediato</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Converse com nossa equipe de suporte em tempo real.</p>
        </div>

        <div 
          onClick={handleOpenCommunity}
          className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Comunidade</h3>
              <p className="text-sm text-gray-600">Ajuda da comunidade</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">Participe da comunidade e tire dúvidas com outros usuários.</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-8 mb-6">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'faq'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span className="font-medium">FAQ</span>
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'tickets'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">Meus Tickets</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'contact'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span className="font-medium">Contato</span>
          </button>
        </div>

        {/* FAQ Tab */}
        {activeTab === 'faq' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar perguntas frequentes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* FAQ List */}
            <div className="space-y-4">
              {filteredFAQs.map((faq) => (
                <div key={faq.id} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{faq.question}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-gray-100 rounded-full">{faq.category}</span>
                        <span>{faq.helpful} pessoas acharam útil</span>
                      </div>
                    </div>
                    {expandedFAQ === faq.id ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <p className="text-gray-700 mt-4">{faq.answer}</p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={() => handleMarkHelpful(faq.id, true)}
                            className={`flex items-center space-x-2 text-sm transition-colors ${
                              helpfulFAQs.has(faq.id) 
                                ? 'text-green-700 bg-green-50 px-2 py-1 rounded' 
                                : 'text-green-600 hover:text-green-700'
                            }`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>{helpfulFAQs.has(faq.id) ? 'Marcado como útil' : 'Útil'}</span>
                          </button>
                          <button 
                            onClick={() => handleMarkHelpful(faq.id, false)}
                            className={`flex items-center space-x-2 text-sm transition-colors ${
                              notHelpfulFAQs.has(faq.id) 
                                ? 'text-red-700 bg-red-50 px-2 py-1 rounded' 
                                : 'text-gray-600 hover:text-gray-700'
                            }`}>
                            <AlertCircle className="w-4 h-4" />
                            <span>{notHelpfulFAQs.has(faq.id) ? 'Marcado como não útil' : 'Não ajudou'}</span>
                          </button>
                        </div>
                        <button 
                          onClick={() => setShowContactForm(true)}
                          className="text-sm text-purple-600 hover:text-purple-700">
                          Precisa de mais ajuda?
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Meus Tickets de Suporte</h3>
              <button 
                onClick={() => setShowNewTicketForm(true)}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <MessageCircle className="w-4 h-4 mr-2" />
                Novo Ticket
              </button>
            </div>

            {supportTickets.length === 0 ? (
              <div className="text-center py-12">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum ticket encontrado</h3>
                <p className="text-gray-600 mb-6">
                  Você ainda não possui tickets de suporte. Crie um novo ticket se precisar de ajuda.
                </p>
                <button 
                  onClick={() => setShowNewTicketForm(true)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  Criar Primeiro Ticket
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((ticket) => (
                  <div key={ticket.id} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ticket.title}</h3>
                        <p className="text-sm text-gray-600">#{ticket.id} • {ticket.category}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </span>
                        <span className={`text-sm font-medium ${getPriorityColor(selectedTicket.priority)}`}>
                          {ticket.priority === 'high' ? 'Alta' : 
                           ticket.priority === 'medium' ? 'Média' : 'Baixa'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Criado {ticket.date}</span>
                      <button 
                        onClick={() => handleViewTicket(ticket)}
                        className="text-purple-600 hover:text-purple-700">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Methods */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Entre em Contato</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-sm text-gray-600">suporte@stokly.com</p>
                      <p className="text-xs text-gray-500">Resposta em até 24h</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Telefone</h4>
                      <p className="text-sm text-gray-600">(11) 4000-0000</p>
                      <p className="text-xs text-gray-500">Seg-Sex, 9h às 18h</p>
                    </div>
                  </div>

                  <div 
                    onClick={handleOpenLiveChat}
                    className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <MessageCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Chat ao Vivo</h4>
                      <p className="text-sm text-gray-600">Suporte instantâneo</p>
                      <p className="text-xs text-gray-500">Disponível agora</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Form */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Envie uma Mensagem</h3>
                
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assunto
                    </label>
                    <select 
                      value={contactForm.subject}
                      onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                      <option value="">Selecione um assunto</option>
                      <option>Suporte Técnico</option>
                      <option>Dúvida sobre Funcionalidade</option>
                      <option>Problema de Cobrança</option>
                      <option>Sugestão de Melhoria</option>
                      <option>Outro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensagem
                    </label>
                    <textarea
                      rows={6}
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Descreva sua dúvida ou problema..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </button>
                </form>
              </div>
            </div>

            {/* Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-green-900">Sistema Operacional</h4>
                  <p className="text-sm text-green-700">Todos os serviços funcionando normalmente</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicketForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Criar Novo Ticket</h2>
              <button
                onClick={() => setShowNewTicketForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título do Ticket *
                </label>
                <input
                  type="text"
                  value={newTicketForm.title}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva brevemente o problema"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    value={newTicketForm.category}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, category: e.target.value }))}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="Técnico">Técnico</option>
                    <option value="Funcionalidade">Funcionalidade</option>
                    <option value="Cobrança">Cobrança</option>
                    <option value="Sugestão">Sugestão</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição Detalhada *
                </label>
                <textarea
                  rows={6}
                  value={newTicketForm.description}
                  onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva o problema em detalhes, incluindo passos para reproduzir se aplicável..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewTicketForm(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Criar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Form Modal */}
      {showContactForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Contatar Suporte</h2>
              <button
                onClick={() => setShowContactForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assunto *
                </label>
                <select
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione um assunto</option>
                  <option value="Suporte Técnico">Suporte Técnico</option>
                  <option value="Dúvida sobre Funcionalidade">Dúvida sobre Funcionalidade</option>
                  <option value="Problema de Cobrança">Problema de Cobrança</option>
                  <option value="Sugestão de Melhoria">Sugestão de Melhoria</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem *
                </label>
                <textarea
                  rows={6}
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva sua dúvida ou problema..."
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Mensagem
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Details Modal */}
      {showTicketDetails && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedTicket.title}</h2>
                <p className="text-gray-600">#{selectedTicket.id} • {selectedTicket.category}</p>
              </div>
              <button
                onClick={() => setShowTicketDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <span className={"px-3 py-1 rounded-full text-xs font-medium " + getStatusColor(selectedTicket.status)}>
                    {getStatusText(selectedTicket.status)}
                  </span>
                  <span className={"text-sm font-medium " + getPriorityColor(selectedTicket.priority)}>
                    Prioridade: {selectedTicket.priority === 'high' ? 'Alta' : 
                                selectedTicket.priority === 'medium' ? 'Média' : 'Baixa'}
                  </span>
                </div>
                <span className="text-sm text-gray-500">Criado {selectedTicket.date}</span>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Descrição</h3>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-xl">
                  {selectedTicket.description || 'Nenhuma descrição adicional fornecida.'}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h4 className="font-medium text-blue-900 mb-2">Status do Ticket</h4>
                <p className="text-sm text-blue-800">
                  {selectedTicket.status === 'open' && 'Seu ticket foi recebido e está na fila para análise.'}
                  {selectedTicket.status === 'in-progress' && 'Nossa equipe está trabalhando na resolução do seu problema.'}
                  {selectedTicket.status === 'resolved' && 'Seu ticket foi resolvido. Se ainda precisar de ajuda, entre em contato conosco.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowContactForm(true)}
                className="flex items-center px-4 py-2 text-purple-600 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Adicionar Comentário
              </button>
              <button
                onClick={() => setShowTicketDetails(false)}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
