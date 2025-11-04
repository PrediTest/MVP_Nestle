import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Clock, Target, TrendingUp, AlertCircle, Star, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

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

// Sistema de pontuação de desempenho
interface PerformanceRating {
  creaminess: number; // 1-5 estrelas
  stability: number; // 1-5 estrelas
  overall: number; // 1-5 estrelas (média ponderada)
  badge: "Excelente" | "Muito Bom" | "Bom" | "Regular" | "Insuficiente";
}

function calculateBadge(rating: number): PerformanceRating["badge"] {
  if (rating >= 4.5) return "Excelente";
  if (rating >= 3.5) return "Muito Bom";
  if (rating >= 2.5) return "Bom";
  if (rating >= 1.5) return "Regular";
  return "Insuficiente";
}

// Dados dos testes industriais por produto
const testData: Record<string, any> = {
  "Lançamento Nescau Zero Açúcar": {
    description: "Novo produto: Formulação zero açúcar para linha saudável, pó achocolatado com adoçantes como stevia ou eritritol, cacau e fibras. Desafios incluem manutenção do sabor de chocolate sem açúcar, solubilidade em leite e estabilidade térmica.",
    rating: {
      creaminess: 4.0,
      stability: 4.5,
      overall: 4.3,
      badge: calculateBadge(4.3),
    } as PerformanceRating,
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
    rating: {
      creaminess: 4.5,
      stability: 4.0,
      overall: 4.3,
      badge: calculateBadge(4.3),
    } as PerformanceRating,
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
  "Moça Cremosa Premium": {
    description: "Novo produto: Leite condensado ultra cremoso com textura aveludada, formulação premium com maior teor de sólidos lácteos e emulsificantes naturais. Desafios incluem manter cremosidade uniforme, prevenir cristalização e garantir estabilidade durante shelf-life.",
    rating: {
      creaminess: 5.0,
      stability: 4.5,
      overall: 4.8,
      badge: calculateBadge(4.8),
    } as PerformanceRating,
    tests: [
      {
        name: "Análise de Cremosidade e Viscosidade",
        description: "Medir viscosidade aparente em diferentes temperaturas; avaliar mouthfeel cremoso e textura aveludada usando texturômetro e painel sensorial treinado.",
        metrics: "Viscosidade 8.000-12.000 cP a 25°C (Brookfield RV); score de cremosidade ≥8/10; ausência de granulosidade.",
        impact: "Garante diferenciação premium no mercado; redução de 60% em reclamações de textura; aumento de 25% em satisfação do consumidor.",
        duration: "3 dias (piloto)",
      },
      {
        name: "Estabilidade de Emulsão e Separação de Fases",
        description: "Teste de centrifugação acelerada; armazenamento em diferentes temperaturas (5°C, 25°C, 40°C); análise visual de separação de soro ou cristalização.",
        metrics: "Estabilidade >95% após centrifugação 3.000 rpm/30min; ausência de separação visual; uniformidade de cor ΔE <2.",
        impact: "Previne defeitos críticos (separação = 80% das reclamações); conformidade 100% com padrões Nestlé; economia R$ 580k/ano.",
        duration: "2 semanas (acelerado)",
      },
      {
        name: "Estabilidade Térmica e Shelf-Life",
        description: "Armazenamento acelerado (40°C/75% UR por 12 semanas); medir mudanças em viscosidade, cor e formação de cristais de lactose.",
        metrics: "Shelf-life ≥24 meses; variação de viscosidade <10%; cristalização <0.5% (microscopia).",
        impact: "Previsão de falhas com 92% acurácia via ML; evita recalls (custo médio R$ 2M); redução de 45% em perdas.",
        duration: "12 semanas",
      },
      {
        name: "Análise Sensorial e Aceitação",
        description: "Teste triangular e escala hedônica com 100+ consumidores; avaliar cremosidade, doçura e aceitação global.",
        metrics: "Aceitação ≥80%; preferência vs. concorrente >60%; score cremosidade ≥8.5/10.",
        impact: "Valida posicionamento premium; integração com análise de sentimento em redes sociais; ROI 45%.",
        duration: "1 semana",
      },
    ],
  },
  "Nescafé Espresso Cremoso": {
    description: "Reformulação: Café solúvel premium com crema persistente, blend 100% arábica com tecnologia de microespuma. Foco em cremosidade da espuma, estabilidade da crema e intensidade aromática.",
    rating: {
      creaminess: 4.5,
      stability: 4.0,
      overall: 4.3,
      badge: calculateBadge(4.3),
    } as PerformanceRating,
    tests: [
      {
        name: "Formação e Estabilidade de Crema",
        description: "Avaliar altura e persistência da crema após dissolução em água quente; medir densidade e tamanho de bolhas (análise de imagem).",
        metrics: "Altura de crema ≥3mm; persistência >2min; densidade de bolhas 50-100μm; uniformidade >90%.",
        impact: "Diferencial competitivo (crema = atributo #1 em pesquisas); redução de 55% em reclamações; aumento de 30% em recompra.",
        duration: "2 dias (piloto)",
      },
      {
        name: "Análise de Cremosidade e Textura",
        description: "Medir viscosidade da bebida reconstituída; avaliar mouthfeel cremoso e corpo aveludado via painel sensorial.",
        metrics: "Viscosidade 15-25 cP; score de cremosidade ≥7.5/10; corpo médio-alto; ausência de adstringência.",
        impact: "Alinhamento com perfil sensorial premium; conformidade com standards Nestlé; economia R$ 420k em reformulações.",
        duration: "3 dias",
      },
      {
        name: "Estabilidade de Aroma e Shelf-Life",
        description: "Armazenamento acelerado (40°C/60% UR); análise de voláteis por GC-MS; teste sensorial de intensidade aromática.",
        metrics: "Shelf-life ≥18 meses; retenção de voláteis >85%; score aromático ≥7/10; ausência de rancidez.",
        impact: "Previsão de degradação com 88% acurácia; integração com IoT em armazéns; redução de 40% em perdas.",
        duration: "8 semanas",
      },
      {
        name: "Estabilidade Física e Aglomeração",
        description: "Teste de fluidez do pó; análise de aglomeração em diferentes umidades; dissolução instantânea.",
        metrics: "Tempo de dissolução <5s; fluidez >70% (ângulo de repouso <35°); umidade <4%.",
        impact: "Previne aglomeração (risco manufatura); redução de 35% em downtime; conformidade ISO 100%.",
        duration: "1 semana",
      },
    ],
  },
  "Nestlé Iogurte Grego Cremoso": {
    description: "Novo produto: Iogurte grego com 10% de gordura, textura ultra cremosa e proteína elevada (15g/porção). Desafios incluem manter cremosidade sem sinérese, estabilidade de textura e shelf-life refrigerado.",
    rating: {
      creaminess: 5.0,
      stability: 4.5,
      overall: 4.8,
      badge: calculateBadge(4.8),
    } as PerformanceRating,
    tests: [
      {
        name: "Análise de Cremosidade e Consistência",
        description: "Medir firmeza e cremosidade usando texturômetro (back extrusion); avaliar mouthfeel e ausência de granulosidade.",
        metrics: "Firmeza 150-250g (probe 35mm); cremosidade score ≥8.5/10; consistência homogênea >95%.",
        impact: "Posicionamento premium validado; redução de 70% em reclamações de textura; aumento de 40% em satisfação.",
        duration: "2 dias (piloto)",
      },
      {
        name: "Estabilidade e Controle de Sinérese",
        description: "Armazenamento refrigerado (4°C) por 45 dias; medir separação de soro (sinérese) por centrifugação e drenagem.",
        metrics: "Sinérese <5% após 45 dias; estabilidade visual >98%; pH 4.2-4.6 estável.",
        impact: "Previne principal defeito de iogurte grego (sinérese = 65% reclamações); economia R$ 680k/ano; shelf-life estendido.",
        duration: "45 dias",
      },
      {
        name: "Estabilidade Microbiológica e Shelf-Life",
        description: "Contagem de bactérias lácticas, bolores e leveduras; teste de vida útil em diferentes temperaturas de armazenamento.",
        metrics: "Shelf-life ≥45 dias a 4°C; contagem láctica >10^7 UFC/g; ausência de contaminantes; acidez estável.",
        impact: "Conformidade 100% com ISO/FDA; integração com blockchain para rastreabilidade; redução de 50% em recalls.",
        duration: "6 semanas",
      },
      {
        name: "Análise Sensorial e Perfil de Textura",
        description: "Teste afetivo com consumidores; análise descritiva quantitativa (QDA) para mapear perfil de cremosidade e sabor.",
        metrics: "Aceitação ≥85%; cremosidade score ≥9/10; preferência vs. líder de mercado >55%.",
        impact: "Validação de formulação premium; análise preditiva de aceitação via BERT; ROI 42%; payback 9 meses.",
        duration: "2 semanas",
      },
    ],
  },
  "Kit Kat Vegano": {
    description: "Versão vegana: Chocolate alternativo à base de arroz/leite vegetal, wafer crocante, sem laticínios. Ênfase em textura crocante do wafer, derretimento do chocolate e estabilidade vegana.",
    rating: {
      creaminess: 3.5,
      stability: 4.0,
      overall: 3.8,
      badge: calculateBadge(3.8),
    } as PerformanceRating,
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

          {/* Botão Gerenciar Testes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Gerenciamento de Testes</CardTitle>
              <CardDescription>
                Adicione, remova ou visualize testes para este projeto
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => window.location.href = `/tests/${project.id}`}
                className="w-full"
              >
                <Settings className="mr-2 h-4 w-4" />
                Gerenciar Testes e Simulações
              </Button>
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

