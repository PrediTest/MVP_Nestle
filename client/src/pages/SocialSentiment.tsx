import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Instagram, 
  Facebook, 
  Twitter, 
  TrendingUp, 
  TrendingDown,
  MessageCircle,
  ThumbsUp,
  Share2,
  AlertCircle,
  Smile,
  Frown,
  Meh,
  Heart,
  BarChart3
} from "lucide-react";

export default function SocialSentiment() {
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isCollecting, setIsCollecting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Queries
  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: posts, refetch: refetchPosts } = trpc.sentiment.getPostsByProject.useQuery(
    { projectId: selectedProject },
    { enabled: !!selectedProject }
  );
  const { data: summary, refetch: refetchSummary } = trpc.sentiment.getSummary.useQuery(
    { projectId: selectedProject },
    { enabled: !!selectedProject }
  );

  // Mutations
  const collectAndAnalyze = trpc.sentiment.collectAndAnalyzeAll.useMutation({
    onSuccess: (data) => {
      toast.success(`Coletados ${data.postsCollected} posts e analisados com sucesso!`);
      refetchPosts();
      refetchSummary();
      setIsCollecting(false);
      setIsAnalyzing(false);
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
      setIsCollecting(false);
      setIsAnalyzing(false);
    },
  });

  const handleCollectAndAnalyze = async () => {
    if (!selectedProject) {
      toast.error("Selecione um projeto primeiro");
      return;
    }

    setIsCollecting(true);
    setIsAnalyzing(true);

    // Obter nome do produto do projeto selecionado
    const project = projects?.find(p => p.id === selectedProject);
    const productName = project?.name || "Nestlé";

    collectAndAnalyze.mutate({
      projectId: selectedProject,
      config: {
        instagram: {
          account: "nestle",
          keywords: [productName, "Nestlé", "chocolate", "leite"],
        },
        facebook: {
          pageId: "nestle",
          keywords: [productName, "Nestlé"],
        },
        tiktok: {
          username: "nestle",
          keywords: [productName, "Nestlé"],
        },
        twitter: {
          query: `${productName} Nestlé`,
        },
        reclameaqui: {
          company: "Nestlé",
        },
        nestleSite: {
          productUrl: "https://www.nestle.com.br",
        },
      },
      limit: 50,
    });
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "very_positive":
        return <Smile className="h-5 w-5 text-green-500" />;
      case "positive":
        return <Smile className="h-5 w-5 text-green-400" />;
      case "neutral":
        return <Meh className="h-5 w-5 text-gray-400" />;
      case "negative":
        return <Frown className="h-5 w-5 text-orange-400" />;
      case "very_negative":
        return <Frown className="h-5 w-5 text-red-500" />;
      default:
        return <Meh className="h-5 w-5 text-gray-400" />;
    }
  };

  const getSentimentBadge = (sentiment: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      very_positive: "default",
      positive: "secondary",
      neutral: "outline",
      negative: "destructive",
      very_negative: "destructive",
    };

    const labels: Record<string, string> = {
      very_positive: "Muito Positivo",
      positive: "Positivo",
      neutral: "Neutro",
      negative: "Negativo",
      very_negative: "Muito Negativo",
    };

    return (
      <Badge variant={variants[sentiment] || "outline"}>
        {labels[sentiment] || sentiment}
      </Badge>
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "twitter":
        return <Twitter className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const filteredPosts = posts?.filter(post => 
    selectedPlatform === "all" || post.platform === selectedPlatform
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Análise de Sentimento em Redes Sociais</h1>
          <p className="text-muted-foreground">
            Monitore a aceitação do público em múltiplas plataformas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Selecione o projeto e plataforma para análise</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Projeto</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um projeto" />
                </SelectTrigger>
                <SelectContent>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Plataforma</Label>
              <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="twitter">X (Twitter)</SelectItem>
                  <SelectItem value="reclameaqui">Reclame Aqui</SelectItem>
                  <SelectItem value="nestle_site">Site Nestlé</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleCollectAndAnalyze} 
                disabled={!selectedProject || isCollecting}
                className="w-full"
              >
                {isCollecting ? "Coletando..." : "Coletar e Analisar"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo de Sentimento */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Posts</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalPosts}</div>
              <p className="text-xs text-muted-foreground">Analisados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Sentimento Médio</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.averageSentiment > 0 ? "+" : ""}
                {summary.averageSentiment.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.averageSentiment > 0.3 ? "Muito Positivo" : 
                 summary.averageSentiment > 0 ? "Positivo" :
                 summary.averageSentiment > -0.3 ? "Neutro" : "Negativo"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Posts Positivos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {summary.veryPositiveCount + summary.positiveCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalPosts > 0 
                  ? `${(((summary.veryPositiveCount + summary.positiveCount) / summary.totalPosts) * 100).toFixed(1)}%`
                  : "0%"
                } do total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Posts Negativos</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {summary.negativeCount + summary.veryNegativeCount}
              </div>
              <p className="text-xs text-muted-foreground">
                {summary.totalPosts > 0
                  ? `${(((summary.negativeCount + summary.veryNegativeCount) / summary.totalPosts) * 100).toFixed(1)}%`
                  : "0%"
                } do total
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição de Sentimentos */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Sentimentos</CardTitle>
            <CardDescription>Análise detalhada por categoria</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Muito Positivo</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500"
                      style={{ 
                        width: summary.totalPosts > 0 
                          ? `${(summary.veryPositiveCount / summary.totalPosts) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{summary.veryPositiveCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Smile className="h-5 w-5 text-green-400" />
                  <span className="font-medium">Positivo</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-400"
                      style={{ 
                        width: summary.totalPosts > 0
                          ? `${(summary.positiveCount / summary.totalPosts) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{summary.positiveCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Meh className="h-5 w-5 text-gray-400" />
                  <span className="font-medium">Neutro</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gray-400"
                      style={{ 
                        width: summary.totalPosts > 0
                          ? `${(summary.neutralCount / summary.totalPosts) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{summary.neutralCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Frown className="h-5 w-5 text-orange-400" />
                  <span className="font-medium">Negativo</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400"
                      style={{ 
                        width: summary.totalPosts > 0
                          ? `${(summary.negativeCount / summary.totalPosts) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{summary.negativeCount}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Frown className="h-5 w-5 text-red-500" />
                  <span className="font-medium">Muito Negativo</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500"
                      style={{ 
                        width: summary.totalPosts > 0
                          ? `${(summary.veryNegativeCount / summary.totalPosts) * 100}%`
                          : "0%"
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{summary.veryNegativeCount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Keywords e Topics */}
      {summary && (summary.topKeywords.length > 0 || summary.topTopics.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Palavras-Chave Mais Mencionadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.topKeywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tópicos Principais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {summary.topTopics.map((topic, index) => (
                  <Badge key={index} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Posts */}
      {filteredPosts && filteredPosts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Posts Recentes</CardTitle>
            <CardDescription>
              {filteredPosts.length} posts encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredPosts.slice(0, 10).map((post) => (
                <div key={post.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(post.platform)}
                      <span className="font-medium">{post.author}</span>
                      <Badge variant="outline">{post.platform}</Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.publishedAt || "").toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <p className="text-sm">{post.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments}
                      </div>
                      <div className="flex items-center gap-1">
                        <Share2 className="h-4 w-4" />
                        {post.shares}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado vazio */}
      {!selectedProject && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Selecione um Projeto</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Escolha um projeto acima para começar a coletar e analisar posts de redes sociais
            </p>
          </CardContent>
        </Card>
      )}
      </div>
    </DashboardLayout>
  );
}

