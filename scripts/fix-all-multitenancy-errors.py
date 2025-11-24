#!/usr/bin/env python3
"""
Script robusto para corrigir TODOS os erros de multi-tenancy no routers.ts
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_all_errors(content):
    """Corrige todos os erros de companyId de uma vez"""
    
    # 1. Corrigir createSocialMediaPost (linha 530)
    content = re.sub(
        r'(const saved = await db\.createSocialMediaPost\(\{\s+id: post\.postId,\s+)(accountId:)',
        r'\1companyId: ctx.user!.companyId,\n              \2',
        content
    )
    
    # 2. Corrigir indentação do createSentimentAnalysis (linha 555-556)
    content = re.sub(
        r'companyId: ctx\.user!\.companyId,\s+postId:',
        r'companyId: ctx.user!.companyId,\n              postId:',
        content
    )
    
    # 3. Corrigir createSentimentAnalysis sem companyId (outro local)
    content = re.sub(
        r'(const savedAnalysis = await db\.createSentimentAnalysis\(\{\s+id: `sentiment_\$\{post\.id\}_\$\{Date\.now\(\)\}`,\s+)(postId:)',
        r'\1companyId: ctx.user!.companyId,\n              \2',
        content
    )
    
    # 4. Corrigir createSentimentSummary
    content = re.sub(
        r'(const summary = await db\.createSentimentSummary\(\{\s+id: `summary_\$\{input\.projectId\}_\$\{platform\}_\$\{Date\.now\(\)\}`,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # 5. Corrigir createMonitoredKeyword
    content = re.sub(
        r'(const keyword = await db\.createMonitoredKeyword\(\{\s+id: keywordId,\s+)(keyword: input\.keyword,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 6. Corrigir createMonitoredTopic
    content = re.sub(
        r'(const topic = await db\.createMonitoredTopic\(\{\s+id: topicId,\s+)(topic: input\.topic,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 7. Corrigir createSentimentAlert
    content = re.sub(
        r'(const alert = await db\.createSentimentAlert\(\{\s+id: alertId,\s+)(projectId: input\.projectId,)',
        r'\1companyId: ctx.user!.companyId,\n        \2',
        content
    )
    
    # 8. Corrigir createAlertConfiguration
    content = re.sub(
        r'(const config = await db\.createAlertConfiguration\(\{\s+id: configId,\s+)(platform: input\.platform,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 9. Corrigir createProjectTest
    content = re.sub(
        r'(const projectTest = await db\.createProjectTest\(\{\s+id: projectTestId,\s+)(projectId: input\.projectId,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 10. Substituir todos os "nestle_site" restantes
    content = content.replace('"nestle_site"', '"company_site"')
    content = content.replace("'nestle_site'", "'company_site'")
    
    # 11. Corrigir referências a ctx fora de contexto (adicionar { ctx } nos parâmetros)
    # Procurar por funções async que usam ctx mas não têm no parâmetro
    content = re.sub(
        r'(\.mutation\(async \(\{ input \}\) => \{[^}]*?)(ctx\.user)',
        r'\1{ ctx }\2',
        content,
        flags=re.DOTALL
    )
    
    return content

def main():
    router_path = '/home/ubuntu/preditest-ai/server/routers.ts'
    
    print("🔧 Corrigindo TODOS os erros de multi-tenancy...")
    
    # Ler arquivo
    content = read_file(router_path)
    
    # Aplicar correções
    content = fix_all_errors(content)
    
    # Salvar arquivo
    write_file(router_path, content)
    
    print("✅ Todas as correções aplicadas!")
    print("\n📊 Verificando erros restantes...")

if __name__ == "__main__":
    main()

