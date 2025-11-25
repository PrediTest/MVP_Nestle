"""
TestPredictorService - FastAPI microservice for ML-based test predictions
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
from typing import Dict

from .schemas import (
    PredictionRequest,
    PredictionResponse,
    TestPrediction,
    ShapExplanation,
    HealthResponse
)
from .ml_models import TestPredictorModel, get_test_specifications
from .monte_carlo import (
    MonteCarloSimulator,
    estimate_process_variability,
    estimate_formula_variability
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="TestPredictorService",
    description="ML-based prediction service for industrial test results",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, especificar origins permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global models cache
models_cache: Dict[str, TestPredictorModel] = {}


def get_or_create_model(product_name: str) -> TestPredictorModel:
    """Get cached model or create new one"""
    if product_name not in models_cache:
        logger.info(f"Loading model for product: {product_name}")
        models_cache[product_name] = TestPredictorModel(product_name)
    return models_cache[product_name]


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        models_loaded=len(models_cache) > 0
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict_test_results(request: PredictionRequest):
    """
    Predict test results using ML models + Monte Carlo simulation
    
    Args:
        request: PredictionRequest with formula and process parameters
    
    Returns:
        PredictionResponse with predictions, confidence intervals, and recommendations
    """
    try:
        logger.info(f"Received prediction request for project: {request.project_id}")
        
        # 1. Get ML model for product
        model = get_or_create_model(request.product_name)
        
        # 2. Get base predictions from ML model
        formula_dict = [ing.dict() for ing in request.formula]
        process_dict = request.process_parameters.dict()
        
        ml_predictions = model.predict(formula_dict, process_dict)
        
        # 3. Initialize Monte Carlo simulator
        mc_simulator = MonteCarloSimulator(
            n_iterations=request.monte_carlo_iterations
        )
        
        # 4. Estimate variabilities
        process_var = estimate_process_variability(request.factory)
        formula_var = estimate_formula_variability(formula_dict)
        
        # 5. Get test specifications
        test_specs = get_test_specifications(request.product_name)
        
        # 6. Run simulations for each test
        test_predictions = []
        risk_scores = []
        
        for test_name, (base_pred, model_info) in ml_predictions.items():
            # Get spec for this test
            spec = test_specs.get(test_name, {})
            spec_limit = spec.get('spec_limit')
            limit_type = spec.get('limit_type', 'upper')
            unit = spec.get('unit', 'unidade')
            
            # Run Monte Carlo simulation
            simulated_results, stats = mc_simulator.simulate_test_results(
                base_prediction=base_pred,
                process_variability=process_var,
                formula_variability=formula_var
            )
            
            # Calculate probability of fail
            prob_fail = 0.0
            if spec_limit:
                prob_fail = mc_simulator.calculate_probability_of_fail(
                    simulated_results=simulated_results,
                    spec_limit=spec_limit,
                    limit_type=limit_type
                )
            
            # Get confidence interval
            conf_interval = mc_simulator.get_confidence_interval(simulated_results)
            
            # Determine status
            if prob_fail > 0.20:
                status = "FAIL"
            elif prob_fail > 0.10:
                status = "WARNING"
            else:
                status = "PASS"
            
            # Create test prediction
            test_pred = TestPrediction(
                test_name=test_name.replace('_', ' ').title(),
                predicted_value=round(stats['mean'], 2),
                unit=unit,
                spec_limit=spec_limit,
                status=status,
                confidence_interval=[round(conf_interval[0], 2), round(conf_interval[1], 2)],
                probability_of_fail=round(prob_fail, 3),
                importance_score=sum(model_info['feature_importance'].values())
            )
            
            test_predictions.append(test_pred)
            risk_scores.append(prob_fail * 100)
        
        # 7. Calculate overall risk score
        overall_risk = round(sum(risk_scores) / len(risk_scores), 1) if risk_scores else 0.0
        
        # 8. Generate recommendations
        recommendations = generate_recommendations(
            test_predictions,
            process_dict,
            formula_dict,
            overall_risk
        )
        
        # 9. Create SHAP explanation (simplified)
        shap_explanation = create_shap_explanation(ml_predictions, process_dict, formula_dict)
        
        # 10. Build response
        response = PredictionResponse(
            project_id=request.project_id,
            product_name=request.product_name,
            overall_risk_score=overall_risk,
            test_predictions=test_predictions,
            recommendations=recommendations,
            shap_explanation=shap_explanation,
            model_version="1.0.0-xgboost",
            prediction_timestamp=datetime.utcnow().isoformat() + "Z",
            monte_carlo_iterations=request.monte_carlo_iterations
        )
        
        logger.info(f"Prediction completed. Overall risk: {overall_risk}%")
        return response
        
    except Exception as e:
        logger.error(f"Error during prediction: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


def generate_recommendations(
    predictions: list,
    process_params: Dict,
    formula: list,
    risk_score: float
) -> list:
    """Generate actionable recommendations based on predictions"""
    recommendations = []
    
    # Analyze failed/warning tests
    high_risk_tests = [p for p in predictions if p.status in ["FAIL", "WARNING"]]
    
    if risk_score > 50:
        recommendations.append("🚨 Risco crítico detectado - revisar fórmula completa antes do piloto")
    elif risk_score > 30:
        recommendations.append("⚠️ Risco elevado - ajustes recomendados nos parâmetros de processo")
    
    # Process-specific recommendations
    if process_params.get('temperature', 0) > 80:
        recommendations.append("Reduzir temperatura de processo para 75-78°C para melhorar estabilidade")
    
    if process_params.get('line_speed', 0) > 100:
        recommendations.append("Reduzir velocidade da linha para 90-95 m/min para melhorar qualidade")
    
    if process_params.get('mixing_time', 0) < 10:
        recommendations.append("Aumentar tempo de mistura para 12-15 minutos para melhor homogeneização")
    
    # Formula-specific recommendations
    lecitina_found = any('lecitina' in ing.get('name', '').lower() for ing in formula)
    if not lecitina_found and any('solubilidade' in p.test_name.lower() for p in high_risk_tests):
        recommendations.append("Adicionar lecitina (0.3-0.5%) para melhorar solubilidade")
    
    # Generic recommendation if no specific ones
    if not recommendations:
        recommendations.append("✅ Parâmetros dentro das especificações - prosseguir com piloto")
    
    return recommendations[:5]  # Limit to top 5


def create_shap_explanation(
    ml_predictions: Dict,
    process_params: Dict,
    formula: list
) -> ShapExplanation:
    """Create SHAP-like explanation (simplified)"""
    
    # Aggregate feature importance across all tests
    all_importances = {}
    for test_name, (pred, model_info) in ml_predictions.items():
        for feature, importance in model_info['feature_importance'].items():
            all_importances[feature] = all_importances.get(feature, 0) + importance
    
    # Normalize
    total_importance = sum(all_importances.values())
    if total_importance > 0:
        all_importances = {k: v/total_importance for k, v in all_importances.items()}
    
    # Sort by importance
    sorted_features = sorted(all_importances.items(), key=lambda x: x[1], reverse=True)
    
    # Top positive factors (increase risk)
    top_positive = [f"{feat.replace('_', ' ').title()} (+{imp:.1%})" 
                    for feat, imp in sorted_features[:3]]
    
    # Top negative factors (reduce risk)
    top_negative = [f"{feat.replace('_', ' ').title()} (-{imp:.1%})" 
                    for feat, imp in sorted_features[-3:]]
    
    return ShapExplanation(
        feature_importance=dict(sorted_features[:10]),
        top_positive_factors=top_positive,
        top_negative_factors=top_negative,
        base_value=50.0  # Base risk score
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

