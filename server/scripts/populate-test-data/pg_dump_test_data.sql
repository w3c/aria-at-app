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

CREATE OR REPLACE FUNCTION get_test_plan_version_id(testPlanVersionTitle text, testFormatNumber text) RETURNS integer
LANGUAGE plpgsql
AS $$
  DECLARE test_plan_version_id integer;
BEGIN
  SELECT id INTO test_plan_version_id
  FROM "TestPlanVersion"
  WHERE "TestPlanVersion".title = testPlanVersionTitle
    AND "TestPlanVersion".metadata->>'testFormatVersion' = testFormatNumber
  ORDER BY id
  LIMIT 1;
  RETURN test_plan_version_id;
END;
$$;

--
-- Data for Name: AtVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (2, '2019.3', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (2, '2020.1', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (2, '2020.2', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (2, '2020.3', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (2, '2020.4', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (1, '2021.2103.174', '2022-05-02');
-- INSERT INTO "AtVersion" ("atId", "name", "releasedAt") VALUES (3, '11.5.2', '2022-05-02');


--
-- Data for Name: BrowserVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (1, '86.0');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (1, '86.0.1');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (1, '87.0');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (1, '88.0');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (1, '88.0.1');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (2, '90.0.4430');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (2, '91.0.4472');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (3, '13.0');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (3, '13.1');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (3, '14.0');
-- INSERT INTO "BrowserVersion" ("browserId", "name") VALUES (3, '14.1');

--
-- Data for Name: TestPlanReport; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId") VALUES (1, get_test_plan_version_id(text 'Toggle Button', '1'), '2021-05-14 14:18:23.602-05', 1, 1, 2);
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId") VALUES (2, get_test_plan_version_id(text 'Select Only Combobox Example', '1'), '2021-05-14 14:18:23.602-05', 2, 2, 1);
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (3, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', '2022-07-06', 1, 1, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (4, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', '2022-07-06', 2, 2, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (5, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', '2022-07-06', 3, 3, 3, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (6, get_test_plan_version_id(text 'Checkbox Example (Mixed-State)', '1'), '2021-05-14 14:18:23.602-05', '2022-07-06', 3, 3, 3, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId") VALUES (7, get_test_plan_version_id(text 'Alert Example', '1'), '2021-05-14 14:18:23.602-05', 3, 3, 1);
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (8, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', 1, 1, 1, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (9, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', 2, 2, 1, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (10, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', 3, 3, 1, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (11, get_test_plan_version_id(text 'Modal Dialog Example', '1'), '2021-05-14 14:18:23.602-05', 3, 3, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "exactAtVersionId", "browserId", "vendorReviewStatus") VALUES (12, get_test_plan_version_id(text 'Checkbox Example (Mixed-State)', '1'), '2021-05-14 14:18:23.602-05', '2022-07-06', 1, 1, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "exactAtVersionId", "browserId", "vendorReviewStatus") VALUES (13, get_test_plan_version_id(text 'Checkbox Example (Mixed-State)', '1'), '2021-05-14 14:18:23.602-05', '2022-07-07', 2, 2, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (14, get_test_plan_version_id(text 'Toggle Button', '1'), '2021-05-14 14:18:23.602-05', '2022-07-07', 2, 2, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (15, get_test_plan_version_id(text 'Toggle Button', '1'), '2021-05-14 14:18:23.602-05', '2022-07-07', 3, 3, 3, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (16, get_test_plan_version_id(text 'Command Button Example', '2'), '2023-12-13 14:18:23.602-05', '2023-12-14', 1, 1, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (17, get_test_plan_version_id(text 'Command Button Example', '2'), '2023-12-13 14:18:23.602-05', '2023-12-14', 2, 2, 2, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "markedFinalAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (18, get_test_plan_version_id(text 'Command Button Example', '2'), '2023-12-13 14:18:23.602-05', '2023-12-14', 3, 3, 3, 'READY');
INSERT INTO "TestPlanReport" (id, "testPlanVersionId", "createdAt", "atId", "minimumAtVersionId", "browserId", "vendorReviewStatus") VALUES (19, get_test_plan_version_id(text 'Modal Dialog Example', '2'), '2024-05-14 14:18:23.602-05', 2, 2, 2, 'READY');

--
-- Data for Name: TestPlanVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

UPDATE "TestPlanVersion" SET "phase" = 'DRAFT', "draftPhaseReachedAt" = '2022-07-06' WHERE id = get_test_plan_version_id(text 'Toggle Button', '1');
UPDATE "TestPlanVersion" SET "phase" = 'DRAFT', "draftPhaseReachedAt" = '2022-07-06' WHERE id = get_test_plan_version_id(text 'Select Only Combobox Example', '1');
UPDATE "TestPlanVersion" SET "phase" = 'CANDIDATE', "draftPhaseReachedAt" = '2022-07-06', "candidatePhaseReachedAt" = '2022-07-06', "recommendedPhaseTargetDate" = '2023-01-02' WHERE id = get_test_plan_version_id(text 'Modal Dialog Example', '1');
UPDATE "TestPlanVersion" SET "phase" = 'RECOMMENDED', "candidatePhaseReachedAt" = '2022-07-06', "recommendedPhaseTargetDate" = '2023-01-02', "recommendedPhaseReachedAt" = '2023-01-03' WHERE id = get_test_plan_version_id(text 'Checkbox Example (Mixed-State)', '1');
UPDATE "TestPlanVersion" SET "phase" = 'DRAFT', "draftPhaseReachedAt" = '2022-07-06' WHERE id = get_test_plan_version_id(text 'Alert Example', '1');
UPDATE "TestPlanVersion" SET "phase" = 'DRAFT', "draftPhaseReachedAt" = '2023-12-14' WHERE id = get_test_plan_version_id(text 'Command Button Example', '2');
UPDATE "TestPlanVersion" SET "phase" = 'DRAFT', "draftPhaseReachedAt" = '2024-05-14' WHERE id = get_test_plan_version_id(text 'Modal Dialog Example', '2');

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

INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (1, 1, 1, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (2, 1, 2, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (3, 2, 2, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (4, 1, 3, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (5, 1, 4, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (6, 1, 5, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (7, 2, 6, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (8, 1, 8, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (9, 1, 9, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (10, 1, 10, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (11, 1, 11, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (12, 1, 12, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (13, 1, 13, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (14, 1, 14, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (15, 1, 15, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (16, 1, 16, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (17, 1, 17, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (18, 1, 18, '[]');
INSERT INTO "TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (19, 1, 19, '[]');

--
-- Data for Name: CollectionJob; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO "CollectionJob" (id, status, "testPlanRunId") VALUES (1, 'QUEUED', 1);

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

