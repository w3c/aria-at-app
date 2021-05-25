--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

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


--
-- Data for Name: AtMode; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."AtMode" (at, name) VALUES (2, 'reading');
INSERT INTO public."AtMode" (at, name) VALUES (2, 'interaction');
INSERT INTO public."AtMode" (at, name) VALUES (3, 'modeless');
INSERT INTO public."AtMode" (at, name) VALUES (1, 'reading');
INSERT INTO public."AtMode" (at, name) VALUES (1, 'interaction');


--
-- Data for Name: AtVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."AtVersion" (at, version) VALUES (2, '2019.3');
INSERT INTO public."AtVersion" (at, version) VALUES (2, '2020.1');
INSERT INTO public."AtVersion" (at, version) VALUES (2, '2020.2');
INSERT INTO public."AtVersion" (at, version) VALUES (2, '2020.3');
INSERT INTO public."AtVersion" (at, version) VALUES (2, '2020.4');
INSERT INTO public."AtVersion" (at, version) VALUES (1, '2021.2103.174');
INSERT INTO public."AtVersion" (at, version) VALUES (3, 'MacOS');


--
-- Data for Name: BrowserVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."BrowserVersion" (browser, version) VALUES (1, '86.0');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (1, '86.0.1');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (1, '87.0');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (1, '88.0');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (1, '88.0.1');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (2, '90.0.4430');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (2, '91.0.4472');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (3, '13.0');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (3, '13.1');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (3, '14.0');
INSERT INTO public."BrowserVersion" (browser, version) VALUES (3, '14.1');


--
-- Data for Name: TestPlanTarget; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanTarget" (id, title, at, browser, "atVersion", "browserVersion") VALUES (1, 'NVDA 2020.4 with Chrome 91.0.4472', 2, 2, '2020.4', '91.0.4472');


--
-- Data for Name: TestPlanReport; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanReport" (id, "publishStatus", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (1, 'draft', 1, 1, '2021-05-14 14:18:23.602-05');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."User" (id, username, "createdAt", "updatedAt") VALUES (1, 'foobar-admin', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');
INSERT INTO public."User" (id, username, "createdAt", "updatedAt") VALUES (2, 'foobar-tester', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');


--
-- Data for Name: TestPlanRun; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanRun" (id, "isManuallyTested", tester, "testPlanReport") VALUES (1, true, 1, 1);


--
-- Data for Name: TestResult; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestResult" ("startedAt", "completedAt", "testPlanRun", data) VALUES ('2021-05-14 14:21:51.275-05', NULL, 1, '{"result": {"test": "Navigate to an unchecked checkbox in reading mode", "status": "PASS", "details": {"name": "Navigate to an unchecked checkbox in reading mode", "task": "navigate to unchecked checkbox", "summary": {"1": {"fail": 0, "pass": 12}, "2": {"fail": 0, "pass": 0}, "unexpectedCount": 0}, "commands": [{"output": "Success", "command": "X / Shift+X", "support": "FULL", "assertions": [{"pass": "Good Output ", "priority": "1", "assertion": "Role ''checkbox'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "Name ''Lettuce'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "State of the checkbox (not checked) is conveyed"}], "unexpected_behaviors": []}, {"output": "Success", "command": "F / Shift+F", "support": "FULL", "assertions": [{"pass": "Good Output ", "priority": "1", "assertion": "Role ''checkbox'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "Name ''Lettuce'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "State of the checkbox (not checked) is conveyed"}], "unexpected_behaviors": []}, {"output": "Success", "command": "Tab / Shift+Tab", "support": "FULL", "assertions": [{"pass": "Good Output ", "priority": "1", "assertion": "Role ''checkbox'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "Name ''Lettuce'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "State of the checkbox (not checked) is conveyed"}], "unexpected_behaviors": []}, {"output": "Success", "command": "Up Arrow / Down Arrow", "support": "FULL", "assertions": [{"pass": "Good Output ", "priority": "1", "assertion": "Role ''checkbox'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "Name ''Lettuce'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "State of the checkbox (not checked) is conveyed"}], "unexpected_behaviors": []}], "specific_user_instruction": "Navigate to the first checkbox. Note: it should be in the unchecked state."}}, "test": {"file": "tests/checkbox/test-01-navigate-to-unchecked-checkbox-reading.html", "name": "Navigate to an unchecked checkbox in reading mode", "executionOrder": 1}, "serializedForm": [{"name": "", "value": "Success", "disabled": false}, {"name": "result-0-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "problem-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "problem-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "", "value": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Reading cursor position changed in an unexpected manner", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader became extremely sluggish", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Browser crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-0-other", "value": "Other", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-0-other-input", "value": "", "disabled": true}, {"name": "", "value": "Success", "disabled": false}, {"name": "result-1-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-1-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-1-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-1-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-1-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-1-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-1-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-1-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-1-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "problem-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "problem-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "", "value": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Reading cursor position changed in an unexpected manner", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader became extremely sluggish", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Browser crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-1-other", "value": "Other", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-1-other-input", "value": "", "disabled": true}, {"name": "", "value": "Success", "disabled": false}, {"name": "result-2-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-2-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-2-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-2-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-2-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-2-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-2-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-2-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-2-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "problem-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "problem-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "", "value": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Reading cursor position changed in an unexpected manner", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader became extremely sluggish", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Browser crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-2-other", "value": "Other", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-2-other-input", "value": "", "disabled": true}, {"name": "", "value": "Success", "disabled": false}, {"name": "result-3-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-3-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-3-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-3-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-3-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-3-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-3-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-3-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-3-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "problem-3", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "problem-3", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "", "value": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Reading cursor position changed in an unexpected manner", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader became extremely sluggish", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Browser crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-3-other", "value": "Other", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-3-other-input", "value": "", "disabled": true}]}');
INSERT INTO public."TestResult" ("startedAt", "completedAt", "testPlanRun", data) VALUES ('2021-05-14 14:21:51.275-05', NULL, 1, '{"result": {"test": "Navigate to an unchecked checkbox in interaction mode", "status": "PASS", "details": {"name": "Navigate to an unchecked checkbox in interaction mode", "task": "navigate to unchecked checkbox", "summary": {"1": {"fail": 0, "pass": 3}, "2": {"fail": 0, "pass": 0}, "unexpectedCount": 0}, "commands": [{"output": "Success", "command": "Tab / Shift+Tab", "support": "FULL", "assertions": [{"pass": "Good Output ", "priority": "1", "assertion": "Role ''checkbox'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "Name ''Lettuce'' is conveyed"}, {"pass": "Good Output ", "priority": "1", "assertion": "State of the checkbox (not checked) is conveyed"}], "unexpected_behaviors": []}], "specific_user_instruction": "Navigate to the first checkbox. Note: it should be in the unchecked state."}}, "test": {"file": "tests/checkbox/test-02-navigate-to-unchecked-checkbox-interaction.html", "name": "Navigate to an unchecked checkbox in interaction mode", "executionOrder": 2}, "serializedForm": [{"name": "", "value": "Success", "disabled": false}, {"name": "result-0-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-1", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "result-0-2", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "problem-0", "value": "on", "checked": true, "disabled": false, "indeterminate": false}, {"name": "problem-0", "value": "on", "checked": false, "disabled": false, "indeterminate": false}, {"name": "", "disabled": false}, {"name": "", "value": "Output is excessively verbose, e.g., includes redundant and/or irrelevant speech", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Reading cursor position changed in an unexpected manner", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader became extremely sluggish", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Screen reader crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "", "value": "Browser crashed", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-0-other", "value": "Other", "checked": false, "disabled": true, "indeterminate": false}, {"name": "undesirable-0-other-input", "value": "", "disabled": true}]}');


--
-- Data for Name: UserRoles; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (1, 'admin');
INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (1, 'tester');
INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (2, 'tester');


--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanReport_id_seq"', 1, true);


--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanRun_id_seq"', 1, true);


--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanTarget_id_seq"', 1, true);


--
-- Name: TestPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlan_id_seq"', 8, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."User_id_seq"', 2, true);


--
-- PostgreSQL database dump complete
--

