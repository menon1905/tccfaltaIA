import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Bot,
  Package,
  ShoppingCart,
  ShoppingBag,
  DollarSign,
  Users,
  Users2,
  FileText,
  Settings,
  HelpCircle,
  MessageSquare,
  Sparkles,
  X,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Assistente IA', href: '/ai-assistant', icon: Bot, badge: 'AI-Powered' },
  { name: 'Recomendações IA', href: '/ai-recommendations', icon: Sparkles },
  { name: 'Estoque', href: '/estoque', icon: Package },
  { name: 'Vendas', href: '/vendas', icon: ShoppingCart },
  { name: 'Compras', href: '/compras', icon: ShoppingBag },
  { name: 'Financeiro', href: '/financeiro', icon: DollarSign },
  { name: 'RH', href: '/rh', icon: Users },
  { name: 'CRM', href: '/crm', icon: Users2 },
  { name: 'Relatórios', href: '/relatorios', icon: FileText },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
];

const support = [
  { name: 'Comunidade', href: '/comunidade', icon: MessageSquare },
  { name: 'Ajuda & Suporte', href: '/ajuda', icon: HelpCircle },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed lg:relative inset-y-0 left-0 flex flex-col w-64 bg-white border-r border-gray-200 h-screen z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">STOKLY ERP</h1>
              <div className="flex items-center mt-1">
                <Bot className="w-3 h-3 text-purple-600 mr-1" />
                <span className="text-xs text-purple-600 font-medium">AI-Powered</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={onClose} // Close sidebar on navigation
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon
                className="flex-shrink-0 w-5 h-5 mr-3"
                aria-hidden="true"
              />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="ml-2 px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-200">
            <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              SUPORTE
            </p>
            <div className="mt-2 space-y-1">
              {support.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose} // Close sidebar on navigation
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon
                    className="flex-shrink-0 w-5 h-5 mr-3"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        </nav>
      </div>
    </>
  );
};
