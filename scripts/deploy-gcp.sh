#!/bin/bash

# Script de Deployment Automático - Google Cloud GKE
# Uso: ./deploy-gcp.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-prod}
GCP_PROJECT="preditest-ai-prod"
GCP_REGION="us-central1"
GKE_CLUSTER="preditest-ai"
NAMESPACE="preditest-ai"
IMAGE_NAME="preditest-ai"

echo "🚀 Iniciando deployment para $ENVIRONMENT no Google Cloud..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERRO]${NC} $1"
    exit 1
}

# 1. Configurar projeto GCP
log "🔧 Configuring GCP project..."
gcloud config set project $GCP_PROJECT

# 2. Build Docker
log "📦 Building Docker image..."
docker build -t $IMAGE_NAME:latest .

# 3. Tag e push para Google Container Registry
log "📤 Pushing to Google Container Registry..."
docker tag $IMAGE_NAME:latest gcr.io/$GCP_PROJECT/$IMAGE_NAME:latest
docker tag $IMAGE_NAME:latest gcr.io/$GCP_PROJECT/$IMAGE_NAME:$(date +%Y%m%d-%H%M%S)

gcloud auth configure-docker
docker push gcr.io/$GCP_PROJECT/$IMAGE_NAME:latest

# 4. Configurar kubectl
log "🔧 Configuring kubectl..."
gcloud container clusters get-credentials $GKE_CLUSTER --region $GCP_REGION

# 5. Verificar cluster
log "✅ Verifying cluster..."
kubectl cluster-info || error "Cluster não acessível"

# 6. Criar namespace
log "📁 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

# 7. Criar secrets
log "🔐 Creating secrets..."
kubectl create secret generic preditest-ai-secrets \
  --from-literal=DATABASE_URL="$DATABASE_URL" \
  --from-literal=JWT_SECRET="$JWT_SECRET" \
  --from-literal=VITE_APP_ID="$VITE_APP_ID" \
  --from-literal=OAUTH_SERVER_URL="$OAUTH_SERVER_URL" \
  --from-literal=BUILT_IN_FORGE_API_KEY="$BUILT_IN_FORGE_API_KEY" \
  --dry-run=client -o yaml | kubectl apply -f - -n $NAMESPACE

# 8. Atualizar deployment com nova imagem
log "🚀 Deploying to GKE..."
kubectl set image deployment/preditest-ai \
  preditest-ai=gcr.io/$GCP_PROJECT/$IMAGE_NAME:latest \
  -n $NAMESPACE || \
  kubectl apply -f k8s/deployment.yaml -n $NAMESPACE

# 9. Aplicar outros manifests
kubectl apply -f k8s/service.yaml -n $NAMESPACE
kubectl apply -f k8s/ingress.yaml -n $NAMESPACE
kubectl apply -f k8s/hpa.yaml -n $NAMESPACE

# 10. Aguardar rollout
log "⏳ Waiting for rollout..."
kubectl rollout status deployment/preditest-ai -n $NAMESPACE --timeout=5m

# 11. Verificar pods
log "🔍 Checking pods..."
kubectl get pods -n $NAMESPACE

# 12. Obter IP externo
log "📍 Getting service IP..."
SERVICE_IP=$(kubectl get service preditest-ai -n $NAMESPACE -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
log "✨ Application deployed at: $SERVICE_IP"

log "🎉 Deployment completed successfully!"

