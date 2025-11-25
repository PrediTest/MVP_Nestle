import { useState } from "react";
import { PredictionResults } from "@/components/PredictionResults";
import { PredictionModal } from "@/components/PredictionModal";
import { Button } from "@/components/ui/button";

/**
 * Página de demonstração do componente PredictionResults
 * Mostra exemplo de predição para Nescau Zero Açúcar
 */
export default function PredictionDemo() {
  const [predictionResult, setPredictionResult] = useState<any>(null);
  const [showResults, setShowResults] = useState(false);

  // Dados de exemplo para demonstração (caso microserviço não esteja disponível)
  const mockPrediction = {
    project_id: "proj_demo_001",
    product_name: "Nescau Zero Açúcar",
    overall_risk_score: 15.3,
    test_predictions: [
      {
        test_name: "Solubilidade em Leite Frio",
        predicted_value: 26.4,
        unit: "segundos",
        spec_limit: 30.0,
        status: "PASS" as const,
        confidence_interval: [24.1, 28.9] as [number, number],
        probability_of_fail: 0.07,
        importance_score: 0.85,
      },
      {
        test_name: "Viscosidade",
        predicted_value: 45.2,
        unit: "cP",
        spec_limit: 60.0,
        status: "PASS" as const,
        confidence_interval: [41.8, 48.9] as [number, number],
        probability_of_fail: 0.02,
        importance_score: 0.75,
      },
      {
        test_name: "Shelf Life",
        predicted_value: 368,
        unit: "dias",
        spec_limit: 300.0,
        status: "PASS" as const,
        confidence_interval: [340, 395] as [number, number],
        probability_of_fail: 0.01,
        importance_score: 0.90,
      },
      {
        test_name: "Perda de Ferro",
        predicted_value: 8.7,
        unit: "%",
        spec_limit: 12.0,
        status: "PASS" as const,
        confidence_interval: [7.5, 9.9] as [number, number],
        probability_of_fail: 0.05,
        importance_score: 0.70,
      },
    ],
    recommendations: [
      "✅ Parâmetros dentro das especificações - prosseguir com piloto",
      "Manter temperatura em 75°C para estabilidade ótima",
      "Lecitina em 0.5% garante boa solubilidade",
      "Monitorar shelf-life durante primeiros 6 meses de produção",
    ],
    shap_explanation: {
      feature_importance: {
        lecitina_percentage: 0.35,
        mixing_time: 0.25,
        temperature: 0.20,
        cacau_percentage: 0.15,
        line_speed: 0.05,
        maltodextrina_percentage: 0.04,
        humidity: 0.03,
        ph: 0.02,
      },
      top_positive_factors: [
        "Lecitina Percentage (+35.0%)",
        "Mixing Time (+25.0%)",
        "Temperature (+20.0%)",
      ],
      top_negative_factors: ["Line Speed (-5.0%)", "Humidity (-3.0%)", "pH (-2.0%)"],
      base_value: 50.0,
    },
    model_version: "1.0.0-xgboost",
    prediction_timestamp: new Date().toISOString(),
    monte_carlo_iterations: 10000,
  };

  const handlePredictionComplete = (prediction: any) => {
    console.log("Prediction completed:", prediction);
    setPredictionResult(prediction);
    setShowResults(true);
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Predição ML - Demonstração</h1>
          <p className="text-muted-foreground mt-2">
            Exemplo de predição de resultados de testes para Nescau Zero Açúcar
          </p>
        </div>
        <PredictionModal projectId="proj_demo_001" onPredictionComplete={handlePredictionComplete} />
      </div>

      {showResults && predictionResult && (
        <PredictionResults
          projectId={predictionResult.project_id || mockPrediction.project_id}
          productName={predictionResult.product_name || mockPrediction.product_name}
          overallRiskScore={predictionResult.overall_risk_score || mockPrediction.overall_risk_score}
          testPredictions={predictionResult.test_predictions || mockPrediction.test_predictions}
          recommendations={predictionResult.recommendations || mockPrediction.recommendations}
          shapExplanation={predictionResult.shap_explanation || mockPrediction.shap_explanation}
          modelVersion={predictionResult.model_version || mockPrediction.model_version}
          predictionTimestamp={predictionResult.prediction_timestamp || mockPrediction.prediction_timestamp}
          monteCarloIterations={predictionResult.monte_carlo_iterations || mockPrediction.monte_carlo_iterations}
        />
      )}

      {!showResults && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Clique em "Gerar Predição ML" para abrir o modal e inserir os dados</p>
        </div>
      )}
    </div>
  );
}

