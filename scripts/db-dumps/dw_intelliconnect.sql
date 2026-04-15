--
-- PostgreSQL database dump
--

\restrict wigcDjiN2hHW0bO0ObL8lP08BbbTzA5QxEhAEauwZShXaLaj7hfulYlWWbnXCee

-- Dumped from database version 18.2 (Homebrew)
-- Dumped by pg_dump version 18.2 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.fact_university_recruitment DROP CONSTRAINT IF EXISTS fact_university_recruitment_partner_key_fkey;
ALTER TABLE IF EXISTS ONLY public.fact_projects DROP CONSTRAINT IF EXISTS fact_projects_partner_key_fkey;
ALTER TABLE IF EXISTS ONLY public.fact_partner_activity DROP CONSTRAINT IF EXISTS fact_partner_activity_partner_key_fkey;
ALTER TABLE IF EXISTS ONLY public.fact_events DROP CONSTRAINT IF EXISTS fact_events_partner_key_fkey;
ALTER TABLE IF EXISTS ONLY public.fact_university_recruitment DROP CONSTRAINT IF EXISTS fact_university_recruitment_pkey;
ALTER TABLE IF EXISTS ONLY public.fact_projects DROP CONSTRAINT IF EXISTS fact_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.fact_partner_activity DROP CONSTRAINT IF EXISTS fact_partner_activity_pkey;
ALTER TABLE IF EXISTS ONLY public.fact_events DROP CONSTRAINT IF EXISTS fact_events_pkey;
ALTER TABLE IF EXISTS ONLY public.dim_partner DROP CONSTRAINT IF EXISTS dim_partner_pkey;
ALTER TABLE IF EXISTS public.fact_university_recruitment ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.fact_projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.fact_partner_activity ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.fact_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.dim_partner ALTER COLUMN partner_key DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.fact_university_recruitment_id_seq;
DROP TABLE IF EXISTS public.fact_university_recruitment;
DROP SEQUENCE IF EXISTS public.fact_projects_id_seq;
DROP TABLE IF EXISTS public.fact_projects;
DROP SEQUENCE IF EXISTS public.fact_partner_activity_id_seq;
DROP TABLE IF EXISTS public.fact_partner_activity;
DROP SEQUENCE IF EXISTS public.fact_events_id_seq;
DROP TABLE IF EXISTS public.fact_events;
DROP SEQUENCE IF EXISTS public.dim_partner_partner_key_seq;
DROP TABLE IF EXISTS public.dim_partner;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: dim_partner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.dim_partner (
    partner_key integer NOT NULL,
    name character varying(200) NOT NULL,
    partner_category character varying(50) NOT NULL,
    statut_partenariat character varying(50) NOT NULL,
    partnership_level character varying(50) NOT NULL,
    country character varying(100) DEFAULT 'Tunisie'::character varying,
    email character varying(200),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: dim_partner_partner_key_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.dim_partner_partner_key_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: dim_partner_partner_key_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.dim_partner_partner_key_seq OWNED BY public.dim_partner.partner_key;


--
-- Name: fact_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_events (
    id integer NOT NULL,
    partner_key integer,
    event_name character varying(300),
    event_type character varying(100),
    event_date date,
    num_participants integer DEFAULT 0,
    event_budget numeric(12,2) DEFAULT 0,
    event_revenue numeric(12,2) DEFAULT 0,
    satisfaction_score numeric(4,2),
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_events_id_seq OWNED BY public.fact_events.id;


--
-- Name: fact_partner_activity; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_partner_activity (
    id integer NOT NULL,
    partner_key integer,
    year integer NOT NULL,
    quarter integer NOT NULL,
    annual_revenue_generated numeric(14,2),
    satisfaction_score numeric(4,2),
    total_interactions integer DEFAULT 0,
    total_events integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_partner_activity_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_partner_activity_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_partner_activity_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_partner_activity_id_seq OWNED BY public.fact_partner_activity.id;


--
-- Name: fact_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_projects (
    id integer NOT NULL,
    partner_key integer,
    project_name character varying(300),
    project_type character varying(100),
    start_date date,
    end_date date,
    project_value numeric(14,2) DEFAULT 0,
    client_satisfaction_score numeric(4,2),
    num_consultants integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_projects_id_seq OWNED BY public.fact_projects.id;


--
-- Name: fact_university_recruitment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.fact_university_recruitment (
    id integer NOT NULL,
    partner_key integer,
    student_name character varying(200),
    specialization character varying(200),
    recruitment_type character varying(50),
    start_date date,
    satisfaction_score numeric(4,2),
    converted_to_cdi boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


--
-- Name: fact_university_recruitment_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.fact_university_recruitment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: fact_university_recruitment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.fact_university_recruitment_id_seq OWNED BY public.fact_university_recruitment.id;


--
-- Name: dim_partner partner_key; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_partner ALTER COLUMN partner_key SET DEFAULT nextval('public.dim_partner_partner_key_seq'::regclass);


--
-- Name: fact_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_events ALTER COLUMN id SET DEFAULT nextval('public.fact_events_id_seq'::regclass);


--
-- Name: fact_partner_activity id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_partner_activity ALTER COLUMN id SET DEFAULT nextval('public.fact_partner_activity_id_seq'::regclass);


--
-- Name: fact_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_projects ALTER COLUMN id SET DEFAULT nextval('public.fact_projects_id_seq'::regclass);


--
-- Name: fact_university_recruitment id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_university_recruitment ALTER COLUMN id SET DEFAULT nextval('public.fact_university_recruitment_id_seq'::regclass);


--
-- Data for Name: dim_partner; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.dim_partner (partner_key, name, partner_category, statut_partenariat, partnership_level, country, email, created_at) FROM stdin;
1	ESPRIT	university	actif	gold	Tunisie	partenariats@esprit.tn	2026-04-15 15:33:26.385661
2	INSAT	university	actif	gold	Tunisie	relations-entreprises@insat.rnu.tn	2026-04-15 15:33:26.385661
3	ENIT	university	actif	silver	Tunisie	bureau-entreprises@enit.rnu.tn	2026-04-15 15:33:26.385661
4	Université de Tunis El Manar	university	actif	silver	Tunisie	partenariats@utm.rnu.tn	2026-04-15 15:33:26.385661
5	IHEC Carthage	university	actif	bronze	Tunisie	carriere@ihec.rnu.tn	2026-04-15 15:33:26.385661
6	BIAT	customer	actif	platinum	Tunisie	relationsclient@biat.tn	2026-04-15 15:33:26.385661
7	Amen Bank	customer	actif	gold	Tunisie	contact@amenbank.tn	2026-04-15 15:33:26.385661
8	STEG	customer	actif	gold	Tunisie	relationclient@steg.com.tn	2026-04-15 15:33:26.385661
9	Tunisair	customer	actif	silver	Tunisie	contact@tunisair.com.tn	2026-04-15 15:33:26.385661
10	Groupe Chimique Tunisien	customer	en négociation	silver	Tunisie	contact@gct.com.tn	2026-04-15 15:33:26.385661
11	Attijari Bank	customer	actif	gold	Tunisie	contact@attijari.tn	2026-04-15 15:33:26.385661
12	Banque de Tunisie	customer	actif	silver	Tunisie	info@bt.tn	2026-04-15 15:33:26.385661
13	Société Générale Tunisie	customer	en négociation	bronze	Tunisie	contact@sgt.tn	2026-04-15 15:33:26.385661
14	Pluxee Tunisie	marketing	actif	gold	Tunisie	contact@pluxee.tn	2026-04-15 15:33:26.385661
15	Orange Tunisie	marketing	actif	platinum	Tunisie	partenariat@orange.tn	2026-04-15 15:33:26.385661
16	Coca-Cola Tunisie	marketing	actif	gold	Tunisie	contact@cocacola.tn	2026-04-15 15:33:26.385661
17	Délice Danone	marketing	actif	silver	Tunisie	service.conso@delice.tn	2026-04-15 15:33:26.385661
18	Carthage Cinéma	marketing	suspendu	bronze	Tunisie	contact@carthagecinema.tn	2026-04-15 15:33:26.385661
19	FreeOui	marketing	actif	silver	Tunisie	partenariats@freeoui.tn	2026-04-15 15:33:26.385661
20	Microsoft Tunisie	supplier	actif	platinum	Tunisie	partenariats@microsoft.tn	2026-04-15 15:33:26.385661
21	Dell Tunisia	supplier	actif	gold	Tunisie	ventes@dell.tn	2026-04-15 15:33:26.385661
22	Amazon Web Services	supplier	actif	platinum	International	info@amazon.com	2026-04-15 15:33:26.385661
23	Google Cloud	supplier	actif	gold	International	info@google.com	2026-04-15 15:33:26.385661
24	Salesforce	supplier	actif	gold	International	info@salesforce.com	2026-04-15 15:33:26.385661
25	SAP	supplier	actif	platinum	International	info@sap.com	2026-04-15 15:33:26.385661
26	ServiceNow	supplier	actif	silver	International	info@servicenow.com	2026-04-15 15:33:26.385661
27	Snowflake	supplier	en négociation	silver	International	info@snowflake.com	2026-04-15 15:33:26.385661
28	Databricks	supplier	actif	silver	International	info@databricks.com	2026-04-15 15:33:26.385661
29	HP Tunisie	supplier	suspendu	bronze	Tunisie	commercial@hp.tn	2026-04-15 15:33:26.385661
30	Tunisie Telecom	supplier	actif	gold	Tunisie	partenariats@tt.tn	2026-04-15 15:33:26.385661
\.


--
-- Data for Name: fact_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_events (id, partner_key, event_name, event_type, event_date, num_participants, event_budget, event_revenue, satisfaction_score, created_at) FROM stdin;
1	1	Forum Recrutement ESPRIT 2025	salon	2025-02-15	320	25000.00	0.00	8.90	2026-04-15 15:33:26.389276
2	1	Hackathon Cloud ESPRIT x Capgemini	hackathon	2025-03-22	85	15000.00	0.00	9.20	2026-04-15 15:33:26.389276
3	2	Journée Portes Ouvertes INSAT	journée portes ouvertes	2025-01-18	200	12000.00	0.00	8.10	2026-04-15 15:33:26.389276
4	2	Workshop IA & Data Science INSAT	workshop	2025-04-05	60	8000.00	0.00	8.60	2026-04-15 15:33:26.389276
5	3	Conférence Ingénierie Logicielle ENIT	conférence	2025-03-10	150	10000.00	0.00	7.80	2026-04-15 15:33:26.389276
6	4	Séminaire Recherche UTM	séminaire	2025-02-28	90	7000.00	0.00	7.40	2026-04-15 15:33:26.389276
7	5	Career Day IHEC	salon	2025-01-25	180	9000.00	0.00	7.60	2026-04-15 15:33:26.389276
8	6	Séminaire Transformation Digitale BIAT	séminaire	2025-01-20	45	35000.00	52000.00	9.00	2026-04-15 15:33:26.389276
9	6	Workshop Cybersécurité BIAT	workshop	2025-03-15	30	20000.00	28000.00	8.80	2026-04-15 15:33:26.389276
10	7	Formation Cloud Amen Bank	formation	2025-02-10	25	18000.00	24000.00	8.50	2026-04-15 15:33:26.389276
11	8	Audit IT STEG — Restitution	restitution	2025-04-02	35	12000.00	45000.00	8.30	2026-04-15 15:33:26.389276
12	9	Workshop ERP Tunisair	workshop	2025-03-05	20	15000.00	22000.00	7.90	2026-04-15 15:33:26.389276
13	11	Lancement Projet Core Banking Attijari	lancement	2025-01-30	40	28000.00	65000.00	9.10	2026-04-15 15:33:26.389276
14	12	Revue Trimestrielle Banque de Tunisie	revue	2025-03-28	15	5000.00	0.00	7.80	2026-04-15 15:33:26.389276
15	14	Campagne Bien-être Pluxee x Capgemini	campagne	2025-02-14	500	45000.00	68000.00	8.40	2026-04-15 15:33:26.389276
16	15	Orange Digital Center — Tech Talk	conférence	2025-01-22	250	30000.00	42000.00	9.20	2026-04-15 15:33:26.389276
17	15	Hackathon 5G Orange x Capgemini	hackathon	2025-04-10	120	40000.00	55000.00	8.80	2026-04-15 15:33:26.389276
18	16	Activation Coca-Cola Summer Tech	activation	2025-03-01	800	60000.00	95000.00	8.00	2026-04-15 15:33:26.389276
19	17	Dégustation & Innovation Délice	activation	2025-02-20	150	18000.00	25000.00	7.60	2026-04-15 15:33:26.389276
20	19	FreeOui Corporate Day	journée entreprise	2025-03-18	100	12000.00	18000.00	7.50	2026-04-15 15:33:26.389276
21	20	Microsoft Ignite Tunisia — Capgemini Track	conférence	2025-01-15	400	80000.00	120000.00	9.50	2026-04-15 15:33:26.389276
22	20	Azure DevOps Masterclass	formation	2025-03-12	50	25000.00	38000.00	9.00	2026-04-15 15:33:26.389276
23	20	Copilot Workshop for Enterprise	workshop	2025-04-08	35	20000.00	30000.00	9.20	2026-04-15 15:33:26.389276
24	21	Dell PowerEdge Launch Tunisia	lancement produit	2025-02-05	80	35000.00	48000.00	8.30	2026-04-15 15:33:26.389276
25	22	AWS re:Invent Recap Tunis	conférence	2025-01-28	180	50000.00	75000.00	9.00	2026-04-15 15:33:26.389276
26	22	AWS Well-Architected Workshop	workshop	2025-03-20	40	18000.00	25000.00	8.70	2026-04-15 15:33:26.389276
27	23	Google Cloud Next Extended Tunis	conférence	2025-02-18	200	45000.00	65000.00	8.90	2026-04-15 15:33:26.389276
28	24	Salesforce World Tour Tunis	conférence	2025-03-08	150	40000.00	58000.00	8.50	2026-04-15 15:33:26.389276
29	25	SAP TechEd Watch Party Tunisia	conférence	2025-01-12	100	30000.00	42000.00	8.80	2026-04-15 15:33:26.389276
30	25	SAP S/4HANA Migration Workshop	workshop	2025-04-01	30	22000.00	35000.00	9.10	2026-04-15 15:33:26.389276
31	26	ServiceNow Knowledge Relay Tunis	conférence	2025-02-22	70	20000.00	28000.00	7.80	2026-04-15 15:33:26.389276
32	28	Databricks Lakehouse Day Tunis	conférence	2025-03-25	60	18000.00	22000.00	7.60	2026-04-15 15:33:26.389276
33	30	Tunisie Telecom Cloud Infra Summit	séminaire	2025-04-12	90	22000.00	32000.00	8.20	2026-04-15 15:33:26.389276
34	1	ESPRIT Coding Challenge 2025	compétition	2025-04-15	200	20000.00	0.00	8.50	2026-04-15 15:33:26.389276
35	6	BIAT Innovation Lab Opening	inauguration	2025-04-18	100	50000.00	0.00	9.30	2026-04-15 15:33:26.389276
36	15	Orange Startup Accelerator Demo Day	demo	2025-04-20	300	35000.00	48000.00	8.70	2026-04-15 15:33:26.389276
37	20	Microsoft Power Platform Bootcamp	formation	2025-04-22	45	15000.00	22000.00	8.90	2026-04-15 15:33:26.389276
38	22	AWS GameDay Tunisia	compétition	2025-04-25	60	12000.00	0.00	9.00	2026-04-15 15:33:26.389276
39	25	SAP BTP Developers Meetup	meetup	2025-04-28	40	8000.00	12000.00	8.20	2026-04-15 15:33:26.389276
40	2	INSAT x Capgemini AI Challenge	compétition	2025-04-30	100	18000.00	0.00	8.80	2026-04-15 15:33:26.389276
\.


--
-- Data for Name: fact_partner_activity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_partner_activity (id, partner_key, year, quarter, annual_revenue_generated, satisfaction_score, total_interactions, total_events, created_at) FROM stdin;
1	1	2025	1	85000.00	8.70	24	6	2026-04-15 15:33:26.387686
2	2	2025	1	72000.00	8.40	18	5	2026-04-15 15:33:26.387686
3	3	2025	1	45000.00	7.90	12	3	2026-04-15 15:33:26.387686
4	4	2025	1	38000.00	7.50	10	2	2026-04-15 15:33:26.387686
5	5	2025	1	28000.00	7.20	8	2	2026-04-15 15:33:26.387686
6	6	2025	1	2450000.00	9.10	45	8	2026-04-15 15:33:26.387686
7	7	2025	1	1850000.00	8.60	38	7	2026-04-15 15:33:26.387686
8	8	2025	1	1620000.00	8.30	32	5	2026-04-15 15:33:26.387686
9	9	2025	1	980000.00	7.80	22	4	2026-04-15 15:33:26.387686
10	10	2025	1	420000.00	6.50	8	1	2026-04-15 15:33:26.387686
11	11	2025	1	1340000.00	8.80	30	6	2026-04-15 15:33:26.387686
12	12	2025	1	890000.00	7.90	25	4	2026-04-15 15:33:26.387686
13	13	2025	1	350000.00	6.20	6	1	2026-04-15 15:33:26.387686
14	14	2025	1	320000.00	8.20	20	5	2026-04-15 15:33:26.387686
15	15	2025	1	580000.00	9.00	28	8	2026-04-15 15:33:26.387686
16	16	2025	1	290000.00	7.80	15	4	2026-04-15 15:33:26.387686
17	17	2025	1	210000.00	7.50	12	3	2026-04-15 15:33:26.387686
18	18	2025	1	45000.00	5.00	3	0	2026-04-15 15:33:26.387686
19	19	2025	1	180000.00	7.30	10	3	2026-04-15 15:33:26.387686
20	20	2025	1	3200000.00	9.30	52	12	2026-04-15 15:33:26.387686
21	21	2025	1	1450000.00	8.50	30	6	2026-04-15 15:33:26.387686
22	22	2025	1	2800000.00	9.10	48	10	2026-04-15 15:33:26.387686
23	23	2025	1	1950000.00	8.70	35	8	2026-04-15 15:33:26.387686
24	24	2025	1	1680000.00	8.40	28	6	2026-04-15 15:33:26.387686
25	25	2025	1	2100000.00	9.00	40	9	2026-04-15 15:33:26.387686
26	26	2025	1	750000.00	7.60	18	4	2026-04-15 15:33:26.387686
27	27	2025	1	380000.00	6.80	10	2	2026-04-15 15:33:26.387686
28	28	2025	1	620000.00	7.50	15	3	2026-04-15 15:33:26.387686
29	29	2025	1	120000.00	4.50	4	1	2026-04-15 15:33:26.387686
30	30	2025	1	890000.00	8.00	22	5	2026-04-15 15:33:26.387686
\.


--
-- Data for Name: fact_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_projects (id, partner_key, project_name, project_type, start_date, end_date, project_value, client_satisfaction_score, num_consultants, created_at) FROM stdin;
1	6	Core Banking Modernization	transformation	2024-06-01	2025-12-31	1200000.00	9.20	18	2026-04-15 15:33:26.390698
2	6	Mobile Banking App V3	développement	2025-01-15	2025-08-30	450000.00	8.80	8	2026-04-15 15:33:26.390698
3	6	Data Analytics Platform	data	2025-02-01	2025-10-31	380000.00	9.00	6	2026-04-15 15:33:26.390698
4	7	Cloud Migration Azure	infrastructure	2024-09-01	2025-06-30	680000.00	8.50	10	2026-04-15 15:33:26.390698
5	7	Cybersecurity Assessment	sécurité	2025-03-01	2025-05-31	120000.00	8.70	4	2026-04-15 15:33:26.390698
6	8	Smart Grid Management System	IoT	2024-07-01	2025-09-30	850000.00	8.40	12	2026-04-15 15:33:26.390698
7	8	Customer Portal Redesign	développement	2025-01-10	2025-07-31	320000.00	8.00	5	2026-04-15 15:33:26.390698
8	9	Revenue Management System	ERP	2024-10-01	2025-08-31	520000.00	7.90	8	2026-04-15 15:33:26.390698
9	9	Passenger Experience App	développement	2025-02-15	2025-11-30	280000.00	7.50	5	2026-04-15 15:33:26.390698
10	10	Supply Chain Optimization	consulting	2025-03-01	2025-12-31	420000.00	6.50	6	2026-04-15 15:33:26.390698
11	11	Digital Onboarding Platform	développement	2024-08-01	2025-05-31	550000.00	9.00	9	2026-04-15 15:33:26.390698
12	11	API Gateway Implementation	infrastructure	2025-01-01	2025-06-30	280000.00	8.60	4	2026-04-15 15:33:26.390698
13	11	Fraud Detection ML Pipeline	data	2025-03-15	2025-12-31	480000.00	8.90	7	2026-04-15 15:33:26.390698
14	12	Legacy System Modernization	transformation	2024-11-01	2025-10-31	720000.00	7.80	11	2026-04-15 15:33:26.390698
15	12	Regulatory Compliance Platform	développement	2025-02-01	2025-08-31	180000.00	8.10	3	2026-04-15 15:33:26.390698
16	20	Azure Landing Zone Setup	infrastructure	2025-01-01	2025-04-30	350000.00	9.40	5	2026-04-15 15:33:26.390698
17	20	Copilot Enterprise Rollout	transformation	2025-02-01	2025-07-31	280000.00	9.10	4	2026-04-15 15:33:26.390698
18	20	Power Platform CoE	consulting	2025-01-15	2025-12-31	420000.00	9.20	6	2026-04-15 15:33:26.390698
19	22	Multi-Account Strategy	infrastructure	2024-12-01	2025-05-31	480000.00	9.00	7	2026-04-15 15:33:26.390698
20	22	Serverless Migration	transformation	2025-03-01	2025-11-30	650000.00	8.80	9	2026-04-15 15:33:26.390698
21	23	BigQuery Data Lake	data	2025-01-10	2025-09-30	520000.00	8.70	7	2026-04-15 15:33:26.390698
22	23	GKE Platform Engineering	infrastructure	2025-02-15	2025-08-31	380000.00	8.50	5	2026-04-15 15:33:26.390698
23	24	CRM Implementation BIAT	CRM	2024-10-01	2025-06-30	680000.00	8.40	10	2026-04-15 15:33:26.390698
24	24	Marketing Cloud Setup	marketing	2025-03-01	2025-09-30	320000.00	8.20	4	2026-04-15 15:33:26.390698
25	25	S/4HANA Migration — Phase 1	ERP	2024-04-01	2025-03-31	1500000.00	9.10	22	2026-04-15 15:33:26.390698
26	25	SAP BTP Integration	intégration	2025-01-01	2025-08-31	380000.00	8.80	5	2026-04-15 15:33:26.390698
27	25	SAP Analytics Cloud Setup	data	2025-02-01	2025-06-30	220000.00	8.50	3	2026-04-15 15:33:26.390698
28	26	ITSM Implementation	ITSM	2025-01-01	2025-07-31	350000.00	7.80	5	2026-04-15 15:33:26.390698
29	26	HR Service Delivery Module	HR	2025-03-01	2025-09-30	200000.00	7.40	3	2026-04-15 15:33:26.390698
30	28	Lakehouse Architecture POC	data	2025-02-01	2025-05-31	180000.00	7.60	3	2026-04-15 15:33:26.390698
31	15	Network Analytics Dashboard	data	2025-01-15	2025-06-30	280000.00	8.90	4	2026-04-15 15:33:26.390698
32	21	HCI Infrastructure Refresh	infrastructure	2025-01-01	2025-04-30	450000.00	8.30	3	2026-04-15 15:33:26.390698
33	27	Data Sharing POC	data	2025-03-15	2025-06-30	120000.00	7.00	2	2026-04-15 15:33:26.390698
34	30	5G Core Network Consulting	consulting	2025-01-01	2025-12-31	580000.00	8.10	8	2026-04-15 15:33:26.390698
35	30	BSS/OSS Modernization	transformation	2024-09-01	2025-09-30	720000.00	7.90	10	2026-04-15 15:33:26.390698
\.


--
-- Data for Name: fact_university_recruitment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.fact_university_recruitment (id, partner_key, student_name, specialization, recruitment_type, start_date, satisfaction_score, converted_to_cdi, created_at) FROM stdin;
1	1	Yassine Ben Salah	Cloud & DevOps	stage PFE	2025-02-01	8.50	t	2026-04-15 15:33:26.391774
2	1	Amira Trabelsi	Data Engineering	stage PFE	2025-02-01	9.00	t	2026-04-15 15:33:26.391774
3	1	Mohamed Chaabane	Développement Full-Stack	stage PFE	2025-02-15	7.80	t	2026-04-15 15:33:26.391774
4	1	Fatma Bouazizi	Intelligence Artificielle	stage PFE	2025-03-01	9.20	t	2026-04-15 15:33:26.391774
5	1	Karim Dridi	Cybersécurité	alternance	2024-09-01	8.00	f	2026-04-15 15:33:26.391774
6	1	Sarra Hammami	Cloud & DevOps	alternance	2024-09-01	8.30	t	2026-04-15 15:33:26.391774
7	1	Omar Belhaj	Architecture Logicielle	stage été	2025-06-01	7.50	f	2026-04-15 15:33:26.391774
8	1	Ines Maaloul	Data Science	stage été	2025-06-01	8.80	t	2026-04-15 15:33:26.391774
9	1	Amine Jlassi	Développement Mobile	stage PFE	2025-02-01	7.20	f	2026-04-15 15:33:26.391774
10	1	Rania Gharbi	SAP Consulting	stage PFE	2025-03-01	8.60	t	2026-04-15 15:33:26.391774
11	2	Nizar Belhadj	Machine Learning	stage PFE	2025-02-01	9.10	t	2026-04-15 15:33:26.391774
12	2	Mariem Saidi	Big Data	stage PFE	2025-02-15	8.70	t	2026-04-15 15:33:26.391774
13	2	Aymen Khelifi	Systèmes Embarqués	stage PFE	2025-03-01	7.90	f	2026-04-15 15:33:26.391774
14	2	Hana Ben Amor	Cloud Computing	alternance	2024-09-01	8.40	t	2026-04-15 15:33:26.391774
15	2	Fares Mejri	Développement Java	stage été	2025-06-15	7.60	f	2026-04-15 15:33:26.391774
16	2	Yasmine Oueslati	Data Engineering	stage PFE	2025-02-01	8.90	t	2026-04-15 15:33:26.391774
17	2	Bilel Sfaxi	DevSecOps	alternance	2024-09-01	8.10	t	2026-04-15 15:33:26.391774
18	2	Sana Karoui	Architecture Cloud	stage PFE	2025-03-01	9.00	t	2026-04-15 15:33:26.391774
19	3	Anis Ghorbel	Génie Logiciel	stage PFE	2025-02-01	8.20	t	2026-04-15 15:33:26.391774
20	3	Eya Mansour	Réseaux & Télécom	stage PFE	2025-02-15	7.50	f	2026-04-15 15:33:26.391774
21	3	Wael Bouktif	Intelligence Artificielle	stage été	2025-06-01	8.00	t	2026-04-15 15:33:26.391774
22	3	Rim Tlili	Data Analytics	alternance	2024-09-01	7.80	f	2026-04-15 15:33:26.391774
23	3	Zied Dhaouadi	Développement Web	stage PFE	2025-03-01	7.30	f	2026-04-15 15:33:26.391774
24	3	Lina Brahim	Cloud Infrastructure	stage PFE	2025-02-01	8.50	t	2026-04-15 15:33:26.391774
25	4	Hamza Riahi	Informatique Fondamentale	stage PFE	2025-02-01	7.60	f	2026-04-15 15:33:26.391774
26	4	Salma Jaziri	Science des Données	stage PFE	2025-02-15	8.10	t	2026-04-15 15:33:26.391774
27	4	Raed Souissi	Développement Backend	stage été	2025-06-01	7.00	f	2026-04-15 15:33:26.391774
28	4	Manel Nasri	Sécurité Informatique	alternance	2024-09-01	7.40	f	2026-04-15 15:33:26.391774
29	4	Skander Ammar	Cloud & Virtualisation	stage PFE	2025-03-01	8.30	t	2026-04-15 15:33:26.391774
30	5	Chaima Elloumi	Business Intelligence	stage PFE	2025-02-01	7.80	t	2026-04-15 15:33:26.391774
31	5	Tarek Ben Hassen	Finance & Analytics	stage PFE	2025-02-15	7.20	f	2026-04-15 15:33:26.391774
32	5	Sonia Abidi	Marketing Digital	stage été	2025-06-01	7.50	f	2026-04-15 15:33:26.391774
33	5	Firas Bouslama	Consulting IT	alternance	2024-09-01	8.00	t	2026-04-15 15:33:26.391774
34	5	Nour Hamed	Gestion de Projet	stage PFE	2025-03-01	7.90	t	2026-04-15 15:33:26.391774
35	1	Ali Mabrouk	Microservices	stage PFE	2025-03-15	8.40	t	2026-04-15 15:33:26.391774
36	1	Khaoula Ferjani	QA Automation	alternance	2024-09-15	8.10	t	2026-04-15 15:33:26.391774
37	2	Rami Chouchane	Blockchain	stage PFE	2025-03-15	7.70	f	2026-04-15 15:33:26.391774
38	2	Maha Aouini	UX/UI Design	stage été	2025-07-01	8.30	f	2026-04-15 15:33:26.391774
39	3	Seif Guesmi	Performance Engineering	stage PFE	2025-03-15	8.00	t	2026-04-15 15:33:26.391774
40	1	Nessrine Haddad	SAP ABAP	stage PFE	2025-04-01	8.70	t	2026-04-15 15:33:26.391774
41	2	Oussama Ferchichi	Python & ML	stage PFE	2025-04-01	9.30	t	2026-04-15 15:33:26.391774
42	1	Haifa Zarrouk	Angular & React	stage été	2025-06-15	7.90	f	2026-04-15 15:33:26.391774
43	3	Mehdi Kammoun	Kubernetes Admin	alternance	2024-10-01	8.60	t	2026-04-15 15:33:26.391774
44	4	Rym Chebbi	Data Visualization	stage PFE	2025-04-01	7.80	t	2026-04-15 15:33:26.391774
45	5	Youssef Attia	ERP Consulting	stage PFE	2025-04-01	8.20	t	2026-04-15 15:33:26.391774
46	1	Rim Ayari	Salesforce Dev	stage PFE	2025-04-15	8.80	t	2026-04-15 15:33:26.391774
47	2	Ahmed Mathlouthi	AWS Solutions Architect	alternance	2024-10-15	9.10	t	2026-04-15 15:33:26.391774
48	3	Sirine Bouzid	Java Spring Boot	stage PFE	2025-04-15	7.60	f	2026-04-15 15:33:26.391774
49	1	Malek Turki	.NET Core	stage été	2025-07-01	8.00	f	2026-04-15 15:33:26.391774
50	2	Emna Laabidi	Power BI & Analytics	stage PFE	2025-04-15	8.50	t	2026-04-15 15:33:26.391774
\.


--
-- Name: dim_partner_partner_key_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.dim_partner_partner_key_seq', 30, true);


--
-- Name: fact_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_events_id_seq', 40, true);


--
-- Name: fact_partner_activity_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_partner_activity_id_seq', 30, true);


--
-- Name: fact_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_projects_id_seq', 35, true);


--
-- Name: fact_university_recruitment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.fact_university_recruitment_id_seq', 50, true);


--
-- Name: dim_partner dim_partner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.dim_partner
    ADD CONSTRAINT dim_partner_pkey PRIMARY KEY (partner_key);


--
-- Name: fact_events fact_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_events
    ADD CONSTRAINT fact_events_pkey PRIMARY KEY (id);


--
-- Name: fact_partner_activity fact_partner_activity_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_partner_activity
    ADD CONSTRAINT fact_partner_activity_pkey PRIMARY KEY (id);


--
-- Name: fact_projects fact_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_projects
    ADD CONSTRAINT fact_projects_pkey PRIMARY KEY (id);


--
-- Name: fact_university_recruitment fact_university_recruitment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_university_recruitment
    ADD CONSTRAINT fact_university_recruitment_pkey PRIMARY KEY (id);


--
-- Name: fact_events fact_events_partner_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_events
    ADD CONSTRAINT fact_events_partner_key_fkey FOREIGN KEY (partner_key) REFERENCES public.dim_partner(partner_key);


--
-- Name: fact_partner_activity fact_partner_activity_partner_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_partner_activity
    ADD CONSTRAINT fact_partner_activity_partner_key_fkey FOREIGN KEY (partner_key) REFERENCES public.dim_partner(partner_key);


--
-- Name: fact_projects fact_projects_partner_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_projects
    ADD CONSTRAINT fact_projects_partner_key_fkey FOREIGN KEY (partner_key) REFERENCES public.dim_partner(partner_key);


--
-- Name: fact_university_recruitment fact_university_recruitment_partner_key_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.fact_university_recruitment
    ADD CONSTRAINT fact_university_recruitment_partner_key_fkey FOREIGN KEY (partner_key) REFERENCES public.dim_partner(partner_key);


--
-- PostgreSQL database dump complete
--

\unrestrict wigcDjiN2hHW0bO0ObL8lP08BbbTzA5QxEhAEauwZShXaLaj7hfulYlWWbnXCee

