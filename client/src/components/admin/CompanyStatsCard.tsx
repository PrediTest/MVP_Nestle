import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Loader2 } from "lucide-react";

interface CompanyStatsCardProps {
  companyId: string;
}

export function CompanyStatsCard({ companyId }: CompanyStatsCardProps) {
  const { data, isLoading } = trpc.companies.admin.getStats.useQuery({ companyId });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <TrendingUp className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Estatísticas - {data?.company.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Projetos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.projectsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Usuários</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.usersCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Predições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.predictionsCount}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Alertas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{data?.stats.alertsCount}</div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
