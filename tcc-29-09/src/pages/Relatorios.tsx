import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar,
  Filter,
  TrendingUp,
  Package,
  Users,
  DollarSign
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import { useCurrency } from '../hooks/useCurrency';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const Relatorios: React.FC = () => {
  const { products, sales, customers, purchases, loading } = useSupabaseData();
  const { formatCurrency } = useCurrency();
  const [selectedReport, setSelectedReport] = useState('sales');
  const [dateRange, setDateRange] = useState('month');

  const salesChartRef = useRef<ChartJS<'bar', number[], string>>(null);
  const inventoryChartRef = useRef<ChartJS<'line', number[], string>>(null);
  const customersChartRef = useRef<ChartJS<'doughnut', number[], string>>(null);
  const financialChartRef = useRef<ChartJS<'bar', number[], string>>(null);

  const reports = [
    {
      id: 'sales',
      name: 'Relatório de Vendas',
      description: 'Análise completa das vendas por período',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'inventory',
      name: 'Relatório de Estoque',
      description: 'Status do inventário e movimentações',
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      id: 'customers',
      name: 'Relatório de Clientes',
      description: 'Análise do comportamento dos clientes',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'financial',
      name: 'Relatório Financeiro',
      description: 'Receitas, despesas e lucratividade',
      icon: DollarSign,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ];

  const handleExportPDF = async () => {
    if (loading) {
      alert('Aguarde o carregamento dos dados antes de exportar.');
      return;
    }
    alert('Gerando PDF de alta qualidade... Por favor, aguarde.');

    const doc = new jsPDF();
    const reportInfo = reports.find(r => r.id === selectedReport);
    const reportTitle = reportInfo?.name || 'Relatório';
    const date = new Date().toLocaleDateString('pt-BR');
    const filename = `relatorio_${selectedReport}_${new Date().toISOString().split('T')[0]}.pdf`;

    // --- PDF Header ---
    doc.setFillColor(243, 244, 246); // gray-100
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 48, 'F');
    
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 92, 246); // Purple-600
    doc.text('STOKLY ERP', 14, 22);

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(reportTitle, 14, 32);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Gerado em: ${date}`, 14, 42);
    
    let chartRef: React.RefObject<ChartJS | null> = { current: null };
    let head: string[][] = [];
    let body: (string | number)[][] = [];
    let summaryData: { label: string; value: string }[] = [];
    let startY = 60;

    switch (selectedReport) {
      case 'sales':
        chartRef = salesChartRef;
        if (!sales || sales.length === 0) { alert('Não há dados de vendas para gerar o relatório.'); return; }
        const totalRevenue = sales.reduce((sum, sale) => sum + (sale.total || 0), 0);
        summaryData = [
            { label: 'Total de Vendas', value: sales.length.toString() },
            { label: 'Receita Total', value: formatCurrency(totalRevenue) },
            { label: 'Ticket Médio', value: formatCurrency(sales.length > 0 ? totalRevenue / sales.length : 0) }
        ];
        head = [['Data', 'Cliente', 'Produto', 'Qtd', 'Total']];
        body = sales.map(sale => [ new Date(sale.created_at).toLocaleDateString('pt-BR'), sale.customers?.name || 'N/A', sale.products?.name || 'N/A', sale.quantity, formatCurrency(sale.total || 0) ]);
        break;
      case 'inventory':
        chartRef = inventoryChartRef;
        if (!products || products.length === 0) { alert('Não há dados de estoque para gerar o relatório.'); return; }
        const totalStockValue = products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0);
        summaryData = [
            { label: 'Total de Produtos', value: products.length.toString() },
            { label: 'Valor em Estoque', value: formatCurrency(totalStockValue) },
            { label: 'Produtos em Falta', value: products.filter(p => (p.stock || 0) <= (p.min_stock || 0)).length.toString() }
        ];
        head = [['Produto', 'SKU', 'Categoria', 'Estoque', 'Preço']];
        body = products.map(product => [ product.name, product.sku, product.category, product.stock, formatCurrency(product.price || 0) ]);
        break;
      case 'customers':
        chartRef = customersChartRef;
        if (!customers || customers.length === 0) { alert('Não há dados de clientes para gerar o relatório.'); return; }
        const totalCustomerValue = customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0);
        summaryData = [
            { label: 'Total de Clientes', value: customers.length.toString() },
            { label: 'Valor Total Gasto', value: formatCurrency(totalCustomerValue) },
            { label: 'Valor Médio/Cliente', value: formatCurrency(customers.length > 0 ? totalCustomerValue / customers.length : 0) }
        ];
        head = [['Nome', 'Email', 'Telefone', 'Total Gasto']];
        body = customers.map(customer => [ customer.name, customer.email, customer.phone, formatCurrency(customer.total_purchases || 0) ]);
        break;
      case 'financial':
        chartRef = financialChartRef;
        const revenue = (sales || []).reduce((sum, sale) => sum + (sale.total || 0), 0);
        const expenses = (purchases || []).reduce((sum, p) => sum + (p.total || 0), 0);
        const profit = revenue - expenses;
        if (revenue === 0 && expenses === 0) { alert('Não há dados financeiros para gerar o relatório.'); return; }
        summaryData = [
            { label: 'Receita Total', value: formatCurrency(revenue) },
            { label: 'Despesas Totais', value: formatCurrency(expenses) },
            { label: 'Lucro Líquido', value: formatCurrency(profit) }
        ];
        head = [['Tipo', 'Descrição', 'Valor']];
        body = [
          ['Receita', 'Total de Vendas', formatCurrency(revenue)],
          ['Despesa', 'Total de Compras', formatCurrency(expenses)],
          ['Lucro Líquido', 'Receita - Despesas', formatCurrency(profit)]
        ];
        break;
      default:
        doc.text("Nenhum relatório selecionado.", 14, 40);
        doc.save('relatorio_erro.pdf');
        return;
    }

    // --- Add Summary ---
    if (summaryData.length > 0) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo do Período', 14, startY);
      startY += 8;

      let summaryX = 14;
      summaryData.forEach(item => {
          doc.setFillColor(249, 250, 251); // gray-50
          doc.setDrawColor(229, 231, 235); // gray-200
          doc.roundedRect(summaryX, startY, 58, 20, 3, 3, 'FD');
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128); // gray-500
          doc.text(item.label, summaryX + 5, startY + 8);
          doc.setFontSize(14);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(20, 20, 20);
          doc.text(item.value, summaryX + 5, startY + 16);
          summaryX += 62;
      });
      startY += 30;
    }

    // --- Add Chart Image (High Quality) ---
    if (chartRef.current) {
      try {
        const chart = chartRef.current;
        
        const originalDevicePixelRatio = chart.options.devicePixelRatio || window.devicePixelRatio;
        chart.options.devicePixelRatio = 3; // 3x resolution for crisp PDFs
        chart.resize();
        chart.update('none');
        
        const chartImage = chart.toBase64Image('image/png', 1.0);
        
        chart.options.devicePixelRatio = originalDevicePixelRatio;
        chart.resize();
        chart.update('none');

        const imgProps = doc.getImageProperties(chartImage);
        const pdfWidth = doc.internal.pageSize.getWidth();
        const imgWidth = pdfWidth - 28;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
        doc.addImage(chartImage, 'PNG', 14, startY, imgWidth, imgHeight);
        startY += imgHeight + 15;
      } catch (e) {
        console.error("Error generating chart image:", e);
        startY += 5;
      }
    }

    // --- Add Table ---
    autoTable(doc, {
      head: head,
      body: body,
      startY: startY,
      theme: 'grid',
      headStyles: { fillColor: [88, 80, 236] }, // A nice purple
      styles: { font: 'helvetica', fontSize: 9 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Página ${data.pageNumber}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
    });

    doc.save(filename);
  };

  // Sales Report Data
  const salesReportData = {
    labels: (sales || []).length > 0 ? (sales || []).map((_, index) => `Venda ${index + 1}`) : ['Sem Dados'],
    datasets: [
      {
        label: 'Vendas (Unidades)',
        data: (sales || []).length > 0 ? (sales || []).map(sale => sale.quantity || 0) : [0],
        backgroundColor: 'rgba(16, 185, 129, 0.6)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 1,
      },
    ],
  };

  // Customer Segmentation
  const customerSegmentData = {
    labels: ['Novos Clientes', 'Clientes Recorrentes', 'Clientes VIP'],
    datasets: [
      {
        data: (customers || []).length > 0 ? [(customers || []).length, 0, 0] : [0, 0, 0],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
        ],
        borderWidth: 0,
      },
    ],
  };

  // Product Performance
  const productPerformanceData = {
    labels: (products || []).length > 0 ? (products || []).slice(0, 5).map(p => p.name) : ['Sem Produtos'],
    datasets: [
      {
        label: 'Vendas por Produto',
        data: (products || []).length > 0 ? (products || []).slice(0, 5).map(product => {
          const productSales = (sales || []).filter(sale => sale.product_id === product.id);
          return productSales.reduce((sum, sale) => sum + (sale.quantity || 0), 0);
        }) : [0],
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
      },
    ],
  };

  // Financial Report Data
  const totalRevenue = (sales || []).reduce((sum, sale) => sum + (sale.total || 0), 0);
  const totalExpenses = (purchases || []).reduce((sum, p) => sum + (p.total || 0), 0);
  const netProfit = totalRevenue - totalExpenses;
  const financialReportData = {
    labels: ['Receita', 'Despesas', 'Lucro'],
    datasets: [
      {
        label: 'Resumo Financeiro',
        data: [totalRevenue, totalExpenses, netProfit],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(239, 68, 68, 0.6)',
          netProfit >= 0 ? 'rgba(59, 130, 246, 0.6)' : 'rgba(239, 68, 68, 0.6)',
        ],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'sales':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Total de Vendas</h4>
                <p className="text-2xl font-bold text-green-600">{(sales || []).length}</p>
                <p className="text-sm text-gray-600">Este período</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Receita Total</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((sales || []).reduce((sum, sale) => sum + (sale.total || 0), 0))}
                </p>
                <p className="text-sm text-gray-600">Este período</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Ticket Médio</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency((sales || []).length > 0 ? 
                    (sales || []).reduce((sum, sale) => sum + (sale.total || 0), 0) / (sales || []).length : 0)}
                </p>
                <p className="text-sm text-gray-600">Por venda</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Vendas por Período</h4>
              <Bar ref={salesChartRef} data={salesReportData} options={chartOptions} />
            </div>
          </div>
        );
      
      case 'inventory':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Total de Produtos</h4>
                <p className="text-2xl font-bold text-purple-600">{(products || []).length}</p>
                <p className="text-sm text-gray-600">Cadastrados</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Valor do Estoque</h4>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency((products || []).reduce((sum, product) => sum + ((product.price || 0) * (product.stock || 0)), 0))}
                </p>
                <p className="text-sm text-gray-600">Total em produtos</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Produtos em Falta</h4>
                <p className="text-2xl font-bold text-red-600">
                  {(products || []).filter(p => (p.stock || 0) <= (p.min_stock || 0)).length}
                </p>
                <p className="text-sm text-gray-600">Precisam reposição</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Performance dos Produtos</h4>
              <Line ref={inventoryChartRef} data={productPerformanceData} options={chartOptions} />
            </div>
          </div>
        );
      
      case 'customers':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Total de Clientes</h4>
                <p className="text-2xl font-bold text-blue-600">{(customers || []).length}</p>
                <p className="text-sm text-gray-600">Base ativa</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Novos Clientes</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {(customers || []).filter(c => {
                    const createdDate = new Date(c.created_at);
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                    return createdDate >= thirtyDaysAgo;
                  }).length}
                </p>
                <p className="text-sm text-gray-600">Este mês</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Valor Médio por Cliente</h4>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((customers || []).length > 0 ? 
                    (customers || []).reduce((sum, customer) => sum + (customer.total_purchases || 0), 0) / (customers || []).length : 0)}
                </p>
                <p className="text-sm text-gray-600">Lifetime value</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Segmentação de Clientes</h4>
              <div className="flex justify-center">
                <div className="w-64 h-64">
                  <Doughnut ref={customersChartRef} data={customerSegmentData} options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom' as const,
                      },
                    },
                  }} />
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'financial':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Receita Total</h4>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalRevenue)}
                </p>
                <p className="text-sm text-gray-600">Este período</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Despesas</h4>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </p>
                <p className="text-sm text-gray-600">Este período</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Lucro Líquido</h4>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(netProfit)}
                </p>
                <p className="text-sm text-gray-600">Receita - Despesas</p>
              </div>
            </div>
            <div className="bg-white rounded-lg border p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Resumo Financeiro</h4>
              <Bar ref={financialChartRef} data={financialReportData} options={chartOptions} />
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
        <div className="flex items-center space-x-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="week">Esta Semana</option>
            <option value="month">Este Mês</option>
            <option value="quarter">Este Trimestre</option>
            <option value="year">Este Ano</option>
          </select>
          <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Report Selection */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Relatório</h3>
            <div className="space-y-2">
              {reports.map((report) => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report.id)}
                  className={`w-full flex items-start space-x-3 p-3 rounded-lg transition-colors text-left ${
                    selectedReport === report.id
                      ? 'bg-purple-50 border border-purple-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${report.bgColor}`}>
                    <report.icon className={`w-4 h-4 ${report.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">{report.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{report.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {reports.find(r => r.id === selectedReport)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Período: {dateRange === 'week' ? 'Esta Semana' : 
                           dateRange === 'month' ? 'Este Mês' :
                           dateRange === 'quarter' ? 'Este Trimestre' : 'Este Ano'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                  <Eye className="w-4 h-4 mr-2" />
                  Visualizar
                </button>
                <button 
                  onClick={handleExportPDF}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </button>
              </div>
            </div>

            {renderReportContent()}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Relatórios Rápidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { name: 'Top 10 Produtos', description: 'Mais vendidos do mês' },
            { name: 'Clientes Inativos', description: 'Não compraram em 30 dias' },
            { name: 'Produtos em Falta', description: 'Estoque abaixo do mínimo' },
            { name: 'Análise de Margem', description: 'Lucratividade por produto' },
          ].map((quickReport, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <Download className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-medium text-gray-900 text-sm mb-1">{quickReport.name}</h4>
              <p className="text-xs text-gray-600">{quickReport.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
