#!/usr/bin/env python3
"""
Script para adicionar companyId em todas as chamadas de criação no routers.ts
"""

import re

# Ler o arquivo
with open('/home/ubuntu/preditest-ai/server/routers.ts', 'r') as f:
    lines = f.readlines()

# Encontrar e corrigir linha 1135 (createTestResult)
for i, line in enumerate(lines):
    if i >= 1134 and i <= 1142 and 'return await db.createTestResult({' in line:
        # Adicionar companyId após o id
        for j in range(i, min(i+10, len(lines))):
            if 'projectTestId:' in lines[j]:
                # Inserir companyId antes de projectTestId
                indent = len(lines[j]) - len(lines[j].lstrip())
                lines.insert(j, ' ' * indent + "companyId: ctx.user!.companyId,\n")
                print(f"✅ Adicionado companyId em createTestResult (linha {j+1})")
                break
        break

# Encontrar e corrigir linha 1201 (createMonteCarloSimulation)
for i, line in enumerate(lines):
    if i >= 1200 and i <= 1215 and 'await db.createMonteCarloSimulation({' in line:
        # Adicionar companyId após o id
        for j in range(i, min(i+15, len(lines))):
            if 'projectId:' in lines[j]:
                # Inserir companyId antes de projectId
                indent = len(lines[j]) - len(lines[j].lstrip())
                lines.insert(j, ' ' * indent + "companyId: ctx.user!.companyId,\n")
                print(f"✅ Adicionado companyId em createMonteCarloSimulation (linha {j+1})")
                break
        break

# Salvar o arquivo
with open('/home/ubuntu/preditest-ai/server/routers.ts', 'w') as f:
    f.writelines(lines)

print("✅ Arquivo routers.ts corrigido!")

