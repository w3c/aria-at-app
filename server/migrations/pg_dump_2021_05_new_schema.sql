--
-- PostgreSQL database dump
--

-- Dumped from database version 13.2
-- Dumped by pg_dump version 13.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_roleName_fkey";
ALTER TABLE IF EXISTS ONLY public."TestResult" DROP CONSTRAINT IF EXISTS "TestResult_testPlanRun_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanTarget" DROP CONSTRAINT IF EXISTS "TestPlanTarget_browser_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanTarget" DROP CONSTRAINT IF EXISTS "TestPlanTarget_at_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_tester_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_testPlanReport_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_testPlan_fkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_testPlanTarget_fkey";
ALTER TABLE IF EXISTS ONLY public."BrowserVersion" DROP CONSTRAINT IF EXISTS "BrowserVersion_browser_fkey";
ALTER TABLE IF EXISTS ONLY public."AtVersion" DROP CONSTRAINT IF EXISTS "AtVersion_at_fkey";
ALTER TABLE IF EXISTS ONLY public."AtMode" DROP CONSTRAINT IF EXISTS "AtMode_at_fkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_username_key";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_pkey";
ALTER TABLE IF EXISTS ONLY public."TestPlan" DROP CONSTRAINT IF EXISTS "TestPlan_pkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanTarget" DROP CONSTRAINT IF EXISTS "TestPlanTarget_pkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_pkey";
ALTER TABLE IF EXISTS ONLY public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_pkey";
ALTER TABLE IF EXISTS ONLY public."Role" DROP CONSTRAINT IF EXISTS "Role_pkey";
ALTER TABLE IF EXISTS ONLY public."Browser" DROP CONSTRAINT IF EXISTS "Browser_pkey";
ALTER TABLE IF EXISTS ONLY public."BrowserVersion" DROP CONSTRAINT IF EXISTS "BrowserVersion_pkey";
ALTER TABLE IF EXISTS ONLY public."At" DROP CONSTRAINT IF EXISTS "At_pkey";
ALTER TABLE IF EXISTS ONLY public."AtVersion" DROP CONSTRAINT IF EXISTS "AtVersion_pkey";
ALTER TABLE IF EXISTS ONLY public."AtMode" DROP CONSTRAINT IF EXISTS "AtMode_pkey";
ALTER TABLE IF EXISTS public."User" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TestPlanTarget" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TestPlanRun" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TestPlanReport" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."TestPlan" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."Browser" ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public."At" ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public."User_id_seq";
DROP TABLE IF EXISTS public."UserRoles";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."TestResult";
DROP SEQUENCE IF EXISTS public."TestPlan_id_seq";
DROP SEQUENCE IF EXISTS public."TestPlanTarget_id_seq";
DROP TABLE IF EXISTS public."TestPlanTarget";
DROP SEQUENCE IF EXISTS public."TestPlanRun_id_seq";
DROP TABLE IF EXISTS public."TestPlanRun";
DROP SEQUENCE IF EXISTS public."TestPlanReport_id_seq";
DROP TABLE IF EXISTS public."TestPlanReport";
DROP TABLE IF EXISTS public."TestPlan";
DROP TABLE IF EXISTS public."Role";
DROP SEQUENCE IF EXISTS public."Browser_id_seq";
DROP TABLE IF EXISTS public."BrowserVersion";
DROP TABLE IF EXISTS public."Browser";
DROP SEQUENCE IF EXISTS public."At_id_seq";
DROP TABLE IF EXISTS public."AtVersion";
DROP TABLE IF EXISTS public."AtMode";
DROP TABLE IF EXISTS public."At";
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: At; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."At" (
                             id integer NOT NULL,
                             name text NOT NULL
);


ALTER TABLE public."At" OWNER TO atr;

--
-- Name: AtMode; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."AtMode" (
                                 at integer NOT NULL,
                                 name text NOT NULL
);


ALTER TABLE public."AtMode" OWNER TO atr;

--
-- Name: AtVersion; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."AtVersion" (
                                    at integer NOT NULL,
                                    version text NOT NULL
);


ALTER TABLE public."AtVersion" OWNER TO atr;

--
-- Name: At_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."At_id_seq"
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

CREATE TABLE public."Browser" (
                                  id integer NOT NULL,
                                  name text NOT NULL
);


ALTER TABLE public."Browser" OWNER TO atr;

--
-- Name: BrowserVersion; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."BrowserVersion" (
                                         browser integer NOT NULL,
                                         version text NOT NULL
);


ALTER TABLE public."BrowserVersion" OWNER TO atr;

--
-- Name: Browser_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."Browser_id_seq"
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
-- Name: Role; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."Role" (
    name text NOT NULL
);


ALTER TABLE public."Role" OWNER TO atr;

--
-- Name: TestPlan; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."TestPlan" (
                                   id integer NOT NULL,
                                   title text,
                                   "publishStatus" text,
                                   revision text,
                                   "sourceGitCommit" text,
                                   "exampleUrl" text,
                                   "createdAt" timestamp with time zone,
                                   "parsedTest" jsonb
);


ALTER TABLE public."TestPlan" OWNER TO atr;

--
-- Name: TestPlanReport; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."TestPlanReport" (
                                         id integer NOT NULL,
                                         "publishStatus" text,
                                         "testPlanTarget" integer,
                                         "testPlan" integer,
                                         "createdAt" timestamp with time zone
);


ALTER TABLE public."TestPlanReport" OWNER TO atr;

--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."TestPlanReport_id_seq"
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

CREATE TABLE public."TestPlanRun" (
                                      id integer NOT NULL,
                                      "isManuallyTested" boolean,
                                      tester integer,
                                      "testPlanReport" integer
);


ALTER TABLE public."TestPlanRun" OWNER TO atr;

--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."TestPlanRun_id_seq"
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
-- Name: TestPlanTarget; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."TestPlanTarget" (
                                         id integer NOT NULL,
                                         title text,
                                         at integer,
                                         browser integer,
                                         "atVersion" text,
                                         "browserVersion" text
);


ALTER TABLE public."TestPlanTarget" OWNER TO atr;

--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."TestPlanTarget_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."TestPlanTarget_id_seq" OWNER TO atr;

--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: atr
--

ALTER SEQUENCE public."TestPlanTarget_id_seq" OWNED BY public."TestPlanTarget".id;


--
-- Name: TestPlan_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."TestPlan_id_seq"
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

ALTER SEQUENCE public."TestPlan_id_seq" OWNED BY public."TestPlan".id;


--
-- Name: TestResult; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."TestResult" (
                                     "startedAt" timestamp with time zone DEFAULT now(),
                                     "completedAt" timestamp with time zone DEFAULT now(),
                                     "testPlanRun" integer,
                                     data jsonb
);


ALTER TABLE public."TestResult" OWNER TO atr;

--
-- Name: User; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."User" (
                               id integer NOT NULL,
                               username text NOT NULL
);


ALTER TABLE public."User" OWNER TO atr;

--
-- Name: UserRoles; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."UserRoles" (
                                    "userId" integer NOT NULL,
                                    "roleName" text NOT NULL
);


ALTER TABLE public."UserRoles" OWNER TO atr;

--
-- Name: User_id_seq; Type: SEQUENCE; Schema: public; Owner: atr
--

CREATE SEQUENCE public."User_id_seq"
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
-- Name: At id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."At" ALTER COLUMN id SET DEFAULT nextval('public."At_id_seq"'::regclass);


--
-- Name: Browser id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."Browser" ALTER COLUMN id SET DEFAULT nextval('public."Browser_id_seq"'::regclass);


--
-- Name: TestPlan id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlan" ALTER COLUMN id SET DEFAULT nextval('public."TestPlan_id_seq"'::regclass);


--
-- Name: TestPlanReport id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanReport" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanReport_id_seq"'::regclass);


--
-- Name: TestPlanRun id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanRun" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanRun_id_seq"'::regclass);


--
-- Name: TestPlanTarget id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanTarget_id_seq"'::regclass);


--
-- Name: User id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."User" ALTER COLUMN id SET DEFAULT nextval('public."User_id_seq"'::regclass);


--
-- Data for Name: At; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: AtMode; Type: TABLE DATA; Schema: public; Owner: atr
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
-- Data for Name: TestPlanTarget; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: TestResult; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Data for Name: UserRoles; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."At_id_seq"', 1, false);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."Browser_id_seq"', 1, false);


--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanReport_id_seq"', 1, false);


--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanRun_id_seq"', 1, false);


--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanTarget_id_seq"', 1, false);


--
-- Name: TestPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlan_id_seq"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: AtMode AtMode_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."AtMode"
    ADD CONSTRAINT "AtMode_pkey" PRIMARY KEY (at, name);


--
-- Name: AtVersion AtVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."AtVersion"
    ADD CONSTRAINT "AtVersion_pkey" PRIMARY KEY (at, version);


--
-- Name: At At_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."At"
    ADD CONSTRAINT "At_pkey" PRIMARY KEY (id);


--
-- Name: BrowserVersion BrowserVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."BrowserVersion"
    ADD CONSTRAINT "BrowserVersion_pkey" PRIMARY KEY (browser, version);


--
-- Name: Browser Browser_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."Browser"
    ADD CONSTRAINT "Browser_pkey" PRIMARY KEY (id);


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (name);


--
-- Name: TestPlanReport TestPlanReport_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_pkey" PRIMARY KEY (id);


--
-- Name: TestPlanRun TestPlanRun_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_pkey" PRIMARY KEY (id);


--
-- Name: TestPlanTarget TestPlanTarget_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_pkey" PRIMARY KEY (id);


--
-- Name: TestPlan TestPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlan"
    ADD CONSTRAINT "TestPlan_pkey" PRIMARY KEY (id);


--
-- Name: UserRoles UserRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId", "roleName");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: AtMode AtMode_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."AtMode"
    ADD CONSTRAINT "AtMode_at_fkey" FOREIGN KEY (at) REFERENCES public."At"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: AtVersion AtVersion_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."AtVersion"
    ADD CONSTRAINT "AtVersion_at_fkey" FOREIGN KEY (at) REFERENCES public."At"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BrowserVersion BrowserVersion_browser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."BrowserVersion"
    ADD CONSTRAINT "BrowserVersion_browser_fkey" FOREIGN KEY (browser) REFERENCES public."Browser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestPlanReport TestPlanReport_testPlanTarget_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_testPlanTarget_fkey" FOREIGN KEY ("testPlanTarget") REFERENCES public."TestPlanTarget"(id) ON UPDATE CASCADE;


--
-- Name: TestPlanReport TestPlanReport_testPlan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_testPlan_fkey" FOREIGN KEY ("testPlan") REFERENCES public."TestPlan"(id) ON UPDATE CASCADE;


--
-- Name: TestPlanRun TestPlanRun_testPlanReport_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_testPlanReport_fkey" FOREIGN KEY ("testPlanReport") REFERENCES public."TestPlanReport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestPlanRun TestPlanRun_tester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_tester_fkey" FOREIGN KEY (tester) REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TestPlanTarget TestPlanTarget_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_at_fkey" FOREIGN KEY (at) REFERENCES public."At"(id) ON UPDATE CASCADE;


--
-- Name: TestPlanTarget TestPlanTarget_browser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_browser_fkey" FOREIGN KEY (browser) REFERENCES public."Browser"(id) ON UPDATE CASCADE;


--
-- Name: TestResult TestResult_testPlanRun_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestResult"
    ADD CONSTRAINT "TestResult_testPlanRun_fkey" FOREIGN KEY ("testPlanRun") REFERENCES public."TestPlanRun"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRoles UserRoles_roleName_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES public."Role"(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRoles UserRoles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

