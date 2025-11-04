import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Target, TrendingUp, AlertCircle } from "lucide-react";

interface ProjectDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: {
    id: string;
    name: string;
    description?: string | null;
    productType?: string | null;
    factory?: string | null;
    status?: string | null;
    riskScore?: string | null;
    successProbability?: string | null;
  };
}

// Dados dos testes industriais por produto
const testData: Record<string, any> = {
  "Lançamento Nescau Zero Açúcar": {
    description: "Novo produto: Formulação zero açúcar para linha saudável, pó achocolatado com adoçantes como stevia ou eritritol, cacau e fibras. Desafios incluem manutenção do sabor de chocolate sem açúcar, solubilidade em leite e estabilidade térmica.",
    tests: [
      {
        name: "Solubilidade e Dissolução",
        description: "Avaliar tempo de mistura em leite/água fria/quente; medir viscosidade da solução final (análoga à fluidez em emulsões cosméticas).",
        metrics: "Tempo <30s para dissolução completa; viscosidade 50-100 cP (Brookfield viscometer).",
        impact: "Previne aglomeração (risco de reclamações por textura granulosa); redução de 40% em downtime de linhas de envase.",
        duration: "2-3 dias (piloto)",
      },
      {
        name: "Estabilidade Sensorial e Textural",
        description: "Testar mouthfeel cremoso pós-reconstituição; análise de cremosidade (textura suave como espuma de chocolate) e ausência de separação.",
        metrics: "Score sensorial ≥7/10 (painel treinado); uniformidade visual >95% (sem partículas).",
        impact: "Mitiga reclamações pós-lançamento (50% redução esperada via clustering BERT); conformidade FDA para adoçantes.",
        duration: "1 semana (acelerado)",
      },
      {
        name: "Estabilidade Térmica e Shelf-Life",
        description: "Armazenamento acelerado (40°C/75% UR); medir umidade, aglomeração e perda de aroma (transparência = clareza da cor marrom uniforme).",
        metrics: "Shelf-life ≥12 meses; umidade <5%; cor ΔE <3 (espectrofotômetro).",
        impact: "Previsão de falhas em 90% acurácia (dados manufatura via ETL); evita recalls regulatórios (100% conformidade).",
        duration: "4 semanas",
      },
      {
        name: "Análise Nutricional e Microbiológica",
        description: "Verificar retenção de vitaminas/minerais; contagem de coliformes e bolores em pó.",
        metrics: "Retenção ≥90% de ferro/vitamina C; <10 UFC/g contaminantes.",
        impact: "Integração com standards Nestlé; economia de R$ 459k em falhas nutricionais.",
        duration: "3 dias",
      },
    ],
  },
  "Ninho Phases 4 Reformulado": {
    description: "Reformulação: Novos nutrientes como prebióticos, vitaminas e ferro para crianças >3 anos, leite em pó integral desnatado. Foco em fortificação nutricional, solubilidade e ausência de off-flavors.",
    tests: [
      {
        name: "Reconstituição e Fluidez",
        description: "Mistura em água; medir viscosidade (análoga à fluidez cosmética) e cremosidade (mouthfeel lácteo suave).",
        metrics: "Tempo <20s; viscosidade 20-50 cP; sem grumos >1mm.",
        impact: "Reduz downtime em 40% (integração SAP/MFC); previsão de falhas em solubilidade via Monte Carlo.",
        duration: "2 dias (piloto)",
      },
      {
        name: "Estabilidade de Nutrientes",
        description: "Análise de retenção de prebióticos/vitaminas pós-secagem (spray-drying); uniformidade visual (transparência = pó branco homogêneo).",
        metrics: "Retenção ≥95% de ferro/vitamina D; partículas <50μm (laser difração).",
        impact: "Conformidade 100% com ISO/FDA; mitigação de riscos regulatórios via NLP em standards.",
        duration: "1 semana",
      },
      {
        name: "Análise de Scorched Particles e Qualidade",
        description: "Inspeção de partículas queimadas em pó (método ADPI); teste sensorial para off-flavors.",
        metrics: "Rating A/B (≤15mg/100g partículas); score ≥8/10 em frescor.",
        impact: "Integra dados manufatura para acurácia ≥85%; redução de 75% em falhas críticas.",
        duration: "3 dias",
      },
      {
        name: "Microbiológica e Shelf-Life",
        description: "Contagem de bactérias lácticas; armazenamento acelerado para medir oxidação.",
        metrics: "<100 UFC/g totais; shelf-life ≥18 meses a 25°C.",
        impact: "Análise de reclamações via sentiment BERT (50% redução); suporte a 1TB/mês de dados.",
        duration: "4 semanas",
      },
    ],
  },
  "Kit Kat Vegano": {
    description: "Versão vegana: Chocolate alternativo à base de arroz/leite vegetal, wafer crocante, sem laticínios. Ênfase em textura crocante do wafer, derretimento do chocolate e estabilidade vegana.",
    tests: [
      {
        name: "Textura do Wafer e Snapping",
        description: "Teste de quebra do bar; cremosidade do chocolate vegano (mouthfeel suave como creme cosmético).",
        metrics: "Força de quebra 5-10N (texturômetro); crocância >80% (acústica).",
        impact: "Previne quebras na embalagem (risco manufatura); redução de 30% em atrasos via alertas.",
        duration: "2 dias",
      },
      {
        name: "Derretimento e Viscosidade",
        description: "Avaliar fluidez do chocolate em temperatura ambiente (análoga à viscosidade cosmética); teste de temperagem.",
        metrics: "Ponto de derretimento 32-35°C; viscosidade 100-200 cP.",
        impact: "Mitiga bloom (separação visual); conformidade vegana 100% (NLP em standards).",
        duration: "3 dias",
      },
      {
        name: "Estabilidade Sensorial e Shelf-Life",
        description: "Armazenamento acelerado; uniformidade visual (transparência = brilho uniforme sem manchas).",
        metrics: "Shelf-life ≥12 meses; score sensorial ≥7/10; cor estável ΔE <2.",
        impact: "Análise de reclamações por textura (50% redução); economia anual R$ 3M via ROI 38%.",
        duration: "4 semanas",
      },
      {
        name: "Microbiológica e Composicional",
        description: "Verificar contaminantes em wafer/chocolate; análise de ausência de traços lácteos.",
        metrics: "<10 UFC/g; <5ppm alérgenos (ELISA).",
        impact: "Integração CRM para padrões veganos; acurácia ML ≥85% em riscos alérgicos.",
        duration: "2 dias",
      },
    ],
  },
};

export default function ProjectDetailsModal({ open, onOpenChange, project }: ProjectDetailsModalProps) {
  const projectTests = testData[project.name] || {
    description: "Detalhes dos testes industriais não disponíveis para este projeto.",
    tests: [],
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{project.name}</DialogTitle>
          <DialogDescription>
            {project.description || projectTests.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações Gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tipo de Produto</p>
                  <p className="font-medium">{project.productType || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fábrica</p>
                  <p className="font-medium">{project.factory || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Score de Risco</p>
                  <p
                    className={`font-bold ${
                      parseInt(project.riskScore || "0") > 50
                        ? "text-red-600"
                        : parseInt(project.riskScore || "0") > 30
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {project.riskScore || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prob. Sucesso</p>
                  <p className="font-bold text-green-600">{project.successProbability || "N/A"}%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Testes Industriais */}
          {projectTests.tests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Testes Industriais</CardTitle>
                <CardDescription>
                  Validação de formulação, estabilidade, qualidade sensorial e conformidade regulatória
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="test-0" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    {projectTests.tests.map((test: any, index: number) => (
                      <TabsTrigger key={index} value={`test-${index}`} className="text-xs md:text-sm whitespace-normal h-auto py-2">
                        {test.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  {projectTests.tests.map((test: any, index: number) => (
                    <TabsContent key={index} value={`test-${index}`} className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            Descrição
                          </h4>
                          <p className="text-sm text-muted-foreground">{test.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            Métricas de Performance
                          </h4>
                          <p className="text-sm text-muted-foreground">{test.metrics}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-orange-500" />
                            Impacto Esperado
                          </h4>
                          <p className="text-sm text-muted-foreground">{test.impact}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            Duração Estimada
                          </h4>
                          <Badge variant="secondary">{test.duration}</Badge>
                        </div>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </CardContent>
            </Card>
          )}

          {/* Integração com PrediTest AI */}
          <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Integração com PrediTest AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Todos os testes alimentam o sistema via APIs SAP/MFC, gerando scores de risco (0-100) e recomendações automáticas
              </p>
              <p>
                • Simulações Monte Carlo preveem cenários "e se" com variação de parâmetros críticos
              </p>
              <p>
                • Redução de 75% em falhas críticas através de análise preditiva com acurácia ≥85%
              </p>
              <p>
                • Economia anual estimada: R$ 3.002.500 | ROI: 38% | Payback: 8,7 meses
              </p>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}

