const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SalesData {
  date: string;
  total: number;
}

interface PredictionResult {
  date: string;
  predicted_value: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
}

// Função para regressão linear simples
function linearRegression(data: { x: number; y: number }[]) {
  const n = data.length;
  const sumX = data.reduce((sum, point) => sum + point.x, 0);
  const sumY = data.reduce((sum, point) => sum + point.y, 0);
  const sumXY = data.reduce((sum, point) => sum + point.x * point.y, 0);
  const sumXX = data.reduce((sum, point) => sum + point.x * point.x, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

// Função para calcular média móvel
function movingAverage(data: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = window - 1; i < data.length; i++) {
    const sum = data.slice(i - window + 1, i + 1).reduce((a, b) => a + b, 0);
    result.push(sum / window);
  }
  return result;
}

// Função para calcular desvio padrão
function standardDeviation(data: number[]): number {
  const mean = data.reduce((sum, value) => sum + value, 0) / data.length;
  const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
  return Math.sqrt(variance);
}

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Edge Function started - sales-prediction')
    
    // Get environment variables with multiple fallback patterns
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 
                       Deno.env.get('_SUPABASE_URL') || 
                       Deno.env.get('SUPABASE_PROJECT_URL')
    
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 
                              Deno.env.get('_SUPABASE_SERVICE_ROLE_KEY') || 
                              Deno.env.get('SUPABASE_SERVICE_KEY')
    
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 
                           Deno.env.get('_SUPABASE_ANON_KEY') || 
                           Deno.env.get('SUPABASE_KEY')
    
    console.log('Environment variables check:', {
      url: !!supabaseUrl,
      serviceKey: !!supabaseServiceKey,
      anonKey: !!supabaseAnonKey
    })
    
    // If environment variables are missing, return a helpful error
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing critical environment variables')
      return new Response(
        JSON.stringify({ 
          error: 'Configuration Error',
          message: 'Edge Function is missing required Supabase configuration. Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your Supabase project settings.',
          missing: {
            url: !supabaseUrl,
            serviceKey: !supabaseServiceKey,
            anonKey: !supabaseAnonKey
          }
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    
    if (!authHeader) {
      console.error('No authorization header provided')
      return new Response(
        JSON.stringify({ 
          error: 'Unauthorized',
          message: 'Authorization header is required'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Import Supabase client
    const { createClient } = await import('npm:@supabase/supabase-js@2')

    // Create Supabase client for database operations
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Extract user ID from JWT token manually (simplified approach)
    let userId: string;
    try {
      const token = authHeader.replace('Bearer ', '');
      const payload = JSON.parse(atob(token.split('.')[1]));
      userId = payload.sub;
      console.log('Extracted user ID:', userId);
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid Token',
          message: 'Unable to extract user information from authorization token'
        }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Query sales data from the last 90 days
    const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
    console.log('Querying sales data for user:', userId, 'from:', startDate)
    
    const { data: salesData, error } = await supabaseClient
      .from('sales')
      .select('created_at, total')
      .eq('user_id', userId)
      .gte('created_at', startDate)
      .order('created_at', { ascending: true })

    console.log('Database query result:', { 
      dataCount: salesData?.length || 0, 
      error: error?.message || 'none' 
    })

    if (error) {
      console.error('Database query error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Database Error',
          message: `Failed to fetch sales data: ${error.message}`,
          details: error
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!salesData || salesData.length < 7) {
      console.log('Insufficient data for predictions:', salesData?.length || 0)
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient data',
          message: `Need at least 7 days of sales data for predictions. Found ${salesData?.length || 0} records.`,
          predictions: [],
          model_info: {
            type: 'insufficient_data',
            data_points: 0,
            days_analyzed: 0,
            slope: 0,
            intercept: 0,
            accuracy_percentage: 0,
            rmse: 0
          },
          historical_data: []
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Processing sales data for predictions...')

    // Aggregate sales by day
    const dailySales = new Map<string, number>();
    salesData.forEach((sale) => {
      const date = new Date(sale.created_at).toISOString().split('T')[0];
      dailySales.set(date, (dailySales.get(date) || 0) + sale.total);
    });

    // Convert to array and sort by date
    const sortedSales = Array.from(dailySales.entries())
      .map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Prepare data for regression (x = days since start, y = sales total)
    const startDateObj = new Date(sortedSales[0].date);
    const regressionData = sortedSales.map((sale, index) => ({
      x: index,
      y: sale.total
    }));

    // Calculate linear regression
    const { slope, intercept } = linearRegression(regressionData);

    // Calculate moving average for trend smoothing
    const salesValues = sortedSales.map(s => s.total);
    const movingAvg = movingAverage(salesValues, Math.min(7, salesValues.length));
    
    // Calculate standard deviation for confidence intervals
    const residuals = regressionData.map(point => point.y - (slope * point.x + intercept));
    const stdDev = standardDeviation(residuals);

    // Generate predictions for next 30 days
    const predictions: PredictionResult[] = [];
    const lastDataPoint = regressionData.length - 1;

    for (let i = 1; i <= 30; i++) {
      const futureX = lastDataPoint + i;
      const predictedValue = slope * futureX + intercept;
      
      // Add some seasonality based on day of week (simple pattern)
      const futureDate = new Date(startDateObj);
      futureDate.setDate(futureDate.getDate() + futureX);
      const dayOfWeek = futureDate.getDay();
      
      // Weekend boost (simple seasonality)
      const seasonalityFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.1 : 1.0;
      const adjustedPrediction = Math.max(0, predictedValue * seasonalityFactor);
      
      // Calculate confidence intervals (±2 standard deviations)
      const confidenceMargin = 2 * stdDev;
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predicted_value: Math.round(adjustedPrediction * 100) / 100,
        confidence_interval: {
          lower: Math.max(0, Math.round((adjustedPrediction - confidenceMargin) * 100) / 100),
          upper: Math.round((adjustedPrediction + confidenceMargin) * 100) / 100
        }
      });
    }

    // Calculate model accuracy metrics
    const mse = residuals.reduce((sum, residual) => sum + residual * residual, 0) / residuals.length;
    const rmse = Math.sqrt(mse);
    const meanActual = salesValues.reduce((sum, val) => sum + val, 0) / salesValues.length;
    const accuracy = Math.max(0, Math.min(100, 100 - (rmse / meanActual) * 100));

    const response = {
      predictions,
      model_info: {
        type: 'linear_regression_with_seasonality',
        data_points: salesData.length,
        days_analyzed: sortedSales.length,
        slope: Math.round(slope * 100) / 100,
        intercept: Math.round(intercept * 100) / 100,
        accuracy_percentage: Math.round(accuracy * 100) / 100,
        rmse: Math.round(rmse * 100) / 100
      },
      historical_data: sortedSales
    };

    console.log('Returning successful prediction response')
    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Critical error in sales-prediction function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error',
        message: `Function execution failed: ${error.message}`,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
