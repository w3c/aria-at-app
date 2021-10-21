--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

CREATE OR REPLACE FUNCTION get_test_plan_version_id(testPlanVersionTitle text) RETURNS integer
LANGUAGE plpgsql
AS $$
  DECLARE test_plan_version_id integer;
BEGIN
  SELECT id INTO test_plan_version_id
  FROM "TestPlanVersion"
  WHERE "TestPlanVersion".title = testPlanVersionTitle;
  RETURN test_plan_version_id;
END;
$$;


--
-- Data for Name: AtMode; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."AtMode" ("atId", name) VALUES (1, 'READING');
INSERT INTO public."AtMode" ("atId", name) VALUES (1, 'INTERACTION');
INSERT INTO public."AtMode" ("atId", name) VALUES (2, 'READING');
INSERT INTO public."AtMode" ("atId", name) VALUES (2, 'INTERACTION');
INSERT INTO public."AtMode" ("atId", name) VALUES (3, 'INTERACTION');

--
-- Data for Name: AtVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (2, '2019.3');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (2, '2020.1');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (2, '2020.2');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (2, '2020.3');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (2, '2020.4');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (1, '2021.2103.174');
INSERT INTO "AtVersion" ("atId", "atVersion") VALUES (3, '11.5.2');


--
-- Data for Name: BrowserVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (1, '86.0');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (1, '86.0.1');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (1, '87.0');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (1, '88.0');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (1, '88.0.1');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (2, '90.0.4430');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (2, '91.0.4472');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (3, '13.0');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (3, '13.1');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (3, '14.0');
INSERT INTO "BrowserVersion" ("browserId", "browserVersion") VALUES (3, '14.1');


--
-- Data for Name: TestPlanTarget; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (1, 'JAWS 2021.2103.174 with Chrome 91.0.4472', 1, 2, '2021.2103.174', '91.0.4472');
INSERT INTO "TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (2, 'NVDA 2020.4 with Firefox 88.0.1', 2, 1, '2020.4', '88.0.1');
INSERT INTO "TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (3, 'VoiceOver for macOS 11.5.2 with Safari 14.1', 3, 3, '11.5.2', '14.1');


--
-- Data for Name: TestPlanReport; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (1, 'DRAFT', 1, get_test_plan_version_id(text 'Toggle Button'), '2021-05-14 14:18:23.602-05');
INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (2, 'DRAFT', 2, get_test_plan_version_id(text 'Select Only Combobox Example'), '2021-05-14 14:18:23.602-05');
INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (3, 'FINALIZED', 1, get_test_plan_version_id(text 'Modal Dialog Example'), '2021-05-14 14:18:23.602-05');
INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (4, 'FINALIZED', 2, get_test_plan_version_id(text 'Modal Dialog Example'), '2021-05-14 14:18:23.602-05');
INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (5, 'FINALIZED', 3, get_test_plan_version_id(text 'Modal Dialog Example'), '2021-05-14 14:18:23.602-05');
INSERT INTO "TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (6, 'FINALIZED', 3, get_test_plan_version_id(text 'Checkbox Example (Tri State)'), '2021-05-14 14:18:23.602-05');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "User" (id, username, "createdAt", "updatedAt") VALUES (1, 'esmeralda-baggins', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');
INSERT INTO "User" (id, username, "createdAt", "updatedAt") VALUES (2, 'tom-proudfeet', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');
INSERT INTO "UserAts" ("userId", "atId") VALUES (1, 1);
INSERT INTO "UserAts" ("userId", "atId") VALUES (1, 2);
INSERT INTO "UserAts" ("userId", "atId") VALUES (2, 3);
INSERT INTO "UserRoles" ("userId", "roleName") VALUES (1, 'ADMIN');
INSERT INTO "UserRoles" ("userId", "roleName") VALUES (1, 'TESTER');
INSERT INTO "UserRoles" ("userId", "roleName") VALUES (2, 'TESTER');


--
-- Data for Name: TestPlanRun; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (1, 1, 1, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (2, 1, 2, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (3, 2, 2, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (4, 1, 3, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (5, 1, 4, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (6, 1, 5, '{}');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (7, 2, 6, '{}');

--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"At_id_seq"', 100, true);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"Browser_id_seq"', 100, true);


--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"At_id_seq"', 100, true);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"Browser_id_seq"', 100, true);


--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"TestPlanReport_id_seq"', 100, true);


--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"TestPlanRun_id_seq"', 100, true);


--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"TestPlanTarget_id_seq"', 100, true);


--
-- Name: TestPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"TestPlan_id_seq"', 100, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('"User_id_seq"', 100, true);


--
-- PostgreSQL database dump complete
--

