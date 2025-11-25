import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Loader2, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Ingredient {
  name: string;
  percentage: number;
  supplier?: string;
}

interface ProcessParameters {
  temperature: number;
  mixingTime: number;
  lineSpeed: number;
  pressure?: number;
  humidity?: number;
  ph?: number;
}

interface PredictionModalProps {
  projectId: string;
  onPredictionComplete: (prediction: any) => void;
  trigger?: React.ReactNode;
}

// Presets para os 3 produtos Nestlé
const PRODUCT_PRESETS = {
  nescau: {
    name: "Nescau Zero Açúcar",
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
  },
  ninho: {
    name: "Ninho Phases 4 Reformulado",
    formula: [
      { name: "Leite em pó integral", percentage: 65.0 },
      { name: "Lactose", percentage: 20.0 },
      { name: "Vitaminas", percentage: 2.5 },
      { name: "Minerais", percentage: 2.5 },
      { name: "DHA", percentage: 1.0 },
      { name: "Prebióticos", percentage: 9.0 },
    ],
    processParameters: {
      temperature: 68.0,
      mixingTime: 15.0,
      lineSpeed: 80.0,
      pressure: 3.0,
      humidity: 40.0,
      ph: 6.5,
    },
    factory: "São José dos Campos - SP",
  },
  kitkat: {
    name: "Kit Kat Vegano",
    formula: [
      { name: "Chocolate vegano", percentage: 45.0 },
      { name: "Wafer", percentage: 35.0 },
      { name: "Óleo de coco", percentage: 12.0 },
      { name: "Açúcar", percentage: 6.0 },
      { name: "Lecitina de girassol", percentage: 1.5 },
      { name: "Aroma natural", percentage: 0.5 },
    ],
    processParameters: {
      temperature: 32.0,
      mixingTime: 8.0,
      lineSpeed: 120.0,
      pressure: 1.8,
      humidity: 35.0,
      ph: 7.0,
    },
    factory: "Caçapava - SP",
  },
};

export function PredictionModal({ projectId, onPredictionComplete, trigger }: PredictionModalProps) {
  const [open, setOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [factory, setFactory] = useState("");
  const [formula, setFormula] = useState<Ingredient[]>([{ name: "", percentage: 0 }]);
  const [processParams, setProcessParams] = useState<ProcessParameters>({
    temperature: 75,
    mixingTime: 12,
    lineSpeed: 95,
    pressure: 2.5,
    humidity: 45,
    ph: 6.8,
  });

  const predictMutation = trpc.predictions.predictWithML.useMutation();

  const loadPreset = (presetKey: keyof typeof PRODUCT_PRESETS) => {
    const preset = PRODUCT_PRESETS[presetKey];
    setProductName(preset.name);
    setFormula(preset.formula);
    setProcessParams(preset.processParameters);
    setFactory(preset.factory);
  };

  const addIngredient = () => {
    setFormula([...formula, { name: "", percentage: 0 }]);
  };

  const removeIngredient = (index: number) => {
    setFormula(formula.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: keyof Ingredient, value: string | number) => {
    const newFormula = [...formula];
    newFormula[index] = { ...newFormula[index], [field]: value };
    setFormula(newFormula);
  };

  const updateProcessParam = (field: keyof ProcessParameters, value: number) => {
    setProcessParams({ ...processParams, [field]: value });
  };

  const getTotalPercentage = () => {
    return formula.reduce((sum, ing) => sum + (ing.percentage || 0), 0);
  };

  const isFormValid = () => {
    const totalPercentage = getTotalPercentage();
    const hasAllIngredients = formula.every((ing) => ing.name && ing.percentage > 0);
    const isPercentageValid = Math.abs(totalPercentage - 100) < 0.1; // Tolerance of 0.1%
    return productName && factory && hasAllIngredients && isPercentageValid;
  };

  const handlePredict = async () => {
    if (!isFormValid()) {
      alert("Por favor, preencha todos os campos e garanta que a fórmula totalize 100%");
      return;
    }

    try {
      const result = await predictMutation.mutateAsync({
        projectId,
        productName,
        formula: formula.filter((ing) => ing.name && ing.percentage > 0),
        processParameters: {
          temperature: processParams.temperature,
          mixingTime: processParams.mixingTime,
          lineSpeed: processParams.lineSpeed,
          pressure: processParams.pressure,
          humidity: processParams.humidity,
          ph: processParams.ph,
        },
        factory,
        monteCarloIterations: 10000,
      });

      onPredictionComplete(result);
      setOpen(false);
    } catch (error: any) {
      console.error("Prediction failed:", error);
      alert(`Erro ao gerar predição: ${error.message || "Microserviço indisponível"}`);
    }
  };

  const totalPercentage = getTotalPercentage();
  const percentageColor = Math.abs(totalPercentage - 100) < 0.1 ? "text-green-500" : "text-red-500";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="lg">
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar Predição ML
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Nova Predição de Testes</DialogTitle>
          <DialogDescription>
            Insira a fórmula e os parâmetros de processo para gerar predição com ML + Monte Carlo
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="presets" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="presets">Presets Nestlé</TabsTrigger>
            <TabsTrigger value="custom">Entrada Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadPreset("nescau")}>
                <CardHeader>
                  <CardTitle className="text-lg">Nescau Zero Açúcar</CardTitle>
                  <CardDescription>Achocolatado em pó</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">6 ingredientes</p>
                  <p className="text-sm text-muted-foreground">Fábrica: Araraquara - SP</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadPreset("ninho")}>
                <CardHeader>
                  <CardTitle className="text-lg">Ninho Phases 4</CardTitle>
                  <CardDescription>Leite em pó infantil</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">6 ingredientes</p>
                  <p className="text-sm text-muted-foreground">Fábrica: São José dos Campos - SP</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={() => loadPreset("kitkat")}>
                <CardHeader>
                  <CardTitle className="text-lg">Kit Kat Vegano</CardTitle>
                  <CardDescription>Chocolate wafer vegano</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">6 ingredientes</p>
                  <p className="text-sm text-muted-foreground">Fábrica: Caçapava - SP</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Nescau Zero Açúcar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="factory">Fábrica</Label>
                <Input id="factory" value={factory} onChange={(e) => setFactory(e.target.value)} placeholder="Ex: Araraquara - SP" />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Formula Section */}
        <div className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Fórmula</h3>
              <p className="text-sm text-muted-foreground">
                Total: <span className={`font-semibold ${percentageColor}`}>{totalPercentage.toFixed(2)}%</span> (deve ser 100%)
              </p>
            </div>
            <Button onClick={addIngredient} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Ingrediente
            </Button>
          </div>

          <div className="space-y-2">
            {formula.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end">
                <div className="col-span-5 space-y-1">
                  <Label className="text-xs">Ingrediente</Label>
                  <Input
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, "name", e.target.value)}
                    placeholder="Nome do ingrediente"
                  />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-xs">% (m/m)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={ingredient.percentage || ""}
                    onChange={(e) => updateIngredient(index, "percentage", parseFloat(e.target.value) || 0)}
                    placeholder="0.0"
                  />
                </div>
                <div className="col-span-4 space-y-1">
                  <Label className="text-xs">Fornecedor (opcional)</Label>
                  <Input
                    value={ingredient.supplier || ""}
                    onChange={(e) => updateIngredient(index, "supplier", e.target.value)}
                    placeholder="Ex: Barry Callebaut"
                  />
                </div>
                <div className="col-span-1">
                  <Button onClick={() => removeIngredient(index)} variant="ghost" size="icon" disabled={formula.length === 1}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Process Parameters Section */}
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Parâmetros de Processo</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                value={processParams.temperature}
                onChange={(e) => updateProcessParam("temperature", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mixingTime">Tempo de Mistura (min)</Label>
              <Input
                id="mixingTime"
                type="number"
                step="0.1"
                value={processParams.mixingTime}
                onChange={(e) => updateProcessParam("mixingTime", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lineSpeed">Velocidade da Linha (m/min)</Label>
              <Input
                id="lineSpeed"
                type="number"
                step="1"
                value={processParams.lineSpeed}
                onChange={(e) => updateProcessParam("lineSpeed", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pressure">Pressão (bar) - Opcional</Label>
              <Input
                id="pressure"
                type="number"
                step="0.1"
                value={processParams.pressure || ""}
                onChange={(e) => updateProcessParam("pressure", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="humidity">Umidade (%) - Opcional</Label>
              <Input
                id="humidity"
                type="number"
                step="1"
                value={processParams.humidity || ""}
                onChange={(e) => updateProcessParam("humidity", parseFloat(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ph">pH - Opcional</Label>
              <Input
                id="ph"
                type="number"
                step="0.1"
                value={processParams.ph || ""}
                onChange={(e) => updateProcessParam("ph", parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handlePredict} disabled={!isFormValid() || predictMutation.isLoading}>
            {predictMutation.isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Predição...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Gerar Predição (10k iterações)
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

