-- ============================================================================
-- SEED MULTI-TENANT - Popula banco de dados com 3 empresas
-- ============================================================================

-- 1. CRIAR EMPRESAS
INSERT INTO companies (id, name, industry, logo, primaryColor, secondaryColor, timezone, subscriptionTier, isActive, maxUsers, maxProjects, features, createdAt) VALUES
('nestle_brasil', 'Nestlé Brasil', 'Alimentos e Bebidas', 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Nestl%C3%A9.svg/2560px-Nestl%C3%A9.svg.png', '#E30613', '#FFFFFF', 'America/Sao_Paulo', 'enterprise', 1, 100, 50, '["sentiment_analysis","monte_carlo","alerts","reports"]', NOW()),
('unilever_brasil', 'Unilever Brasil', 'Bens de Consumo', 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Unilever_logo.svg/2560px-Unilever_logo.svg.png', '#0057B8', '#FFFFFF', 'America/Sao_Paulo', 'enterprise', 1, 80, 40, '["sentiment_analysis","monte_carlo","alerts"]', NOW()),
('brf_brasil', 'BRF (Brasil Foods)', 'Alimentos', 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/BRF_logo.svg/2560px-BRF_logo.svg.png', '#00843D', '#FFFFFF', 'America/Sao_Paulo', 'professional', 1, 50, 25, '["sentiment_analysis","alerts"]', NOW());

-- 2. CRIAR PROJETOS PARA NESTLÉ
INSERT INTO projects (id, companyId, name, description, productType, factory, status, createdBy, createdAt) VALUES
('proj_nestle_1', 'nestle_brasil', 'Nescau Zero Açúcar', 'Desenvolvimento de nova fórmula de achocolatado sem açúcar', 'Bebida em Pó', 'Araçatuba - SP', 'testing', 'system', NOW()),
('proj_nestle_2', 'nestle_brasil', 'Ninho Phases 4', 'Leite em pó para crianças acima de 3 anos', 'Leite em Pó', 'Montes Claros - MG', 'testing', 'system', NOW());

-- 3. CRIAR PROJETOS PARA UNILEVER
INSERT INTO projects (id, companyId, name, description, productType, factory, status, createdBy, createdAt) VALUES
('proj_unilever_1', 'unilever_brasil', 'Hellmann''s Vegana', 'Maionese 100% vegetal sem ovos', 'Molho', 'Valinhos - SP', 'testing', 'system', NOW()),
('proj_unilever_2', 'unilever_brasil', 'Omo Líquido Concentrado', 'Detergente líquido ultra concentrado', 'Limpeza', 'Vinhedo - SP', 'planning', 'system', NOW());

-- 4. CRIAR PROJETOS PARA BRF
INSERT INTO projects (id, companyId, name, description, productType, factory, status, createdBy, createdAt) VALUES
('proj_brf_1', 'brf_brasil', 'Sadia Nuggets Plant-Based', 'Nuggets vegetais à base de proteína de ervilha', 'Proteína Vegetal', 'Lucas do Rio Verde - MT', 'testing', 'system', NOW()),
('proj_brf_2', 'brf_brasil', 'Perdigão Linguiça Toscana Premium', 'Linguiça suína com temperos especiais', 'Embutidos', 'Carambeí - PR', 'completed', 'system', NOW());

-- 5. CRIAR STANDARDS PARA NESTLÉ
INSERT INTO standards (id, companyId, code, title, description, type, category, createdAt) VALUES
('std_nestle_1', 'nestle_brasil', 'NESTLE-QA-001', 'Padrão de Qualidade para Achocolatados', 'Especificações técnicas para produção de achocolatados', 'company', 'Qualidade', NOW()),
('std_nestle_2', 'nestle_brasil', 'ISO-22000', 'Sistema de Gestão de Segurança de Alimentos', 'Norma internacional para segurança alimentar', 'iso', 'Segurança', NOW());

-- 6. CRIAR STANDARDS PARA UNILEVER
INSERT INTO standards (id, companyId, code, title, description, type, category, createdAt) VALUES
('std_unilever_1', 'unilever_brasil', 'UNILEVER-ENV-001', 'Padrão de Sustentabilidade Ambiental', 'Diretrizes para produção sustentável', 'company', 'Sustentabilidade', NOW()),
('std_unilever_2', 'unilever_brasil', 'ANVISA-RDC-259', 'Rotulagem de Alimentos Embalados', 'Regulamento técnico para rotulagem', 'anvisa', 'Regulatório', NOW());

-- 7. CRIAR STANDARDS PARA BRF
INSERT INTO standards (id, companyId, code, title, description, type, category, createdAt) VALUES
('std_brf_1', 'brf_brasil', 'BRF-HACCP-001', 'Análise de Perigos e Pontos Críticos de Controle', 'Sistema HACCP para produção de carnes', 'company', 'Segurança Alimentar', NOW()),
('std_brf_2', 'brf_brasil', 'MAPA-IN-51', 'Regulamento Técnico de Identidade e Qualidade de Carnes', 'Normas do MAPA para produtos cárneos', 'mapa', 'Regulatório', NOW());

-- 8. CRIAR TESTES DISPONÍVEIS PARA NESTLÉ
INSERT INTO availableTests (id, companyId, name, description, category, methodology, duration, cost, isActive, createdAt) VALUES
('test_nestle_1', 'nestle_brasil', 'Teste de Solubilidade', 'Avalia a capacidade de dissolução em água', 'Físico-Química', 'Van''t Hoff', '2 horas', '150.00', 'yes', NOW()),
('test_nestle_2', 'nestle_brasil', 'Análise Sensorial', 'Avaliação de sabor, aroma e textura', 'Sensorial', 'Painel Treinado', '4 horas', '500.00', 'yes', NOW());

-- 9. CRIAR TESTES DISPONÍVEIS PARA UNILEVER
INSERT INTO availableTests (id, companyId, name, description, category, methodology, duration, cost, isActive, createdAt) VALUES
('test_unilever_1', 'unilever_brasil', 'Teste de Estabilidade de Emulsão', 'Avalia separação de fases em molhos', 'Físico-Química', 'Maxwell', '24 horas', '300.00', 'yes', NOW()),
('test_unilever_2', 'unilever_brasil', 'Teste de Viscosidade', 'Mede consistência e cremosidade', 'Reologia', 'Viscosímetro Brookfield', '1 hora', '100.00', 'yes', NOW());

-- 10. CRIAR TESTES DISPONÍVEIS PARA BRF
INSERT INTO availableTests (id, companyId, name, description, category, methodology, duration, cost, isActive, createdAt) VALUES
('test_brf_1', 'brf_brasil', 'Análise Microbiológica', 'Detecção de patógenos e contaminantes', 'Microbiologia', 'Cultura em Placa', '72 horas', '400.00', 'yes', NOW()),
('test_brf_2', 'brf_brasil', 'Teste de Shelf-Life Acelerado', 'Simula envelhecimento do produto', 'Estabilidade', 'Arrhenius', '30 dias', '1500.00', 'yes', NOW());

