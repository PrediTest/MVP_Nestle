#!/bin/bash

# Script de Deployment Automático - AWS EKS
# Uso: ./deploy-aws.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-prod}
AWS_REGION="us-east-1"
AWS_ACCOUNT_ID="123456789"
ECR_REPO="preditest-ai"
CLUSTER_NAME="preditest-ai"
NAMESPACE="preditest-ai"

echo "🚀 Iniciando deployment para $ENVIRONMENT..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

# 1. Build Docker
log "📦 Building Docker image..."
docker build -t $ECR_REPO:latest .
docker tag $ECR_REPO:latest $ECR_REPO:$(date +%Y%m%d-%H%M%S)

# 2. Push para ECR
log "📤 Pushing to ECR..."
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

docker tag $ECR_REPO:latest $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO:latest

# 3. Configurar kubectl
log "🔧 Configuring kubectl..."
aws eks update-kubeconfig --region $AWS_REGION --name $CLUSTER_NAME

# 4. Verificar cluster
log "✅ Verifying cluster..."
kubectl cluster-info || error "Cluster não acessível"

# 5. Criar namespace se não existir
log "📁 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 6. Criar/atualizar secrets
log "🔐 Updating secrets..."
kubectl create secret generic preditest-ai-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=VITE_APP_ID="$VITE_APP_ID" \
  --from-literal=OAUTH_SERVER_URL="$OAUTH_SERVER_URL" \
  --from-literal=BUILT_IN_FORGE_API_KEY="$BUILT_IN_FORGE_API_KEY" \
  --dry-run=client -o yaml | kubectl apply -f - -n $NAMESPACE

# 7. Aplicar manifests Kubernetes
log "🚀 Deploying to Kubernetes..."
kubectl apply -f k8s/deployment.yaml -n $NAMESPACE
kubectl apply -f k8s/service.yaml -n $NAMESPACE
kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE

# 8. Aguardar rollout
log "⏳ Waiting for rollout..."
kubectl rollout status deployment/preditest-ai -n $NAMESPACE --timeout=5m

# 9. Verificar pods
log "🔍 Checking pods..."
kubectl get pods -n $NAMESPACE

# 10. Obter URL
log "📍 Getting service URL..."
SERVICE_URL=$(kubectl get service preditest-ai -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
log "✨ Application deployed at: $SERVICE_URL"

# 11. Executar health check
log "❤️ Running health check..."
sleep 10
if curl -f http://$SERVICE_URL/health > /dev/null 2>&1; then
    log "✅ Health check passed!"
else
    warning "Health check failed, but deployment completed"
fi

log "🎉 Deployment completed successfully!"

