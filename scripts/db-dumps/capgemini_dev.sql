--
-- PostgreSQL database dump
--

\restrict yqhGH2hmR3gdCzBKnygHnF2eFai57QUCjbMMtCCJYIkI9zTeiiUHgf67ZsMInEQ

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

ALTER TABLE IF EXISTS ONLY public.vendor_projects DROP CONSTRAINT IF EXISTS vendor_projects_technology_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.university_partners DROP CONSTRAINT IF EXISTS university_partners_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.technology_partners DROP CONSTRAINT IF EXISTS technology_partners_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.student_recruitments DROP CONSTRAINT IF EXISTS student_recruitments_university_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_status_history DROP CONSTRAINT IF EXISTS partner_status_history_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_notifications DROP CONSTRAINT IF EXISTS partner_notifications_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_meetings DROP CONSTRAINT IF EXISTS partner_meetings_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_events DROP CONSTRAINT IF EXISTS partner_events_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_documents DROP CONSTRAINT IF EXISTS partner_documents_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.partner_contacts DROP CONSTRAINT IF EXISTS partner_contacts_partner_id_fkey;
ALTER TABLE IF EXISTS ONLY public.offers DROP CONSTRAINT IF EXISTS offers_partner_id_fkey;
DROP TRIGGER IF EXISTS update_vendor_projects_updated_at ON public.vendor_projects;
DROP TRIGGER IF EXISTS update_university_partners_updated_at ON public.university_partners;
DROP TRIGGER IF EXISTS update_technology_partners_updated_at ON public.technology_partners;
DROP TRIGGER IF EXISTS update_student_recruitments_updated_at ON public.student_recruitments;
DROP TRIGGER IF EXISTS update_partners_updated_at ON public.partners;
DROP TRIGGER IF EXISTS update_partner_contacts_updated_at ON public.partner_contacts;
DROP TRIGGER IF EXISTS update_offers_updated_at ON public.offers;
DROP INDEX IF EXISTS public.idx_vendor_projects_technology;
DROP INDEX IF EXISTS public.idx_vendor_projects_dates;
DROP INDEX IF EXISTS public.idx_student_recruitments_university;
DROP INDEX IF EXISTS public.idx_student_recruitments_dates;
DROP INDEX IF EXISTS public.idx_partners_status;
DROP INDEX IF EXISTS public.idx_partner_status_history_partner;
DROP INDEX IF EXISTS public.idx_partner_status_history_date;
DROP INDEX IF EXISTS public.idx_partner_notifications_type;
DROP INDEX IF EXISTS public.idx_partner_notifications_read;
DROP INDEX IF EXISTS public.idx_partner_notifications_partner;
DROP INDEX IF EXISTS public.idx_partner_meetings_partner;
DROP INDEX IF EXISTS public.idx_partner_meetings_date;
DROP INDEX IF EXISTS public.idx_partner_events_partner;
DROP INDEX IF EXISTS public.idx_partner_events_date;
DROP INDEX IF EXISTS public.idx_partner_documents_type;
DROP INDEX IF EXISTS public.idx_partner_documents_partner;
DROP INDEX IF EXISTS public.idx_partner_contacts_partner;
DROP INDEX IF EXISTS public.idx_offers_partner;
DROP INDEX IF EXISTS public.idx_offers_dates;
ALTER TABLE IF EXISTS ONLY public.vendor_projects DROP CONSTRAINT IF EXISTS vendor_projects_pkey;
ALTER TABLE IF EXISTS ONLY public.university_partners DROP CONSTRAINT IF EXISTS university_partners_pkey;
ALTER TABLE IF EXISTS ONLY public.technology_partners DROP CONSTRAINT IF EXISTS technology_partners_pkey;
ALTER TABLE IF EXISTS ONLY public.student_recruitments DROP CONSTRAINT IF EXISTS student_recruitments_pkey;
ALTER TABLE IF EXISTS ONLY public.partnership_requests DROP CONSTRAINT IF EXISTS partnership_requests_pkey;
ALTER TABLE IF EXISTS ONLY public.partners DROP CONSTRAINT IF EXISTS partners_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_status_history DROP CONSTRAINT IF EXISTS partner_status_history_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_notifications DROP CONSTRAINT IF EXISTS partner_notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_meetings DROP CONSTRAINT IF EXISTS partner_meetings_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_events DROP CONSTRAINT IF EXISTS partner_events_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_documents DROP CONSTRAINT IF EXISTS partner_documents_pkey;
ALTER TABLE IF EXISTS ONLY public.partner_contacts DROP CONSTRAINT IF EXISTS partner_contacts_pkey;
ALTER TABLE IF EXISTS ONLY public.offers DROP CONSTRAINT IF EXISTS offers_pkey;
ALTER TABLE IF EXISTS ONLY public.capgemini_employees DROP CONSTRAINT IF EXISTS capgemini_employees_pkey;
ALTER TABLE IF EXISTS ONLY public.capgemini_employees DROP CONSTRAINT IF EXISTS capgemini_employees_email_key;
ALTER TABLE IF EXISTS ONLY drizzle.__drizzle_migrations DROP CONSTRAINT IF EXISTS __drizzle_migrations_pkey;
ALTER TABLE IF EXISTS public.vendor_projects ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.student_recruitments ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partnership_requests ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partners ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_meetings ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_documents ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.partner_contacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.offers ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.capgemini_employees ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS drizzle.__drizzle_migrations ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.vendor_projects_id_seq;
DROP TABLE IF EXISTS public.vendor_projects;
DROP TABLE IF EXISTS public.university_partners;
DROP TABLE IF EXISTS public.technology_partners;
DROP SEQUENCE IF EXISTS public.student_recruitments_id_seq;
DROP TABLE IF EXISTS public.student_recruitments;
DROP SEQUENCE IF EXISTS public.partnership_requests_id_seq;
DROP TABLE IF EXISTS public.partnership_requests;
DROP SEQUENCE IF EXISTS public.partners_id_seq;
DROP TABLE IF EXISTS public.partners;
DROP SEQUENCE IF EXISTS public.partner_status_history_id_seq;
DROP TABLE IF EXISTS public.partner_status_history;
DROP SEQUENCE IF EXISTS public.partner_notifications_id_seq;
DROP TABLE IF EXISTS public.partner_notifications;
DROP SEQUENCE IF EXISTS public.partner_meetings_id_seq;
DROP TABLE IF EXISTS public.partner_meetings;
DROP SEQUENCE IF EXISTS public.partner_events_id_seq;
DROP TABLE IF EXISTS public.partner_events;
DROP SEQUENCE IF EXISTS public.partner_documents_id_seq;
DROP TABLE IF EXISTS public.partner_documents;
DROP SEQUENCE IF EXISTS public.partner_contacts_id_seq;
DROP TABLE IF EXISTS public.partner_contacts;
DROP SEQUENCE IF EXISTS public.offers_id_seq;
DROP TABLE IF EXISTS public.offers;
DROP SEQUENCE IF EXISTS public.capgemini_employees_id_seq;
DROP TABLE IF EXISTS public.capgemini_employees;
DROP SEQUENCE IF EXISTS drizzle.__drizzle_migrations_id_seq;
DROP TABLE IF EXISTS drizzle.__drizzle_migrations;
DROP FUNCTION IF EXISTS public.update_updated_at_column();
DROP TYPE IF EXISTS public.discount_type;
DROP SCHEMA IF EXISTS drizzle;
--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;


--
-- Name: discount_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.discount_type AS ENUM (
    'percentage',
    'fixed'
);


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;


--
-- Name: capgemini_employees; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.capgemini_employees (
    id integer NOT NULL,
    email character varying(100) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash text,
    salary numeric,
    phone character varying(50),
    department character varying(100),
    hire_date timestamp with time zone,
    CONSTRAINT capgemini_employees_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('manager'::character varying)::text, ('commercial'::character varying)::text, ('analyst'::character varying)::text, ('rh'::character varying)::text])))
);


--
-- Name: TABLE capgemini_employees; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.capgemini_employees IS 'Employés Capgemini ayant accès à la plateforme IntelliConnect';


--
-- Name: capgemini_employees_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.capgemini_employees_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: capgemini_employees_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.capgemini_employees_id_seq OWNED BY public.capgemini_employees.id;


--
-- Name: offers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.offers (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    discount_type public.discount_type NOT NULL,
    start_date date,
    end_date date,
    terms_conditions text,
    is_active boolean DEFAULT true,
    usage_count integer DEFAULT 0,
    total_value_tnd numeric(12,2) DEFAULT 0,
    target_audience character varying(100),
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: offers_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.offers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: offers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.offers_id_seq OWNED BY public.offers.id;


--
-- Name: partner_contacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_contacts (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    first_name character varying(100),
    last_name character varying(100),
    email character varying(100),
    phone character varying(20),
    role character varying(100),
    is_primary boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: partner_contacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_contacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_contacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_contacts_id_seq OWNED BY public.partner_contacts.id;


--
-- Name: partner_documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_documents (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    file_name character varying(255) NOT NULL,
    original_name character varying(255) NOT NULL,
    file_type character varying(100) NOT NULL,
    file_size bigint NOT NULL,
    file_path text NOT NULL,
    description text,
    uploaded_by character varying(200) NOT NULL,
    uploaded_by_type character varying(20) NOT NULL,
    uploaded_by_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_documents_id_seq OWNED BY public.partner_documents.id;


--
-- Name: partner_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_events (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    event_name character varying(255) NOT NULL,
    event_type character varying(100),
    event_date date NOT NULL,
    event_location character varying(255),
    num_participants integer,
    num_capgemini_attendees integer,
    num_leads_generated integer,
    num_conversions integer,
    event_budget integer,
    satisfaction_score integer,
    event_status character varying(50) DEFAULT 'planifie'::character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    event_revenue integer,
    roi_event double precision,
    CONSTRAINT partner_events_event_status_check CHECK (((event_status)::text = ANY (ARRAY[('planifie'::character varying)::text, ('en_cours'::character varying)::text, ('termine'::character varying)::text, ('annule'::character varying)::text]))),
    CONSTRAINT partner_events_satisfaction_score_check CHECK (((satisfaction_score >= 0) AND (satisfaction_score <= 100)))
);


--
-- Name: COLUMN partner_events.roi_event; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.partner_events.roi_event IS 'heya eventrevenue/eventbudget';


--
-- Name: partner_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_events_id_seq OWNED BY public.partner_events.id;


--
-- Name: partner_meetings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_meetings (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    title character varying(255) NOT NULL,
    meeting_date timestamp with time zone NOT NULL,
    duration_minutes integer NOT NULL,
    employee_name character varying(200) NOT NULL,
    employee_role character varying(100),
    employee_id integer,
    location character varying(255),
    meeting_type character varying(50) NOT NULL,
    agenda text,
    conclusions text,
    remarks text,
    agreements text,
    shared_documents text,
    satisfaction_score integer,
    next_steps text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_meetings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_meetings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_meetings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_meetings_id_seq OWNED BY public.partner_meetings.id;


--
-- Name: partner_notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_notifications (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    email_sent boolean DEFAULT false,
    email_subject character varying(255),
    is_read boolean DEFAULT false,
    sent_by character varying(200),
    sent_by_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_notifications_id_seq OWNED BY public.partner_notifications.id;


--
-- Name: partner_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_status_history (
    id integer NOT NULL,
    partner_id integer NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    change_reason text,
    changed_by character varying(100),
    changed_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: partner_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_status_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_status_history_id_seq OWNED BY public.partner_status_history.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id integer NOT NULL,
    categories character varying(200),
    name character varying(200) NOT NULL,
    legal_name character varying(200),
    tax_id character varying(50),
    website character varying(200),
    email character varying(100),
    phone character varying(20),
    address text,
    logo_url text,
    description text,
    partner_subcategory character varying(100),
    partnership_level character varying(50),
    partnership_start_date date,
    partnership_status character varying(50) DEFAULT 'actif'::character varying,
    annual_budget_tnd bigint,
    satisfaction_score integer,
    num_employees bigint,
    country character varying(100) DEFAULT 'Tunisie'::character varying,
    contract_end_date date,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    password_hash text,
    last_event_date date,
    annual_revenue_generated integer,
    CONSTRAINT partners_satisfaction_score_check CHECK (((satisfaction_score >= 0) AND (satisfaction_score <= 100)))
);


--
-- Name: TABLE partners; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.partners IS 'Hub central de tous les partenaires';


--
-- Name: COLUMN partners.categories; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.partners.categories IS 'Liste de toutes les catégories associées au partenaire (multi‑catégories)';


--
-- Name: COLUMN partners.contract_end_date; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.partners.contract_end_date IS 'Date de fin du contrat actuel (peut provenir de l''accord-cadre universitaire ou commercial)';


--
-- Name: partners_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partners_id_seq OWNED BY public.partners.id;


--
-- Name: partnership_requests; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partnership_requests (
    id integer NOT NULL,
    company_name character varying(255) NOT NULL,
    legal_name character varying(255),
    contact_first_name character varying(100) NOT NULL,
    contact_last_name character varying(100) NOT NULL,
    contact_email character varying(255) NOT NULL,
    contact_phone character varying(50),
    contact_role character varying(100),
    website character varying(255),
    description text,
    country character varying(100),
    address text,
    num_employees integer,
    annual_revenue character varying(100),
    category character varying(50) NOT NULL,
    partner_subcategory character varying(100),
    partnership_level character varying(50),
    motivations text,
    university_data jsonb,
    technology_data jsonb,
    status character varying(50) DEFAULT 'en_attente'::character varying,
    is_accepted boolean,
    reviewed_by integer,
    reviewed_at timestamp with time zone,
    rejection_reason text,
    created_partner_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: partnership_requests_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partnership_requests_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partnership_requests_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partnership_requests_id_seq OWNED BY public.partnership_requests.id;


--
-- Name: student_recruitments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.student_recruitments (
    id integer NOT NULL,
    university_partner_id integer NOT NULL,
    student_first_name character varying(100),
    student_last_name character varying(100),
    student_email character varying(100),
    student_phone character varying(50),
    recruitment_type character varying(50),
    contract_duration_months integer,
    start_date date NOT NULL,
    end_date date,
    degree_level character varying(50),
    specialization character varying(255),
    skills text[],
    assigned_project character varying(255),
    assigned_team character varying(100),
    manager_name character varying(255),
    performance_score integer,
    satisfaction_score integer,
    converted_to_cdi boolean DEFAULT false,
    cdi_start_date date,
    cdi_salary_range character varying(50),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    manager_email character varying(100),
    recruitment_cost real,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT student_recruitments_performance_score_check CHECK (((performance_score >= 1) AND (performance_score <= 5))),
    CONSTRAINT student_recruitments_recruitment_type_check CHECK (((recruitment_type)::text = ANY (ARRAY[('stage'::character varying)::text, ('alternance'::character varying)::text, ('vie'::character varying)::text, ('cdi_jeune_diplome'::character varying)::text, ('contrat_pro'::character varying)::text]))),
    CONSTRAINT student_recruitments_satisfaction_score_check CHECK (((satisfaction_score >= 0) AND (satisfaction_score <= 100)))
);


--
-- Name: student_recruitments_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.student_recruitments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: student_recruitments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.student_recruitments_id_seq OWNED BY public.student_recruitments.id;


--
-- Name: technology_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.technology_partners (
    partner_id integer NOT NULL,
    technologies text[],
    certifications_held integer,
    certification_level character varying(50),
    partnership_model character varying(50),
    commission_rate numeric(5,2),
    discount_rate numeric(5,2),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    vendor_type character varying(100),
    annual_revenue_generated numeric(18,0),
    num_projects_per_year integer,
    num_licenses_sold integer,
    comarketing_budget_annual integer,
    num_events_organized integer,
    has_master_agreement boolean DEFAULT false,
    agreement_signed_date date,
    agreement_renewal_date date,
    has_dedicated_support boolean DEFAULT false,
    support_sla_hours integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: university_partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.university_partners (
    partner_id integer NOT NULL,
    num_students integer,
    specialties text[],
    num_interns_per_year integer,
    num_apprentices_per_year integer,
    num_hires_per_year integer,
    conversion_rate_to_cdi numeric(5,2),
    average_hire_duration_months integer,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    institution_type character varying(100),
    annual_sponsorship_budget integer,
    budget_breakdown jsonb,
    num_events_per_year integer,
    last_event_date date,
    has_framework_agreement boolean DEFAULT false,
    agreement_signed_date date,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: vendor_projects; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.vendor_projects (
    id integer NOT NULL,
    technology_partner_id integer NOT NULL,
    project_name character varying(255) NOT NULL,
    project_description text,
    client_name character varying(255),
    project_type character varying(100),
    technologies_used text[],
    start_date date NOT NULL,
    end_date date,
    duration_months integer,
    project_value bigint,
    license_cost bigint,
    services_cost bigint,
    commission_earned integer,
    delivery_status character varying(50),
    delay_days integer,
    budget_variance_percentage numeric(5,2),
    client_satisfaction_score integer,
    num_consultants_capgemini integer,
    num_consultants_vendor integer,
    case_study_url character varying(500),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    notes text,
    project_status character varying(50) DEFAULT 'en_cours'::character varying,
    is_reference_project boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: vendor_projects_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.vendor_projects_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: vendor_projects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.vendor_projects_id_seq OWNED BY public.vendor_projects.id;


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);


--
-- Name: capgemini_employees id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capgemini_employees ALTER COLUMN id SET DEFAULT nextval('public.capgemini_employees_id_seq'::regclass);


--
-- Name: offers id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers ALTER COLUMN id SET DEFAULT nextval('public.offers_id_seq'::regclass);


--
-- Name: partner_contacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_contacts ALTER COLUMN id SET DEFAULT nextval('public.partner_contacts_id_seq'::regclass);


--
-- Name: partner_documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_documents ALTER COLUMN id SET DEFAULT nextval('public.partner_documents_id_seq'::regclass);


--
-- Name: partner_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_events ALTER COLUMN id SET DEFAULT nextval('public.partner_events_id_seq'::regclass);


--
-- Name: partner_meetings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_meetings ALTER COLUMN id SET DEFAULT nextval('public.partner_meetings_id_seq'::regclass);


--
-- Name: partner_notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_notifications ALTER COLUMN id SET DEFAULT nextval('public.partner_notifications_id_seq'::regclass);


--
-- Name: partner_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_status_history ALTER COLUMN id SET DEFAULT nextval('public.partner_status_history_id_seq'::regclass);


--
-- Name: partners id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners ALTER COLUMN id SET DEFAULT nextval('public.partners_id_seq'::regclass);


--
-- Name: partnership_requests id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_requests ALTER COLUMN id SET DEFAULT nextval('public.partnership_requests_id_seq'::regclass);


--
-- Name: student_recruitments id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_recruitments ALTER COLUMN id SET DEFAULT nextval('public.student_recruitments_id_seq'::regclass);


--
-- Name: vendor_projects id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_projects ALTER COLUMN id SET DEFAULT nextval('public.vendor_projects_id_seq'::regclass);


--
-- Data for Name: __drizzle_migrations; Type: TABLE DATA; Schema: drizzle; Owner: -
--

COPY drizzle.__drizzle_migrations (id, hash, created_at) FROM stdin;
4	474ee86b77a65925ac1807950bda1dfe30ceceee6cb40f138658a76be1cf7194	1774654068859
5	d13e6c98e5d72dffc826e80e25c8d5825ffebc909a012512f91b05888364de46	1774867153758
\.


--
-- Data for Name: capgemini_employees; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.capgemini_employees (id, email, first_name, last_name, role, is_active, created_at, password_hash, salary, phone, department, hire_date) FROM stdin;
1	karim.mejri@capgemini.com	Karim	Mejri	manager	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	4500	+216 71 123 456	Direction Partenariats	2020-03-15 00:00:00+01
5	sami.trabelsi@capgemini.com	Sami	Trabelsi	manager	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	4200	+216 71 567 890	Direction Partenariats	2019-11-20 00:00:00+01
4	nadia.haddad@capgemini.com	Nadia	Haddad	analyst	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	3800	+216 71 456 789	Analytics & BI	2021-09-15 00:00:00+01
6	mouna.baccar@capgemini.com	Mouna	Baccar	rh	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	3500	+216 71 678 901	Ressources Humaines	2022-04-01 00:00:00+01
7	khaled.maatoug@capgemini.com	Khaled	Maatoug	admin	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	5000	+216 71 789 012	Administration	2018-07-01 00:00:00+01
3	ahmed.gharbi@capgemini.com	Ahmed	Gharbi	commercial	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	3000	+216 71 345 678	Commercial	2022-01-10 00:00:00+01
2	leila.benali@capgemini.com	Leila	Ben Ali	commercial	t	2026-03-27 19:33:06.870989+01	$2b$10$PSQexP.kvQVZWobD0.CozO9hTzZxImws/RUoBiijYHDueuIH8qkQW	3200	+216 71 234 567	Commercial	2021-06-01 00:00:00+01
\.


--
-- Data for Name: offers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.offers (id, partner_id, title, description, discount_type, start_date, end_date, terms_conditions, is_active, usage_count, total_value_tnd, target_audience, created_at, updated_at) FROM stdin;
1	1	Programme de stages	Stages prioritaires pour les étudiants de Capgemini et leurs enfants	percentage	2025-01-01	2025-12-31	Sous réserve des prérequis académiques	t	120	60000.00	students	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
2	1	Alternance	Contrats d'apprentissage dans les filières IT	percentage	2019-01-01	2026-12-31	Sélection sur dossier	t	80	48000.00	students	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
3	2	Stages INSAT	Offres de stages PFE pour les élèves ingénieurs	percentage	2025-02-01	2025-06-30	Candidature via le bureau des stages	t	60	24000.00	students	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
4	3	Formation continue ENIT	10% de réduction sur les cours du soir pour employés Capgemini	percentage	2025-01-01	2028-12-31	Sur présentation de la carte employé	t	45	13500.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
5	4	Accès bibliothèque universitaire	Accès gratuit aux ressources numériques	percentage	2025-01-01	2028-12-31	Inscription préalable	t	150	7500.00	students	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
6	5	MBA Executive	15% de réduction sur le programme Executive MBA	percentage	2025-09-01	2026-06-30	Réservé aux cadres	t	20	40000.00	managers	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
7	6	Plateforme Pluxy	Accès à plus de 100 partenaires avec réductions exclusives	percentage	2025-01-01	2027-12-31	Inscription obligatoire sur la plateforme	t	300	9000.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
8	7	Forfaits mobiles	15% de réduction sur tous les forfaits mobiles	percentage	2025-03-01	2027-12-31	Engagement 12 mois	t	250	10000.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
9	8	Abonnement Gymway	20% de réduction sur l'abonnement annuel	percentage	2021-01-01	2028-12-31	Offre valable dans tous les clubs	t	90	10800.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
10	9	Remise parapharmacie	10% sur tous les produits	percentage	2025-01-01	2026-12-31	Sur présentation de la carte	t	110	2750.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
11	10	Beauté discount	5% de réduction sur les produits de beauté	percentage	2025-04-01	2026-09-30	Hors promotions en cours	t	95	1900.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
13	12	Cinéma 2 pour 1	Mercredi : une place achetée = une place offerte	percentage	2025-01-01	2031-12-31	Valable uniquement le mercredi	t	220	2640.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
14	13	Produits Délice	Échantillons gratuits chaque mois au siège	fixed	2025-01-01	2027-07-30	Distribution le premier lundi du mois	t	180	1800.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
15	14	Pack événementiel	15% de réduction sur les commandes de boissons pour événements internes	percentage	2025-01-01	2030-12-31	Sur devis	t	30	9000.00	managers	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
16	15	Internet fibre	20% de réduction sur les offres fibre	percentage	2025-02-01	2025-08-30	Nouveaux abonnés uniquement	t	140	9800.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
17	16	Azure discount	15% de réduction sur les services Azure	percentage	2025-01-01	2029-12-31	Offre réservée aux employés Capgemini	t	60	12000.00	IT	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
18	17	PC Dell	Prix préférentiel sur les gammes Latitude et XPS	fixed	2025-01-01	2026-06-30	Commande groupée	t	25	37500.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
19	18	Imprimantes HP	10% de réduction sur tout achat d'imprimante	percentage	2025-03-01	2026-05-19	Dans la limite des stocks	t	35	14000.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
20	19	Forfait entreprise	Remise de 15% sur les offres Internet Pro	percentage	2020-01-01	2028-12-31	Contrat minimum 1 an	t	70	7000.00	managers	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
21	20	Fournitures de bureau	10% de réduction sur la première commande	percentage	2025-01-01	2027-12-31	Code promo CAP2025	t	160	4800.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
22	21	Prêt immobilier	Taux préférentiel pour les employés Capgemini	percentage	2022-01-01	2029-12-31	Sous conditions de revenus	t	10	50000.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
23	22	Pack Découverte	Frais de tenue de compte offerts la première année	fixed	2025-01-01	2025-12-31	Nouveaux clients	t	50	4000.00	all	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
24	23	Audit énergétique	Diagnostic gratuit pour les locaux de Capgemini	fixed	2023-04-01	2025-10-30	Sur rendez-vous	t	15	9000.00	managers	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
25	24	Billet Tunisair	10% de réduction sur les vols domestiques	percentage	2019-05-01	2025-12-31	Réservation au moins 15j à l'avance	t	85	25500.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
26	25	Visite industrielle	Visite guidée du site de Gabès pour les équipes	fixed	2021-06-01	2026-09-30	Groupe de 10 personnes max	t	40	4000.00	employees	2026-03-27 16:59:03.867095+01	2026-03-29 23:29:29.423234+01
28	176	Test Offre	\N	percentage	2024-06-01	2024-12-31	\N	t	0	0.00	\N	2026-04-12 00:41:55.338484+01	2026-04-12 00:41:55.338484+01
29	1	Test Offre ESPRIT	\N	percentage	2026-01-01	2026-12-31	\N	t	0	0.00	Employés Capgemini	2026-04-12 14:05:06.743081+01	2026-04-12 14:05:06.743081+01
30	21	Test Offre BIAT	\N	percentage	2026-01-01	2026-12-31	\N	t	0	0.00	Employés Capgemini	2026-04-12 14:05:07.512367+01	2026-04-12 14:05:07.512367+01
31	6	Test Offre Pluxee	\N	percentage	2026-01-01	2026-12-31	\N	t	0	0.00	Employés Capgemini	2026-04-12 14:05:07.919143+01	2026-04-12 14:05:07.919143+01
32	16	Test Offre Microsoft	\N	percentage	2026-01-01	2026-12-31	\N	t	0	0.00	Employés Capgemini	2026-04-12 14:05:08.212362+01	2026-04-12 14:05:08.212362+01
\.


--
-- Data for Name: partner_contacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_contacts (id, partner_id, first_name, last_name, email, phone, role, is_primary, created_at, updated_at) FROM stdin;
1	1	Leila	Ben Salah	leila.bensalah@esprit.tn	+216 98 765 432	Responsable Relations Entreprises	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
2	2	Mohamed	Gharbi	mohamed.gharbi@insat.rnu.tn	+216 97 123 456	Coordinateur Stages	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
3	3	Sami	Trabelsi	sami.trabelsi@enit.rnu.tn	+216 99 456 789	Directeur des Partenariats	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
4	4	Nadia	Haddad	nadia.haddad@utm.rnu.tn	+216 23 456 789	Chef de Bureau Alternance	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
5	5	Karim	Mabrouk	karim.mabrouk@ihec.rnu.tn	+216 22 333 444	Responsable Carrières	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
6	6	Amel	Jaziri	amel.jaziri@pluxy.tn	+216 55 666 777	Account Manager	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
7	6	Ahmed	Khelil	ahmed.khelil@pluxy.tn	+216 24 555 666	Support Partenariats	f	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
8	7	Olfa	Chaouch	olfa.chaouch@freeoui.tn	+216 98 111 222	Responsable Grands Comptes	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
9	8	Riadh	Bouzid	riadh.bouzid@gymway.tn	+216 97 222 333	Directeur Commercial	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
10	9	Sonia	Mekki	sonia.mekki@lafayette.tn	+216 20 123 456	Responsable Marketing	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
11	10	Fathi	Guesmi	fathi.guesmi@leparadispharma.tn	+216 50 987 654	Gérant	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
13	12	Hichem	Ben Amor	hichem.benamor@carthagecinema.tn	+216 54 123 789	Directeur	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
14	13	Salma	Douik	salma.douik@delice.tn	+216 21 987 654	Responsable Marketing	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
15	14	Walid	Jamoussi	walid.jamoussi@cocacola.tn	+216 24 567 890	Coordinateur Partenariats	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
16	15	Mouna	Baccar	mouna.baccar@orange.tn	+216 22 123 456	Responsable Grands Comptes	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
17	16	Khaled	Maatoug	khaled.maatoug@microsoft.tn	+216 98 888 777	Partner Account Manager	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
18	17	Amira	Ferchichi	amira.ferchichi@dell.tn	+216 50 111 222	Commerciale	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
19	18	Med Ali	Slim	medali.slim@hp.tn	+216 23 333 444	Responsable Ventes	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
20	19	Hela	Mami	hela.mami@tt.tn	+216 70 123 123	Responsable Partenariats	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
21	20	Ridha	Chennoufi	ridha.chennoufi@bureauco.tn	+216 71 357 159	Directeur Commercial	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
22	21	Lamiae	Zoghlami	lamiae.zoghlami@biat.tn	+216 71 340 000	Responsable Relations Clientèles	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
23	22	Nizar	Chakroun	nizar.chakroun@amenbank.tn	+216 71 351 155	Directeur Commercial	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
24	23	Mourad	Gharbi	mourad.gharbi@steg.com.tn	+216 71 341 311	Chef de Projet Partenariats	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
25	24	Samar	Jemai	samar.jemai@tunisair.com.tn	+216 71 700 700	Responsable Marketing	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
26	25	Aymen	Bouhlel	aymen.bouhlel@gct.com.tn	+216 71 350 000	Coordinateur Partenariats	t	2026-03-27 16:59:03.867095+01	2026-03-27 16:59:03.867095+01
28	176	Test	Contact	test@test.com	\N	\N	f	2026-04-12 00:41:44.876532+01	2026-04-12 00:41:44.876532+01
29	1	Test	ESPRIT	test.university@test.com	\N	Test Contact	f	2026-04-12 14:05:07.25581+01	2026-04-12 14:05:07.25581+01
30	21	Test	BIAT	test.customer@test.com	\N	Test Contact	f	2026-04-12 14:05:07.573684+01	2026-04-12 14:05:07.573684+01
31	6	Test	Pluxee	test.marketing@test.com	\N	Test Contact	f	2026-04-12 14:05:07.976704+01	2026-04-12 14:05:07.976704+01
32	16	Test	Microsoft	test.supplier@test.com	\N	Test Contact	f	2026-04-12 14:05:08.267459+01	2026-04-12 14:05:08.267459+01
\.


--
-- Data for Name: partner_documents; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_documents (id, partner_id, file_name, original_name, file_type, file_size, file_path, description, uploaded_by, uploaded_by_type, uploaded_by_id, created_at) FROM stdin;
1	1	b586bfa5038d38ebed70221e.png	Capture d'écran 2026-01-31 201246.png	image/png	554748	/uploads/documents/b586bfa5038d38ebed70221e.png	Projet	ESPRIT (École Supérieure Privée d'Ingénierie et de Technologie)	partner	1	2026-04-14 17:49:12.382907+01
\.


--
-- Data for Name: partner_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_events (id, partner_id, event_name, event_type, event_date, event_location, num_participants, num_capgemini_attendees, num_leads_generated, num_conversions, event_budget, satisfaction_score, event_status, created_at, updated_at, notes, event_revenue, roi_event) FROM stdin;
1	1	Forum Emploi ESPRIT	forum_emploi	2025-02-15	ESPRIT Campus, Ariana	450	12	35	8	12000	88	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Très bonne affluence, 8 stagiaires recrutés (dont 4 en CDI par la suite). Feedback positif des étudiants.	40000	233
2	1	Hackathon IA & Cybersécurité	hackathon	2026-09-20	ESPRIT Innovation Hub, Ariana	80	5	10	2	8000	92	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Objectif : détecter des talents en IA et cybersécurité. Co-organisé avec Microsoft. Programme : 2 jours, 8 équipes, challenges réels. Cible : 80 participants, 10 leads, 2 stages.	10000	25
3	1	Journée Carrières ESPRIT 	forum_emploi	2026-05-10	ESPRIT Campus	400	10	28	6	10000	85	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Forum annuel de recrutement. Objectif : rencontrer 400 étudiants, générer 30 candidatures et pourvoir 7 stages. Stands Capgemini, conférences.	30000	200
4	2	Forum INSATech	forum_emploi	2025-03-10	INSAT Tunis	300	8	28	6	10000	85	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	6 stagiaires recrutés. Excellente qualité des profils.	30000	200
5	2	Webinaire Cloud Azure	webinar	2026-10-05	En ligne	120	4	15	3	5000	90	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Webinaire technique sur Azure avec Microsoft. Cible : 120 étudiants ingénieurs. Objectif : 15 leads et 3 stages.	15000	200
6	2	Hackathon Data Science	hackathon	2024-11-20	INSAT Tunis	60	3	8	2	6000	82	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	2 projets innovants, mais peu de conversions en stage.	10000	67
7	3	Conférence ENIT & Industrie 4.0	conference	2024-12-05	ENIT Tunis	200	6	15	3	12000	78	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Participation modérée, 3 stages proposés mais seulement 1 accepté.	5000	-58
8	3	Workshop Énergie Durable	workshop	2027-01-15	ENIT Labo Énergie	50	3	6	1	4000	85	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Workshop avec STEG sur les énergies renouvelables. Objectif : 1 stage ou projet collaboratif.	5000	25
9	3	Forum Emploi ENIT	forum_emploi	2026-10-10	ENIT Tunis	350	10	25	5	15000	88	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Forum annuel. Cible : 350 étudiants, 25 CV retenus, 5 stages pourvus.	25000	67
10	4	Journée Métiers UTEM	forum_emploi	2025-01-20	UTEM Campus, Tunis	250	5	18	4	8000	80	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	4 stagiaires recrutés, mais 2 ont abandonné en cours. À améliorer!!!.	12000	50
11	4	Webinaire Finance & Assurance	webinar	2026-06-10	En ligne	80	2	10	2	3000	85	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Avec BIAT et Amen Bank. 2 CDI potentiels.	20000	567
12	5	Forum Carrières IHEC	forum_emploi	2025-02-28	IHEC Carthage	300	7	22	5	10000	87	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	5 stagiaires en marketing et finance. Bonne adéquation profils.	25000	150
13	5	Workshop Marketing Digital	workshop	2026-10-20	IHEC Carthage	40	2	8	2	4000	90	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Avec Orange Tunisie. Objectif : former 40 étudiants, 2 alternances.	10000	150
14	6	Pluxy Employee Perks Day	conference	2026-06-10	Pluxy HQ, Les Berges du Lac	300	15	40	12	20000	95	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Lancement de nouvelles offres. Objectif : 300 participants, 40 leads, 12 souscriptions.	60000	200
15	6	Webinaire Avantages Employés	webinar	2024-11-15	En ligne	150	8	25	5	8000	88	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	5 nouveaux inscrits. Bon retour des participants.	25000	213
16	7	FreeOui Mobile Roadshow	conference	2026-07-05	Centre Urbain Nord, Tunis	200	10	30	8	12000	87	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Présentation des forfaits 5G. Cible : 200 employés, 30 leads, 8 conversions.	40000	233
17	8	Gymway Corporate Challenge	hackathon	2026-05-20	Gymway Lac, Tunis	150	12	25	10	8000	92	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Compétition sportive inter-entreprises. Objectif : 10 nouveaux abonnements.	50000	525
18	9	Journée Bien-être	conference	2025-03-20	Centre Commercial Lafayette	120	6	20	5	5000	85	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	5 employés ont utilisé la réduction. Bonne affluence.	15000	200
20	12	Cinéma en plein air	conference	2026-08-01	Carthage Cinéma, Ennasr	400	15	50	8	10000	90	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Projection gratuite. challenge:8 tickets 2 pour 1 vendus.	24000	140
22	15	Orange Fibre Day	conference	2025-04-20	Orange Lab, Tunis	180	12	35	10	15000	88	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	10 abonnements fibre souscrits. Bonne organisation. Bravo a tous	50000	233
23	16	Azure Innovation Day	conference	2026-06-10	Hôtel Africa Tunis	150	20	25	5	25000	94	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Co-organisé avec Microsoft. 5 nouveaux projets minimum  Azure a signer.	250000	900
24	16	Microsoft 365 Copilot Webinar	webinar	2025-02-20	En ligne	300	15	40	8	10000	92	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	8 entreprises clientes ont adopté Copilot.	80000	700
25	17	Dell Tech Show	conference	2026-06-22	Dell Showroom, Tunis	80	10	12	3	8000	88	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Présentation des nouvelles gammes XPS. objectif:3 commandes a grouper soon.	30000	275
26	18	HP Print Workshop	workshop	2025-03-18	HP Tunis	40	5	6	1	4000	82	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Démonstration imprimantes. 1 commande passée.	8000	100
27	19	TT Business Day	conference	2024-09-05	TT Centre, Tunis	120	8	20	4	15000	90	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Offres fibre pro. 4 nouveaux contrats.	60000	300
28	21	BIAT Innovation Day	conference	2025-06-25	BIAT Siège, Tunis	120	12	0	0	18000	88	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Présentation des solutions Capgemini. Pas de leads directs mais renforcement relation.	0	-100
29	22	Amen Bank Tech Meetup	conference	2026-06-18	Amen Bank, Tunis	80	8	0	0	10000	85	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Focus sur la digitalisation.	0	-100
30	23	STEG Énergie Durable	conference	2026-07-30	STEG Tunis	100	6	0	0	15000	90	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Présentation des audits énergétiques.	0	-100
31	24	Tunisair Open Day	forum_emploi	2027-07-10	Aéroport Tunis-Carthage	200	10	5	1	12000	82	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Recrutement de personnel navigant. les employés Capgemini doivent postuler.	5000	-58
32	25	Visite industrielle GCT Gabès	workshop	2026-11-05	Gabès	30	4	0	0	5000	75	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Groupe de 10 personnes. Intérêt limité pour des collaborations futures.	0	-100
33	10	Journée Beauté Le Paradis	conference	2026-06-05	Le Paradis, Tunis	80	4	12	3	3000	80	planifie	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Offres sur les produits de beauté. objectif: minimum 3 employés doivent acheter.	9000	200
34	14	Coca-Cola Refresh Day	conference	2025-07-25	Coca-Cola Msaken	60	5	10	2	6000	85	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Dégustation et commandes groupées pour événements internes.	10000	67
35	20	Salon Bureau & Co	conference	2025-11-15	Charguia, Tunis	200	4	10	2	10000	80	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Présentation de nouveaux mobiliers. 2 commandes pour bureaux.	20000	100
21	13	Dégustation produits Délice	conference	2025-01-15	Siège Capgemini Tunis	200	200	0	0	3000	95	termine	2026-03-29 16:52:55.160618+01	2026-03-29 16:52:55.160618+01	Distribution d’échantillons. Très bonne réception, pas de leads directs.	0	-100
36	176	Test Event	\N	2024-06-15	Tunis	\N	\N	\N	\N	\N	\N	planifie	2026-04-12 00:41:55.435578+01	2026-04-12 00:41:55.435578+01	\N	\N	\N
37	1	Test Event ESPRIT	\N	2026-06-15	Tunis	50	\N	\N	\N	5000	\N	planifie	2026-04-12 14:05:07.005199+01	2026-04-12 14:05:07.005199+01	\N	\N	\N
38	21	Test Event BIAT	\N	2026-06-15	Tunis	50	\N	\N	\N	5000	\N	planifie	2026-04-12 14:05:07.544874+01	2026-04-12 14:05:07.544874+01	\N	\N	\N
39	6	Test Event Pluxee	\N	2026-06-15	Tunis	50	\N	\N	\N	5000	\N	planifie	2026-04-12 14:05:07.946698+01	2026-04-12 14:05:07.946698+01	\N	\N	\N
40	16	Test Event Microsoft	\N	2026-06-15	Tunis	50	\N	\N	\N	5000	\N	planifie	2026-04-12 14:05:08.239508+01	2026-04-12 14:05:08.239508+01	\N	\N	\N
\.


--
-- Data for Name: partner_meetings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_meetings (id, partner_id, title, meeting_date, duration_minutes, employee_name, employee_role, employee_id, location, meeting_type, agenda, conclusions, remarks, agreements, shared_documents, satisfaction_score, next_steps, created_at) FROM stdin;
1	16	Revue trimestrielle Microsoft - Q1 2026	2026-01-15 10:00:00+01	90	Karim Mejri	manager	1	Siège Capgemini Tunis - Salle Carthage	presentiel	Bilan Q4 2025, Roadmap licences Azure 2026, Renouvellement contrat Gold Partner	Migration Azure validée pour 15 clients. Objectif 30% réduction coûts cloud atteint. Renouvellement Gold Partner confirmé pour 3 ans.	Microsoft propose un programme de co-marketing digital pour la région Maghreb. Excellente collaboration sur les projets cloud.	Renouvellement Gold Partner 3 ans signé. Budget co-marketing augmenté de 40%. SLA support réduit à 2h.	Contrat_Gold_Partner_2026.pdf, Roadmap_Azure_Q1_2026.pptx, Budget_CoMarketing_2026.xlsx	9	Planifier formation équipe sur Azure AI Services avant fin mars	2026-04-14 18:17:45.499273+01
2	3	Réunion convention de stage ENIT 2026	2026-02-10 14:00:00+01	60	Mouna Baccar	rh	6	Campus ENIT - Bureau du doyen	presentiel	Bilan stages 2025, Quota stagiaires 2026, Nouveaux programmes de recherche	Convention renouvelée : 25 stages PFE + 10 alternances pour 2026. Programme de mentorat lancé avec 5 enseignants ENIT.	Le doyen souhaite étendre la collaboration aux projets de recherche appliquée en IA et cybersécurité.	Convention cadre 2026-2028 signée. 25 stages PFE, 10 alternances, 3 projets recherche conjoints.	Convention_Stage_ENIT_2026.pdf, Liste_Projets_PFE_2026.docx, Programme_Mentorat.pdf	8	Envoyer offres de stage avant le 1er mars. Organiser journée portes ouvertes Capgemini pour étudiants ENIT	2026-04-14 18:17:45.499273+01
3	21	Kick-off projet digitalisation BIAT	2026-03-05 09:30:00+01	120	Ahmed Gharbi	commercial	3	Siège BIAT - Salle de conférence	presentiel	Présentation équipe projet, Planning macro, Architecture technique, Risques et mitigations	Projet de 18 mois validé. Équipe de 12 consultants Capgemini dédiés. Budget total 2.4M TND. Phase 1 : Core Banking modernization.	Client très exigeant sur les délais. Nécessité d'un PMO senior dédié. Environnement legacy complexe.	Contrat signé pour 18 mois. Jalons trimestriels avec revue Go/No-Go. Pénalités de retard de 2% par semaine.	SOW_BIAT_Digitalisation_2026.pdf, Architecture_Technique_v1.pptx, Planning_Macro.mpp, RACI_Matrix.xlsx	7	Démarrer Phase 1 le 15 mars. Recruter 3 développeurs Java senior supplémentaires	2026-04-14 18:17:45.499273+01
4	5	Séminaire innovation IHEC - Capgemini	2026-02-20 11:00:00+01	75	Leila Ben Ali	commercial	2	Visioconférence Teams	visioconference	Présentation programme innovation 2026, Hackatons étudiants, Programme ambassadeurs campus	Partenariat innovation validé : 2 hackathons/an, 1 chaire de recherche Data Science, programme ambassadeurs avec 10 étudiants.	IHEC très motivé par le programme ambassadeurs. Potentiel de recrutement excellent pour profils finance-tech.	Programme ambassadeurs IHEC-Capgemini lancé. Budget hackathon : 15K TND/événement. Chaire recherche : 50K TND/an.	Programme_Ambassadeurs_IHEC.pdf, Budget_Innovation_2026.xlsx	8	Organiser premier hackathon avant fin avril. Sélectionner les 10 ambassadeurs	2026-04-14 18:17:45.499273+01
5	14	Point campagne marketing Coca-Cola Ramadan 2026	2026-03-01 15:00:00+01	45	Sami Trabelsi	manager	5	Appel téléphonique	telephonique	Avancement campagne digitale Ramadan, KPIs mi-parcours, Ajustements budget	Campagne digitale performante : +45% engagement vs 2025. ROI provisoire : 3.2x. Recommandation augmenter budget réseaux sociaux de 20%.	Coca-Cola satisfait des résultats. Souhaite étendre le partenariat aux campagnes été 2026.	Augmentation budget social media +20%. Extension campagne été 2026 en discussion. KPI final à livrer le 30 avril.	Dashboard_KPI_Ramadan_2026.pdf, Rapport_MiParcours.pptx	9	Livrer rapport final campagne Ramadan. Préparer proposition campagne été	2026-04-14 18:17:45.499273+01
6	25	Audit technique infrastructure GCT	2026-01-25 08:30:00+01	150	Khaled Maatoug	admin	7	Site industriel GCT Gabès	presentiel	Audit infrastructure IT, Évaluation sécurité, Recommandations modernisation	Infrastructure vieillissante nécessitant une refonte complète. 47 vulnérabilités critiques identifiées. Plan de remédiation sur 12 mois proposé.	Urgence sécurité : plusieurs systèmes non patchés depuis 2 ans. Direction GCT consciente du risque mais budget limité.	Plan de remédiation sécurité 12 mois validé. Phase urgente (3 mois) : 350K TND. Phase complète : 1.2M TND.	Rapport_Audit_GCT_2026.pdf, Plan_Remediation_Securite.xlsx, Vulnerabilites_Critiques.docx	6	Démarrer remédiation urgente semaine prochaine. Former équipe IT GCT sur bonnes pratiques sécurité	2026-04-14 18:17:45.499273+01
7	16	Workshop Azure AI Services	2026-03-20 10:00:00+01	180	Karim Mejri	manager	1	Centre formation Capgemini - Les Berges du Lac	presentiel	Formation Azure OpenAI, Démos Copilot, Use cases clients tunisiens	Formation réussie : 20 consultants certifiés Azure AI. 3 POC clients identifiés. Microsoft fournit 50K USD crédits Azure gratuits.	Forte demande client pour solutions IA générative. Microsoft très satisfait de l'engagement Capgemini Tunisie.	50K USD crédits Azure pour POC. 3 POC à démarrer en avril. Programme certification AI accéléré.	Support_Formation_AzureAI.pdf, Certificats_Azure_AI.zip, POC_Proposals.docx	10	Démarrer les 3 POC avant fin avril. Planifier certification avancée pour juin	2026-04-14 18:17:45.499273+01
8	9	Bilan campagne influence Lafayette	2026-02-28 16:00:00+01	60	Leila Ben Ali	commercial	2	Visioconférence Meet	visioconference	Résultats campagne influenceurs, ROI, Retours clients, Prochaines étapes	Campagne influenceurs Q1 : 2.3M impressions, 180K engagements, +22% trafic web. ROI : 4.1x. Meilleure campagne depuis début partenariat.	Lafayette très satisfait. Souhaite doubler le budget pour Q2. Possibilité d'étendre aux réseaux TikTok.	Budget Q2 doublé à 40K TND. Ajout TikTok au mix média. Objectif : 5M impressions Q2.	Rapport_Campagne_Q1_Lafayette.pdf, Analytics_Dashboard.xlsx	9	Préparer stratégie TikTok. Soumettre plan média Q2 avant le 15 mars	2026-04-14 18:17:45.499273+01
\.


--
-- Data for Name: partner_notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_notifications (id, partner_id, type, title, message, email_sent, email_subject, is_read, sent_by, sent_by_id, created_at) FROM stdin;
1	16	email	Renouvellement Gold Partner confirmé	Cher partenaire Microsoft Tunisie, nous avons le plaisir de vous confirmer le renouvellement de notre statut Gold Partner pour la période 2026-2029. Le contrat signé lors de notre réunion du 15 janvier est désormais effectif. Nous vous remercions pour cette collaboration fructueuse.	t	Renouvellement Gold Partner Capgemini-Microsoft 2026-2029	f	Karim Mejri	1	2026-01-16 09:00:00+01
2	16	meeting	Compte-rendu : Revue trimestrielle Q1 2026	Le compte-rendu de notre réunion du 15 janvier est disponible. Points clés : Migration Azure validée, Renouvellement Gold Partner 3 ans, Budget co-marketing +40%. Prochaine étape : Formation Azure AI Services le 20 mars.	t	CR Réunion Microsoft-Capgemini Q1 2026	t	Karim Mejri	1	2026-01-17 10:00:00+01
3	16	document	Nouveau document partagé : Roadmap Azure 2026	Le document Roadmap_Azure_Q1_2026.pptx a été ajouté à votre espace documentaire. Ce document contient le planning détaillé des migrations cloud prévues pour le premier semestre 2026.	t	Nouveau document - Roadmap Azure Q1 2026	t	Karim Mejri	1	2026-01-20 14:30:00+01
4	16	email	Invitation Workshop Azure AI Services - 20 mars	Vous êtes cordialement invité au Workshop Azure AI Services organisé conjointement par Capgemini Tunisie et Microsoft le 20 mars 2026 au Centre de formation Capgemini, Les Berges du Lac. Programme : Formation Azure OpenAI, Démonstrations Copilot, Use cases clients tunisiens. Durée : 3 heures.	t	Workshop Azure AI Services - 20 mars 2026	t	Karim Mejri	1	2026-03-01 08:00:00+01
5	3	email	Convention de stage 2026 signée	Madame, Monsieur, nous vous confirmons la signature de la convention cadre de stage 2026-2028 entre Capgemini Tunisie et l'ENIT. Cette convention prévoit 25 stages PFE, 10 alternances et 3 projets de recherche conjoints. Les offres de stage seront publiées avant le 1er mars 2026.	t	Convention Stage ENIT-Capgemini 2026-2028 signée	f	Mouna Baccar	6	2026-02-12 10:00:00+01
6	3	meeting	Compte-rendu : Convention de stage ENIT	CR de la réunion du 10 février 2026 au campus ENIT. Principaux accords : Convention 2026-2028 signée, 25 stages PFE + 10 alternances, programme de mentorat avec 5 enseignants, extension recherche IA et cybersécurité.	t	CR Réunion Convention Stage ENIT - Feb 2026	t	Mouna Baccar	6	2026-02-13 09:00:00+01
7	3	system	Publication offres de stage PFE 2026	Les 25 offres de stage PFE Capgemini pour l'année universitaire 2025-2026 viennent d'être publiées. Domaines : Développement (10 postes), Data/IA (8 postes), Cloud (4 postes), Cybersécurité (3 postes). Date limite de candidature : 31 mars 2026.	f	\N	f	Système IntelliConnect	\N	2026-02-28 08:00:00+01
8	21	email	Lancement projet digitalisation BIAT	Suite à notre réunion de kick-off du 5 mars, nous vous confirmons le lancement officiel du projet de digitalisation BIAT. L'équipe de 12 consultants Capgemini sera opérationnelle dès le 15 mars. Le premier jalon (Core Banking Assessment) est fixé au 30 avril 2026.	t	Kick-off Projet Digitalisation BIAT - Confirmation	f	Ahmed Gharbi	3	2026-03-06 09:00:00+01
9	21	document	Documents projet partagés	Les documents suivants ont été ajoutés à votre espace : SOW_BIAT_Digitalisation_2026.pdf, Architecture_Technique_v1.pptx, Planning_Macro.mpp, RACI_Matrix.xlsx. Merci de les consulter et revenir vers nous pour validation.	t	Projet BIAT - Documents partagés	f	Ahmed Gharbi	3	2026-03-07 11:00:00+01
10	21	status_change	Statut partenariat mis à jour	Le statut de votre partenariat avec Capgemini Tunisie a été mis à jour de 'en négociation' à 'actif' suite à la signature du contrat de digitalisation.	t	Mise à jour statut partenariat BIAT-Capgemini	t	Système IntelliConnect	\N	2026-03-10 10:00:00+01
11	5	email	Programme ambassadeurs IHEC-Capgemini lancé	Nous avons le plaisir d'annoncer le lancement du programme ambassadeurs IHEC-Capgemini. 10 étudiants sélectionnés bénéficieront de mentorat, de projets réels et de priorité pour les stages et embauches. Le premier hackathon est prévu fin avril 2026.	t	Lancement Programme Ambassadeurs IHEC-Capgemini	f	Leila Ben Ali	2	2026-02-22 10:00:00+01
12	5	meeting	CR Séminaire innovation IHEC-Capgemini	Compte-rendu du séminaire du 20 février. Décisions : 2 hackathons/an, 1 chaire Data Science (50K TND/an), programme ambassadeurs 10 étudiants, budget hackathon 15K TND/événement.	t	CR Séminaire Innovation IHEC-Capgemini - Feb 2026	t	Leila Ben Ali	2	2026-02-21 14:00:00+01
13	14	email	Résultats mi-parcours campagne Ramadan 2026	Résultats intermédiaires campagne digitale Ramadan : +45% engagement vs 2025, ROI provisoire 3.2x. Recommandation : augmenter budget réseaux sociaux de 20% pour maximiser l'impact fin Ramadan.	t	Campagne Ramadan 2026 - Résultats mi-parcours	t	Sami Trabelsi	5	2026-03-02 09:00:00+01
14	14	general	Proposition campagne été 2026	Suite aux excellents résultats de la campagne Ramadan, nous vous proposons d'étendre notre collaboration à une campagne été 2026. Budget estimé : 80K TND. Objectifs : 8M impressions, +30% trafic web. Détails de la proposition à suivre.	f	\N	f	Sami Trabelsi	5	2026-03-15 10:00:00+01
15	25	email	Rapport audit sécurité GCT	Suite à notre audit du 25 janvier, nous vous transmettons le rapport complet. 47 vulnérabilités critiques identifiées. Plan de remédiation proposé : Phase urgente 3 mois (350K TND) + Phase complète 12 mois (1.2M TND). Nous recommandons de démarrer la phase urgente immédiatement.	t	Rapport Audit Sécurité IT - GCT Gabès	f	Khaled Maatoug	7	2026-01-28 09:00:00+01
16	25	system	Démarrage remédiation urgente sécurité	La phase de remédiation urgente des vulnérabilités critiques a démarré ce jour. Durée prévue : 3 mois. Équipe dédiée : 4 consultants cybersécurité Capgemini. Premier rapport d'avancement prévu le 15 février.	f	\N	f	Système IntelliConnect	\N	2026-02-01 08:00:00+01
17	9	email	Bilan campagne influenceurs Q1 2026	Excellente nouvelle ! La campagne influenceurs Q1 2026 a généré 2.3M impressions et 180K engagements avec un ROI de 4.1x. C'est notre meilleure campagne depuis le début du partenariat. Nous recommandons de doubler le budget pour Q2 et d'ajouter TikTok au mix média.	t	Bilan Campagne Influenceurs Q1 - Lafayette	t	Leila Ben Ali	2	2026-03-01 10:00:00+01
18	9	meeting	CR bilan campagne Lafayette Q1	Résumé réunion du 28 février. Performance exceptionnelle Q1. Budget Q2 doublé à 40K TND. Ajout TikTok. Objectif Q2 : 5M impressions.	t	CR Réunion Lafayette - Bilan Q1 2026	t	Leila Ben Ali	2	2026-03-01 16:00:00+01
\.


--
-- Data for Name: partner_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_status_history (id, partner_id, old_status, new_status, change_reason, changed_by, changed_at) FROM stdin;
2	1	prospect	en_negociation	Réunion avec responsable	karim.mejri@capgemini.com	2018-08-20 00:00:00+01
3	1	en_negociation	actif	Signature accord-cadre	leila.benali@capgemini.com	2018-09-01 00:00:00+01
4	1	actif	inactif	Baisse satisfaction (65)	sami.trabelsi@capgemini.com	2025-03-01 00:00:00+01
5	1	inactif	actif	Audit satisfaisant	sami.trabelsi@capgemini.com	2025-03-20 00:00:00+01
7	2	prospect	en_negociation	Réunion avec coordinateur	ahmed.gharbi@capgemini.com	2018-12-20 00:00:00+01
8	2	en_negociation	actif	Signature convention	karim.mejri@capgemini.com	2019-01-15 00:00:00+01
10	3	prospect	en_negociation	Entretien avec directrice	karim.mejri@capgemini.com	2018-05-10 00:00:00+01
11	3	en_negociation	actif	Accord cadre signé	leila.benali@capgemini.com	2018-06-01 00:00:00+01
13	4	prospect	en_negociation	Présentation à la faculté	karim.mejri@capgemini.com	2017-02-10 00:00:00+01
14	4	en_negociation	actif	Signature accord-cadre	karim.mejri@capgemini.com	2017-03-01 00:00:00+01
16	5	prospect	en_negociation	Visite de l'école	leila.benali@capgemini.com	2019-08-20 00:00:00+01
17	5	en_negociation	actif	Convention de stage	karim.mejri@capgemini.com	2019-09-15 00:00:00+01
19	16	prospect	en_negociation	Négociation globale	khaled.maatoug@capgemini.com	2014-11-15 00:00:00+01
20	16	en_negociation	actif	Master Agreement signé	khaled.maatoug@capgemini.com	2015-01-01 00:00:00+01
22	17	prospect	en_negociation	Réunion avec Dell	ahmed.gharbi@capgemini.com	2018-05-15 00:00:00+01
23	17	en_negociation	actif	Accord de revente	karim.mejri@capgemini.com	2018-06-01 00:00:00+01
25	18	prospect	en_negociation	Test produit	leila.benali@capgemini.com	2018-12-10 00:00:00+01
26	18	en_negociation	actif	Signature contrat	karim.mejri@capgemini.com	2019-01-15 00:00:00+01
28	19	prospect	en_negociation	Négociation SLAs	karim.mejri@capgemini.com	2016-11-15 00:00:00+01
29	19	en_negociation	actif	Contrat signé	karim.mejri@capgemini.com	2017-01-01 00:00:00+01
31	20	prospect	en_negociation	Visite showroom	ahmed.gharbi@capgemini.com	2019-11-15 00:00:00+01
32	20	en_negociation	actif	Première commande	karim.mejri@capgemini.com	2020-01-01 00:00:00+01
34	21	prospect	en_negociation	Proposition de services	khaled.maatoug@capgemini.com	2015-05-15 00:00:00+01
35	21	en_negociation	actif	Contrat cadre	khaled.maatoug@capgemini.com	2015-06-01 00:00:00+01
1	1	Lead / Suspect	prospect	Contact initial via forum	karim.mejri@capgemini.com	2018-08-01 00:00:00+01
6	2	Lead / Suspect	prospect	Candidature spontanée	ahmed.gharbi@capgemini.com	2018-12-01 00:00:00+01
9	3	Lead / Suspect	prospect	Recommandation INSAT	karim.mejri@capgemini.com	2018-04-01 00:00:00+01
12	4	Lead / Suspect	prospect	Contact par le ministère	karim.mejri@capgemini.com	2017-01-15 00:00:00+01
15	5	Lead / Suspect	prospect	Candidature par l'IHEC	leila.benali@capgemini.com	2019-07-01 00:00:00+01
18	16	Lead / Suspect	prospect	Contact via Microsoft France	khaled.maatoug@capgemini.com	2014-10-01 00:00:00+01
21	17	Lead / Suspect	prospect	Prospection commerciale	ahmed.gharbi@capgemini.com	2018-04-01 00:00:00+01
24	18	Lead / Suspect	prospect	Contact via salon	leila.benali@capgemini.com	2018-11-01 00:00:00+01
27	19	Lead / Suspect	prospect	Appel d'offres	karim.mejri@capgemini.com	2016-10-01 00:00:00+01
30	20	Lead / Suspect	prospect	Recommandation interne	ahmed.gharbi@capgemini.com	2019-10-01 00:00:00+01
33	21	Lead / Suspect	prospect	Relation historique	khaled.maatoug@capgemini.com	2015-04-01 00:00:00+01
36	174	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-11-28 00:00:00+01
37	174	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2021-03-28 00:00:00+01
38	174	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2021-04-16 00:00:00+01
39	174	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2021-09-09 00:00:00+01
40	172	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-08-26 00:00:00+01
41	172	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2020-12-20 00:00:00+01
42	172	En négociation	Actif	Le contrat a été signé et le partenariat est actif.	Système / Workflow IA	2021-01-31 00:00:00+01
43	173	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2023-07-18 00:00:00+01
44	173	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2023-12-04 00:00:00+01
45	170	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2019-09-25 00:00:00+01
46	171	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-06-16 00:00:00+01
47	171	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2021-12-11 00:00:00+01
48	171	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2022-05-08 00:00:00+01
49	171	Inactif	Actif	Le partenariat a été réactivé.	Système / Workflow IA	2022-08-08 00:00:00+01
50	4	Inconnu	Actif	Les nouvelles données confirment une activité en cours.	Système / Workflow IA	2025-01-01 00:00:00+01
51	169	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-05-14 00:00:00+01
52	169	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2021-09-24 00:00:00+01
53	168	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-11-21 00:00:00+01
54	168	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2020-03-09 00:00:00+01
55	24	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-10-11 00:00:00+01
56	24	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2023-03-21 00:00:00+01
57	19	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-10-19 00:00:00+01
58	19	Prospect	Inactif	Plusieurs tentatives de contact sont restées sans réponse.	Système / Workflow IA	2021-03-24 00:00:00+01
59	19	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2026-01-01 00:00:00+01
60	167	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-09-12 00:00:00+01
61	167	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2022-12-10 00:00:00+01
62	166	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-07-17 00:00:00+01
63	166	Prospect	Inactif	Aucune réponse n’a été obtenue de la part du prospect.	Système / Workflow IA	2021-01-05 00:00:00+01
64	166	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2025-09-13 00:00:00+01
65	165	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2023-02-23 00:00:00+01
66	165	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2023-05-08 00:00:00+01
67	165	En négociation	Inactif	Le partenaire s’est retiré des discussions.	Système / Workflow IA	2023-10-22 00:00:00+01
68	165	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2024-01-05 00:00:00+01
69	164	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2020-05-02 00:00:00+01
70	163	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-12-08 00:00:00+01
71	163	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2021-04-24 00:00:00+01
72	163	En négociation	Inactif	Les échanges ont cessé sans conclusion.	Système / Workflow IA	2021-07-07 00:00:00+01
73	163	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2021-12-06 00:00:00+01
74	162	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-01-08 00:00:00+01
75	162	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-01-27 00:00:00+01
76	162	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2020-07-08 00:00:00+01
77	161	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-04-21 00:00:00+01
78	161	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2022-10-07 00:00:00+01
79	161	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2022-11-09 00:00:00+01
80	160	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2010-02-02 00:00:00+01
81	160	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2010-05-31 00:00:00+01
82	159	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-07-22 00:00:00+01
83	159	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-10-19 00:00:00+01
84	159	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2021-02-28 00:00:00+01
85	159	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2021-07-02 00:00:00+01
86	158	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2023-01-20 00:00:00+01
87	158	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2023-03-08 00:00:00+01
88	158	Actif	Inactif	L’engagement a fortement diminué.	Système / Workflow IA	2023-06-02 00:00:00+01
89	158	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2026-02-26 00:00:00+01
90	157	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-07-12 00:00:00+01
91	157	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2021-09-01 00:00:00+01
92	157	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2022-02-25 00:00:00+01
93	157	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2022-07-11 00:00:00+01
94	23	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-11-26 00:00:00+01
95	23	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2022-07-01 00:00:00+01
96	23	Actif	Inactif	Le partenaire n’est plus actif opérationnellement.	Système / Workflow IA	2022-07-01 00:00:00+01
97	23	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2022-07-01 00:00:00+01
98	156	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-04-15 00:00:00+01
99	156	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2020-07-16 00:00:00+01
100	156	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2020-08-04 00:00:00+01
101	156	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2020-12-27 00:00:00+01
102	155	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-02-07 00:00:00+01
103	155	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2022-03-27 00:00:00+01
104	155	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2022-07-29 00:00:00+01
105	154	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-10-24 00:00:00+01
106	154	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2022-04-13 00:00:00+01
107	154	Actif	Terminé	Le contrat est arrivé à son terme.	Système / Workflow IA	2026-02-28 00:00:00+01
108	153	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-08-03 00:00:00+01
109	153	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2020-11-27 00:00:00+01
110	152	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-11-22 00:00:00+01
111	152	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2020-12-16 00:00:00+01
112	151	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2022-03-23 00:00:00+01
113	150	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-06-26 00:00:00+01
114	150	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2019-10-11 00:00:00+01
115	150	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2019-11-05 00:00:00+01
116	149	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-10-23 00:00:00+01
117	149	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2020-04-16 00:00:00+01
118	148	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-09-07 00:00:00+01
119	148	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2021-02-28 00:00:00+01
120	148	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2021-05-14 00:00:00+01
121	147	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-04-15 00:00:00+01
122	147	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2019-08-19 00:00:00+01
123	147	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2019-11-23 00:00:00+01
124	147	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2019-12-15 00:00:00+01
125	146	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2018-11-28 00:00:00+01
126	146	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2019-05-14 00:00:00+01
127	114	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-04-30 00:00:00+01
128	114	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2021-10-12 00:00:00+01
129	114	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2022-03-17 00:00:00+01
130	114	Inactif	Actif	Le partenaire s’est de nouveau engagé.	Système / Workflow IA	2022-08-09 00:00:00+01
131	145	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-06-22 00:00:00+01
132	145	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2021-10-30 00:00:00+01
133	144	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2021-12-08 00:00:00+01
134	143	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-02-23 00:00:00+01
135	143	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2020-07-10 00:00:00+01
136	143	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2020-12-28 00:00:00+01
137	143	Actif	Terminé	Le contrat est arrivé à son terme.	Système / Workflow IA	2026-01-31 00:00:00+01
138	142	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-03-12 00:00:00+01
139	142	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2023-07-31 00:00:00+01
140	142	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2023-09-26 00:00:00+01
141	141	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-12-06 00:00:00+01
142	141	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-05-17 00:00:00+01
143	141	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2020-07-13 00:00:00+01
144	140	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-10-23 00:00:00+01
145	140	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2021-04-20 00:00:00+01
146	140	Actif	Inactif	La relation a été interrompue temporairement.	Système / Workflow IA	2021-07-12 00:00:00+01
147	140	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2023-01-03 00:00:00+01
148	139	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-06-16 00:00:00+01
149	139	Prospect	Inactif	Le prospect a été classé inactif par manque d’intérêt.	Système / Workflow IA	2022-08-04 00:00:00+01
150	138	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-03-17 00:00:00+01
151	138	Prospect	Inactif	L’opportunité n’est plus poursuivie.	Système / Workflow IA	2021-06-16 00:00:00+01
152	138	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2025-06-13 00:00:00+01
153	137	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-12-18 00:00:00+01
154	137	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-01-30 00:00:00+01
155	137	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2020-06-23 00:00:00+01
156	137	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2020-08-08 00:00:00+01
157	136	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-08-03 00:00:00+01
158	136	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2021-11-20 00:00:00+01
159	135	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-06-23 00:00:00+01
160	135	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2020-11-16 00:00:00+01
161	135	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2021-03-04 00:00:00+01
162	135	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2021-04-18 00:00:00+01
163	6	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2024-10-06 00:00:00+01
164	6	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2025-03-30 00:00:00+01
165	6	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2025-08-05 00:00:00+01
166	133	Inconnu	Actif	Les nouvelles données confirment une activité en cours.	Système / Workflow IA	2023-02-24 00:00:00+01
167	132	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-07-04 00:00:00+01
168	132	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2021-09-21 00:00:00+01
169	132	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2021-12-02 00:00:00+01
170	9	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-09-10 00:00:00+01
171	9	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2021-11-09 00:00:00+01
172	131	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2025-04-25 00:00:00+01
173	131	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2025-05-14 00:00:00+01
174	130	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-11-28 00:00:00+01
175	130	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-05-09 00:00:00+01
176	130	En négociation	Inactif	Les échanges ont cessé sans conclusion.	Système / Workflow IA	2020-08-06 00:00:00+01
177	129	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-02-06 00:00:00+01
178	129	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2021-06-28 00:00:00+01
179	15	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-07-18 00:00:00+01
180	15	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2023-08-30 00:00:00+01
181	15	Actif	Inactif	Le contrat est arrivé à échéance sans renouvellement.	Système / Workflow IA	2023-11-04 00:00:00+01
182	15	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2024-01-01 00:00:00+01
183	128	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-01-17 00:00:00+01
184	128	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2019-03-11 00:00:00+01
185	128	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2019-06-18 00:00:00+01
186	116	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2010-12-22 00:00:00+01
187	127	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-03-22 00:00:00+01
188	127	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2020-07-26 00:00:00+01
189	127	Actif	Inactif	Le partenaire n’est plus actif opérationnellement.	Système / Workflow IA	2020-09-27 00:00:00+01
190	127	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2022-06-14 00:00:00+01
191	126	Inconnu	Inactif	Aucune information fiable n’est disponible.	Système / Workflow IA	2012-01-04 00:00:00+01
192	125	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-04-05 00:00:00+01
193	125	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2021-09-17 00:00:00+01
194	124	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-10-13 00:00:00+01
195	124	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-02-26 00:00:00+01
196	124	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2021-07-07 00:00:00+01
197	122	Inconnu	Inactif	Aucune information fiable n’est disponible.	Système / Workflow IA	2020-12-07 00:00:00+01
198	121	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-11-17 00:00:00+01
199	121	Prospect	Inactif	Plusieurs tentatives de contact sont restées sans réponse.	Système / Workflow IA	2019-12-13 00:00:00+01
200	121	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2024-12-31 00:00:00+01
201	120	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-05-21 00:00:00+01
202	120	Prospect	Inactif	Le prospect n’est plus engagé dans les échanges.	Système / Workflow IA	2022-09-24 00:00:00+01
203	120	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2025-02-28 00:00:00+01
204	119	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-09-10 00:00:00+01
205	119	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-02-11 00:00:00+01
206	119	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2022-04-11 00:00:00+01
207	123	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-08-06 00:00:00+01
208	123	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2020-10-11 00:00:00+01
209	123	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2021-03-08 00:00:00+01
210	123	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2021-07-08 00:00:00+01
211	118	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-07-15 00:00:00+01
212	118	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2023-10-15 00:00:00+01
213	118	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2024-02-04 00:00:00+01
214	118	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2024-07-27 00:00:00+01
215	117	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-01-09 00:00:00+01
216	117	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2022-02-17 00:00:00+01
217	117	Actif	Inactif	La relation a été interrompue temporairement.	Système / Workflow IA	2022-07-09 00:00:00+01
218	117	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2026-03-27 00:00:00+01
219	115	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-11-15 00:00:00+01
220	115	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2022-12-12 00:00:00+01
221	115	Actif	Inactif	La relation a été interrompue temporairement.	Système / Workflow IA	2023-04-30 00:00:00+01
222	115	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2026-01-30 00:00:00+01
223	113	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-12-08 00:00:00+01
224	113	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-01-29 00:00:00+01
225	113	En négociation	Inactif	Les échanges ont cessé sans conclusion.	Système / Workflow IA	2020-02-18 00:00:00+01
226	113	Inactif	Actif	La collaboration a repris après une période d’inactivité.	Système / Workflow IA	2020-06-14 00:00:00+01
227	112	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-04-16 00:00:00+01
228	112	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2022-09-06 00:00:00+01
229	112	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2023-01-19 00:00:00+01
230	16	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2020-11-26 00:00:00+01
231	111	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-01-27 00:00:00+01
232	111	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2019-04-06 00:00:00+01
233	111	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2019-06-01 00:00:00+01
234	111	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2019-10-21 00:00:00+01
235	110	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-08-23 00:00:00+01
236	110	Prospect	Actif	Un contrat a été signé, activant officiellement le partenariat.	Système / Workflow IA	2021-12-30 00:00:00+01
237	108	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-06-09 00:00:00+01
238	108	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2020-08-02 00:00:00+01
239	108	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2020-10-23 00:00:00+01
240	107	Inconnu	Actif	Les nouvelles données confirment une activité en cours.	Système / Workflow IA	2016-07-29 00:00:00+01
241	105	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-05-16 00:00:00+01
242	105	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2023-08-25 00:00:00+01
243	105	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2023-12-30 00:00:00+01
244	105	Inactif	Actif	Le partenariat a été réactivé.	Système / Workflow IA	2024-01-20 00:00:00+01
245	10	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2025-10-28 00:00:00+01
246	10	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2025-01-24 00:00:00+01
247	10	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2025-01-24 00:00:00+01
248	10	Actif	Terminé	Le contrat est arrivé à son terme.	Système / Workflow IA	2025-01-24 00:00:00+01
249	104	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-03-12 00:00:00+01
250	104	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2020-07-24 00:00:00+01
251	104	En négociation	Actif	Le contrat a été signé et le partenariat est actif.	Système / Workflow IA	2020-08-13 00:00:00+01
252	103	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-10-28 00:00:00+01
253	103	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2021-04-07 00:00:00+01
254	103	En négociation	Inactif	Les échanges ont cessé sans conclusion.	Système / Workflow IA	2021-09-04 00:00:00+01
255	103	Inactif	Actif	Un nouvel accord a été signé.	Système / Workflow IA	2022-02-25 00:00:00+01
256	102	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2021-12-30 00:00:00+01
257	101	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-09-17 00:00:00+01
258	101	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2021-01-25 00:00:00+01
259	101	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2021-05-25 00:00:00+01
260	101	Actif	Terminé	Date de fin de contrat atteinte et partenariat clôturé.	Système / Workflow IA	2026-01-31 00:00:00+01
261	100	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-04-07 00:00:00+01
262	100	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2021-06-19 00:00:00+01
263	100	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2021-07-22 00:00:00+01
264	99	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2024-01-06 00:00:00+01
265	99	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2024-02-28 00:00:00+01
266	98	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-07-28 00:00:00+01
267	98	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2024-01-24 00:00:00+01
268	97	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-05-17 00:00:00+01
269	97	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-06-27 00:00:00+01
270	97	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2022-08-12 00:00:00+01
271	96	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-08-07 00:00:00+01
272	96	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2020-01-18 00:00:00+01
273	2	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-11-10 00:00:00+01
274	2	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2023-12-28 00:00:00+01
275	2	Actif	Inactif	Le partenaire n’est plus actif opérationnellement.	Système / Workflow IA	2024-03-26 00:00:00+01
276	95	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-01-29 00:00:00+01
277	95	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2020-06-24 00:00:00+01
278	94	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-04-05 00:00:00+01
279	94	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2020-05-25 00:00:00+01
280	94	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2020-07-21 00:00:00+01
281	5	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-11-03 00:00:00+01
282	5	Prospect	Inactif	Le dossier a été mis en pause faute de retour.	Système / Workflow IA	2023-01-13 00:00:00+01
283	5	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2025-01-01 00:00:00+01
284	93	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-11-09 00:00:00+01
285	93	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-12-19 00:00:00+01
286	93	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2022-02-21 00:00:00+01
287	92	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2018-11-09 00:00:00+01
288	92	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2018-12-03 00:00:00+01
289	92	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2018-12-24 00:00:00+01
290	92	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2019-04-24 00:00:00+01
291	109	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2017-04-12 00:00:00+01
292	109	Prospect	Inactif	L’opportunité n’est plus poursuivie.	Système / Workflow IA	2017-06-11 00:00:00+01
293	109	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2023-06-04 00:00:00+01
294	90	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-03-01 00:00:00+01
295	90	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2019-05-07 00:00:00+01
296	90	En négociation	Inactif	Le partenaire s’est retiré des discussions.	Système / Workflow IA	2019-08-14 00:00:00+01
297	90	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2019-12-25 00:00:00+01
298	18	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-07-21 00:00:00+01
299	18	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2022-12-16 00:00:00+01
300	89	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-09-26 00:00:00+01
301	89	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2023-02-04 00:00:00+01
302	89	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2023-03-21 00:00:00+01
303	89	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2023-08-22 00:00:00+01
304	88	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-12-15 00:00:00+01
305	88	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2021-05-24 00:00:00+01
306	88	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2021-07-14 00:00:00+01
307	88	Inactif	Actif	Le partenaire s’est de nouveau engagé.	Système / Workflow IA	2021-10-20 00:00:00+01
308	8	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2025-10-25 00:00:00+01
309	8	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2026-03-08 00:00:00+01
310	87	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-07-05 00:00:00+01
311	87	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2021-12-18 00:00:00+01
312	87	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2022-01-05 00:00:00+01
313	35	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-11-18 00:00:00+01
314	35	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2023-02-18 00:00:00+01
315	35	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2023-04-22 00:00:00+01
316	86	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-07-24 00:00:00+01
317	86	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2020-10-30 00:00:00+01
318	86	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2021-02-15 00:00:00+01
319	86	Inactif	Actif	La collaboration a repris après une période d’inactivité.	Système / Workflow IA	2021-06-01 00:00:00+01
320	85	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2023-10-23 00:00:00+01
321	85	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2023-12-08 00:00:00+01
322	84	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-02-14 00:00:00+01
323	84	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2023-04-30 00:00:00+01
324	83	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-08-22 00:00:00+01
325	83	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2021-01-24 00:00:00+01
326	83	En négociation	Inactif	Le partenaire s’est retiré des discussions.	Système / Workflow IA	2021-04-23 00:00:00+01
327	83	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2021-10-02 00:00:00+01
328	82	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-03-20 00:00:00+01
329	82	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2021-09-06 00:00:00+01
330	25	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-11-12 00:00:00+01
331	25	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-03-28 00:00:00+01
332	25	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2022-06-14 00:00:00+01
333	7	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2024-12-28 00:00:00+01
334	80	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-06-01 00:00:00+01
335	80	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2020-08-12 00:00:00+01
336	80	Actif	Inactif	Le partenariat a été suspendu faute d’activité.	Système / Workflow IA	2020-11-04 00:00:00+01
337	80	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2025-07-26 00:00:00+01
338	81	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2021-12-22 00:00:00+01
339	79	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-11-15 00:00:00+01
340	79	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2021-01-29 00:00:00+01
341	79	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2021-07-17 00:00:00+01
342	79	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2021-08-30 00:00:00+01
343	78	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-05-05 00:00:00+01
344	78	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-10-16 00:00:00+01
345	78	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2023-01-04 00:00:00+01
346	77	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-03-01 00:00:00+01
347	77	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2020-04-24 00:00:00+01
348	77	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2020-10-02 00:00:00+01
349	76	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-06-01 00:00:00+01
350	76	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2021-11-17 00:00:00+01
351	76	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2022-04-30 00:00:00+01
352	76	Inactif	Actif	Le partenariat a été réactivé.	Système / Workflow IA	2022-05-30 00:00:00+01
353	75	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-12-03 00:00:00+01
354	75	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2022-03-12 00:00:00+01
355	75	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2022-04-05 00:00:00+01
356	75	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2022-06-24 00:00:00+01
357	1	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-11-07 00:00:00+01
358	1	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2020-01-14 00:00:00+01
359	1	Actif	Terminé	Le contrat est arrivé à son terme.	Système / Workflow IA	2024-01-01 00:00:00+01
360	74	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-09-03 00:00:00+01
361	74	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2019-10-25 00:00:00+01
362	74	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2020-04-08 00:00:00+01
363	73	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-05-15 00:00:00+01
364	73	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2023-08-10 00:00:00+01
365	73	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2023-12-27 00:00:00+01
366	134	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-08-19 00:00:00+01
367	134	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2023-01-08 00:00:00+01
368	134	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2023-04-19 00:00:00+01
369	3	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2025-05-14 00:00:00+01
370	3	Prospect	Inactif	Plusieurs tentatives de contact sont restées sans réponse.	Système / Workflow IA	2025-06-17 00:00:00+01
371	72	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-08-31 00:00:00+01
372	72	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2020-09-29 00:00:00+01
373	72	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2020-12-26 00:00:00+01
374	72	Inactif	Actif	La collaboration a repris après une période d’inactivité.	Système / Workflow IA	2021-06-02 00:00:00+01
375	71	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-01-25 00:00:00+01
376	71	Prospect	Actif	Toutes les étapes d’intégration ont été complétées avec succès.	Système / Workflow IA	2021-06-16 00:00:00+01
377	70	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-10-16 00:00:00+01
378	70	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2021-11-12 00:00:00+01
379	70	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2022-04-28 00:00:00+01
380	70	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2022-06-04 00:00:00+01
381	69	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2024-06-17 00:00:00+01
382	69	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2024-08-14 00:00:00+01
383	68	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-11-08 00:00:00+01
384	68	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2023-01-17 00:00:00+01
385	68	Actif	Inactif	Le partenaire n’est plus actif opérationnellement.	Système / Workflow IA	2023-03-18 00:00:00+01
386	68	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2026-02-05 00:00:00+01
387	67	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-03-15 00:00:00+01
388	67	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2020-07-24 00:00:00+01
389	67	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2020-08-09 00:00:00+01
390	67	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2020-09-25 00:00:00+01
391	66	Inconnu	Actif	Les nouvelles données confirment une activité en cours.	Système / Workflow IA	2022-08-14 00:00:00+01
392	17	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2024-01-25 00:00:00+01
393	17	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2024-07-13 00:00:00+01
394	17	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2024-12-17 00:00:00+01
395	17	Actif	Terminé	Date de fin de contrat atteinte et partenariat clôturé.	Système / Workflow IA	2025-06-01 00:00:00+01
396	65	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2018-11-24 00:00:00+01
397	65	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2019-05-21 00:00:00+01
398	65	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2019-09-06 00:00:00+01
399	65	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2019-12-30 00:00:00+01
400	13	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2024-05-09 00:00:00+01
401	13	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2024-09-19 00:00:00+01
402	13	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2024-12-22 00:00:00+01
403	64	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-08-17 00:00:00+01
404	64	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2023-10-29 00:00:00+01
405	63	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-03-22 00:00:00+01
406	63	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-05-19 00:00:00+01
407	63	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2021-08-29 00:00:00+01
408	62	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-07-05 00:00:00+01
409	62	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2022-08-27 00:00:00+01
410	62	En négociation	Actif	Les conditions ont été acceptées et appliquées.	Système / Workflow IA	2022-09-29 00:00:00+01
411	61	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-12-13 00:00:00+01
412	61	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2021-03-18 00:00:00+01
413	61	En négociation	Actif	Les négociations ont abouti à un accord.	Système / Workflow IA	2021-07-03 00:00:00+01
414	57	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-08-03 00:00:00+01
415	57	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2022-01-25 00:00:00+01
416	58	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2023-04-05 00:00:00+01
417	58	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2023-05-25 00:00:00+01
418	56	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2022-02-11 00:00:00+01
419	55	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2023-01-14 00:00:00+01
420	14	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-09-06 00:00:00+01
421	14	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2022-02-11 00:00:00+01
422	54	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-05-20 00:00:00+01
423	54	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2022-11-05 00:00:00+01
424	53	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-03-22 00:00:00+01
425	53	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2019-05-07 00:00:00+01
426	53	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2019-08-07 00:00:00+01
427	53	Inactif	Actif	Le partenaire s’est de nouveau engagé.	Système / Workflow IA	2019-11-01 00:00:00+01
428	91	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2018-01-04 00:00:00+01
429	91	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2018-06-03 00:00:00+01
430	91	Actif	Terminé	Date de fin de contrat atteinte et partenariat clôturé.	Système / Workflow IA	2024-03-11 00:00:00+01
431	52	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2019-11-16 00:00:00+01
432	52	Prospect	Actif	Le prospect a été converti en partenaire actif après validation de l’accord.	Système / Workflow IA	2019-12-14 00:00:00+01
433	52	Actif	Terminé	Date de fin de contrat atteinte et partenariat clôturé.	Système / Workflow IA	2026-02-28 00:00:00+01
434	51	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-03-24 00:00:00+01
435	51	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2021-04-22 00:00:00+01
436	51	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2021-08-18 00:00:00+01
437	12	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-07-26 00:00:00+01
438	12	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-08-19 00:00:00+01
439	12	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2022-09-14 00:00:00+01
440	29	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-09-12 00:00:00+01
441	29	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2020-10-14 00:00:00+01
442	29	En négociation	Inactif	Les échanges ont cessé sans conclusion.	Système / Workflow IA	2021-04-12 00:00:00+01
443	29	Inactif	Actif	Le partenariat a été réactivé.	Système / Workflow IA	2021-05-06 00:00:00+01
444	20	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-12-30 00:00:00+01
445	20	Prospect	Actif	Les échanges ont abouti à un engagement concret.	Système / Workflow IA	2023-03-03 00:00:00+01
446	20	Actif	Inactif	Le partenariat a été suspendu faute d’activité.	Système / Workflow IA	2023-04-27 00:00:00+01
447	20	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2025-01-01 00:00:00+01
448	50	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-06-28 00:00:00+01
449	50	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-10-07 00:00:00+01
450	50	En négociation	Actif	L’accord a été finalisé avec succès.	Système / Workflow IA	2020-11-27 00:00:00+01
451	49	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-08-06 00:00:00+01
452	49	Prospect	En négociation	Le prospect est entré en phase de négociation.	Système / Workflow IA	2024-01-16 00:00:00+01
453	49	En négociation	Inactif	Le projet a été abandonné après échec des négociations.	Système / Workflow IA	2024-04-25 00:00:00+01
454	49	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2024-06-03 00:00:00+01
455	48	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2021-12-12 00:00:00+01
456	47	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-08-16 00:00:00+01
457	47	Prospect	Inactif	Le prospect a été classé inactif par manque d’intérêt.	Système / Workflow IA	2019-10-07 00:00:00+01
458	47	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2026-01-31 00:00:00+01
459	46	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-01-26 00:00:00+01
460	46	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2020-07-12 00:00:00+01
461	46	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2020-07-29 00:00:00+01
462	46	Inactif	Actif	L’activité a repris normalement.	Système / Workflow IA	2020-11-16 00:00:00+01
463	45	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-09-22 00:00:00+01
464	45	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-11-02 00:00:00+01
465	45	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2021-11-29 00:00:00+01
466	45	Actif	Terminé	Le contrat est arrivé à son terme.	Système / Workflow IA	2025-10-31 00:00:00+01
467	44	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-01-05 00:00:00+01
468	44	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2023-06-17 00:00:00+01
469	44	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2023-09-26 00:00:00+01
470	21	Inconnu	Actif	Les nouvelles données confirment une activité en cours.	Système / Workflow IA	2020-10-07 00:00:00+01
471	43	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-03-06 00:00:00+01
472	43	Prospect	Actif	La collaboration a été lancée officiellement.	Système / Workflow IA	2022-07-07 00:00:00+01
473	42	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-07-17 00:00:00+01
474	42	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2020-10-31 00:00:00+01
475	42	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2021-02-23 00:00:00+01
476	41	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-01-08 00:00:00+01
477	41	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2021-04-23 00:00:00+01
478	41	En négociation	Actif	Le contrat a été signé et le partenariat est actif.	Système / Workflow IA	2021-07-23 00:00:00+01
479	40	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-05-24 00:00:00+01
480	40	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2021-07-29 00:00:00+01
481	40	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2021-11-09 00:00:00+01
482	39	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2020-04-02 00:00:00+01
483	39	Prospect	Actif	Le partenaire a rempli les conditions nécessaires pour devenir actif.	Système / Workflow IA	2020-09-09 00:00:00+01
484	39	Actif	Inactif	L’engagement a fortement diminué.	Système / Workflow IA	2020-12-28 00:00:00+01
485	38	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2024-03-21 00:00:00+01
486	38	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2024-09-02 00:00:00+01
487	38	En négociation	Inactif	Aucun accord n’a été trouvé entre les parties.	Système / Workflow IA	2024-10-21 00:00:00+01
488	38	Inactif	Actif	Le partenariat a été réactivé.	Système / Workflow IA	2024-11-23 00:00:00+01
489	37	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-12-15 00:00:00+01
490	37	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-01-01 00:00:00+01
491	37	En négociation	Inactif	Les négociations ont été interrompues.	Système / Workflow IA	2021-03-23 00:00:00+01
492	37	Inactif	Actif	Le partenaire est redevenu opérationnel.	Système / Workflow IA	2021-04-07 00:00:00+01
493	36	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-07-23 00:00:00+01
494	36	Prospect	En négociation	Le prospect a manifesté un intérêt et des négociations sont en cours.	Système / Workflow IA	2023-01-03 00:00:00+01
495	36	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2023-03-22 00:00:00+01
496	34	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2022-01-21 00:00:00+01
497	34	Prospect	En négociation	Le périmètre du partenariat est en cours de définition.	Système / Workflow IA	2022-03-13 00:00:00+01
498	34	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2022-06-01 00:00:00+01
499	22	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2019-08-24 00:00:00+01
500	22	Prospect	En négociation	Les deux parties travaillent sur les conditions de collaboration.	Système / Workflow IA	2019-10-29 00:00:00+01
501	22	En négociation	Actif	Les deux parties ont validé les termes de collaboration.	Système / Workflow IA	2020-01-24 00:00:00+01
502	33	Inconnu	Actif	Le statut a été clarifié et confirmé comme actif.	Système / Workflow IA	2019-11-18 00:00:00+01
503	31	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2021-06-03 00:00:00+01
504	31	Prospect	En négociation	Les discussions ont évolué vers une négociation contractuelle.	Système / Workflow IA	2021-11-24 00:00:00+01
505	31	En négociation	Inactif	L’opportunité a été suspendue sans suite.	Système / Workflow IA	2022-05-17 00:00:00+01
506	31	Inactif	Actif	Le partenaire s’est de nouveau engagé.	Système / Workflow IA	2022-09-24 00:00:00+01
507	30	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2023-01-13 00:00:00+01
508	30	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2023-05-28 00:00:00+01
509	30	Actif	Inactif	L’engagement a fortement diminué.	Système / Workflow IA	2023-10-14 00:00:00+01
510	30	Inactif	Terminé	Le partenariat inactif a été définitivement clôturé.	Système / Workflow IA	2026-03-05 00:00:00+01
511	28	Inconnu	Prospect	De nouvelles informations permettent de le qualifier en prospect.	Système / Workflow IA	2021-02-12 00:00:00+01
512	28	Prospect	Actif	Le prospect a été validé et intégré comme partenaire actif.	Système / Workflow IA	2021-07-01 00:00:00+01
513	27	Inconnu	Inactif	Aucune information fiable n’est disponible.	Système / Workflow IA	2023-12-05 00:00:00+01
514	106	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2020-12-19 00:00:00+01
515	106	Prospect	Inactif	Aucune réponse n’a été obtenue de la part du prospect.	Système / Workflow IA	2021-04-07 00:00:00+01
516	106	Inactif	Terminé	Fermeture définitive du dossier partenaire.	Système / Workflow IA	2026-03-14 00:00:00+01
517	26	Inconnu	Prospect	Le partenaire a été identifié comme prospect potentiel.	Système / Workflow IA	2022-08-08 00:00:00+01
518	26	Prospect	En négociation	Les termes du partenariat sont en cours de discussion.	Système / Workflow IA	2022-10-25 00:00:00+01
519	26	En négociation	Actif	Le partenariat est désormais opérationnel.	Système / Workflow IA	2023-04-18 00:00:00+01
520	27	inactif	actif	pour tester	Khaled Maatoug	2026-04-13 14:38:42.745+01
521	27	actif	inactif	pour tester	Khaled Maatoug	2026-04-13 14:39:50.685+01
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partners (id, categories, name, legal_name, tax_id, website, email, phone, address, logo_url, description, partner_subcategory, partnership_level, partnership_start_date, partnership_status, annual_budget_tnd, satisfaction_score, num_employees, country, contract_end_date, updated_at, password_hash, last_event_date, annual_revenue_generated) FROM stdin;
9	marketing	Parapharmacie Lafayette	Lafayette Tunisie	TN-PARALAF-8526456	www.parapharmacielafayette.com.tn	service.clients@lafayette.tn	+216 71 963 852	Centre Commercial Lafayette, Tunis	https://logo.clearbit.com/paralafayette.com	Parapharmacie proposant des produits de santé et beauté.	Parapharmacie	actif	2021-11-01	actif	179000	67	9	Tunisie	2030-08-28	2026-04-05 02:55:35.005085+01	$2b$10$zJMjQAsPm5B593wUSC8zO.MKbFsoWUu5cXvMcBA1z5a9ll12/VRkq	2026-03-31	179000
14	marketing	Coca-Cola Tunisie	Société Tunisienne de Boissons Gazeuses	TN-COCATN-2563456	www.cocacola.tn	contact@cocacola.tn	+216 71 852 963	Route de Tunis, Msaken	https://logo.clearbit.com/cocacolaTN.com	Boissons gazeuses, avantages employés.	Boissons	actif 	2021-12-01	actif	180000	87	500	Tunisie	2027-01-10	2026-04-05 02:55:43.51908+01	$2b$10$YuCSKtjVR2iGBjxqMOdDtOrJWnHb.FvyAJ1n6eDae29pw2W31Lk02	2026-03-31	180000
21	customer	BIAT (Banque Internationale Arabe de Tunisie)	\N	TN-BIAT-1234567	\N	relationsclient@biat.tn	\N	\N	\N	Test update 2026-04-12T13:05:07.467Z	Banking	actif 	2021-01-01	actif	170000	84	\N	Tunisie	2027-01-01	2026-04-12 14:05:07.482715+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2026-03-31	170000
25	customer	Groupe Chimique Tunisien	Groupe Chimique Tunisien	TN-GCT-0896456	www.gct.com.tn	contact@gct.com.tn	+216 71 350 000	Rue de la Chimie, Tunis	https://logo.clearbit.com/gct.com	Groupe industriel chimique.	Industry	strategique	2021-12-15	actif	720000	78	4200	Tunisie	2027-09-27	2026-04-05 02:56:07.303244+01	$2b$10$lyjOPv0bhfkFQmIJS1ECAuWSPdCpnclgsyL2sCUtr0VHPIHrJQPf6	2026-03-31	720000
3	university	ENIT (École Nationale d'Ingénieurs de Tunis)	ENIT	TN-ENIT-0123659	www.enit.rnu.tn	bureau-entreprises@enit.rnu.tn	+216 71 874 700	BP 37, Le Belvédère, 1002 Tunis, Tunisie	https://logo.clearbit.com/enit.com	École nationale d'ingénieurs prestigieuse.	école_ingénieur	actif 	2025-07-01	inactif	200000	33	720	Tunisie	2029-04-01	2026-04-05 02:55:16.955985+01	$2b$10$q4T8HjggvMx6a6l2AruUDOEsnXA8m9q6cuLcfKq3tS6v1GPJWnLu2	2025-07-01	200000
10	marketing	Parapharmacie Le Paradis	Le Paradis Pharma	TN-PPH-7412456	www.leparadispharma.tn	contact@leparadispharma.tn	+216 71 147 258	Avenue Habib Bourguiba, Tunis	https://logo.clearbit.com/leparadispara.com	Chaîne de parapharmacies discount.	Parapharmacie	actif	2026-01-01	termine	30000	89	10	Tunisie	2025-01-24	2026-04-05 02:55:37.137945+01	$2b$10$WeLIETMvKv/NYFndMolJtuGnqMMdUTR.fn7uWze1LAswhwr1.EV62	2025-01-24	30000
5	university	IHEC Carthage (Institut des Hautes Études Commerciales de Carthage)	IHEC Carthage	TN-IHEC-2389456	www.ihec.rnu.tn	carriere@ihec.rnu.tn	+216 71 776 431	Rue Victor Hugo, Carthage Présidence, 2016 Carthage, Tunisie	https://logo.clearbit.com/ihec.com	Meilleure école de commerce de Tunisie.	école_commerce	actif	2022-12-12	termine	80000	97	200	Tunisie	2025-01-01	2026-04-05 02:55:23.120366+01	$2b$10$0WpBFmHnIgDNrqWcurKY4urI/58J955F/hpa9TGoKSyc6MmRxO08W	2024-01-01	80000
7	marketing	FreeOui	FreeOui Tunisie	TN-FREEOUI-8953456	www.freeoui.tn	partenariats@freeoui.tn	+216 70 987 654	Immeuble Free, Centre Urbain Nord, Tunis	https://logo.clearbit.com/freeoui.com	Opérateur télécom offrant des forfaits spéciaux employés.	Telecom	strategique	2025-01-30	actif	560000	57	50	Tunisie	2027-07-07	2026-04-05 02:55:30.679899+01	$2b$10$x07vnJzTwkSfYr/h2FVWQ.vzdOVphqIQokguqF.fIw5r7j8TA/Txu	2026-03-31	560000
16	supplier	Microsoft Tunisie	\N	TN-MSFT-6789012	\N	partenariats@microsoft.tn	\N	\N	\N	\N	logiciels (Windows, Office)/ des services cloud	strategique 	2021-01-01	actif	800000	97	\N	Tunisie	2027-01-01	2026-04-12 23:32:49.351963+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2026-03-31	950000
23	customer	STEG (Société Tunisienne de l'Électricité et du Gaz)	STEG	TN-STEG-3456789	www.steg.com.tn	relationclient@steg.com.tn	+216 71 341 311	Rue Kamel Ataturk, Tunis	https://logo.clearbit.com/steg.com	Société nationale d'électricité et de gaz.	Energy	actif	2024-01-01	termine	40000	82	13500	Tunisie	2022-07-01	2026-04-05 02:56:02.55966+01	$2b$10$YB5SZ5H0IUNhivUBs73pquXclC1DMGX4BfZkwWZ8JuPumLh1tyW3S	2022-07-01	40000
19	supplier	Tunisie Telecom	Tunisie Télécom	TN-TT-9012345	www.tunisietelecom.tn	partenariats@tt.tn	+216 71 123 456	Centre Urbain Nord, Tunis	https://logo.clearbit.com/tt.com	Opérateur télécom national, services internet et téléphonie.	Telecom	exclusif	2021-01-01	actif	1700000	99	6400	Tunisie	2026-01-01	2026-04-05 03:00:08.014265+01	$2b$10$JRg6NTNQ8EOSxIvrJZCFwuz1JzTvlQJuM.URcVdizTaBL2pHYZvUW	2026-02-26	1900000
6	marketing	Pluxee Tunisie	\N	TN-PLUXee-8523656	\N	contact@pluxee.tn	\N	\N	\N	Test update 2026-04-12T13:05:07.866Z	Agence_com	actif	2025-01-01	inactif	90000	45	\N	Tunisie	2028-07-01	2026-04-12 14:05:07.882109+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2025-07-01	90000
15	marketing	Orange Tunisie	Orange Tunisie	TN-ORNG-5678901	www.orange.tn	partenariat@orange.tn	+216 71 456 123	Centre Urbain Nord, Tunis	https://logo.clearbit.com/orange.com	Opérateur télécom, forfaits mobiles spéciaux.	Telecom	actif	2023-09-01	termine	120000	75	1200	Tunisie	2024-01-01	2026-04-12 13:54:23.097237+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2024-01-01	120000
13	marketing	Délice Danone	Délice Danone Tunisie	TN-DDT-0127895	www.delicedanone.tn	service.conso@delice.tn	+216 71 753 159	Zone Industrielle, Ben Arous	https://logo.clearbit.com/delicedano.com	Produits laitiers, offres sur les produits.	Agroalimentaire	actif 	2024-06-08	inactif	260000	20	900	Tunisie	2028-04-01	2026-04-05 02:55:41.430689+01	$2b$10$g7ToH/25a1TAE3JeL83Kj.Cq9nADjPzzkAJcnmlABkPt/8iYmY41y	2025-04-01	260000
17	supplier	Dell Tunisia	Dell SAS	TN-DELL-8901234	www.dell.tn	ventes@dell.tn	+216 71 753 951	Immeuble Dell, Tunis	https://logo.clearbit.com/dell.com	Matériel informatique et équipements IT.	Matériel informatique/intégration de systèmes	actif 	2024-04-01	termine	179000	65	5000	Tunisie	2025-06-01	2026-04-12 13:54:23.101659+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2025-06-01	120000
18	supplier	HP Tunisie	HP Inc Tunisie	TN-HP-7890123	www.hp.com/tn-fr	commercial@hp.tn	+216 71 852 741	Avenue de la Liberté, Tunis	https://logo.clearbit.com/hp.com	Imprimantes, PC et solutions IT.	Matériel informatique/intégration de systèmes	strategique	2022-10-01	actif	700000	86	500	Tunisie	2029-06-17	2026-04-05 02:55:52.655891+01	$2b$10$d5200ZSbXOIm5yKiWnukhuWXwdblF8xM23Afe7BV6G8VlrtpTgdsO	2026-03-31	760000
24	customer	Tunisair	Société Tunisienne de l'Air	TN-TUNISAIR-0123456	www.tunisair.com	contact@tunisair.com.tn	+216 71 700 700	Aéroport Tunis-Carthage	https://logo.clearbit.com/tunisair.com	Compagnie aérienne nationale.	Transport	actif	2023-01-01	actif	100000	79	3000	Tunisie	2027-03-07	2026-04-05 02:56:05.112716+01	$2b$10$oM.NwadwnBdJzhACb3ZXdeC1RK1XsYdr9ULzHHBVLI8qMzejjBPAa	2026-03-31	100000
28	supplier	Akamai Technologies	Akamai Technologies, Inc.	US-AK-203-445-981	https://www.akamai.com	info@akamai.com	+1 617 444 3000	145 Broadway, Cambridge, MA 02142, United States	https://logo.clearbit.com/akamai.com	Fournisseur mondial de services CDN, sécurité applicative et cloud edge pour accélérer et protéger les applications et contenus en ligne.	Cybersecurity / CDN / Edge	stratégique	2021-05-10	actif	600000	88	10000	United States	2027-05-09	2026-04-05 02:42:12.288032+01	\N	2026-03-31	680000
26	supplier	3DEXPERIENCE (Dassault Systèmes platform)	Dassault Systèmes SE	FR-DS-784-987-321	https://www.3ds.com	info@3ds.com	+33 1 61 62 60 00	10 rue Marcel Dassault, 78140 Vélizy-Villacoublay, France	https://logo.clearbit.com/3ds.com	Plateforme intégrée de Dassault Systèmes pour la conception, la simulation, la fabrication et la collaboration (CAD/PLM) au sein des entreprises industrielles.	Industrial software / PLM	stratégique	2022-09-15	actif	850000	86	23000	France	2027-09-14	2026-04-05 02:42:00.315736+01	$2b$10$lyjOPv0bhfkFQmIJS1ECAuWSPdCpnclgsyL2sCUtr0VHPIHrJQPf6	2026-03-31	930000
29	supplier	Akka Technologies	Capgemini Engineering (ex-AKKODIS / AKKA Technologies)	FR-CE-675-220-941	https://www.capgemini.com	info@capgemini.com	+33 1 47 54 50 00	11 rue de Tilsitt, 75017 Paris, France	https://logo.clearbit.com/capgemini.com	Services d’ingénierie et R&D (capacité Capgemini Engineering) couvrant l’industrialisation, le digital manufacturing, l’embedded et l’IT.	IT services / Engineering	actif	2020-11-20	actif	450000	82	55000	France	2026-11-19	2026-04-05 02:42:18.123606+01	\N	2026-03-31	480000
30	supplier	Algonomy	Algonomy Software Pvt. Ltd.	IN-AL-318-774-992	https://www.algonomy.com	info@algonomy.com	+91 80 0000 0000	Bengaluru, Karnataka, India	https://logo.clearbit.com/algonomy.com	Solutions de personnalisation et d’analytics retail (customer engagement, recommandations, segmentation) pour améliorer l’expérience et la conversion.	Retail analytics / Personalization	actif	2023-03-06	termine	200000	80	900	India	2026-03-05	2026-04-05 02:42:22.801383+01	\N	2025-03-05	180000
31	supplier	Alteryx	Alteryx, Inc.	US-AY-742-009-551	https://www.alteryx.com	info@alteryx.com	+1 949 336 7300	3347 Michelson Dr, Suite 400, Irvine, CA 92612, United States	https://logo.clearbit.com/alteryx.com	Plateforme d’analytics et data preparation (no/low-code) pour automatiser les pipelines et accélérer l’analyse, du reporting à la data science.	Analytics / Data prep	stratégique	2021-09-01	actif	500000	85	2500	United States	2027-08-31	2026-04-05 02:42:27.990542+01	\N	2026-03-31	550000
33	supplier	Amazon Web Services (AWS)	Amazon Web Services, Inc.	US-AWS-110-778-345	https://aws.amazon.com	info@amazon.com	+1 206 266 1000	410 Terry Ave N, Seattle, WA 98109, United States	https://logo.clearbit.com/amazon.com	Plateforme cloud (IaaS/PaaS) offrant calcul, stockage, bases de données, analytics et IA, avec un écosystème mondial de services managés.	Cloud / IaaS-PaaS	exclusif	2020-02-03	actif	1200000	89	100000	United States	2028-02-02	2026-04-05 02:42:35.82539+01	\N	2026-03-31	1400000
34	supplier	Anaplan	Anaplan, Inc.	US-AN-885-143-209	https://www.anaplan.com	info@anaplan.com	+1 415 814 1900	3000 Hanover St, Palo Alto, CA 94304, United States	https://logo.clearbit.com/anaplan.com	Plateforme de planification connectée (financial planning, sales performance, supply chain) pour aligner les décisions et scénarios en temps réel.	Enterprise planning / CPM	stratégique	2022-03-21	actif	550000	84	2200	United States	2027-03-20	2026-04-05 02:42:40.499838+01	\N	2026-03-31	600000
35	supplier	Apigee (Google Cloud)	Google LLC	US-GC-555-019-224	https://cloud.google.com/apigee	info@google.com	+1 650 253 0000	1600 Amphitheatre Parkway, Mountain View, CA 94043, United States	https://logo.clearbit.com/google.com	Plateforme de gestion d’API (API management) pour sécuriser, publier, monitorer et monétiser les API dans des architectures modernes (microservices).	API management	actif	2023-01-09	actif	260000	83	180000	United States	2026-12-31	2026-04-05 02:42:50.930866+01	\N	2026-03-31	280000
36	supplier	Appian	Appian Corporation	US-AP-940-772-118	https://www.appian.com	info@appian.com	+1 703 442 8844	7950 Jones Branch Dr, McLean, VA 22102, United States	https://logo.clearbit.com/appian.com	Plateforme low-code d’automatisation des processus (BPM), orchestration et case management, pour accélérer le delivery d’applications métiers.	Low-code / BPM	actif	2022-10-17	actif	300000	82	2300	United States	2027-10-16	2026-04-05 02:42:56.417826+01	\N	2026-03-31	330000
27	supplier	Aible	Aible, Inc.	US-AI-509-112-774	https://www.aible.com	info@aible.com	+1 650 000 0000	Silicon Valley, California, United States	https://logo.clearbit.com/aible.com	Plateforme d’IA appliquée visant à accélérer la création de modèles prédictifs et leur mise en production, avec un focus sur l’impact business mesurable.	AI / Machine learning	actif	2024-02-01	inactif	120000	74	120	United States	2026-12-31	2026-04-13 14:39:50.680424+01	\N	2025-12-31	70000
38	supplier	Aprimo	Aprimo US LLC	US-APR-684-219-533	https://www.aprimo.com	info@aprimo.com	+1 312 000 0000	Chicago, Illinois, United States	https://logo.clearbit.com/aprimo.com	Solutions de gestion des ressources marketing (MRM) et DAM (digital asset management) pour piloter les contenus, workflows et campagnes.	Marketing operations / DAM	actif	2024-06-03	actif	140000	76	900	United States	2026-06-02	2026-04-05 02:43:08.529666+01	\N	2026-03-31	150000
39	supplier	Atos	Atos SE	FR-AT-104-558-730	https://atos.net	info@atos.net	+33 1 73 26 00 00	80 quai Voltaire, 95870 Bezons, France	https://logo.clearbit.com/atos.net	Groupe de services numériques : transformation cloud, infrastructure, cybersécurité, data/IA et services managés pour grandes entreprises.	IT services / Managed services	actif	2020-06-08	inactif	280000	55	80000	France	2026-12-31	2026-04-05 02:43:14.288128+01	\N	2024-12-31	120000
40	supplier	Autodesk	Autodesk, Inc.	US-ADSK-233-908-117	https://www.autodesk.com	info@autodesk.com	+1 415 507 5000	111 McInnis Parkway, San Rafael, CA 94903, United States	https://logo.clearbit.com/autodesk.com	Éditeur de logiciels de conception et ingénierie (CAD/BIM/3D) utilisés dans l’architecture, la construction, la fabrication et les médias.	CAD / BIM / 3D design	stratégique	2021-07-12	actif	520000	86	14000	United States	2027-07-11	2026-04-05 02:43:21.110112+01	\N	2026-03-31	580000
41	supplier	Avaloq	Avaloq Group AG	CH-AV-772-410-956	https://www.avaloq.com	info@avaloq.com	+41 58 816 3000	Allmendstrasse 140, 8027 Zürich, Switzerland	https://logo.clearbit.com/avaloq.com	Editeur de solutions core banking et wealth management, avec des plateformes pour l'automatisation des operations bancaires et la gestion de portefeuille.	Banking software / Core banking	strategique	2021-03-08	actif	650000	85	2500	Switzerland	2027-03-07	2026-04-05 02:43:25.688357+01	\N	2026-03-31	710000
42	supplier	Axway	Axway Software SA	FR-AX-501-521-257	https://www.axway.com	info@axway.com	+33 1 47 46 12 00	25 avenue des Champs-Élysées, 75008 Paris, France	https://logo.clearbit.com/axway.com	Solutions d'integration B2B/EDI, MFT (managed file transfer) et gestion d'API pour connecter applications, partenaires et échanges critiques.	Integration / API / MFT	actif	2020-09-14	actif	380000	82	2000	France	2026-09-13	2026-04-05 02:43:30.769919+01	\N	2026-03-31	410000
44	supplier	BlackLine	BlackLine, Inc.	US-BL-090-771-663	https://www.blackline.com	info@blackline.com	+1 310 689 1234	1450 2nd St, Manhattan Beach, CA 90266, United States	https://logo.clearbit.com/blackline.com	Solutions cloud de finance transformation (cloture comptable, rapprochements, automatisation des processus) pour améliorer la gouvernance et la conformité.	Finance automation / Accounting	actif	2023-04-03	actif	260000	81	2300	United States	2026-12-31	2026-04-05 02:43:41.906352+01	\N	2026-03-31	280000
55	supplier	Collibra	Collibra NV	BE-CO-514-992-308	https://www.collibra.com	info@collibra.com	+32 2 000 0000	Harenbergstraat 8, 1800 Vilvoorde, Belgium	https://logo.clearbit.com/collibra.com	Plateforme de data intelligence et gouvernance (catalogue, lineage, data quality) pour ameliorer la conformite et la valorisation des donnees.	Data governance / Catalog	strategique	2023-02-20	actif	540000	85	2200	Belgium	2028-02-19	2026-04-05 02:44:43.577286+01	\N	2026-03-31	600000
70	supplier	Dynatrace	Dynatrace, Inc.	US-DYN-771-309-118	https://www.dynatrace.com	info@dynatrace.com	+1 781 000 0000	1601 Trapelo Rd, Waltham, MA 02451, United States	https://logo.clearbit.com/dynatrace.com	Plateforme d observabilite et AIOps pour surveiller applications, infrastructures et experience utilisateur, avec detection automatique des anomalies.	Observability / APM	strategique	2021-12-13	actif	610000	86	4700	United States	2027-12-12	2026-04-05 02:46:29.787819+01	\N	2026-03-31	680000
85	supplier	Globalization Partners	Globalization Partners, LLC	US-GP-551-774-118	https://www.globalization-partners.com	info@globalization-partners.com	+1 617 000 0000	Boston, Massachusetts, United States	https://logo.clearbit.com/globalization-partners.com	Plateforme EOR (Employer of Record) pour embaucher et gerer des equipes a l international, avec conformite, paie et administration RH.	HR / Employer of Record (EOR)	actif	2024-01-08	en_negociation	130000	74	1200	United States	2026-12-31	2026-04-05 02:47:38.679003+01	\N	2026-03-31	120000
95	supplier	Informatica	Informatica LLC	US-INF2-440-992-551	https://www.informatica.com	info@informatica.com	+1 650 000 0000	2100 Seaport Blvd, Redwood City, CA 94063, United States	https://logo.clearbit.com/informatica.com	Plateforme de gestion de donnees (integration, qualite, MDM, gouvernance) pour unifier, fiabiliser et exploiter les donnees en entreprise.	Data management / Integration	exclusif	2020-03-16	actif	920000	87	5000	United States	2028-03-15	2026-04-05 02:48:09.649114+01	\N	2026-03-31	1050000
105	supplier	Looker (Google Cloud)	Google LLC	US-GC-555-019-224	https://looker.com	info@google.com	+1 650 253 0000	1600 Amphitheatre Parkway, Mountain View, CA 94043, United States	https://logo.clearbit.com/looker.com	Plateforme BI et data exploration (modelisation LookML) pour construire des tableaux de bord, gouverner les metriques et democratiseer l analyse.	BI / Analytics	actif	2023-07-10	actif	240000	83	180000	United States	2026-12-31	2026-04-05 02:48:36.624375+01	\N	2026-03-31	260000
107	supplier	Mambu	Mambu GmbH	DE-MB-662-118-551	https://www.mambu.com	info@mambu.com	+49 30 0000 0000	Karlsruher Strasse 7, 10711 Berlin, Germany	https://logo.clearbit.com/mambu.com	Plateforme cloud native de core banking pour institutions financieres et fintechs, permettant de lancer rapidement des produits de credit et d epargne.	Core banking / FinTech	strategique	2016-10-03	actif	610000	86	900	Germany	2027-10-02	2026-04-05 02:48:43.216486+01	\N	2026-03-31	680000
116	supplier	NetSuite (Oracle)	Oracle Corporation	US-OR-774-118-330	https://www.netsuite.com	info@oracle.com	+1 737 867 1000	2300 Oracle Way, Austin, TX 78741, United States	https://logo.clearbit.com/oracle.com	ERP cloud (NetSuite) pour PME/ETI : finance, CRM, ecommerce et gestion des operations, avec modules sectoriels et automatisation.	ERP / Cloud ERP	strategique	2011-02-08	actif	560000	85	160000	United States	2027-02-07	2026-04-05 02:49:05.84958+01	\N	2026-03-31	620000
131	supplier	Palo Alto Networks	Palo Alto Networks, Inc.	US-PAN-551-118-330	https://www.paloaltonetworks.com	info@paloaltonetworks.com	+1 408 753 4000	3000 Tannery Way, Santa Clara, CA 95054, United States	https://logo.clearbit.com/paloaltonetworks.com	Editeur de solutions de cybersécurite (firewalls, SASE, XDR, cloud security) pour proteger reseaux, endpoints et environnements cloud.	Cybersecurity / Network security	exclusif	2025-06-29	actif	1200000	88	15000	United States	2026-06-28	2026-04-05 02:50:07.598799+01	\N	2026-03-31	1300000
45	supplier	Blue Prism	Blue Prism Limited	UK-BP-417-220-908	https://www.blueprism.com	info@blueprism.com	+44 20 0000 0000	2 Kingdom Street, Paddington, London W2 6BD, United Kingdom	https://logo.clearbit.com/blueprism.com	Plateforme RPA (Robotic Process Automation) pour automatiser des taches repetitives et orchestrer des workflows, avec gouvernance et securite entreprise.	RPA / Automation	actif	2021-11-01	termine	180000	62	1800	United Kingdom	2025-10-31	2026-04-05 02:43:46.439537+01	\N	2025-10-31	140000
46	supplier	Blue Yonder	Blue Yonder Group, Inc.	US-BY-300-514-779	https://blueyonder.com	info@blueyonder.com	+1 480 000 0000	15059 N Scottsdale Rd, Scottsdale, AZ 85254, United States	https://logo.clearbit.com/blueyonder.com	Solutions supply chain et retail (prevision de la demande, planification, execution, warehouse management) avec optimisation et IA.	Supply chain / Retail	strategique	2020-03-02	actif	640000	84	6000	United States	2027-03-01	2026-04-05 02:43:50.786104+01	\N	2026-03-31	700000
47	supplier	BMC Software	BMC Software, Inc.	US-BMC-771-883-402	https://www.bmc.com	info@bmc.com	+1 713 918 8800	2103 CityWest Blvd, Houston, TX 77042, United States	https://logo.clearbit.com/bmc.com	Editeur de solutions ITSM/ITOM et mainframe (supervision, automatisation, gestion des services) pour la fiabilite et la performance IT.	ITSM / IT operations	actif	2019-10-07	inactif	220000	58	7000	United States	2026-01-31	2026-04-05 02:43:55.096417+01	\N	2025-01-31	100000
48	supplier	Boomi	Boomi, LP	US-BM-662-190-733	https://boomi.com	info@boomi.com	+1 610 000 0000	Conshohocken, Pennsylvania, United States	https://logo.clearbit.com/boomi.com	Plateforme iPaaS d'integration (applications, donnees, API) pour connecter rapidement les systemes et automatiser les flux inter-entreprises.	iPaaS / Integration	actif	2022-02-14	actif	310000	83	2000	United States	2027-02-13	2026-04-05 02:43:59.823921+01	\N	2026-03-31	340000
49	supplier	Box	Box, Inc.	US-BX-110-448-620	https://www.box.com	info@box.com	+1 650 000 0000	900 Jefferson Ave, Redwood City, CA 94063, United States	https://logo.clearbit.com/box.com	Plateforme de gestion de contenu cloud (stockage, partage, collaboration) avec securite et gouvernance pour les documents d'entreprise.	Content management / Collaboration	actif	2023-09-18	actif	210000	80	2800	United States	2026-09-17	2026-04-05 02:44:04.74131+01	\N	2026-03-31	220000
50	supplier	Broadcom	Broadcom Inc.	US-BC-909-771-118	https://www.broadcom.com	info@broadcom.com	+1 408 000 0000	1320 Ridder Park Dr, San Jose, CA 95131, United States	https://logo.clearbit.com/broadcom.com	Groupe technologique proposant semi-conducteurs et logiciels d'infrastructure (reseau, securite, mainframe, virtualisation) pour les environnements entreprise.	Infrastructure software / Semiconductors	exclusif	2020-08-24	actif	900000	87	20000	United States	2028-08-23	2026-04-05 02:44:10.721336+01	\N	2026-03-31	1000000
53	supplier	Cloudera	Cloudera, Inc.	US-CLD-880-214-506	https://www.cloudera.com	info@cloudera.com	+1 650 000 0000	3340 Peachtree Rd NE, Suite 775, Atlanta, GA 30326, United States	https://logo.clearbit.com/cloudera.com	Plateforme data pour l'entreprise (data lakehouse, analytics, gouvernance) avec deploiements hybrides et exigences de securite renforcees.	Data platform / Big data	strategique	2019-06-03	actif	480000	82	2700	United States	2026-06-02	2026-04-05 02:44:28.361432+01	\N	2026-03-31	520000
51	supplier	Celonis	Celonis SE	DE-CE-118-774-930	https://www.celonis.com	info@celonis.com	+49 89 0000 0000	Theresienstraße 6, 80333 Munich, Germany	https://logo.clearbit.com/celonis.com	Plateforme de process mining et execution management permettant d'analyser les processus (ERP/CRM), identifier les goulots et automatiser l'amelioration continue.	Process mining	strategique	2021-06-21	actif	580000	85	3000	Germany	2027-06-20	2026-04-05 02:44:15.203969+01	\N	2026-03-31	640000
52	supplier	Citrix	Citrix Systems, Inc.	US-CTX-553-190-881	https://www.citrix.com	info@citrix.com	+1 954 267 3000	851 W Cypress Creek Rd, Fort Lauderdale, FL 33309, United States	https://logo.clearbit.com/citrix.com	Solutions de virtualisation, acces distant et digital workspace (VDI, application delivery) pour securiser l'acces aux applications et postes de travail.	Digital workspace / VDI	actif	2020-01-13	inactif	240000	57	9000	United States	2026-02-28	2026-04-05 02:44:22.747999+01	\N	2025-02-28	100000
54	supplier	Cloudflare	Cloudflare, Inc.	US-CF-771-480-339	https://www.cloudflare.com	info@cloudflare.com	+1 888 993 5273	101 Townsend St, San Francisco, CA 94107, United States	https://logo.clearbit.com/cloudflare.com	Services de performance et securite web (DNS, WAF, DDoS, Zero Trust) et reseau edge mondial pour proteger et accelerer les applications.	Cybersecurity / Edge network	strategique	2022-07-04	actif	620000	86	4500	United States	2027-07-03	2026-04-05 02:44:36.550965+01	\N	2026-03-31	690000
56	supplier	Contentful	Contentful GmbH	DE-CF-620-114-893	https://www.contentful.com	info@contentful.com	+49 30 0000 0000	Ritterstrasse 12-14, 10969 Berlin, Germany	https://logo.clearbit.com/contentful.com	Plateforme CMS headless pour gerer et distribuer du contenu via API, afin d alimenter sites web, applications et experiences digitales omnicanales.	Headless CMS / Content platform	actif	2022-04-11	actif	240000	82	750	Germany	2026-12-31	2026-04-05 02:45:01.429669+01	\N	2026-03-31	260000
132	supplier	Pega / Pegasystems	Pegasystems Inc.	US-PG-774-118-551	https://www.pega.com	info@pega.com	+1 617 374 9600	1 Rogers St, Cambridge, MA 02142, United States	https://logo.clearbit.com/pega.com	Plateforme de BPM et CRM decisionnel pour automatiser les processus et orchestrer l experience client, avec moteur de regles et IA.	BPM / CRM platform	strategique	2021-09-27	actif	620000	84	6000	United States	2027-09-26	2026-04-05 02:50:09.846456+01	\N	2026-03-31	680000
58	supplier	Couchbase	Couchbase, Inc.	US-CB-990-214-773	https://www.couchbase.com	info@couchbase.com	+1 408 000 0000	3250 Olcott St, Santa Clara, CA 95054, United States	https://logo.clearbit.com/couchbase.com	Base de donnees NoSQL orientee documents pour applications modernes, avec replication, recherche et capacites mobile/offline.	Database / NoSQL	actif	2023-05-15	actif	210000	81	800	United States	2026-05-14	2026-04-05 02:45:14.645318+01	\N	2026-03-31	230000
61	supplier	Databricks	Databricks, Inc.	US-DBX-771-440-902	https://www.databricks.com	info@databricks.com	+1 866 000 0000	160 Spear St, Floor 15, San Francisco, CA 94105, United States	https://logo.clearbit.com/databricks.com	Plateforme lakehouse pour analytics et IA, basee sur Apache Spark, permettant ingestion, engineering, BI et machine learning a grande echelle.	Data platform / Lakehouse	exclusif	2021-02-22	actif	1100000	89	7000	United States	2028-02-21	2026-04-05 02:45:20.536206+01	\N	2026-03-31	1250000
62	supplier	Datadog	Datadog, Inc.	US-DD-118-902-664	https://www.datadoghq.com	info@datadoghq.com	+1 866 000 0000	620 8th Ave, Floor 45, New York, NY 10018, United States	https://logo.clearbit.com/datadoghq.com	Plateforme d observabilite (monitoring, logs, traces, APM) pour applications cloud et infrastructures, avec alerting et tableaux de bord.	Observability / Monitoring	strategique	2022-09-26	actif	680000	87	6000	United States	2027-09-25	2026-04-05 02:45:26.158277+01	\N	2026-03-31	760000
63	supplier	Dataiku	Dataiku SAS	FR-DK-514-220-771	https://www.dataiku.com	info@dataiku.com	+33 1 82 88 16 16	103 rue de Grenelle, 75007 Paris, France	https://logo.clearbit.com/dataiku.com	Plateforme d IA et analytics d entreprise (preparation de donnees, ML, MLOps) pour industrialiser les cas d usage data et collaborer entre equipes.	AI / Analytics platform	strategique	2021-06-07	actif	620000	86	1500	France	2027-06-06	2026-04-05 02:45:31.531662+01	\N	2026-03-31	700000
64	supplier	DataRobot	DataRobot, Inc.	US-DR-772-114-509	https://www.datarobot.com	info@datarobot.com	+1 617 000 0000	Boston, Massachusetts, United States	https://logo.clearbit.com/datarobot.com	Plateforme AutoML et MLOps pour accelerer la creation, le deploiement et la gouvernance de modeles predictifs en production.	AI / AutoML / MLOps	actif	2023-11-13	actif	260000	80	1200	United States	2026-11-12	2026-04-05 02:45:40.166442+01	\N	2026-03-31	280000
65	supplier	Dell Technologies	Dell Technologies Inc.	US-DT-309-880-114	https://www.dell.com	info@dell.com	+1 800 624 9897	One Dell Way, Round Rock, TX 78682, United States	https://logo.clearbit.com/dell.com	Groupe proposant serveurs, stockage, PC et solutions d infrastructure, avec services associes pour datacenters et environnements hybrides.	Hardware / Infrastructure	exclusif	2019-02-18	actif	980000	86	120000	United States	2028-02-17	2026-04-05 02:45:46.997361+01	\N	2026-03-31	1080000
66	supplier	Denodo	Denodo Technologies, Inc.	US-DN-664-902-118	https://www.denodo.com	info@denodo.com	+1 650 000 0000	Palo Alto, California, United States	https://logo.clearbit.com/denodo.com	Plateforme de data virtualization pour unifier l acces aux donnees (on-prem et cloud), accelérer la livraison de data products et la gouvernance.	Data virtualization	actif	2022-11-07	actif	230000	82	900	United States	2026-11-06	2026-04-05 02:45:55.983214+01	\N	2026-03-31	250000
67	supplier	Docker	Docker, Inc.	US-DK-114-550-992	https://www.docker.com	info@docker.com	+1 415 000 0000	San Francisco, California, United States	https://logo.clearbit.com/docker.com	Outils et plateforme autour des conteneurs pour construire, partager et executer des applications (Docker Desktop, registry, workflows dev).	DevOps / Containers	actif	2020-05-04	actif	280000	83	1300	United States	2026-05-03	2026-04-05 02:46:01.907265+01	\N	2026-03-31	300000
68	supplier	Dremio	Dremio Corporation	US-DRM-514-662-330	https://www.dremio.com	info@dremio.com	+1 650 000 0000	Santa Clara, California, United States	https://logo.clearbit.com/dremio.com	Plateforme lakehouse et SQL query engine pour acceder rapidement aux data lakes, avec acceleration, gouvernance et integration BI.	Data platform / SQL engine	actif	2023-02-06	actif	170000	79	700	United States	2026-02-05	2026-04-05 02:46:07.736757+01	\N	2026-03-31	180000
69	supplier	Drupal	Drupal Association	US-DA-880-551-220	https://www.drupal.org	info@drupal.org	+1 000 000 0000	Portland, Oregon, United States	https://logo.clearbit.com/drupal.org	Ecosysteme open source CMS pour creer des sites et plateformes web robustes, extensibles et securisees, avec une grande communaute de contributeurs.	CMS / Open source	basique	2024-09-02	actif	60000	78	50	United States	2026-09-01	2026-04-05 02:46:18.30217+01	\N	2026-03-31	65000
71	supplier	Elastic	Elastic N.V.	NL-EL-440-992-118	https://www.elastic.co	info@elastic.co	+31 20 000 0000	Keizersgracht 62, 1015 CS Amsterdam, Netherlands	https://logo.clearbit.com/elastic.co	Plateforme de recherche et d analyse (Elasticsearch, Kibana) pour observabilite, securite (SIEM) et recherche applicative a grande echelle.	Search / Observability / SIEM	strategique	2021-03-29	actif	520000	85	3500	Netherlands	2027-03-28	2026-04-05 02:46:37.951487+01	\N	2026-03-31	580000
72	supplier	Enablon	Wolters Kluwer Enablon SAS	FR-EN-309-771-504	https://www.enablon.com	info@enablon.com	+33 1 47 62 60 00	Le Premium, 20 rue Cambaceres, 75008 Paris, France	https://logo.clearbit.com/enablon.com	Solution EHSQ (environnement, sante, securite, qualite) pour gerer la conformite, les risques, les audits et le reporting ESG.	EHS / ESG / GRC	actif	2020-10-12	actif	230000	81	1000	France	2026-10-11	2026-04-05 02:46:46.674771+01	\N	2026-03-31	250000
73	supplier	Envision Digital	Envision Digital International Pte. Ltd.	SG-ED-662-118-509	https://www.envisiondigital.com	info@envisiondigital.com	+65 0000 0000	1 Fusionopolis Place, Singapore 138522, Singapore	https://logo.clearbit.com/envisiondigital.com	Solutions IoT et AI pour l energie et l industrie, avec des plateformes de gestion d actifs, optimisation et analytics temps reel.	IoT / Industrial AI	actif	2023-06-19	en_negociation	150000	75	1500	Singapore	2026-06-18	2026-04-05 02:46:51.533135+01	\N	2026-03-31	140000
74	supplier	Ericsson	Telefonaktiebolaget LM Ericsson	SE-ER-771-004-992	https://www.ericsson.com	info@ericsson.com	+46 10 719 0000	Torshamnsgatan 21, 164 83 Stockholm, Sweden	https://logo.clearbit.com/ericsson.com	Fournisseur mondial d equipements reseau et services telecom (4G/5G), solutions OSS/BSS et services numeriques pour operateurs.	Telecom / 5G / Network	strategique	2019-11-18	actif	750000	84	100000	Sweden	2027-11-17	2026-04-05 02:46:58.833472+01	\N	2026-03-31	820000
76	supplier	Fenergo	Fenergo Limited	IE-FE-509-220-118	https://www.fenergo.com	info@fenergo.com	+353 1 687 2000	Dublin, Ireland	https://logo.clearbit.com/fenergo.com	Solutions KYC/CLM (client lifecycle management) pour institutions financieres : onboarding, conformite, screening et gestion des dossiers clients.	RegTech / KYC / CLM	strategique	2021-08-23	actif	420000	85	1200	Ireland	2027-08-22	2026-04-05 02:47:05.137899+01	\N	2026-03-31	460000
77	supplier	Finastra	Finastra International Limited	UK-FI-662-309-774	https://www.finastra.com	info@finastra.com	+44 20 0000 0000	4 Kingdom Street, Paddington, London W2 6BD, United Kingdom	https://logo.clearbit.com/finastra.com	Editeur de solutions bancaires (core banking, paiements, lending, treasury) et marketplace fintech pour accelerer l innovation en banque.	Banking software / FinTech	exclusif	2020-04-06	actif	980000	86	8000	United Kingdom	2028-04-05	2026-04-05 02:47:08.56879+01	\N	2026-03-31	1100000
78	supplier	Fivetran	Fivetran, Inc.	US-FT-118-664-220	https://www.fivetran.com	info@fivetran.com	+1 510 000 0000	Oakland, California, United States	https://logo.clearbit.com/fivetran.com	Plateforme d ELT/ingestion de donnees avec connecteurs geres pour synchroniser automatiquement les sources vers les data warehouses.	Data integration / ELT	strategique	2022-06-13	actif	560000	86	2000	United States	2027-06-12	2026-04-05 02:47:12.188015+01	\N	2026-03-31	630000
79	supplier	Flexera	Flexera Software LLC	US-FX-309-118-775	https://www.flexera.com	info@flexera.com	+1 630 000 0000	Downers Grove, Illinois, United States	https://logo.clearbit.com/flexera.com	Solutions de gestion des actifs logiciels (SAM), FinOps et optimisation cloud pour maitriser les couts, licences et risques de conformite.	IT asset management / FinOps	actif	2021-01-18	actif	240000	80	1200	United States	2026-12-31	2026-04-05 02:47:15.431875+01	\N	2026-03-31	250000
80	supplier	ForgeRock	ForgeRock, Inc.	US-FR-551-220-902	https://www.forgerock.com	info@forgerock.com	+1 415 000 0000	San Francisco, California, United States	https://logo.clearbit.com/forgerock.com	Plateforme de gestion des identites et des acces (IAM) pour l authentification, SSO, gestion des profils et securisation des parcours clients.	Cybersecurity / IAM	actif	2020-07-27	termine	260000	60	1500	United States	2025-07-26	2026-04-05 02:47:18.855753+01	\N	2025-07-26	180000
81	supplier	Forcepoint	Forcepoint LLC	US-FP-662-771-118	https://www.forcepoint.com	info@forcepoint.com	+1 512 000 0000	Austin, Texas, United States	https://logo.clearbit.com/forcepoint.com	Solutions de securite (DLP, SASE, web security, protection des donnees) pour reduire les risques et proteger les informations sensibles.	Cybersecurity / DLP / SASE	strategique	2022-02-28	actif	440000	84	3000	United States	2027-02-27	2026-04-05 02:47:22.187222+01	\N	2026-03-31	480000
82	supplier	Genesys	Genesys Telecommunications Laboratories, Inc.	US-GN-440-118-992	https://www.genesys.com	info@genesys.com	+1 650 466 1100	2001 Junipero Serra Blvd, Daly City, CA 94014, United States	https://logo.clearbit.com/genesys.com	Solutions de centre de contact et d experience client (CCaaS) pour orchestrer les interactions omnicanales et optimiser la relation client.	Customer experience / Contact center	strategique	2021-04-19	actif	700000	86	6000	United States	2027-04-18	2026-04-05 02:47:25.443515+01	\N	2026-03-31	780000
83	supplier	GitHub	GitHub, Inc.	US-GH-771-220-309	https://github.com	info@github.com	+1 415 000 0000	88 Colin P Kelly Jr St, San Francisco, CA 94107, United States	https://logo.clearbit.com/github.com	Plateforme de developpement collaboratif (git, pull requests, CI/CD, securite) et hebergement de code, avec GitHub Enterprise et Actions.	DevOps / SCM	strategique	2020-09-21	actif	620000	87	3500	United States	2027-09-20	2026-04-05 02:47:30.498169+01	\N	2026-03-31	700000
84	supplier	GitLab	GitLab Inc.	US-GL-662-992-118	https://about.gitlab.com	info@gitlab.com	+1 415 000 0000	San Francisco, California, United States	https://logo.clearbit.com/gitlab.com	Plateforme DevSecOps complete (SCM, CI/CD, securite, planning) pour livrer du logiciel plus vite avec gouvernance et automatisation.	DevSecOps / CI-CD	actif	2023-03-27	actif	260000	82	2000	United States	2026-12-31	2026-04-05 02:47:34.421385+01	\N	2026-03-31	280000
86	supplier	Google Cloud	Google LLC	US-GC-555-019-224	https://cloud.google.com	info@google.com	+1 650 253 0000	1600 Amphitheatre Parkway, Mountain View, CA 94043, United States	https://logo.clearbit.com/google.com	Plateforme cloud (IaaS/PaaS) proposant compute, stockage, data analytics, IA et services manages, avec un fort focus sur la securite et l innovation.	Cloud / IaaS-PaaS	exclusif	2020-10-05	actif	1150000	88	180000	United States	2028-10-04	2026-04-05 02:47:41.293044+01	\N	2026-03-31	1300000
87	supplier	Guidewire	Guidewire Software, Inc.	US-GW-774-118-662	https://www.guidewire.com	info@guidewire.com	+1 650 356 4955	2850 S Delaware St, San Mateo, CA 94403, United States	https://logo.clearbit.com/guidewire.com	Plateforme logicielle pour assureurs (core insurance) couvrant souscription, gestion des sinistres et facturation, avec ecosysteme d integrations.	Insurance software / Core system	strategique	2021-09-13	actif	720000	86	3200	United States	2027-09-12	2026-04-05 02:47:44.548338+01	\N	2026-03-31	800000
88	supplier	HashiCorp	HashiCorp, Inc.	US-HC-118-774-330	https://www.hashicorp.com	info@hashicorp.com	+1 415 000 0000	101 Mission St, Suite 2900, San Francisco, CA 94105, United States	https://logo.clearbit.com/hashicorp.com	Outils d infrastructure as code et securite (Terraform, Vault, Consul, Nomad) pour automatiser le cloud, le reseau et la gestion des secrets.	DevOps / Infrastructure as Code	strategique	2021-02-01	actif	640000	87	2400	United States	2027-01-31	2026-04-05 02:47:47.259568+01	\N	2026-03-31	720000
89	supplier	HERE Technologies	HERE Global B.V.	NL-HT-662-551-114	https://www.here.com	info@here.com	+31 20 000 0000	Kennedyplein 222-226, 5611 ZT Eindhoven, Netherlands	https://logo.clearbit.com/here.com	Fournisseur de donnees cartographiques et services de localisation (maps, geocoding, routing) pour mobilite, logistique et applications entreprise.	Geospatial / Mapping	actif	2022-12-05	actif	240000	81	6000	Netherlands	2026-12-04	2026-04-05 02:47:50.808754+01	\N	2026-03-31	260000
90	supplier	Hewlett Packard Enterprise (HPE)	Hewlett Packard Enterprise Company	US-HPE-309-662-118	https://www.hpe.com	info@hpe.com	+1 650 857 1501	1701 E Mossy Oaks Rd, Spring, TX 77389, United States	https://logo.clearbit.com/hpe.com	Groupe d infrastructure IT (serveurs, stockage, reseau) et solutions edge-to-cloud, avec services pour datacenters et environnements hybrides.	Hardware / Infrastructure	exclusif	2019-05-27	actif	950000	86	60000	United States	2028-05-26	2026-04-05 02:47:54.591701+01	\N	2026-03-31	1050000
92	supplier	IBM	International Business Machines Corporation	US-IBM-114-330-992	https://www.ibm.com	info@ibm.com	+1 914 499 1900	1 New Orchard Road, Armonk, NY 10504, United States	https://logo.clearbit.com/ibm.com	Groupe technologique fournissant logiciels, services et materiel, avec offres cloud hybride, IA, middleware, securite et consulting.	Enterprise IT / Consulting	exclusif	2019-01-07	actif	1300000	87	300000	United States	2028-01-06	2026-04-05 02:48:02.090691+01	\N	2026-03-31	1450000
93	supplier	IFS	IFS AB	SE-IFS-551-118-774	https://www.ifs.com	info@ifs.com	+46 8 587 845 00	Scheelevagen 17, 223 70 Lund, Sweden	https://logo.clearbit.com/ifs.com	Editeur d ERP et solutions EAM/field service management pour industries (manufacturing, energie, services) avec approche cloud et maintenance.	ERP / EAM / Field service	strategique	2022-01-24	actif	520000	84	6000	Sweden	2027-01-23	2026-04-05 02:48:04.580857+01	\N	2026-03-31	570000
94	supplier	Infor	Infor (US), Inc.	US-INF-662-118-774	https://www.infor.com	info@infor.com	+1 646 000 0000	641 Avenue of the Americas, New York, NY 10011, United States	https://logo.clearbit.com/infor.com	Editeur de solutions ERP sectorielles (industrie, sante, distribution) et plateforme cloud pour moderniser les processus metiers.	ERP / Industry cloud	strategique	2020-06-22	actif	610000	85	17000	United States	2027-06-21	2026-04-05 02:48:07.014315+01	\N	2026-03-31	670000
96	supplier	Intel	Intel Corporation	US-IN-220-774-118	https://www.intel.com	info@intel.com	+1 408 765 8080	2200 Mission College Blvd, Santa Clara, CA 95054, United States	https://logo.clearbit.com/intel.com	Concepteur de semi-conducteurs et plateformes (CPU, acceleration IA, reseaux) pour datacenters, PC et edge computing.	Semiconductors / Hardware	exclusif	2019-09-30	actif	880000	86	120000	United States	2028-09-29	2026-04-05 02:48:12.363897+01	\N	2026-03-31	950000
97	supplier	Ivanti	Ivanti, Inc.	US-IV-771-118-330	https://www.ivanti.com	info@ivanti.com	+1 801 000 0000	Salt Lake City, Utah, United States	https://logo.clearbit.com/ivanti.com	Solutions ITSM et gestion des terminaux (UEM, patch management, securite) pour administrer postes, mobiles et services IT.	ITSM / Endpoint management	actif	2022-08-08	actif	190000	79	1800	United States	2026-08-07	2026-04-05 02:48:14.745108+01	\N	2026-03-31	200000
98	supplier	Jedox	Jedox AG	DE-JX-551-330-118	https://www.jedox.com	info@jedox.com	+49 761 0000 000	Bismarckallee 7, 79098 Freiburg im Breisgau, Germany	https://logo.clearbit.com/jedox.com	Solution de planification et reporting (CPM) basee sur Excel et web, pour budget, previsions, consolidation et tableaux de bord.	CPM / Planning	actif	2023-10-02	actif	140000	78	450	Germany	2026-10-01	2026-04-05 02:48:17.138505+01	\N	2026-03-31	150000
99	supplier	Jitterbit	Jitterbit, Inc.	US-JB-662-509-118	https://www.jitterbit.com	info@jitterbit.com	+1 510 000 0000	Alameda, California, United States	https://logo.clearbit.com/jitterbit.com	Plateforme d integration et d automatisation (iPaaS) pour connecter applications, APIs et donnees avec des connecteurs prets a l emploi.	iPaaS / Integration	actif	2024-03-04	en_negociation	110000	74	700	United States	2026-12-31	2026-04-05 02:48:19.748616+01	\N	2026-03-31	100000
100	supplier	Kinaxis	Kinaxis Inc.	CA-KX-771-118-662	https://www.kinaxis.com	info@kinaxis.com	+1 613 592 8200	3199 Palladium Dr, Ottawa, ON K2T 0N9, Canada	https://logo.clearbit.com/kinaxis.com	Solutions de planification de la supply chain (concurrent planning) pour synchroniser la demande, l offre et la production en temps reel.	Supply chain planning	strategique	2021-05-31	actif	480000	84	1900	Canada	2027-05-30	2026-04-05 02:48:23.887981+01	\N	2026-03-31	530000
101	supplier	Kofax	Kofax, Inc.	US-KF-309-551-118	https://www.kofax.com	info@kofax.com	+1 949 000 0000	Irvine, California, United States	https://logo.clearbit.com/kofax.com	Solutions d automatisation intelligente (capture, OCR, RPA, workflow) pour digitaliser documents et automatiser les processus metiers.	Intelligent automation / Capture	actif	2020-11-09	inactif	160000	56	2500	United States	2026-01-31	2026-04-05 02:48:26.217564+01	\N	2025-01-31	80000
102	supplier	Kong	Kong Inc.	US-KG-118-662-771	https://konghq.com	info@konghq.com	+1 415 000 0000	San Francisco, California, United States	https://logo.clearbit.com/konghq.com	Plateforme de gestion d API et service connectivity (API gateway, mesh, ingress) pour securiser et gouverner les microservices.	API management / Gateway	actif	2022-02-07	actif	210000	82	900	United States	2026-12-31	2026-04-05 02:48:28.811323+01	\N	2026-03-31	220000
103	supplier	Kyriba	Kyriba Corp.	US-KY-551-118-992	https://www.kyriba.com	info@kyriba.com	+1 858 000 0000	San Diego, California, United States	https://logo.clearbit.com/kyriba.com	Plateforme de tresorerie et finance (TMS) pour gestion de liquidite, paiements, risques, rapprochements et connectivite bancaire.	Treasury / TMS	strategique	2021-01-11	actif	420000	84	2200	United States	2027-01-10	2026-04-05 02:48:31.521529+01	\N	2026-03-31	460000
104	supplier	Lenovo	Lenovo Group Limited	HK-LN-220-771-118	https://www.lenovo.com	info@lenovo.com	+852 0000 0000	23/F, Lincoln House, Taikoo Place, 979 Kings Road, Quarry Bay, Hong Kong	https://logo.clearbit.com/lenovo.com	Fabricant de materiel informatique (PC, serveurs, stockage) et solutions pour environnements entreprise et edge, avec services associes.	Hardware / Devices	strategique	2020-04-20	actif	620000	84	75000	Hong Kong	2027-04-19	2026-04-05 02:48:34.000842+01	\N	2026-03-31	680000
106	supplier	Magento (Adobe)	Adobe Inc.	US-AD-774-118-330	https://business.adobe.com/products/magento/magento-commerce.html	info@adobe.com	+1 408 536 6000	345 Park Avenue, San Jose, CA 95110, United States	https://logo.clearbit.com/adobe.com	Plateforme e-commerce (Adobe Commerce, ex Magento) pour creer des boutiques en ligne B2C/B2B, gerer catalogues, commandes et experiences d achat.	E-commerce platform	strategique	2021-03-15	termine	520000	85	29000	United States	2026-03-14	2026-04-05 02:48:39.027292+01	\N	2025-03-14	480000
108	supplier	Manhattan Associates	Manhattan Associates, Inc.	US-MA-118-330-774	https://www.manh.com	info@manh.com	+1 770 000 0000	2300 Windy Ridge Pkwy SE, Atlanta, GA 30339, United States	https://logo.clearbit.com/manh.com	Solutions de gestion d execution supply chain (WMS, TMS, order management) pour optimiser entrepots, livraison et commandes omnicanales.	Supply chain execution / WMS	strategique	2020-09-07	actif	580000	84	4600	United States	2027-09-06	2026-04-05 02:48:46.502536+01	\N	2026-03-31	640000
109	supplier	MapR (HPE)	Hewlett Packard Enterprise Company	US-HPE-309-662-118	https://www.hpe.com	info@hpe.com	+1 650 857 1501	1701 E Mossy Oaks Rd, Spring, TX 77389, United States	https://logo.clearbit.com/hpe.com	Technologies data (heritage MapR) integrees aux offres HPE, autour de plateformes data distribuées pour analytics et workloads temps reel.	Data platform / Distributed	basique	2017-06-05	termine	80000	48	60000	United States	2023-06-04	2026-04-05 02:48:48.923113+01	\N	2023-06-04	50000
111	supplier	Microsoft	Microsoft Corporation	US-MS-330-118-774	https://www.microsoft.com	info@microsoft.com	+1 425 882 8080	One Microsoft Way, Redmond, WA 98052, United States	https://logo.clearbit.com/microsoft.com	Groupe technologique proposant cloud (Azure), suites de productivite, outils de developpement, securite et solutions entreprise.	Cloud / Enterprise software	exclusif	2019-03-25	actif	1500000	88	220000	United States	2029-03-24	2026-04-05 02:48:53.205405+01	\N	2026-03-31	1700000
112	supplier	MicroStrategy	MicroStrategy Incorporated	US-MST-551-118-220	https://www.microstrategy.com	info@microstrategy.com	+1 703 848 8600	1850 Towers Crescent Plaza, Tysons Corner, VA 22182, United States	https://logo.clearbit.com/microstrategy.com	Plateforme de business intelligence et analytics pour tableaux de bord, reporting et analyse a grande echelle, avec mobilite et gouvernance.	BI / Analytics	actif	2022-05-23	actif	210000	80	2500	United States	2026-05-22	2026-04-05 02:48:55.273107+01	\N	2026-03-31	220000
113	supplier	MongoDB	MongoDB, Inc.	US-MDB-774-551-118	https://www.mongodb.com	info@mongodb.com	+1 646 000 0000	1633 Broadway, 38th Floor, New York, NY 10019, United States	https://logo.clearbit.com/mongodb.com	Base de donnees NoSQL orientee documents et plateforme developpeur (Atlas) pour construire des applications modernes avec scalabilite et flexibilite.	Database / NoSQL	strategique	2020-01-27	actif	620000	86	5000	United States	2029-01-26	2026-04-05 02:48:57.471784+01	\N	2026-03-31	700000
114	supplier	MuleSoft (Salesforce)	Salesforce, Inc.	US-SF-118-330-551	https://www.mulesoft.com	info@salesforce.com	+1 415 901 7000	415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States	https://logo.clearbit.com/salesforce.com	Plateforme d integration (iPaaS) et gestion d API (Anypoint) pour connecter applications, donnees et services a l echelle entreprise.	iPaaS / API management	exclusif	2021-06-14	actif	900000	87	75000	United States	2028-06-13	2026-04-05 02:48:59.741047+01	\N	2026-03-31	1000000
115	supplier	Neo4j	Neo4j, Inc.	US-N4J-220-118-774	https://neo4j.com	info@neo4j.com	+1 415 000 0000	San Mateo, California, United States	https://logo.clearbit.com/neo4j.com	Base de donnees graphe pour modeliser et interroger des relations complexes (fraude, recommandations, knowledge graphs) avec haute performance.	Database / Graph	actif	2023-01-16	termine	190000	81	1300	United States	2026-01-30	2026-04-05 02:49:01.983013+01	\N	2025-01-30	170000
117	supplier	New Relic	New Relic, Inc.	US-NR-309-551-774	https://newrelic.com	info@newrelic.com	+1 415 000 0000	1100 Peachtree St NE, Suite 2000, Atlanta, GA 30309, United States	https://logo.clearbit.com/newrelic.com	Plateforme d observabilite (APM, logs, traces) pour surveiller la performance applicative et l experience, avec dashboards et alerting.	Observability / APM	actif	2022-03-28	termine	220000	81	2500	United States	2026-03-27	2026-04-05 02:49:09.027733+01	\N	2025-03-27	200000
118	supplier	Nexthink	Nexthink SA	CH-NX-551-220-774	https://www.nexthink.com	info@nexthink.com	+41 21 000 0000	Chemin de Blandonnet 10, 1214 Vernier, Switzerland	https://logo.clearbit.com/nexthink.com	Plateforme de digital employee experience (DEX) pour mesurer l experience utilisateur, diagnostiquer les problemes et optimiser les postes de travail.	DEX / Endpoint analytics	actif	2023-09-04	actif	170000	80	1200	Switzerland	2026-09-03	2026-04-05 02:49:11.668947+01	\N	2026-03-31	180000
119	supplier	NICE	NICE Ltd.	IL-NC-309-118-551	https://www.nice.com	info@nice.com	+972 9 000 0000	13 Zarchin St, Ra anana, Israel	https://logo.clearbit.com/nice.com	Solutions CX et centre de contact (CCaaS) avec analytics, workforce management et automatisation, pour optimiser les interactions client.	Customer experience / Contact center	strategique	2021-10-18	actif	620000	85	8000	Israel	2027-10-17	2026-04-05 02:49:15.418845+01	\N	2026-03-31	680000
120	supplier	Nintex	Nintex UK Ltd.	UK-NX-662-118-330	https://www.nintex.com	info@nintex.com	+44 20 0000 0000	London, United Kingdom	https://logo.clearbit.com/nintex.com	Plateforme d automatisation des processus et workflows (forms, approvals, RPA leger) pour digitaliser les procedures metiers et gagner en efficacite.	Workflow / Process automation	actif	2022-06-20	termine	140000	57	1200	United Kingdom	2025-02-28	2026-04-05 02:49:17.80388+01	\N	2025-02-28	100000
121	supplier	Nuance Communications	Nuance Communications, Inc.	US-NU-551-774-118	https://www.nuance.com	info@nuance.com	+1 781 000 0000	1 Wayside Rd, Burlington, MA 01803, United States	https://logo.clearbit.com/nuance.com	Solutions de reconnaissance vocale et IA conversationnelle (speech-to-text, voice biometrics) largement utilisees dans la sante et les centres de contact.	Conversational AI / Speech	strategique	2020-02-10	termine	520000	63	7000	United States	2024-12-31	2026-04-05 02:49:20.405015+01	\N	2024-12-31	350000
122	supplier	Nutanix	Nutanix, Inc.	US-NTX-330-118-774	https://www.nutanix.com	info@nutanix.com	+1 855 688 2649	1740 Technology Dr, San Jose, CA 95110, United States	https://logo.clearbit.com/nutanix.com	Plateforme d infrastructure hyperconvergee et cloud hybride, pour simplifier le datacenter, la virtualisation et la gestion multi-cloud.	Cloud infrastructure / HCI	strategique	2021-01-25	inactif	680000	85	7000	United States	2027-01-24	2026-04-05 02:49:24.29431+01	\N	2025-12-31	500000
123	supplier	NGINX	F5, Inc. (NGINX)	US-F5-774-309-118	https://www.nginx.com	info@f5.com	+1 206 272 5555	801 5th Ave, Seattle, WA 98104, United States	https://logo.clearbit.com/nginx.com	Serveur web et reverse proxy populaire, avec offres pour load balancing, API gateway et gestion du trafic applicatif en environnement cloud.	Web server / Load balancing	actif	2020-09-14	actif	220000	82	6500	United States	2026-09-13	2026-04-05 02:49:27.131887+01	\N	2026-03-31	240000
124	supplier	NVIDIA	NVIDIA Corporation	US-NV-118-551-774	https://www.nvidia.com	info@nvidia.com	+1 408 486 2000	2788 San Tomas Expy, Santa Clara, CA 95051, United States	https://logo.clearbit.com/nvidia.com	Concepteur de GPU et plateformes de calcul accelere pour IA, HPC et graphisme, avec solutions datacenter et logiciels CUDA.	Semiconductors / AI compute	exclusif	2020-11-23	actif	1250000	99	30000	United States	2028-11-22	2026-04-05 02:49:37.380331+01	\N	2026-03-31	1550000
125	supplier	Okta	Okta, Inc.	US-OK-330-774-118	https://www.okta.com	info@okta.com	+1 888 722 7871	100 1st Street, San Francisco, CA 94105, United States	https://logo.clearbit.com/okta.com	Plateforme IAM (SSO, MFA, gestion du cycle de vie) pour securiser l acces aux applications et identites des employes et clients.	Cybersecurity / IAM	strategique	2021-06-28	actif	700000	86	6000	United States	2027-06-27	2026-04-05 02:49:50.77778+01	\N	2026-03-31	780000
127	supplier	OpenText	Open Text Corporation	CA-OT-774-118-330	https://www.opentext.com	info@opentext.com	+1 519 888 7111	275 Frank Tompa Dr, Waterloo, ON N2L 0A1, Canada	https://logo.clearbit.com/opentext.com	Solutions d information management (ECM, archiving, eDiscovery, integration) pour gerer le cycle de vie documentaire et la conformite.	ECM / Information management	strategique	2020-06-15	termine	720000	97	23000	Canada	2022-06-14	2026-04-05 02:49:57.152155+01	\N	2022-06-14	700000
128	supplier	Oracle	Oracle Corporation	US-OR-774-118-330	https://www.oracle.com	info@oracle.com	+1 737 867 1000	2300 Oracle Way, Austin, TX 78741, United States	https://logo.clearbit.com/oracle.com	Editeur de logiciels et cloud (bases de donnees, ERP, middleware, infrastructure) pour entreprises, avec offres SaaS et cloud OCI.	Enterprise software / Cloud	exclusif	2019-04-01	actif	1350000	87	160000	United States	2029-03-31	2026-04-05 02:50:00.813797+01	\N	2026-03-31	1500000
129	supplier	OutSystems	OutSystems - Software Em Rede, S.A.	PT-OS-220-551-118	https://www.outsystems.com	info@outsystems.com	+351 21 000 0000	Rua do Centro Cultural 4, 1700-106 Lisbon, Portugal	https://logo.clearbit.com/outsystems.com	Plateforme low-code pour developper et moderniser des applications, avec deploiement cloud, integration et gouvernance entreprise.	Low-code platform	strategique	2021-03-22	actif	520000	99	2000	Portugal	2027-03-21	2026-04-05 02:50:02.975793+01	\N	2026-03-31	650000
130	supplier	Palantir	Palantir Technologies Inc.	US-PL-118-774-551	https://www.palantir.com	info@palantir.com	+1 720 000 0000	1200 17th Street, Floor 15, Denver, CO 80202, United States	https://logo.clearbit.com/palantir.com	Plateforme de data integration et analytics (Gotham, Foundry) pour exploiter des donnees complexes, soutenir la decision et operationaliser l IA.	Data analytics / Decision intelligence	strategique	2020-02-17	inactif	780000	30	4000	United States	2027-02-16	2026-04-05 02:50:05.091847+01	\N	2024-12-31	150000
133	supplier	Planview	Planview, Inc.	US-PV-309-662-118	https://www.planview.com	info@planview.com	+1 512 000 0000	Austin, Texas, United States	https://logo.clearbit.com/planview.com	Solutions de gestion de portefeuille projets (PPM) et planification du travail pour prioriser initiatives, capacites et execution agile.	PPM / Work management	actif	2023-04-17	actif	180000	89	1400	United States	2026-04-16	2026-04-05 02:50:12.442635+01	\N	2026-03-31	200000
134	supplier	PostgreSQL Inc.	EnterpriseDB Corporation (EDB)	US-EDB-220-118-551	https://www.enterprisedb.com	info@enterprisedb.com	+1 781 357 3390	1601 Trapelo Rd, Suite 265, Waltham, MA 02451, United States	https://logo.clearbit.com/enterprisedb.com	Support et services entreprise autour de PostgreSQL (EDB), incluant outils, securite, haute disponibilite et migration pour bases de donnees critiques.	Database / PostgreSQL services	actif	2022-11-14	inactif	160000	32	3000	United States	2026-11-13	2026-04-05 02:50:14.858739+01	\N	2025-11-13	40000
135	supplier	PTC	PTC Inc.	US-PTC-551-118-774	https://www.ptc.com	info@ptc.com	+1 781 370 5000	121 Seaport Blvd, Boston, MA 02210, United States	https://logo.clearbit.com/ptc.com	Editeur de solutions industrielles (PLM, CAD, IoT) pour conception produit, gestion du cycle de vie et transformation industrielle.	Industrial software / PLM / IoT	strategique	2020-09-21	actif	700000	96	7000	United States	2027-09-20	2026-04-05 02:50:17.596951+01	\N	2026-03-31	850000
136	supplier	Pure Storage	Pure Storage, Inc.	US-PS-330-551-118	https://www.purestorage.com	info@purestorage.com	+1 650 000 0000	650 Castro St, Suite 300, Mountain View, CA 94041, United States	https://logo.clearbit.com/purestorage.com	Solutions de stockage flash et data platform pour datacenters modernes, avec haute performance, resilence et services de gestion cloud.	Storage / Data infrastructure	strategique	2021-10-11	actif	620000	96	5500	United States	2027-10-10	2026-04-05 02:50:20.689431+01	\N	2026-03-31	750000
137	supplier	Qlik	QlikTech International AB	SE-QL-774-118-220	https://www.qlik.com	info@qlik.com	+46 8 000 0000	Sveavagen 9, 111 57 Stockholm, Sweden	https://logo.clearbit.com/qlik.com	Plateforme d analytics et integration de donnees (Qlik Sense, QlikView, data integration) pour BI, visualisation et gouvernance des metriques.	BI / Data integration	strategique	2020-02-03	actif	560000	78	2500	Sweden	2029-02-02	2026-04-05 02:50:22.922567+01	\N	2026-03-31	540000
138	supplier	Qualys	Qualys, Inc.	US-QS-118-662-551	https://www.qualys.com	info@qualys.com	+1 650 000 0000	919 E Hillsdale Blvd, 4th Floor, Foster City, CA 94404, United States	https://logo.clearbit.com/qualys.com	Plateforme cloud de gestion des vulnerabilites et conformite (VMDR) pour detecter, evaluer et reduire les risques de securite.	Cybersecurity / Vulnerability management	strategique	2021-06-14	termine	520000	89	2300	United States	2025-06-13	2026-04-05 02:50:24.973321+01	\N	2025-06-13	480000
139	supplier	Rackspace	Rackspace Technology, Inc.	US-RS-551-220-662	https://www.rackspace.com	info@rackspace.com	+1 800 961 2888	19122 US Highway 281 N, Suite 128, San Antonio, TX 78258, United States	https://logo.clearbit.com/rackspace.com	Fournisseur de services manages multi-cloud (AWS, Azure, GCP) incluant migration, operations 24/7, securite et optimisation des couts.	Managed cloud services	actif	2022-09-12	inactif	180000	22	7000	United States	2028-02-28	2026-04-05 02:50:27.053607+01	\N	2024-12-31	20000
140	supplier	Rapid7	Rapid7, Inc.	US-R7-774-118-330	https://www.rapid7.com	info@rapid7.com	+1 617 000 0000	120 Causeway St, Suite 400, Boston, MA 02114, United States	https://logo.clearbit.com/rapid7.com	Solutions de securite (vulnerability management, SIEM, detection et reponse) pour reduire la surface d attaque et ameliorer la posture cyber.	Cybersecurity / Threat management	strategique	2021-01-04	termine	610000	90	3000	United States	2023-01-03	2026-04-05 02:50:29.334785+01	\N	2023-01-03	550000
141	supplier	Red Hat (IBM)	Red Hat, Inc.	US-RH-220-774-118	https://www.redhat.com	info@redhat.com	+1 919 754 3700	100 East Davie Street, Raleigh, NC 27601, United States	https://logo.clearbit.com/redhat.com	Editeur open source entreprise (Linux, Kubernetes/OpenShift, middleware) pour cloud hybride et modernisation applicative.	Open source / Kubernetes	exclusif	2020-01-06	actif	980000	97	20000	United States	2028-01-05	2026-04-05 02:50:33.218192+01	\N	2026-03-31	1200000
143	supplier	RSA	RSA Security LLC	US-RSA-309-551-774	https://www.rsa.com	info@rsa.com	+1 781 000 0000	Bedford, Massachusetts, United States	https://logo.clearbit.com/rsa.com	Solutions de securite (MFA, gestion des identites, gouvernance et detection) avec un historique fort dans l authentification et la protection des acces.	Cybersecurity / IAM	actif	2020-05-18	inactif	180000	26	2000	United States	2026-01-31	2026-04-05 02:50:37.505014+01	\N	2025-01-31	30000
144	supplier	Rubrik	Rubrik, Inc.	US-RB-774-118-551	https://www.rubrik.com	info@rubrik.com	+1 855 782 8745	1001 Page Mill Rd, Palo Alto, CA 94304, United States	https://logo.clearbit.com/rubrik.com	Plateforme de sauvegarde et cyber resilience (backup, recovery, ransomware protection) pour proteger les donnees on-prem et cloud.	Data protection / Backup	strategique	2022-01-31	actif	680000	92	3000	United States	2027-01-30	2026-04-05 02:50:44.790187+01	\N	2026-03-31	800000
145	supplier	SailPoint	SailPoint Technologies, Inc.	US-SP-118-551-220	https://www.sailpoint.com	info@sailpoint.com	+1 512 000 0000	Austin, Texas, United States	https://logo.clearbit.com/sailpoint.com	Plateforme de gouvernance des identites (IGA) pour gerer les acces, droits, certifications et conformite des identites en entreprise.	Cybersecurity / IGA	strategique	2021-08-16	actif	620000	89	2500	United States	2032-08-15	2026-04-05 02:50:47.09182+01	\N	2026-03-31	700000
146	supplier	Salesforce	Salesforce, Inc.	US-SF-118-330-551	https://www.salesforce.com	info@salesforce.com	+1 415 901 7000	415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States	https://logo.clearbit.com/salesforce.com	Plateforme CRM et cloud d entreprise (Sales, Service, Marketing, Platform) pour gerer la relation client, l automatisation et les integrations.	CRM / Enterprise cloud	exclusif	2019-02-04	actif	1400000	89	75000	United States	2029-02-03	2026-04-05 02:50:49.181072+01	\N	2026-03-31	1550000
147	supplier	SAP	SAP SE	DE-SAP-551-118-330	https://www.sap.com	info@sap.com	+49 6227 7 47474	Dietmar-Hopp-Allee 16, 69190 Walldorf, Germany	https://logo.clearbit.com/sap.com	Editeur de logiciels enterprise (ERP, finance, supply chain, analytics) avec plateformes cloud et solutions sectorielles pour grandes organisations.	ERP / Enterprise software	exclusif	2019-06-03	actif	1500000	99	105000	Germany	2029-06-02	2026-04-05 02:50:51.303949+01	\N	2026-03-31	1800000
148	supplier	SAS	SAS Institute Inc.	US-SAS-774-118-551	https://www.sas.com	info@sas.com	+1 919 677 8000	100 SAS Campus Dr, Cary, NC 27513, United States	https://logo.clearbit.com/sas.com	Editeur de solutions analytics et data science (statistiques, ML, risk) largement utilisees en banque, assurance et industries reglementees.	Analytics / Data science	strategique	2020-10-19	actif	700000	90	13000	United States	2027-10-18	2026-04-05 02:50:53.455811+01	\N	2026-03-31	850000
149	supplier	ServiceNow	ServiceNow, Inc.	US-SN-118-551-774	https://www.servicenow.com	info@servicenow.com	+1 408 501 8550	2225 Lawson Ln, Santa Clara, CA 95054, United States	https://logo.clearbit.com/servicenow.com	Plateforme de digital workflow (ITSM, HR, CSM) pour automatiser les services, integrer les processus et ameliorer l experience employe et client.	Workflow / ITSM	exclusif	2020-01-20	actif	1200000	96	22000	United States	2029-01-19	2026-04-05 02:50:55.94478+01	\N	2026-03-31	1450000
150	supplier	Siemens	Siemens AG	DE-SIE-330-118-551	https://www.siemens.com	info@siemens.com	+49 89 636 00	Werner-von-Siemens-Strasse 1, 80333 Munich, Germany	https://logo.clearbit.com/siemens.com	Groupe industriel et technologique (automation, digital industries, energie) proposant logiciels et solutions pour l industrie et les infrastructures.	Industrial / Automation	strategique	2019-09-02	actif	900000	86	300000	Germany	2027-09-01	2026-04-05 02:50:58.328877+01	\N	2026-03-31	1000000
151	supplier	Sitecore	Sitecore Holding II A/S	DK-SC-551-118-662	https://www.sitecore.com	info@sitecore.com	+45 0 000 0000	Copenhagen, Denmark	https://logo.clearbit.com/sitecore.com	Plateforme d experience digitale (DXP) pour gestion de contenu, personnalisation et marketing automation afin d optimiser les parcours clients.	DXP / CMS	actif	2022-05-09	actif	240000	80	2200	Denmark	2026-12-31	2026-04-05 02:51:00.735036+01	\N	2026-03-31	250000
152	supplier	Slack (Salesforce)	Salesforce, Inc.	US-SF-118-330-551	https://slack.com	info@salesforce.com	+1 415 901 7000	415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States	https://logo.clearbit.com/slack.com	Plateforme de collaboration et messagerie d entreprise, integrable avec de nombreux outils et workflows pour accelerer la communication des equipes.	Collaboration / Messaging	strategique	2021-01-11	actif	520000	86	75000	United States	2027-01-10	2026-04-05 02:51:03.071368+01	\N	2026-03-31	600000
154	supplier	SolarWinds	SolarWinds Worldwide, LLC	US-SW-309-662-118	https://www.solarwinds.com	info@solarwinds.com	+1 512 000 0000	Austin, Texas, United States	https://logo.clearbit.com/solarwinds.com	Outils de supervision reseau et systeme (NPM, monitoring) pour administrer l infrastructure IT, diagnostiquer incidents et optimiser la performance.	IT monitoring / Network	actif	2021-11-29	inactif	160000	40	2500	United States	2026-02-28	2026-04-05 02:51:20.778367+01	\N	2025-02-28	40000
153	supplier	Snowflake	Snowflake Inc.	US-SN-774-118-330	https://www.snowflake.com	info@snowflake.com	+1 844 766 9353	450 Concar Dr, San Mateo, CA 94402, United States	https://logo.clearbit.com/snowflake.com	Plateforme cloud de data warehousing et data sharing pour consolider, analyser et gouverner les donnees, avec ecosysteme et marketplace.	Data warehouse / Cloud data	exclusif	2020-09-14	actif	1250000	99	8000	United States	2028-09-13	2026-04-05 02:51:07.942539+01	\N	2026-03-31	1600000
155	supplier	Sophos	Sophos Limited	UK-SO-551-118-220	https://www.sophos.com	info@sophos.com	+44 1865 000000	The Pentagon, Abingdon Science Park, Abingdon OX14 3YP, United Kingdom	https://logo.clearbit.com/sophos.com	Editeur de solutions de cybersécurite (endpoint, firewall, MDR) pour proteger postes, reseaux et utilisateurs, avec services de detection et reponse.	Cybersecurity / Endpoint	strategique	2022-03-14	actif	520000	84	4000	United Kingdom	2027-03-13	2026-04-05 02:51:23.562199+01	\N	2026-03-31	570000
156	supplier	Splunk	Splunk LLC	US-SPK-118-774-551	https://www.splunk.com	info@splunk.com	+1 415 848 8400	270 Brannan St, San Francisco, CA 94107, United States	https://logo.clearbit.com/splunk.com	Plateforme d analyse de donnees machine pour logs, SIEM et observabilite, permettant detection, investigation et monitoring a grande echelle.	SIEM / Observability	exclusif	2020-07-06	actif	1050000	97	8000	United States	2028-07-05	2026-04-05 02:51:26.340372+01	\N	2026-03-31	1300000
157	supplier	Stripe	Stripe, Inc.	US-ST-330-118-774	https://stripe.com	info@stripe.com	+1 415 000 0000	354 Oyster Point Blvd, South San Francisco, CA 94080, United States	https://logo.clearbit.com/stripe.com	Plateforme de paiements et d infrastructure financiere (payment processing, billing, treasury) pour les entreprises et plateformes digitales.	Payments / FinTech	exclusif	2021-09-20	actif	950000	90	8000	United States	2028-09-19	2026-04-05 02:51:28.504737+01	\N	2026-03-31	1100000
159	supplier	Tableau (Salesforce)	Salesforce, Inc.	US-SF-118-330-551	https://www.tableau.com	info@salesforce.com	+1 415 901 7000	415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States	https://logo.clearbit.com/tableau.com	Plateforme de visualisation et analytics (Tableau) pour creer des tableaux de bord interactifs et democratiseer l analyse au sein des organisations.	BI / Data visualization	strategique	2020-10-12	actif	720000	78	75000	United States	2027-10-11	2026-04-05 02:51:34.633316+01	\N	2026-03-31	700000
160	supplier	Talend	QlikTech International AB (Talend)	SE-QL-774-118-220	https://www.talend.com	info@qlik.com	+46 8 000 0000	Sveavagen 9, 111 57 Stockholm, Sweden	https://logo.clearbit.com/talend.com	Solutions d integration et qualite des donnees (ETL/ELT, data quality, governance) pour connecter sources, fiabiliser donnees et alimenter analytics.	Data integration / ETL	strategique	2010-04-26	actif	520000	84	2500	Sweden	2027-04-25	2026-04-05 02:51:36.799255+01	\N	2026-03-31	580000
161	supplier	Tanium	Tanium Inc.	US-TN-551-118-774	https://www.tanium.com	info@tanium.com	+1 510 000 0000	Emeryville, California, United States	https://logo.clearbit.com/tanium.com	Plateforme de gestion et securite des endpoints (inventaire temps reel, patching, compliance) pour environnements a grande echelle.	Endpoint management / Security	strategique	2022-05-30	actif	620000	85	2500	United States	2027-05-29	2026-04-05 02:51:38.861443+01	\N	2026-03-31	700000
162	supplier	Temenos	Temenos AG	CH-TM-118-551-220	https://www.temenos.com	info@temenos.com	+41 22 708 1150	2 Rue de l Ecole-de-Chimie, 1205 Geneva, Switzerland	https://logo.clearbit.com/temenos.com	Editeur de solutions core banking et digital banking pour banques et institutions financieres, avec offres cloud et modularite.	Core banking / Digital banking	exclusif	2020-03-09	actif	1050000	87	8000	Switzerland	2028-03-08	2026-04-05 02:51:41.13171+01	\N	2026-03-31	1200000
163	supplier	Tenable	Tenable, Inc.	US-TB-774-118-551	https://www.tenable.com	info@tenable.com	+1 410 000 0000	6100 Merriweather Dr, Columbia, MD 21044, United States	https://logo.clearbit.com/tenable.com	Solutions de cyber exposure et vulnerability management (Nessus, Tenable.io) pour identifier failles, prioriser remediation et reduire les risques.	Cybersecurity / Vulnerability management	strategique	2021-02-15	actif	560000	90	1800	United States	2027-02-14	2026-04-05 02:51:43.532575+01	\N	2026-03-31	680000
165	supplier	ThoughtSpot	ThoughtSpot, Inc.	US-TS-662-118-551	https://www.thoughtspot.com	info@thoughtspot.com	+1 800 000 0000	444 Castro St, Suite 1000, Mountain View, CA 94041, United States	https://logo.clearbit.com/thoughtspot.com	Plateforme d analytics orientee recherche et IA pour explorer les donnees, creer des insights et partager des tableaux de bord en self-service.	BI / Augmented analytics	actif	2023-05-08	actif	180000	60	1600	United States	2026-05-07	2026-04-05 02:51:50.547714+01	\N	2026-03-31	160000
164	supplier	Teradata	Teradata Corporation	US-TD-330-551-118	https://www.teradata.com	info@teradata.com	+1 858 000 0000	17095 Via Del Campo, San Diego, CA 92127, United States	https://logo.clearbit.com/teradata.com	Solutions d entrepot de donnees et analytics pour grandes entreprises, avec plateforme cloud et hybride pour workloads data intensifs.	Data warehouse / Analytics	strategique	2020-06-01	actif	680000	83	13000	United States	2027-05-31	2026-04-05 02:51:46.612267+01	\N	2026-03-31	750000
166	supplier	Tibco	TIBCO Software Inc.	US-TB-551-118-330	https://www.tibco.com	info@tibco.com	+1 650 000 0000	3307 Hillview Ave, Palo Alto, CA 94304, United States	https://logo.clearbit.com/tibco.com	Solutions d integration, messaging et analytics (heritage ESB/iPaaS) pour connecter systemes, traiter des flux et orchestrer des APIs.	Integration / Middleware	actif	2020-09-14	termine	220000	58	5000	United States	2025-09-13	2026-04-05 02:51:54.734509+01	\N	2025-09-13	120000
167	supplier	Tricentis	Tricentis GmbH	AT-TR-220-551-118	https://www.tricentis.com	info@tricentis.com	+43 1 0000 0000	Modecenterstrasse 22, 1030 Vienna, Austria	https://logo.clearbit.com/tricentis.com	Plateforme de test logiciel (test automation, performance, qTest) pour accelerer la qualite et la livraison, notamment pour environnements enterprise.	Software testing / QA	actif	2022-11-21	actif	240000	81	2500	Austria	2026-12-31	2026-04-05 02:51:56.710306+01	\N	2026-03-31	260000
168	supplier	UiPath	UiPath Inc.	US-UP-774-118-551	https://www.uipath.com	info@uipath.com	+1 844 432 0455	90 Park Ave, New York, NY 10016, United States	https://logo.clearbit.com/uipath.com	Plateforme d automatisation (RPA et automation end-to-end) pour automatiser processus metiers, integrer IA et gouverner des robots a l echelle.	RPA / Automation	exclusif	2020-01-13	actif	1100000	98	4000	United States	2028-01-12	2026-04-05 02:51:58.684816+01	\N	2026-03-31	1350000
169	supplier	UKG (Ultimate Kronos Group)	UKG Inc.	US-UKG-309-551-118	https://www.ukg.com	info@ukg.com	+1 800 000 0000	900 Chelmsford St, Lowell, MA 01851, United States	https://logo.clearbit.com/ukg.com	Solutions HCM et workforce management (paie, temps et activites, planification) pour gerer RH et operations des effectifs.	HCM / Workforce management	strategique	2021-07-05	actif	680000	84	15000	United States	2027-07-04	2026-04-05 02:52:00.810522+01	\N	2026-03-31	750000
170	supplier	VMware	VMware, Inc.	US-VM-118-774-330	https://www.vmware.com	info@vmware.com	+1 877 486 9273	3401 Hillview Ave, Palo Alto, CA 94304, United States	https://logo.clearbit.com/vmware.com	Editeur de virtualisation et cloud infrastructure (vSphere, NSX, vSAN) pour moderniser le datacenter et supporter des environnements hybrides.	Virtualization / Cloud infrastructure	exclusif	2019-11-04	actif	1200000	73	38000	United States	2028-11-03	2026-04-05 02:52:03.060855+01	\N	2026-03-31	1150000
171	supplier	Vlocity (Salesforce)	Salesforce, Inc.	US-SF-118-330-551	https://www.vlocity.com	info@salesforce.com	+1 415 901 7000	415 Mission Street, 3rd Floor, San Francisco, CA 94105, United States	https://logo.clearbit.com/vlocity.com	Solutions sectorielles (industrie cloud) integrees a Salesforce, visant telecom, assurance et utilities avec modeles de donnees et processus preconfigures.	Industry cloud / CRM	strategique	2021-09-06	actif	520000	68	75000	United States	2027-09-05	2026-04-05 02:52:05.348917+01	\N	2026-03-31	450000
172	supplier	Workday	Workday, Inc.	US-WD-551-118-774	https://www.workday.com	info@workday.com	+1 925 951 9000	6110 Stoneridge Mall Rd, Pleasanton, CA 94588, United States	https://logo.clearbit.com/workday.com	Suite cloud HCM et finance pour gerer RH, paie, planification et finances, avec reporting et analytics integres.	HCM / ERP	exclusif	2020-10-26	actif	1250000	94	20000	United States	2028-10-25	2026-04-05 02:52:07.741077+01	\N	2026-03-31	1400000
173	supplier	Workato	Workato, Inc.	US-WK-662-118-551	https://www.workato.com	info@workato.com	+1 650 000 0000	Palo Alto, California, United States	https://logo.clearbit.com/workato.com	Plateforme d automatisation et integration (iPaaS) orientee recettes (recipes) pour orchestrer workflows entre applications SaaS et services.	iPaaS / Automation	actif	2023-10-16	actif	170000	72	1200	United States	2026-10-15	2026-04-05 02:52:10.076616+01	\N	2026-03-31	170000
174	supplier	Zscaler	Zscaler, Inc.	US-ZS-330-551-118	https://www.zscaler.com	info@zscaler.com	+1 408 533 0288	120 Holger Way, San Jose, CA 95134, United States	https://logo.clearbit.com/zscaler.com	Plateforme Zero Trust et SASE pour securiser l acces aux applications et internet, avec inspection du trafic et protection des donnees.	Cybersecurity / Zero Trust / SASE	exclusif	2021-01-18	actif	1200000	99	7000	United States	2028-01-17	2026-04-05 02:52:12.538261+01	\N	2026-03-31	1500000
22	customer	Amen Bank	Amen Bank	TN-AMEN-2345678	www.amenbank.com.tn	contact@amenbank.tn	+216 71 351 155	Avenue Mohamed V, Tunis	https://logo.clearbit.com/amenbank.com	Banque tunisienne majeure.	Banking	exclusif	2019-11-01	actif	2800000	98	1500	Tunisie	2026-11-01	2026-04-12 13:54:23.09302+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2026-03-31	2800000
20	supplier	Bureau & Co	Bureau & Co Tunisie	TN-BC-9023456	www.bureauco.com.tn	ventes@bureauco.tn	+216 71 357 159	Zone Industrielle Charguia, Tunis	https://logo.clearbit.com/bureauco.com	Fournitures de bureau et mobilier.	Coworking	actif 	2023-01-30	termine	240000	78	15	Tunisie	2025-01-01	2026-04-05 02:41:52.980077+01	$2b$10$Fx.jJIyBlCT1R5XBgBw1GO9uhGh5G6WAer9lAj8ec2zcYhhhXh/hW	2025-01-01	180000
4	university	Université de Tunis El Manar	Université de Tunis El Manar	TN-UTM-4567890	www.utm.rnu.tn	partenariats@utm.rnu.tn	+216 71 873 422	Campus Universitaire Farhat Hached, BP 94, 1068 Tunis, Tunisie	https://logo.clearbit.com/utm.com	Université publique majeure avec plusieurs facultés.	Université	actif	2025-01-31	actif	20000	76	3000	Tunisie	2029-12-01	2026-04-05 02:55:20.524296+01	$2b$10$K6EvVaItbs0hQrsVp3YRoOaHjOIxC68vnql48PkMrTSs1nT12b3Ya	2024-12-01	20000
8	marketing	Gymway Tunisie	Gymway Fitness	TN-GYMWAY-0173446	www.gymway.tn	corporate@gymway.tn	+216 71 456 789	Avenue de la Bourse, Les Berges du Lac, Tunis	https://logo.clearbit.com/gymway.com	Réseau de salles de sport avec abonnements d'entreprise.	Sport	actif 	2026-01-01	actif	50000	98	11	Tunisie	2029-07-11	2026-04-05 02:55:32.824329+01	$2b$10$sWixmbhr2K7Z850q0emkeejWGpzp.vLXtbmEp433gTue9R0zsvsWu	2026-03-31	50000
12	marketing	Carthage Cinéma	Carthage Cinéma	TN-CC-6923456	www.carthagecinema.tn	contact@carthagecinema.tn	+216 71 951 753	Cité Ennasr, Tunis	https://logo.clearbit.com/carthagecinema.com	Chaîne de cinémas avec billets à prix réduit.	Culture	actif 	2022-10-01	actif	300000	96	200	Tunisie	2027-10-01	2026-04-05 02:55:39.309075+01	$2b$10$ksLhyNCvgYk68ympLK2K4.lu10/ZwpksGa04Rkd3lc/XkgMcnowgW	2026-03-31	180000
37	supplier	Apple	Apple Inc.	US-APL-301-665-902	https://www.apple.com	info@apple.com	+1 408 996 1010	One Apple Park Way, Cupertino, CA 95014, United States	https://logo.clearbit.com/apple.com	Entreprise technologique proposant des produits et services (macOS, iOS, appareils, services cloud) utilisés en environnement professionnel et grand public.	Hardware / Ecosystem	stratégique	2021-01-25	actif	700000	87	160000	United States	2027-01-24	2026-04-05 02:43:02.900841+01	\N	2026-03-31	780000
43	supplier	Backbase	Backbase B.V.	NL-BB-640-998-215	https://www.backbase.com	info@backbase.com	+31 20 808 3000	Oosterdoksstraat 114, 1011 DK Amsterdam, Netherlands	https://logo.clearbit.com/backbase.com	Plateforme d'experience digitale bancaire (digital banking) pour créer des parcours omnicanaux, portail client et onboarding avec une approche composable.	Digital banking / CX	strategique	2022-05-16	actif	720000	86	2000	Netherlands	2027-05-15	2026-04-05 02:43:34.997592+01	\N	2026-03-31	800000
2	university	INSAT (Institut National des Sciences Appliquées et de Technologie)	INSAT	TN-INSAT-7413789	www.insat.rnu.tn	relations-entreprises@insat.rnu.tn	+216 71 703 828	Centre Urbain Nord, BP 676, 1080 Tunis Cedex, Tunisie	https://logo.clearbit.com/insat.com	École d'ingénieurs publique proposant des formations pluridisciplinaires.	école_ingénieur	actif	2024-01-01	inactif	120000	44	680	Tunisie	2028-01-01	2026-04-12 13:54:23.105422+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2025-01-01	120000
1	university	ESPRIT (École Supérieure Privée d'Ingénierie et de Technologie)	\N	TN-ESPRIT-7563456	\N	partenariats@esprit.tn	\N	\N	\N	\N	école_ingénieur	exclusif	2020-01-01	termine	1800000	95	\N	Tunisie	2024-01-01	2026-04-12 23:32:49.173964+01	$2b$10$1pTUlZfpNBMFzTxKN2U.Zu1ChqjxAeseR9I9yE/hi9e3jDB6EXH66	2024-01-01	1800000
57	supplier	Coupa	Coupa Software Incorporated	US-CP-301-774-590	https://www.coupa.com	info@coupa.com	+1 650 000 0000	185 Hamilton Ave, Palo Alto, CA 94301, United States	https://logo.clearbit.com/coupa.com	Plateforme de gestion des depenses (procure-to-pay, sourcing, facturation) pour controler les achats, ameliorer la conformite et optimiser les couts.	Spend management / Procurement	strategique	2021-10-04	actif	520000	84	3000	United States	2027-10-03	2026-04-05 02:45:08.211992+01	\N	2026-03-31	570000
75	supplier	Everteam	Everteam SAS	FR-EV-118-663-774	https://www.everteam.com	info@everteam.com	+33 1 84 25 30 00	7 rue de la Paix, 75002 Paris, France	https://logo.clearbit.com/everteam.com	Editeur de solutions de gestion de contenu et d archivage (ECM/records management) pour digitaliser, classer et conserver les documents en conformite.	ECM / Archiving	actif	2022-01-10	actif	130000	79	350	France	2026-12-31	2026-04-05 02:47:02.193798+01	\N	2026-03-31	140000
91	supplier	Hortonworks (Cloudera)	Cloudera, Inc.	US-CLD-880-214-506	https://www.cloudera.com	info@cloudera.com	+1 650 000 0000	3340 Peachtree Rd NE, Suite 775, Atlanta, GA 30326, United States	https://logo.clearbit.com/cloudera.com	Ecosysteme big data issu d Hortonworks, aujourd hui integre a Cloudera, autour d Hadoop et de la gestion de plateformes data en entreprise.	Data platform / Big data	basique	2018-03-12	termine	90000	50	2700	United States	2024-03-11	2026-04-05 02:47:57.354728+01	\N	2024-03-11	60000
110	supplier	Mendix	Mendix Technology B.V.	NL-MX-774-118-662	https://www.mendix.com	info@mendix.com	+31 0 000 0000	Wilhelminakade 197, 3072 AP Rotterdam, Netherlands	https://logo.clearbit.com/mendix.com	Plateforme low-code pour developper rapidement des applications metiers, avec modelisation, deploiement cloud et gouvernance.	Low-code platform	strategique	2021-11-15	actif	520000	84	5000	Netherlands	2027-11-14	2026-04-05 02:48:51.18973+01	\N	2026-03-31	580000
126	supplier	OneStream	OneStream Software LLC	US-OS-551-118-774	https://www.onestream.com	info@onestream.com	+1 248 000 0000	Rochester, Michigan, United States	https://logo.clearbit.com/onestream.com	Plateforme CPM pour consolidation financiere, planification et reporting, avec workflows de cloture et gouvernance des donnees finance.	CPM / Financial consolidation	strategique	2012-02-21	inactif	540000	85	1500	United States	2027-02-20	2026-04-05 02:49:54.650905+01	\N	2025-12-31	400000
142	supplier	Reltio	Reltio, Inc.	US-RT-662-118-551	https://www.reltio.com	info@reltio.com	+1 650 000 0000	Redwood City, California, United States	https://logo.clearbit.com/reltio.com	Plateforme cloud de master data management (MDM) et customer 360 pour unifier les donnees, gerer identites et activer des vues fiables.	MDM / Customer 360	actif	2023-06-05	actif	160000	80	900	United States	2026-06-04	2026-04-05 02:50:35.262692+01	\N	2026-03-31	170000
158	supplier	Sumo Logic	Sumo Logic, Inc.	US-SL-662-118-551	https://www.sumologic.com	info@sumologic.com	+1 650 000 0000	Redwood City, California, United States	https://logo.clearbit.com/sumologic.com	Plateforme cloud de logs et observabilite pour collecter, analyser et surveiller donnees machine, avec use cases securite et operations.	Log analytics / Observability	actif	2023-02-27	actif	170000	79	1000	United States	2026-02-26	2026-04-05 02:51:30.654917+01	\N	2026-03-31	180000
177	customer	test	test	TN45871	www.test.com	test@gmail.com	54789625	testttt	https.test	testtt	test	Standard	2025-02-11	actif	50000	95	100	Tunisie	2026-04-30	2026-04-12 00:44:41.698316+01	\N	\N	150000
178	customer	TestCorp SA	TestCorp Société Anonyme	\N	https://testcorp.tn	ali@testcorp.tn	+216 71 123 456	123 Rue de la Liberté, Tunis	\N	Entreprise de services informatiques	Services IT	Gold	2026-04-13	actif	\N	\N	250	Tunisie	\N	2026-04-13 12:00:16.095766+01	$2b$10$t8MgcrFvCaEoVuhIZ9gbluTC4xFp24epxkSkPuGOazARmqLpngCFi	\N	\N
179	university	INSAT	\N	\N	\N	sana@insat.tn	\N	\N	\N	\N	\N	Standard	2026-04-13	actif	\N	\N	\N	\N	\N	2026-04-13 12:00:16.441615+01	$2b$10$rnw6cMpLvWcHZlQscyA7lejzmyGfLNXx7ZhYCrqQ0VFQH4Hre82N2	\N	\N
180	marketing	test2	test22	\N	https://www.test.com	chouk@test2.tn	+21650398661	adresse	\N	test test test	cloud	Standard	2026-04-13	actif	\N	\N	500	tunisie	\N	2026-04-13 12:11:48.486064+01	$2b$10$6PWu0lIxCKYVt5MMV4j.PeczAaoVzh2PgBNlULV./u8QROzTV.3tO	\N	\N
181	customer	test221	test221	\N	https://www.test221.com	chouk@test221.tn	+21650398661	adressee	\N	hhajqknjskikaqhsik	cloud	Standard	2026-04-13	actif	\N	\N	501	tunisie	\N	2026-04-13 12:36:03.754903+01	$2b$10$EpCkBUt0LEEJF/ec92VkqOH0JCg2TCNImckS6ADMk7Qx4bfGbSNiW	\N	\N
182	university	INSAT	\N	\N	\N	sana@insat.tn	\N	\N	\N	\N	\N	Standard	2026-04-13	actif	\N	\N	\N	\N	\N	2026-04-13 17:04:40.816352+01	$2b$10$y3JYhr89Hj3RWJ7ethfh4eoIZo2c8OsVbnm6mAV064liWEqlsiM9e	\N	\N
183	customer	TestCorp SA	TestCorp Société Anonyme	\N	https://testcorp.tn	ali@testcorp.tn	+216 71 123 456	123 Rue de la Liberté, Tunis	\N	Entreprise de services informatiques	Services IT	Gold	2026-04-14	actif	\N	\N	250	Tunisie	\N	2026-04-14 12:07:54.142261+01	$2b$10$WpcBXAuxeGxyAh8QMOAxcO0D9r/AGVXPHp7JmYQWmJ0ag65MWqOxy	\N	\N
176	supplier	Test Partenaire Fix	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	2024-01-15	actif	\N	\N	\N	Tunisie	\N	2026-04-14 14:59:14.585322+01	\N	\N	\N
\.


--
-- Data for Name: partnership_requests; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partnership_requests (id, company_name, legal_name, contact_first_name, contact_last_name, contact_email, contact_phone, contact_role, website, description, country, address, num_employees, annual_revenue, category, partner_subcategory, partnership_level, motivations, university_data, technology_data, status, is_accepted, reviewed_by, reviewed_at, rejection_reason, created_partner_id, created_at, updated_at) FROM stdin;
1	TestCorp SA	TestCorp Société Anonyme	Ali	Ben Ahmed	ali@testcorp.tn	+216 71 123 456	Directeur Commercial	https://testcorp.tn	Entreprise de services informatiques	Tunisie	123 Rue de la Liberté, Tunis	250	5000000	customer	Services IT	Gold	Nous souhaitons collaborer avec Capgemini pour nos projets de transformation digitale.	\N	\N	en_attente	\N	\N	\N	\N	\N	2026-04-13 11:58:51.163827+01	2026-04-13 11:58:51.163827+01
2	INSAT	\N	Sana	Mhadhbi	sana@insat.tn	\N	\N	\N	\N	\N	\N	\N	\N	university	\N	\N	Partenariat de stage et formation	{"numStudents": 3000, "specialties": ["Informatique", "Génie Logiciel", "IA"], "institutionType": "ecole_ingenieur", "numInternsPerYear": 150}	\N	en_attente	\N	\N	\N	\N	\N	2026-04-13 11:58:52.351034+01	2026-04-13 11:58:52.351034+01
3	CloudTech Solutions	\N	Mohamed	Trabelsi	mohamed@cloudtech.tn	\N	\N	\N	\N	\N	\N	\N	\N	supplier	\N	\N	Co-développement de solutions cloud	\N	{"vendorType": "cloud_provider", "technologies": ["AWS", "Azure", "Kubernetes"], "partnershipModel": "co_development", "certificationLevel": "gold", "certificationsHeld": 12}	en_attente	\N	\N	\N	\N	\N	2026-04-13 11:58:53.451972+01	2026-04-13 11:58:53.451972+01
7	TestCorp SA	TestCorp Société Anonyme	Ali	Ben Ahmed	ali@testcorp.tn	+216 71 123 456	Directeur Commercial	https://testcorp.tn	Entreprise de services informatiques	Tunisie	123 Rue de la Liberté, Tunis	250	5000000	customer	Services IT	Gold	Nous souhaitons collaborer avec Capgemini pour nos projets de transformation digitale.	\N	\N	acceptee	t	7	2026-04-13 12:00:16.105+01	\N	178	2026-04-13 12:00:14.769557+01	2026-04-13 12:00:16.105+01
8	INSAT	\N	Sana	Mhadhbi	sana@insat.tn	\N	\N	\N	\N	\N	\N	\N	\N	university	\N	\N	Partenariat de stage et formation	{"numStudents": 3000, "specialties": ["Informatique", "Génie Logiciel", "IA"], "institutionType": "ecole_ingenieur", "numInternsPerYear": 150}	\N	acceptee	t	7	2026-04-13 12:00:16.44+01	\N	179	2026-04-13 12:00:15.27149+01	2026-04-13 12:00:16.44+01
9	CloudTech Solutions	\N	Mohamed	Trabelsi	mohamed@cloudtech.tn	\N	\N	\N	\N	\N	\N	\N	\N	supplier	\N	\N	Co-développement de solutions cloud	\N	{"vendorType": "cloud_provider", "technologies": ["AWS", "Azure", "Kubernetes"], "partnershipModel": "co_development", "certificationLevel": "gold", "certificationsHeld": 12}	refusee	f	7	2026-04-13 12:00:16.633+01	Profil technologique non aligné avec nos besoins actuels	\N	2026-04-13 12:00:15.444322+01	2026-04-13 12:00:16.633+01
10	test2	test22	chouk	kenza	chouk@test2.tn	+21650398661	directrice	https://www.test.com	test test test	tunisie	adresse	500	50000	marketing	cloud	Standard	testtest	\N	\N	acceptee	t	7	2026-04-13 12:11:48.488+01	\N	180	2026-04-13 12:09:46.622279+01	2026-04-13 12:11:48.488+01
11	test221	test221	choukk	kenzaa	chouk@test221.tn	+21650398661	directrice	https://www.test221.com	hhajqknjskikaqhsik	tunisie	adressee	501	50001	customer	cloud	Standard	\N	\N	\N	acceptee	t	7	2026-04-13 12:36:03.777+01	\N	181	2026-04-13 12:34:36.157001+01	2026-04-13 12:36:03.777+01
6	CloudTech Solutions	\N	Mohamed	Trabelsi	mohamed@cloudtech.tn	\N	\N	\N	\N	\N	\N	\N	\N	supplier	\N	\N	Co-développement de solutions cloud	\N	{"vendorType": "cloud_provider", "technologies": ["AWS", "Azure", "Kubernetes"], "partnershipModel": "co_development", "certificationLevel": "gold", "certificationsHeld": 12}	refusee	f	7	2026-04-13 12:44:47.276+01	des raisons budgetaires 	\N	2026-04-13 11:59:27.390666+01	2026-04-13 12:44:47.276+01
12	test ajout interne 	\N	kenzatest	testkenza	kenzatest@tai.com	50987526	Commercial interne — Ahmed Gharbi	\N	blablabla	Tunisie	\N	\N	\N	university	\N	\N	[DEMANDE INTERNE - Ahmed Gharbi] matching 	\N	\N	refusee	f	7	2026-04-13 14:19:44.308+01	test refus	\N	2026-04-13 14:09:11.50383+01	2026-04-13 14:19:44.308+01
5	INSAT	\N	Sana	Mhadhbi	sana@insat.tn	\N	\N	\N	\N	\N	\N	\N	\N	university	\N	\N	Partenariat de stage et formation	{"numStudents": 3000, "specialties": ["Informatique", "Génie Logiciel", "IA"], "institutionType": "ecole_ingenieur", "numInternsPerYear": 150}	\N	acceptee	t	7	2026-04-13 17:04:40.881+01	\N	182	2026-04-13 11:59:27.204552+01	2026-04-13 17:04:40.881+01
4	TestCorp SA	TestCorp Société Anonyme	Ali	Ben Ahmed	ali@testcorp.tn	+216 71 123 456	Directeur Commercial	https://testcorp.tn	Entreprise de services informatiques	Tunisie	123 Rue de la Liberté, Tunis	250	5000000	customer	Services IT	Gold	Nous souhaitons collaborer avec Capgemini pour nos projets de transformation digitale.	\N	\N	acceptee	t	7	2026-04-14 12:07:54.17+01	\N	183	2026-04-13 11:59:26.532255+01	2026-04-14 12:07:54.17+01
\.


--
-- Data for Name: student_recruitments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.student_recruitments (id, university_partner_id, student_first_name, student_last_name, student_email, student_phone, recruitment_type, contract_duration_months, start_date, end_date, degree_level, specialization, skills, assigned_project, assigned_team, manager_name, performance_score, satisfaction_score, converted_to_cdi, cdi_start_date, cdi_salary_range, updated_at, notes, manager_email, recruitment_cost, created_at) FROM stdin;
1	1	Amine	Gharbi	a.gharbi@esprit.tn	+216 98 123 456	stage	6	2025-02-01	2025-07-31	Bac+5	Full Stack	{React,Node.js,PostgreSQL,Docker}	Projet VMware - Virtualisation du datacenter pour STEG	Digital	Karim Mejri	5	92	t	2025-09-01	30000	2026-04-05 10:00:00+01	Excellent stagiaire	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
2	1	Sara	Ben Salah	s.bensalah@esprit.tn	+216 97 654 321	stage	6	2025-03-01	2025-08-31	Bac+5	Data Science	{Python,Pandas,Scikit-learn,SQL}	Projet Dataiku - Analytics pour Attijari Bank	Data & Analytics	Ahmed Gharbi	4	85	t	2025-10-01	28000	2026-04-05 10:00:00+01	Bon potentiel	ahmed.gharbi@capgemini.com	1100	2026-04-12 23:22:24.528664+01
4	2	Mariem	Jaziri	m.jaziri@insat.tn	+216 50 123 789	stage	6	2025-01-15	2025-07-15	Bac+5	Cloud Computing	{AWS,Terraform,Kubernetes,Python}	Projet AWS - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	94	t	2025-08-01	32000	2026-04-05 10:00:00+01	Proposée CDI	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
5	2	Youssef	Chaouachi	y.chaouachi@insat.tn	+216 52 456 789	stage	6	2025-02-10	2025-08-10	Bac+5	IA	{TensorFlow,PyTorch,NLP,Docker}	Projet Dataiku - Analytics pour Attijari Bank	AI	Nadia Haddad	5	90	t	2025-09-01	30000	2026-04-05 10:00:00+01	Très bon niveau	nadia.haddad@capgemini.com	1250	2026-04-12 23:22:24.528664+01
8	4	Salma	Haddad	s.haddad@utm.tn	+216 55 111 222	stage	6	2025-02-20	2025-08-20	Bac+5	Économie	{Excel,PowerBI,Stata}	Projet Tableau - Visualisation pour SMART Tunisie	Finance	Ahmed Gharbi	4	80	t	2025-10-01	26000	2026-04-05 10:00:00+01	Bonne intégration	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
10	5	Nour	Mekki	n.mekki@ihec.tn	+216 57 555 666	stage	6	2025-01-10	2025-07-10	Bac+5	Marketing Digital	{GoogleAnalytics,SEO,SocialMedia}	Projet Aprimo - Marketing pour SMART Tunisie	Marketing	Leila Ben Ali	5	95	t	2025-08-01	28000	2026-04-05 10:00:00+01	Excellent profil	leila.benali@capgemini.com	1100	2026-04-12 23:22:24.528664+01
11	5	Rami	Cherif	r.cherif@ihec.tn	+216 58 777 888	cdi_jeune_diplome	0	2025-06-01	\N	Bac+5	Finance	{Excel,SAP,PowerBI}	Projet SAS - Analytics pour Attijari Bank	Finance	Nadia Haddad	4	85	t	2025-06-01	30000	2026-04-05 10:00:00+01	Embauche directe	nadia.haddad@capgemini.com	4000	2026-04-12 23:22:24.528664+01
12	1	Lamia	Khelil	l.khelil@esprit.tn	+216 99 888 777	stage	5	2025-04-15	2025-09-15	Bac+5	DevOps	{Jenkins,GitLab,Docker,Ansible}	Projet GitLab - DevSecOps pour Artelia	Digital	Karim Mejri	5	96	t	2025-10-15	31000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
3	1	Omar	Mabrouk	o.mabrouk@esprit.tn	+216 99 111 222	alternance	18	2025-09-01	2027-02-28	Bac+4	Cybersécurité	{Python,Wireshark,Linux,Firewalls}	Projet Palo Alto - Sécurité réseau pour SMART Tunisie	Cybersecurity	Sami Trabelsi	4	88	f	\N	1200	2026-04-07 12:54:20.81506+01	En cours	sami.trabelsi@capgemini.com	2500	2026-04-12 23:22:24.528664+01
6	3	Hichem	Ben Amor	h.benamor@enit.tn	+216 53 789 123	stage	6	2025-03-01	2025-08-31	Bac+5	Énergétique	{MATLAB,Simulink,Python}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	82	f	\N	1200	2026-04-07 12:54:20.912826+01	Non converti	sami.trabelsi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
7	3	Ines	Karray	i.karray@enit.tn	+216 54 321 987	alternance	24	2025-01-01	2026-12-31	Bac+5	Génie Civil	{AutoCAD,Revit,BIM}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Infrastructure	Karim Mejri	3	75	f	\N	1200	2026-04-07 12:54:20.914452+01	Alternance en cours	karim.mejri@capgemini.com	2800	2026-04-12 23:22:24.528664+01
9	4	Foued	Bouaziz	f.bouaziz@utm.tn	+216 56 333 444	stage	6	2025-04-01	2025-09-30	Bac+5	Gestion	{Excel,SAP}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	70	f	\N	1200	2026-04-07 12:54:20.916028+01	Performance moyenne	mouna.baccar@capgemini.com	900	2026-04-12 23:22:24.528664+01
13	2	Aziz	Ben Hammadi	a.benhammadi@insat.tn	+216 51 234 567	alternance	18	2025-10-01	2027-03-31	Bac+4	Big Data	{Spark,Hadoop,Scala,SQL}	Projet Cloudera - Big data pour STEG	Data & Analytics	Ahmed Gharbi	4	86	f	\N	1200	2026-04-07 12:54:20.917606+01	Bon apprenti	ahmed.gharbi@capgemini.com	2600	2026-04-12 23:22:24.528664+01
16	5	Sirine	Ben Romdhane	s.benromdhane@ihec.tn	+216 58 999 111	cdi_jeune_diplome	0	2025-07-01	\N	Bac+5	Management	{Excel,PowerBI}	Projet Blue Yonder - Supply chain pour Poulina Group	Supply Chain	Leila Ben Ali	5	92	t	2025-07-01	32000	2026-04-05 10:00:00+01	CDI direct	leila.benali@capgemini.com	4500	2026-04-12 23:22:24.528664+01
17	1	Ahmed	Ben Naceur	a.bennaceur@esprit.tn	+216 98 222 333	stage	6	2025-02-15	2025-08-15	Bac+5	Cloud	{Azure,ARMtemplates,PowerShell}	Projet Microsoft - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	93	t	2025-09-01	33000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
18	2	Emna	Trabelsi	e.trabelsi@insat.tn	+216 52 333 444	stage	5	2025-03-20	2025-08-20	Bac+5	Cybersécurité	{Nessus,Qualys,Python}	Projet Qualys - Vulnérabilité pour Ciments de Bizerte	Cybersecurity	Sami Trabelsi	5	91	t	2025-10-01	29000	2026-04-05 10:00:00+01	Très bonne	sami.trabelsi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
20	4	Nesrine	Ben Abdallah	n.benabdallah@utm.tn	+216 56 222 111	stage	6	2025-04-10	2025-10-10	Bac+5	Mathématiques appliquées	{R,Python,Statisticalmodeling}	Projet SAS - Analytics pour Attijari Bank	Data & Analytics	Nadia Haddad	4	87	t	2025-11-01	28000	2026-04-05 10:00:00+01	Bon profil	nadia.haddad@capgemini.com	1100	2026-04-12 23:22:24.528664+01
22	1	Yasmine	Amri	y.amri@esprit.tn	+216 99 555 444	alternance	15	2025-09-15	2026-12-15	Bac+4	Sécurité réseau	{Firewalls,IDS/IPS,SIEM}	Projet Splunk - SIEM pour Autorité de Régulation	Cybersecurity	Sami Trabelsi	5	90	t	2027-01-15	31000	2026-04-05 10:00:00+01	Convertie en CDI	sami.trabelsi@capgemini.com	2800	2026-04-12 23:22:24.528664+01
23	2	Oussama	Ben Khalifa	o.benkhalifa@insat.tn	+216 51 888 999	stage	5	2025-05-05	2025-10-05	Bac+5	IA	{Keras,TensorFlow,Flask}	Projet DataRobot - AutoML pour BIAT	AI	Nadia Haddad	5	94	t	2025-11-01	32000	2026-04-05 10:00:00+01	Excellent	nadia.haddad@capgemini.com	1250	2026-04-12 23:22:24.528664+01
25	4	Hamza	Bouchnak	h.bouchnak@utm.tn	+216 55 444 777	cdi_jeune_diplome	0	2025-08-01	\N	Bac+5	Économétrie	{Stata,Python,SQL}	Projet Teradata - Entrepôt de données pour ATB	Data & Analytics	Ahmed Gharbi	4	89	t	2025-08-01	29000	2026-04-05 10:00:00+01	Embauche	ahmed.gharbi@capgemini.com	4200	2026-04-12 23:22:24.528664+01
27	1	Khalil	Ben Amor	k.benamor@esprit.tn	+216 98 777 666	stage	6	2025-01-20	2025-07-20	Bac+5	Full Stack	{Angular,SpringBoot,MongoDB}	Projet Mendix - Low-code pour CNAM	Digital	Karim Mejri	4	89	t	2025-08-20	30000	2026-04-05 10:00:00+01	Très bon	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
28	2	Ines	Gharbi	i.gharbi@insat.tn	+216 52 555 666	alternance	18	2025-10-10	2027-04-10	Bac+4	Data Engineering	{Spark,Airflow,Kafka}	Projet Fivetran - ELT pour ATB	Data & Analytics	Ahmed Gharbi	5	93	t	2027-05-10	33000	2026-04-05 10:00:00+01	Alternante brillante	ahmed.gharbi@capgemini.com	2900	2026-04-12 23:22:24.528664+01
30	4	Ahlem	Bouali	a.bouali@utm.tn	+216 56 666 777	stage	5	2025-05-15	2025-10-15	Bac+5	Finance	{Bloomberg,Excel,VBA}	Projet Kyriba - TMS pour Attijari Bank	Finance	Ahmed Gharbi	5	90	t	2025-11-15	31000	2026-04-05 10:00:00+01	Convertie	ahmed.gharbi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
32	1	Nadia	Ben Romdhane	n.benromdhane@esprit.tn	+216 99 111 444	cdi_jeune_diplome	0	2025-09-01	\N	Bac+5	Sécurité	{Penetrationtesting,Metasploit}	Projet Tenable - Gestion des vulnérabilités pour Banque de Tunisie	Cybersecurity	Sami Trabelsi	5	95	t	2025-09-01	34000	2026-04-05 10:00:00+01	Recrue talentueuse	sami.trabelsi@capgemini.com	4800	2026-04-12 23:22:24.528664+01
33	2	Anis	Ben Hassine	a.benhassine@insat.tn	+216 51 444 555	stage	6	2025-03-10	2025-09-10	Bac+5	Cloud	{GCP,BigQuery,Looker}	Projet Google Cloud - IaaS/PaaS pour Poulina Group	Cloud	Karim Mejri	5	96	t	2025-10-10	33000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
35	5	Olfa	Ben Othman	o.benothman@ihec.tn	+216 58 222 333	stage	6	2025-04-20	2025-10-20	Bac+5	Marketing	{Contentstrategy,SEO,GoogleAds}	Projet Aprimo - Marketing pour SMART Tunisie	Marketing	Leila Ben Ali	5	94	t	2025-11-20	29000	2026-04-05 10:00:00+01	Très bonne	leila.benali@capgemini.com	1100	2026-04-12 23:22:24.528664+01
36	1	Moez	Ben Cheikh	m.bencheikh@esprit.tn	+216 98 444 555	stage	5	2025-06-01	2025-11-01	Bac+5	Mobile	{Flutter,Firebase,Node.js}	Projet Slack - Collaboration pour Servicom	Digital	Karim Mejri	4	88	t	2025-12-01	30000	2026-04-05 10:00:00+01	Bon	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
37	2	Safa	Ben Ahmed	s.benahmed@insat.tn	+216 52 777 888	cdi_jeune_diplome	0	2025-07-15	\N	Bac+5	Big Data	{Hadoop,Spark,Scala}	Projet Databricks - Lakehouse pour Poulina Group	Data & Analytics	Ahmed Gharbi	5	92	t	2025-07-15	34000	2026-04-05 10:00:00+01	Embauche	ahmed.gharbi@capgemini.com	4600	2026-04-12 23:22:24.528664+01
19	3	Firas	Meddeb	f.meddeb@enit.tn	+216 54 777 888	alternance	20	2025-11-01	2027-06-30	Bac+4	Électronique	{Arduino,C,Embedded}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Industrie	Sami Trabelsi	4	84	f	\N	1200	2026-04-07 12:54:20.925432+01	Alternant prometteur	sami.trabelsi@capgemini.com	2700	2026-04-12 23:22:24.528664+01
21	5	Skander	Ben Youssef	s.benyoussef@ihec.tn	+216 57 444 555	stage	6	2025-02-01	2025-07-31	Bac+5	Commerce	{Salesforce,CRM}	Projet Salesforce - CRM pour SMART Tunisie	CRM	Mouna Baccar	4	86	f	\N	1200	2026-04-07 12:54:20.927043+01	Non retenu	mouna.baccar@capgemini.com	950	2026-04-12 23:22:24.528664+01
24	3	Meriem	Chaabane	m.chaabane@enit.tn	+216 53 222 333	stage	6	2025-03-15	2025-09-15	Bac+5	Génie industriel	{Lean,Simio,Python}	Projet Manhattan - Supply chain pour Poulina Group	Supply Chain	Ahmed Gharbi	4	83	f	\N	1200	2026-04-07 12:54:20.928661+01	Stage satisfaisant	ahmed.gharbi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
26	5	Afef	Ben Saad	a.bensaad@ihec.tn	+216 58 111 222	stage	4	2025-06-10	2025-10-10	Bac+4	RH	{SAPHR,Excel}	Projet Workday - Modernisation HCM pour Groupe Chimique	ERP	Leila Ben Ali	3	76	f	\N	1200	2026-04-07 12:54:20.930359+01	Stage court	leila.benali@capgemini.com	850	2026-04-12 23:22:24.528664+01
29	3	Seif	Ben Hamza	s.benhamza@enit.tn	+216 54 999 000	stage	6	2025-04-01	2025-10-01	Bac+5	Mécanique	{SolidWorks,ANSYS}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	85	f	\N	1300	2026-04-07 12:54:20.931726+01	Bon stagiaire	sami.trabelsi@capgemini.com	1050	2026-04-12 23:22:24.528664+01
31	5	Wael	Ben Miled	w.benmiled@ihec.tn	+216 57 888 999	stage	6	2025-02-25	2025-08-25	Bac+5	Logistique	{SAP,Tableau}	Projet Kinaxis - Supply planning pour Poulina Group	Supply Chain	Leila Ben Ali	4	82	f	\N	1200	2026-04-07 12:54:20.934255+01	Bon stage	leila.benali@capgemini.com	950	2026-04-12 23:22:24.528664+01
34	3	Marwa	Bouaziz	m.bouaziz@enit.tn	+216 53 111 222	alternance	20	2025-11-15	2027-07-15	Bac+4	Énergies renouvelables	{PVsyst,HOMER}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	87	f	\N	1200	2026-04-07 12:54:20.935854+01	Alternance en cours	sami.trabelsi@capgemini.com	2750	2026-04-12 23:22:24.528664+01
41	1	Bilel	Ben Hamadi	b.benhamadi@esprit.tn	+216 99 222 111	stage	6	2025-02-10	2025-08-10	Bac+5	DevOps	{Kubernetes,Helm,Prometheus}	Projet Red Hat - OpenShift pour ATB	Cloud	Karim Mejri	5	95	t	2025-09-10	32000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1250	2026-04-12 23:22:24.528664+01
42	2	Hela	Ben Younes	h.benyounes@insat.tn	+216 51 666 777	stage	6	2025-04-05	2025-10-05	Bac+5	IA	{ComputerVision,OpenCV,YOLO}	Projet NVIDIA - IA pour ART	AI	Nadia Haddad	5	91	t	2025-11-05	31000	2026-04-05 10:00:00+01	Très bonne	nadia.haddad@capgemini.com	1200	2026-04-12 23:22:24.528664+01
45	5	Rihab	Ben Cheikh	r.bencheikh@ihec.tn	+216 58 444 555	cdi_jeune_diplome	0	2025-06-15	\N	Bac+5	Marketing digital	{GoogleAnalytics,Ads,Socialmedia}	Projet Algonomy - Personnalisation retail pour SMART Tunisie	Marketing	Leila Ben Ali	5	96	t	2025-06-15	31000	2026-04-05 10:00:00+01	Excellente	leila.benali@capgemini.com	4300	2026-04-12 23:22:24.528664+01
46	1	Skander	Ben Hassine	s.benhassine@esprit.tn	+216 98 666 555	stage	6	2025-07-01	2026-01-01	Bac+5	Full Stack	{Vue.js,Express,MongoDB}	Projet Boomi - iPaaS pour SMART Tunisie	Digital	Karim Mejri	4	90	t	2026-02-01	30000	2026-04-05 10:00:00+01	Bon	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
47	2	Asma	Ben Romdhane	a.benromdhane@insat.tn	+216 52 999 000	alternance	18	2025-11-01	2027-05-01	Bac+4	Data Science	{Python,Pandas,Tableau}	Projet Tableau - Visualisation pour SMART Tunisie	Data & Analytics	Ahmed Gharbi	5	92	t	2027-06-01	32000	2026-04-05 10:00:00+01	Alternante prometteuse	ahmed.gharbi@capgemini.com	2800	2026-04-12 23:22:24.528664+01
48	3	Mohamed Ali	Ben Saad	m.bensaad@enit.tn	+216 54 888 777	stage	6	2025-02-20	2025-08-20	Bac+5	Génie logiciel	{Java,Spring,React}	Projet OutSystems - Low-code pour CNAM	Digital	Karim Mejri	5	93	t	2025-09-20	31000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
50	5	Amir	Ben Hamza	a.benhamza@ihec.tn	+216 57 666 444	cdi_jeune_diplome	0	2025-08-15	\N	Bac+5	Finance	{PowerBI,SQL,Excel}	Projet Anaplan - Planning pour Poulina Group	Finance	Leila Ben Ali	5	94	t	2025-08-15	33000	2026-04-05 10:00:00+01	CDI	leila.benali@capgemini.com	4400	2026-04-12 23:22:24.528664+01
51	1	Sihem	Ben Salem	s.bensalem@esprit.tn	+216 99 333 222	stage	6	2025-03-15	2025-09-15	Bac+5	Sécurité	{Cryptography,PKI,SSL/TLS}	Projet Okta - IAM pour Poulina Group	Cybersecurity	Sami Trabelsi	4	87	t	2025-10-15	29000	2026-04-05 10:00:00+01	Bonne	sami.trabelsi@capgemini.com	1100	2026-04-12 23:22:24.528664+01
55	5	Sarra	Ben Boubaker	s.benbaker@ihec.tn	+216 58 666 777	stage	6	2025-04-10	2025-10-10	Bac+5	Marketing	{Branding,Socialmedia,Canva}	Projet Aprimo - Marketing pour SMART Tunisie	Marketing	Leila Ben Ali	5	93	t	2025-11-10	29000	2026-04-05 10:00:00+01	Très bonne	leila.benali@capgemini.com	1100	2026-04-12 23:22:24.528664+01
56	1	Malek	Ben Romdhane	m.benromdhane@esprit.tn	+216 98 555 444	cdi_jeune_diplome	0	2025-09-15	\N	Bac+5	Cloud	{AWS,ECS,CloudFormation}	Projet AWS - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	97	t	2025-09-15	35000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	4900	2026-04-12 23:22:24.528664+01
57	2	Ines	Ben Amor	i.benamor@insat.tn	+216 52 222 555	stage	6	2025-06-01	2025-12-01	Bac+5	IA	{NLP,Transformers,LLM}	Projet Dataiku - Analytics pour Attijari Bank	AI	Nadia Haddad	5	92	t	2026-01-01	32000	2026-04-05 10:00:00+01	Très bonne	nadia.haddad@capgemini.com	1250	2026-04-12 23:22:24.528664+01
61	1	Nourhene	Ben Khelifa	n.benkhelifa@esprit.tn	+216 99 777 888	stage	6	2025-08-01	2026-02-01	Bac+5	Full Stack	{Django,React,PostgreSQL}	Projet Mendix - Low-code pour CNAM	Digital	Karim Mejri	4	89	t	2026-03-01	30000	2026-04-05 10:00:00+01	Bonne	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
39	4	Raouf	Ben Salah	r.bensalah@utm.tn	+216 55 888 999	stage	5	2025-05-20	2025-10-20	Bac+5	Comptabilité	{SAPFI,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	4	84	f	\N	1250	2026-04-07 12:54:20.941732+01	Correct	mouna.baccar@capgemini.com	900	2026-04-12 23:22:24.528664+01
40	5	Manel	Ben Jemaa	m.benjemaa@ihec.tn	+216 57 333 222	alternance	15	2025-09-20	2027-01-20	Bac+4	Management	{Agile,Scrum,Excel}	Projet ServiceNow - Workflow ITSM pour BIAT	ITSM	Leila Ben Ali	4	85	f	\N	1300	2026-04-07 12:54:20.942977+01	Alternante motivée	leila.benali@capgemini.com	2600	2026-04-12 23:22:24.528664+01
43	3	Fatma	Ben Amor	f.benamor@enit.tn	+216 53 555 666	alternance	18	2025-10-20	2027-04-20	Bac+4	Électrotechnique	{PLC,SCADA,Industrialnetworks}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	86	f	\N	1300	2026-04-07 12:54:20.944206+01	Bon profil	sami.trabelsi@capgemini.com	2700	2026-04-12 23:22:24.528664+01
44	4	Adem	Ben Mansour	a.benmansour@utm.tn	+216 56 111 333	stage	5	2025-03-01	2025-08-01	Bac+5	Économie	{EViews,Stata}	Projet SAS - Analytics pour Attijari Bank	Finance	Ahmed Gharbi	3	77	f	\N	1200	2026-04-07 12:54:20.945559+01	Satisfaisant	ahmed.gharbi@capgemini.com	850	2026-04-12 23:22:24.528664+01
49	4	Nourhene	Ben Slimane	n.benslimane@utm.tn	+216 55 777 333	stage	4	2025-06-10	2025-10-10	Bac+3	Gestion	{Excel,SAP}	Projet Jedox - CPM pour Banque de Tunisie	Finance	Ahmed Gharbi	3	80	f	\N	1250	2026-04-07 12:54:20.946919+01	Stage court	ahmed.gharbi@capgemini.com	800	2026-04-12 23:22:24.528664+01
52	2	Amine	Ben Miled	a.benmiled@insat.tn	+216 51 111 444	stage	5	2025-05-20	2025-10-20	Bac+5	Réseaux	{Cisco,MPLS,BGP}	Projet Akamai - CDN et sécurité pour Ooredoo	Network	Sami Trabelsi	4	85	f	\N	1200	2026-04-07 12:54:20.948199+01	Bon stage	sami.trabelsi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
53	3	Emna	Ben Cheikh	e.bencheikh@enit.tn	+216 53 777 888	alternance	20	2025-12-01	2027-08-01	Bac+4	Automatique	{PLC,SCADA,Python}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	88	f	\N	1200	2026-04-07 12:54:20.949839+01	Alternante sérieuse	sami.trabelsi@capgemini.com	2750	2026-04-12 23:22:24.528664+01
54	4	Firas	Ben Hassine	f.benhassine@utm.tn	+216 56 999 111	stage	6	2025-01-25	2025-07-25	Bac+5	Mathématiques	{Matlab,Python,Optimization}	Projet Alteryx - Data preparation pour BIAT	Data & Analytics	Ahmed Gharbi	4	82	f	\N	1100	2026-04-07 12:54:20.951434+01	Stage correct	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
58	3	Oussama	Ben Salem	o.bensalem@enit.tn	+216 54 444 555	stage	5	2025-07-01	2025-12-01	Bac+5	Mécanique	{CATIA,Simulation}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Industrie	Sami Trabelsi	4	86	f	\N	1100	2026-04-07 12:54:20.952699+01	Bon	sami.trabelsi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
59	4	Najla	Ben Ahmed	n.benahmed@utm.tn	+216 55 222 444	alternance	18	2025-10-05	2027-04-05	Bac+4	Économie	{Excel,PowerBI,Python}	Projet Teradata - Entrepôt de données pour ATB	Data & Analytics	Ahmed Gharbi	4	83	f	\N	1000	2026-04-07 12:54:20.954014+01	Alternante	ahmed.gharbi@capgemini.com	2600	2026-04-12 23:22:24.528664+01
60	5	Med Ali	Ben Youssef	m.benyoussef@ihec.tn	+216 57 555 777	stage	6	2025-02-05	2025-08-05	Bac+5	Commerce	{Salesforce,CRManalytics}	Projet Salesforce - CRM pour SMART Tunisie	CRM	Mouna Baccar	4	84	f	\N	1300	2026-04-07 12:54:20.95522+01	Bon	mouna.baccar@capgemini.com	950	2026-04-12 23:22:24.528664+01
62	2	Azza	Ben Hamadi	a.benhamadi@insat.tn	+216 51 777 999	cdi_jeune_diplome	0	2025-07-20	\N	Bac+5	Big Data	{Spark,Kafka,Python}	Projet Databricks - Lakehouse pour Poulina Group	Data & Analytics	Ahmed Gharbi	5	93	t	2025-07-20	34000	2026-04-05 10:00:00+01	Excellente	ahmed.gharbi@capgemini.com	4600	2026-04-12 23:22:24.528664+01
65	5	Leila	Ben Nasr	l.bennasr@ihec.tn	+216 58 888 000	stage	6	2025-05-10	2025-11-10	Bac+5	Finance	{Excel,PowerBI,SAP}	Projet BlackLine - Finance automation pour Attijari Bank	Finance	Ahmed Gharbi	5	91	t	2025-12-10	31000	2026-04-05 10:00:00+01	Très bonne	ahmed.gharbi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
66	1	Wissem	Ben Abdallah	w.benabdallah@esprit.tn	+216 98 888 999	stage	5	2025-06-15	2025-11-15	Bac+5	DevOps	{Terraform,Ansible,AWS}	Projet HashiCorp - IaC pour ATB	Cloud	Karim Mejri	5	94	t	2025-12-15	32000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1250	2026-04-12 23:22:24.528664+01
67	2	Sana	Ben Hamza	s.benhamza@insat.tn	+216 52 444 777	cdi_jeune_diplome	0	2025-08-10	\N	Bac+5	Cybersécurité	{SIEM,EDR,SOC}	Projet Splunk - SIEM pour Autorité de Régulation	Cybersecurity	Sami Trabelsi	5	96	t	2025-08-10	33000	2026-04-05 10:00:00+01	Excellente	sami.trabelsi@capgemini.com	4700	2026-04-12 23:22:24.528664+01
70	5	Ahmed	Ben Romdhane	a.benromdhane@ihec.tn	+216 57 222 888	stage	6	2025-07-01	2026-01-01	Bac+5	Marketing	{SEO,GoogleAnalytics,Content}	Projet Algonomy - Personnalisation retail pour SMART Tunisie	Marketing	Leila Ben Ali	5	92	t	2026-02-01	29000	2026-04-05 10:00:00+01	Très bon	leila.benali@capgemini.com	1100	2026-04-12 23:22:24.528664+01
71	1	Salma	Ben Khelifa	s.benkhelifa@esprit.tn	+216 99 444 333	stage	6	2025-02-28	2025-08-28	Bac+5	IA	{MachineLearning,Scikit-learn,Flask}	Projet DataRobot - AutoML pour BIAT	AI	Nadia Haddad	5	93	t	2025-09-28	31000	2026-04-05 10:00:00+01	Excellente	nadia.haddad@capgemini.com	1200	2026-04-12 23:22:24.528664+01
73	3	Monia	Ben Hamadi	m.benhamadi@enit.tn	+216 53 999 222	cdi_jeune_diplome	0	2025-07-15	\N	Bac+5	Génie industriel	{LeanSixSigma,Simio,Python}	Projet Kinaxis - Supply planning pour Poulina Group	Supply Chain	Ahmed Gharbi	4	89	t	2025-07-15	31000	2026-04-05 10:00:00+01	CDI	ahmed.gharbi@capgemini.com	4200	2026-04-12 23:22:24.528664+01
76	1	Chokri	Ben Hassine	c.benhassine@esprit.tn	+216 98 111 222	stage	6	2025-08-15	2026-02-15	Bac+5	Sécurité réseau	{Firewall,IPS,SIEM}	Projet Palo Alto - Sécurité réseau pour SMART Tunisie	Cybersecurity	Sami Trabelsi	5	92	t	2026-03-15	32000	2026-04-05 10:00:00+01	Très bon	sami.trabelsi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
77	2	Olfa	Ben Ali	o.benali@insat.tn	+216 52 555 888	stage	5	2025-06-20	2025-11-20	Bac+5	Data Science	{Python,Pandas,Scikit-learn}	Projet Alteryx - Data preparation pour BIAT	Data & Analytics	Ahmed Gharbi	4	88	t	2025-12-20	30000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
78	3	Anouar	Ben Hamza	a.benhamza@enit.tn	+216 54 777 111	cdi_jeune_diplome	0	2025-09-01	\N	Bac+5	Robotique	{ROS,Python,C++}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	5	91	t	2025-09-01	33000	2026-04-05 10:00:00+01	Embauche	sami.trabelsi@capgemini.com	4500	2026-04-12 23:22:24.528664+01
81	1	Yosra	Ben Romdhane	y.benromdhane@esprit.tn	+216 99 666 555	stage	6	2025-04-25	2025-10-25	Bac+5	Full Stack	{Angular,SpringBoot,MySQL}	Projet Boomi - iPaaS pour SMART Tunisie	Digital	Karim Mejri	5	94	t	2025-11-25	31000	2026-04-05 10:00:00+01	Excellente	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
82	2	Mohamed	Ben Khalifa	m.benkhalifa@insat.tn	+216 51 333 666	stage	5	2025-07-10	2025-12-10	Bac+5	IA	{DeepLearning,ComputerVision}	Projet NVIDIA - IA pour ART	AI	Nadia Haddad	5	90	t	2026-01-10	32000	2026-04-05 10:00:00+01	Très bon	nadia.haddad@capgemini.com	1250	2026-04-12 23:22:24.528664+01
83	3	Ines	Ben Boubaker	i.benbaker@enit.tn	+216 53 444 999	cdi_jeune_diplome	0	2025-08-20	\N	Bac+5	Matériaux	{Composites,Simulation}	Projet 3DEXPERIENCE - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	87	t	2025-08-20	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4300	2026-04-12 23:22:24.528664+01
64	4	Issam	Ben Hammouda	i.benhammouda@utm.tn	+216 56 555 222	alternance	15	2025-11-20	2027-02-20	Bac+4	Gestion	{SAP,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	78	f	\N	1250	2026-04-07 12:54:20.958764+01	Alternant moyen	mouna.baccar@capgemini.com	2500	2026-04-12 23:22:24.528664+01
68	3	Kais	Ben Salah	k.bensalah@enit.tn	+216 54 666 333	stage	6	2025-04-15	2025-10-15	Bac+5	Énergétique	{HOMER,MATLAB}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	88	f	\N	1100	2026-04-07 12:54:20.960291+01	Bon	sami.trabelsi@capgemini.com	1050	2026-04-12 23:22:24.528664+01
69	4	Meriam	Ben Amor	m.benamor@utm.tn	+216 55 444 666	alternance	18	2025-09-01	2027-03-01	Bac+4	Mathématiques appliquées	{R,Python,Statisticalmodeling}	Projet SAS - Analytics pour Attijari Bank	Data & Analytics	Ahmed Gharbi	4	86	f	\N	1300	2026-04-07 12:54:20.961707+01	Alternante	ahmed.gharbi@capgemini.com	2700	2026-04-12 23:22:24.528664+01
72	2	Fedi	Ben Moussa	f.benmoussa@insat.tn	+216 51 888 111	stage	5	2025-05-25	2025-10-25	Bac+5	Cloud	{Azure,DevOps,ARM}	Projet Microsoft - Cloud pour Groupe Chimique	Cloud	Karim Mejri	4	87	f	\N	1400	2026-04-07 12:54:20.963326+01	Bon	karim.mejri@capgemini.com	1100	2026-04-12 23:22:24.528664+01
74	4	Rami	Ben Saad	r.bensaad@utm.tn	+216 56 333 777	stage	6	2025-03-20	2025-09-20	Bac+5	Comptabilité	{SAPCO,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	81	f	\N	1000	2026-04-07 12:54:20.964808+01	Correct	mouna.baccar@capgemini.com	900	2026-04-12 23:22:24.528664+01
75	5	Asma	Ben Nasr	a.bennasr@ihec.tn	+216 58 111 444	alternance	15	2025-10-10	2027-01-10	Bac+4	Management	{Agile,Projectmanagement,Excel}	Projet Planview - PPM pour BIAT	PMO	Leila Ben Ali	4	84	f	\N	900	2026-04-07 12:54:20.966624+01	Alternante	leila.benali@capgemini.com	2600	2026-04-12 23:22:24.528664+01
79	4	Marwa	Ben Cheikh	m.bencheikh@utm.tn	+216 55 888 222	stage	6	2025-01-15	2025-07-15	Bac+5	Économie	{EViews,Stata,Python}	Projet Teradata - Entrepôt de données pour ATB	Data & Analytics	Ahmed Gharbi	4	83	f	\N	1200	2026-04-07 12:54:20.96835+01	Bon stage	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
80	5	Hamza	Ben Youssef	h.benyoussef@ihec.tn	+216 57 444 111	alternance	18	2025-11-01	2027-05-01	Bac+4	Finance	{Excel,PowerBI,SAP}	Projet Kyriba - TMS pour Attijari Bank	Finance	Ahmed Gharbi	4	85	f	\N	1250	2026-04-07 12:54:20.969914+01	Alternant	ahmed.gharbi@capgemini.com	2700	2026-04-12 23:22:24.528664+01
84	4	Seif	Ben Amor	s.benamor@utm.tn	+216 56 777 444	stage	6	2025-02-10	2025-08-10	Bac+5	Gestion	{Excel,SAP}	Projet Jedox - CPM pour Banque de Tunisie	Finance	Ahmed Gharbi	3	80	f	\N	1200	2026-04-07 12:54:20.971796+01	Moyen	ahmed.gharbi@capgemini.com	850	2026-04-12 23:22:24.528664+01
85	5	Olfa	Ben Saad	o.bensaad@ihec.tn	+216 58 222 555	alternance	18	2025-12-01	2027-06-01	Bac+4	Marketing	{Digitalmarketing,SEO,CRM}	Projet Salesforce - CRM pour SMART Tunisie	Marketing	Leila Ben Ali	4	86	f	\N	1200	2026-04-07 12:54:20.973681+01	Alternante	leila.benali@capgemini.com	2650	2026-04-12 23:22:24.528664+01
86	1	Amine	Ben Abdallah	a.benabdallah@esprit.tn	+216 98 777 333	stage	6	2025-03-25	2025-09-25	Bac+5	DevOps	{Jenkins,Docker,K8s}	Projet GitLab - DevSecOps pour Artelia	Digital	Karim Mejri	5	95	t	2025-10-25	33000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1250	2026-04-12 23:22:24.528664+01
87	2	Nadia	Ben Hammouda	n.benhammouda@insat.tn	+216 52 111 333	stage	5	2025-08-01	2026-01-01	Bac+5	Big Data	{Hadoop,Spark,Scala}	Projet Cloudera - Big data pour STEG	Data & Analytics	Ahmed Gharbi	4	89	t	2026-02-01	31000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
88	3	Med Ali	Ben Hassine	m.benhassine@enit.tn	+216 54 555 222	cdi_jeune_diplome	0	2025-06-01	\N	Bac+5	Génie civil	{AutoCAD,Revit,BIM}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Infrastructure	Karim Mejri	4	88	t	2025-06-01	30000	2026-04-05 10:00:00+01	CDI	karim.mejri@capgemini.com	4200	2026-04-12 23:22:24.528664+01
89	4	Sarra	Ben Miled	s.benmiled@utm.tn	+216 55 111 777	stage	6	2025-05-05	2025-11-05	Bac+5	Finance	{Excel,PowerBI}	Projet Anaplan - Planning pour Poulina Group	Finance	Ahmed Gharbi	5	92	t	2025-12-05	32000	2026-04-05 10:00:00+01	Très bonne	ahmed.gharbi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
91	1	Fatma	Ben Cheikh	f.bencheikh@esprit.tn	+216 99 222 555	stage	6	2025-06-05	2025-12-05	Bac+5	Sécurité	{Ethicalhacking,Metasploit}	Projet Tenable - Gestion des vulnérabilités pour Banque de Tunisie	Cybersecurity	Sami Trabelsi	5	91	t	2026-01-05	31000	2026-04-05 10:00:00+01	Excellente	sami.trabelsi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
93	3	Emna	Ben Boubaker	e.benbaker@enit.tn	+216 53 666 111	cdi_jeune_diplome	0	2025-09-10	\N	Bac+5	Énergétique	{MATLAB,Python,Simulation}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	85	t	2025-09-10	29000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4300	2026-04-12 23:22:24.528664+01
95	5	Meriem	Ben Mansour	m.benmansour@ihec.tn	+216 58 333 777	alternance	18	2025-10-20	2027-04-20	Bac+4	Marketing	{Socialmedia,GoogleAds}	Projet Aprimo - Marketing pour SMART Tunisie	Marketing	Leila Ben Ali	5	94	t	2027-05-20	31000	2026-04-05 10:00:00+01	Alternante excellente	leila.benali@capgemini.com	2800	2026-04-12 23:22:24.528664+01
96	1	Wael	Ben Romdhane	w.benromdhane@esprit.tn	+216 98 444 777	stage	6	2025-04-20	2025-10-20	Bac+5	Cloud	{GCP,Terraform,CI/CD}	Projet Google Cloud - IaaS/PaaS pour Poulina Group	Cloud	Karim Mejri	5	96	t	2025-11-20	34000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
97	2	Amira	Ben Salem	a.bensalem@insat.tn	+216 52 666 999	stage	5	2025-08-10	2026-01-10	Bac+5	Data Science	{Python,Pandas,SQL}	Projet Dataiku - Analytics pour Attijari Bank	Data & Analytics	Ahmed Gharbi	4	88	t	2026-02-10	30000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
98	3	Chaker	Ben Ali	c.benali@enit.tn	+216 54 888 444	cdi_jeune_diplome	0	2025-07-25	\N	Bac+5	Mécanique	{SolidWorks,ANSYS}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	87	t	2025-07-25	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4400	2026-04-12 23:22:24.528664+01
101	1	Khalil	Ben Miled	k.benmiled@esprit.tn	+216 99 888 111	stage	6	2025-05-15	2025-11-15	Bac+5	Full Stack	{React,Node.js,MongoDB}	Projet Mendix - Low-code pour CNAM	Digital	Karim Mejri	5	93	t	2025-12-15	31000	2026-04-05 10:00:00+01	Très bon	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
102	2	Mariem	Ben Abdallah	m.benabdallah@insat.tn	+216 51 555 222	stage	5	2025-06-25	2025-11-25	Bac+5	IA	{TensorFlow,NLP}	Projet DataRobot - AutoML pour BIAT	AI	Nadia Haddad	5	92	t	2025-12-25	32000	2026-04-05 10:00:00+01	Excellente	nadia.haddad@capgemini.com	1250	2026-04-12 23:22:24.528664+01
103	3	Ahmed	Ben Hammouda	a.benhammouda@enit.tn	+216 53 777 555	cdi_jeune_diplome	0	2025-08-05	\N	Bac+5	Génie industriel	{Lean,Simio,Python}	Projet Manhattan - Supply chain pour Poulina Group	Supply Chain	Ahmed Gharbi	4	89	t	2025-08-05	32000	2026-04-05 10:00:00+01	CDI	ahmed.gharbi@capgemini.com	4500	2026-04-12 23:22:24.528664+01
106	1	Rihab	Ben Amor	r.benamor@esprit.tn	+216 98 333 666	stage	6	2025-07-05	2026-01-05	Bac+5	Sécurité	{Cryptography,Networksecurity}	Projet Okta - IAM pour Poulina Group	Cybersecurity	Sami Trabelsi	5	90	t	2026-02-05	31000	2026-04-05 10:00:00+01	Bonne	sami.trabelsi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
107	2	Hichem	Ben Romdhane	h.benromdhane@insat.tn	+216 52 888 444	stage	5	2025-08-20	2026-01-20	Bac+5	Cloud	{AWS,ECS,CloudFormation}	Projet AWS - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	94	t	2026-02-20	33000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
108	3	Ines	Ben Salah	i.bensalah@enit.tn	+216 54 111 777	cdi_jeune_diplome	0	2025-09-15	\N	Bac+5	Matériaux	{Composites,Simulation}	Projet 3DEXPERIENCE - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	86	t	2025-09-15	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4300	2026-04-12 23:22:24.528664+01
92	2	Skander	Ben Hamza	s.benhamza@insat.tn	+216 51 444 888	stage	5	2025-07-20	2025-12-20	Bac+5	Réseaux	{Cisco,Python,Automation}	Projet Akamai - CDN et sécurité pour Ooredoo	Network	Sami Trabelsi	4	86	f	\N	1300	2026-04-07 12:54:20.977201+01	Bon	sami.trabelsi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
94	4	Malek	Ben Younes	m.benyounes@utm.tn	+216 56 222 999	stage	6	2025-03-10	2025-09-10	Bac+5	Économie	{Stata,Python,Excel}	Projet Alteryx - Data preparation pour BIAT	Data & Analytics	Ahmed Gharbi	3	79	f	\N	1200	2026-04-07 12:54:20.978475+01	Stage moyen	ahmed.gharbi@capgemini.com	900	2026-04-12 23:22:24.528664+01
99	4	Nour	Ben Hamadi	n.benhamadi@utm.tn	+216 55 555 444	stage	6	2025-02-15	2025-08-15	Bac+5	Comptabilité	{SAPFI,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	78	f	\N	1200	2026-04-07 12:54:20.979776+01	Moyen	mouna.baccar@capgemini.com	850	2026-04-12 23:22:24.528664+01
100	5	Yasmine	Ben Hassine	y.benhassine@ihec.tn	+216 57 777 444	alternance	15	2025-11-15	2027-02-15	Bac+4	Finance	{PowerBI,Excel,SAP}	Projet Kyriba - TMS pour Attijari Bank	Finance	Ahmed Gharbi	4	85	f	\N	1250	2026-04-07 12:54:20.984454+01	Alternante	ahmed.gharbi@capgemini.com	2600	2026-04-12 23:22:24.528664+01
104	4	Sirine	Ben Cheikh	s.bencheikh@utm.tn	+216 56 444 888	stage	6	2025-01-30	2025-07-30	Bac+5	Gestion	{Excel,SAP}	Projet Jedox - CPM pour Banque de Tunisie	Finance	Ahmed Gharbi	3	80	f	\N	1200	2026-04-07 12:54:20.986405+01	Stage correct	ahmed.gharbi@capgemini.com	850	2026-04-12 23:22:24.528664+01
105	5	Aziz	Ben Youssef	a.benyoussef@ihec.tn	+216 58 444 999	alternance	18	2025-09-25	2027-03-25	Bac+4	Marketing	{SEO,GoogleAnalytics}	Projet Algonomy - Personnalisation retail pour SMART Tunisie	Marketing	Leila Ben Ali	4	87	f	\N	1200	2026-04-07 12:54:20.989567+01	Alternant	leila.benali@capgemini.com	2650	2026-04-12 23:22:24.528664+01
109	4	Oussama	Ben Nasr	o.bennasr@utm.tn	+216 55 777 555	stage	6	2025-03-30	2025-09-30	Bac+5	Économie	{Stata,Excel}	Projet Teradata - Entrepôt de données pour ATB	Data & Analytics	Ahmed Gharbi	4	82	f	\N	1200	2026-04-07 12:54:20.991406+01	Bon	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
110	5	Nadia	Ben Miled	n.benmiled@ihec.tn	+216 57 111 444	alternance	15	2025-10-30	2027-01-30	Bac+4	Finance	{PowerBI,Excel}	Projet BlackLine - Finance automation pour Attijari Bank	Finance	Ahmed Gharbi	5	90	t	2027-03-01	32000	2026-04-05 10:00:00+01	Alternante brillante	ahmed.gharbi@capgemini.com	2800	2026-04-12 23:22:24.528664+01
111	1	Seif	Ben Hassine	s.benhassine@esprit.tn	+216 99 555 777	stage	6	2025-04-10	2025-10-10	Bac+5	DevOps	{Kubernetes,Helm,Prometheus}	Projet Red Hat - OpenShift pour ATB	Cloud	Karim Mejri	5	95	t	2025-11-10	32000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1250	2026-04-12 23:22:24.528664+01
112	2	Salma	Ben Boubaker	s.benbaker@insat.tn	+216 51 222 777	stage	5	2025-07-15	2025-12-15	Bac+5	Big Data	{Spark,Kafka,Python}	Projet Databricks - Lakehouse pour Poulina Group	Data & Analytics	Ahmed Gharbi	5	93	t	2026-01-15	34000	2026-04-05 10:00:00+01	Très bonne	ahmed.gharbi@capgemini.com	1250	2026-04-12 23:22:24.528664+01
113	3	Amir	Ben Abdallah	a.benabdallah@enit.tn	+216 53 222 444	cdi_jeune_diplome	0	2025-08-30	\N	Bac+5	Génie civil	{AutoCAD,Revit}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Infrastructure	Karim Mejri	4	88	t	2025-08-30	30000	2026-04-05 10:00:00+01	CDI	karim.mejri@capgemini.com	4400	2026-04-12 23:22:24.528664+01
116	1	Faten	Ben Cheikh	f.bencheikh@esprit.tn	+216 98 222 444	stage	6	2025-05-20	2025-11-20	Bac+5	Full Stack	{Django,React,PostgreSQL}	Projet Slack - Collaboration pour Servicom	Digital	Karim Mejri	5	91	t	2025-12-20	30000	2026-04-05 10:00:00+01	Très bonne	karim.mejri@capgemini.com	1150	2026-04-12 23:22:24.528664+01
117	2	Mohamed	Ben Hamadi	m.benhamadi@insat.tn	+216 52 333 555	stage	5	2025-08-25	2026-01-25	Bac+5	Cybersécurité	{SIEM,EDR}	Projet Splunk - SIEM pour Autorité de Régulation	Cybersecurity	Sami Trabelsi	5	92	t	2026-02-25	33000	2026-04-05 10:00:00+01	Excellent	sami.trabelsi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
118	3	Nesrine	Ben Younes	n.benyounes@enit.tn	+216 54 444 111	cdi_jeune_diplome	0	2025-07-05	\N	Bac+5	Énergétique	{HOMER,MATLAB}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	85	t	2025-07-05	29000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4200	2026-04-12 23:22:24.528664+01
120	5	Asma	Ben Romdhane	a.benromdhane@ihec.tn	+216 57 666 888	alternance	18	2025-12-15	2027-06-15	Bac+4	Marketing	{Socialmedia,CRM}	Projet Salesforce - CRM pour SMART Tunisie	Marketing	Leila Ben Ali	5	93	t	2027-07-15	31000	2026-04-05 10:00:00+01	Alternante excellente	leila.benali@capgemini.com	2800	2026-04-12 23:22:24.528664+01
121	1	Anis	Ben Mansour	a.benmansour@esprit.tn	+216 98 666 222	stage	6	2025-06-15	2025-12-15	Bac+5	Cloud	{Azure,DevOps,ARM}	Projet Microsoft - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	94	t	2026-01-15	34000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
122	2	Leila	Ben Hassine	l.benhassine@insat.tn	+216 51 777 333	stage	5	2025-09-01	2026-02-01	Bac+5	Data Science	{Python,Pandas,SQL}	Projet Dataiku - Analytics pour Attijari Bank	Data & Analytics	Ahmed Gharbi	4	87	t	2026-03-01	30000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
123	3	Karim	Ben Hamza	k.benhamza@enit.tn	+216 53 888 777	cdi_jeune_diplome	0	2025-09-20	\N	Bac+5	Mécanique	{SolidWorks,ANSYS}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	88	t	2025-09-20	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4400	2026-04-12 23:22:24.528664+01
126	1	Maroua	Ben Khelifa	m.benkhelifa@esprit.tn	+216 99 444 888	stage	6	2025-07-25	2026-01-25	Bac+5	DevOps	{Terraform,Ansible,AWS}	Projet HashiCorp - IaC pour ATB	Cloud	Karim Mejri	5	96	t	2026-02-25	33000	2026-04-05 10:00:00+01	Excellente	karim.mejri@capgemini.com	1250	2026-04-12 23:22:24.528664+01
127	2	Amel	Ben Boubaker	a.benbaker@insat.tn	+216 52 444 666	stage	5	2025-08-15	2026-01-15	Bac+5	IA	{MachineLearning,Scikit-learn}	Projet DataRobot - AutoML pour BIAT	AI	Nadia Haddad	5	91	t	2026-02-15	31000	2026-04-05 10:00:00+01	Très bonne	nadia.haddad@capgemini.com	1200	2026-04-12 23:22:24.528664+01
128	3	Haythem	Ben Salah	h.bensalah@enit.tn	+216 54 666 888	cdi_jeune_diplome	0	2025-06-15	\N	Bac+5	Génie industriel	{LeanSixSigma,Simio}	Projet Kinaxis - Supply planning pour Poulina Group	Supply Chain	Ahmed Gharbi	4	89	t	2025-06-15	32000	2026-04-05 10:00:00+01	CDI	ahmed.gharbi@capgemini.com	4500	2026-04-12 23:22:24.528664+01
131	1	Syrine	Ben Amor	s.benamor@esprit.tn	+216 98 555 333	stage	6	2025-05-25	2025-11-25	Bac+5	Sécurité réseau	{Firewall,IPS,SIEM}	Projet Palo Alto - Sécurité réseau pour SMART Tunisie	Cybersecurity	Sami Trabelsi	5	93	t	2025-12-25	32000	2026-04-05 10:00:00+01	Excellente	sami.trabelsi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
132	2	Mehdi	Ben Hammouda	m.benhammouda@insat.tn	+216 51 888 555	stage	5	2025-09-10	2026-02-10	Bac+5	Cloud	{GCP,BigQuery,Looker}	Projet Google Cloud - IaaS/PaaS pour Poulina Group	Cloud	Karim Mejri	5	95	t	2026-03-10	34000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
133	3	Olfa	Ben Romdhane	o.benromdhane@enit.tn	+216 53 333 999	cdi_jeune_diplome	0	2025-07-30	\N	Bac+5	Robotique	{ROS,Python,C++}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	87	t	2025-07-30	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4300	2026-04-12 23:22:24.528664+01
115	5	Med	Ben Salem	m.bensalem@ihec.tn	+216 58 555 888	alternance	18	2025-11-05	2027-05-05	Bac+4	Management	{Agile,Scrum}	Projet ServiceNow - Workflow ITSM pour BIAT	ITSM	Leila Ben Ali	4	86	f	\N	1200	2026-04-07 12:54:20.99483+01	Alternant	leila.benali@capgemini.com	2650	2026-04-12 23:22:24.528664+01
119	4	Walid	Ben Ali	w.benali@utm.tn	+216 55 444 222	stage	6	2025-04-05	2025-10-05	Bac+5	Gestion	{Excel,SAP}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	79	f	\N	1300	2026-04-07 12:54:20.996451+01	Moyen	mouna.baccar@capgemini.com	850	2026-04-12 23:22:24.528664+01
124	4	Sana	Ben Abdallah	s.benabdallah@utm.tn	+216 56 555 777	stage	6	2025-03-15	2025-09-15	Bac+5	Comptabilité	{SAPFI,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	78	f	\N	1200	2026-04-07 12:54:20.998053+01	Moyen	mouna.baccar@capgemini.com	850	2026-04-12 23:22:24.528664+01
125	5	Fedi	Ben Miled	f.benmiled@ihec.tn	+216 58 777 555	alternance	15	2025-10-15	2027-01-15	Bac+4	Finance	{Excel,PowerBI}	Projet Anaplan - Planning pour Poulina Group	Finance	Ahmed Gharbi	4	86	f	\N	1100	2026-04-07 12:54:20.999658+01	Alternant	ahmed.gharbi@capgemini.com	2600	2026-04-12 23:22:24.528664+01
129	4	Mona	Ben Cheikh	m.bencheikh@utm.tn	+216 55 888 444	stage	6	2025-01-20	2025-07-20	Bac+5	Économie	{EViews,Stata}	Projet SAS - Analytics pour Attijari Bank	Finance	Ahmed Gharbi	4	83	f	\N	1150	2026-04-07 12:54:21.001228+01	Bon	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
130	5	Raed	Ben Youssef	r.benyoussef@ihec.tn	+216 57 222 666	alternance	18	2025-11-20	2027-05-20	Bac+4	Marketing	{SEO,GoogleAds}	Projet Algonomy - Personnalisation retail pour SMART Tunisie	Marketing	Leila Ben Ali	4	85	f	\N	1200	2026-04-07 12:54:21.002944+01	Alternant	leila.benali@capgemini.com	2650	2026-04-12 23:22:24.528664+01
136	1	Iheb	Ben Miled	i.benmiled@esprit.tn	+216 99 777 444	stage	6	2025-06-20	2025-12-20	Bac+5	Full Stack	{Angular,SpringBoot,MySQL}	Projet Boomi - iPaaS pour SMART Tunisie	Digital	Karim Mejri	5	94	t	2026-01-20	31000	2026-04-05 10:00:00+01	Très bon	karim.mejri@capgemini.com	1200	2026-04-12 23:22:24.528664+01
137	2	Ines	Ben Salem	i.bensalem@insat.tn	+216 52 555 777	stage	5	2025-08-05	2026-01-05	Bac+5	Big Data	{Spark,Hadoop,Scala}	Projet Cloudera - Big data pour STEG	Data & Analytics	Ahmed Gharbi	4	89	t	2026-02-05	31000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
138	3	Mohamed	Ben Cheikh	m.bencheikh@enit.tn	+216 54 999 333	cdi_jeune_diplome	0	2025-08-25	\N	Bac+5	Génie civil	{AutoCAD,Revit,BIM}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Infrastructure	Karim Mejri	4	88	t	2025-08-25	30000	2026-04-05 10:00:00+01	CDI	karim.mejri@capgemini.com	4400	2026-04-12 23:22:24.528664+01
140	5	Nabil	Ben Younes	n.benyounes@ihec.tn	+216 57 888 444	alternance	18	2025-09-30	2027-03-30	Bac+4	Marketing	{Digitalmarketing,SEO}	Projet Aprimo - Marketing pour SMART Tunisie	Marketing	Leila Ben Ali	5	92	t	2027-04-30	31000	2026-04-05 10:00:00+01	Alternant brillant	leila.benali@capgemini.com	2800	2026-04-12 23:22:24.528664+01
141	1	Amal	Ben Hassine	a.benhassine@esprit.tn	+216 98 111 888	stage	6	2025-07-10	2026-01-10	Bac+5	Cybersécurité	{Cryptography,PKI}	Projet Okta - IAM pour Poulina Group	Cybersecurity	Sami Trabelsi	5	91	t	2026-02-10	31000	2026-04-05 10:00:00+01	Excellente	sami.trabelsi@capgemini.com	1200	2026-04-12 23:22:24.528664+01
143	3	Hela	Ben Boubaker	h.benbaker@enit.tn	+216 53 555 444	cdi_jeune_diplome	0	2025-06-25	\N	Bac+5	Énergétique	{MATLAB,Python}	Projet Siemens - Automatisation industrielle pour Groupe Chimique	Energy	Sami Trabelsi	4	85	t	2025-06-25	29000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4200	2026-04-12 23:22:24.528664+01
145	5	Mariem	Ben Mansour	m.benmansour@ihec.tn	+216 58 333 888	alternance	15	2025-10-25	2027-01-25	Bac+4	Finance	{PowerBI,Excel}	Projet BlackLine - Finance automation pour Attijari Bank	Finance	Ahmed Gharbi	5	91	t	2027-02-25	32000	2026-04-05 10:00:00+01	Alternante très bonne	ahmed.gharbi@capgemini.com	2800	2026-04-12 23:22:24.528664+01
146	1	Youssef	Ben Romdhane	y.benromdhane@esprit.tn	+216 99 222 888	stage	6	2025-05-30	2025-11-30	Bac+5	Cloud	{AWS,ECS,CloudFormation}	Projet AWS - Cloud pour Groupe Chimique	Cloud	Karim Mejri	5	96	t	2025-12-30	35000	2026-04-05 10:00:00+01	Excellent	karim.mejri@capgemini.com	1300	2026-04-12 23:22:24.528664+01
147	2	Sarra	Ben Salah	s.bensalah@insat.tn	+216 52 777 444	stage	5	2025-08-30	2026-01-30	Bac+5	Data Science	{Python,Pandas,SQL}	Projet Dataiku - Analytics pour Attijari Bank	Data & Analytics	Ahmed Gharbi	4	88	t	2026-02-28	30000	2026-04-05 10:00:00+01	Bonne	ahmed.gharbi@capgemini.com	1150	2026-04-12 23:22:24.528664+01
148	3	Chokri	Ben Ali	c.benali@enit.tn	+216 54 222 999	cdi_jeune_diplome	0	2025-07-20	\N	Bac+5	Mécanique	{SolidWorks,ANSYS}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	87	t	2025-07-20	30000	2026-04-05 10:00:00+01	CDI	sami.trabelsi@capgemini.com	4300	2026-04-12 23:22:24.528664+01
14	3	Chaima	Boukadida	c.boukadida@enit.tn	+216 53 456 789	stage	6	2025-05-01	2025-10-31	Bac+5	Robotique	{ROS,Python,C++}	Projet PTC - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	4	88	f	\N	1200	2026-04-07 12:54:20.919116+01	Projet réussi	sami.trabelsi@capgemini.com	1050	2026-04-12 23:22:24.528664+01
15	4	Mohamed	Ben Ali	m.benali@utm.tn	+216 55 987 654	stage	4	2025-06-01	2025-09-30	Bac+3	Comptabilité	{Excel,QuickBooks}	Projet BlackLine - Finance automation pour Attijari Bank	Finance	Ahmed Gharbi	3	78	f	\N	1200	2026-04-07 12:54:20.922865+01	Stage court	ahmed.gharbi@capgemini.com	800	2026-04-12 23:22:24.528664+01
38	3	Amal	Ben Abdallah	a.benabdallah@enit.tn	+216 54 333 444	stage	6	2025-01-05	2025-07-05	Bac+5	Matériaux	{Composites,Simulation}	Projet 3DEXPERIENCE - PLM pour Groupe Chimique	Industrie	Sami Trabelsi	3	79	f	\N	1200	2026-04-07 12:54:20.939143+01	Stage moyen	sami.trabelsi@capgemini.com	950	2026-04-12 23:22:24.528664+01
63	3	Amira	Ben Mansour	a.benmansour@enit.tn	+216 53 222 111	stage	6	2025-03-05	2025-09-05	Bac+5	Génie civil	{AutoCAD,Revit}	Projet Autodesk - CAD/BIM pour Groupe Chimique	Infrastructure	Karim Mejri	4	85	f	\N	1200	2026-04-07 12:54:20.956833+01	Bon stage	karim.mejri@capgemini.com	950	2026-04-12 23:22:24.528664+01
90	5	Rami	Ben Salem	r.bensalem@ihec.tn	+216 57 888 333	alternance	15	2025-09-15	2026-12-15	Bac+4	Management	{Projectmanagement,Excel}	Projet Planview - PPM pour BIAT	PMO	Leila Ben Ali	4	83	f	\N	1250	2026-04-07 12:54:20.975255+01	Alternant	leila.benali@capgemini.com	2600	2026-04-12 23:22:24.528664+01
114	4	Chaima	Ben Hamza	c.benhamza@utm.tn	+216 56 888 111	stage	6	2025-02-05	2025-08-05	Bac+5	Mathématiques	{Matlab,Python}	Projet Alteryx - Data preparation pour BIAT	Data & Analytics	Ahmed Gharbi	4	84	f	\N	1250	2026-04-07 12:54:20.993005+01	Bon	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
134	4	Ahmed	Ben Nasr	a.bennasr@utm.tn	+216 56 777 222	stage	6	2025-04-25	2025-10-25	Bac+5	Finance	{Excel,PowerBI}	Projet Anaplan - Planning pour Poulina Group	Finance	Ahmed Gharbi	4	85	f	\N	1500	2026-04-07 12:54:21.005115+01	Bon	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
135	5	Souhayla	Ben Hamza	s.benhamza@ihec.tn	+216 58 111 666	alternance	15	2025-12-01	2027-03-01	Bac+4	Management	{Agile,Projectmanagement}	Projet Planview - PPM pour BIAT	PMO	Leila Ben Ali	4	84	f	\N	1400	2026-04-07 12:54:21.007141+01	Alternante	leila.benali@capgemini.com	2600	2026-04-12 23:22:24.528664+01
139	4	Rim	Ben Abdallah	r.benabdallah@utm.tn	+216 55 666 333	stage	6	2025-02-28	2025-08-28	Bac+5	Gestion	{Excel,SAP}	Projet Jedox - CPM pour Banque de Tunisie	Finance	Ahmed Gharbi	3	80	f	\N	1350	2026-04-07 12:54:21.008847+01	Moyen	ahmed.gharbi@capgemini.com	850	2026-04-12 23:22:24.528664+01
142	2	Med Ali	Ben Hamza	m.benhamza@insat.tn	+216 51 444 999	stage	5	2025-09-15	2026-02-15	Bac+5	Réseaux	{Cisco,Python}	Projet Akamai - CDN et sécurité pour Ooredoo	Network	Sami Trabelsi	4	86	f	\N	1200	2026-04-07 12:54:21.010663+01	Bon	sami.trabelsi@capgemini.com	1000	2026-04-12 23:22:24.528664+01
144	4	Fares	Ben Khelifa	f.benkhelifa@utm.tn	+216 56 222 777	stage	6	2025-03-25	2025-09-25	Bac+5	Mathématiques	{Matlab,Python}	Projet Alteryx - Data preparation pour BIAT	Data & Analytics	Ahmed Gharbi	4	82	f	\N	1200	2026-04-07 12:54:21.012396+01	Bon	ahmed.gharbi@capgemini.com	950	2026-04-12 23:22:24.528664+01
149	4	Olfa	Ben Miled	o.benmiled@utm.tn	+216 55 999 111	stage	6	2025-04-30	2025-10-30	Bac+5	Comptabilité	{SAPFI,Excel}	Projet SAP - ERP pour Poulina Group	ERP	Mouna Baccar	3	78	f	\N	1600	2026-04-07 12:54:21.014098+01	Moyen	mouna.baccar@capgemini.com	850	2026-04-12 23:22:24.528664+01
150	5	Rami	Ben Hammouda	r.benhammouda@ihec.tn	+216 57 555 333	alternance	18	2025-12-20	2027-06-20	Bac+4	Management	{Agile,Scrum}	Projet ServiceNow - Workflow ITSM pour BIAT	ITSM	Leila Ben Ali	4	85	f	\N	1200	2026-04-07 12:54:21.015666+01	Alternant	leila.benali@capgemini.com	2650	2026-04-12 23:22:24.528664+01
157	1	Ahmed	Ben Salah	ahmed.bensalah@esprit.tn	+216 55 123 456	stage	6	2025-09-01	2026-02-28	Bac+5	Génie Logiciel	{Java,"Spring Boot",React}	Digital Banking Platform	Digital Engineering	Khaled Maatoug	4	90	f	\N	\N	2026-04-12 23:32:49.129237+01	Excellent stagiaire, potentiel CDI	khaled.maatoug@capgemini.com	\N	2026-04-12 23:32:49.129237+01
\.


--
-- Data for Name: technology_partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.technology_partners (partner_id, technologies, certifications_held, certification_level, partnership_model, commission_rate, discount_rate, updated_at, notes, vendor_type, annual_revenue_generated, num_projects_per_year, num_licenses_sold, comarketing_budget_annual, num_events_organized, has_master_agreement, agreement_signed_date, agreement_renewal_date, has_dedicated_support, support_sla_hours, created_at) FROM stdin;
174	{CybersecurityZeroTrustSase}	176	global_strategic	reseller	19.37	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
172	{HcmErp}	269	global_strategic	integrator	19.20	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
173	{IpaasAutomation}	52	gold	integrator	5.18	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
170	{VirtualizationCloudInfrastructure}	1108	global_strategic	reseller + integrator	19.75	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
171	{IndustryCloudCrm}	2612	platinum	reseller + integrator	10.19	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
169	{HcmWorkforceManagement}	434	platinum	integrator	11.34	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
168	{RpaAutomation}	134	global_strategic	reseller	15.69	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
19	{Telecom}	200	global_strategic	reseller	19.68	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
167	{SoftwareTestingQa}	102	gold	reseller	8.12	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
166	{IntegrationMiddleware}	201	gold	reseller + integrator	9.46	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
165	{BiAugmentedAnalytics}	27	gold	integrator	6.57	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
164	{DataWarehouseAnalytics}	295	platinum	integrator	10.61	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
163	{CybersecurityVulnerabilityManagement}	80	platinum	reseller	11.15	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
162	{CoreBankingDigitalBanking}	337	global_strategic	reseller	17.89	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
161	{EndpointManagementSecurity}	28	platinum	reseller	14.52	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
160	{DataIntegrationEtl}	25	platinum	reseller + integrator	13.69	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
159	{BiDataVisualization}	2259	platinum	reseller	10.94	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
158	{LogAnalyticsObservability}	14	gold	reseller	8.76	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
157	{PaymentsFintech}	109	global_strategic	reseller	18.24	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
156	{SiemObservability}	264	global_strategic	reseller	18.74	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
155	{CybersecurityEndpoint}	112	platinum	reseller	13.01	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
154	{ItMonitoringNetwork}	50	gold	reseller	7.31	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
153	{DataWarehouseCloudData}	353	global_strategic	reseller + integrator	14.79	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
152	{CollaborationMessaging}	3325	platinum	reseller	14.81	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
151	{DxpCms}	102	gold	integrator	5.96	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
150	{IndustrialAutomation}	4364	platinum	integrator	13.23	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
149	{WorkflowItsm}	697	global_strategic	reseller	14.74	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
148	{AnalyticsDataScience}	399	platinum	reseller	13.67	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
147	{ErpEnterpriseSoftware}	4498	global_strategic	reseller	18.70	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
146	{CrmEnterpriseCloud}	2707	global_strategic	reseller + integrator	14.68	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
114	{IpaasApiManagement}	1771	global_strategic	reseller	14.54	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
145	{CybersecurityIga}	120	platinum	reseller	14.23	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
144	{DataProtectionBackup}	51	platinum	reseller	12.09	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
143	{CybersecurityIam}	53	gold	reseller	7.02	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
142	{MdmCustomer360}	37	gold	integrator	9.73	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
141	{OpenSourceKubernetes}	969	global_strategic	reseller	18.28	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
140	{CybersecurityThreatManagement}	145	platinum	integrator	12.57	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
139	{ManagedCloudServices}	298	gold	reseller + integrator	5.71	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
138	{CybersecurityVulnerabilityManagement}	69	platinum	integrator	10.92	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
137	{BiDataIntegration}	71	platinum	reseller + integrator	14.22	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
136	{StorageDataInfrastructure}	224	platinum	reseller	12.72	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
135	{IndustrialSoftwarePlmIot}	237	platinum	reseller	12.47	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
133	{PpmWorkManagement}	59	gold	reseller	6.56	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
132	{BpmCrmPlatform}	294	platinum	integrator	13.08	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
131	{CybersecurityNetworkSecurity}	282	global_strategic	reseller	16.28	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
130	{DataAnalyticsDecisionIntelligence}	50	platinum	integrator	14.73	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
129	{Low-codePlatform}	31	platinum	integrator	12.14	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
128	{EnterpriseSoftwareCloud}	6431	global_strategic	reseller + integrator	18.70	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
116	{ErpCloudErp}	3550	platinum	reseller + integrator	14.50	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
127	{EcmInformationManagement}	525	platinum	reseller	10.13	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
126	{CpmFinancialConsolidation}	38	platinum	integrator	14.89	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
125	{CybersecurityIam}	152	platinum	reseller	11.93	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
124	{SemiconductorsAiCompute}	853	global_strategic	reseller	14.15	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
122	{CloudInfrastructureHci}	222	platinum	reseller + integrator	12.75	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
121	{ConversationalAiSpeech}	326	platinum	integrator	10.83	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
120	{WorkflowProcessAutomation}	52	gold	integrator	5.24	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
119	{CustomerExperienceContactCenter}	183	platinum	reseller	12.80	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
123	{WebServerLoadBalancing}	191	gold	reseller	5.97	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
118	{DexEndpointAnalytics}	52	gold	integrator	9.40	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
117	{ObservabilityApm}	30	gold	integrator	5.51	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
115	{DatabaseGraph}	45	gold	integrator	8.41	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
113	{DatabaseNosql}	190	platinum	integrator	10.77	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
112	{BiAnalytics}	87	gold	reseller	9.04	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
111	{CloudEnterpriseSoftware}	5510	global_strategic	reseller + integrator	17.55	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
110	{Low-codePlatform}	96	platinum	integrator	14.47	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
108	{SupplyChainExecutionWms}	123	platinum	integrator	14.91	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
107	{CoreBankingFintech}	44	platinum	reseller	10.41	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
105	{BiAnalytics}	8369	gold	integrator	8.30	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
104	{HardwareDevices}	2706	platinum	integrator	12.95	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
103	{TreasuryTms}	45	platinum	reseller	10.83	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
102	{ApiManagementGateway}	36	gold	integrator	8.40	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
101	{IntelligentAutomationCapture}	111	gold	integrator	9.18	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
100	{SupplyChainPlanning}	30	platinum	integrator	10.75	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
99	{IpaasIntegration}	10	gold	reseller + integrator	8.58	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
98	{CpmPlanning}	6	gold	reseller	6.82	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
97	{ItsmEndpointManagement}	60	gold	integrator	9.73	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
96	{SemiconductorsHardware}	1911	global_strategic	reseller	15.77	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
95	{DataManagementIntegration}	76	global_strategic	reseller + integrator	15.12	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
94	{ErpIndustryCloud}	590	platinum	reseller + integrator	14.60	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
93	{ErpEamFieldService}	148	platinum	reseller	14.75	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
92	{EnterpriseItConsulting}	7424	global_strategic	reseller	18.11	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
109	{DataPlatformDistributed}	2862	silver	integrator	8.70	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
90	{HardwareInfrastructure}	1907	global_strategic	reseller	17.09	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
18	{MatérielInformatiqueIntégrationDeSystèmes}	6	platinum	integrator	13.18	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
89	{GeospatialMapping}	273	gold	integrator	7.50	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
88	{DevopsInfrastructureAsCode}	112	platinum	reseller	14.79	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
87	{InsuranceSoftwareCoreSystem}	58	platinum	reseller	12.27	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
35	{ApiManagement}	6053	gold	integrator	6.67	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
86	{CloudIaas-paas}	6571	global_strategic	reseller + integrator	17.19	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
85	{HrEmployerOfRecord(eor)}	18	gold	reseller	6.19	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
84	{DevsecopsCi-cd}	78	gold	integrator	7.49	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
83	{DevopsScm}	145	platinum	reseller	10.33	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
82	{CustomerExperienceContactCenter}	220	platinum	integrator	12.25	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
80	{CybersecurityIam}	49	gold	integrator	9.70	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
81	{CybersecurityDlpSase}	126	platinum	reseller	13.47	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
79	{ItAssetManagementFinops}	26	gold	integrator	9.41	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
78	{DataIntegrationElt}	58	platinum	reseller + integrator	12.06	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
77	{BankingSoftwareFintech}	85	global_strategic	reseller	17.09	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
76	{RegtechKycClm}	16	platinum	integrator	14.56	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
75	{EcmArchiving}	8	gold	integrator	6.37	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
74	{Telecom5gNetwork}	3711	platinum	integrator	13.51	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
73	{IotIndustrialAi}	66	gold	integrator	7.02	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
134	{DatabasePostgresqlServices}	58	gold	reseller	9.73	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
72	{EhsEsgGrc}	36	gold	integrator	7.39	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
71	{SearchObservabilitySiem}	106	platinum	reseller	11.62	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
70	{ObservabilityApm}	149	platinum	reseller	13.10	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
69	{CmsOpenSource}	5	silver	integrator	5.80	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
68	{DataPlatformSqlEngine}	11	gold	integrator	6.02	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
67	{DevopsContainers}	54	gold	reseller	9.26	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
66	{DataVirtualization}	26	gold	integrator	7.56	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
17	{MatérielInformatiqueIntégrationDeSystèmes}	195	gold	reseller	8.80	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
65	{HardwareInfrastructure}	4350	global_strategic	integrator	18.32	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
64	{AiAutomlMlops}	13	gold	reseller	9.49	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
63	{AiAnalyticsPlatform}	64	platinum	reseller	13.77	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
62	{ObservabilityMonitoring}	264	platinum	reseller	10.97	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
61	{DataPlatformLakehouse}	157	global_strategic	reseller	14.78	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
57	{SpendManagementProcurement}	48	platinum	reseller	14.93	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
58	{DatabaseNosql}	28	gold	reseller	5.16	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
56	{HeadlessCmsContentPlatform}	13	gold	reseller	8.30	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
55	{DataGovernanceCatalog}	97	platinum	integrator	14.43	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
54	{CybersecurityEdgeNetwork}	135	platinum	integrator	10.43	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
53	{DataPlatformBigData}	37	platinum	reseller	14.43	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
91	{DataPlatformBigData}	129	silver	reseller	8.68	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
52	{DigitalWorkspaceVdi}	140	gold	integrator	7.50	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
51	{ProcessMining}	144	platinum	integrator	13.99	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
29	{ItServicesEngineering}	1843	gold	integrator	7.84	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
20	{Coworking}	5	gold	reseller	9.27	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
50	{InfrastructureSoftwareSemiconductors}	660	global_strategic	reseller	16.73	25.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
49	{ContentManagementCollaboration}	48	gold	reseller	7.55	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
48	{IpaasIntegration}	66	gold	reseller + integrator	7.60	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
47	{ItsmItOperations}	328	gold	reseller	7.44	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
46	{SupplyChainRetail}	284	platinum	reseller	13.65	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
45	{RpaAutomation}	38	gold	integrator	6.00	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
44	{FinanceAutomationAccounting}	28	gold	integrator	7.43	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
43	{DigitalBankingCx}	86	platinum	integrator	11.16	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
42	{IntegrationApiMft}	32	gold	reseller + integrator	7.50	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
41	{BankingSoftwareCoreBanking}	72	platinum	reseller	10.98	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
40	{CadBim3dDesign}	490	platinum	integrator	10.96	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
39	{ItServicesManagedServices}	3631	gold	reseller	8.63	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
38	{MarketingOperationsDam}	37	gold	integrator	6.01	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
37	{HardwareEcosystem}	2483	platinum	integrator	10.98	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
36	{Low-codeBpm}	58	gold	reseller	7.90	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
34	{EnterprisePlanningCpm}	80	platinum	integrator	14.13	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
33	{CloudIaas-paas}	2226	global_strategic	reseller + integrator	14.54	35.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
31	{AnalyticsDataPrep}	47	platinum	integrator	14.11	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
30	{RetailAnalyticsPersonalization}	29	gold	integrator	5.67	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
28	{CybersecurityCdnEdge}	415	platinum	reseller	11.38	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
27	{AiMachineLearning}	5	gold	reseller	5.63	10.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
106	{E-commercePlatform}	1247	platinum	reseller	11.83	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
26	{IndustrialSoftwarePlm}	321	platinum	reseller	13.48	20.00	2026-04-02 01:10:13+01		\N	\N	\N	\N	\N	\N	f	\N	\N	f	\N	2026-04-12 23:22:24.525756+01
16	{Azure,"Microsoft 365","Dynamics 365","Power Platform"}	15	Gold	Strategic Alliance	12.50	25.00	2026-04-12 23:32:49.356462+01	Partenaire stratégique global	Cloud & Enterprise Software	\N	8	1200	100000	\N	t	\N	\N	t	4	2026-04-12 23:22:24.525756+01
\.


--
-- Data for Name: university_partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.university_partners (partner_id, num_students, specialties, num_interns_per_year, num_apprentices_per_year, num_hires_per_year, conversion_rate_to_cdi, average_hire_duration_months, updated_at, notes, institution_type, annual_sponsorship_budget, budget_breakdown, num_events_per_year, last_event_date, has_framework_agreement, agreement_signed_date, created_at) FROM stdin;
2	1200	{Informatique,Télécommunications,Électronique}	25	8	18	72.00	6	2026-03-27 16:59:03.867095+01	\N	\N	\N	\N	\N	\N	f	\N	2026-04-12 23:22:24.512198+01
3	1800	{"Génie Civil",Mécanique,Énergétique}	20	5	15	75.00	7	2026-03-27 16:59:03.867095+01	\N	\N	\N	\N	\N	\N	f	\N	2026-04-12 23:22:24.512198+01
4	25000	{Sciences,Lettres,Droit,Économie}	15	3	10	66.00	9	2026-03-27 16:59:03.867095+01	\N	\N	\N	\N	\N	\N	f	\N	2026-04-12 23:22:24.512198+01
5	800	{Finance,Marketing,Management}	12	4	8	67.00	7	2026-03-27 16:59:03.867095+01	\N	\N	\N	\N	\N	\N	f	\N	2026-04-12 23:22:24.512198+01
1	12000	{Informatique,Télécommunications,"Génie Civil"}	150	30	45	69.00	8	2026-04-12 23:32:49.180644+01	Partenariat stratégique prioritaire	École d'ingénieur	50000	\N	\N	\N	f	\N	2026-04-12 23:22:24.512198+01
179	3000	{Informatique,"Génie Logiciel",IA}	150	\N	\N	\N	\N	2026-04-13 12:00:16.445057+01	\N	ecole_ingenieur	\N	\N	\N	\N	f	\N	2026-04-13 12:00:16.445057+01
182	3000	{Informatique,"Génie Logiciel",IA}	150	\N	\N	\N	\N	2026-04-13 17:04:40.867145+01	\N	ecole_ingenieur	\N	\N	\N	\N	f	\N	2026-04-13 17:04:40.867145+01
\.


--
-- Data for Name: vendor_projects; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.vendor_projects (id, technology_partner_id, project_name, project_description, client_name, project_type, technologies_used, start_date, end_date, duration_months, project_value, license_cost, services_cost, commission_earned, delivery_status, delay_days, budget_variance_percentage, client_satisfaction_score, num_consultants_capgemini, num_consultants_vendor, case_study_url, updated_at, notes, project_status, is_reference_project, created_at) FROM stdin;
1	174	Projet Zscaler - Sécurisation Zero Trust pour BIAT	Déploiement de la plateforme Zero Trust et SASE de Zscaler pour sécuriser l'accès aux applications critiques et à Internet pour les 5000 employés de BIAT. Migration depuis une architecture VPN traditionnelle.	BIAT (Banque Internationale Arabe de Tunisie)	Sécurisation du réseau	{"Zero Trust",SASE,Cybersecurity}	2024-01-15	2024-10-20	9	1250000	750000	500000	242125	Livré	0	2.50	94	6	3	https://casestudy.capgemini.com/zscaler-biat	2026-04-04 10:00:00+01	Projet livré avec succès, réduction des risques de 40%.	en_cours	f	2026-04-12 23:22:24.53115+01
2	173	Projet Workato - Automatisation iPaaS pour Amen Bank	Mise en place de l'iPaaS Workato pour orchestrer les workflows entre le core banking, le CRM et les applications de paiement. Automatisation de 50 processus métier.	Amen Bank	Intégration API	{iPaaS,Automation,Workflow}	2025-03-10	2026-01-25	10	380000	220000	160000	19684	En cours	0	-1.20	78	4	2		2026-04-04 10:00:00+01	Projet en phase de recette, premiers résultats positifs.	en_cours	f	2026-04-12 23:22:24.53115+01
3	172	Projet Workday - Modernisation HCM pour Groupe Chimique Tunisien	Implémentation de la suite HCM/ERP Workday pour la gestion des RH, paie et planification des talents. Migration depuis solution legacy.	Groupe Chimique Tunisien	Modernisation des RH	{HCM,ERP,Cloud}	2023-09-01	2024-08-15	11	1350000	850000	500000	259200	Livré	0	3.10	89	8	4		2026-04-04 10:00:00+01	Projet majeur, satisfaction client élevée.	en_cours	f	2026-04-12 23:22:24.53115+01
4	170	Projet VMware - Virtualisation du datacenter pour STEG	Modernisation du datacenter STEG avec vSphere, NSX et vSAN. Migration de 300 machines virtuelles vers une infrastructure hyperconvergée.	STEG	Infrastructure cloud	{Virtualization,"Cloud Infrastructure",HCI}	2024-02-01	2024-11-30	10	1150000	690000	460000	227125	Livré	0	-0.50	92	7	5		2026-04-04 10:00:00+01	Performance améliorée de 35%.	en_cours	f	2026-04-12 23:22:24.53115+01
5	171	Projet Vlocity (Salesforce) - Industry Cloud pour Tunisie Telecom	Déploiement des solutions sectorielles Vlocity pour le secteur telecom : gestion des offres, commandes et facturation.	Tunisie Telecom	CRM sectoriel	{"Industry Cloud",CRM}	2024-05-20	2025-03-10	10	680000	400000	280000	69292	Livré	0	1.80	82	5	3		2026-04-04 10:00:00+01	Intégration réussie avec les systèmes existants.	en_cours	f	2026-04-12 23:22:24.53115+01
6	169	Projet UKG - Workforce Management pour Tunisair	Mise en place de la solution UKG pour la gestion des horaires, paie et temps de travail des 3000 employés de Tunisair.	Tunisair	Gestion RH	{HCM,"Workforce Management"}	2024-09-15	2025-07-20	10	720000	450000	270000	86400	Livré	0	2.20	86	5	3		2026-04-04 10:00:00+01	Réduction des erreurs de paie de 60%.	en_cours	f	2026-04-12 23:22:24.53115+01
7	168	Projet UiPath - RPA pour Attijari Bank	Automatisation de processus back-office (ouverture de compte, traitement des prêts) avec UiPath. 30 robots déployés.	Attijari Bank	Automatisation RPA	{RPA,Automation}	2025-01-10	2025-12-05	11	1100000	650000	450000	215600	Livré	0	2.80	96	8	4		2026-04-04 10:00:00+01	Gain de productivité de 25%.	en_cours	f	2026-04-12 23:22:24.53115+01
8	167	Projet Tricentis - Tests automatisés pour CNAM	Déploiement de Tricentis pour automatiser les tests fonctionnels et de performance de l'application nationale de santé.	CNAM (Caisse Nationale d'Assurance Maladie)	QA et testing	{"Software testing",QA}	2025-02-01	2025-11-15	9	280000	160000	120000	22680	Livré	0	-1.50	84	4	2		2026-04-04 10:00:00+01	Réduction des bugs en production de 45%.	en_cours	f	2026-04-12 23:22:24.53115+01
9	166	Projet Tibco - Intégration middleware pour Ooredoo Tunisie	Mise en place de TIBCO pour connecter les systèmes de facturation, CRM et réseau. Orchestration de 200 services.	Ooredoo Tunisie	Intégration middleware	{Integration,Middleware}	2023-11-01	2024-09-30	11	320000	180000	140000	30272	Livré	0	2.00	75	5	3		2026-04-04 10:00:00+01	Projet livré mais quelques retards mineurs.	en_cours	f	2026-04-12 23:22:24.53115+01
10	165	Projet ThoughtSpot - BI augmentée pour Société Générale Tunisie	Déploiement de ThoughtSpot pour l'analyse en self-service des données clients et risques. Formation de 200 utilisateurs.	Société Générale Tunisie	BI et analytics	{BI,"Augmented analytics"}	2025-04-01	2026-01-20	9	250000	140000	110000	15000	En retard	74	3.50	55	3	2		2026-04-04 10:00:00+01	Retard dû à des problèmes d'intégration des données.	en_cours	f	2026-04-12 23:22:24.53115+01
11	164	Projet Teradata - Entrepôt de données pour ATB (Arab Tunisian Bank)	Modernisation de l'entrepôt de données avec Teradata Vantage. Migration depuis Oracle.	ATB	Data warehouse	{"Data warehouse",Analytics}	2024-03-01	2025-01-15	10	680000	420000	260000	69360	Livré	0	1.20	88	6	4		2026-04-04 10:00:00+01	Performance analytique multipliée par 10.	en_cours	f	2026-04-12 23:22:24.53115+01
12	163	Projet Tenable - Gestion des vulnérabilités pour Banque de Tunisie	Déploiement de Tenable.io pour la détection et priorisation des vulnérabilités sur l'ensemble du SI.	Banque de Tunisie	Cybersécurité	{Cybersecurity,"Vulnerability management"}	2024-06-10	2025-02-28	8	560000	350000	210000	108416	Livré	0	-0.80	92	4	2		2026-04-04 10:00:00+01	Réduction des risques de 60%.	en_cours	f	2026-04-12 23:22:24.53115+01
13	162	Projet Temenos - Core banking pour Wifack Bank	Implémentation de Temenos Transact pour le nouveau core banking digital de Wifack Bank.	Wifack Bank	Core banking	{"Core banking","Digital banking"}	2025-01-15	2026-03-20	14	1250000	800000	450000	223625	En cours	0	2.10	85	9	6		2026-04-04 10:00:00+01	Projet stratégique, go-live prévu pour mai 2026.	en_cours	f	2026-04-12 23:22:24.53115+01
14	161	Projet Tanium - Gestion des endpoints pour Ministère des Finances	Déploiement de Tanium pour l'inventaire temps réel, patching et conformité des 15 000 postes.	Ministère des Finances Tunisien	Endpoint management	{"Endpoint management",Security}	2024-09-01	2025-08-15	11	620000	380000	240000	89900	Livré	0	1.50	87	7	4		2026-04-04 10:00:00+01	Amélioration de la conformité de 90%.	en_cours	f	2026-04-12 23:22:24.53115+01
15	160	Projet Talend - Intégration de données pour Poulina Group	Mise en place de Talend pour l'ETL et la gouvernance des données entre les ERP, CRM et entrepôt.	Poulina Group	Intégration de données	{"Data integration",ETL}	2024-04-15	2025-01-10	9	520000	320000	200000	71240	Livré	0	0.90	86	5	3		2026-04-04 10:00:00+01	Projet réussi, data quality améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
16	159	Projet Tableau - Visualisation pour SMART Tunisie	Déploiement de Tableau pour les tableaux de bord de performance commerciale et logistique.	SMART Tunisie	BI et data visualization	{BI,"Data visualization"}	2025-02-10	2025-12-20	10	720000	450000	270000	78768	Livré	0	2.40	81	6	3		2026-04-04 10:00:00+01	Adoption par 300 utilisateurs.	en_cours	f	2026-04-12 23:22:24.53115+01
17	158	Projet Sumo Logic - Observabilité pour Vermeg	Mise en place de Sumo Logic pour la centralisation des logs et la surveillance applicative.	Vermeg (Tunisie)	Log analytics	{"Log analytics",Observability}	2025-05-01	2026-02-28	9	210000	120000	90000	16422	En retard	35	3.20	62	3	2		2026-04-04 10:00:00+01	Retard dû à la configuration des sources.	en_cours	f	2026-04-12 23:22:24.53115+01
125	40	Projet Autodesk - CAD/BIM pour Groupe Chimique	Conception 3D des installations industrielles.	Groupe Chimique Tunisien	CAD BIM 3D design	{CAD,BIM,"3D design"}	2024-09-15	2025-08-10	10	600000	380000	220000	65760	Livré	0	1.60	86	6	4		2026-04-04 10:00:00+01	Productivité conception +20%.	en_cours	f	2026-04-12 23:22:24.53115+01
18	157	Projet Stripe - Paiements pour GoMyCode	Intégration de Stripe pour la plateforme de paiements et abonnements de GoMyCode (école tech).	GoMyCode	Paiements fintech	{Payments,FinTech}	2025-01-20	2025-09-15	8	950000	600000	350000	173280	Livré	0	1.10	92	5	3		2026-04-04 10:00:00+01	Volume de transactions multiplié par 3.	en_cours	f	2026-04-12 23:22:24.53115+01
19	156	Projet Splunk - SIEM pour Autorité de Régulation des Télécommunications	Déploiement de Splunk ES pour la détection des menaces et la conformité réglementaire.	ART (Autorité de Régulation des Télécommunications)	SIEM et observabilité	{SIEM,Observability}	2024-10-01	2025-07-30	9	1050000	650000	400000	196350	Livré	0	2.00	95	7	4		2026-04-04 10:00:00+01	Détection d'incidents réduite à 2 minutes.	en_cours	f	2026-04-12 23:22:24.53115+01
20	155	Projet Sophos - Protection des endpoints pour City Cars	Déploiement de Sophos Intercept X et MDR pour 800 postes et serveurs.	City Cars Tunisie	Cybersécurité endpoint	{Cybersecurity,Endpoint}	2025-03-15	2025-12-10	9	520000	300000	220000	67548	Livré	0	1.80	85	4	2		2026-04-04 10:00:00+01	Aucune infection majeure depuis le déploiement.	en_cours	f	2026-04-12 23:22:24.53115+01
21	154	Projet SolarWinds - Supervision réseau pour TOPNET	Mise en place de SolarWinds NPM pour la supervision du backbone réseau de TOPNET.	TOPNET (fournisseur d'accès)	IT monitoring	{"IT monitoring",Network}	2023-12-01	2024-10-15	10	200000	110000	90000	16000	Livré	0	-2.30	72	3	2		2026-04-04 10:00:00+01	Projet simple, mais client satisfait.	en_cours	f	2026-04-12 23:22:24.53115+01
22	153	Projet Snowflake - Data warehouse pour Artelia Tunisie	Migration du data warehouse vers Snowflake, consolidation des données projets et finances.	Artelia Tunisie	Data warehouse cloud	{"Data warehouse","Cloud data"}	2024-11-15	2025-10-20	11	1250000	800000	450000	184750	Livré	0	2.70	96	8	5		2026-04-04 10:00:00+01	Performances accrues de 70%.	en_cours	f	2026-04-12 23:22:24.53115+01
23	152	Projet Slack - Collaboration pour Servicom	Déploiement de Slack Enterprise Grid pour les 1200 employés de Servicom (centre d'appels).	Servicom	Collaboration	{Collaboration,Messaging}	2025-01-01	2025-08-30	7	520000	320000	200000	76960	Livré	0	0.50	89	4	2		2026-04-04 10:00:00+01	Amélioration de la communication interne.	en_cours	f	2026-04-12 23:22:24.53115+01
24	151	Projet Sitecore - DXP pour Tunisie Télécom	Refonte du portail client et corporate avec Sitecore XP, personnalisation et analytics.	Tunisie Télécom	DXP / CMS	{DXP,CMS}	2025-02-20	2026-01-15	10	280000	160000	120000	16800	En retard	79	4.10	58	5	3		2026-04-04 10:00:00+01	Retard dans les intégrations avec le backend.	en_cours	f	2026-04-12 23:22:24.53115+01
25	150	Projet Siemens - Automatisation industrielle pour Groupe Chimique Tunisien	Déploiement de Siemens MindSphere et automation pour l'usine de Gabès.	Groupe Chimique Tunisien	Industrial automation	{Industrial,Automation}	2024-05-01	2025-04-30	11	900000	550000	350000	116100	Livré	0	1.40	88	7	5		2026-04-04 10:00:00+01	Productivité augmentée de 15%.	en_cours	f	2026-04-12 23:22:24.53115+01
26	149	Projet ServiceNow - Workflow ITSM pour BIAT	Implémentation de ServiceNow ITSM et HR Service Delivery pour les 2000 employés de BIAT.	BIAT	Workflow ITSM	{Workflow,ITSM}	2024-07-01	2025-06-15	11	1200000	750000	450000	176400	Livré	0	2.90	94	9	6		2026-04-04 10:00:00+01	Temps de résolution des incidents réduit de 40%.	en_cours	f	2026-04-12 23:22:24.53115+01
27	148	Projet SAS - Analytics pour Attijari Bank	Déploiement de SAS Viya pour la gestion des risques crédit et la conformité.	Attijari Bank	Analytics data science	{Analytics,"Data science"}	2024-10-15	2025-08-20	10	700000	450000	250000	95900	Livré	0	1.20	91	6	4		2026-04-04 10:00:00+01	Modèles de scoring plus précis.	en_cours	f	2026-04-12 23:22:24.53115+01
28	147	Projet SAP - ERP pour Poulina Group	Migration vers SAP S/4HANA Cloud, modules finance, supply chain et RH.	Poulina Group	ERP enterprise	{ERP,"Enterprise software"}	2024-01-20	2025-03-25	14	1500000	950000	550000	280500	Livré	0	3.40	97	12	8		2026-04-04 10:00:00+01	Projet de grande envergure réussi.	en_cours	f	2026-04-12 23:22:24.53115+01
29	146	Projet Salesforce - CRM pour SMART Tunisie	Déploiement de Sales Cloud et Service Cloud pour 500 utilisateurs commerciaux et support.	SMART Tunisie	CRM enterprise	{CRM,"Enterprise cloud"}	2024-09-01	2025-07-10	10	1400000	900000	500000	205520	Livré	0	2.10	90	8	5		2026-04-04 10:00:00+01	Chiffre d'affaires commercial amélioré de 18%.	en_cours	f	2026-04-12 23:22:24.53115+01
30	145	Projet SailPoint - IGA pour Banque de Tunisie	Mise en place de SailPoint IdentityIQ pour la gouvernance des accès et conformité.	Banque de Tunisie	Cybersécurité IGA	{Cybersecurity,IGA}	2025-03-01	2025-12-20	9	620000	380000	240000	92838	Livré	0	1.70	88	5	3		2026-04-04 10:00:00+01	Réduction des risques d'accès non autorisés.	en_cours	f	2026-04-12 23:22:24.53115+01
31	144	Projet Rubrik - Protection des données pour CNAM	Déploiement de Rubrik pour la sauvegarde et la cyber résilience des données critiques.	CNAM	Data protection	{"Data protection",Backup}	2025-01-10	2025-09-30	8	680000	420000	260000	89520	Livré	0	0.90	93	4	3		2026-04-04 10:00:00+01	RTO réduit de 80%.	en_cours	f	2026-04-12 23:22:24.53115+01
32	143	Projet RSA - IAM pour Ministère de l'Intérieur	Déploiement de RSA SecurID et gestion des identités pour l'accès sécurisé des agents.	Ministère de l'Intérieur Tunisien	Cybersécurité IAM	{Cybersecurity,IAM}	2023-12-10	2024-10-05	9	220000	130000	90000	15840	Livré	0	-3.20	68	4	3		2026-04-04 10:00:00+01	Projet avec quelques difficultés techniques.	en_cours	f	2026-04-12 23:22:24.53115+01
33	142	Projet Reltio - MDM pour Ooredoo Tunisie	Mise en place de Reltio Customer 360 pour unifier les données clients issues de 12 sources.	Ooredoo Tunisie	MDM customer 360	{MDM,"Customer 360"}	2025-04-15	2026-01-31	9	200000	120000	80000	16000	En retard	63	3.80	52	3	2		2026-04-04 10:00:00+01	Retard dû à la qualité des données sources.	en_cours	f	2026-04-12 23:22:24.53115+01
34	141	Projet Red Hat - OpenShift pour ATB	Déploiement de Red Hat OpenShift pour la modernisation des applications en conteneurs.	ATB	Open source Kubernetes	{"Open source",Kubernetes}	2024-08-01	2025-07-15	11	980000	600000	380000	179340	Livré	0	2.40	95	8	5		2026-04-04 10:00:00+01	Time-to-market réduit de 50%.	en_cours	f	2026-04-12 23:22:24.53115+01
35	140	Projet Rapid7 - Threat Management pour Vermeg	Déploiement de Rapid7 InsightVM et InsightIDR pour la détection des menaces.	Vermeg	Cybersécurité threat management	{Cybersecurity,"Threat management"}	2023-09-01	2024-06-30	9	610000	380000	230000	91500	Livré	0	1.10	89	5	3		2026-04-04 10:00:00+01	Projet terminé, bon retour.	en_cours	f	2026-04-12 23:22:24.53115+01
36	139	Projet Rackspace - Managed cloud pour Artelia	Migration des workloads vers AWS gérés par Rackspace, support 24/7.	Artelia Tunisie	Managed cloud services	{"Managed cloud services"}	2024-10-01	2025-08-31	10	240000	140000	100000	13680	Livré	0	-1.80	74	4	2		2026-04-04 10:00:00+01	Coûts cloud optimisés.	en_cours	f	2026-04-12 23:22:24.53115+01
37	138	Projet Qualys - Vulnérabilité pour Ciments de Bizerte	Déploiement de Qualys VMDR pour la gestion des vulnérabilités sur l'infrastructure OT et IT.	Ciments de Bizerte	Cybersécurité vulnérability	{Cybersecurity,"Vulnerability management"}	2024-07-15	2025-04-30	9	520000	320000	200000	56784	Livré	0	2.30	85	4	2		2026-04-04 10:00:00+01	Conformité renforcée.	en_cours	f	2026-04-12 23:22:24.53115+01
38	137	Projet Qlik - BI pour Groupe Chimique Tunisien	Déploiement de Qlik Sense pour les tableaux de bord de production et logistique.	Groupe Chimique Tunisien	BI data integration	{BI,"Data integration"}	2025-02-01	2025-11-15	9	560000	350000	210000	79520	Livré	0	1.50	86	5	3		2026-04-04 10:00:00+01	Adoption par 150 utilisateurs.	en_cours	f	2026-04-12 23:22:24.53115+01
39	136	Projet Pure Storage - Infrastructure pour STEG	Remplacement du stockage legacy par Pure FlashArray, amélioration des performances.	STEG	Storage data infrastructure	{Storage,"Data infrastructure"}	2024-11-01	2025-08-20	9	620000	400000	220000	78740	Livré	0	1.90	94	4	3		2026-04-04 10:00:00+01	Latence réduite de 80%.	en_cours	f	2026-04-12 23:22:24.53115+01
40	135	Projet PTC - PLM pour Groupe Chimique Tunisien	Déploiement de PTC Windchill pour la gestion du cycle de vie des produits chimiques.	Groupe Chimique Tunisien	Industrial software PLM IoT	{"Industrial software",PLM,IoT}	2024-05-20	2025-04-15	10	700000	450000	250000	87290	Livré	0	2.60	88	6	4		2026-04-04 10:00:00+01	Collaboration améliorée entre R&D et production.	en_cours	f	2026-04-12 23:22:24.53115+01
41	133	Projet Planview - PPM pour BIAT	Mise en place de Planview pour la gestion de portefeuille de projets IT et la planification des ressources.	BIAT	PPM work management	{PPM,"Work management"}	2025-04-10	2026-02-28	10	220000	130000	90000	14432	En retard	35	3.70	61	4	2		2026-04-04 10:00:00+01	Retard dans la configuration des workflows.	en_cours	f	2026-04-12 23:22:24.53115+01
42	132	Projet Pega - BPM pour Tunisie Telecom	Orchestration des processus de gestion des commandes avec Pega CRM/BPM.	Tunisie Telecom	BPM CRM platform	{BPM,"CRM platform"}	2024-09-15	2025-08-10	10	620000	380000	240000	77964	Livré	0	1.40	85	6	4		2026-04-04 10:00:00+01	Temps de traitement des commandes réduit de 30%.	en_cours	f	2026-04-12 23:22:24.53115+01
43	131	Projet Palo Alto - Sécurité réseau pour SMART Tunisie	Déploiement de firewalls PA-5200 et Prisma SASE pour la protection du datacenter et du télétravail.	SMART Tunisie	Cybersécurité réseau	{Cybersecurity,"Network security"}	2025-01-15	2025-12-10	10	1200000	780000	420000	193200	Livré	0	2.80	90	7	5		2026-04-04 10:00:00+01	Protection avancée contre les menaces.	en_cours	f	2026-04-12 23:22:24.53115+01
44	130	Projet Palantir - Analytics pour Ministère de l'Intérieur	Déploiement de Palantir Foundry pour l'intégration et l'analyse des données de sécurité.	Ministère de l'Intérieur	Data analytics decision intelligence	{"Data analytics","Decision intelligence"}	2023-10-01	2024-09-30	11	780000	500000	280000	46800	Livré	0	-1.90	71	6	4		2026-04-04 10:00:00+01	Projet complexe mais livré.	en_cours	f	2026-04-12 23:22:24.53115+01
45	129	Projet OutSystems - Low-code pour CNAM	Développement d'applications métier (gestion des dossiers, workflow) avec OutSystems.	CNAM	Low-code platform	{"Low-code platform"}	2025-03-01	2026-01-15	10	520000	320000	200000	63096	En retard	79	4.50	53	5	3		2026-04-04 10:00:00+01	Retard dû à l'évolution des besoins.	en_cours	f	2026-04-12 23:22:24.53115+01
46	128	Projet Oracle - Cloud pour ATB	Migration des bases de données et applications vers OCI (Oracle Cloud Infrastructure).	ATB	Enterprise software cloud	{"Enterprise software",Cloud}	2024-02-01	2025-02-28	12	1350000	850000	500000	252450	Livré	0	2.20	89	10	6		2026-04-04 10:00:00+01	Réduction des coûts de 25%.	en_cours	f	2026-04-12 23:22:24.53115+01
47	127	Projet OpenText - ECM pour Ministère des Finances	Déploiement d'OpenText Content Suite pour la gestion électronique des documents et l'archivage légal.	Ministère des Finances	ECM information management	{ECM,"Information management"}	2024-06-10	2025-05-20	11	720000	450000	270000	108000	Livré	0	1.80	94	6	4		2026-04-04 10:00:00+01	Traitement des dossiers accéléré.	en_cours	f	2026-04-12 23:22:24.53115+01
48	126	Projet OneStream - CPM pour Attijari Bank	Consolidation financière et planification avec OneStream pour les états réglementaires.	Attijari Bank	CPM financial consolidation	{CPM,"Financial consolidation"}	2023-12-05	2024-11-10	11	540000	330000	210000	64800	Livré	0	0.70	85	5	3		2026-04-04 10:00:00+01	Clôture financière réduite de 8 à 3 jours.	en_cours	f	2026-04-12 23:22:24.53115+01
49	125	Projet Okta - IAM pour Poulina Group	Déploiement d'Okta Workforce Identity pour le SSO et MFA sur 120 applications.	Poulina Group	Cybersécurité IAM	{Cybersecurity,IAM}	2025-02-01	2025-10-20	8	700000	450000	250000	84200	Livré	0	1.60	88	6	4		2026-04-04 10:00:00+01	Sécurité renforcée.	en_cours	f	2026-04-12 23:22:24.53115+01
50	124	Projet NVIDIA - IA pour ART	Déploiement de serveurs DGX et plateforme AI Enterprise pour la formation de modèles de deep learning.	ART (Agence de Réhabilitation Thermique)	Semiconductors AI compute	{Semiconductors,"AI compute"}	2025-03-20	2026-02-10	10	1250000	800000	450000	176875	En retard	53	2.90	78	8	5		2026-04-04 10:00:00+01	Retard dû à la livraison du matériel.	en_cours	f	2026-04-12 23:22:24.53115+01
51	122	Projet Nutanix - HCI pour STEG	Remplacement de l'ancienne infrastructure par Nutanix AHV et Files Storage.	STEG	Cloud infrastructure HCI	{"Cloud infrastructure",HCI}	2024-04-15	2025-02-28	10	680000	420000	260000	86700	Livré	0	1.90	87	5	3		2026-04-04 10:00:00+01	Simplification de l'infrastructure.	en_cours	f	2026-04-12 23:22:24.53115+01
52	121	Projet Nuance - IA conversationnelle pour Tunisie Telecom	Mise en place de la plateforme vocale Nuance pour le service client automatisé.	Tunisie Telecom	Conversational AI speech	{"Conversational AI",Speech}	2023-11-20	2024-10-10	10	520000	320000	200000	33176	Livré	0	-0.80	75	5	3		2026-04-04 10:00:00+01	Taux de résolution automatique de 45%.	en_cours	f	2026-04-12 23:22:24.53115+01
53	120	Projet Nintex - Workflow pour CNAM	Automatisation des processus d'approbation et formulaires avec Nintex.	CNAM	Workflow process automation	{Workflow,"Process automation"}	2024-08-01	2025-04-15	8	180000	100000	80000	9432	Livré	0	-2.10	70	3	2		2026-04-04 10:00:00+01	Projet simple mais efficace.	en_cours	f	2026-04-12 23:22:24.53115+01
54	119	Projet NICE - CX pour Servicom	Déploiement de NICE CXone pour le centre de contact omnicanal.	Servicom	Customer experience contact center	{"Customer experience","Contact center"}	2025-01-10	2025-11-20	10	620000	380000	240000	79670	Livré	0	2.00	86	5	3		2026-04-04 10:00:00+01	Satisfaction client améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
55	123	Projet NGINX - Load balancing pour Ooredoo	Déploiement de NGINX Plus pour l'équilibrage de charge et l'API gateway.	Ooredoo Tunisie	Web server load balancing	{"Web server","Load balancing"}	2025-03-15	2025-12-05	8	220000	130000	90000	13134	Livré	0	1.30	83	3	2		2026-04-04 10:00:00+01	Haute disponibilité assurée.	en_cours	f	2026-04-12 23:22:24.53115+01
56	118	Projet Nexthink - DEX pour BIAT	Mesure de l'expérience utilisateur et diagnostic des postes de travail avec Nexthink.	BIAT	DEX endpoint analytics	{DEX,"Endpoint analytics"}	2025-04-01	2026-01-20	9	210000	120000	90000	16800	En retard	74	3.90	57	4	2		2026-04-04 10:00:00+01	Retard dans l'analyse des données.	en_cours	f	2026-04-12 23:22:24.53115+01
57	117	Projet New Relic - Observabilité pour Artelia	Mise en place d'APM et monitoring avec New Relic pour les applications critiques.	Artelia Tunisie	Observability APM	{Observability,APM}	2024-02-15	2024-12-20	10	260000	150000	110000	14222	Livré	0	1.40	81	4	2		2026-04-04 10:00:00+01	Détection proactive des pannes.	en_cours	f	2026-04-12 23:22:24.53115+01
58	115	Projet Neo4j - Base graphe pour Autorité de Régulation	Détection de fraude et analyse de graphes de connexions avec Neo4j.	ART	Database graph	{Database,Graph}	2024-09-10	2025-06-15	9	230000	140000	90000	19320	Livré	0	2.10	80	3	2		2026-04-04 10:00:00+01	Modèles de fraude plus efficaces.	en_cours	f	2026-04-12 23:22:24.53115+01
59	113	Projet MongoDB - NoSQL pour GoMyCode	Migration de la base de données relationnelle vers MongoDB Atlas.	GoMyCode	Database NoSQL	{Database,NoSQL}	2025-02-10	2025-10-05	7	620000	380000	240000	66540	Livré	0	1.10	87	5	3		2026-04-04 10:00:00+01	Scalabilité améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
60	112	Projet MicroStrategy - BI pour SMART Tunisie	Déploiement de MicroStrategy pour le reporting financier et commercial.	SMART Tunisie	BI analytics	{BI,Analytics}	2025-03-01	2025-11-25	8	250000	150000	100000	22600	Livré	0	0.50	82	4	2		2026-04-04 10:00:00+01	Projet livré dans les temps.	en_cours	f	2026-04-12 23:22:24.53115+01
61	111	Projet Microsoft - Cloud pour Groupe Chimique Tunisien	Migration complète vers Azure, utilisation de PaaS et SaaS.	Groupe Chimique Tunisien	Cloud enterprise software	{Cloud,"Enterprise software"}	2024-01-15	2025-03-20	14	1500000	950000	550000	263250	Livré	0	3.20	91	12	8		2026-04-04 10:00:00+01	Transformation numérique réussie.	en_cours	f	2026-04-12 23:22:24.53115+01
62	110	Projet Mendix - Low-code pour CNAM	Développement d'applications de gestion des prestations avec Mendix.	CNAM	Low-code platform	{"Low-code platform"}	2025-03-10	2026-01-15	10	520000	320000	200000	62920	En retard	79	3.60	60	5	3		2026-04-04 10:00:00+01	Retard dans la phase de tests.	en_cours	f	2026-04-12 23:22:24.53115+01
63	108	Projet Manhattan - Supply chain pour Poulina Group	Déploiement de Manhattan WMS pour les entrepôts logistiques.	Poulina Group	Supply chain execution WMS	{"Supply chain execution",WMS}	2024-06-01	2025-05-20	11	580000	360000	220000	85720	Livré	0	2.20	86	6	4		2026-04-04 10:00:00+01	Productivité entrepôt +20%.	en_cours	f	2026-04-12 23:22:24.53115+01
64	107	Projet Mambu - Core banking pour Wifack	Implémentation de Mambu pour le crédit et l'épargne digitale.	Wifack Bank	Core banking FinTech	{"Core banking",FinTech}	2024-10-15	2025-09-10	10	610000	380000	230000	99430	Livré	0	1.90	88	6	4		2026-04-04 10:00:00+01	Lancement rapide de nouveaux produits.	en_cours	f	2026-04-12 23:22:24.53115+01
65	105	Projet Looker - BI pour ATB	Déploiement de Looker pour la modélisation et les tableaux de bord décisionnels.	ATB	BI analytics	{BI,Analytics}	2025-01-20	2025-11-01	9	280000	170000	110000	23240	Livré	0	1.70	84	4	2		2026-04-04 10:00:00+01	Autonomie des utilisateurs métier.	en_cours	f	2026-04-12 23:22:24.53115+01
66	104	Projet Lenovo - Matériel pour SMART Tunisie	Fourniture de serveurs ThinkSystem et postes de travail pour le datacenter.	SMART Tunisie	Hardware devices	{Hardware,Devices}	2024-07-01	2025-04-15	9	620000	400000	220000	76260	Livré	0	0.80	87	4	3		2026-04-04 10:00:00+01	Infrastructure renouvelée.	en_cours	f	2026-04-12 23:22:24.53115+01
67	103	Projet Kyriba - TMS pour Attijari Bank	Gestion de trésorerie et paiements avec Kyriba pour les flux internationaux.	Attijari Bank	Treasury TMS	{Treasury,TMS}	2025-02-15	2025-11-20	9	500000	300000	200000	54150	Livré	0	2.30	85	5	3		2026-04-04 10:00:00+01	Visibilité sur la trésorerie améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
68	102	Projet Kong - API gateway pour Ooredoo	Déploiement de Kong Enterprise pour la gouvernance des microservices.	Ooredoo Tunisie	API management gateway	{"API management",Gateway}	2025-04-01	2026-01-10	9	250000	150000	100000	21000	En retard	84	4.20	54	4	2		2026-04-04 10:00:00+01	Retard dû à la complexité des environnements.	en_cours	f	2026-04-12 23:22:24.53115+01
69	101	Projet Kofax - Automatisation pour CNAM	Capture et traitement intelligent des formulaires de remboursement avec Kofax.	CNAM	Intelligent automation capture	{"Intelligent automation",Capture}	2023-12-01	2024-10-20	10	200000	120000	80000	11200	Livré	0	-1.50	68	3	2		2026-04-04 10:00:00+01	Projet avec des difficultés de reconnaissance.	en_cours	f	2026-04-12 23:22:24.53115+01
70	100	Projet Kinaxis - Supply planning pour Poulina Group	Planification concurrente de la supply chain avec Kinaxis RapidResponse.	Poulina Group	Supply chain planning	{"Supply chain planning"}	2024-09-15	2025-07-20	10	520000	320000	200000	76200	Livré	0	1.80	86	5	3		2026-04-04 10:00:00+01	Réduction des ruptures de stock.	en_cours	f	2026-04-12 23:22:24.53115+01
71	99	Projet Jitterbit - iPaaS pour Artelia	Intégration de CRM, ERP et applications métier avec Jitterbit.	Artelia Tunisie	iPaaS integration	{iPaaS,Integration}	2025-02-01	2025-10-10	8	160000	90000	70000	13728	Livré	0	1.20	80	3	2		2026-04-04 10:00:00+01	Projet de moindre ampleur mais réussi.	en_cours	f	2026-04-12 23:22:24.53115+01
72	98	Projet Jedox - CPM pour Banque de Tunisie	Planification budgétaire et reporting avec Jedox.	Banque de Tunisie	CPM planning	{CPM,Planning}	2025-03-10	2025-12-15	9	180000	100000	80000	12276	Livré	0	0.90	79	3	2		2026-04-04 10:00:00+01	Processus budgétaire accéléré.	en_cours	f	2026-04-12 23:22:24.53115+01
73	97	Projet Ivanti - ITSM pour Ministère des Finances	Gestion des services IT et endpoint management avec Ivanti.	Ministère des Finances	ITSM endpoint management	{ITSM,"Endpoint management"}	2025-01-05	2025-10-20	9	240000	140000	100000	22320	Livré	0	1.60	81	4	2		2026-04-04 10:00:00+01	Meilleure gestion des incidents.	en_cours	f	2026-04-12 23:22:24.53115+01
74	96	Projet Intel - Semiconducteurs pour ART	Fourniture de processeurs Xeon et accélérateurs pour le datacenter IA.	ART	Semiconductors hardware	{Semiconductors,Hardware}	2024-08-01	2025-06-30	10	880000	600000	280000	138776	Livré	0	2.40	88	6	4		2026-04-04 10:00:00+01	Performances de calcul améliorées.	en_cours	f	2026-04-12 23:22:24.53115+01
75	95	Projet Informatica - Data management pour Groupe Chimique	Gouvernance et intégration des données avec Informatica MDM et ETL.	Groupe Chimique Tunisien	Data management integration	{"Data management",Integration}	2024-03-15	2025-02-28	11	920000	580000	340000	139104	Livré	0	2.10	89	7	5		2026-04-04 10:00:00+01	Qualité des données améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
76	94	Projet Infor - ERP sectoriel pour Poulina Group	Déploiement d'Infor M3 pour l'industrie agroalimentaire.	Poulina Group	ERP industry cloud	{ERP,"Industry cloud"}	2024-10-01	2025-08-20	10	610000	380000	230000	89060	Livré	0	1.70	87	6	4		2026-04-04 10:00:00+01	Adaptation aux besoins métier.	en_cours	f	2026-04-12 23:22:24.53115+01
77	93	Projet IFS - EAM pour STEG	Gestion des actifs et maintenance avec IFS Cloud.	STEG	ERP EAM field service	{ERP,EAM,"Field service"}	2025-01-20	2025-12-15	10	520000	320000	200000	76700	Livré	0	1.90	86	5	3		2026-04-04 10:00:00+01	Disponibilité des équipements augmentée.	en_cours	f	2026-04-12 23:22:24.53115+01
78	92	Projet IBM - Consulting pour BIAT	Accompagnement stratégique pour la transformation cloud hybride avec IBM Consulting.	BIAT	Enterprise IT consulting	{"Enterprise IT",Consulting}	2024-02-01	2025-03-31	13	1300000	400000	900000	235430	Livré	0	2.50	88	10	6		2026-04-04 10:00:00+01	Feuille de route définie.	en_cours	f	2026-04-12 23:22:24.53115+01
79	90	Projet HPE - Infrastructure pour CNAM	Fourniture de serveurs Synergy et stockage Nimble pour le datacenter.	CNAM	Hardware infrastructure	{Hardware,Infrastructure}	2024-05-01	2025-03-10	10	950000	650000	300000	162075	Livré	0	1.80	88	7	5		2026-04-04 10:00:00+01	Infrastructure modernisée.	en_cours	f	2026-04-12 23:22:24.53115+01
80	89	Projet HERE - Géospatial pour Tunisie Telecom	Intégration des cartes HERE pour le suivi des infrastructures réseau.	Tunisie Telecom	Geospatial mapping	{Geospatial,Mapping}	2025-02-15	2025-11-10	8	280000	170000	110000	21000	Livré	0	1.40	83	4	2		2026-04-04 10:00:00+01	Visualisation des réseaux améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
81	88	Projet HashiCorp - IaC pour ATB	Déploiement de Terraform et Vault pour l'automatisation et la gestion des secrets.	ATB	DevOps infrastructure as code	{DevOps,"Infrastructure as Code"}	2024-09-01	2025-06-20	9	640000	400000	240000	94720	Livré	0	2.20	88	6	4		2026-04-04 10:00:00+01	Infrastructure reproductible.	en_cours	f	2026-04-12 23:22:24.53115+01
82	87	Projet Guidewire - Assurance pour Société Générale Tunisie	Implémentation de Guidewire pour la souscription et la gestion des sinistres.	Société Générale Tunisie	Insurance software core system	{"Insurance software","Core system"}	2024-06-15	2025-06-10	11	720000	450000	270000	88560	Livré	0	1.90	87	6	4		2026-04-04 10:00:00+01	Traitement des sinistres accéléré.	en_cours	f	2026-04-12 23:22:24.53115+01
83	86	Projet Google Cloud - IaaS/PaaS pour Poulina Group	Migration vers GCP, utilisation de BigQuery et AI Platform.	Poulina Group	Cloud IaaS-PaaS	{Cloud,IaaS-PaaS}	2024-03-01	2025-02-28	11	1150000	700000	450000	200100	Livré	0	2.60	90	9	6		2026-04-04 10:00:00+01	Analytique avancée déployée.	en_cours	f	2026-04-12 23:22:24.53115+01
84	85	Projet Globalization Partners - EOR pour GoMyCode	Gestion de l'embauche internationale pour les talents distants.	GoMyCode	HR Employer of Record (EOR)	{HR,"Employer of Record (EOR)"}	2025-04-10	2026-02-20	10	180000	100000	80000	13320	En retard	43	3.10	68	3	2		2026-04-04 10:00:00+01	Retard administratif mineur.	en_cours	f	2026-04-12 23:22:24.53115+01
85	84	Projet GitLab - DevSecOps pour Artelia	Mise en place de l'usine logicielle avec GitLab CI/CD.	Artelia Tunisie	DevSecOps CI-CD	{DevSecOps,CI-CD}	2025-01-15	2025-10-10	8	300000	180000	120000	22470	Livré	0	1.20	84	5	3		2026-04-04 10:00:00+01	Cycle de développement accéléré.	en_cours	f	2026-04-12 23:22:24.53115+01
86	83	Projet GitHub - SCM pour CNAM	Migration du code source vers GitHub Enterprise avec Actions.	CNAM	DevOps SCM	{DevOps,SCM}	2024-10-01	2025-07-15	9	620000	380000	240000	64046	Livré	0	1.70	88	5	3		2026-04-04 10:00:00+01	Collaboration développeurs améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
87	82	Projet Genesys - Contact center pour Servicom	Déploiement de Genesys Cloud CX pour l'omnicanal.	Servicom	Customer experience contact center	{"Customer experience","Contact center"}	2024-12-01	2025-10-20	10	700000	440000	260000	90300	Livré	0	2.00	87	6	4		2026-04-04 10:00:00+01	Taux de satisfaction client +15%.	en_cours	f	2026-04-12 23:22:24.53115+01
88	81	Projet Forcepoint - DLP pour Ministère de l'Intérieur	Protection contre la perte de données avec Forcepoint DLP et SASE.	Ministère de l'Intérieur	Cybersecurity DLP SASE	{Cybersecurity,DLP,SASE}	2025-03-01	2025-12-15	9	520000	320000	200000	70040	Livré	0	1.50	86	5	3		2026-04-04 10:00:00+01	Conformité RGPD renforcée.	en_cours	f	2026-04-12 23:22:24.53115+01
89	79	Projet Flexera - SAM pour BIAT	Optimisation des licences logiciels et FinOps avec Flexera.	BIAT	IT asset management FinOps	{"IT asset management",FinOps}	2025-02-10	2025-10-30	8	280000	170000	110000	22400	Livré	0	0.90	83	4	2		2026-04-04 10:00:00+01	Économies de 15% sur les licences.	en_cours	f	2026-04-12 23:22:24.53115+01
90	78	Projet Fivetran - ELT pour ATB	Ingestion automatique des données sources vers Snowflake.	ATB	Data integration ELT	{"Data integration",ELT}	2024-11-01	2025-08-20	9	560000	350000	210000	67200	Livré	0	1.80	87	5	3		2026-04-04 10:00:00+01	Data pipeline fiable.	en_cours	f	2026-04-12 23:22:24.53115+01
91	77	Projet Finastra - Banking pour Amen Bank	Modernisation du core banking avec Finastra Fusion.	Amen Bank	Banking software FinTech	{"Banking software",FinTech}	2024-04-15	2025-04-10	11	980000	620000	360000	167580	Livré	0	2.40	88	8	5		2026-04-04 10:00:00+01	Nouveaux produits lancés rapidement.	en_cours	f	2026-04-12 23:22:24.53115+01
92	76	Projet Fenergo - KYC pour Banque de Tunisie	Automatisation de l'onboarding client et conformité KYC/CLM.	Banque de Tunisie	RegTech KYC CLM	{RegTech,KYC,CLM}	2025-01-10	2025-10-05	8	480000	300000	180000	69888	Livré	0	1.30	87	5	3		2026-04-04 10:00:00+01	Temps d'onboarding réduit de 70%.	en_cours	f	2026-04-12 23:22:24.53115+01
93	75	Projet Everteam - ECM pour Ministère des Finances	Archivage électronique et gestion de contenu avec Everteam.	Ministère des Finances	ECM archiving	{ECM,Archiving}	2025-03-15	2025-12-20	9	170000	100000	70000	10829	Livré	0	1.10	81	3	2		2026-04-04 10:00:00+01	Projet conforme aux normes.	en_cours	f	2026-04-12 23:22:24.53115+01
94	74	Projet Ericsson - 5G pour Tunisie Telecom	Déploiement du coeur de réseau 5G et OSS/BSS.	Tunisie Telecom	Telecom 5G network	{Telecom,5G,Network}	2024-09-01	2025-08-31	11	750000	480000	270000	97500	Livré	0	2.30	86	7	5		2026-04-04 10:00:00+01	Couverture 5G étendue.	en_cours	f	2026-04-12 23:22:24.53115+01
95	73	Projet Envision Digital - IoT pour STEG	Plateforme IoT pour la maintenance prédictive des centrales.	STEG	IoT industrial AI	{IoT,"Industrial AI"}	2024-11-15	2025-09-10	9	200000	120000	80000	14040	Livré	0	1.40	78	4	2		2026-04-04 10:00:00+01	Arrêts imprévus réduits.	en_cours	f	2026-04-12 23:22:24.53115+01
96	72	Projet Enablon - EHS pour Groupe Chimique Tunisien	Gestion de la santé-sécurité-environnement et reporting ESG.	Groupe Chimique Tunisien	EHS ESG GRC	{EHS,ESG,GRC}	2025-02-01	2025-11-15	9	270000	160000	110000	19953	Livré	0	1.60	83	4	2		2026-04-04 10:00:00+01	Conformité améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
97	71	Projet Elastic - Search pour CNAM	Mise en place d'Elasticsearch pour la recherche documentaire et l'observabilité.	CNAM	Search observability SIEM	{Search,Observability,SIEM}	2024-10-01	2025-07-20	9	520000	320000	200000	44720	Livré	0	1.80	86	5	3		2026-04-04 10:00:00+01	Recherche temps réel.	en_cours	f	2026-04-12 23:22:24.53115+01
98	70	Projet Dynatrace - APM pour Artelia	Surveillance applicative et AIOps avec Dynatrace.	Artelia Tunisie	Observability APM	{Observability,APM}	2025-01-20	2025-10-10	8	610000	380000	230000	79300	Livré	0	1.50	87	5	3		2026-04-04 10:00:00+01	Détection automatique des anomalies.	en_cours	f	2026-04-12 23:22:24.53115+01
99	69	Projet Drupal - CMS pour Ministère du Tourisme	Refonte du portail web institutionnel avec Drupal.	Ministère du Tourisme Tunisien	CMS open source	{CMS,"Open source"}	2025-04-01	2026-02-28	10	90000	50000	40000	5220	En retard	35	2.90	73	3	2		2026-04-04 10:00:00+01	Retard dans la validation des contenus.	en_cours	f	2026-04-12 23:22:24.53115+01
100	68	Projet Dremio - SQL engine pour ATB	Accès aux data lakes avec Dremio pour les analystes.	ATB	Data platform SQL engine	{"Data platform","SQL engine"}	2025-03-01	2025-12-15	9	210000	130000	80000	12642	Livré	0	1.20	81	4	2		2026-04-04 10:00:00+01	Requêtes plus rapides.	en_cours	f	2026-04-12 23:22:24.53115+01
101	67	Projet Docker - Conteneurs pour CNAM	Containerisation des applications avec Docker Enterprise.	CNAM	DevOps containers	{DevOps,Containers}	2024-08-15	2025-05-10	8	320000	200000	120000	29632	Livré	0	1.70	85	5	3		2026-04-04 10:00:00+01	Portabilité accrue.	en_cours	f	2026-04-12 23:22:24.53115+01
102	66	Projet Denodo - Data virtualization pour SMART Tunisie	Virtualisation des données pour unifier les accès sans déplacement.	SMART Tunisie	Data virtualization	{"Data virtualization"}	2025-02-15	2025-11-20	9	270000	160000	110000	20412	Livré	0	1.30	84	4	2		2026-04-04 10:00:00+01	Accès simplifié aux données.	en_cours	f	2026-04-12 23:22:24.53115+01
103	65	Projet Dell - Infrastructure pour STEG	Renouvellement des serveurs et stockage Dell PowerEdge.	STEG	Hardware infrastructure	{Hardware,Infrastructure}	2024-06-01	2025-05-15	11	980000	650000	330000	179340	Livré	0	2.10	89	7	5		2026-04-04 10:00:00+01	Capacité de calcul augmentée.	en_cours	f	2026-04-12 23:22:24.53115+01
104	64	Projet DataRobot - AutoML pour BIAT	Déploiement de DataRobot pour la création de modèles prédictifs.	BIAT	AI AutoML MLOps	{AI,AutoML,MLOps}	2025-01-10	2025-10-01	8	300000	180000	120000	28470	Livré	0	1.40	84	4	2		2026-04-04 10:00:00+01	Modèles déployés en production.	en_cours	f	2026-04-12 23:22:24.53115+01
105	63	Projet Dataiku - Analytics pour Attijari Bank	Plateforme data science collaborative avec Dataiku.	Attijari Bank	AI analytics platform	{AI,"Analytics platform"}	2024-09-15	2025-08-20	11	620000	390000	230000	85320	Livré	0	1.90	88	6	4		2026-04-04 10:00:00+01	Adoption par les data scientists.	en_cours	f	2026-04-12 23:22:24.53115+01
106	62	Projet Datadog - Monitoring pour Ooredoo	Observabilité full-stack avec Datadog.	Ooredoo Tunisie	Observability monitoring	{Observability,Monitoring}	2025-02-01	2025-11-10	9	680000	430000	250000	74660	Livré	0	1.60	88	5	3		2026-04-04 10:00:00+01	Alerting amélioré.	en_cours	f	2026-04-12 23:22:24.53115+01
107	61	Projet Databricks - Lakehouse pour Poulina Group	Plateforme lakehouse pour l'analytique avancée.	Poulina Group	Data platform lakehouse	{"Data platform",Lakehouse}	2024-05-01	2025-04-30	11	1100000	700000	400000	162580	Livré	0	2.70	90	9	6		2026-04-04 10:00:00+01	Performances de requêtes ×10.	en_cours	f	2026-04-12 23:22:24.53115+01
108	58	Projet Couchbase - NoSQL pour GoMyCode	Base de données NoSQL pour l'application e-learning.	GoMyCode	Database NoSQL	{Database,NoSQL}	2025-03-15	2025-12-10	8	250000	150000	100000	12900	Livré	0	0.80	83	4	2		2026-04-04 10:00:00+01	Latence réduite.	en_cours	f	2026-04-12 23:22:24.53115+01
109	56	Projet Contentful - CMS headless pour SMART Tunisie	Refonte de l'application mobile avec Contentful.	SMART Tunisie	Headless CMS content platform	{"Headless CMS","Content platform"}	2025-01-20	2025-10-05	8	280000	170000	110000	23240	Livré	0	1.30	82	4	2		2026-04-04 10:00:00+01	Flexibilité du contenu.	en_cours	f	2026-04-12 23:22:24.53115+01
110	55	Projet Collibra - Data governance pour ATB	Mise en place du catalogue de données et gouvernance.	ATB	Data governance catalog	{"Data governance",Catalog}	2024-10-01	2025-08-15	10	600000	380000	220000	86580	Livré	0	1.80	87	6	4		2026-04-04 10:00:00+01	Traçabilité des données.	en_cours	f	2026-04-12 23:22:24.53115+01
111	54	Projet Cloudflare - Edge pour CNAM	Sécurisation et accélération du site web avec Cloudflare.	CNAM	Cybersecurity edge network	{Cybersecurity,"Edge network"}	2025-02-10	2025-11-01	8	680000	430000	250000	58480	Livré	0	1.40	88	5	3		2026-04-04 10:00:00+01	Disponibilité améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
112	53	Projet Cloudera - Big data pour STEG	Plateforme data lakehouse pour les données IoT.	STEG	Data platform big data	{"Data platform","Big data"}	2024-07-01	2025-05-20	10	550000	350000	200000	47300	Livré	0	1.90	85	6	4		2026-04-04 10:00:00+01	Analyse temps réel.	en_cours	f	2026-04-12 23:22:24.53115+01
113	52	Projet Citrix - VDI pour Ministère des Finances	Environnement de bureau virtuel pour les agents.	Ministère des Finances	Digital workspace VDI	{"Digital workspace",VDI}	2023-12-10	2024-10-20	10	280000	170000	110000	15960	Livré	0	-2.10	70	5	3		2026-04-04 10:00:00+01	Télétravail facilité.	en_cours	f	2026-04-12 23:22:24.53115+01
114	51	Projet Celonis - Process mining pour BIAT	Analyse des processus achats et finance avec Celonis.	BIAT	Process mining	{"Process mining"}	2025-01-15	2025-10-10	8	620000	390000	230000	86180	Livré	0	1.70	87	6	4		2026-04-04 10:00:00+01	Goulots identifiés.	en_cours	f	2026-04-12 23:22:24.53115+01
115	50	Projet Broadcom - Infrastructure pour ATB	Logiciels de gestion mainframe et virtualisation.	ATB	Infrastructure software semiconductors	{"Infrastructure software",Semiconductors}	2024-05-15	2025-04-20	11	900000	580000	320000	150300	Livré	0	2.20	89	7	5		2026-04-04 10:00:00+01	Stabilité accrue.	en_cours	f	2026-04-12 23:22:24.53115+01
116	49	Projet Box - Content management pour CNAM	Gestion de contenu cloud sécurisée.	CNAM	Content management collaboration	{"Content management",Collaboration}	2025-03-01	2025-11-15	8	250000	150000	100000	18875	Livré	0	1.10	83	4	2		2026-04-04 10:00:00+01	Collaboration facilitée.	en_cours	f	2026-04-12 23:22:24.53115+01
117	48	Projet Boomi - iPaaS pour SMART Tunisie	Intégration des applications SaaS et on-prem.	SMART Tunisie	iPaaS integration	{iPaaS,Integration}	2024-09-01	2025-07-31	10	360000	220000	140000	27360	Livré	0	1.50	85	5	3		2026-04-04 10:00:00+01	Connectivité universelle.	en_cours	f	2026-04-12 23:22:24.53115+01
118	47	Projet BMC - ITSM pour STEG	Gestion des incidents et des services IT.	STEG	ITSM IT operations	{ITSM,"IT operations"}	2023-11-01	2024-09-30	10	260000	160000	100000	19344	Livré	0	-1.80	72	5	3		2026-04-04 10:00:00+01	Projet avec quelques retards.	en_cours	f	2026-04-12 23:22:24.53115+01
119	46	Projet Blue Yonder - Supply chain pour Poulina Group	Planification de la demande et exécution.	Poulina Group	Supply chain retail	{"Supply chain",Retail}	2024-08-15	2025-07-10	10	700000	450000	250000	95550	Livré	0	1.90	87	6	4		2026-04-04 10:00:00+01	Prévisions améliorées.	en_cours	f	2026-04-12 23:22:24.53115+01
120	45	Projet Blue Prism - RPA pour Banque de Tunisie	Automatisation des tâches back-office.	Banque de Tunisie	RPA automation	{RPA,Automation}	2024-06-01	2025-03-31	9	240000	140000	100000	14400	Livré	0	1.20	78	4	2		2026-04-04 10:00:00+01	Gains de productivité.	en_cours	f	2026-04-12 23:22:24.53115+01
121	44	Projet BlackLine - Finance automation pour Attijari Bank	Clôture comptable et rapprochements automatisés.	Attijari Bank	Finance automation accounting	{"Finance automation",Accounting}	2025-02-15	2025-11-20	9	300000	180000	120000	22290	Livré	0	1.40	85	4	2		2026-04-04 10:00:00+01	Clôture accélérée.	en_cours	f	2026-04-12 23:22:24.53115+01
122	43	Projet Backbase - Digital banking pour Amen Bank	Portail client omnicanal avec Backbase.	Amen Bank	Digital banking CX	{"Digital banking",CX}	2024-10-01	2025-09-15	11	780000	500000	280000	87048	Livré	0	2.00	88	7	5		2026-04-04 10:00:00+01	Expérience client améliorée.	en_cours	f	2026-04-12 23:22:24.53115+01
123	42	Projet Axway - Integration pour Ooredoo	MFT et API management pour les échanges B2B.	Ooredoo Tunisie	Integration API MFT	{Integration,API,MFT}	2025-01-10	2025-10-01	8	420000	260000	160000	31500	Livré	0	1.30	84	5	3		2026-04-04 10:00:00+01	Fiabilité des échanges.	en_cours	f	2026-04-12 23:22:24.53115+01
124	41	Projet Avaloq - Core banking pour ATB	Wealth management et core banking.	ATB	Banking software core banking	{"Banking software","Core banking"}	2024-07-01	2025-06-15	11	720000	460000	260000	79200	Livré	0	1.80	87	6	4		2026-04-04 10:00:00+01	Gestion de patrimoine optimisée.	en_cours	f	2026-04-12 23:22:24.53115+01
126	39	Projet Atos - Managed services pour STEG	Infogérance du datacenter et services cloud.	STEG	IT services managed services	{"IT services","Managed services"}	2023-12-01	2024-11-30	11	340000	200000	140000	29342	Livré	0	-1.20	74	5	3		2026-04-04 10:00:00+01	Projet avec quelques difficultés.	en_cours	f	2026-04-12 23:22:24.53115+01
127	38	Projet Aprimo - Marketing pour SMART Tunisie	Gestion des campagnes et actifs digitaux.	SMART Tunisie	Marketing operations DAM	{"Marketing operations",DAM}	2025-03-10	2025-12-15	9	180000	100000	80000	10818	Livré	0	0.90	80	3	2		2026-04-04 10:00:00+01	Efficacité marketing accrue.	en_cours	f	2026-04-12 23:22:24.53115+01
128	37	Projet Apple - Hardware pour BIAT	Équipement des cadres avec MacBook et iPad.	BIAT	Hardware ecosystem	{Hardware,Ecosystem}	2024-10-15	2025-07-20	9	780000	500000	280000	85644	Livré	0	1.50	88	5	3		2026-04-04 10:00:00+01	Adoption par les utilisateurs.	en_cours	f	2026-04-12 23:22:24.53115+01
129	36	Projet Appian - Low-code pour CNAM	Développement d'applications de gestion des cas.	CNAM	Low-code BPM	{Low-code,BPM}	2025-01-20	2025-11-05	9	350000	210000	140000	27650	Livré	0	1.70	85	5	3		2026-04-04 10:00:00+01	Rapidité de développement.	en_cours	f	2026-04-12 23:22:24.53115+01
130	34	Projet Anaplan - Planning pour Poulina Group	Planification financière et commerciale connectée.	Poulina Group	Enterprise planning CPM	{"Enterprise planning",CPM}	2024-09-01	2025-07-31	10	620000	390000	230000	87606	Livré	0	1.80	87	6	4		2026-04-04 10:00:00+01	Prévisions plus précises.	en_cours	f	2026-04-12 23:22:24.53115+01
131	33	Projet AWS - Cloud pour Groupe Chimique	Migration complète vers AWS avec EKS, RDS, S3.	Groupe Chimique Tunisien	Cloud IaaS-PaaS	{Cloud,IaaS-PaaS}	2024-01-15	2025-03-20	14	1200000	750000	450000	178800	Livré	0	2.90	91	10	7		2026-04-04 10:00:00+01	Transformation cloud réussie.	en_cours	f	2026-04-12 23:22:24.53115+01
136	16	Azure Cloud Migration - BIAT	Migration complète de l'infrastructure on-premise vers Azure	BIAT	Migration Cloud	{Azure,Terraform,Docker,Kubernetes}	2025-06-01	2026-03-31	10	500000	120000	380000	45000	a_temps	\N	\N	92	8	3	\N	2026-04-12 23:32:49.308396+01	Projet stratégique pour le marché bancaire tunisien	en_cours	t	2026-04-12 23:32:49.308396+01
\.


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE SET; Schema: drizzle; Owner: -
--

SELECT pg_catalog.setval('drizzle.__drizzle_migrations_id_seq', 5, true);


--
-- Name: capgemini_employees_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.capgemini_employees_id_seq', 7, true);


--
-- Name: offers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.offers_id_seq', 32, true);


--
-- Name: partner_contacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_contacts_id_seq', 32, true);


--
-- Name: partner_documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_documents_id_seq', 1, true);


--
-- Name: partner_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_events_id_seq', 40, true);


--
-- Name: partner_meetings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_meetings_id_seq', 8, true);


--
-- Name: partner_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_notifications_id_seq', 18, true);


--
-- Name: partner_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_status_history_id_seq', 521, true);


--
-- Name: partners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partners_id_seq', 183, true);


--
-- Name: partnership_requests_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partnership_requests_id_seq', 12, true);


--
-- Name: student_recruitments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.student_recruitments_id_seq', 157, true);


--
-- Name: vendor_projects_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.vendor_projects_id_seq', 136, true);


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);


--
-- Name: capgemini_employees capgemini_employees_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capgemini_employees
    ADD CONSTRAINT capgemini_employees_email_key UNIQUE (email);


--
-- Name: capgemini_employees capgemini_employees_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.capgemini_employees
    ADD CONSTRAINT capgemini_employees_pkey PRIMARY KEY (id);


--
-- Name: offers offers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_pkey PRIMARY KEY (id);


--
-- Name: partner_contacts partner_contacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_contacts
    ADD CONSTRAINT partner_contacts_pkey PRIMARY KEY (id);


--
-- Name: partner_documents partner_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_documents
    ADD CONSTRAINT partner_documents_pkey PRIMARY KEY (id);


--
-- Name: partner_events partner_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_events
    ADD CONSTRAINT partner_events_pkey PRIMARY KEY (id);


--
-- Name: partner_meetings partner_meetings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_meetings
    ADD CONSTRAINT partner_meetings_pkey PRIMARY KEY (id);


--
-- Name: partner_notifications partner_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_notifications
    ADD CONSTRAINT partner_notifications_pkey PRIMARY KEY (id);


--
-- Name: partner_status_history partner_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_status_history
    ADD CONSTRAINT partner_status_history_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: partnership_requests partnership_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partnership_requests
    ADD CONSTRAINT partnership_requests_pkey PRIMARY KEY (id);


--
-- Name: student_recruitments student_recruitments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_recruitments
    ADD CONSTRAINT student_recruitments_pkey PRIMARY KEY (id);


--
-- Name: technology_partners technology_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technology_partners
    ADD CONSTRAINT technology_partners_pkey PRIMARY KEY (partner_id);


--
-- Name: university_partners university_partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_partners
    ADD CONSTRAINT university_partners_pkey PRIMARY KEY (partner_id);


--
-- Name: vendor_projects vendor_projects_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_projects
    ADD CONSTRAINT vendor_projects_pkey PRIMARY KEY (id);


--
-- Name: idx_offers_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_dates ON public.offers USING btree (start_date, end_date);


--
-- Name: idx_offers_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_offers_partner ON public.offers USING btree (partner_id);


--
-- Name: idx_partner_contacts_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_contacts_partner ON public.partner_contacts USING btree (partner_id);


--
-- Name: idx_partner_documents_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_documents_partner ON public.partner_documents USING btree (partner_id);


--
-- Name: idx_partner_documents_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_documents_type ON public.partner_documents USING btree (file_type);


--
-- Name: idx_partner_events_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_events_date ON public.partner_events USING btree (event_date);


--
-- Name: idx_partner_events_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_events_partner ON public.partner_events USING btree (partner_id);


--
-- Name: idx_partner_meetings_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_meetings_date ON public.partner_meetings USING btree (meeting_date);


--
-- Name: idx_partner_meetings_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_meetings_partner ON public.partner_meetings USING btree (partner_id);


--
-- Name: idx_partner_notifications_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_notifications_partner ON public.partner_notifications USING btree (partner_id);


--
-- Name: idx_partner_notifications_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_notifications_read ON public.partner_notifications USING btree (is_read);


--
-- Name: idx_partner_notifications_type; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_notifications_type ON public.partner_notifications USING btree (type);


--
-- Name: idx_partner_status_history_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_status_history_date ON public.partner_status_history USING btree (changed_at);


--
-- Name: idx_partner_status_history_partner; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partner_status_history_partner ON public.partner_status_history USING btree (partner_id);


--
-- Name: idx_partners_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_partners_status ON public.partners USING btree (partnership_status);


--
-- Name: idx_student_recruitments_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_recruitments_dates ON public.student_recruitments USING btree (start_date, end_date);


--
-- Name: idx_student_recruitments_university; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_student_recruitments_university ON public.student_recruitments USING btree (university_partner_id);


--
-- Name: idx_vendor_projects_dates; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_projects_dates ON public.vendor_projects USING btree (start_date, end_date);


--
-- Name: idx_vendor_projects_technology; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_vendor_projects_technology ON public.vendor_projects USING btree (technology_partner_id);


--
-- Name: offers update_offers_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partner_contacts update_partner_contacts_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partner_contacts_updated_at BEFORE UPDATE ON public.partner_contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: partners update_partners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: student_recruitments update_student_recruitments_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_student_recruitments_updated_at BEFORE UPDATE ON public.student_recruitments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: technology_partners update_technology_partners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_technology_partners_updated_at BEFORE UPDATE ON public.technology_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: university_partners update_university_partners_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_university_partners_updated_at BEFORE UPDATE ON public.university_partners FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: vendor_projects update_vendor_projects_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_vendor_projects_updated_at BEFORE UPDATE ON public.vendor_projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: offers offers_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.offers
    ADD CONSTRAINT offers_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_contacts partner_contacts_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_contacts
    ADD CONSTRAINT partner_contacts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_documents partner_documents_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_documents
    ADD CONSTRAINT partner_documents_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_events partner_events_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_events
    ADD CONSTRAINT partner_events_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_meetings partner_meetings_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_meetings
    ADD CONSTRAINT partner_meetings_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_notifications partner_notifications_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_notifications
    ADD CONSTRAINT partner_notifications_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: partner_status_history partner_status_history_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_status_history
    ADD CONSTRAINT partner_status_history_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: student_recruitments student_recruitments_university_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.student_recruitments
    ADD CONSTRAINT student_recruitments_university_partner_id_fkey FOREIGN KEY (university_partner_id) REFERENCES public.university_partners(partner_id) ON DELETE CASCADE;


--
-- Name: technology_partners technology_partners_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.technology_partners
    ADD CONSTRAINT technology_partners_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: university_partners university_partners_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.university_partners
    ADD CONSTRAINT university_partners_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON DELETE CASCADE;


--
-- Name: vendor_projects vendor_projects_technology_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.vendor_projects
    ADD CONSTRAINT vendor_projects_technology_partner_id_fkey FOREIGN KEY (technology_partner_id) REFERENCES public.technology_partners(partner_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict yqhGH2hmR3gdCzBKnygHnF2eFai57QUCjbMMtCCJYIkI9zTeiiUHgf67ZsMInEQ

