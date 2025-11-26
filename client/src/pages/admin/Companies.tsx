import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { CompanyModal } from "@/components/admin/CompanyModal";
import { CompanyStatsCard } from "@/components/admin/CompanyStatsCard";

export default function CompaniesAdmin() {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");

  const { data: companies, isLoading, refetch } = trpc.companies.admin.listAll.useQuery();
  const deleteMutation = trpc.companies.admin.delete.useMutation({
    onSuccess: () => {
      refetch();
      alert("Empresa desativada com sucesso!");
    },
  });

  const handleCreate = () => {
    setModalMode("create");
    setSelectedCompany(null);
    setModalOpen(true);
  };

  const handleEdit = (company: any) => {
    setModalMode("edit");
    setSelectedCompany(company);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja desativar esta empresa?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  if (isLoading) return <div className="container mx-auto py-8">Carregando...</div>;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Empresas</h1>
          <p className="text-muted-foreground mt-2">
            Administre empresas, quotas e estatísticas
          </p>
        </div>
        <Button onClick={handleCreate} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Nova Empresa
        </Button>
      </div>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies?.map((company) => (
          <Card key={company.id} className={!company.isActive ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-12 w-12 object-contain" />
                  ) : (
                    <Building2 className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{company.name}</CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                  </div>
                </div>
                <Badge variant={company.isActive ? "default" : "secondary"}>
                  {company.isActive ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cores */}
              <div className="flex gap-2">
                {company.primaryColor && (
                  <div
                    className="h-8 w-8 rounded border"
                    style={{ backgroundColor: company.primaryColor }}
                    title={`Primária: ${company.primaryColor}`}
                  />
                )}
                {company.secondaryColor && (
                  <div
                    className="h-8 w-8 rounded border"
                    style={{ backgroundColor: company.secondaryColor }}
                    title={`Secundária: ${company.secondaryColor}`}
                  />
                )}
              </div>

              {/* Quotas */}
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plano:</span>
                  <Badge variant="outline">{company.subscriptionTier}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Usuários:</span>
                  <span>{company.maxUsers}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Max Projetos:</span>
                  <span>{company.maxProjects}</span>
                </div>
              </div>

              {/* Ações */}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(company)} className="flex-1">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(company.id)}
                  disabled={!company.isActive}
                  className="flex-1"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Desativar
                </Button>
                <CompanyStatsCard companyId={company.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal de Criar/Editar */}
      <CompanyModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        mode={modalMode}
        company={selectedCompany}
        onSuccess={() => {
          refetch();
          setModalOpen(false);
        }}
      />
    </div>
  );
}
