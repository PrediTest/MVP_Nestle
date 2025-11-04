/**
 * Modelos Computacionais para Testes Industriais de Alimentos
 * Baseado em modelos científicos estabelecidos na área de ciência de alimentos
 */

export interface ModelResult {
  values: number[];
  parameters: Record<string, number>;
  statistics: {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
    median: number;
  };
}

/**
 * 1. Modelo de Solubilidade (Van't Hoff)
 * Prevê a solubilidade de um composto em função da temperatura
 * Equação: S = S0 * exp(-ΔH / (R * T))
 */
export function solubilityModel(
  temperatures: number[], // Temperaturas em °C
  S0: number = 2000, // Solubilidade inicial (g/L)
  deltaH: number = 5000, // Entalpia de dissolução (J/mol)
  noise: number = 50 // Ruído experimental
): ModelResult {
  const R = 8.314; // Constante dos gases (J/(mol·K))
  
  const values = temperatures.map(T => {
    const TKelvin = T + 273.15;
    const solubility = S0 * Math.exp(-deltaH / (R * TKelvin));
    return solubility + (Math.random() - 0.5) * 2 * noise;
  });

  return {
    values,
    parameters: { S0, deltaH, R },
    statistics: calculateStatistics(values),
  };
}

/**
 * 2. Modelo de Dissociação Iônica
 * Modela a dissociação de um ácido fraco em função do pH
 * Equação: Fração dissociada = Ka / (Ka + 10^(-pH))
 */
export function dissociationModel(
  pHValues: number[], // Valores de pH
  Ka: number = 1e-4, // Constante de dissociação
  noise: number = 0.01 // Ruído experimental
): ModelResult {
  const values = pHValues.map(pH => {
    const fraction = Ka / (Ka + Math.pow(10, -pH));
    return Math.max(0, Math.min(1, fraction + (Math.random() - 0.5) * 2 * noise));
  });

  return {
    values,
    parameters: { Ka },
    statistics: calculateStatistics(values),
  };
}

/**
 * 3. Modelo de Estabilidade Textural (Maxwell)
 * Simula a deformação textural sob estresse usando modelo de relaxamento
 * Equação: σ(t) = σ0 * exp(-t / τ)
 */
export function textureModel(
  times: number[], // Tempo em segundos
  sigma0: number = 100, // Estresse inicial (Pa)
  tau: number = 20, // Tempo de relaxamento (s)
  noise: number = 5 // Ruído experimental
): ModelResult {
  const values = times.map(t => {
    const stress = sigma0 * Math.exp(-t / tau);
    return stress + (Math.random() - 0.5) * 2 * noise;
  });

  return {
    values,
    parameters: { sigma0, tau },
    statistics: calculateStatistics(values),
  };
}

/**
 * 4. Modelo de Shelf-Life (Arrhenius)
 * Prevê shelf-life baseado na taxa de degradação térmica
 * Equação: k = A * exp(-Ea / (R * T)), shelf-life = ln(2) / k
 */
export function shelfLifeModel(
  temperatures: number[], // Temperaturas em °C
  A: number = 1e10, // Fator pré-exponencial
  Ea: number = 50000, // Energia de ativação (J/mol)
  noise: number = 0.1 // Ruído relativo (fração)
): ModelResult {
  const R = 8.314; // Constante dos gases
  
  const values = temperatures.map(T => {
    const TKelvin = T + 273.15;
    const k = A * Math.exp(-Ea / (R * TKelvin));
    const shelfLife = Math.log(2) / k;
    return shelfLife * (1 + (Math.random() - 0.5) * 2 * noise);
  });

  return {
    values,
    parameters: { A, Ea, R },
    statistics: calculateStatistics(values),
  };
}

/**
 * 5. Modelo de Crescimento Microbiano (Gompertz)
 * Simula o crescimento de microrganismos
 * Equação simplificada: N(t) = N0 * exp(-exp(μ * e / N0 * (λ - t) + 1))
 */
export function microbialGrowthModel(
  times: number[], // Tempo em horas
  N0: number = 100, // População inicial (UFC/mL)
  mu: number = 0.1, // Taxa de crescimento
  lambda: number = 5, // Fase lag (horas)
  noise: number = 10 // Ruído experimental
): ModelResult {
  const e = Math.E;
  
  const values = times.map(t => {
    const exponent = mu * e / N0 * (lambda - t) + 1;
    const population = N0 * Math.exp(-Math.exp(exponent));
    return Math.max(0, population + (Math.random() - 0.5) * 2 * noise);
  });

  return {
    values,
    parameters: { N0, mu, lambda },
    statistics: calculateStatistics(values),
  };
}

/**
 * Simulação Monte Carlo para qualquer modelo
 * Executa múltiplas iterações com parâmetros variáveis
 */
export function monteCarloSimulation(
  modelFunction: Function,
  baseParams: any[],
  paramVariations: Record<number, { min: number; max: number }>,
  iterations: number = 1000
): {
  results: ModelResult[];
  aggregated: {
    meanValues: number[];
    confidenceInterval: { lower: number[]; upper: number[] };
    statistics: ReturnType<typeof calculateStatistics>;
  };
} {
  const results: ModelResult[] = [];
  
  for (let i = 0; i < iterations; i++) {
    // Variar parâmetros aleatoriamente
    const params = baseParams.map((param, index) => {
      if (paramVariations[index]) {
        const { min, max } = paramVariations[index];
        return min + Math.random() * (max - min);
      }
      return param;
    });
    
    const result = modelFunction(...params);
    results.push(result);
  }
  
  // Agregar resultados
  const allValues = results.map(r => r.values);
  const numPoints = allValues[0].length;
  
  const meanValues: number[] = [];
  const lowerCI: number[] = [];
  const upperCI: number[] = [];
  
  for (let i = 0; i < numPoints; i++) {
    const pointValues = allValues.map(vals => vals[i]);
    const sorted = pointValues.sort((a, b) => a - b);
    
    meanValues.push(pointValues.reduce((a, b) => a + b, 0) / pointValues.length);
    lowerCI.push(sorted[Math.floor(iterations * 0.025)]); // 2.5 percentil
    upperCI.push(sorted[Math.floor(iterations * 0.975)]); // 97.5 percentil
  }
  
  const allMeans = results.map(r => r.statistics.mean);
  
  return {
    results,
    aggregated: {
      meanValues,
      confidenceInterval: { lower: lowerCI, upper: upperCI },
      statistics: calculateStatistics(allMeans),
    },
  };
}

/**
 * Calcula estatísticas descritivas
 */
function calculateStatistics(values: number[]): {
  mean: number;
  stdDev: number;
  min: number;
  max: number;
  median: number;
} {
  const sorted = [...values].sort((a, b) => a - b);
  const n = values.length;
  
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)];
  
  return {
    mean,
    stdDev,
    min: sorted[0],
    max: sorted[n - 1],
    median,
  };
}

/**
 * Gera dados de entrada padrão para cada modelo
 */
export function generateModelInputs(modelType: string): number[] {
  switch (modelType) {
    case 'solubility':
      return Array.from({ length: 50 }, (_, i) => 20 + i * 1.6); // 20°C a 100°C
    case 'dissociation':
      return Array.from({ length: 50 }, (_, i) => 1 + i * 0.12); // pH 1 a 7
    case 'texture':
      return Array.from({ length: 50 }, (_, i) => i * 2); // 0s a 100s
    case 'shelfLife':
      return Array.from({ length: 50 }, (_, i) => 50 + i * 2); // 50°C a 150°C
    case 'microbial':
      return Array.from({ length: 50 }, (_, i) => i * 0.96); // 0h a 48h
    default:
      return Array.from({ length: 50 }, (_, i) => i);
  }
}

