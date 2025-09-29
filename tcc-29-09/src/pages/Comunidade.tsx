import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Heart, 
  Star, 
  Send, 
  Search,
  Filter,
  TrendingUp,
  Award,
  Calendar,
  Eye,
  MessageCircle,
  ThumbsUp,
  Share2,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  X,
  Plus,
  Clock,
  MapPin,
  User
} from 'lucide-react';

interface Post {
  id: string;
  author: string;
  avatar: string;
  title: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  views: number;
  date: string;
  tags: string[];
  isPopular?: boolean;
  isLiked?: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'guide';
  author: string;
  date: string;
  views: number;
  rating: number;
  isFavorited?: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  type: 'webinar' | 'workshop' | 'meetup';
  date: string;
  time: string;
  duration: string;
  maxParticipants: number;
  currentParticipants: number;
  location?: string;
  isOnline: boolean;
  isRegistered?: boolean;
}

export const Comunidade: React.FC = () => {
  const [activeTab, setActiveTab] = useState('forum');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewPostForm, setShowNewPostForm] = useState(false);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Form states
  const [newPostForm, setNewPostForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: ''
  });

  const [mockPosts, setMockPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'João Silva',
      avatar: 'JS',
      title: 'Como otimizar o controle de estoque para pequenas empresas?',
      content: 'Estou começando com o STOKLY e gostaria de dicas sobre como configurar alertas de estoque baixo e otimizar reposições...',
      category: 'Estoque',
      likes: 24,
      replies: 8,
      views: 156,
      date: '2 horas atrás',
      tags: ['estoque', 'alertas', 'otimização'],
      isPopular: true,
      isLiked: false
    },
    {
      id: '2',
      author: 'Maria Santos',
      avatar: 'MS',
      title: 'Integração com sistemas de pagamento - Experiências',
      content: 'Compartilhando minha experiência integrando o STOKLY com diferentes gateways de pagamento. O que funcionou melhor para vocês?',
      category: 'Integrações',
      likes: 18,
      replies: 12,
      views: 203,
      date: '5 horas atrás',
      tags: ['pagamentos', 'integração', 'gateway'],
      isLiked: false
    },
    {
      id: '3',
      author: 'Pedro Costa',
      avatar: 'PC',
      title: 'Relatórios personalizados - Tutorial completo',
      content: 'Criei um guia passo a passo para criar relatórios personalizados no STOKLY. Inclui exemplos práticos e templates...',
      category: 'Relatórios',
      likes: 31,
      replies: 15,
      views: 287,
      date: '1 dia atrás',
      tags: ['relatórios', 'tutorial', 'personalização'],
      isPopular: true,
      isLiked: false
    }
  ]);

  const [mockResources, setMockResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Primeiros Passos com STOKLY ERP',
      description: 'Guia completo para configurar sua primeira empresa no sistema',
      type: 'video',
      author: 'Equipe STOKLY',
      date: '1 semana atrás',
      views: 1250,
      rating: 4.8,
      isFavorited: false
    },
    {
      id: '2',
      title: 'Melhores Práticas para Gestão de Estoque',
      description: 'Artigo detalhado sobre como otimizar seu controle de inventário',
      type: 'article',
      author: 'Ana Rodrigues',
      date: '3 dias atrás',
      views: 890,
      rating: 4.6,
      isFavorited: false
    },
    {
      id: '3',
      title: 'Configurando Relatórios Avançados',
      description: 'Tutorial passo a passo para criar relatórios personalizados',
      type: 'guide',
      author: 'Carlos Lima',
      date: '5 dias atrás',
      views: 654,
      rating: 4.9,
      isFavorited: false
    }
  ]);

  const [mockEvents, setMockEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Webinar: Gestão Financeira com STOKLY',
      description: 'Aprenda a usar todas as funcionalidades financeiras do sistema',
      type: 'webinar',
      date: '2025-10-15',
      time: '14:00',
      duration: '1h30min',
      maxParticipants: 100,
      currentParticipants: 67,
      isOnline: true,
      isRegistered: false
    },
    {
      id: '2',
      title: 'Workshop: Automação de Processos',
      description: 'Workshop prático sobre como automatizar processos no seu negócio',
      type: 'workshop',
      date: '2025-10-20',
      time: '09:00',
      duration: '4h',
      maxParticipants: 30,
      currentParticipants: 28,
      location: 'São Paulo - SP',
      isOnline: false,
      isRegistered: false
    },
    {
      id: '3',
      title: 'Meetup: Comunidade STOKLY SP',
      description: 'Encontro presencial da comunidade STOKLY em São Paulo',
      type: 'meetup',
      date: '2025-10-25',
      time: '19:00',
      duration: '3h',
      maxParticipants: 50,
      currentParticipants: 23,
      location: 'São Paulo - SP',
      isOnline: false,
      isRegistered: false
    }
  ]);

  const categories = [
    { id: 'all', name: 'Todas', count: 156 },
    { id: 'estoque', name: 'Estoque', count: 45 },
    { id: 'vendas', name: 'Vendas', count: 38 },
    { id: 'financeiro', name: 'Financeiro', count: 29 },
    { id: 'integrações', name: 'Integrações', count: 22 },
    { id: 'relatórios', name: 'Relatórios', count: 18 },
    { id: 'suporte', name: 'Suporte', count: 4 }
  ];

  // Calculate dynamic stats
  const totalLikes = mockPosts.reduce((sum, post) => sum + post.likes, 0);
  const totalMembers = 2847;
  const totalDiscussions = mockPosts.length;
  const totalExperts = 156;

  const handleToggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      // Request notification permission
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification('STOKLY Comunidade', {
              body: 'Notificações ativadas! Você receberá atualizações sobre novos posts e eventos.',
              icon: '/favicon.ico'
            });
          }
        });
      }
      alert('Notificações ativadas! Você receberá atualizações sobre novos posts e eventos.');
    } else {
      alert('Notificações desativadas.');
    }
  };

  const handleLikePost = (postId: string) => {
    setMockPosts(posts => posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          isLiked: !post.isLiked
        };
      }
      return post;
    }));
  };

  const handleFavoriteResource = (resourceId: string) => {
    setMockResources(resources => resources.map(resource => {
      if (resource.id === resourceId) {
        return {
          ...resource,
          isFavorited: !resource.isFavorited
        };
      }
      return resource;
    }));
    
    const resource = mockResources.find(r => r.id === resourceId);
    if (resource) {
      const action = resource.isFavorited ? 'removido dos' : 'adicionado aos';
      alert(`Recurso "${resource.title}" ${action} favoritos!`);
    }
  };

  const handleViewResource = (resource: Resource) => {
    // Simular abertura do recurso
    setMockResources(resources => resources.map(r => {
      if (r.id === resource.id) {
        return { ...r, views: r.views + 1 };
      }
      return r;
    }));
    
    // Simular redirecionamento baseado no tipo
    const messages = {
      video: `Abrindo vídeo: "${resource.title}"\n\nEste vídeo seria reproduzido em uma nova janela ou player integrado.`,
      article: `Abrindo artigo: "${resource.title}"\n\nEste artigo seria exibido em uma página dedicada com o conteúdo completo.`,
      guide: `Abrindo guia: "${resource.title}"\n\nEste guia seria aberto com instruções passo a passo interativas.`
    };
    
    alert(messages[resource.type] || `Abrindo recurso: "${resource.title}"`);
  };

  const handleRegisterEvent = (eventId: string) => {
    setMockEvents(events => events.map(event => {
      if (event.id === eventId) {
        if (event.isRegistered) {
          // Cancelar inscrição
          return {
            ...event,
            currentParticipants: event.currentParticipants - 1,
            isRegistered: false
          };
        } else {
          // Fazer inscrição
          if (event.currentParticipants >= event.maxParticipants) {
            alert('Evento lotado! Não é possível se inscrever.');
            return event;
          }
          return {
            ...event,
            currentParticipants: event.currentParticipants + 1,
            isRegistered: true
          };
        }
      }
      return event;
    }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPostForm.title.trim() || !newPostForm.content.trim() || !newPostForm.category) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const newPost: Post = {
      id: (mockPosts.length + 1).toString(),
      author: 'Você',
      avatar: 'VC',
      title: newPostForm.title,
      content: newPostForm.content,
      category: newPostForm.category,
      likes: 0,
      replies: 0,
      views: 1,
      date: 'Agora',
      tags: newPostForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isLiked: false
    };

    setMockPosts([newPost, ...mockPosts]);
    setNewPostForm({ title: '', content: '', category: '', tags: '' });
    setShowNewPostForm(false);
    alert('Post criado com sucesso!');
  };

  const handleDeletePost = (postId: string, postTitle: string) => {
    if (!confirm(`Tem certeza que deseja excluir o post "${postTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    setMockPosts(posts => posts.filter(post => post.id !== postId));
    alert('Post excluído com sucesso!');
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'guide': return BookOpen;
      default: return FileText;
    }
  };

  const getResourceTypeText = (type: string) => {
    switch (type) {
      case 'video': return 'Vídeo';
      case 'article': return 'Artigo';
      case 'guide': return 'Guia';
      default: return 'Conteúdo';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'webinar': return 'bg-blue-100 text-blue-800';
      case 'workshop': return 'bg-green-100 text-green-800';
      case 'meetup': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventTypeText = (type: string) => {
    switch (type) {
      case 'webinar': return 'Webinar';
      case 'workshop': return 'Workshop';
      case 'meetup': return 'Meetup';
      default: return 'Evento';
    }
  };
  const filteredPosts = mockPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           post.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidade STOKLY</h1>
          <p className="text-gray-600">Conecte-se, aprenda e compartilhe conhecimento</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{totalMembers.toLocaleString()} membros ativos</span>
          </div>
          <button 
            onClick={handleToggleNotifications}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              notificationsEnabled 
                ? 'bg-green-600 text-white hover:bg-green-700' 
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            {notificationsEnabled ? 'Notificações ON' : 'Ser Notificado'}
          </button>
          <button 
            onClick={() => setShowNewPostForm(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <MessageSquare className="w-4 h-4 mr-2" />
            Nova Discussão
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalDiscussions}</p>
              <p className="text-sm text-gray-600">Discussões</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMembers.toLocaleString()}</p>
              <p className="text-sm text-gray-600">Membros</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalLikes}</p>
              <p className="text-sm text-gray-600">Curtidas</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalExperts}</p>
              <p className="text-sm text-gray-600">Especialistas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center space-x-8 mb-6">
          <button
            onClick={() => setActiveTab('forum')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'forum'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="font-medium">Fórum</span>
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'resources'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span className="font-medium">Recursos</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center space-x-2 pb-2 border-b-2 transition-colors ${
              activeTab === 'events'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="font-medium">Eventos</span>
          </button>
        </div>

        {/* Forum Tab */}
        {activeTab === 'forum' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar discussões..."
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

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <div key={post.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">{post.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        {post.isPopular && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{post.content}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{post.author}</span>
                          <span>•</span>
                          <span>{post.date}</span>
                          <span>•</span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">{post.category}</span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{post.replies}</span>
                          </div>
                          <button
                            onClick={() => handleLikePost(post.id)}
                            className={`flex items-center space-x-1 transition-colors ${
                              post.isLiked 
                                ? 'text-red-600 hover:text-red-700' 
                                : 'text-gray-500 hover:text-red-600'
                            }`}
                          >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            <span>{post.likes}</span>
                          </button>
                          {post.author === 'Você' && (
                            <button
                              onClick={() => handleDeletePost(post.id, post.title)}
                              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                              title="Excluir post"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockResources.map((resource) => {
                const IconComponent = getResourceIcon(resource.type);
                return (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                        {getResourceTypeText(resource.type)}
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{resource.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Por {resource.author}</span>
                      <span>{resource.date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{resource.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{resource.rating}</span>
                        </div>
                        <button
                          onClick={() => handleFavoriteResource(resource.id)}
                          className={`p-2 rounded-lg transition-colors ${
                            resource.isFavorited 
                              ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                              : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                          }`}
                          title={resource.isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                        >
                          <Star className={`w-4 h-4 ${resource.isFavorited ? 'fill-current' : ''}`} />
                        </button>
                        <button 
                          onClick={() => handleViewResource(resource)}
                          className="flex items-center space-x-1 text-purple-600 hover:text-purple-700 transition-colors"
                        >
                          <span className="text-sm font-medium">Ver mais</span>
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockEvents.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEventTypeColor(event.type)}`}>
                        {getEventTypeText(event.type)}
                      </span>
                    </div>
                    {event.isOnline && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Online
                      </span>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(event.date).toLocaleDateString('pt-BR')} às {event.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Duração: {event.duration}</span>
                    </div>
                    {event.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Participantes</span>
                      <span>{event.currentParticipants}/{event.maxParticipants}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(event.currentParticipants / event.maxParticipants) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleRegisterEvent(event.id)}
                    disabled={!event.isRegistered && event.currentParticipants >= event.maxParticipants}
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                      event.isRegistered
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : event.currentParticipants >= event.maxParticipants
                        ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {event.isRegistered 
                      ? 'Cancelar Inscrição' 
                      : event.currentParticipants >= event.maxParticipants 
                      ? 'Evento Lotado' 
                      : 'Inscrever-se'
                    }
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* New Post Modal */}
      {showNewPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nova Discussão</h2>
              <button
                onClick={() => setShowNewPostForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título *
                </label>
                <input
                  type="text"
                  value={newPostForm.title}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Digite o título da sua discussão"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria *
                </label>
                <select
                  value={newPostForm.category}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, category: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="Estoque">Estoque</option>
                  <option value="Vendas">Vendas</option>
                  <option value="Financeiro">Financeiro</option>
                  <option value="Integrações">Integrações</option>
                  <option value="Relatórios">Relatórios</option>
                  <option value="Suporte">Suporte</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  rows={6}
                  value={newPostForm.content}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, content: e.target.value }))}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Descreva sua dúvida ou compartilhe sua experiência..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={newPostForm.tags}
                  onChange={(e) => setNewPostForm(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="ex: estoque, alertas, otimização"
                />
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowNewPostForm(false)}
                  className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex items-center px-6 py-3 text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Publicar Discussão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
