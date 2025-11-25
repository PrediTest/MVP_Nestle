# TestPredictorService - Microserviço de Predição ML

Microserviço FastAPI para predição de resultados de testes industriais usando XGBoost/Random Forest + Monte Carlo + SHAP.

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              PrediTest AI (Node.js + tRPC)                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  predictions router                                   │  │
│  │  POST /api/trpc/predictions.predictWithML            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          │ HTTP POST
                          ▼
┌─────────────────────────────────────────────────────────────┐
│        TestPredictorService (Python FastAPI)                │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  POST /predict                                        │  │
│  │  • XGBoost/Random Forest models                      │  │
│  │  • Monte Carlo 10k iterations                        │  │
│  │  • SHAP explanations                                 │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Produtos Suportados

1. **Nescau Zero Açúcar**
   - Solubilidade em leite frio (segundos)
   - Viscosidade (cP)
   - Shelf-life (dias)
   - Perda de ferro (%)

2. **Ninho Phases 4 Reformulado**
   - Reconstituição (segundos)
   - Viscosidade (cP)
   - Shelf-life (dias)
   - Scorched particles (mg/kg)

3. **Kit Kat Vegano**
   - Textura do wafer (g força)
   - Derretimento (°C)
   - Shelf-life (dias)
   - Bloom de gordura (score 0-10)

## Instalação Local

```bash
cd services/test-predictor

# Criar ambiente virtual
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Executar serviço
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

## Docker

```bash
# Build
docker build -t test-predictor:latest .

# Run
docker run -d -p 8001:8001 --name test-predictor test-predictor:latest

# Health check
curl http://localhost:8001/health
```

## API Endpoints

### POST /predict

**Request:**
```json
{
  "project_id": "proj_nestle_001",
  "product_name": "Nescau Zero Açúcar",
  "formula": [
    {"name": "Cacau em pó", "percentage": 35.0, "supplier": "Barry Callebaut"},
    {"name": "Açúcar", "percentage": 45.0},
    {"name": "Lecitina de soja", "percentage": 0.5},
    {"name": "Maltodextrina", "percentage": 15.0},
    {"name": "Sal", "percentage": 0.3}
  ],
  "process_parameters": {
    "temperature": 75.0,
    "mixing_time": 12.0,
    "line_speed": 95.0,
    "pressure": 2.5,
    "humidity": 45.0,
    "ph": 6.8
  },
  "factory": "Araraquara - SP",
  "monte_carlo_iterations": 10000
}
```

**Response:**
```json
{
  "project_id": "proj_nestle_001",
  "product_name": "Nescau Zero Açúcar",
  "overall_risk_score": 15.3,
  "test_predictions": [
    {
      "test_name": "Solubilidade",
      "predicted_value": 26.4,
      "unit": "segundos",
      "spec_limit": 30.0,
      "status": "PASS",
      "confidence_interval": [24.1, 28.9],
      "probability_of_fail": 0.07,
      "importance_score": 0.85
    },
    ...
  ],
  "recommendations": [
    "✅ Parâmetros dentro das especificações - prosseguir com piloto",
    "Manter temperatura em 75°C para estabilidade ótima"
  ],
  "shap_explanation": {
    "feature_importance": {
      "lecitina_percentage": 0.35,
      "mixing_time": 0.25,
      "temperature": 0.20
    },
    "top_positive_factors": ["Lecitina Percentage (+35.0%)", ...],
    "top_negative_factors": ["Line Speed (-5.0%)", ...],
    "base_value": 50.0
  },
  "model_version": "1.0.0-xgboost",
  "prediction_timestamp": "2025-11-24T20:15:30Z",
  "monte_carlo_iterations": 10000
}
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "models_loaded": true
}
```

## Integração com Backend Node.js

Adicionar no `server/routers.ts`:

```typescript
import axios from 'axios';

predictions: router({
  predictWithML: protectedProcedure
    .input(z.object({
      projectId: z.string(),
      productName: z.string(),
      formula: z.array(z.object({
        name: z.string(),
        percentage: z.number(),
        supplier: z.string().optional()
      })),
      processParameters: z.object({
        temperature: z.number(),
        mixingTime: z.number(),
        lineSpeed: z.number(),
        pressure: z.number().optional(),
        humidity: z.number().optional(),
        ph: z.number().optional()
      }),
      factory: z.string(),
      monteCarloIterations: z.number().default(10000)
    }))
    .mutation(async ({ input, ctx }) => {
      const companyId = ctx.user!.companyId ?? "default_company";
      
      // Call Python microservice
      const response = await axios.post('http://localhost:8001/predict', {
        project_id: input.projectId,
        product_name: input.productName,
        formula: input.formula,
        process_parameters: {
          temperature: input.processParameters.temperature,
          mixing_time: input.processParameters.mixingTime,
          line_speed: input.processParameters.lineSpeed,
          pressure: input.processParameters.pressure,
          humidity: input.processParameters.humidity,
          ph: input.processParameters.ph
        },
        factory: input.factory,
        monte_carlo_iterations: input.monteCarloIterations
      });
      
      const prediction = response.data;
      
      // Save to database
      const db = await import("./db");
      await db.createPrediction({
        id: `pred_${Date.now()}`,
        companyId,
        projectId: input.projectId,
        predictionData: JSON.stringify(prediction),
        riskScore: prediction.overall_risk_score.toString(),
        confidence: (100 - prediction.overall_risk_score).toString(),
        createdAt: new Date()
      });
      
      return prediction;
    })
})
```

## Testes

```bash
# Executar testes unitários
pytest tests/ -v

# Teste de integração
curl -X POST http://localhost:8001/predict \
  -H "Content-Type: application/json" \
  -d @tests/fixtures/nescau_request.json
```

## Deployment em Produção

### Docker Compose

Adicionar ao `docker-compose.yml` do projeto principal:

```yaml
services:
  test-predictor:
    build: ./services/test-predictor
    ports:
      - "8001:8001"
    environment:
      - LOG_LEVEL=info
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-predictor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: test-predictor
  template:
    metadata:
      labels:
        app: test-predictor
    spec:
      containers:
      - name: test-predictor
        image: test-predictor:latest
        ports:
        - containerPort: 8001
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8001
          initialDelaySeconds: 10
          periodSeconds: 30
---
apiVersion: v1
kind: Service
metadata:
  name: test-predictor-service
spec:
  selector:
    app: test-predictor
  ports:
  - protocol: TCP
    port: 8001
    targetPort: 8001
  type: ClusterIP
```

## Performance

- **Latência média:** < 2 segundos para 10k iterações Monte Carlo
- **Throughput:** ~50 predições/minuto por instância
- **Memória:** ~512 MB por instância
- **CPU:** 0.5-1 core por instância

## Próximos Passos

1. **Treinar modelos reais** com dados históricos Nestlé (substituir mocks)
2. **Adicionar mais produtos** (Molico, Neston, Garoto, etc.)
3. **Implementar cache** (Redis) para predições recentes
4. **Adicionar métricas** (Prometheus) para monitoramento
5. **Implementar versionamento** de modelos (MLflow)
6. **Adicionar testes A/B** para comparar modelos

## Suporte

Para dúvidas ou problemas, contate a equipe de ML/AI do PrediTest AI.

