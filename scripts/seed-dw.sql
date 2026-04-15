-- =============================================================
-- IntelliConnect — Data Warehouse Seed Script
-- Target: dw_intelliconnect (local PostgreSQL)
-- =============================================================

-- ===================== SCHEMA =====================

DROP TABLE IF EXISTS fact_university_recruitment CASCADE;
DROP TABLE IF EXISTS fact_projects CASCADE;
DROP TABLE IF EXISTS fact_events CASCADE;
DROP TABLE IF EXISTS fact_partner_activity CASCADE;
DROP TABLE IF EXISTS dim_partner CASCADE;

-- Dimension: Partners
CREATE TABLE dim_partner (
    partner_key SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    partner_category VARCHAR(50) NOT NULL,
    statut_partenariat VARCHAR(50) NOT NULL,
    partnership_level VARCHAR(50) NOT NULL,
    country VARCHAR(100) DEFAULT 'Tunisie',
    email VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fact: Partner Activity (revenue, satisfaction)
CREATE TABLE fact_partner_activity (
    id SERIAL PRIMARY KEY,
    partner_key INTEGER REFERENCES dim_partner(partner_key),
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    annual_revenue_generated NUMERIC(14,2),
    satisfaction_score NUMERIC(4,2),
    total_interactions INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fact: Events
CREATE TABLE fact_events (
    id SERIAL PRIMARY KEY,
    partner_key INTEGER REFERENCES dim_partner(partner_key),
    event_name VARCHAR(300),
    event_type VARCHAR(100),
    event_date DATE,
    num_participants INTEGER DEFAULT 0,
    event_budget NUMERIC(12,2) DEFAULT 0,
    event_revenue NUMERIC(12,2) DEFAULT 0,
    satisfaction_score NUMERIC(4,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fact: Projects
CREATE TABLE fact_projects (
    id SERIAL PRIMARY KEY,
    partner_key INTEGER REFERENCES dim_partner(partner_key),
    project_name VARCHAR(300),
    project_type VARCHAR(100),
    start_date DATE,
    end_date DATE,
    project_value NUMERIC(14,2) DEFAULT 0,
    client_satisfaction_score NUMERIC(4,2),
    num_consultants INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Fact: University Recruitment
CREATE TABLE fact_university_recruitment (
    id SERIAL PRIMARY KEY,
    partner_key INTEGER REFERENCES dim_partner(partner_key),
    student_name VARCHAR(200),
    specialization VARCHAR(200),
    recruitment_type VARCHAR(50),
    start_date DATE,
    satisfaction_score NUMERIC(4,2),
    converted_to_cdi BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ===================== SEED DATA =====================

-- dim_partner: Mix of real OLTP partner names + realistic Tunisian business context
INSERT INTO dim_partner (name, partner_category, statut_partenariat, partnership_level, country, email) VALUES
-- Universities (5)
('ESPRIT', 'university', 'actif', 'gold', 'Tunisie', 'partenariats@esprit.tn'),
('INSAT', 'university', 'actif', 'gold', 'Tunisie', 'relations-entreprises@insat.rnu.tn'),
('ENIT', 'university', 'actif', 'silver', 'Tunisie', 'bureau-entreprises@enit.rnu.tn'),
('Université de Tunis El Manar', 'university', 'actif', 'silver', 'Tunisie', 'partenariats@utm.rnu.tn'),
('IHEC Carthage', 'university', 'actif', 'bronze', 'Tunisie', 'carriere@ihec.rnu.tn'),
-- Customers (8)
('BIAT', 'customer', 'actif', 'platinum', 'Tunisie', 'relationsclient@biat.tn'),
('Amen Bank', 'customer', 'actif', 'gold', 'Tunisie', 'contact@amenbank.tn'),
('STEG', 'customer', 'actif', 'gold', 'Tunisie', 'relationclient@steg.com.tn'),
('Tunisair', 'customer', 'actif', 'silver', 'Tunisie', 'contact@tunisair.com.tn'),
('Groupe Chimique Tunisien', 'customer', 'en négociation', 'silver', 'Tunisie', 'contact@gct.com.tn'),
('Attijari Bank', 'customer', 'actif', 'gold', 'Tunisie', 'contact@attijari.tn'),
('Banque de Tunisie', 'customer', 'actif', 'silver', 'Tunisie', 'info@bt.tn'),
('Société Générale Tunisie', 'customer', 'en négociation', 'bronze', 'Tunisie', 'contact@sgt.tn'),
-- Marketing (6)
('Pluxee Tunisie', 'marketing', 'actif', 'gold', 'Tunisie', 'contact@pluxee.tn'),
('Orange Tunisie', 'marketing', 'actif', 'platinum', 'Tunisie', 'partenariat@orange.tn'),
('Coca-Cola Tunisie', 'marketing', 'actif', 'gold', 'Tunisie', 'contact@cocacola.tn'),
('Délice Danone', 'marketing', 'actif', 'silver', 'Tunisie', 'service.conso@delice.tn'),
('Carthage Cinéma', 'marketing', 'suspendu', 'bronze', 'Tunisie', 'contact@carthagecinema.tn'),
('FreeOui', 'marketing', 'actif', 'silver', 'Tunisie', 'partenariats@freeoui.tn'),
-- Suppliers (11)
('Microsoft Tunisie', 'supplier', 'actif', 'platinum', 'Tunisie', 'partenariats@microsoft.tn'),
('Dell Tunisia', 'supplier', 'actif', 'gold', 'Tunisie', 'ventes@dell.tn'),
('Amazon Web Services', 'supplier', 'actif', 'platinum', 'International', 'info@amazon.com'),
('Google Cloud', 'supplier', 'actif', 'gold', 'International', 'info@google.com'),
('Salesforce', 'supplier', 'actif', 'gold', 'International', 'info@salesforce.com'),
('SAP', 'supplier', 'actif', 'platinum', 'International', 'info@sap.com'),
('ServiceNow', 'supplier', 'actif', 'silver', 'International', 'info@servicenow.com'),
('Snowflake', 'supplier', 'en négociation', 'silver', 'International', 'info@snowflake.com'),
('Databricks', 'supplier', 'actif', 'silver', 'International', 'info@databricks.com'),
('HP Tunisie', 'supplier', 'suspendu', 'bronze', 'Tunisie', 'commercial@hp.tn'),
('Tunisie Telecom', 'supplier', 'actif', 'gold', 'Tunisie', 'partenariats@tt.tn');

-- fact_partner_activity: Revenue + satisfaction per partner
INSERT INTO fact_partner_activity (partner_key, year, quarter, annual_revenue_generated, satisfaction_score, total_interactions, total_events) VALUES
-- Universities (lower revenue, high satisfaction)
(1, 2025, 1, 85000, 8.7, 24, 6),
(2, 2025, 1, 72000, 8.4, 18, 5),
(3, 2025, 1, 45000, 7.9, 12, 3),
(4, 2025, 1, 38000, 7.5, 10, 2),
(5, 2025, 1, 28000, 7.2, 8, 2),
-- Customers (high revenue)
(6, 2025, 1, 2450000, 9.1, 45, 8),
(7, 2025, 1, 1850000, 8.6, 38, 7),
(8, 2025, 1, 1620000, 8.3, 32, 5),
(9, 2025, 1, 980000, 7.8, 22, 4),
(10, 2025, 1, 420000, 6.5, 8, 1),
(11, 2025, 1, 1340000, 8.8, 30, 6),
(12, 2025, 1, 890000, 7.9, 25, 4),
(13, 2025, 1, 350000, 6.2, 6, 1),
-- Marketing (medium revenue)
(14, 2025, 1, 320000, 8.2, 20, 5),
(15, 2025, 1, 580000, 9.0, 28, 8),
(16, 2025, 1, 290000, 7.8, 15, 4),
(17, 2025, 1, 210000, 7.5, 12, 3),
(18, 2025, 1, 45000, 5.0, 3, 0),
(19, 2025, 1, 180000, 7.3, 10, 3),
-- Suppliers (high revenue from tech)
(20, 2025, 1, 3200000, 9.3, 52, 12),
(21, 2025, 1, 1450000, 8.5, 30, 6),
(22, 2025, 1, 2800000, 9.1, 48, 10),
(23, 2025, 1, 1950000, 8.7, 35, 8),
(24, 2025, 1, 1680000, 8.4, 28, 6),
(25, 2025, 1, 2100000, 9.0, 40, 9),
(26, 2025, 1, 750000, 7.6, 18, 4),
(27, 2025, 1, 380000, 6.8, 10, 2),
(28, 2025, 1, 620000, 7.5, 15, 3),
(29, 2025, 1, 120000, 4.5, 4, 1),
(30, 2025, 1, 890000, 8.0, 22, 5);

-- fact_events: 40 realistic events
INSERT INTO fact_events (partner_key, event_name, event_type, event_date, num_participants, event_budget, event_revenue, satisfaction_score) VALUES
-- University events
(1, 'Forum Recrutement ESPRIT 2025', 'salon', '2025-02-15', 320, 25000, 0, 8.9),
(1, 'Hackathon Cloud ESPRIT x Capgemini', 'hackathon', '2025-03-22', 85, 15000, 0, 9.2),
(2, 'Journée Portes Ouvertes INSAT', 'journée portes ouvertes', '2025-01-18', 200, 12000, 0, 8.1),
(2, 'Workshop IA & Data Science INSAT', 'workshop', '2025-04-05', 60, 8000, 0, 8.6),
(3, 'Conférence Ingénierie Logicielle ENIT', 'conférence', '2025-03-10', 150, 10000, 0, 7.8),
(4, 'Séminaire Recherche UTM', 'séminaire', '2025-02-28', 90, 7000, 0, 7.4),
(5, 'Career Day IHEC', 'salon', '2025-01-25', 180, 9000, 0, 7.6),
-- Customer events
(6, 'Séminaire Transformation Digitale BIAT', 'séminaire', '2025-01-20', 45, 35000, 52000, 9.0),
(6, 'Workshop Cybersécurité BIAT', 'workshop', '2025-03-15', 30, 20000, 28000, 8.8),
(7, 'Formation Cloud Amen Bank', 'formation', '2025-02-10', 25, 18000, 24000, 8.5),
(8, 'Audit IT STEG — Restitution', 'restitution', '2025-04-02', 35, 12000, 45000, 8.3),
(9, 'Workshop ERP Tunisair', 'workshop', '2025-03-05', 20, 15000, 22000, 7.9),
(11, 'Lancement Projet Core Banking Attijari', 'lancement', '2025-01-30', 40, 28000, 65000, 9.1),
(12, 'Revue Trimestrielle Banque de Tunisie', 'revue', '2025-03-28', 15, 5000, 0, 7.8),
-- Marketing events
(14, 'Campagne Bien-être Pluxee x Capgemini', 'campagne', '2025-02-14', 500, 45000, 68000, 8.4),
(15, 'Orange Digital Center — Tech Talk', 'conférence', '2025-01-22', 250, 30000, 42000, 9.2),
(15, 'Hackathon 5G Orange x Capgemini', 'hackathon', '2025-04-10', 120, 40000, 55000, 8.8),
(16, 'Activation Coca-Cola Summer Tech', 'activation', '2025-03-01', 800, 60000, 95000, 8.0),
(17, 'Dégustation & Innovation Délice', 'activation', '2025-02-20', 150, 18000, 25000, 7.6),
(19, 'FreeOui Corporate Day', 'journée entreprise', '2025-03-18', 100, 12000, 18000, 7.5),
-- Supplier events
(20, 'Microsoft Ignite Tunisia — Capgemini Track', 'conférence', '2025-01-15', 400, 80000, 120000, 9.5),
(20, 'Azure DevOps Masterclass', 'formation', '2025-03-12', 50, 25000, 38000, 9.0),
(20, 'Copilot Workshop for Enterprise', 'workshop', '2025-04-08', 35, 20000, 30000, 9.2),
(21, 'Dell PowerEdge Launch Tunisia', 'lancement produit', '2025-02-05', 80, 35000, 48000, 8.3),
(22, 'AWS re:Invent Recap Tunis', 'conférence', '2025-01-28', 180, 50000, 75000, 9.0),
(22, 'AWS Well-Architected Workshop', 'workshop', '2025-03-20', 40, 18000, 25000, 8.7),
(23, 'Google Cloud Next Extended Tunis', 'conférence', '2025-02-18', 200, 45000, 65000, 8.9),
(24, 'Salesforce World Tour Tunis', 'conférence', '2025-03-08', 150, 40000, 58000, 8.5),
(25, 'SAP TechEd Watch Party Tunisia', 'conférence', '2025-01-12', 100, 30000, 42000, 8.8),
(25, 'SAP S/4HANA Migration Workshop', 'workshop', '2025-04-01', 30, 22000, 35000, 9.1),
(26, 'ServiceNow Knowledge Relay Tunis', 'conférence', '2025-02-22', 70, 20000, 28000, 7.8),
(28, 'Databricks Lakehouse Day Tunis', 'conférence', '2025-03-25', 60, 18000, 22000, 7.6),
(30, 'Tunisie Telecom Cloud Infra Summit', 'séminaire', '2025-04-12', 90, 22000, 32000, 8.2),
-- Extra events to bulk up
(1, 'ESPRIT Coding Challenge 2025', 'compétition', '2025-04-15', 200, 20000, 0, 8.5),
(6, 'BIAT Innovation Lab Opening', 'inauguration', '2025-04-18', 100, 50000, 0, 9.3),
(15, 'Orange Startup Accelerator Demo Day', 'demo', '2025-04-20', 300, 35000, 48000, 8.7),
(20, 'Microsoft Power Platform Bootcamp', 'formation', '2025-04-22', 45, 15000, 22000, 8.9),
(22, 'AWS GameDay Tunisia', 'compétition', '2025-04-25', 60, 12000, 0, 9.0),
(25, 'SAP BTP Developers Meetup', 'meetup', '2025-04-28', 40, 8000, 12000, 8.2),
(2, 'INSAT x Capgemini AI Challenge', 'compétition', '2025-04-30', 100, 18000, 0, 8.8);

-- fact_projects: 35 realistic IT projects
INSERT INTO fact_projects (partner_key, project_name, project_type, start_date, end_date, project_value, client_satisfaction_score, num_consultants) VALUES
-- BIAT projects
(6, 'Core Banking Modernization', 'transformation', '2024-06-01', '2025-12-31', 1200000, 9.2, 18),
(6, 'Mobile Banking App V3', 'développement', '2025-01-15', '2025-08-30', 450000, 8.8, 8),
(6, 'Data Analytics Platform', 'data', '2025-02-01', '2025-10-31', 380000, 9.0, 6),
-- Amen Bank
(7, 'Cloud Migration Azure', 'infrastructure', '2024-09-01', '2025-06-30', 680000, 8.5, 10),
(7, 'Cybersecurity Assessment', 'sécurité', '2025-03-01', '2025-05-31', 120000, 8.7, 4),
-- STEG
(8, 'Smart Grid Management System', 'IoT', '2024-07-01', '2025-09-30', 850000, 8.4, 12),
(8, 'Customer Portal Redesign', 'développement', '2025-01-10', '2025-07-31', 320000, 8.0, 5),
-- Tunisair
(9, 'Revenue Management System', 'ERP', '2024-10-01', '2025-08-31', 520000, 7.9, 8),
(9, 'Passenger Experience App', 'développement', '2025-02-15', '2025-11-30', 280000, 7.5, 5),
-- GCT
(10, 'Supply Chain Optimization', 'consulting', '2025-03-01', '2025-12-31', 420000, 6.5, 6),
-- Attijari
(11, 'Digital Onboarding Platform', 'développement', '2024-08-01', '2025-05-31', 550000, 9.0, 9),
(11, 'API Gateway Implementation', 'infrastructure', '2025-01-01', '2025-06-30', 280000, 8.6, 4),
(11, 'Fraud Detection ML Pipeline', 'data', '2025-03-15', '2025-12-31', 480000, 8.9, 7),
-- Banque de Tunisie
(12, 'Legacy System Modernization', 'transformation', '2024-11-01', '2025-10-31', 720000, 7.8, 11),
(12, 'Regulatory Compliance Platform', 'développement', '2025-02-01', '2025-08-31', 180000, 8.1, 3),
-- Microsoft projects
(20, 'Azure Landing Zone Setup', 'infrastructure', '2025-01-01', '2025-04-30', 350000, 9.4, 5),
(20, 'Copilot Enterprise Rollout', 'transformation', '2025-02-01', '2025-07-31', 280000, 9.1, 4),
(20, 'Power Platform CoE', 'consulting', '2025-01-15', '2025-12-31', 420000, 9.2, 6),
-- AWS
(22, 'Multi-Account Strategy', 'infrastructure', '2024-12-01', '2025-05-31', 480000, 9.0, 7),
(22, 'Serverless Migration', 'transformation', '2025-03-01', '2025-11-30', 650000, 8.8, 9),
-- Google Cloud
(23, 'BigQuery Data Lake', 'data', '2025-01-10', '2025-09-30', 520000, 8.7, 7),
(23, 'GKE Platform Engineering', 'infrastructure', '2025-02-15', '2025-08-31', 380000, 8.5, 5),
-- Salesforce
(24, 'CRM Implementation BIAT', 'CRM', '2024-10-01', '2025-06-30', 680000, 8.4, 10),
(24, 'Marketing Cloud Setup', 'marketing', '2025-03-01', '2025-09-30', 320000, 8.2, 4),
-- SAP
(25, 'S/4HANA Migration — Phase 1', 'ERP', '2024-04-01', '2025-03-31', 1500000, 9.1, 22),
(25, 'SAP BTP Integration', 'intégration', '2025-01-01', '2025-08-31', 380000, 8.8, 5),
(25, 'SAP Analytics Cloud Setup', 'data', '2025-02-01', '2025-06-30', 220000, 8.5, 3),
-- ServiceNow
(26, 'ITSM Implementation', 'ITSM', '2025-01-01', '2025-07-31', 350000, 7.8, 5),
(26, 'HR Service Delivery Module', 'HR', '2025-03-01', '2025-09-30', 200000, 7.4, 3),
-- Databricks
(28, 'Lakehouse Architecture POC', 'data', '2025-02-01', '2025-05-31', 180000, 7.6, 3),
-- Orange Tunisie (customer project via marketing partner)
(15, 'Network Analytics Dashboard', 'data', '2025-01-15', '2025-06-30', 280000, 8.9, 4),
-- Dell
(21, 'HCI Infrastructure Refresh', 'infrastructure', '2025-01-01', '2025-04-30', 450000, 8.3, 3),
-- Snowflake
(27, 'Data Sharing POC', 'data', '2025-03-15', '2025-06-30', 120000, 7.0, 2),
-- Tunisie Telecom
(30, '5G Core Network Consulting', 'consulting', '2025-01-01', '2025-12-31', 580000, 8.1, 8),
(30, 'BSS/OSS Modernization', 'transformation', '2024-09-01', '2025-09-30', 720000, 7.9, 10);

-- fact_university_recruitment: 50 realistic student recruits
INSERT INTO fact_university_recruitment (partner_key, student_name, specialization, recruitment_type, start_date, satisfaction_score, converted_to_cdi) VALUES
-- ESPRIT students
(1, 'Yassine Ben Salah', 'Cloud & DevOps', 'stage PFE', '2025-02-01', 8.5, TRUE),
(1, 'Amira Trabelsi', 'Data Engineering', 'stage PFE', '2025-02-01', 9.0, TRUE),
(1, 'Mohamed Chaabane', 'Développement Full-Stack', 'stage PFE', '2025-02-15', 7.8, TRUE),
(1, 'Fatma Bouazizi', 'Intelligence Artificielle', 'stage PFE', '2025-03-01', 9.2, TRUE),
(1, 'Karim Dridi', 'Cybersécurité', 'alternance', '2024-09-01', 8.0, FALSE),
(1, 'Sarra Hammami', 'Cloud & DevOps', 'alternance', '2024-09-01', 8.3, TRUE),
(1, 'Omar Belhaj', 'Architecture Logicielle', 'stage été', '2025-06-01', 7.5, FALSE),
(1, 'Ines Maaloul', 'Data Science', 'stage été', '2025-06-01', 8.8, TRUE),
(1, 'Amine Jlassi', 'Développement Mobile', 'stage PFE', '2025-02-01', 7.2, FALSE),
(1, 'Rania Gharbi', 'SAP Consulting', 'stage PFE', '2025-03-01', 8.6, TRUE),
-- INSAT students
(2, 'Nizar Belhadj', 'Machine Learning', 'stage PFE', '2025-02-01', 9.1, TRUE),
(2, 'Mariem Saidi', 'Big Data', 'stage PFE', '2025-02-15', 8.7, TRUE),
(2, 'Aymen Khelifi', 'Systèmes Embarqués', 'stage PFE', '2025-03-01', 7.9, FALSE),
(2, 'Hana Ben Amor', 'Cloud Computing', 'alternance', '2024-09-01', 8.4, TRUE),
(2, 'Fares Mejri', 'Développement Java', 'stage été', '2025-06-15', 7.6, FALSE),
(2, 'Yasmine Oueslati', 'Data Engineering', 'stage PFE', '2025-02-01', 8.9, TRUE),
(2, 'Bilel Sfaxi', 'DevSecOps', 'alternance', '2024-09-01', 8.1, TRUE),
(2, 'Sana Karoui', 'Architecture Cloud', 'stage PFE', '2025-03-01', 9.0, TRUE),
-- ENIT students
(3, 'Anis Ghorbel', 'Génie Logiciel', 'stage PFE', '2025-02-01', 8.2, TRUE),
(3, 'Eya Mansour', 'Réseaux & Télécom', 'stage PFE', '2025-02-15', 7.5, FALSE),
(3, 'Wael Bouktif', 'Intelligence Artificielle', 'stage été', '2025-06-01', 8.0, TRUE),
(3, 'Rim Tlili', 'Data Analytics', 'alternance', '2024-09-01', 7.8, FALSE),
(3, 'Zied Dhaouadi', 'Développement Web', 'stage PFE', '2025-03-01', 7.3, FALSE),
(3, 'Lina Brahim', 'Cloud Infrastructure', 'stage PFE', '2025-02-01', 8.5, TRUE),
-- UTM students
(4, 'Hamza Riahi', 'Informatique Fondamentale', 'stage PFE', '2025-02-01', 7.6, FALSE),
(4, 'Salma Jaziri', 'Science des Données', 'stage PFE', '2025-02-15', 8.1, TRUE),
(4, 'Raed Souissi', 'Développement Backend', 'stage été', '2025-06-01', 7.0, FALSE),
(4, 'Manel Nasri', 'Sécurité Informatique', 'alternance', '2024-09-01', 7.4, FALSE),
(4, 'Skander Ammar', 'Cloud & Virtualisation', 'stage PFE', '2025-03-01', 8.3, TRUE),
-- IHEC students
(5, 'Chaima Elloumi', 'Business Intelligence', 'stage PFE', '2025-02-01', 7.8, TRUE),
(5, 'Tarek Ben Hassen', 'Finance & Analytics', 'stage PFE', '2025-02-15', 7.2, FALSE),
(5, 'Sonia Abidi', 'Marketing Digital', 'stage été', '2025-06-01', 7.5, FALSE),
(5, 'Firas Bouslama', 'Consulting IT', 'alternance', '2024-09-01', 8.0, TRUE),
(5, 'Nour Hamed', 'Gestion de Projet', 'stage PFE', '2025-03-01', 7.9, TRUE),
-- Extra recruits for volume
(1, 'Ali Mabrouk', 'Microservices', 'stage PFE', '2025-03-15', 8.4, TRUE),
(1, 'Khaoula Ferjani', 'QA Automation', 'alternance', '2024-09-15', 8.1, TRUE),
(2, 'Rami Chouchane', 'Blockchain', 'stage PFE', '2025-03-15', 7.7, FALSE),
(2, 'Maha Aouini', 'UX/UI Design', 'stage été', '2025-07-01', 8.3, FALSE),
(3, 'Seif Guesmi', 'Performance Engineering', 'stage PFE', '2025-03-15', 8.0, TRUE),
(1, 'Nessrine Haddad', 'SAP ABAP', 'stage PFE', '2025-04-01', 8.7, TRUE),
(2, 'Oussama Ferchichi', 'Python & ML', 'stage PFE', '2025-04-01', 9.3, TRUE),
(1, 'Haifa Zarrouk', 'Angular & React', 'stage été', '2025-06-15', 7.9, FALSE),
(3, 'Mehdi Kammoun', 'Kubernetes Admin', 'alternance', '2024-10-01', 8.6, TRUE),
(4, 'Rym Chebbi', 'Data Visualization', 'stage PFE', '2025-04-01', 7.8, TRUE),
(5, 'Youssef Attia', 'ERP Consulting', 'stage PFE', '2025-04-01', 8.2, TRUE),
(1, 'Rim Ayari', 'Salesforce Dev', 'stage PFE', '2025-04-15', 8.8, TRUE),
(2, 'Ahmed Mathlouthi', 'AWS Solutions Architect', 'alternance', '2024-10-15', 9.1, TRUE),
(3, 'Sirine Bouzid', 'Java Spring Boot', 'stage PFE', '2025-04-15', 7.6, FALSE),
(1, 'Malek Turki', '.NET Core', 'stage été', '2025-07-01', 8.0, FALSE),
(2, 'Emna Laabidi', 'Power BI & Analytics', 'stage PFE', '2025-04-15', 8.5, TRUE);
