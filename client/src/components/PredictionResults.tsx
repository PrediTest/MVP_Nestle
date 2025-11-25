import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, ErrorBar } from "recharts";
import { CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Lightbulb } from "lucide-react";

interface TestPrediction {
  test_name: string;
  predicted_value: number;
  unit: string;
  spec_limit?: number;
  status: "PASS" | "WARNING" | "FAIL";
  confidence_interval: [number, number];
  probability_of_fail: number;
  importance_score?: number;
}

interface ShapExplanation {
  feature_importance: Record<string, number>;
  top_positive_factors: string[];
  top_negative_factors: string[];
  base_value: number;
}

interface PredictionResultsProps {
  projectId: string;
  productName: string;
  overallRiskScore: number;
  testPredictions: TestPrediction[];
  recommendations: string[];
  shapExplanation: ShapExplanation;
  modelVersion: string;
  predictionTimestamp: string;
  monteCarloIterations: number;
}

export function PredictionResults({
  projectId,
  productName,
  overallRiskScore,
  testPredictions,
  recommendations,
  shapExplanation,
  modelVersion,
  predictionTimestamp,
  monteCarloIterations,
}: PredictionResultsProps) {
  // Determine overall status based on risk score
  const getOverallStatus = () => {
    if (overallRiskScore < 20) return { label: "Baixo Risco", color: "bg-green-500", icon: CheckCircle2 };
    if (overallRiskScore < 40) return { label: "Risco Moderado", color: "bg-yellow-500", icon: AlertTriangle };
    return { label: "Alto Risco", color: "bg-red-500", icon: XCircle };
  };

  const overallStatus = getOverallStatus();
  const StatusIcon = overallStatus.icon;

  // Prepare data for confidence interval chart
  const chartData = testPredictions.map((test) => ({
    name: test.test_name,
    value: test.predicted_value,
    errorLow: test.predicted_value - test.confidence_interval[0],
    errorHigh: test.confidence_interval[1] - test.predicted_value,
    status: test.status,
    unit: test.unit,
    specLimit: test.spec_limit,
  }));

  // Prepare data for feature importance chart
  const featureImportanceData = Object.entries(shapExplanation.feature_importance)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([feature, importance]) => ({
      feature: feature.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      importance: importance * 100,
    }));

  // Get color for test status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PASS":
        return "#10b981"; // green
      case "WARNING":
        return "#f59e0b"; // yellow
      case "FAIL":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = {
      PASS: { variant: "default" as const, className: "bg-green-500 hover:bg-green-600" },
      WARNING: { variant: "default" as const, className: "bg-yellow-500 hover:bg-yellow-600" },
      FAIL: { variant: "destructive" as const, className: "" },
    };
    return config[status as keyof typeof config] || config.PASS;
  };

  return (
    <div className="space-y-6">
      {/* Overall Risk Score */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Predição de Risco - {productName}</CardTitle>
              <CardDescription>
                Modelo: {modelVersion} | Monte Carlo: {monteCarloIterations.toLocaleString()} iterações
              </CardDescription>
            </div>
            <Badge className={`${overallStatus.color} text-white px-4 py-2 text-lg`}>
              <StatusIcon className="mr-2 h-5 w-5" />
              {overallStatus.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Score de Risco Geral</span>
                <span className="text-2xl font-bold">{overallRiskScore.toFixed(1)}%</span>
              </div>
              <Progress value={overallRiskScore} className="h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              Baseado em {testPredictions.length} testes previstos com intervalos de confiança de 95%
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Test Predictions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Predições de Testes Individuais</CardTitle>
          <CardDescription>Resultados previstos com intervalos de confiança</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Teste</th>
                  <th className="text-right py-3 px-4 font-medium">Valor Previsto</th>
                  <th className="text-right py-3 px-4 font-medium">Intervalo 95%</th>
                  <th className="text-right py-3 px-4 font-medium">Limite Spec</th>
                  <th className="text-right py-3 px-4 font-medium">Prob. Falha</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {testPredictions.map((test, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">{test.test_name}</td>
                    <td className="text-right py-3 px-4">
                      {test.predicted_value.toFixed(2)} {test.unit}
                    </td>
                    <td className="text-right py-3 px-4 text-sm text-muted-foreground">
                      [{test.confidence_interval[0].toFixed(2)}, {test.confidence_interval[1].toFixed(2)}]
                    </td>
                    <td className="text-right py-3 px-4 text-sm">
                      {test.spec_limit ? `${test.spec_limit.toFixed(2)} ${test.unit}` : "N/A"}
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className={test.probability_of_fail > 0.2 ? "text-red-500 font-semibold" : ""}>
                        {(test.probability_of_fail * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge {...getStatusBadge(test.status)}>{test.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confidence Intervals Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Intervalos de Confiança (95%)</CardTitle>
          <CardDescription>Valores previstos com margens de erro</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis label={{ value: "Valor", angle: -90, position: "insideLeft" }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background border rounded-lg p-3 shadow-lg">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm">
                          Valor: {data.value.toFixed(2)} {data.unit}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          IC 95%: [{(data.value - data.errorLow).toFixed(2)}, {(data.value + data.errorHigh).toFixed(2)}]
                        </p>
                        {data.specLimit && (
                          <p className="text-sm">Limite: {data.specLimit.toFixed(2)} {data.unit}</p>
                        )}
                        <Badge {...getStatusBadge(data.status)} className="mt-1">
                          {data.status}
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              <Bar dataKey="value" name="Valor Previsto">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                ))}
                <ErrorBar dataKey="errorLow" direction="y" width={4} strokeWidth={2} />
                <ErrorBar dataKey="errorHigh" direction="y" width={4} strokeWidth={2} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* SHAP Feature Importance */}
      <Card>
        <CardHeader>
          <CardTitle>Explicabilidade (SHAP) - Fatores de Impacto</CardTitle>
          <CardDescription>Importância de cada fator na predição de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={featureImportanceData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: "Importância (%)", position: "insideBottom", offset: -5 }} />
              <YAxis dataKey="feature" type="category" width={110} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-lg">
                        <p className="font-semibold text-sm">{payload[0].payload.feature}</p>
                        <p className="text-sm">Importância: {payload[0].value?.toFixed(1)}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-red-500">
                <TrendingUp className="h-4 w-4" />
                Fatores que Aumentam Risco
              </h4>
              <ul className="space-y-1">
                {shapExplanation.top_positive_factors.map((factor, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-red-500">▲</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-green-500">
                <TrendingDown className="h-4 w-4" />
                Fatores que Reduzem Risco
              </h4>
              <ul className="space-y-1">
                {shapExplanation.top_negative_factors.map((factor, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-green-500">▼</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Recomendações
          </CardTitle>
          <CardDescription>Ações sugeridas para otimizar resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendations.map((rec, idx) => (
              <Alert key={idx}>
                <AlertDescription className="flex items-start gap-2">
                  <span className="font-semibold text-primary">{idx + 1}.</span>
                  <span>{rec}</span>
                </AlertDescription>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Metadata Footer */}
      <div className="text-xs text-muted-foreground text-center">
        Predição gerada em {new Date(predictionTimestamp).toLocaleString("pt-BR")} | Projeto: {projectId}
      </div>
    </div>
  );
}

