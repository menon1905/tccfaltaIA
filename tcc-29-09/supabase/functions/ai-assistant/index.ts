import { createClient } from 'npm:@supabase/supabase-js@2';
import { OpenAI } from "https://deno.land/x/openai/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiKey) {
      return new Response(
        JSON.stringify({ error: 'Chave da API da OpenAI não configurada.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openai = new OpenAI({ apiKey: openAiKey });

    const systemPrompt = `Você é um assistente de IA especializado em sistemas ERP, integrado ao sistema STOKLY. Sua função é analisar os dados do negócio do usuário e fornecer respostas claras, objetivas e acionáveis. Use o contexto fornecido para responder às perguntas. O contexto é um resumo do estado atual do negócio.

Contexto do Negócio:
${JSON.stringify(context, null, 2)}

Responda sempre em português do Brasil. Seja direto e use formatação markdown para melhorar a legibilidade (listas, negrito, etc.).`;

    const chatCompletion = await openai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      model: "gpt-3.5-turbo",
    });

    const reply = chatCompletion.choices[0].message.content;

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
