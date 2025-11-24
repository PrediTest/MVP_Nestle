#!/usr/bin/env python3
"""
Script para adicionar fallback em todos os ctx.user!.companyId
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def fix_companyid_null(content):
    """Adiciona fallback para companyId null"""
    
    # Substituir ctx.user!.companyId por ctx.user!.companyId || "default"
    # Mas apenas quando usado como valor, não em declarações
    content = re.sub(
        r'companyId: ctx\.user!\.companyId,',
        r'companyId: ctx.user!.companyId || "default_company",',
        content
    )
    
    return content

def main():
    router_path = '/home/ubuntu/preditest-ai/server/routers.ts'
    
    print("🔧 Adicionando fallback para companyId null...")
    
    # Ler arquivo
    content = read_file(router_path)
    
    # Contar quantas ocorrências serão alteradas
    count = len(re.findall(r'companyId: ctx\.user!\.companyId,', content))
    print(f"📊 Encontradas {count} ocorrências")
    
    # Aplicar transformação
    content = fix_companyid_null(content)
    
    # Salvar arquivo
    write_file(router_path, content)
    
    print(f"✅ {count} ocorrências atualizadas com fallback!")

if __name__ == "__main__":
    main()

