import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Clock, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function AlertsDashboard() {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("30d");

  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: allAlerts } = trpc.sentimentAlerts.list.useQuery({
    projectId: selectedProject === "all" ? undefined : selectedProject,
  });

  // Filtrar alertas por período
  const alerts = useMemo(() => {
    if (!allAlerts) return [];
    
    const now = new Date();
    const periodDays = parseInt(timePeriod.replace("d", ""));
    const cutoffDate = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    
    return allAlerts.filter((alert) => new Date(alert.createdAt!) >= cutoffDate);
  }, [allAlerts, timePeriod]);

  // Calcular métricas agregadas
  const metrics = useMemo(() => {
    if (!alerts || alerts.length === 0) {
      return {
        total: 0,
        active: 0,
        resolved: 0,
        critical: 0,
        avgResolutionTime: 0,
        resolutionRate: 0,
      };
    }

    const total = alerts.length;
    const active = alerts.filter((a) => a.status === "active").length;
    const resolved = alerts.filter((a) => a.status === "resolved").length;
    const critical = alerts.filter((a) => a.severity === "critical").length;

    // Calcular tempo médio de resolução (em horas)
    const resolvedAlerts = alerts.filter((a) => a.status === "resolved" && a.resolvedAt);
    const totalResolutionTime = resolvedAlerts.reduce((sum, alert) => {
      const created = new Date(alert.createdAt!).getTime();
      const resolved = new Date(alert.resolvedAt!).getTime();
      return sum + (resolved - created);
    }, 0);
    const avgResolutionTime = resolvedAlerts.length > 0
      ? totalResolutionTime / resolvedAlerts.length / (1000 * 60 * 60) // converter para horas
      : 0;

    const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

    return {
      total,
      active,
      resolved,
      critical,
      avgResolutionTime,
      resolutionRate,
    };
  }, [alerts]);

  // Dados para gráfico de linha temporal
  const timelineData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    const groupedByDate: Record<string, { date: string; total: number; critical: number; high: number; medium: number; low: number }> = {};

    alerts.forEach((alert) => {
      const date = new Date(alert.createdAt!).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      if (!groupedByDate[date]) {
        groupedByDate[date] = { date, total: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      groupedByDate[date].total++;
      if (alert.severity === "critical") groupedByDate[date].critical++;
      else if (alert.severity === "high") groupedByDate[date].high++;
      else if (alert.severity === "medium") groupedByDate[date].medium++;
      else if (alert.severity === "low") groupedByDate[date].low++;
    });

    return Object.values(groupedByDate).sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number);
      const [dayB, monthB] = b.date.split("/").map(Number);
      return monthA !== monthB ? monthA - monthB : dayA - dayB;
    });
  }, [alerts]);

  // Dados para gráfico de distribuição por severidade
  const severityData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    const counts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    };

    alerts.forEach((alert) => {
      const severity = alert.severity || "medium";
      counts[severity as keyof typeof counts]++;
    });

    return [
      { name: "Crítica", value: counts.critical, color: "#ef4444" },
      { name: "Alta", value: counts.high, color: "#f97316" },
      { name: "Média", value: counts.medium, color: "#eab308" },
      { name: "Baixa", value: counts.low, color: "#3b82f6" },
    ].filter((item) => item.value > 0);
  }, [alerts]);

  // Dados para gráfico de alertas por plataforma
  const platformData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    const counts: Record<string, number> = {};

    alerts.forEach((alert) => {
      const platform = alert.platform || "all";
      counts[platform] = (counts[platform] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([platform, count]) => ({
        platform: getPlatformLabel(platform),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [alerts]);

  // Dados para gráfico de alertas por tipo
  const typeData = useMemo(() => {
    if (!alerts || alerts.length === 0) return [];

    const counts: Record<string, number> = {};

    alerts.forEach((alert) => {
      const type = alert.alertType || "unknown";
      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([type, count]) => ({
        type: getAlertTypeLabel(type),
        count,
      }))
      .sort((a, b) => b.count - a.count);
  }, [alerts]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard de Alertas</h1>
            <p className="text-muted-foreground mt-2">
              Visualize tendências e padrões dos alertas de sentimento ao longo do tempo
            </p>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Filtrar por projeto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Projetos</SelectItem>
                  {projects?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
            </div>
          </CardContent>
        </Card>

        {/* Métricas Principais */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Alertas</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.total}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.active} ativos, {metrics.resolved} resolvidos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertas Críticos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.critical}</div>
              <p className="text-xs text-muted-foreground">
                {metrics.total > 0 ? ((metrics.critical / metrics.total) * 100).toFixed(1) : 0}% do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Resolução</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.resolutionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {metrics.resolved} de {metrics.total} alertas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tempo Médio de Resolução</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.avgResolutionTime.toFixed(1)}h
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics.resolved} alertas resolvidos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Linha Temporal */}
        <Card>
          <CardHeader>
            <CardTitle>Tendência de Alertas ao Longo do Tempo</CardTitle>
            <CardDescription>
              Distribuição de alertas por data e severidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            {timelineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" strokeWidth={2} />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Crítica" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#f97316" name="Alta" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#eab308" name="Média" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#3b82f6" name="Baixa" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[350px] text-muted-foreground">
                Nenhum dado disponível para o período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Gráfico de Distribuição por Severidade */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Severidade</CardTitle>
              <CardDescription>
                Proporção de alertas por nível de severidade
              </CardDescription>
            </CardHeader>
            <CardContent>
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gráfico de Alertas por Plataforma */}
          <Card>
            <CardHeader>
              <CardTitle>Alertas por Plataforma</CardTitle>
              <CardDescription>
                Número de alertas por plataforma de rede social
              </CardDescription>
            </CardHeader>
            <CardContent>
              {platformData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={platformData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="platform" type="category" width={120} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" name="Alertas" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nenhum dado disponível
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Alertas por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas por Tipo</CardTitle>
            <CardDescription>
              Distribuição de alertas por tipo de anomalia detectada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#82ca9d" name="Alertas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Insights e Recomendações */}
        <Card>
          <CardHeader>
            <CardTitle>Insights e Recomendações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.critical > 0 && (
                <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-500">Atenção: Alertas Críticos Detectados</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Há {metrics.critical} alerta(s) crítico(s) que requerem ação imediata. Revise os posts com sentimento muito negativo e tome medidas corretivas.
                    </p>
                  </div>
                </div>
              )}

              {metrics.resolutionRate < 50 && metrics.total > 5 && (
                <div className="flex items-start gap-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <TrendingDown className="h-5 w-5 text-yellow-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-yellow-500">Taxa de Resolução Baixa</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A taxa de resolução está em {metrics.resolutionRate.toFixed(1)}%. Considere revisar o processo de tratamento de alertas e alocar mais recursos.
                    </p>
                  </div>
                </div>
              )}

              {metrics.avgResolutionTime > 24 && metrics.resolved > 0 && (
                <div className="flex items-start gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-orange-500">Tempo de Resolução Elevado</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      O tempo médio de resolução é de {metrics.avgResolutionTime.toFixed(1)} horas. Considere otimizar o fluxo de trabalho para responder mais rapidamente aos alertas.
                    </p>
                  </div>
                </div>
              )}

              {metrics.resolutionRate >= 80 && metrics.total > 5 && (
                <div className="flex items-start gap-3 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-500">Excelente Taxa de Resolução</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Parabéns! A taxa de resolução está em {metrics.resolutionRate.toFixed(1)}%, demonstrando uma gestão eficaz dos alertas de sentimento.
                    </p>
                  </div>
                </div>
              )}

              {metrics.total === 0 && (
                <div className="flex items-start gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <Bell className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-500">Nenhum Alerta no Período</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Não há alertas registrados no período selecionado. O sentimento nas redes sociais está estável.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getPlatformLabel(platform: string): string {
  const labels: Record<string, string> = {
    all: "Todas",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    reclameaqui: "Reclame Aqui",
    nestle_site: "Site Nestlé",
  };
  return labels[platform] || platform;
}

function getAlertTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    negative_spike: "Pico Negativo",
    very_negative_spike: "Pico Crítico",
    negative_threshold: "Threshold Atingido",
    sentiment_drop: "Queda de Sentimento",
  };
  return labels[type] || type;
}

