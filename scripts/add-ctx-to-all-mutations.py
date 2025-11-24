#!/usr/bin/env python3
"""
Script para adicionar ctx em TODAS as mutations que não o têm
"""

import re

def read_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write_file(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def add_ctx_to_mutations(content):
    """Adiciona ctx em todas as mutations que só têm { input }"""
    
    # Substituir .mutation(async ({ input }) => por .mutation(async ({ input, ctx }) =>
    content = re.sub(
        r'\.mutation\(async \(\{ input \}\) =>',
        r'.mutation(async ({ input, ctx }) =>',
        content
    )
    
    return content

def main():
    router_path = '/home/ubuntu/preditest-ai/server/routers.ts'
    
    print("🔧 Adicionando ctx em todas as mutations...")
    
    # Ler arquivo
    content = read_file(router_path)
    
    # Contar quantas mutations serão alteradas
    count = len(re.findall(r'\.mutation\(async \(\{ input \}\) =>', content))
    print(f"📊 Encontradas {count} mutations sem ctx")
    
    # Aplicar transformação
    content = add_ctx_to_mutations(content)
    
    # Salvar arquivo
    write_file(router_path, content)
    
    print(f"✅ {count} mutations atualizadas com ctx!")

if __name__ == "__main__":
    main()

