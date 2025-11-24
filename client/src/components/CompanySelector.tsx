import { useCompany } from "@/contexts/CompanyContext";
import { trpc } from "@/lib/trpc";
import { Building2, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function CompanySelector() {
  const { company, setCompanyId } = useCompany();
  const { data: companies, isLoading } = trpc.companies.listAll.useQuery();

  if (isLoading || !companies || companies.length <= 1) {
    return null; // Não mostrar seletor se houver apenas 1 empresa
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 min-w-[200px] justify-start"
        >
          <Building2 className="h-4 w-4" />
          <span className="truncate">{company?.name || "Selecione uma empresa"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Trocar de Empresa</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {companies.map((c) => (
          <DropdownMenuItem
            key={c.id}
            onClick={() => {
              setCompanyId(c.id);
              // Recarregar a página para atualizar todos os dados
              window.location.reload();
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {c.logo && (
                <img
                  src={c.logo}
                  alt={c.name}
                  className="h-5 w-5 rounded object-cover"
                />
              )}
              <div className="flex flex-col">
                <span className="font-medium">{c.name}</span>
                <span className="text-xs text-muted-foreground">{c.industry}</span>
              </div>
            </div>
            {company?.id === c.id && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

