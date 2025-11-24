#!/usr/bin/env python3
"""
Script final para corrigir TODOS os erros restantes de multi-tenancy
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_remaining_errors(content):
    """Corrige todos os erros restantes"""
    
    # 1. createComplaint (linha 159)
    content = re.sub(
        r'(\.mutation\(async \(\{ input, ctx \}\) => \{\s+const db = await import\("\.\/db"\);\s+return db\.createComplaint\()(input\);)',
        r'\1{\n          ...input,\n          companyId: ctx.user!.companyId,\n        });',
        content
    )
    
    # 2. createStandard (linha 130)
    content = re.sub(
        r'(\.mutation\(async \(\{ input, ctx \}\) => \{\s+const db = await import\("\.\/db"\);\s+return db\.createStandard\()(input\);)',
        r'\1{\n          ...input,\n          companyId: ctx.user!.companyId,\n        });',
        content
    )
    
    # 3. createManufacturingData (linha 99)
    content = re.sub(
        r'(\.mutation\(async \(\{ input, ctx \}\) => \{\s+const db = await import\("\.\/db"\);\s+return db\.createManufacturingData\()(input\);)',
        r'\1{\n          ...input,\n          companyId: ctx.user!.companyId,\n        });',
        content
    )
    
    # 4. createProject (linha 49) - já tem companyId mas vamos garantir
    content = re.sub(
        r'(return db\.createProject\(\{\s+id: projectId,\s+)(name: input\.name,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 5. createSentimentAlert dentro de loop (linha 903)
    content = re.sub(
        r'(const alert = await db\.createSentimentAlert\(\{\s+id: `alert_\$\{Date\.now\(\)\}_\$\{Math\.random\(\)\.toString\(36\)\.substr\(2, 9\)\}`,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n            \2',
        content
    )
    
    # 6. createSentimentSummary (linha 612)
    content = re.sub(
        r'(await db\.createSentimentSummary\(\{\s+id: `summary_\$\{input\.projectId\}_\$\{platform\}_\$\{Date\.now\(\)\}`,\s+)(projectId:)',
        r'\1companyId: ctx.user!.companyId,\n              \2',
        content
    )
    
    # 7. createAvailableTest (linha 1035)
    content = re.sub(
        r'(return await db\.createAvailableTest\(\{\s+id,\s+)(name: input\.name,)',
        r'\1companyId: ctx.user!.companyId,\n          \2',
        content
    )
    
    # 8. Substituir TODOS os "nestle_site" por "company_site"
    content = content.replace('"nestle_site"', '"company_site"')
    content = content.replace("'nestle_site'", "'company_site'")
    
    return content

def main():
    router_path = '/home/ubuntu/preditest-ai/server/routers.ts'
    
    print("🔧 Aplicando correções finais...")
    
    # Ler arquivo
    content = read_file(router_path)
    
    # Aplicar correções
    content = fix_remaining_errors(content)
    
    # Salvar arquivo
    write_file(router_path, content)
    
    print("✅ Todas as correções finais aplicadas!")

if __name__ == "__main__":
    main()

