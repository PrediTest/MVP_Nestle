import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface Company {
  id: string;
  name: string;
  industry: string;
  logo: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
  timezone: string | null;
  isActive: boolean | null;
  subscriptionTier: "trial" | "basic" | "professional" | "enterprise" | null;
  maxUsers: number | null;
  maxProjects: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

interface CompanyContextType {
  company: Company | null;
  isLoading: boolean;
  error: Error | null;
  setCompanyId: (companyId: string) => void;
  refreshCompany: () => void;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

const STORAGE_KEY = "preditest_company_id";

export function CompanyProvider({ children }: { children: ReactNode }) {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(() => {
    // Tentar recuperar do localStorage
    return localStorage.getItem(STORAGE_KEY);
  });

  // Buscar empresa atual do usuário
  const { data: userCompany, isLoading: isLoadingUser, error: errorUser, refetch: refetchUser } = 
    trpc.companies.getCurrent.useQuery(undefined, {
      enabled: !selectedCompanyId, // Só busca se não houver seleção manual
    });

  // Buscar empresa selecionada manualmente
  const { data: selectedCompany, isLoading: isLoadingSelected, error: errorSelected, refetch: refetchSelected } = 
    trpc.companies.getById.useQuery(
      { id: selectedCompanyId! },
      { enabled: !!selectedCompanyId }
    );

  const company = selectedCompany || userCompany || null;
  const isLoading = isLoadingUser || isLoadingSelected;
  const error = errorUser || errorSelected;

  // Aplicar cores da empresa no CSS
  useEffect(() => {
    if (company?.primaryColor) {
      document.documentElement.style.setProperty("--company-primary", company.primaryColor);
    }
    if (company?.secondaryColor) {
      document.documentElement.style.setProperty("--company-secondary", company.secondaryColor);
    }
    
    // Atualizar título da página
    if (company?.name) {
      document.title = `${company.name} - PrediTest AI`;
    }
  }, [company]);

  const setCompanyId = (companyId: string) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem(STORAGE_KEY, companyId);
  };

  const refreshCompany = () => {
    if (selectedCompanyId) {
      refetchSelected();
    } else {
      refetchUser();
    }
  };

  return (
    <CompanyContext.Provider
      value={{
        company,
        isLoading,
        error: error as Error | null,
        setCompanyId,
        refreshCompany,
      }}
    >
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}

