import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Loader2, TrendingUp, BarChart3 } from "lucide-react";
import { useState } from "react";

interface MonteCarloSimulationCardProps {
  projectId: string;
  projectName: string;
}

const modelInfo = {
  solubility: {
    title: "Solubilidade (Van't Hoff)",
    description: "Simulação de solubilidade em função da temperatura",
    xLabel: "Temperatura (°C)",
    yLabel: "Solubilidade (g/L)",
    color: "#3b82f6",
  },
  dissociation: {
    title: "Dissociação Iônica",
    description: "Modelagem de dissociação usando constante de equilíbrio",
    xLabel: "pH",
    yLabel: "Fração Dissociada",
    color: "#8b5cf6",
  },
  texture: {
    title: "Estabilidade Textural (Maxwell)",
    description: "Análise de textura usando modelo reológico",
    xLabel: "Tempo (s)",
    yLabel: "Estresse (Pa)",
    color: "#ec4899",
  },
  shelfLife: {
    title: "Shelf-Life (Arrhenius)",
    description: "Modelagem cinética de degradação térmica",
    xLabel: "Temperatura (°C)",
    yLabel: "Shelf-Life (dias)",
    color: "#f59e0b",
  },
  microbial: {
    title: "Crescimento Microbiano (Gompertz)",
    description: "Modelo de crescimento para análise de segurança",
    xLabel: "Tempo (horas)",
    yLabel: "Contagem (UFC/mL)",
    color: "#10b981",
  },
};

export default function MonteCarloSimulationCard({ projectId, projectName }: MonteCarloSimulationCardProps) {
  const [selectedModel, setSelectedModel] = useState<keyof typeof modelInfo | null>(null);
  const [showSimulation, setShowSimulation] = useState(false);

  const { data: simulationData, isLoading, refetch } = trpc.simulations.runMonteCarlo.useQuery(
    {
      modelType: selectedModel!,
      iterations: 1000,
    },
    {
      enabled: selectedModel !== null && showSimulation,
    }
  );

  const handleRunSimulation = (modelType: keyof typeof modelInfo) => {
    setSelectedModel(modelType);
    setShowSimulation(true);
  };

  const formatChartData = () => {
    if (!simulationData) return [];
    
    return simulationData.inputs.map((input, index) => ({
      x: Math.round(input * 100) / 100,
      mean: Math.round(simulationData.meanValues[index] * 100) / 100,
      lower: Math.round(simulationData.confidenceInterval.lower[index] * 100) / 100,
      upper: Math.round(simulationData.confidenceInterval.upper[index] * 100) / 100,
    }));
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <BarChart3 className="h-5 w-5" />
          Simulações Monte Carlo - Testes Industriais
        </CardTitle>
        <CardDescription className="text-slate-300">
          Modelos computacionais preditivos para {projectName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Botões de seleção de modelo */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {(Object.keys(modelInfo) as Array<keyof typeof modelInfo>).map((modelType) => (
            <Button
              key={modelType}
              variant={selectedModel === modelType ? "default" : "outline"}
              size="sm"
              onClick={() => handleRunSimulation(modelType)}
              className="text-xs"
            >
              {modelInfo[modelType].title.split(" ")[0]}
            </Button>
          ))}
        </div>

        {/* Área de visualização */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <span className="ml-2 text-slate-300">Executando simulação Monte Carlo...</span>
          </div>
        )}

        {simulationData && selectedModel && !isLoading && (
          <div className="space-y-4">
            {/* Informações do modelo */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h4 className="font-semibold text-white mb-1">{modelInfo[selectedModel].title}</h4>
              <p className="text-sm text-slate-400">{modelInfo[selectedModel].description}</p>
              <div className="mt-2 text-xs text-slate-500">
                {simulationData.iterations.toLocaleString()} iterações executadas
              </div>
            </div>

            {/* Estatísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/30">
                <div className="text-xs text-blue-400 mb-1">Média</div>
                <div className="text-lg font-bold text-white">
                  {simulationData.statistics.mean.toFixed(2)}
                </div>
              </div>
              <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/30">
                <div className="text-xs text-purple-400 mb-1">Desvio Padrão</div>
                <div className="text-lg font-bold text-white">
                  {simulationData.statistics.stdDev.toFixed(2)}
                </div>
              </div>
              <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/30">
                <div className="text-xs text-green-400 mb-1">Mínimo</div>
                <div className="text-lg font-bold text-white">
                  {simulationData.statistics.min.toFixed(2)}
                </div>
              </div>
              <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/30">
                <div className="text-xs text-orange-400 mb-1">Máximo</div>
                <div className="text-lg font-bold text-white">
                  {simulationData.statistics.max.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Gráfico */}
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formatChartData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="x"
                    stroke="#94a3b8"
                    label={{ value: modelInfo[selectedModel].xLabel, position: "insideBottom", offset: -5, fill: "#94a3b8" }}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    label={{ value: modelInfo[selectedModel].yLabel, angle: -90, position: "insideLeft", fill: "#94a3b8" }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569", borderRadius: "8px" }}
                    labelStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="upper"
                    stackId="1"
                    stroke="none"
                    fill={modelInfo[selectedModel].color}
                    fillOpacity={0.2}
                    name="IC 97.5%"
                  />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="1"
                    stroke="none"
                    fill={modelInfo[selectedModel].color}
                    fillOpacity={0.2}
                    name="IC 2.5%"
                  />
                  <Line
                    type="monotone"
                    dataKey="mean"
                    stroke={modelInfo[selectedModel].color}
                    strokeWidth={2}
                    dot={false}
                    name="Média"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Interpretação */}
            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30 flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h5 className="font-semibold text-blue-300 mb-1">Interpretação</h5>
                <p className="text-sm text-slate-300">
                  A simulação Monte Carlo executou {simulationData.iterations.toLocaleString()} iterações variando os parâmetros do modelo.
                  O intervalo de confiança de 95% (área sombreada) indica a faixa de valores esperados considerando a incerteza dos parâmetros.
                  Desvio padrão de {simulationData.statistics.stdDev.toFixed(2)} indica{" "}
                  {simulationData.statistics.stdDev / simulationData.statistics.mean < 0.1 ? "baixa" : "moderada"} variabilidade nos resultados.
                </p>
              </div>
            </div>
          </div>
        )}

        {!showSimulation && (
          <div className="text-center py-8 text-slate-400">
            Selecione um modelo acima para executar a simulação Monte Carlo
          </div>
        )}
      </CardContent>
    </Card>
  );
}

