#!/usr/bin/env python3
import os
import mysql.connector
from mysql.connector import Error

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    print("❌ DATABASE_URL não configurada!")
    exit(1)

# Parse DATABASE_URL (formato: mysql://user:pass@host:port/dbname)
import re
match = re.match(r'mysql://([^:]+):([^@]+)@([^:]+):(\d+)/(.+)', DATABASE_URL)
if not match:
    print("❌ Formato de DATABASE_URL inválido!")
    exit(1)

user, password, host, port, database = match.groups()

tables = [
    "manufacturingData",
    "standards",
    "complaints",
    "predictions",
    "alerts",
    "reports",
    "socialMediaAccounts",
    "socialMediaPosts",
    "sentimentAnalysis",
    "sentimentSummary",
    "monitoredKeywords",
    "monitoredTopics",
    "sentimentAlerts",
    "alertConfigurations",
    "availableTests",
    "projectTests",
    "testResults",
    "monteCarloSimulations"
]

try:
    conn = mysql.connector.connect(
        host=host,
        port=int(port),
        user=user,
        password=password,
        database=database
    )
    cursor = conn.cursor()
    
    print("🔧 Iniciando migração de companyId...\n")
    
    success_count = 0
    skip_count = 0
    
    for table in tables:
        try:
            sql = f"ALTER TABLE {table} ADD COLUMN companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil'"
            cursor.execute(sql)
            conn.commit()
            print(f"✅ {table}: companyId adicionado")
            success_count += 1
        except Error as e:
            if e.errno == 1060:  # Duplicate column name
                print(f"⏭️  {table}: companyId já existe")
                skip_count += 1
            else:
                print(f"❌ {table}: {e}")
    
    print(f"\n📊 Resumo:")
    print(f"  ✅ {success_count} colunas adicionadas")
    print(f"  ⏭️  {skip_count} colunas já existiam")
    print(f"  📋 {len(tables)} tabelas processadas")
    
    cursor.close()
    conn.close()
    print("\n✅ Migração concluída!")
    
except Error as e:
    print(f"❌ Erro de conexão: {e}")
    exit(1)
