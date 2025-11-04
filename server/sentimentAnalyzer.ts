import { invokeLLM } from "./_core/llm";

/**
 * Módulo de Análise de Sentimento
 * Utiliza LLM para analisar sentimento de posts de redes sociais
 */

export interface SentimentResult {
  sentiment: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  sentimentScore: number; // -1 a 1
  confidence: number; // 0 a 100
  keywords: string[];
  topics: string[];
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
  language: string;
}

/**
 * Analisa o sentimento de um texto usando LLM
 */
export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em análise de sentimento para produtos da Nestlé.
Analise o texto fornecido e retorne um JSON com a seguinte estrutura:
{
  "sentiment": "very_positive" | "positive" | "neutral" | "negative" | "very_negative",
  "sentimentScore": número entre -1 (muito negativo) e 1 (muito positivo),
  "confidence": número entre 0 e 100 indicando confiança da análise,
  "keywords": array de palavras-chave relevantes,
  "topics": array de tópicos identificados (sabor, textura, embalagem, preço, qualidade, etc),
  "emotions": {
    "joy": 0-100,
    "sadness": 0-100,
    "anger": 0-100,
    "fear": 0-100,
    "surprise": 0-100
  },
  "language": código do idioma (pt, en, es, etc)
}

Considere:
- Contexto de produtos alimentícios da Nestlé
- Gírias e expressões brasileiras
- Emojis e emoticons
- Sarcasmo e ironia
- Aspectos específicos: sabor, textura, embalagem, preço, qualidade, disponibilidade`
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "sentiment_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              sentiment: {
                type: "string",
                enum: ["very_positive", "positive", "neutral", "negative", "very_negative"],
                description: "Sentimento geral do texto"
              },
              sentimentScore: {
                type: "number",
                description: "Score numérico do sentimento (-1 a 1)"
              },
              confidence: {
                type: "number",
                description: "Confiança da análise (0-100)"
              },
              keywords: {
                type: "array",
                items: { type: "string" },
                description: "Palavras-chave relevantes"
              },
              topics: {
                type: "array",
                items: { type: "string" },
                description: "Tópicos identificados"
              },
              emotions: {
                type: "object",
                properties: {
                  joy: { type: "number" },
                  sadness: { type: "number" },
                  anger: { type: "number" },
                  fear: { type: "number" },
                  surprise: { type: "number" }
                },
                required: ["joy", "sadness", "anger", "fear", "surprise"],
                additionalProperties: false
              },
              language: {
                type: "string",
                description: "Código do idioma"
              }
            },
            required: ["sentiment", "sentimentScore", "confidence", "keywords", "topics", "emotions", "language"],
            additionalProperties: false
          }
        }
      }
    });

    const content = response.choices[0].message.content;
    if (!content || typeof content !== 'string') {
      throw new Error("No content in LLM response");
    }

    const result = JSON.parse(content) as SentimentResult;
    return result;

  } catch (error) {
    console.error("[SentimentAnalyzer] Error analyzing sentiment:", error);
    
    // Fallback: análise básica por palavras-chave
    return fallbackSentimentAnalysis(text);
  }
}

/**
 * Análise de sentimento fallback (sem LLM)
 */
function fallbackSentimentAnalysis(text: string): SentimentResult {
  const lowerText = text.toLowerCase();
  
  // Palavras positivas
  const positiveWords = [
    "ótimo", "excelente", "maravilhoso", "delicioso", "gostoso", "amei", "adorei",
    "perfeito", "incrível", "top", "bom", "boa", "melhor", "recomendo", "aprovado"
  ];
  
  // Palavras negativas
  const negativeWords = [
    "ruim", "péssimo", "horrível", "nojento", "terrível", "odiei", "detestei",
    "pior", "nunca mais", "decepção", "lixo", "problema", "defeito", "reclamação"
  ];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  positiveWords.forEach(word => {
    if (lowerText.includes(word)) positiveCount++;
  });
  
  negativeWords.forEach(word => {
    if (lowerText.includes(word)) negativeCount++;
  });
  
  const total = positiveCount + negativeCount;
  const score = total > 0 ? (positiveCount - negativeCount) / total : 0;
  
  let sentiment: SentimentResult["sentiment"];
  if (score > 0.5) sentiment = "very_positive";
  else if (score > 0.1) sentiment = "positive";
  else if (score > -0.1) sentiment = "neutral";
  else if (score > -0.5) sentiment = "negative";
  else sentiment = "very_negative";
  
  return {
    sentiment,
    sentimentScore: score,
    confidence: 50, // Baixa confiança no fallback
    keywords: extractKeywords(text),
    topics: ["geral"],
    emotions: {
      joy: sentiment === "very_positive" || sentiment === "positive" ? 70 : 30,
      sadness: sentiment === "very_negative" || sentiment === "negative" ? 70 : 30,
      anger: sentiment === "very_negative" ? 60 : 20,
      fear: 20,
      surprise: 30
    },
    language: "pt"
  };
}

/**
 * Extrai palavras-chave básicas do texto
 */
function extractKeywords(text: string): string[] {
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 3);
  
  // Remover stopwords comuns
  const stopwords = ["para", "com", "uma", "que", "mais", "como", "este", "esta", "esse", "essa"];
  const filtered = words.filter(word => !stopwords.includes(word));
  
  // Contar frequência
  const frequency: Record<string, number> = {};
  filtered.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // Retornar top 5
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

/**
 * Analisa múltiplos textos em lote
 */
export async function analyzeSentimentBatch(texts: string[]): Promise<SentimentResult[]> {
  const results: SentimentResult[] = [];
  
  for (const text of texts) {
    try {
      const result = await analyzeSentiment(text);
      results.push(result);
    } catch (error) {
      console.error("[SentimentAnalyzer] Error in batch analysis:", error);
      results.push(fallbackSentimentAnalysis(text));
    }
  }
  
  return results;
}

/**
 * Calcula resumo de sentimentos
 */
export function calculateSentimentSummary(analyses: SentimentResult[]) {
  if (analyses.length === 0) {
    return {
      totalPosts: 0,
      veryPositiveCount: 0,
      positiveCount: 0,
      neutralCount: 0,
      negativeCount: 0,
      veryNegativeCount: 0,
      averageSentiment: 0,
      averageConfidence: 0,
      topKeywords: [],
      topTopics: []
    };
  }
  
  const counts = {
    very_positive: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    very_negative: 0
  };
  
  let totalScore = 0;
  let totalConfidence = 0;
  const allKeywords: string[] = [];
  const allTopics: string[] = [];
  
  analyses.forEach(analysis => {
    counts[analysis.sentiment]++;
    totalScore += analysis.sentimentScore;
    totalConfidence += analysis.confidence;
    allKeywords.push(...analysis.keywords);
    allTopics.push(...analysis.topics);
  });
  
  // Contar frequência de keywords e topics
  const keywordFreq: Record<string, number> = {};
  const topicFreq: Record<string, number> = {};
  
  allKeywords.forEach(kw => {
    keywordFreq[kw] = (keywordFreq[kw] || 0) + 1;
  });
  
  allTopics.forEach(topic => {
    topicFreq[topic] = (topicFreq[topic] || 0) + 1;
  });
  
  const topKeywords = Object.entries(keywordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([kw]) => kw);
  
  const topTopics = Object.entries(topicFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
  
  return {
    totalPosts: analyses.length,
    veryPositiveCount: counts.very_positive,
    positiveCount: counts.positive,
    neutralCount: counts.neutral,
    negativeCount: counts.negative,
    veryNegativeCount: counts.very_negative,
    averageSentiment: totalScore / analyses.length,
    averageConfidence: totalConfidence / analyses.length,
    topKeywords,
    topTopics
  };
}

