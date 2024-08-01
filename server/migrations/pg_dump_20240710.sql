--
-- PostgreSQL database dump
--

-- Dumped from database version 14.12 (Homebrew)
-- Dumped by pg_dump version 14.12 (Homebrew)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

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
                                    "releasedAt" timestamp with time zone DEFAULT '2024-07-29 11:43:34.459-04'::timestamp with time zone NOT NULL
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
-- Name: SequelizeMeta; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE IF NOT EXISTS public."SequelizeMeta" (
                                        name character varying(255) NOT NULL
);


ALTER TABLE public."SequelizeMeta" OWNER TO atr;

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
-- Data for Name: SequelizeMeta; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."SequelizeMeta" (name) VALUES ('20200518185559-initial-migration.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200521003201-create_table_test_issues.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200522002555-add-serialized-form-column-to-test-results.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200528143617-add-run-status.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200528143624-add-run-status-to-run.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200528172804-add-run-status-to-run-data-view.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200915181019-create-browser-version-to-at-and-at-version.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200915184800-AddActiveFlags.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200915203422-AddColumnsToTestRun.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200928035513-update-create-browser-version-to-at-version.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20200929194042-AddActiveToTestVersions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20201016203157-RemoveTestCycleModel.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20201201232332-add-links-columns-apg-examples.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210512004505-BuildNewDatabaseSchema.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210524210332-TestQueueChanges.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210601152335-supportNewTestQueueMutations.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210601152340-emptyObsoleteTables.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210601152341-removeTestPlanTargetVersionConstraints.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210809220722-UserSettings.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20210920195544-reportingBackend.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20211116172219-commandSequences.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20211118143508-testRowNumber.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220427145338-alterAtVersionTable.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220427192638-changeConstraintsAtVersion.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220427194229-addIdConstraintAtVersion.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220427204420-changeAtVersionColumn.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220503193406-alterBrowserVersionTable.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220509140537-removeTestPlanTarget.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220712044433-changeJsonbArraysToJsonb.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220801210224-updateJawsTestInstructions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220825125643-addStatusChangeUpdateColumns.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220919142951-addVendorReviewStatusColumn.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220928162616-addViewersToTests.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220929155024-addMetricsColumn.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20220929155029-addMetricsValues.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20221116154332-updateTestPlanReportStatuses.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230329214527-removeInReviewStatusFromTestPlanReport.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230424152008-addAtBrowser.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230424152008-createTestPlanTable.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230425152008-createTestPlanColumns.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230425215656-updateTestPlanVersionTitles.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230501220810-deduplicateTestPlanVersions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230523163855-addColumnsToAtBrowsers.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230523163856-remove-OtherUnexpectedBehaviorText.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230608170853-addDateColumnsToTestPlanVersion.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230614004831-removeDateColumnsFromTestPlanReportAndRenameCandidateStatusReachedAtToApprovedAt.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230626203205-updatePhaseAndDraftPhaseReachedAtColumnsForTestPlanVersion.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230719174358-removeTestPlanReportStatus.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230823212533-addCollectionJobs.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230830225248-addMissingDeprecatedAtAndReorderPhaseChangeDates.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230927172432-addVersionStrings.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20230927230957-add-initiatedByAutomation-to-testPlanRun.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20231031162340-verifyNoSkippedTests.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20231114170315-addScreenTextAndInstructionsToAtMode.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20231129175445-updateResultsUnexpectedBehaviorImpactAndDetails.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20231219212344-recalculateV2TestHashes.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240104150500-includeAdditionalTestFormatVersionAttributes.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240111225130-includeMissingAssertionExceptions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240215220201-updateMetricsForCountingUnexpectedBehaviors.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240224173914-includeAssertionIdInTestAssertions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240229195433-modifyCollectionJobIdType.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240305205951-removeAtMode.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240311192910-removeRequiredAndOptionalPriority.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240312122457-testPlanReportAtVersions.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240312131258-browserVersionReleasedAt.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240312145416-updateMetricsForUsingTotalCalculation.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240313145124-addIsPrimaryColumnToTestPlanRun.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240319190618-updateCandidatePhaseReachedDates.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240321182449-addKeyColumnToAtAndBrowserTables.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240325205951-cleanupDuplicatesAndRegenerateHashes.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240401203810-fixCommandButtonPhaseChangeDate.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240404171101-addCollectionJobTestStatus.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240509102300-addIsBot.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240516195950-updateMetrics.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240522032230-fixIncorrectDeprecationDates.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240525041559-addCollectionJobSecret.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240711160607-update-may-terminology.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240715150459-resetTestPlanVersionIdToLatest.js') ON CONFLICT DO NOTHING;
INSERT INTO public."SequelizeMeta" (name) VALUES ('20240724212706-updateMetrics.js') ON CONFLICT DO NOTHING;


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
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: atr
--



--
-- Name: AtVersion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."AtVersion_id_seq"', 1, false);


--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."At_id_seq"', 1, false);


--
-- Name: BrowserVersion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."BrowserVersion_id_seq"', 1, false);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."Browser_id_seq"', 1, false);


--
-- Name: CollectionJobTestStatus_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."CollectionJobTestStatus_id_seq"', 1, false);


--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanReport_id_seq"', 1, false);


--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanRun_id_seq"', 1, false);


--
-- Name: TestPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlan_id_seq"', 1, false);


--
-- Name: TestPlan_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlan_id_seq1"', 1, false);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."User_id_seq"', 1, false);


--
-- Name: collectionjob_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public.collectionjob_id_seq', 1, true);


--
-- Name: AtVersion AtVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."AtVersion" DROP CONSTRAINT IF EXISTS "AtVersion_pkey" CASCADE;
ALTER TABLE ONLY public."AtVersion"
    ADD CONSTRAINT "AtVersion_pkey" PRIMARY KEY (id);


--
-- Name: At At_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."At" DROP CONSTRAINT IF EXISTS "At_pkey" CASCADE;
ALTER TABLE ONLY public."At"
    ADD CONSTRAINT "At_pkey" PRIMARY KEY (id);


--
-- Name: BrowserVersion BrowserVersion_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."BrowserVersion" DROP CONSTRAINT IF EXISTS "BrowserVersion_pkey" CASCADE;
ALTER TABLE ONLY public."BrowserVersion"
    ADD CONSTRAINT "BrowserVersion_pkey" PRIMARY KEY (id);


--
-- Name: Browser Browser_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."Browser" DROP CONSTRAINT IF EXISTS "Browser_pkey" CASCADE;
ALTER TABLE ONLY public."Browser"
    ADD CONSTRAINT "Browser_pkey" PRIMARY KEY (id);


--
-- Name: CollectionJobTestStatus CollectionJobTestStatus_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJobTestStatus" DROP CONSTRAINT IF EXISTS "CollectionJobTestStatus_pkey" CASCADE;
ALTER TABLE ONLY public."CollectionJobTestStatus"
    ADD CONSTRAINT "CollectionJobTestStatus_pkey" PRIMARY KEY (id);


--
-- Name: CollectionJobTestStatus CollectionJob_Test_unique; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJobTestStatus" DROP CONSTRAINT IF EXISTS "CollectionJob_Test_unique" CASCADE;
ALTER TABLE ONLY public."CollectionJobTestStatus"
    ADD CONSTRAINT "CollectionJob_Test_unique" UNIQUE ("collectionJobId", "testId");


--
-- Name: CollectionJob CollectionJob_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJob" DROP CONSTRAINT IF EXISTS "CollectionJob_pkey" CASCADE;
ALTER TABLE ONLY public."CollectionJob"
    ADD CONSTRAINT "CollectionJob_pkey" PRIMARY KEY (id);


--
-- Name: CollectionJob CollectionJob_testPlanRunId_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJob" DROP CONSTRAINT IF EXISTS "CollectionJob_testPlanRunId_key" CASCADE;
ALTER TABLE ONLY public."CollectionJob"
    ADD CONSTRAINT "CollectionJob_testPlanRunId_key" UNIQUE ("testPlanRunId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."Role" DROP CONSTRAINT IF EXISTS "Role_pkey" CASCADE;
ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (name);


--
-- Name: SequelizeMeta SequelizeMeta_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."SequelizeMeta" DROP CONSTRAINT IF EXISTS "SequelizeMeta_pkey" CASCADE;
ALTER TABLE ONLY public."SequelizeMeta"
    ADD CONSTRAINT "SequelizeMeta_pkey" PRIMARY KEY (name);


--
-- Name: TestPlanReport TestPlanReport_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_pkey" CASCADE;
ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_pkey" PRIMARY KEY (id);


--
-- Name: TestPlanRun TestPlanRun_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_pkey" CASCADE;
ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_pkey" PRIMARY KEY (id);


--
-- Name: TestPlanVersion TestPlanVersion_hashedTests_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanVersion" DROP CONSTRAINT IF EXISTS "TestPlanVersion_hashedTests_key" CASCADE;
ALTER TABLE ONLY public."TestPlanVersion"
    ADD CONSTRAINT "TestPlanVersion_hashedTests_key" UNIQUE ("hashedTests");


--
-- Name: TestPlanVersion TestPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanVersion" DROP CONSTRAINT IF EXISTS "TestPlan_pkey" CASCADE;
ALTER TABLE ONLY public."TestPlanVersion"
    ADD CONSTRAINT "TestPlan_pkey" PRIMARY KEY (id);


--
-- Name: TestPlan TestPlan_pkey1; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlan" DROP CONSTRAINT IF EXISTS "TestPlan_pkey1" CASCADE;
ALTER TABLE ONLY public."TestPlan"
    ADD CONSTRAINT "TestPlan_pkey1" PRIMARY KEY (id);


--
-- Name: UserRoles UserRoles_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_pkey" CASCADE;
ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_pkey" PRIMARY KEY ("userId", "roleName");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."User" DROP CONSTRAINT IF EXISTS "User_pkey" CASCADE;
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: User User_username_key; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."User" DROP CONSTRAINT IF EXISTS "User_username_key" CASCADE;
ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_username_key" UNIQUE (username);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public.session DROP CONSTRAINT IF EXISTS session_pkey CASCADE;
ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: TestPlanVersion uniqueVersionStringByDirectory; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanVersion" DROP CONSTRAINT IF EXISTS "uniqueVersionStringByDirectory" CASCADE;
ALTER TABLE ONLY public."TestPlanVersion"
    ADD CONSTRAINT "uniqueVersionStringByDirectory" UNIQUE (directory, "versionString");


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: atr
--

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: AtBrowsers AtBrowsers_atId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."AtBrowsers" DROP CONSTRAINT IF EXISTS "AtBrowsers_atId_fkey" CASCADE;
ALTER TABLE ONLY public."AtBrowsers"
    ADD CONSTRAINT "AtBrowsers_atId_fkey" FOREIGN KEY ("atId") REFERENCES public."At"(id);


--
-- Name: AtBrowsers AtBrowsers_browserId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."AtBrowsers" DROP CONSTRAINT IF EXISTS "AtBrowsers_browserId_fkey" CASCADE;
ALTER TABLE ONLY public."AtBrowsers"
    ADD CONSTRAINT "AtBrowsers_browserId_fkey" FOREIGN KEY ("browserId") REFERENCES public."Browser"(id);


--
-- Name: AtVersion AtVersion_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."AtVersion" DROP CONSTRAINT IF EXISTS "AtVersion_at_fkey" CASCADE;
ALTER TABLE ONLY public."AtVersion"
    ADD CONSTRAINT "AtVersion_at_fkey" FOREIGN KEY ("atId") REFERENCES public."At"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: BrowserVersion BrowserVersion_browser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."BrowserVersion" DROP CONSTRAINT IF EXISTS "BrowserVersion_browser_fkey" CASCADE;
ALTER TABLE ONLY public."BrowserVersion"
    ADD CONSTRAINT "BrowserVersion_browser_fkey" FOREIGN KEY ("browserId") REFERENCES public."Browser"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CollectionJobTestStatus CollectionJobTestStatus_collectionJobId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJobTestStatus" DROP CONSTRAINT IF EXISTS "CollectionJobTestStatus_collectionJobId_fkey" CASCADE;
ALTER TABLE ONLY public."CollectionJobTestStatus"
    ADD CONSTRAINT "CollectionJobTestStatus_collectionJobId_fkey" FOREIGN KEY ("collectionJobId") REFERENCES public."CollectionJob"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: CollectionJob CollectionJob_testPlanRunId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."CollectionJob" DROP CONSTRAINT IF EXISTS "CollectionJob_testPlanRunId_fkey" CASCADE;
ALTER TABLE ONLY public."CollectionJob"
    ADD CONSTRAINT "CollectionJob_testPlanRunId_fkey" FOREIGN KEY ("testPlanRunId") REFERENCES public."TestPlanRun"(id) ON DELETE SET NULL;


--
-- Name: TestPlanReport TestPlanReport_testPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_testPlanId_fkey" CASCADE;
ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_testPlanId_fkey" FOREIGN KEY ("testPlanId") REFERENCES public."TestPlan"(id);


--
-- Name: TestPlanReport TestPlanReport_testPlan_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanReport" DROP CONSTRAINT IF EXISTS "TestPlanReport_testPlan_fkey" CASCADE;
ALTER TABLE ONLY public."TestPlanReport"
    ADD CONSTRAINT "TestPlanReport_testPlan_fkey" FOREIGN KEY ("testPlanVersionId") REFERENCES public."TestPlanVersion"(id) ON UPDATE CASCADE;


--
-- Name: TestPlanRun TestPlanRun_testPlanReport_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_testPlanReport_fkey" CASCADE;
ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_testPlanReport_fkey" FOREIGN KEY ("testPlanReportId") REFERENCES public."TestPlanReport"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TestPlanRun TestPlanRun_tester_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanRun" DROP CONSTRAINT IF EXISTS "TestPlanRun_tester_fkey" CASCADE;
ALTER TABLE ONLY public."TestPlanRun"
    ADD CONSTRAINT "TestPlanRun_tester_fkey" FOREIGN KEY ("testerUserId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: TestPlanVersion TestPlanVersion_testPlanId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."TestPlanVersion" DROP CONSTRAINT IF EXISTS "TestPlanVersion_testPlanId_fkey" CASCADE;
ALTER TABLE ONLY public."TestPlanVersion"
    ADD CONSTRAINT "TestPlanVersion_testPlanId_fkey" FOREIGN KEY ("testPlanId") REFERENCES public."TestPlan"(id);


--
-- Name: UserRoles UserRoles_roleName_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_roleName_fkey" CASCADE;
ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_roleName_fkey" FOREIGN KEY ("roleName") REFERENCES public."Role"(name) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRoles UserRoles_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE public."UserRoles" DROP CONSTRAINT IF EXISTS "UserRoles_userId_fkey" CASCADE;
ALTER TABLE ONLY public."UserRoles"
    ADD CONSTRAINT "UserRoles_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

