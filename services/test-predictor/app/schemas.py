"""
Pydantic schemas for TestPredictorService API
"""
from typing import List, Dict, Optional, Literal
from pydantic import BaseModel, Field


class FormulaIngredient(BaseModel):
    """Ingrediente da fórmula com percentual"""
    name: str = Field(..., description="Nome do ingrediente (ex: 'Cacau em pó')")
    percentage: float = Field(..., ge=0, le=100, description="Percentual na fórmula (0-100%)")
    supplier: Optional[str] = Field(None, description="Fornecedor do ingrediente")


class ProcessParameters(BaseModel):
    """Parâmetros de processo de fabricação"""
    temperature: float = Field(..., description="Temperatura de processo (°C)")
    mixing_time: float = Field(..., description="Tempo de mistura (minutos)")
    line_speed: float = Field(..., description="Velocidade da linha (m/min)")
    pressure: Optional[float] = Field(None, description="Pressão (bar)")
    humidity: Optional[float] = Field(None, description="Umidade relativa (%)")
    ph: Optional[float] = Field(None, description="pH do produto")


class PredictionRequest(BaseModel):
    """Request para predição de resultados de testes"""
    project_id: str = Field(..., description="ID do projeto")
    product_name: str = Field(..., description="Nome do produto (Nescau Zero Açúcar, Ninho Phases 4, Kit Kat Vegano)")
    formula: List[FormulaIngredient] = Field(..., description="Lista de ingredientes da fórmula")
    process_parameters: ProcessParameters = Field(..., description="Parâmetros de processo")
    factory: str = Field(..., description="Fábrica de produção")
    monte_carlo_iterations: int = Field(10000, ge=1000, le=50000, description="Número de iterações Monte Carlo")


class TestPrediction(BaseModel):
    """Predição de um teste individual"""
    test_name: str = Field(..., description="Nome do teste (ex: 'Solubilidade em leite frio')")
    predicted_value: float = Field(..., description="Valor previsto")
    unit: str = Field(..., description="Unidade de medida (ex: 'segundos', 'cP', '%')")
    spec_limit: Optional[float] = Field(None, description="Limite de especificação")
    status: Literal["PASS", "WARNING", "FAIL"] = Field(..., description="Status da predição")
    confidence_interval: List[float] = Field(..., description="Intervalo de confiança 95% [min, max]")
    probability_of_fail: float = Field(..., ge=0, le=1, description="Probabilidade de falha (0-1)")
    importance_score: Optional[float] = Field(None, description="Importância do teste (0-1)")


class ShapExplanation(BaseModel):
    """Explicação SHAP para interpretabilidade"""
    feature_importance: Dict[str, float] = Field(..., description="Importância de cada feature")
    top_positive_factors: List[str] = Field(..., description="Top 3 fatores que aumentam o risco")
    top_negative_factors: List[str] = Field(..., description="Top 3 fatores que reduzem o risco")
    base_value: float = Field(..., description="Valor base do modelo")


class PredictionResponse(BaseModel):
    """Response com predições completas"""
    project_id: str = Field(..., description="ID do projeto")
    product_name: str = Field(..., description="Nome do produto")
    overall_risk_score: float = Field(..., ge=0, le=100, description="Score de risco geral (0-100)")
    test_predictions: List[TestPrediction] = Field(..., description="Lista de predições de testes")
    recommendations: List[str] = Field(..., description="Recomendações para reduzir risco")
    shap_explanation: ShapExplanation = Field(..., description="Explicação SHAP")
    model_version: str = Field(..., description="Versão do modelo ML")
    prediction_timestamp: str = Field(..., description="Timestamp da predição (ISO 8601)")
    monte_carlo_iterations: int = Field(..., description="Número de iterações Monte Carlo executadas")


class HealthResponse(BaseModel):
    """Response do health check"""
    status: Literal["healthy", "unhealthy"] = Field(..., description="Status do serviço")
    version: str = Field(..., description="Versão do serviço")
    models_loaded: bool = Field(..., description="Se os modelos ML estão carregados")

