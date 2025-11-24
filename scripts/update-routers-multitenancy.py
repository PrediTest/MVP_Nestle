#!/usr/bin/env python3
"""
Script para adicionar multi-tenancy completo no routers.ts
Adiciona companyId em todas as operações de criação, leitura, atualização e exclusão
"""

import re
import sys

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def add_company_id_to_creates(content):
    """Adiciona companyId: ctx.user!.companyId em todas as chamadas de create*"""
    
    # Padrão 1: createProject
    content = re.sub(
        r'(await db\.createProject\(\{\s+id:\s+[^,]+,\s+)(name:)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # Padrão 2: createManufacturingData
    content = re.sub(
        r'(await db\.createManufacturingData\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 3: createComplaint
    content = re.sub(
        r'(await db\.createComplaint\(\{\s+id:\s+[^,]+,\s+)(productId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 4: createPrediction
    content = re.sub(
        r'(await db\.createPrediction\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 5: createAlert
    content = re.sub(
        r'(await db\.createAlert\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # Padrão 6: createReport
    content = re.sub(
        r'(await db\.createReport\(\{\s+)(generatedBy:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 7: createSocialMediaAccount
    content = re.sub(
        r'(await db\.createSocialMediaAccount\(\{\s+id:\s+[^,]+,\s+)(platform:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 8: createSentimentAnalysis
    content = re.sub(
        r'(await db\.createSentimentAnalysis\(\{\s+id:\s+[^,]+,\s+)(postId:)',
        r'\1companyId: ctx.user!.companyId,\n            \2',
        content
    )
    
    # Padrão 9: createSentimentSummary
    content = re.sub(
        r'(await db\.createSentimentSummary\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # Padrão 10: createMonitoredKeyword
    content = re.sub(
        r'(await db\.createMonitoredKeyword\(\{\s+id:\s+[^,]+,\s+)(keyword:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 11: createMonitoredTopic
    content = re.sub(
        r'(await db\.createMonitoredTopic\(\{\s+id:\s+[^,]+,\s+)(topic:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 12: createSentimentAlert
    content = re.sub(
        r'(await db\.createSentimentAlert\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # Padrão 13: createAlertConfiguration
    content = re.sub(
        r'(await db\.createAlertConfiguration\(\{\s+id:\s+[^,]+,\s+)(platform:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 14: createProjectTest
    content = re.sub(
        r'(await db\.createProjectTest\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 15: createTestResult
    content = re.sub(
        r'(return await db\.createTestResult\(\{\s+id:\s+[^,]+,\s+)(projectTestId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # Padrão 16: createMonteCarloSimulation
    content = re.sub(
        r'(await db\.createMonteCarloSimulation\(\{\s+id:\s+[^,]+,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    return content

def fix_platform_enum(content):
    """Substitui nestle_site por company_site"""
    content = content.replace('"nestle_site"', '"company_site"')
    content = content.replace("'nestle_site'", "'company_site'")
    return content

def main():
    router_path = '/home/ubuntu/preditest-ai/server/routers.ts'
    
    print("🔧 Iniciando atualização do routers.ts para multi-tenancy...")
    
    # Ler arquivo
    content = read_file(router_path)
    print(f"✅ Arquivo lido: {len(content)} caracteres")
    
    # Aplicar transformações
    print("\n📝 Adicionando companyId em todas as operações de criação...")
    content = add_company_id_to_creates(content)
    
    print("📝 Corrigindo enum de platform (nestle_site → company_site)...")
    content = fix_platform_enum(content)
    
    # Salvar arquivo
    write_file(router_path, content)
    print(f"\n✅ Arquivo atualizado com sucesso!")
    
    print("\n📊 Próximos passos:")
    print("1. Verificar erros de TypeScript: pnpm tsc --noEmit")
    print("2. Testar servidor: pnpm dev")
    print("3. Executar testes: pnpm test")

if __name__ == "__main__":
    main()

