import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Trash2, Loader2, FlaskConical } from "lucide-react";
import { toast } from "sonner";

interface TestManagementSectionProps {
  projectId: string;
}

export default function TestManagementSection({ projectId }: TestManagementSectionProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const utils = trpc.useUtils();

  // Query para listar testes do projeto
  const { data: projectTests, isLoading: loadingProjectTests } = trpc.tests.listByProject.useQuery({
    projectId,
  });

  // Query para listar todos os testes disponíveis
  const { data: availableTests, isLoading: loadingAvailableTests } = trpc.tests.listAvailable.useQuery();

  // Mutation para adicionar teste ao projeto
  const addTestMutation = trpc.tests.addToProject.useMutation({
    onSuccess: () => {
      toast.success("Teste adicionado ao projeto com sucesso!");
      utils.tests.listByProject.invalidate({ projectId });
      setAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Erro ao adicionar teste: ${error.message}`);
    },
  });

  // Mutation para remover teste do projeto
  const removeTestMutation = trpc.tests.removeFromProject.useMutation({
    onSuccess: () => {
      toast.success("Teste removido do projeto com sucesso!");
      utils.tests.listByProject.invalidate({ projectId });
    },
    onError: (error) => {
      toast.error(`Erro ao remover teste: ${error.message}`);
    },
  });

  const handleAddTest = (testId: string) => {
    addTestMutation.mutate({ projectId, testId });
  };

  const handleRemoveTest = (projectTestId: string, testName: string) => {
    if (window.confirm(`Tem certeza que deseja remover o teste "${testName}" deste projeto?`)) {
      removeTestMutation.mutate({ id: projectTestId });
    }
  };

  // Filtrar testes disponíveis que ainda não estão no projeto
  const testsNotInProject = availableTests?.filter(
    (test: any) => !projectTests?.some((pt: any) => pt.projectTest.testId === test.id)
  ) || [];

  return (
    <div className="space-y-4">
      {/* Lista de testes do projeto */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-semibold text-sm">Testes Associados</h4>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Teste
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Adicionar Teste ao Projeto</DialogTitle>
                <DialogDescription>
                  Selecione um teste do catálogo para adicionar a este projeto
                </DialogDescription>
              </DialogHeader>

              {loadingAvailableTests ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : testsNotInProject.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Todos os testes disponíveis já estão associados a este projeto
                </p>
              ) : (
                <div className="space-y-3">
                  {testsNotInProject.map((test: any) => (
                    <div
                      key={test.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <FlaskConical className="h-4 w-4 text-blue-500" />
                            <h5 className="font-semibold">{test.name}</h5>
                            <Badge variant="outline">{test.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {test.description}
                          </p>
                          {test.unit && (
                            <p className="text-xs text-muted-foreground">
                              Unidade: {test.unit}
                            </p>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleAddTest(test.id)}
                          disabled={addTestMutation.isPending}
                        >
                          {addTestMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {loadingProjectTests ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : projectTests && projectTests.length > 0 ? (
          <div className="space-y-2">
            {projectTests.map((test) => (
              <div
                key={test.projectTest.id}
                className="border rounded-lg p-3 flex items-center justify-between hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FlaskConical className="h-4 w-4 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{test.test?.name || 'Teste'}</span>
                      <Badge variant="secondary" className="text-xs">
                        {test.test?.category || 'N/A'}
                      </Badge>
                    </div>
                    {test.test?.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {test.test.description}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleRemoveTest(test.projectTest.id, test.test?.name || 'Teste')}
                  disabled={removeTestMutation.isPending}
                >
                  {removeTestMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8 text-sm">
            Nenhum teste associado a este projeto. Clique em "Adicionar Teste" para começar.
          </p>
        )}
      </div>
    </div>
  );
}

