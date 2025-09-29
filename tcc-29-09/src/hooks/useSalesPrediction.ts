import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface PredictionResult {
  date: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

interface ModelInfo {
  type: string;
  data_points: number;
  days_analyzed: number;
  slope: number;
  intercept: number;
  accuracy_percentage: number;
  rmse: number;
}

interface SalesPredictionData {
  predictions: PredictionResult[];
  model_info: ModelInfo;
  historical_data: { date: string; total: number }[];
}

export const useSalesPrediction = () => {
  const [predictionData, setPredictionData] = useState<SalesPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    setError(null);

    try {
      // Invocar a Edge Function do Supabase
      const { data, error: functionError } = await supabase.functions.invoke('sales-prediction');

      if (functionError) {
        // Trata erros de rede ou da própria função (ex: 500)
        throw functionError;
      }
      
      // A função pode retornar um erro de negócio no corpo da resposta
      if (data.error) {
        if (data.error === 'Insufficient data') {
          console.warn('Dados insuficientes para previsão:', data.message);
          // Não define um erro, apenas não teremos dados de previsão.
          // Os componentes já possuem fallbacks para quando `predictionData` é nulo.
          setPredictionData(null);
        } else {
          throw new Error(data.message || 'Erro na função de previsão.');
        }
      } else {
        setPredictionData(data);
      }
      
    } catch (err: any) {
      console.error('Erro ao buscar previsões de vendas:', err);
      let errorMessage = 'Falha ao buscar previsões de vendas.';
      if (err.message) {
        if (err.message.includes('Function not found')) {
            errorMessage = 'Função de IA não encontrada. Verifique a implantação no Supabase.';
        } else {
            errorMessage = `Erro: ${err.message}`;
        }
      }
      setError(errorMessage);
      setPredictionData(null); // Limpa dados antigos em caso de erro
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  return {
    predictionData,
    loading,
    error,
    refetch: fetchPredictions,
  };
};
