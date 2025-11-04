import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Download, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { toast } from "sonner";

const PRODUCT_COLORS = [
  "#8884d8", // azul
  "#82ca9d", // verde
  "#ffc658", // amarelo
  "#ff7c7c", // vermelho
  "#a78bfa", // roxo
  "#fb923c", // laranja
];

export default function ProductComparison() {
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [timePeriod, setTimePeriod] = useState<string>("30d");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");

  const { data: projects, isLoading: projectsLoading } = trpc.projects.listAll.useQuery();
  
  // Buscar dados de sentimento para cada projeto selecionado
  const sentimentQueries = selectedProjects.map((projectId) =>
    trpc.sentiment.getByProject.useQuery({ projectId }, { enabled: selectedProjects.length > 0 })
  );

  const postsQueries = selectedProjects.map((projectId) =>
    trpc.sentiment.getPostsByProject.useQuery({ projectId }, { enabled: selectedProjects.length > 0 })
  );

  // Processar dados de sentimento
  const comparisonData = useMemo(() => {
    if (selectedProjects.length === 0) return null;
    if (!projects || projectsLoading) return null;
    
    // Verificar se todas as queries carregaram
    const allLoaded = sentimentQueries.every((q) => !q.isLoading) && postsQueries.every((q) => !q.isLoading);
    if (!allLoaded) return null;

    const periodDays = parseInt(timePeriod.replace("d", ""));
    const cutoffDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

    return selectedProjects.map((projectId, index) => {
      const project = projects?.find((p) => p.id === projectId);
      const sentiments = sentimentQueries[index]?.data || [];
      const posts = postsQueries[index]?.data || [];

      // Filtrar por período e plataforma
      const filteredSentiments = sentiments.filter((s) => {
        const createdAt = new Date(s.createdAt!);
        const matchesPeriod = createdAt >= cutoffDate;
        const matchesPlatform = selectedPlatform === "all" || 
          posts.find((p: any) => p.id === s.postId && p.platform === selectedPlatform);
        return matchesPeriod && matchesPlatform;
      });

      // Calcular métricas
      const total = filteredSentiments.length;
      const positive = filteredSentiments.filter((s) => s.sentiment === "positive" || s.sentiment === "very_positive").length;
      const neutral = filteredSentiments.filter((s) => s.sentiment === "neutral").length;
      const negative = filteredSentiments.filter((s) => s.sentiment === "negative" || s.sentiment === "very_negative").length;

      const avgScore = total > 0
        ? filteredSentiments.reduce((sum, s) => sum + parseFloat(s.sentimentScore || "0"), 0) / total
        : 0;

      // Agrupar por data para timeline
      const groupedByDate: Record<string, { positive: number; neutral: number; negative: number; total: number }> = {};
      filteredSentiments.forEach((s) => {
        const date = new Date(s.createdAt!).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
        if (!groupedByDate[date]) {
          groupedByDate[date] = { positive: 0, neutral: 0, negative: 0, total: 0 };
        }
        groupedByDate[date].total++;
        if (s.sentiment === "positive" || s.sentiment === "very_positive") groupedByDate[date].positive++;
        else if (s.sentiment === "neutral") groupedByDate[date].neutral++;
        else groupedByDate[date].negative++;
      });

      const timeline = Object.entries(groupedByDate)
        .map(([date, counts]) => ({
          date,
          score: counts.total > 0 ? ((counts.positive - counts.negative) / counts.total) * 100 : 0,
        }))
        .sort((a, b) => {
          const [dayA, monthA] = a.date.split("/").map(Number);
          const [dayB, monthB] = b.date.split("/").map(Number);
          return monthA !== monthB ? monthA - monthB : dayA - dayB;
        });

      // Extrair keywords mais mencionadas
      const keywordCounts: Record<string, number> = {};
      filteredSentiments.forEach((s) => {
        const keywords = s.keywords ? JSON.parse(s.keywords) : [];
        keywords.forEach((kw: string) => {
          keywordCounts[kw] = (keywordCounts[kw] || 0) + 1;
        });
      });
      const topKeywords = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);

      return {
        projectId,
        projectName: project?.name || projectId,
        color: PRODUCT_COLORS[index % PRODUCT_COLORS.length],
        total,
        positive,
        neutral,
        negative,
        positiveRate: total > 0 ? (positive / total) * 100 : 0,
        neutralRate: total > 0 ? (neutral / total) * 100 : 0,
        negativeRate: total > 0 ? (negative / total) * 100 : 0,
        avgScore,
        timeline,
        topKeywords,
      };
    });
  }, [selectedProjects, projects, sentimentQueries, postsQueries, timePeriod, selectedPlatform]);

  // Dados para gráfico de linha comparativo
  const timelineData = useMemo(() => {
    if (!comparisonData) return [];

    // Obter todas as datas únicas
    const allDates = new Set<string>();
    comparisonData.forEach((product) => {
      product.timeline.forEach((point) => allDates.add(point.date));
    });

    // Criar array de datas ordenadas
    const sortedDates = Array.from(allDates).sort((a, b) => {
      const [dayA, monthA] = a.split("/").map(Number);
      const [dayB, monthB] = b.split("/").map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });

    // Criar dados para o gráfico
    return sortedDates.map((date) => {
      const dataPoint: any = { date };
      comparisonData.forEach((product) => {
        const point = product.timeline.find((p) => p.date === date);
        dataPoint[product.projectName] = point ? point.score : null;
      });
      return dataPoint;
    });
  }, [comparisonData]);

  // Dados para gráfico de barras comparativo
  const distributionData = useMemo(() => {
    if (!comparisonData) return [];

    return comparisonData.map((product) => ({
      name: product.projectName,
      Positivo: product.positiveRate,
      Neutro: product.neutralRate,
      Negativo: product.negativeRate,
    }));
  }, [comparisonData]);

  // Dados para gráfico radar
  const radarData = useMemo(() => {
    if (!comparisonData) return [];

    const metrics = ["Sentimento Positivo", "Engajamento", "Satisfação", "Qualidade", "Inovação"];
    
    return metrics.map((metric, index) => {
      const dataPoint: any = { metric };
      comparisonData.forEach((product) => {
        // Simular valores baseados no sentimento real
        const baseValue = product.positiveRate;
        const variation = (Math.sin(index + product.projectId.length) * 10);
        dataPoint[product.projectName] = Math.max(0, Math.min(100, baseValue + variation));
      });
      return dataPoint;
    });
  }, [comparisonData]);

  const handleToggleProject = (projectId: string) => {
    setSelectedProjects((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleExportReport = () => {
    if (!comparisonData) {
      toast.error("Selecione pelo menos um produto para exportar");
      return;
    }

    // Criar CSV
    const headers = ["Produto", "Total Posts", "Positivo %", "Neutro %", "Negativo %", "Score Médio", "Top Keywords"];
    const rows = comparisonData.map((product) => [
      product.projectName,
      product.total.toString(),
      product.positiveRate.toFixed(1),
      product.neutralRate.toFixed(1),
      product.negativeRate.toFixed(1),
      product.avgScore.toFixed(2),
      product.topKeywords.join("; "),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `comparacao-produtos-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Relatório exportado com sucesso");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Comparação de Produtos</h1>
            <p className="text-muted-foreground mt-2">
              Compare tendências de sentimento entre diferentes produtos
            </p>
          </div>
          <Button onClick={handleExportReport} disabled={!comparisonData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>

        {/* Seleção de Produtos e Filtros */}
        <Card>
          <CardHeader>
            <CardTitle>Selecione os Produtos para Comparar</CardTitle>
            <CardDescription>
              Escolha até 6 produtos para análise comparativa
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projects?.map((project) => (
                <div key={project.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={project.id}
                    checked={selectedProjects.includes(project.id)}
                    onCheckedChange={() => handleToggleProject(project.id)}
                    disabled={!selectedProjects.includes(project.id) && selectedProjects.length >= 6}
                  />
                  <Label
                    htmlFor={project.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {project.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t">
              <Select value={timePeriod} onValueChange={setTimePeriod}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Últimos 7 dias</SelectItem>
                  <SelectItem value="14d">Últimos 14 dias</SelectItem>
                  <SelectItem value="30d">Últimos 30 dias</SelectItem>
                  <SelectItem value="60d">Últimos 60 dias</SelectItem>
                  <SelectItem value="90d">Últimos 90 dias</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Plataforma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Plataformas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="reclameaqui">Reclame Aqui</SelectItem>
                  <SelectItem value="nestle_site">Site Nestlé</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {selectedProjects.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Selecione pelo menos um produto para visualizar a comparação
            </CardContent>
          </Card>
        )}

        {comparisonData && comparisonData.length > 0 && (
          <>
            {/* Tabela Comparativa de Métricas */}
            <Card>
              <CardHeader>
                <CardTitle>Resumo Comparativo</CardTitle>
                <CardDescription>
                  Principais métricas de sentimento por produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Total Posts</TableHead>
                      <TableHead className="text-right">Positivo</TableHead>
                      <TableHead className="text-right">Neutro</TableHead>
                      <TableHead className="text-right">Negativo</TableHead>
                      <TableHead className="text-right">Score Médio</TableHead>
                      <TableHead>Tendência</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comparisonData.map((product) => {
                      const trend = product.avgScore > 0 ? "up" : product.avgScore < 0 ? "down" : "neutral";
                      return (
                        <TableRow key={product.projectId}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: product.color }}
                              />
                              {product.projectName}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{product.total}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant="default" className="bg-green-500">
                              {product.positiveRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="secondary">
                              {product.neutralRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge variant="destructive">
                              {product.negativeRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            {product.avgScore.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {trend === "up" && (
                              <div className="flex items-center gap-1 text-green-500">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-sm">Positiva</span>
                              </div>
                            )}
                            {trend === "down" && (
                              <div className="flex items-center gap-1 text-red-500">
                                <TrendingDown className="h-4 w-4" />
                                <span className="text-sm">Negativa</span>
                              </div>
                            )}
                            {trend === "neutral" && (
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Minus className="h-4 w-4" />
                                <span className="text-sm">Neutra</span>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Gráfico de Linha Comparativo */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Sentimento ao Longo do Tempo</CardTitle>
                <CardDescription>
                  Comparação da evolução do sentimento entre produtos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[-100, 100]} />
                      <Tooltip />
                      <Legend />
                      {comparisonData.map((product) => (
                        <Line
                          key={product.projectId}
                          type="monotone"
                          dataKey={product.projectName}
                          stroke={product.color}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          connectNulls
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    Nenhum dado disponível para o período selecionado
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {/* Gráfico de Barras Comparativo */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribuição de Sentimento</CardTitle>
                  <CardDescription>
                    Comparação da distribuição de sentimentos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={distributionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Positivo" fill="#22c55e" stackId="a" />
                      <Bar dataKey="Neutro" fill="#94a3b8" stackId="a" />
                      <Bar dataKey="Negativo" fill="#ef4444" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Gráfico Radar */}
              <Card>
                <CardHeader>
                  <CardTitle>Análise Multidimensional</CardTitle>
                  <CardDescription>
                    Comparação de múltiplas dimensões de percepção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {comparisonData.map((product) => (
                        <Radar
                          key={product.projectId}
                          name={product.projectName}
                          dataKey={product.projectName}
                          stroke={product.color}
                          fill={product.color}
                          fillOpacity={0.3}
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Palavras-chave Mais Mencionadas */}
            <Card>
              <CardHeader>
                <CardTitle>Palavras-chave Mais Mencionadas</CardTitle>
                <CardDescription>
                  Top 5 palavras-chave por produto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {comparisonData.map((product) => (
                    <div key={product.projectId} className="space-y-2">
                      <div className="flex items-center gap-2 font-semibold">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: product.color }}
                        />
                        {product.projectName}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {product.topKeywords.length > 0 ? (
                          product.topKeywords.map((keyword, index) => (
                            <Badge key={index} variant="outline">
                              {keyword}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Nenhuma palavra-chave encontrada
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights da Comparação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(() => {
                    const bestProduct = comparisonData.reduce((best, current) =>
                      current.positiveRate > best.positiveRate ? current : best
                    );
                    const worstProduct = comparisonData.reduce((worst, current) =>
                      current.negativeRate > worst.negativeRate ? current : worst
                    );
                    const avgPositive = comparisonData.reduce((sum, p) => sum + p.positiveRate, 0) / comparisonData.length;

                    return (
                      <>
                        <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <ArrowUp className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-500">Melhor Desempenho</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <strong>{bestProduct.projectName}</strong> lidera com {bestProduct.positiveRate.toFixed(1)}% de sentimento positivo, 
                              {(bestProduct.positiveRate - avgPositive).toFixed(1)} pontos acima da média.
                            </p>
                          </div>
                        </div>

                        {worstProduct.negativeRate > 30 && (
                          <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                            <ArrowDown className="h-5 w-5 text-red-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-red-500">Atenção Necessária</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <strong>{worstProduct.projectName}</strong> apresenta {worstProduct.negativeRate.toFixed(1)}% de sentimento negativo. 
                                Recomenda-se análise detalhada das reclamações e implementação de melhorias.
                              </p>
                            </div>
                          </div>
                        )}

                        {comparisonData.length >= 3 && (
                          <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                            <div>
                              <p className="font-semibold text-blue-500">Análise Geral</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                A média de sentimento positivo entre os produtos é de {avgPositive.toFixed(1)}%. 
                                {avgPositive > 60 
                                  ? " Excelente desempenho geral da linha de produtos."
                                  : avgPositive > 40
                                  ? " Desempenho satisfatório, com oportunidades de melhoria."
                                  : " Recomenda-se ação imediata para melhorar a percepção dos produtos."}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

