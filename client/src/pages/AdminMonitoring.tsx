import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminMonitoring() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração de Monitoramento</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie palavras-chave e tópicos monitorados nas redes sociais
          </p>
        </div>

        <Tabs defaultValue="keywords" className="space-y-6">
          <TabsList>
            <TabsTrigger value="keywords">Palavras-Chave</TabsTrigger>
            <TabsTrigger value="topics">Tópicos</TabsTrigger>
          </TabsList>

          <TabsContent value="keywords">
            <KeywordsManagement />
          </TabsContent>

          <TabsContent value="topics">
            <TopicsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// ==================== KEYWORDS MANAGEMENT ====================

function KeywordsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  
  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: keywords, refetch } = trpc.admin.listKeywords.useQuery({});
  const utils = trpc.useUtils();

  const deleteKeyword = trpc.admin.deleteKeyword.useMutation({
    onSuccess: () => {
      toast.success("Palavra-chave excluída com sucesso");
      refetch();
      utils.admin.listKeywords.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir palavra-chave: " + error.message);
    },
  });

  const filteredKeywords = keywords?.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || k.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta palavra-chave?")) {
      deleteKeyword.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Palavras-Chave Monitoradas</CardTitle>
              <CardDescription>
                {filteredKeywords?.length || 0} palavras-chave cadastradas
              </CardDescription>
            </div>
            <CreateKeywordDialog onSuccess={() => refetch()} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar palavra-chave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
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

      {/* Lista de Keywords */}
      <div className="grid gap-4">
        {filteredKeywords?.map((keyword) => (
          <Card key={keyword.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{keyword.keyword}</h3>
                    <Badge variant={keyword.isActive === "yes" ? "default" : "secondary"}>
                      {keyword.isActive === "yes" ? "Ativo" : "Inativo"}
                    </Badge>
                    <Badge variant="outline">{getPlatformLabel(keyword.platform)}</Badge>
                    <Badge variant={getPriorityVariant(keyword.priority)}>
                      {getPriorityLabel(keyword.priority)}
                    </Badge>
                  </div>

                  {keyword.projectId && (
                    <p className="text-sm text-muted-foreground">
                      Projeto: {projects?.find((p) => p.id === keyword.projectId)?.name || keyword.projectId}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Criado em {new Date(keyword.createdAt!).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <EditKeywordDialog keyword={keyword} onSuccess={() => refetch()} />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(keyword.id)}
                    disabled={deleteKeyword.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredKeywords?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhuma palavra-chave encontrada
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ==================== TOPICS MANAGEMENT ====================

function TopicsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<string>("all");
  
  const { data: projects } = trpc.projects.listAll.useQuery();
  const { data: topics, refetch } = trpc.admin.listTopics.useQuery({});
  const utils = trpc.useUtils();

  const deleteTopic = trpc.admin.deleteTopic.useMutation({
    onSuccess: () => {
      toast.success("Tópico excluído com sucesso");
      refetch();
      utils.admin.listTopics.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao excluir tópico: " + error.message);
    },
  });

  const filteredTopics = topics?.filter((t) => {
    const matchesSearch = t.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesProject = selectedProject === "all" || t.projectId === selectedProject;
    return matchesSearch && matchesProject;
  });

  const handleDelete = (id: string) => {
    if (confirm("Tem certeza que deseja excluir este tópico?")) {
      deleteTopic.mutate({ id });
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tópicos Monitorados</CardTitle>
              <CardDescription>
                {filteredTopics?.length || 0} tópicos cadastrados
              </CardDescription>
            </div>
            <CreateTopicDialog onSuccess={() => refetch()} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tópico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
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

      {/* Lista de Topics */}
      <div className="grid gap-4">
        {filteredTopics?.map((topic) => {
          const keywords = topic.keywords ? JSON.parse(topic.keywords) : [];
          return (
            <Card key={topic.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{topic.topic}</h3>
                      <Badge variant={topic.isActive === "yes" ? "default" : "secondary"}>
                        {topic.isActive === "yes" ? "Ativo" : "Inativo"}
                      </Badge>
                      <Badge variant="outline">{getPlatformLabel(topic.platform)}</Badge>
                      <Badge variant={getPriorityVariant(topic.priority)}>
                        {getPriorityLabel(topic.priority)}
                      </Badge>
                    </div>
                    {topic.description && (
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    )}
                    {keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {keywords.map((kw: string, idx: number) => (
                          <Badge key={idx} variant="secondary">
                            {kw}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {topic.projectId && (
                      <p className="text-sm text-muted-foreground">
                        Projeto: {projects?.find((p) => p.id === topic.projectId)?.name || topic.projectId}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Criado em {new Date(topic.createdAt!).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <EditTopicDialog topic={topic} onSuccess={() => refetch()} />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(topic.id)}
                      disabled={deleteTopic.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {filteredTopics?.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Nenhum tópico encontrado
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// ==================== CREATE/EDIT KEYWORD DIALOGS ====================

function CreateKeywordDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    keyword: "",
    platform: "all" as const,
    category: "",
    priority: "medium" as const,
    projectId: "",
  });

  const { data: projects } = trpc.projects.listAll.useQuery();
  const utils = trpc.useUtils();

  const createKeyword = trpc.admin.createKeyword.useMutation({
    onSuccess: () => {
      toast.success("Palavra-chave criada com sucesso");
      setOpen(false);
      setFormData({ keyword: "", platform: "all", category: "", priority: "medium", projectId: "" });
      onSuccess();
      utils.admin.listKeywords.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao criar palavra-chave: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.keyword) {
      toast.error("Palavra-chave é obrigatória");
      return;
    }
    createKeyword.mutate({
      id: `keyword_${Date.now()}`,
      keyword: formData.keyword,
      platform: formData.platform,
      category: formData.category || undefined,
      priority: formData.priority,
      projectId: formData.projectId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Palavra-Chave
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Palavra-Chave</DialogTitle>
            <DialogDescription>
              Adicione uma nova palavra-chave para monitoramento nas redes sociais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">Palavra-Chave *</Label>
              <Input
                id="keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                placeholder="Ex: chocolate, Nestlé, Kit Kat"
              />
            </div>
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
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: produto, marca, concorrente"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createKeyword.isPending}>
              {createKeyword.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditKeywordDialog({ keyword, onSuccess }: { keyword: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    keyword: keyword.keyword,
    platform: keyword.platform,
    category: keyword.category || "",
    priority: keyword.priority,
    isActive: keyword.isActive,
  });

  const utils = trpc.useUtils();

  const updateKeyword = trpc.admin.updateKeyword.useMutation({
    onSuccess: () => {
      toast.success("Palavra-chave atualizada com sucesso");
      setOpen(false);
      onSuccess();
      utils.admin.listKeywords.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar palavra-chave: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateKeyword.mutate({
      id: keyword.id,
      keyword: formData.keyword,
      platform: formData.platform,
      category: formData.category || undefined,
      priority: formData.priority,
      isActive: formData.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Palavra-Chave</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-keyword">Palavra-Chave</Label>
              <Input
                id="edit-keyword"
                value={formData.keyword}
                onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-platform">Plataforma</Label>
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
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-priority">Prioridade</Label>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={formData.isActive} onValueChange={(value: any) => setFormData({ ...formData, isActive: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Ativo</SelectItem>
                  <SelectItem value="no">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateKeyword.isPending}>
              {updateKeyword.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== CREATE/EDIT TOPIC DIALOGS ====================

function CreateTopicDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    keywords: "",
    platform: "all" as const,
    priority: "medium" as const,
    projectId: "",
  });

  const { data: projects } = trpc.projects.listAll.useQuery();
  const utils = trpc.useUtils();

  const createTopic = trpc.admin.createTopic.useMutation({
    onSuccess: () => {
      toast.success("Tópico criado com sucesso");
      setOpen(false);
      setFormData({ topic: "", description: "", keywords: "", platform: "all", priority: "medium", projectId: "" });
      onSuccess();
      utils.admin.listTopics.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao criar tópico: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.topic) {
      toast.error("Tópico é obrigatório");
      return;
    }
    const keywordsArray = formData.keywords
      .split(",")
      .map((k: string) => k.trim())
      .filter((k: string) => k);
    createTopic.mutate({
      id: `topic_${Date.now()}`,
      topic: formData.topic,
      description: formData.description || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      platform: formData.platform,
      priority: formData.priority,
      projectId: formData.projectId || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Tópico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Criar Tópico</DialogTitle>
            <DialogDescription>
              Adicione um novo tópico para monitoramento nas redes sociais
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Tópico *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="Ex: Sabor, Embalagem, Preço"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descreva o tópico..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Palavras-Chave Relacionadas</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                placeholder="Separe por vírgula: gostoso, delicioso, saboroso"
              />
              <p className="text-xs text-muted-foreground">
                Separe múltiplas palavras-chave com vírgula
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic-project">Projeto</Label>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="topic-platform">Plataforma</Label>
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
              <div className="space-y-2">
                <Label htmlFor="topic-priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createTopic.isPending}>
              {createTopic.isPending ? "Criando..." : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditTopicDialog({ topic, onSuccess }: { topic: any; onSuccess: () => void }) {
  const [open, setOpen] = useState(false);
  const keywords = topic.keywords ? JSON.parse(topic.keywords) : [];
  const [formData, setFormData] = useState({
    topic: topic.topic,
    description: topic.description || "",
    keywords: keywords.join(", "),
    platform: topic.platform,
    priority: topic.priority,
    isActive: topic.isActive,
  });

  const utils = trpc.useUtils();

  const updateTopic = trpc.admin.updateTopic.useMutation({
    onSuccess: () => {
      toast.success("Tópico atualizado com sucesso");
      setOpen(false);
      onSuccess();
      utils.admin.listTopics.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar tópico: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywordsArray = formData.keywords
      .split(",")
      .map((k: string) => k.trim())
      .filter((k: string) => k);
    updateTopic.mutate({
      id: topic.id,
      topic: formData.topic,
      description: formData.description || undefined,
      keywords: keywordsArray.length > 0 ? keywordsArray : undefined,
      platform: formData.platform,
      priority: formData.priority,
      isActive: formData.isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Editar Tópico</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-topic">Tópico</Label>
              <Input
                id="edit-topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-keywords">Palavras-Chave Relacionadas</Label>
              <Input
                id="edit-keywords"
                value={formData.keywords}
                onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-topic-platform">Plataforma</Label>
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
              <div className="space-y-2">
                <Label htmlFor="edit-topic-priority">Prioridade</Label>
                <Select value={formData.priority} onValueChange={(value: any) => setFormData({ ...formData, priority: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-topic-status">Status</Label>
              <Select value={formData.isActive} onValueChange={(value: any) => setFormData({ ...formData, isActive: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Ativo</SelectItem>
                  <SelectItem value="no">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={updateTopic.isPending}>
              {updateTopic.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== HELPER FUNCTIONS ====================

function getPlatformLabel(platform: string | null) {
  const labels: Record<string, string> = {
    all: "Todas",
    instagram: "Instagram",
    facebook: "Facebook",
    tiktok: "TikTok",
    twitter: "X (Twitter)",
    reclameaqui: "Reclame Aqui",
    nestle_site: "Site Nestlé",
  };
  return labels[platform || "all"] || platform;
}

function getPriorityLabel(priority: string | null) {
  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
  };
  return labels[priority || "medium"] || priority;
}

function getPriorityVariant(priority: string | null): "default" | "secondary" | "destructive" {
  if (priority === "high") return "destructive";
  if (priority === "low") return "secondary";
  return "default";
}

