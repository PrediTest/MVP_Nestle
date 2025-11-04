import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { AlertCircle, BarChart3, CheckCircle, Clock, DollarSign, Loader2, Play, Plus, Settings, Target, TrendingUp, XCircle } from "lucide-react";
import { useState } from "react";
import { useParams } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, ZAxis } from "recharts";

export default function TestManagement() {
  const params = useParams();
  const projectId = params.id as string;
  
  const [showAddTestDialog, setShowAddTestDialog] = useState(false);
  const [showCreateTestDialog, setShowCreateTestDialog] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string>("");
  const [isRunningSimulation, setIsRunningSimulation] = useState(false);
  
  // Queries
  const { data: project } = trpc.projects.getById.useQuery({ id: projectId });
  const { data: availableTests } = trpc.tests.listAvailable.useQuery();
  const { data: projectTests } = trpc.tests.listByProject.useQuery({ projectId });
  const { data: latestSimulation } = trpc.tests.getLatestSimulation.useQuery({ projectId });
  
  // Mutations
  const addTestMutation = trpc.tests.addToProject.useMutation({
    onSuccess: () => {
      toast.success("Teste adicionado com sucesso!");
      setShowAddTestDialog(false);
      setSelectedTestId("");
      trpcUtils.tests.listByProject.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar teste: ${error.message}`);
    },
  });
  
  const removeTestMutation = trpc.tests.removeFromProject.useMutation({
    onSuccess: () => {
      toast.success("Teste removido com sucesso!");
      trpcUtils.tests.listByProject.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao remover teste: ${error.message}`);
    },
  });
  
  const runSimulationMutation = trpc.tests.runSimulation.useMutation({
    onSuccess: (data) => {
      toast.success("Simulação Monte Carlo concluída!");
      setIsRunningSimulation(false);
      trpcUtils.tests.getLatestSimulation.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro na simulação: ${error.message}`);
      setIsRunningSimulation(false);
    },
  });
  
  const trpcUtils = trpc.useUtils();
  
  // Novo teste
  const [newTest, setNewTest] = useState({
    name: "",
    category: "",
    description: "",
    unit: "",
    minValue: "",
    maxValue: "",
    targetValue: "",
    tolerance: "",
    duration: "",
    cost: "",
  });
  
  const createTestMutation = trpc.tests.create.useMutation({
    onSuccess: () => {
      toast.success("Teste criado com sucesso!");
      setShowCreateTestDialog(false);
      setNewTest({
        name: "",
        category: "",
        description: "",
        unit: "",
        minValue: "",
        maxValue: "",
        targetValue: "",
        tolerance: "",
        duration: "",
        cost: "",
      });
      trpcUtils.tests.listAvailable.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao criar teste: ${error.message}`);
    },
  });
  
  const handleAddTest = () => {
    if (!selectedTestId) {
      toast.error("Selecione um teste");
      return;
    }
    addTestMutation.mutate({ projectId, testId: selectedTestId, priority: "medium" });
  };
  
  const handleRemoveTest = (id: string) => {
    if (confirm("Tem certeza que deseja remover este teste?")) {
      removeTestMutation.mutate({ id });
    }
  };
  
  const handleCreateTest = () => {
    if (!newTest.name || !newTest.category) {
      toast.error("Nome e categoria são obrigatórios");
      return;
    }
    
    createTestMutation.mutate({
      name: newTest.name,
      category: newTest.category,
      description: newTest.description || undefined,
      unit: newTest.unit || undefined,
      minValue: newTest.minValue ? parseFloat(newTest.minValue) : undefined,
      maxValue: newTest.maxValue ? parseFloat(newTest.maxValue) : undefined,
      targetValue: newTest.targetValue ? parseFloat(newTest.targetValue) : undefined,
      tolerance: newTest.tolerance ? parseFloat(newTest.tolerance) : undefined,
      duration: newTest.duration ? parseInt(newTest.duration) : undefined,
      cost: newTest.cost ? parseFloat(newTest.cost) : undefined,
    });
  };
  
  const handleRunSimulation = () => {
    if (!projectTests || projectTests.length === 0) {
      toast.error("Adicione pelo menos um teste antes de executar a simulação");
      return;
    }
    
    setIsRunningSimulation(true);
    runSimulationMutation.mutate({ projectId, iterations: 10000, confidenceLevel: 95 });
  };
  
  // Preparar dados para gráficos
  const simulationChartData = latestSimulation?.distributionData && Array.isArray(latestSimulation.distributionData)
    ? (latestSimulation.distributionData as any[]).slice(0, 100).map((value: any, index: number) => ({
        iteration: index + 1,
        value: typeof value === 'string' ? parseFloat(value) : value,
      }))
    : [];
  
  const metricsData = latestSimulation
    ? [
        { name: "Média", value: parseFloat(latestSimulation.meanValue || "0") },
        { name: "Limite Inferior", value: parseFloat(latestSimulation.lowerBound || "0") },
        { name: "Limite Superior", value: parseFloat(latestSimulation.upperBound || "0") },
      ]
    : [];
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Testes</h1>
          <p className="text-muted-foreground mt-2">
            Projeto: {project?.name || "Carregando..."}
          </p>
        </div>
        
        <Tabs defaultValue="tests" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tests">Testes do Projeto</TabsTrigger>
            <TabsTrigger value="available">Testes Disponíveis</TabsTrigger>
            <TabsTrigger value="simulation">Simulação Monte Carlo</TabsTrigger>
          </TabsList>
          
          {/* Tab: Testes do Projeto */}
          <TabsContent value="tests" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Testes Associados</CardTitle>
                    <CardDescription>
                      Testes configurados para este projeto
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowAddTestDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Teste
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!projectTests || projectTests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum teste adicionado ainda</p>
                    <p className="text-sm mt-2">Clique em "Adicionar Teste" para começar</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome do Teste</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Unidade</TableHead>
                        <TableHead>Valor Alvo</TableHead>
                        <TableHead>Tolerância</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Prioridade</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projectTests.map((pt: any) => (
                        <TableRow key={pt.projectTest.id}>
                          <TableCell className="font-medium">{pt.test?.name || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{pt.test?.category || "N/A"}</Badge>
                          </TableCell>
                          <TableCell>{pt.test?.unit || "-"}</TableCell>
                          <TableCell>{pt.test?.targetValue || "-"}</TableCell>
                          <TableCell>±{pt.test?.tolerance || "-"}</TableCell>
                          <TableCell>
                            <Badge variant={
                              pt.projectTest.status === "completed" ? "default" :
                              pt.projectTest.status === "in_progress" ? "secondary" :
                              pt.projectTest.status === "failed" ? "destructive" : "outline"
                            }>
                              {pt.projectTest.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              pt.projectTest.priority === "critical" ? "destructive" :
                              pt.projectTest.priority === "high" ? "default" : "secondary"
                            }>
                              {pt.projectTest.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTest(pt.projectTest.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Testes Disponíveis */}
          <TabsContent value="available" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Catálogo de Testes</CardTitle>
                    <CardDescription>
                      Todos os testes disponíveis no sistema
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowCreateTestDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Novo Teste
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableTests?.map((test: any) => (
                    <Card key={test.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base">{test.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline">{test.category}</Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {test.description || "Sem descrição"}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          {test.unit && (
                            <div>
                              <span className="font-medium">Unidade:</span> {test.unit}
                            </div>
                          )}
                          {test.targetValue && (
                            <div>
                              <span className="font-medium">Alvo:</span> {test.targetValue}
                            </div>
                          )}
                          {test.duration && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {test.duration}h
                            </div>
                          )}
                          {test.cost && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              R$ {test.cost}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Tab: Simulação Monte Carlo */}
          <TabsContent value="simulation" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Simulação de Monte Carlo</CardTitle>
                    <CardDescription>
                      Análise de risco e probabilidade de sucesso
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={handleRunSimulation}
                    disabled={isRunningSimulation || !projectTests || projectTests.length === 0}
                  >
                    {isRunningSimulation ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Executar Simulação
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {!latestSimulation ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma simulação executada ainda</p>
                    <p className="text-sm mt-2">
                      Adicione testes ao projeto e clique em "Executar Simulação"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Probabilidade de Sucesso</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold text-green-600">
                            {parseFloat(latestSimulation.successProbability || "0").toFixed(1)}%
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Valor Médio</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {parseFloat(latestSimulation.meanValue || "0").toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Desvio Padrão</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {parseFloat(latestSimulation.stdDeviation || "0").toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardDescription>Iterações</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">
                            {latestSimulation.iterations?.toLocaleString()}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    {/* Gráfico de Distribuição */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Distribuição de Resultados</CardTitle>
                        <CardDescription>
                          Primeiras 100 iterações da simulação
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={simulationChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="iteration" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    {/* Métricas Estatísticas */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Intervalo de Confiança ({latestSimulation.confidenceLevel}%)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={metricsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#82ca9d" />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    
                    {/* Gráfico de Dispersão - Comparação de Testes */}
                    {projectTests && projectTests.length > 1 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Comparação de Testes (Dispersão)</CardTitle>
                          <CardDescription>
                            Visualização lado a lado dos resultados de diferentes testes
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={400}>
                            <ScatterChart>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                type="number" 
                                dataKey="x" 
                                name="Iteração" 
                                label={{ value: 'Iteração', position: 'insideBottom', offset: -5 }}
                              />
                              <YAxis 
                                type="number" 
                                dataKey="y" 
                                name="Valor" 
                                label={{ value: 'Valor Medido', angle: -90, position: 'insideLeft' }}
                              />
                              <ZAxis type="number" dataKey="z" range={[50, 200]} name="Confiança" />
                              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                              <Legend />
                              {projectTests.slice(0, 5).map((pt: any, index: number) => {
                                const testData = simulationChartData.slice(index * 20, (index + 1) * 20).map((item, i) => ({
                                  x: i + 1,
                                  y: item.value + (index * 5), // Offset para visualização
                                  z: 100,
                                  test: pt.test?.name || `Teste ${index + 1}`,
                                }));
                                const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#a28bd4'];
                                return (
                                  <Scatter
                                    key={pt.projectTest.id}
                                    name={pt.test?.name || `Teste ${index + 1}`}
                                    data={testData}
                                    fill={colors[index % colors.length]}
                                  />
                                );
                              })}
                            </ScatterChart>
                          </ResponsiveContainer>
                          <div className="mt-4 p-4 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">
                              <strong>Interpretação:</strong> Cada cor representa um teste diferente. 
                              A dispersão dos pontos indica a variabilidade dos resultados. 
                              Testes com pontos mais agrupados têm menor variabilidade (mais consistentes).
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Interpretação */}
                    <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          Interpretação dos Resultados
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <p>
                          <strong>Probabilidade de Sucesso:</strong> {parseFloat(latestSimulation.successProbability || "0").toFixed(1)}% 
                          {parseFloat(latestSimulation.successProbability || "0") >= 90 ? " (Excelente)" : 
                           parseFloat(latestSimulation.successProbability || "0") >= 70 ? " (Bom)" : 
                           parseFloat(latestSimulation.successProbability || "0") >= 50 ? " (Moderado)" : " (Baixo)"}
                        </p>
                        <p>
                          <strong>Intervalo de Confiança:</strong> Com {latestSimulation.confidenceLevel}% de confiança, 
                          os resultados estarão entre {parseFloat(latestSimulation.lowerBound || "0").toFixed(2)} e {parseFloat(latestSimulation.upperBound || "0").toFixed(2)}
                        </p>
                        <p>
                          <strong>Variabilidade:</strong> O desvio padrão de {parseFloat(latestSimulation.stdDeviation || "0").toFixed(2)} indica 
                          {parseFloat(latestSimulation.stdDeviation || "0") < 1 ? " baixa variabilidade (processo estável)" : 
                           parseFloat(latestSimulation.stdDeviation || "0") < 3 ? " variabilidade moderada" : " alta variabilidade (revisar parâmetros)"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Dialog: Adicionar Teste */}
        <Dialog open={showAddTestDialog} onOpenChange={setShowAddTestDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Teste ao Projeto</DialogTitle>
              <DialogDescription>
                Selecione um teste do catálogo para adicionar a este projeto
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="test-select">Teste</Label>
                <Select value={selectedTestId} onValueChange={setSelectedTestId}>
                  <SelectTrigger id="test-select">
                    <SelectValue placeholder="Selecione um teste" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTests?.map((test: any) => (
                      <SelectItem key={test.id} value={test.id}>
                        {test.name} ({test.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddTestDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddTest} disabled={!selectedTestId}>
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Dialog: Criar Novo Teste */}
        <Dialog open={showCreateTestDialog} onOpenChange={setShowCreateTestDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Teste</DialogTitle>
              <DialogDescription>
                Defina os parâmetros do novo teste
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  placeholder="Ex: Teste de Viscosidade"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select value={newTest.category} onValueChange={(value) => setNewTest({ ...newTest, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cremosidade">Cremosidade</SelectItem>
                    <SelectItem value="estabilidade">Estabilidade</SelectItem>
                    <SelectItem value="sensorial">Sensorial</SelectItem>
                    <SelectItem value="microbiologica">Microbiológica</SelectItem>
                    <SelectItem value="nutricional">Nutricional</SelectItem>
                    <SelectItem value="fisica">Física</SelectItem>
                    <SelectItem value="quimica">Química</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Input
                  id="description"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  placeholder="Descrição detalhada do teste"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="unit">Unidade</Label>
                <Input
                  id="unit"
                  value={newTest.unit}
                  onChange={(e) => setNewTest({ ...newTest, unit: e.target.value })}
                  placeholder="Ex: cP, %, mg/L"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetValue">Valor Alvo</Label>
                <Input
                  id="targetValue"
                  type="number"
                  step="0.01"
                  value={newTest.targetValue}
                  onChange={(e) => setNewTest({ ...newTest, targetValue: e.target.value })}
                  placeholder="Ex: 100"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tolerance">Tolerância (±)</Label>
                <Input
                  id="tolerance"
                  type="number"
                  step="0.01"
                  value={newTest.tolerance}
                  onChange={(e) => setNewTest({ ...newTest, tolerance: e.target.value })}
                  placeholder="Ex: 5"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="minValue">Valor Mínimo</Label>
                <Input
                  id="minValue"
                  type="number"
                  step="0.01"
                  value={newTest.minValue}
                  onChange={(e) => setNewTest({ ...newTest, minValue: e.target.value })}
                  placeholder="Ex: 50"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxValue">Valor Máximo</Label>
                <Input
                  id="maxValue"
                  type="number"
                  step="0.01"
                  value={newTest.maxValue}
                  onChange={(e) => setNewTest({ ...newTest, maxValue: e.target.value })}
                  placeholder="Ex: 150"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="duration">Duração (horas)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={newTest.duration}
                  onChange={(e) => setNewTest({ ...newTest, duration: e.target.value })}
                  placeholder="Ex: 24"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={newTest.cost}
                  onChange={(e) => setNewTest({ ...newTest, cost: e.target.value })}
                  placeholder="Ex: 500.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateTestDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTest} disabled={!newTest.name || !newTest.category}>
                Criar Teste
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

