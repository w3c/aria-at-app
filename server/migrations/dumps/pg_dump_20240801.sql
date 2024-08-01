--
-- PostgreSQL database dump
--

-- Dumped from database version 14.12 (Homebrew) but modified manually to support Postgres 11 and the flattening of the
-- tables' structures from previous migrations

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

-- Creates issues with the SequelizeMeta table
-- SELECT pg_catalog.set_config('search_path', '', false);

SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

-- Prevents import into Postgres 11 database
-- SET default_table_access_method = heap;

create or replace function add_constraint_if_not_exists(
    constraint_name TEXT,
    table_name TEXT,
    constraint_definition TEXT
) returns void
language plpgsql
as $$
begin
    if not exists ( select 1 from pg_constraint where conname = constraint_name ) then
        execute format('ALTER TABLE ONLY public.%I ADD CONSTRAINT %I %s', table_name, constraint_name, constraint_definition);
    end if;
end;
$$;

--
-- Name: At; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."At" (
                             id integer NOT NULL,
                             name text NOT NULL,
                             key text
);


ALTER TABLE public."At" OWNER TO atr;

--
-- Name: AtBrowsers; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."AtBrowsers" (
                                     "atId" integer NOT NULL,
                                     "browserId" integer NOT NULL,
                                     "isCandidate" boolean NOT NULL,
                                     "isRecommended" boolean NOT NULL
);


ALTER TABLE public."AtBrowsers" OWNER TO atr;

--
-- Name: AtVersion; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."AtVersion" (
                                    "atId" integer NOT NULL,
                                    name text NOT NULL,
                                    id integer NOT NULL,
                                    "releasedAt" timestamp with time zone DEFAULT (now() at time zone 'utc') NOT NULL
);


ALTER TABLE public."AtVersion" OWNER TO atr;

--
-- Name: AtVersion_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."AtVersion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."AtVersion_id_seq" OWNER TO atr;

--
-- Name: AtVersion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."AtVersion_id_seq" OWNED BY public."AtVersion".id;


--
-- Name: At_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."At_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."At_id_seq" OWNER TO atr;

--
-- Name: At_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."At_id_seq" OWNED BY public."At".id;


--
-- Name: Browser; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."Browser" (
                                  id integer NOT NULL,
                                  name text NOT NULL,
                                  key text
);


ALTER TABLE public."Browser" OWNER TO atr;

--
-- Name: BrowserVersion; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."BrowserVersion" (
                                         "browserId" integer NOT NULL,
                                         name text NOT NULL,
                                         id integer NOT NULL,
                                         "releasedAt" timestamp with time zone
);


ALTER TABLE public."BrowserVersion" OWNER TO atr;

--
-- Name: BrowserVersion_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."BrowserVersion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."BrowserVersion_id_seq" OWNER TO atr;

--
-- Name: BrowserVersion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."BrowserVersion_id_seq" OWNED BY public."BrowserVersion".id;


--
-- Name: Browser_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."Browser_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Browser_id_seq" OWNER TO atr;

--
-- Name: Browser_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."Browser_id_seq" OWNED BY public."Browser".id;


--
-- Name: CollectionJob; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."CollectionJob" (
                                        id integer NOT NULL,
                                        status character varying(255) DEFAULT 'QUEUED'::character varying NOT NULL,
                                        "externalLogsUrl" character varying(255) DEFAULT NULL::character varying,
                                        "testPlanRunId" integer,
                                        secret uuid DEFAULT '00000000-0000-0000-0000-000000000000'::uuid NOT NULL
);


ALTER TABLE public."CollectionJob" OWNER TO atr;

--
-- Name: CollectionJobTestStatus; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."CollectionJobTestStatus" (
                                                  id integer NOT NULL,
                                                  "testId" character varying(255) NOT NULL,
                                                  "collectionJobId" integer NOT NULL,
                                                  status character varying(255) DEFAULT 'QUEUED'::character varying NOT NULL
);


ALTER TABLE public."CollectionJobTestStatus" OWNER TO atr;

--
-- Name: CollectionJobTestStatus_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."CollectionJobTestStatus_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."CollectionJobTestStatus_id_seq" OWNER TO atr;

--
-- Name: CollectionJobTestStatus_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."CollectionJobTestStatus_id_seq" OWNED BY public."CollectionJobTestStatus".id;


--
-- Name: Role; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."Role" (
                               name text NOT NULL
);


ALTER TABLE public."Role" OWNER TO atr;

--
-- Name: TestPlan; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."TestPlan" (
                                   id integer NOT NULL,
                                   title text,
                                   directory text
);


ALTER TABLE public."TestPlan" OWNER TO atr;

--
-- Name: TestPlanReport; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."TestPlanReport" (
                                         id integer NOT NULL,
                                         "testPlanVersionId" integer,
                                         "createdAt" timestamp with time zone,
                                         "atId" integer,
                                         "browserId" integer,
                                         "markedFinalAt" timestamp with time zone,
                                         "vendorReviewStatus" text,
                                         metrics jsonb DEFAULT '{}'::jsonb NOT NULL,
                                         "testPlanId" integer,
                                         "exactAtVersionId" integer,
                                         "minimumAtVersionId" integer
);


ALTER TABLE public."TestPlanReport" OWNER TO atr;

--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."TestPlanReport_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TestPlanReport_id_seq" OWNER TO atr;

--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."TestPlanReport_id_seq" OWNED BY public."TestPlanReport".id;


--
-- Name: TestPlanRun; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."TestPlanRun" (
                                      id integer NOT NULL,
                                      "testerUserId" integer,
                                      "testPlanReportId" integer,
                                      "testResults" jsonb DEFAULT '[]'::jsonb,
                                      "initiatedByAutomation" boolean DEFAULT false NOT NULL,
                                      "isPrimary" boolean DEFAULT false
);


ALTER TABLE public."TestPlanRun" OWNER TO atr;

--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."TestPlanRun_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TestPlanRun_id_seq" OWNER TO atr;

--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."TestPlanRun_id_seq" OWNED BY public."TestPlanRun".id;


--
-- Name: TestPlanVersion; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."TestPlanVersion" (
                                          id integer NOT NULL,
                                          title text,
                                          "gitSha" text,
                                          "gitMessage" text,
                                          "testPageUrl" text,
                                          "updatedAt" timestamp with time zone,
                                          tests jsonb DEFAULT '[]'::jsonb,
                                          metadata jsonb,
                                          directory text,
                                          "testPlanId" integer,
                                          "hashedTests" text NOT NULL,
                                          phase text DEFAULT 'RD'::text NOT NULL,
                                          "draftPhaseReachedAt" timestamp with time zone,
                                          "candidatePhaseReachedAt" timestamp with time zone,
                                          "recommendedPhaseReachedAt" timestamp with time zone,
                                          "recommendedPhaseTargetDate" timestamp with time zone,
                                          "deprecatedAt" timestamp with time zone,
                                          "versionString" text NOT NULL
);


ALTER TABLE public."TestPlanVersion" OWNER TO atr;

--
-- Name: TestPlan_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."TestPlan_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TestPlan_id_seq" OWNER TO atr;

--
-- Name: TestPlan_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."TestPlan_id_seq" OWNED BY public."TestPlanVersion".id;


--
-- Name: TestPlan_id_seq1; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."TestPlan_id_seq1"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TestPlan_id_seq1" OWNER TO atr;

--
-- Name: TestPlan_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."TestPlan_id_seq1" OWNED BY public."TestPlan".id;


--
-- Name: User; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."User" (
                               id integer NOT NULL,
                               username text NOT NULL,
                               "createdAt" timestamp with time zone,
                               "updatedAt" timestamp with time zone,
                               "isBot" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO atr;

--
-- Name: UserAts; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."UserAts" (
                                  "userId" integer,
                                  "atId" integer
);


ALTER TABLE public."UserAts" OWNER TO atr;

--
-- Name: UserRoles; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."UserRoles" (
                                    "userId" integer NOT NULL,
                                    "roleName" text NOT NULL
);


ALTER TABLE public."UserRoles" OWNER TO atr;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public."User_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."User_id_seq" OWNER TO atr;

--
-- Name: User_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."User_id_seq" OWNED BY public."User".id;


--
-- Name: collectionjob_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE IF NOT EXISTS public.collectionjob_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.collectionjob_id_seq OWNER TO atr;

--
-- Name: collectionjob_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public.collectionjob_id_seq OWNED BY public."CollectionJob".id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public.session (
                                sid character varying NOT NULL,
                                sess jsonb NOT NULL,
                                expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO atr;

--
-- Name: At id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."At" ALTER COLUMN id SET DEFAULT nextval('public."At_id_seq"'::regclass);


--
-- Name: AtVersion id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."AtVersion" ALTER COLUMN id SET DEFAULT nextval('public."AtVersion_id_seq"'::regclass);


--
-- Name: Browser id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."Browser" ALTER COLUMN id SET DEFAULT nextval('public."Browser_id_seq"'::regclass);


--
-- Name: BrowserVersion id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."BrowserVersion" ALTER COLUMN id SET DEFAULT nextval('public."BrowserVersion_id_seq"'::regclass);


--
-- Name: CollectionJob id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."CollectionJob" ALTER COLUMN id SET DEFAULT nextval('public.collectionjob_id_seq'::regclass);


--
-- Name: CollectionJobTestStatus id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."CollectionJobTestStatus" ALTER COLUMN id SET DEFAULT nextval('public."CollectionJobTestStatus_id_seq"'::regclass);


--
-- Name: TestPlan id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlan" ALTER COLUMN id SET DEFAULT nextval('public."TestPlan_id_seq1"'::regclass);


--
-- Name: TestPlanReport id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanReport" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanReport_id_seq"'::regclass);


--
-- Name: TestPlanRun id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanRun" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanRun_id_seq"'::regclass);


--
-- Name: TestPlanVersion id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanVersion" ALTER COLUMN id SET DEFAULT nextval('public."TestPlan_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: At; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: AtBrowsers; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: AtVersion; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: Browser; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: BrowserVersion; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: CollectionJob; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: CollectionJobTestStatus; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: TestPlan; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: TestPlanReport; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: TestPlanRun; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: TestPlanVersion; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: UserAts; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: UserRoles; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Name: AtVersion AtVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('AtVersion_pkey', 'AtVersion', 'PRIMARY KEY (id)');


--
-- Name: At At_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('At_pkey', 'At', 'PRIMARY KEY (id)');


--
-- Name: BrowserVersion BrowserVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('BrowserVersion_pkey', 'BrowserVersion', 'PRIMARY KEY (id)');


--
-- Name: Browser Browser_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('Browser_pkey', 'Browser', 'PRIMARY KEY (id)');


--
-- Name: CollectionJobTestStatus CollectionJobTestStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJobTestStatus_pkey', 'CollectionJobTestStatus', 'PRIMARY KEY (id)');


--
-- Name: CollectionJobTestStatus CollectionJob_Test_unique; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJob_Test_unique', 'CollectionJobTestStatus', 'UNIQUE ("collectionJobId", "testId")');


--
-- Name: CollectionJob CollectionJob_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJob_pkey', 'CollectionJob', 'PRIMARY KEY (id)');


--
-- Name: CollectionJob CollectionJob_testPlanRunId_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJob_testPlanRunId_key', 'CollectionJob', 'UNIQUE ("testPlanRunId")');


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('Role_pkey', 'Role', 'PRIMARY KEY (name)');


--
-- Name: TestPlanReport TestPlanReport_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanReport_pkey', 'TestPlanReport', 'PRIMARY KEY (id)');


--
-- Name: TestPlanRun TestPlanRun_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanRun_pkey', 'TestPlanRun', 'PRIMARY KEY (id)');


--
-- Name: TestPlanVersion TestPlanVersion_hashedTests_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanVersion_hashedTests_key', 'TestPlanVersion', 'UNIQUE ("hashedTests")');


--
-- Name: TestPlanVersion TestPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlan_pkey', 'TestPlanVersion', 'PRIMARY KEY (id)');


--
-- Name: TestPlan TestPlan_pkey1; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlan_pkey1', 'TestPlan', 'PRIMARY KEY (id)');


--
-- Name: UserRoles UserRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('UserRoles_pkey', 'UserRoles', 'PRIMARY KEY ("userId", "roleName")');


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('User_pkey', 'User', 'PRIMARY KEY (id)');


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('User_username_key', 'User', 'UNIQUE (username)');


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('session_pkey', 'session', 'PRIMARY KEY (sid)');


--
-- Name: TestPlanVersion uniqueVersionStringByDirectory; Type: CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('uniqueVersionStringByDirectory', 'TestPlanVersion', 'UNIQUE (directory, "versionString")');


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: atr
--

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: AtBrowsers AtBrowsers_atId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('AtBrowsers_atId_fkey', 'AtBrowsers', 'FOREIGN KEY ("atId") REFERENCES public."At"(id)');


--
-- Name: AtBrowsers AtBrowsers_browserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('AtBrowsers_browserId_fkey', 'AtBrowsers', 'FOREIGN KEY ("browserId") REFERENCES public."Browser"(id)');


--
-- Name: AtVersion AtVersion_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('AtVersion_at_fkey', 'AtVersion', 'FOREIGN KEY ("atId") REFERENCES public."At"(id) ON UPDATE CASCADE ON DELETE CASCADE');


--
-- Name: BrowserVersion BrowserVersion_browser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('BrowserVersion_browser_fkey', 'BrowserVersion', 'FOREIGN KEY ("browserId") REFERENCES public."Browser"(id) ON UPDATE CASCADE ON DELETE CASCADE');


--
-- Name: CollectionJobTestStatus CollectionJobTestStatus_collectionJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJobTestStatus_collectionJobId_fkey', 'CollectionJobTestStatus', 'FOREIGN KEY ("collectionJobId") REFERENCES public."CollectionJob"(id) ON UPDATE CASCADE ON DELETE CASCADE');


--
-- Name: CollectionJob CollectionJob_testPlanRunId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('CollectionJob_testPlanRunId_fkey', 'CollectionJob', 'FOREIGN KEY ("testPlanRunId") REFERENCES public."TestPlanRun"(id) ON DELETE SET NULL');


--
-- Name: TestPlanReport TestPlanReport_testPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanReport_testPlanId_fkey', 'TestPlanReport', 'FOREIGN KEY ("testPlanId") REFERENCES public."TestPlan"(id)');


--
-- Name: TestPlanReport TestPlanReport_testPlan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanReport_testPlan_fkey', 'TestPlanReport', 'FOREIGN KEY ("testPlanVersionId") REFERENCES public."TestPlanVersion"(id) ON UPDATE CASCADE');


--
-- Name: TestPlanRun TestPlanRun_testPlanReport_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanRun_testPlanReport_fkey', 'TestPlanRun', 'FOREIGN KEY ("testPlanReportId") REFERENCES public."TestPlanReport"(id) ON UPDATE CASCADE ON DELETE CASCADE');


--
-- Name: TestPlanRun TestPlanRun_tester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanRun_tester_fkey', 'TestPlanRun', 'FOREIGN KEY ("testerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL');


--
-- Name: TestPlanVersion TestPlanVersion_testPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('TestPlanVersion_testPlanId_fkey', 'TestPlanVersion', 'FOREIGN KEY ("testPlanId") REFERENCES public."TestPlan"(id)');


--
-- Name: UserRoles UserRoles_roleName_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('UserRoles_roleName_fkey', 'UserRoles', 'FOREIGN KEY ("roleName") REFERENCES public."Role"(name) ON UPDATE CASCADE ON DELETE CASCADE');


--
-- Name: UserRoles UserRoles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

SELECT add_constraint_if_not_exists('UserRoles_userId_fkey', 'UserRoles', 'FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE');


DROP FUNCTION add_constraint_if_not_exists(TEXT, TEXT, TEXT);

--
-- PostgreSQL database dump complete
--

