import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Projects() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    productType: "",
    factory: "",
  });

  const { data: projects, isLoading, refetch } = trpc.projects.listAll.useQuery();
  const createProject = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Projeto criado com sucesso!");
      setOpen(false);
      setFormData({ name: "", description: "", productType: "", factory: "" });
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao criar projeto: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({
      id: `proj_${Date.now()}`,
      ...formData,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Projetos</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie os projetos de lançamento de produtos
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo projeto de lançamento
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Nome do Projeto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Ex: Lançamento Nescau Zero Açúcar"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descreva o projeto..."
                      rows={3}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="productType">Tipo de Produto</Label>
                    <Input
                      id="productType"
                      value={formData.productType}
                      onChange={(e) => setFormData({ ...formData, productType: e.target.value })}
                      placeholder="Ex: Achocolatado em pó"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="factory">Fábrica</Label>
                    <Select
                      value={formData.factory}
                      onValueChange={(value) => setFormData({ ...formData, factory: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fábrica" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Araras - SP">Araras - SP</SelectItem>
                        <SelectItem value="São José dos Campos - SP">São José dos Campos - SP</SelectItem>
                        <SelectItem value="Caçapava - SP">Caçapava - SP</SelectItem>
                        <SelectItem value="Montes Claros - MG">Montes Claros - MG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={createProject.isPending}>
                    {createProject.isPending ? "Criando..." : "Criar Projeto"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects List */}
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">Carregando projetos...</div>
        ) : !projects || projects.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Nenhum projeto encontrado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Clique em "Novo Projeto" para começar
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      <CardDescription className="mt-2">{project.description}</CardDescription>
                    </div>
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
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span className="font-medium">{project.productType || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Fábrica:</span>
                      <span className="font-medium">{project.factory || "N/A"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Score de Risco:</span>
                      <span
                        className={`font-bold ${
                          parseInt(project.riskScore || "0") > 50
                            ? "text-red-600"
                            : parseInt(project.riskScore || "0") > 30
                            ? "text-yellow-600"
                            : "text-green-600"
                        }`}
                      >
                        {project.riskScore || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Prob. Sucesso:</span>
                      <span className="font-bold text-green-600">
                        {project.successProbability || "N/A"}%
                      </span>
                    </div>
                    <div className="pt-3 border-t border-border">
                      <Button variant="outline" className="w-full" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

