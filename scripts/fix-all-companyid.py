#!/usr/bin/env python3
"""
Script para adicionar companyId em TODAS as chamadas de criação no routers.ts
"""

import re

# Ler o arquivo
with open('/home/ubuntu/preditest-ai/server/routers.ts', 'r') as f:
    content = f.read()

# Padrão para encontrar chamadas de criação sem companyId
# Procura por db.create* seguido de { e depois id: mas sem companyId:
patterns_to_fix = [
    # createPrediction
    (r'(await db\.createPrediction\(\{\s+id:\s+[^,]+,\s+)(projectId:)', r'\1companyId: ctx.user!.companyId,\n          \2'),
    # createAlert
    (r'(await db\.createAlert\(\{\s+id:\s+[^,]+,\s+)(projectId:)', r'\1companyId: ctx.user!.companyId,\n        \2'),
    # createReport
    (r'(await db\.createReport\(\{\s+)(generatedBy:)', r'\1companyId: ctx.user!.companyId,\n          \2'),
    # createSocialMediaAccount
    (r'(await db\.createSocialMediaAccount\(\{\s+id:\s+[^,]+,\s+)(platform:)', r'\1companyId: ctx.user!.companyId,\n          \2'),
    # createSentimentAnalysis
    (r'(await db\.createSentimentAnalysis\(\{\s+id:\s+[^,]+,\s+)(postId:)', r'\1companyId: ctx.user!.companyId,\n            \2'),
]

fixed_count = 0
for pattern, replacement in patterns_to_fix:
    matches = len(re.findall(pattern, content))
    if matches > 0:
        content = re.sub(pattern, replacement, content)
        fixed_count += matches
        print(f"✅ Corrigido {matches} ocorrência(s) do padrão")

# Substituir nestle_site por company_site
content = content.replace('"nestle_site"', '"company_site"')
content = content.replace("'nestle_site'", "'company_site'")
print("✅ Substituído nestle_site por company_site")

# Salvar o arquivo
with open('/home/ubuntu/preditest-ai/server/routers.ts', 'w') as f:
    f.write(content)

print(f"✅ Total de correções: {fixed_count}")
print("✅ Arquivo routers.ts atualizado!")

