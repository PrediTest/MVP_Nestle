import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface CompanyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  company?: any;
  onSuccess: () => void;
}

export function CompanyModal({ open, onOpenChange, mode, company, onSuccess }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    industry: "",
    logo: "",
    primaryColor: "#e31e24",
    secondaryColor: "#333333",
    country: "Brasil",
    timezone: "America/Sao_Paulo",
    subscriptionTier: "trial" as const,
    maxUsers: 5,
    maxProjects: 10,
  });

  useEffect(() => {
    if (mode === "edit" && company) {
      setFormData({
        id: company.id,
        name: company.name,
        industry: company.industry,
        logo: company.logo || "",
        primaryColor: company.primaryColor || "#e31e24",
        secondaryColor: company.secondaryColor || "#333333",
        country: company.country || "Brasil",
        timezone: company.timezone || "America/Sao_Paulo",
        subscriptionTier: company.subscriptionTier || "trial",
        maxUsers: company.maxUsers || 5,
        maxProjects: company.maxProjects || 10,
      });
    } else {
      // Reset form for create mode
      setFormData({
        id: `company_${Date.now()}`,
        name: "",
        industry: "",
        logo: "",
        primaryColor: "#e31e24",
        secondaryColor: "#333333",
        country: "Brasil",
        timezone: "America/Sao_Paulo",
        subscriptionTier: "trial",
        maxUsers: 5,
        maxProjects: 10,
      });
    }
  }, [mode, company, open]);

  const createMutation = trpc.companies.admin.create.useMutation({
    onSuccess: () => {
      onSuccess();
      alert("Empresa criada com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const updateMutation = trpc.companies.admin.update.useMutation({
    onSuccess: () => {
      onSuccess();
      alert("Empresa atualizada com sucesso!");
    },
    onError: (error) => {
      alert(`Erro: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "create") {
      await createMutation.mutateAsync(formData);
    } else {
      const { id, ...data } = formData;
      await updateMutation.mutateAsync({ id, ...data });
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nova Empresa" : "Editar Empresa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Indústria *</Label>
              <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="food">Alimentos</SelectItem>
                  <SelectItem value="beverage">Bebidas</SelectItem>
                  <SelectItem value="pharma">Farmacêutica</SelectItem>
                  <SelectItem value="cosmetics">Cosméticos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo (URL)</Label>
              <Input
                id="logo"
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryColor">Cor Primária</Label>
              <div className="flex gap-2">
                <Input
                  id="primaryColor"
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.primaryColor}
                  onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                  placeholder="#e31e24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Cor Secundária</Label>
              <div className="flex gap-2">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  className="w-16 h-10"
                />
                <Input
                  value={formData.secondaryColor}
                  onChange={(e) => setFormData({ ...formData, secondaryColor: e.target.value })}
                  placeholder="#333333"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Plano</Label>
              <Select
                value={formData.subscriptionTier}
                onValueChange={(value: any) => setFormData({ ...formData, subscriptionTier: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxUsers">Max Usuários</Label>
              <Input
                id="maxUsers"
                type="number"
                min="1"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxProjects">Max Projetos</Label>
              <Input
                id="maxProjects"
                type="number"
                min="1"
                value={formData.maxProjects}
                onChange={(e) => setFormData({ ...formData, maxProjects: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Criar Empresa" : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
