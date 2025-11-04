/**
 * Simulação de Monte Carlo para Análise de Risco em Testes Industriais
 * 
 * Este módulo implementa simulações estocásticas para prever a probabilidade
 * de sucesso de testes industriais considerando variabilidade e incertezas.
 */

interface TestParameter {
  name: string;
  mean: number;
  stdDev: number;
  min?: number;
  max?: number;
  targetValue?: number;
  tolerance?: number;
}

interface SimulationResult {
  iterations: number;
  meanValue: number;
  stdDeviation: number;
  confidenceLevel: number;
  lowerBound: number;
  upperBound: number;
  successProbability: number;
  distributionData: number[];
  percentiles: {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  };
  histogram: {
    bins: number[];
    frequencies: number[];
  };
}

/**
 * Gera número aleatório com distribuição normal (Box-Muller transform)
 */
function randomNormal(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
}

/**
 * Gera número aleatório com distribuição triangular
 */
function randomTriangular(min: number, mode: number, max: number): number {
  const u = Math.random();
  const f = (mode - min) / (max - min);
  
  if (u < f) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

/**
 * Calcula percentil de um array ordenado
 */
function calculatePercentile(sortedArray: number[], percentile: number): number {
  const index = (percentile / 100) * (sortedArray.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  
  if (lower === upper) {
    return sortedArray[lower];
  }
  
  return sortedArray[lower] * (1 - weight) + sortedArray[upper] * weight;
}

/**
 * Cria histograma dos dados
 */
function createHistogram(data: number[], numBins: number = 50): { bins: number[], frequencies: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const binWidth = (max - min) / numBins;
  
  const bins: number[] = [];
  const frequencies: number[] = new Array(numBins).fill(0);
  
  for (let i = 0; i <= numBins; i++) {
    bins.push(min + i * binWidth);
  }
  
  data.forEach(value => {
    const binIndex = Math.min(Math.floor((value - min) / binWidth), numBins - 1);
    frequencies[binIndex]++;
  });
  
  return { bins, frequencies };
}

/**
 * Executa simulação de Monte Carlo para um único parâmetro
 */
export function runMonteCarloSimulation(
  parameter: TestParameter,
  iterations: number = 10000,
  confidenceLevel: number = 95
): SimulationResult {
  const results: number[] = [];
  let successCount = 0;
  
  // Executar simulações
  for (let i = 0; i < iterations; i++) {
    let value: number;
    
    // Gerar valor baseado na distribuição
    if (parameter.min !== undefined && parameter.max !== undefined) {
      // Distribuição triangular se min e max estão definidos
      value = randomTriangular(parameter.min, parameter.mean, parameter.max);
    } else {
      // Distribuição normal padrão
      value = randomNormal(parameter.mean, parameter.stdDev);
      
      // Aplicar limites se definidos
      if (parameter.min !== undefined) value = Math.max(value, parameter.min);
      if (parameter.max !== undefined) value = Math.min(value, parameter.max);
    }
    
    results.push(value);
    
    // Verificar sucesso (dentro da tolerância do target)
    if (parameter.targetValue !== undefined && parameter.tolerance !== undefined) {
      const lowerLimit = parameter.targetValue - parameter.tolerance;
      const upperLimit = parameter.targetValue + parameter.tolerance;
      if (value >= lowerLimit && value <= upperLimit) {
        successCount++;
      }
    }
  }
  
  // Ordenar resultados para cálculos estatísticos
  const sortedResults = [...results].sort((a, b) => a - b);
  
  // Calcular estatísticas
  const mean = results.reduce((sum, val) => sum + val, 0) / iterations;
  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations;
  const stdDev = Math.sqrt(variance);
  
  // Calcular intervalo de confiança
  const alpha = (100 - confidenceLevel) / 100;
  const lowerIndex = Math.floor(alpha / 2 * iterations);
  const upperIndex = Math.floor((1 - alpha / 2) * iterations);
  const lowerBound = sortedResults[lowerIndex];
  const upperBound = sortedResults[upperIndex];
  
  // Calcular percentis
  const percentiles = {
    p5: calculatePercentile(sortedResults, 5),
    p25: calculatePercentile(sortedResults, 25),
    p50: calculatePercentile(sortedResults, 50),
    p75: calculatePercentile(sortedResults, 75),
    p95: calculatePercentile(sortedResults, 95),
  };
  
  // Criar histograma
  const histogram = createHistogram(results);
  
  // Calcular probabilidade de sucesso
  const successProbability = (successCount / iterations) * 100;
  
  return {
    iterations,
    meanValue: mean,
    stdDeviation: stdDev,
    confidenceLevel,
    lowerBound,
    upperBound,
    successProbability,
    distributionData: sortedResults.slice(0, 1000), // Limitar a 1000 pontos para visualização
    percentiles,
    histogram,
  };
}

/**
 * Executa simulação de Monte Carlo para múltiplos parâmetros correlacionados
 */
export function runMultiParameterSimulation(
  parameters: TestParameter[],
  iterations: number = 10000,
  confidenceLevel: number = 95
): {
  overall: SimulationResult;
  individual: Record<string, SimulationResult>;
} {
  const individual: Record<string, SimulationResult> = {};
  const overallResults: number[] = [];
  let overallSuccessCount = 0;
  
  // Simular cada parâmetro individualmente
  parameters.forEach(param => {
    individual[param.name] = runMonteCarloSimulation(param, iterations, confidenceLevel);
  });
  
  // Simulação combinada (média ponderada dos parâmetros)
  for (let i = 0; i < iterations; i++) {
    const values = parameters.map(param => {
      if (param.min !== undefined && param.max !== undefined) {
        return randomTriangular(param.min, param.mean, param.max);
      } else {
        let value = randomNormal(param.mean, param.stdDev);
        if (param.min !== undefined) value = Math.max(value, param.min);
        if (param.max !== undefined) value = Math.min(value, param.max);
        return value;
      }
    });
    
    // Média dos valores (pode ser ajustado para outras métricas)
    const overallValue = values.reduce((sum, val) => sum + val, 0) / values.length;
    overallResults.push(overallValue);
    
    // Verificar se todos os parâmetros passaram
    const allPassed = parameters.every((param, idx) => {
      if (param.targetValue !== undefined && param.tolerance !== undefined) {
        const value = values[idx];
        const lowerLimit = param.targetValue - param.tolerance;
        const upperLimit = param.targetValue + param.tolerance;
        return value >= lowerLimit && value <= upperLimit;
      }
      return true;
    });
    
    if (allPassed) overallSuccessCount++;
  }
  
  // Calcular estatísticas gerais
  const sortedOverall = [...overallResults].sort((a, b) => a - b);
  const mean = overallResults.reduce((sum, val) => sum + val, 0) / iterations;
  const variance = overallResults.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / iterations;
  const stdDev = Math.sqrt(variance);
  
  const alpha = (100 - confidenceLevel) / 100;
  const lowerIndex = Math.floor(alpha / 2 * iterations);
  const upperIndex = Math.floor((1 - alpha / 2) * iterations);
  
  const overall: SimulationResult = {
    iterations,
    meanValue: mean,
    stdDeviation: stdDev,
    confidenceLevel,
    lowerBound: sortedOverall[lowerIndex],
    upperBound: sortedOverall[upperIndex],
    successProbability: (overallSuccessCount / iterations) * 100,
    distributionData: sortedOverall.slice(0, 1000),
    percentiles: {
      p5: calculatePercentile(sortedOverall, 5),
      p25: calculatePercentile(sortedOverall, 25),
      p50: calculatePercentile(sortedOverall, 50),
      p75: calculatePercentile(sortedOverall, 75),
      p95: calculatePercentile(sortedOverall, 95),
    },
    histogram: createHistogram(overallResults),
  };
  
  return { overall, individual };
}

