import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, AlertTriangle, Bell, CheckCircle, Info, Play, Settings as SettingsIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function SentimentAlerts() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Alertas de Sentimento</h1>
            <p className="text-muted-foreground mt-2">
              Monitore e gerencie alertas de sentimento negativo nas redes sociais
            </p>
          </div>
          <ConfigurationsDialog />
        </div>

        <Tabs defaultValue="active" className="space-y-6">
          <TabsList>
            <TabsTrigger value="active">Alertas Ativos</TabsTrigger>
            <TabsTrigger value="acknowledged">Reconhecidos</TabsTrigger>
            <TabsTrigger value="resolved">Resolvidos</TabsTrigger>
            <TabsTrigger value="all">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <AlertsList status="active" />
          </TabsContent>

          <TabsContent value="acknowledged">
            <AlertsList status="acknowledged" />
          </TabsContent>

          <TabsContent value="resolved">
            <AlertsList status="resolved" />
          </TabsContent>

          <TabsContent value="all">
            <AlertsList />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ==================== ALERTS LIST ====================

function AlertsList({ status }: { status?: "active" | "acknowledged" | "resolved" }) {
  const [selectedProject, setSelectedProject] = useState<string>("all");
  
  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: alerts, refetch } = trpc.sentimentAlerts.list.useQuery({ 
    projectId: selectedProject === "all" ? undefined : selectedProject,
    status 
  });
  const utils = trpc.useUtils();

  const acknowledgeAlert = trpc.sentimentAlerts.acknowledge.useMutation({
    onSuccess: () => {
      toast.success("Alerta reconhecido com sucesso");
      refetch();
      utils.sentimentAlerts.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao reconhecer alerta: " + error.message);
    },
  });

  const resolveAlert = trpc.sentimentAlerts.resolve.useMutation({
    onSuccess: () => {
      toast.success("Alerta resolvido com sucesso");
      refetch();
      utils.sentimentAlerts.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao resolver alerta: " + error.message);
    },
  });

  const checkAlerts = trpc.sentimentAlerts.checkAndCreateAlerts.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      refetch();
      utils.sentimentAlerts.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao verificar alertas: " + error.message);
    },
  });

  const handleAcknowledge = (id: string) => {
    if (confirm("Deseja reconhecer este alerta?")) {
      acknowledgeAlert.mutate({ id });
    }
  };

  const handleResolve = (id: string) => {
    if (confirm("Deseja marcar este alerta como resolvido?")) {
      resolveAlert.mutate({ id });
    }
  };

  const handleCheckAlerts = () => {
    if (selectedProject === "all") {
      toast.error("Selecione um projeto específico para verificar alertas");
      return;
    }
    checkAlerts.mutate({ projectId: selectedProject });
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alertas de Sentimento</CardTitle>
              <CardDescription>
                {alerts?.length || 0} alerta(s) encontrado(s)
              </CardDescription>
            </div>
            <Button
              onClick={handleCheckAlerts}
              disabled={checkAlerts.isPending || selectedProject === "all"}
            >
              <Play className="h-4 w-4 mr-2" />
              {checkAlerts.isPending ? "Verificando..." : "Verificar Alertas"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
          </div>
        </CardContent>
      </Card>

      {/* Lista de Alertas */}
      <div className="grid gap-4">
        {alerts?.map((alert) => {
          const project = projects?.find((p) => p.id === alert.projectId);
          return (
            <Card key={alert.id} className={getSeverityCardClass(alert.severity)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getSeverityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">
                            {getAlertTypeLabel(alert.alertType)}
                          </h3>
                          <Badge variant={getSeverityVariant(alert.severity)}>
                            {getSeverityLabel(alert.severity)}
                          </Badge>
                          <Badge variant="outline">{getPlatformLabel(alert.platform)}</Badge>
                          <Badge variant={getStatusVariant(alert.status)}>
                            {getStatusLabel(alert.status)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Projeto: {project?.name || alert.projectId}
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <p className="text-sm">{alert.message}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Valor Atual:</span>
                        <span className="ml-2 font-semibold">{alert.currentValue}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Threshold:</span>
                        <span className="ml-2 font-semibold">{alert.thresholdValue}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Posts Afetados:</span>
                        <span className="ml-2 font-semibold">{alert.affectedPosts}</span>
                      </div>
                    </div>

                    {alert.acknowledgedBy && (
                      <p className="text-xs text-muted-foreground">
                        Reconhecido em {new Date(alert.acknowledgedAt!).toLocaleString("pt-BR")}
                      </p>
                    )}

                    {alert.resolvedAt && (
                      <p className="text-xs text-muted-foreground">
                        Resolvido em {new Date(alert.resolvedAt).toLocaleString("pt-BR")}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(alert.createdAt!).toLocaleString("pt-BR")}
                    </p>

                    <div className="flex gap-2 pt-2">
                      {alert.status === "active" && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleAcknowledge(alert.id)}
                            disabled={acknowledgeAlert.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Reconhecer
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolveAlert.isPending}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Resolver
                          </Button>
                        </>
                      )}
                      {alert.status === "acknowledged" && (
                        <Button
                          size="sm"
                          onClick={() => handleResolve(alert.id)}
                          disabled={resolveAlert.isPending}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Resolver
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {alerts?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum alerta encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ==================== CONFIGURATIONS DIALOG ====================

function ConfigurationsDialog() {
  const [open, setOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string>("");
  
  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: configurations, refetch } = trpc.sentimentAlerts.listConfigurations.useQuery({});
  const utils = trpc.useUtils();

  const createConfig = trpc.sentimentAlerts.createConfiguration.useMutation({
    onSuccess: () => {
      toast.success("Configuração criada com sucesso");
      refetch();
      utils.sentimentAlerts.listConfigurations.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao criar configuração: " + error.message);
    },
  });

  const deleteConfig = trpc.sentimentAlerts.deleteConfiguration.useMutation({
    onSuccess: () => {
      toast.success("Configuração excluída com sucesso");
      refetch();
      utils.sentimentAlerts.listConfigurations.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir configuração: " + error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta configuração?")) {
      deleteConfig.mutate({ id });
    }
  };

  const filteredConfigs = selectedProject
    ? configurations?.filter((c) => c.projectId === selectedProject)
    : configurations;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SettingsIcon className="h-4 w-4 mr-2" />
          Configurações
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações de Alertas</DialogTitle>
          <DialogDescription>
            Gerencie as configurações de detecção de alertas de sentimento negativo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-4">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Filtrar por projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os Projetos</SelectItem>
                {projects?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateConfigDialog onSuccess={() => refetch()} />
          </div>

          <div className="space-y-4">
            {filteredConfigs?.map((config) => {
              const project = projects?.find((p) => p.id === config.projectId);
              return (
                <Card key={config.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold">
                            {project?.name || "Configuração Global"}
                          </h4>
                          <Badge variant="outline">{getPlatformLabel(config.platform)}</Badge>
                          <Badge variant={config.isActive === "yes" ? "default" : "secondary"}>
                            {config.isActive === "yes" ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Threshold Negativo:</span>
                            <span className="ml-2 font-semibold">{config.negativeThreshold}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Threshold Muito Negativo:</span>
                            <span className="ml-2 font-semibold">{config.veryNegativeThreshold}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Queda de Sentimento:</span>
                            <span className="ml-2 font-semibold">{config.sentimentDropThreshold}%</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Janela de Tempo:</span>
                            <span className="ml-2 font-semibold">{config.timeWindow}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Posts Mínimos:</span>
                            <span className="ml-2 font-semibold">{config.minPostsRequired}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Notificar Owner:</span>
                            <span className="ml-2 font-semibold">
                              {config.notifyOwner === "yes" ? "Sim" : "Não"}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Criado em {new Date(config.createdAt!).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(config.id)}
                        disabled={deleteConfig.isPending}
                      >
                        Excluir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredConfigs?.length === 0 && (
              <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                  Nenhuma configuração encontrada
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ==================== CREATE CONFIG DIALOG ====================

function CreateConfigDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    projectId: "",
    platform: "all" as const,
    negativeThreshold: "30",
    veryNegativeThreshold: "15",
    sentimentDropThreshold: "20",
    timeWindow: "24h",
    minPostsRequired: "10",
    notifyOwner: "yes" as const,
  });

  const { data: projects } = trpc.projects.listAll.useQuery();
  const utils = trpc.useUtils();

  const createConfig = trpc.sentimentAlerts.createConfiguration.useMutation({
    onSuccess: () => {
      toast.success("Configuração criada com sucesso");
      setOpen(false);
      setFormData({
        projectId: "",
        platform: "all",
        negativeThreshold: "30",
        veryNegativeThreshold: "15",
        sentimentDropThreshold: "20",
        timeWindow: "24h",
        minPostsRequired: "10",
        notifyOwner: "yes",
      });
      onSuccess();
      utils.sentimentAlerts.listConfigurations.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao criar configuração: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { projectId, ...rest } = formData;
    createConfig.mutate({
      id: `config_${Date.now()}`,
      projectId: projectId || undefined,
      ...rest,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Bell className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Configuração de Alerta</DialogTitle>
            <DialogDescription>
              Configure os thresholds para detecção de sentimento negativo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project">Projeto</Label>
                <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um projeto (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os Projetos</SelectItem>
                    {projects?.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Plataforma</Label>
                <Select value={formData.platform} onValueChange={(value: any) => setFormData({ ...formData, platform: value })}>
                  <SelectTrigger>
                    <SelectValue />
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="negativeThreshold">Threshold Negativo (%)</Label>
                <Input
                  id="negativeThreshold"
                  type="number"
                  value={formData.negativeThreshold}
                  onChange={(e) => setFormData({ ...formData, negativeThreshold: e.target.value })}
                  placeholder="30"
                />
                <p className="text-xs text-muted-foreground">
                  % de posts negativos para disparar alerta
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="veryNegativeThreshold">Threshold Muito Negativo (%)</Label>
                <Input
                  id="veryNegativeThreshold"
                  type="number"
                  value={formData.veryNegativeThreshold}
                  onChange={(e) => setFormData({ ...formData, veryNegativeThreshold: e.target.value })}
                  placeholder="15"
                />
                <p className="text-xs text-muted-foreground">
                  % de posts muito negativos (crítico)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sentimentDropThreshold">Queda de Sentimento (%)</Label>
                <Input
                  id="sentimentDropThreshold"
                  type="number"
                  value={formData.sentimentDropThreshold}
                  onChange={(e) => setFormData({ ...formData, sentimentDropThreshold: e.target.value })}
                  placeholder="20"
                />
                <p className="text-xs text-muted-foreground">
                  % de queda vs. média histórica
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeWindow">Janela de Tempo</Label>
                <Select value={formData.timeWindow} onValueChange={(value) => setFormData({ ...formData, timeWindow: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6h">6 horas</SelectItem>
                    <SelectItem value="12h">12 horas</SelectItem>
                    <SelectItem value="24h">24 horas</SelectItem>
                    <SelectItem value="48h">48 horas</SelectItem>
                    <SelectItem value="72h">72 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minPostsRequired">Posts Mínimos</Label>
                <Input
                  id="minPostsRequired"
                  type="number"
                  value={formData.minPostsRequired}
                  onChange={(e) => setFormData({ ...formData, minPostsRequired: e.target.value })}
                  placeholder="10"
                />
                <p className="text-xs text-muted-foreground">
                  Mínimo de posts para análise
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notifyOwner">Notificar Owner</Label>
                <Select value={formData.notifyOwner} onValueChange={(value: any) => setFormData({ ...formData, notifyOwner: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Sim</SelectItem>
                    <SelectItem value="no">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createConfig.isPending}>
              {createConfig.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getSeverityIcon(severity: string | null) {
  const icons = {
    low: <Info className="h-6 w-6 text-blue-500" />,
    medium: <AlertCircle className="h-6 w-6 text-yellow-500" />,
    high: <AlertTriangle className="h-6 w-6 text-orange-500" />,
    critical: <AlertCircle className="h-6 w-6 text-red-500" />,
  };
  return icons[severity as keyof typeof icons] || icons.medium;
}

function getSeverityLabel(severity: string | null): string {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  };
  return labels[severity || "medium"] || severity || "Média";
}

function getSeverityVariant(severity: string | null): "default" | "secondary" | "destructive" {
  if (severity === "critical" || severity === "high") return "destructive";
  if (severity === "low") return "secondary";
  return "default";
}

function getSeverityCardClass(severity: string | null): string {
  if (severity === "critical") return "border-red-500 border-2";
  if (severity === "high") return "border-orange-500 border-2";
  if (severity === "medium") return "border-yellow-500";
  return "";
}

function getAlertTypeLabel(alertType: string | null): string {
  const labels: Record<string, string> = {
    negative_spike: "Pico de Sentimento Negativo",
    very_negative_spike: "Pico Crítico de Sentimento Muito Negativo",
    negative_threshold: "Threshold de Negatividade Atingido",
    sentiment_drop: "Queda Abrupta no Sentimento Médio",
  };
  return labels[alertType || ""] || alertType || "";
}

function getPlatformLabel(platform: string | null): string {
  const labels: Record<string, string> = {
    all: "Todas",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    reclameaqui: "Reclame Aqui",
    nestle_site: "Site Nestlé",
  };
  return labels[platform || "all"] || platform || "Todas";
}

function getStatusLabel(status: string | null): string {
  const labels: Record<string, string> = {
    active: "Ativo",
    acknowledged: "Reconhecido",
    resolved: "Resolvido",
  };
  return labels[status || "active"] || status || "Ativo";
}

function getStatusVariant(status: string | null): "default" | "secondary" | "outline" {
  if (status === "active") return "default";
  if (status === "acknowledged") return "secondary";
  return "outline";
}

