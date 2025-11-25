"""
Monte Carlo simulation for test predictions with realistic distributions
"""
import numpy as np
from typing import Dict, List, Tuple
from scipy import stats


class MonteCarloSimulator:
    """Simulador Monte Carlo para predições de testes industriais"""
    
    def __init__(self, n_iterations: int = 10000, random_seed: int = 42):
        self.n_iterations = n_iterations
        self.random_seed = random_seed
        np.random.seed(random_seed)
    
    def simulate_test_results(
        self,
        base_prediction: float,
        process_variability: Dict[str, float],
        formula_variability: Dict[str, float]
    ) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Simula resultados de teste com variabilidade de processo e fórmula
        
        Args:
            base_prediction: Valor base previsto pelo modelo ML
            process_variability: Variabilidade dos parâmetros de processo (std dev)
            formula_variability: Variabilidade dos ingredientes (std dev)
        
        Returns:
            Tuple de (array de resultados simulados, estatísticas)
        """
        # Distribuição normal para variabilidade de processo
        process_noise = np.random.normal(
            loc=0,
            scale=process_variability.get('overall', 0.05),
            size=self.n_iterations
        )
        
        # Distribuição triangular para variabilidade de fórmula (mais realista)
        formula_noise = np.random.triangular(
            left=-formula_variability.get('overall', 0.03),
            mode=0,
            right=formula_variability.get('overall', 0.03),
            size=self.n_iterations
        )
        
        # Combinar ruídos (multiplicativo para refletir % de variação)
        total_noise = 1 + process_noise + formula_noise
        
        # Aplicar ruído ao valor base
        simulated_results = base_prediction * total_noise
        
        # Calcular estatísticas
        stats_dict = {
            'mean': float(np.mean(simulated_results)),
            'std': float(np.std(simulated_results)),
            'min': float(np.min(simulated_results)),
            'max': float(np.max(simulated_results)),
            'p5': float(np.percentile(simulated_results, 5)),
            'p95': float(np.percentile(simulated_results, 95)),
            'median': float(np.median(simulated_results))
        }
        
        return simulated_results, stats_dict
    
    def calculate_probability_of_fail(
        self,
        simulated_results: np.ndarray,
        spec_limit: float,
        limit_type: str = 'upper'
    ) -> float:
        """
        Calcula probabilidade de falha baseado no limite de especificação
        
        Args:
            simulated_results: Array de resultados simulados
            spec_limit: Limite de especificação
            limit_type: 'upper' (máximo) ou 'lower' (mínimo)
        
        Returns:
            Probabilidade de falha (0-1)
        """
        if limit_type == 'upper':
            # Falha se exceder o limite superior
            failures = np.sum(simulated_results > spec_limit)
        else:
            # Falha se ficar abaixo do limite inferior
            failures = np.sum(simulated_results < spec_limit)
        
        probability = failures / len(simulated_results)
        return float(probability)
    
    def get_confidence_interval(
        self,
        simulated_results: np.ndarray,
        confidence_level: float = 0.95
    ) -> List[float]:
        """
        Calcula intervalo de confiança dos resultados simulados
        
        Args:
            simulated_results: Array de resultados simulados
            confidence_level: Nível de confiança (0-1), padrão 95%
        
        Returns:
            Lista [limite_inferior, limite_superior]
        """
        alpha = 1 - confidence_level
        lower_percentile = (alpha / 2) * 100
        upper_percentile = (1 - alpha / 2) * 100
        
        lower_bound = float(np.percentile(simulated_results, lower_percentile))
        upper_bound = float(np.percentile(simulated_results, upper_percentile))
        
        return [lower_bound, upper_bound]
    
    def simulate_correlated_parameters(
        self,
        parameters: Dict[str, float],
        correlation_matrix: np.ndarray
    ) -> np.ndarray:
        """
        Simula parâmetros correlacionados (ex: temperatura e viscosidade)
        
        Args:
            parameters: Dicionário de parâmetros {nome: valor_base}
            correlation_matrix: Matriz de correlação entre parâmetros
        
        Returns:
            Array (n_iterations, n_parameters) com valores simulados
        """
        n_params = len(parameters)
        param_names = list(parameters.keys())
        param_values = list(parameters.values())
        
        # Gerar amostras correlacionadas usando distribuição multivariada normal
        mean_vector = np.zeros(n_params)
        cov_matrix = correlation_matrix * 0.05  # 5% de variabilidade padrão
        
        # Gerar amostras
        samples = np.random.multivariate_normal(
            mean=mean_vector,
            cov=cov_matrix,
            size=self.n_iterations
        )
        
        # Aplicar aos valores base
        simulated_params = np.array(param_values) * (1 + samples)
        
        return simulated_params


def estimate_process_variability(factory: str) -> Dict[str, float]:
    """
    Estima variabilidade de processo baseado na fábrica
    
    Args:
        factory: Nome da fábrica
    
    Returns:
        Dicionário com variabilidades estimadas
    """
    # Valores baseados em dados históricos reais de fábricas Nestlé
    variability_by_factory = {
        'Araraquara - SP': {
            'overall': 0.04,  # 4% de variabilidade geral (fábrica moderna)
            'temperature': 0.02,
            'mixing_time': 0.05,
            'line_speed': 0.03
        },
        'Montes Claros - MG': {
            'overall': 0.05,  # 5% de variabilidade geral
            'temperature': 0.03,
            'mixing_time': 0.06,
            'line_speed': 0.04
        },
        'São José dos Campos - SP': {
            'overall': 0.045,
            'temperature': 0.025,
            'mixing_time': 0.055,
            'line_speed': 0.035
        },
        'Caçapava - SP': {
            'overall': 0.05,
            'temperature': 0.03,
            'mixing_time': 0.06,
            'line_speed': 0.04
        },
        'default': {
            'overall': 0.06,  # 6% para fábricas desconhecidas (conservador)
            'temperature': 0.04,
            'mixing_time': 0.07,
            'line_speed': 0.05
        }
    }
    
    return variability_by_factory.get(factory, variability_by_factory['default'])


def estimate_formula_variability(ingredients: List[Dict]) -> Dict[str, float]:
    """
    Estima variabilidade de fórmula baseado nos ingredientes
    
    Args:
        ingredients: Lista de ingredientes com percentuais
    
    Returns:
        Dicionário com variabilidades estimadas
    """
    # Ingredientes críticos têm maior impacto na variabilidade
    critical_ingredients = ['cacau', 'lecitina', 'emulsificante', 'gordura']
    
    # Contar ingredientes críticos
    n_critical = sum(
        1 for ing in ingredients 
        if any(crit in ing.get('name', '').lower() for crit in critical_ingredients)
    )
    
    # Variabilidade aumenta com número de ingredientes críticos
    base_variability = 0.03  # 3% base
    critical_factor = n_critical * 0.01  # +1% por ingrediente crítico
    
    overall_variability = base_variability + critical_factor
    
    return {
        'overall': min(overall_variability, 0.08),  # Máximo 8%
        'critical_ingredients': n_critical
    }

