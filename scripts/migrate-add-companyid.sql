-- ============================================================================
-- MIGRAÇÃO: Adicionar companyId em todas as tabelas
-- ============================================================================
-- Este script adiciona a coluna companyId em todas as tabelas que ainda não a possuem
-- e atualiza os dados existentes com um companyId padrão

-- 1. PROJETOS (já foi adicionado, mas vamos garantir)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 2. MANUFACTURING DATA
ALTER TABLE manufacturingData ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 3. STANDARDS
ALTER TABLE standards ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 4. COMPLAINTS
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 5. PREDICTIONS
ALTER TABLE predictions ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 6. ALERTS
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 7. REPORTS
ALTER TABLE reports ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 8. SOCIAL MEDIA ACCOUNTS
ALTER TABLE socialMediaAccounts ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 9. SOCIAL MEDIA POSTS
ALTER TABLE socialMediaPosts ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 10. SENTIMENT ANALYSIS
ALTER TABLE sentimentAnalysis ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 11. SENTIMENT SUMMARY
ALTER TABLE sentimentSummary ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 12. MONITORED KEYWORDS
ALTER TABLE monitoredKeywords ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 13. MONITORED TOPICS
ALTER TABLE monitoredTopics ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 14. SENTIMENT ALERTS
ALTER TABLE sentimentAlerts ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 15. ALERT CONFIGURATIONS
ALTER TABLE alertConfigurations ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 16. AVAILABLE TESTS
ALTER TABLE availableTests ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 17. PROJECT TESTS
ALTER TABLE projectTests ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 18. TEST RESULTS
ALTER TABLE testResults ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- 19. MONTE CARLO SIMULATIONS
ALTER TABLE monteCarloSimulations ADD COLUMN IF NOT EXISTS companyId varchar(64) NOT NULL DEFAULT 'nestle_brasil';

-- ============================================================================
-- ATUALIZAR DADOS EXISTENTES
-- ============================================================================
-- Todos os dados existentes serão associados à Nestlé Brasil por padrão

UPDATE projects SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE manufacturingData SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE standards SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE complaints SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE predictions SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE alerts SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE reports SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE socialMediaAccounts SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE socialMediaPosts SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE sentimentAnalysis SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE sentimentSummary SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE monitoredKeywords SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE monitoredTopics SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE sentimentAlerts SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE alertConfigurations SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE availableTests SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE projectTests SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE testResults SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';
UPDATE monteCarloSimulations SET companyId = 'nestle_brasil' WHERE companyId IS NULL OR companyId = '';

