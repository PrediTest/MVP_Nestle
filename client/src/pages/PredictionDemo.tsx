import { useState } from "react";
import { PredictionResults } from "@/components/PredictionResults";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

/**
 * Página de demonstração do componente PredictionResults
 * Mostra exemplo de predição para Nescau Zero Açúcar
 */
export default function PredictionDemo() {
  const [showResults, setShowResults] = useState(false);
  const predictMutation = trpc.predictions.predictWithML.useMutation();

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

  const handlePredict = async () => {
    try {
      // Tentar chamar microserviço real
      const result = await predictMutation.mutateAsync({
        projectId: "proj_demo_001",
        productName: "Nescau Zero Açúcar",
        formula: [
          { name: "Cacau em pó", percentage: 35.0, supplier: "Barry Callebaut" },
          { name: "Açúcar", percentage: 45.0 },
          { name: "Lecitina de soja", percentage: 0.5 },
          { name: "Maltodextrina", percentage: 15.0 },
          { name: "Sal", percentage: 0.3 },
          { name: "Vitaminas e minerais", percentage: 4.2 },
        ],
        processParameters: {
          temperature: 75.0,
          mixingTime: 12.0,
          lineSpeed: 95.0,
          pressure: 2.5,
          humidity: 45.0,
          ph: 6.8,
        },
        factory: "Araraquara - SP",
        monteCarloIterations: 10000,
      });

      console.log("Prediction result:", result);
      setShowResults(true);
    } catch (error) {
      console.error("Prediction failed, using mock data:", error);
      // Usar dados mock se microserviço não estiver disponível
      setShowResults(true);
    }
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
        <Button onClick={handlePredict} disabled={predictMutation.isLoading} size="lg">
          {predictMutation.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Predizendo...
            </>
          ) : (
            "Gerar Predição"
          )}
        </Button>
      </div>

      {showResults && (
        <PredictionResults
          projectId={mockPrediction.project_id}
          productName={mockPrediction.product_name}
          overallRiskScore={mockPrediction.overall_risk_score}
          testPredictions={mockPrediction.test_predictions}
          recommendations={mockPrediction.recommendations}
          shapExplanation={mockPrediction.shap_explanation}
          modelVersion={mockPrediction.model_version}
          predictionTimestamp={mockPrediction.prediction_timestamp}
          monteCarloIterations={mockPrediction.monte_carlo_iterations}
        />
      )}

      {!showResults && (
        <div className="text-center py-20 text-muted-foreground">
          <p>Clique em "Gerar Predição" para visualizar os resultados</p>
        </div>
      )}
    </div>
  );
}

