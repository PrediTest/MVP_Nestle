import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: projects, isLoading: loadingProjects } = trpc.projects.listAll.useQuery();
  const { data: alerts, isLoading: loadingAlerts } = trpc.alerts.listActive.useQuery();

  const stats = [
    {
      title: "Projetos Ativos",
      value: projects?.filter(p => p.status === "planning" || p.status === "testing").length || 0,
      icon: Activity,
      description: "Em planejamento ou teste",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Alertas Ativos",
      value: alerts?.length || 0,
      icon: AlertTriangle,
      description: "Requerem atenção",
      trend: "-8%",
      trendUp: false,
    },
    {
      title: "Taxa de Sucesso Média",
      value: "78%",
      icon: TrendingUp,
      description: "Últimos 30 dias",
      trend: "+5%",
      trendUp: true,
    },
    {
      title: "Economia Estimada",
      value: "R$ 250k",
      icon: BarChart3,
      description: "Este mês",
      trend: "+18%",
      trendUp: true,
    },
  ];

  const recentProjects = projects?.slice(0, 5) || [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Visão geral da plataforma de análise preditiva de testes industriais
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-xs font-medium ${
                        stat.trendUp ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">vs. mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Projetos Recentes</CardTitle>
                <CardDescription>Últimos projetos cadastrados no sistema</CardDescription>
              </div>
              <Button asChild variant="outline">
                <Link href="/projects">Ver Todos</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingProjects ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : recentProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum projeto encontrado
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Fábrica: {project.factory}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Tipo: {project.productType}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">
                          Risco: {project.riskScore || "N/A"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sucesso: {project.successProbability || "N/A"}%
                        </div>
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.status === "completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : project.status === "testing"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                              : project.status === "planning"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                        >
                          {project.status === "completed"
                            ? "Concluído"
                            : project.status === "testing"
                            ? "Em Teste"
                            : project.status === "planning"
                            ? "Planejamento"
                            : "Cancelado"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas Ativos</CardTitle>
            <CardDescription>Alertas que requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAlerts ? (
              <div className="text-center py-8 text-muted-foreground">Carregando...</div>
            ) : !alerts || alerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum alerta ativo
              </div>
            ) : (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-start gap-3 p-3 border rounded-lg ${
                      alert.severity === "critical"
                        ? "border-red-500 bg-red-500/10"
                        : alert.severity === "error"
                        ? "border-orange-500 bg-orange-500/10"
                        : alert.severity === "warning"
                        ? "border-yellow-500 bg-yellow-500/10"
                        : "border-blue-500 bg-blue-500/10"
                    }`}
                  >
                    <AlertTriangle
                      className={`h-5 w-5 mt-0.5 ${
                        alert.severity === "critical"
                          ? "text-red-500"
                          : alert.severity === "error"
                          ? "text-orange-500"
                          : alert.severity === "warning"
                          ? "text-yellow-500"
                          : "text-blue-500"
                      }`}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{alert.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Tipo: {alert.type}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          Severidade: {alert.severity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

