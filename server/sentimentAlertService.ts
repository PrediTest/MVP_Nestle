/**
 * Serviço de Monitoramento de Sentimento e Detecção de Alertas
 * 
 * Este serviço analisa os dados de sentimento e detecta anomalias que requerem atenção,
 * como picos de sentimento negativo ou quedas abruptas no sentimento médio.
 */

import { notifyOwner } from "./_core/notification";

interface SentimentData {
  sentiment: string;
  sentimentScore: string | null;
  createdAt: Date | null;
}

interface AlertThresholds {
  negativeThreshold: number; // % de posts negativos
  veryNegativeThreshold: number; // % de posts muito negativos
  sentimentDropThreshold: number; // % de queda no sentimento
  minPostsRequired: number;
}

interface AlertResult {
  shouldAlert: boolean;
  alertType?: "negative_spike" | "very_negative_spike" | "negative_threshold" | "sentiment_drop";
  severity?: "low" | "medium" | "high" | "critical";
  currentValue?: number;
  thresholdValue?: number;
  affectedPosts?: number;
  message?: string;
}

/**
 * Analisa dados de sentimento e detecta se há necessidade de criar um alerta
 */
export function analyzeSentimentForAlerts(
  posts: SentimentData[],
  thresholds: AlertThresholds,
  historicalAverage?: number
): AlertResult {
  if (posts.length < thresholds.minPostsRequired) {
    return { shouldAlert: false };
  }

  // Contar posts por categoria de sentimento
  const sentimentCounts = {
    veryPositive: 0,
    positive: 0,
    neutral: 0,
    negative: 0,
    veryNegative: 0,
  };

  let totalScore = 0;

  posts.forEach((post) => {
    const sentiment = post.sentiment;
    if (sentiment === "very_positive") sentimentCounts.veryPositive++;
    else if (sentiment === "positive") sentimentCounts.positive++;
    else if (sentiment === "neutral") sentimentCounts.neutral++;
    else if (sentiment === "negative") sentimentCounts.negative++;
    else if (sentiment === "very_negative") sentimentCounts.veryNegative++;

    totalScore += parseFloat(post.sentimentScore || "0");
  });

  const total = posts.length;
  const negativePercentage = ((sentimentCounts.negative + sentimentCounts.veryNegative) / total) * 100;
  const veryNegativePercentage = (sentimentCounts.veryNegative / total) * 100;
  const averageScore = totalScore / total;

  // 1. Verificar pico de posts muito negativos (crítico)
  if (veryNegativePercentage >= thresholds.veryNegativeThreshold) {
    return {
      shouldAlert: true,
      alertType: "very_negative_spike",
      severity: "critical",
      currentValue: Math.round(veryNegativePercentage),
      thresholdValue: thresholds.veryNegativeThreshold,
      affectedPosts: sentimentCounts.veryNegative,
      message: `Pico crítico detectado: ${Math.round(veryNegativePercentage)}% dos posts são muito negativos (${sentimentCounts.veryNegative} de ${total} posts). Threshold: ${thresholds.veryNegativeThreshold}%. Ação imediata recomendada.`,
    };
  }

  // 2. Verificar pico de posts negativos (alto)
  if (negativePercentage >= thresholds.negativeThreshold) {
    return {
      shouldAlert: true,
      alertType: "negative_spike",
      severity: "high",
      currentValue: Math.round(negativePercentage),
      thresholdValue: thresholds.negativeThreshold,
      affectedPosts: sentimentCounts.negative + sentimentCounts.veryNegative,
      message: `Pico de sentimento negativo detectado: ${Math.round(negativePercentage)}% dos posts são negativos (${sentimentCounts.negative + sentimentCounts.veryNegative} de ${total} posts). Threshold: ${thresholds.negativeThreshold}%. Requer atenção.`,
    };
  }

  // 3. Verificar queda abrupta no sentimento médio (médio)
  if (historicalAverage !== undefined) {
    const sentimentDrop = ((historicalAverage - averageScore) / Math.abs(historicalAverage)) * 100;
    
    if (sentimentDrop >= thresholds.sentimentDropThreshold) {
      return {
        shouldAlert: true,
        alertType: "sentiment_drop",
        severity: "medium",
        currentValue: Math.round(sentimentDrop),
        thresholdValue: thresholds.sentimentDropThreshold,
        affectedPosts: total,
        message: `Queda significativa no sentimento médio detectada: ${Math.round(sentimentDrop)}% de queda em relação à média histórica. Score atual: ${averageScore.toFixed(2)}, Média histórica: ${historicalAverage.toFixed(2)}.`,
      };
    }
  }

  // 4. Verificar threshold de negatividade (baixo)
  if (negativePercentage >= thresholds.negativeThreshold * 0.7) {
    return {
      shouldAlert: true,
      alertType: "negative_threshold",
      severity: "low",
      currentValue: Math.round(negativePercentage),
      thresholdValue: thresholds.negativeThreshold,
      affectedPosts: sentimentCounts.negative + sentimentCounts.veryNegative,
      message: `Aproximando-se do threshold de negatividade: ${Math.round(negativePercentage)}% dos posts são negativos. Threshold: ${thresholds.negativeThreshold}%. Monitoramento recomendado.`,
    };
  }

  return { shouldAlert: false };
}

/**
 * Calcula a média histórica de sentimento para um projeto
 */
export function calculateHistoricalAverage(historicalPosts: SentimentData[]): number {
  if (historicalPosts.length === 0) return 0;

  const totalScore = historicalPosts.reduce((sum, post) => {
    return sum + parseFloat(post.sentimentScore || "0");
  }, 0);

  return totalScore / historicalPosts.length;
}

/**
 * Cria e envia notificação de alerta para o owner
 */
export async function sendAlertNotification(
  projectName: string,
  platform: string,
  alertResult: AlertResult
): Promise<boolean> {
  if (!alertResult.shouldAlert || !alertResult.message) {
    return false;
  }

  const severityEmoji = {
    low: "⚠️",
    medium: "🔶",
    high: "🔴",
    critical: "🚨",
  };

  const emoji = severityEmoji[alertResult.severity || "medium"];
  const platformLabel = getPlatformLabel(platform);

  const title = `${emoji} Alerta de Sentimento - ${projectName}`;
  const content = `
**Plataforma:** ${platformLabel}
**Severidade:** ${alertResult.severity?.toUpperCase()}
**Tipo:** ${getAlertTypeLabel(alertResult.alertType!)}

${alertResult.message}

**Detalhes:**
- Valor Atual: ${alertResult.currentValue}%
- Threshold: ${alertResult.thresholdValue}%
- Posts Afetados: ${alertResult.affectedPosts}

Acesse o painel de administração para mais detalhes e ações recomendadas.
  `.trim();

  try {
    const success = await notifyOwner({ title, content });
    return success;
  } catch (error) {
    console.error("[SentimentAlertService] Erro ao enviar notificação:", error);
    return false;
  }
}

/**
 * Determina o período de análise baseado na configuração
 */
export function getAnalysisPeriod(timeWindow: string): Date {
  const now = new Date();
  const hours = parseInt(timeWindow.replace("h", "")) || 24;
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

/**
 * Formata label da plataforma
 */
function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    all: "Todas as Plataformas",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    reclameaqui: "Reclame Aqui",
    nestle_site: "Site Nestlé",
  };
  return labels[platform] || platform;
}

/**
 * Formata label do tipo de alerta
 */
function getAlertTypeLabel(alertType: string): string {
  const labels: Record<string, string> = {
    negative_spike: "Pico de Sentimento Negativo",
    very_negative_spike: "Pico Crítico de Sentimento Muito Negativo",
    negative_threshold: "Threshold de Negatividade Atingido",
    sentiment_drop: "Queda Abrupta no Sentimento Médio",
  };
  return labels[alertType] || alertType;
}

/**
 * Verifica se um alerta similar já foi criado recentemente (evita duplicatas)
 */
export function isDuplicateAlert(
  existingAlerts: any[],
  newAlert: AlertResult,
  projectId: string,
  platform: string,
  hoursWindow: number = 6
): boolean {
  const cutoffTime = new Date(Date.now() - hoursWindow * 60 * 60 * 1000);

  return existingAlerts.some((alert) => {
    return (
      alert.projectId === projectId &&
      alert.platform === platform &&
      alert.alertType === newAlert.alertType &&
      alert.status === "active" &&
      new Date(alert.createdAt) > cutoffTime
    );
  });
}

