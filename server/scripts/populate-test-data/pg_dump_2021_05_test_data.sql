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

INSERT INTO public."AtMode" ("atId", name) VALUES (2, 'reading');
INSERT INTO public."AtMode" ("atId", name) VALUES (2, 'interaction');
INSERT INTO public."AtMode" ("atId", name) VALUES (3, 'modeless');
INSERT INTO public."AtMode" ("atId", name) VALUES (1, 'reading');
INSERT INTO public."AtMode" ("atId", name) VALUES (1, 'interaction');


--
-- Data for Name: AtVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (2, '2019.3');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (2, '2020.1');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (2, '2020.2');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (2, '2020.3');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (2, '2020.4');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (1, '2021.2103.174');
INSERT INTO public."AtVersion" ("atId", "atVersion") VALUES (3, 'MacOS');


--
-- Data for Name: BrowserVersion; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (1, '86.0');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (1, '86.0.1');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (1, '87.0');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (1, '88.0');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (1, '88.0.1');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (2, '90.0.4430');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (2, '91.0.4472');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (3, '13.0');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (3, '13.1');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (3, '14.0');
INSERT INTO public."BrowserVersion" ("browserId", "browserVersion") VALUES (3, '14.1');


--
-- Data for Name: TestPlanTarget; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (1, 'JAWS 2021.2103.174 with Chrome 91.0.4472', 1, 2, '2021.2103.174', '91.0.4472');
INSERT INTO public."TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (2, 'NVDA 2020.4 with Firefox 88.0.1', 2, 1, '2020.4', '88.0.1');
INSERT INTO public."TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") VALUES (3, 'NVDA 2020.4 with Firefox 88.0.1', 2, 1, '2020.4', '88.0.1');


--
-- Data for Name: TestPlanReport; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (1, 'DRAFT', 1, 1, '2021-05-14 14:18:23.602-05');
INSERT INTO public."TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (2, 'DRAFT', 2, 1, '2021-05-14 14:18:23.602-05');
INSERT INTO public."TestPlanReport" (id, "status", "testPlanTargetId", "testPlanVersionId", "createdAt") VALUES (3, 'FINALIZED', 3, 1, '2021-05-14 14:18:23.602-05');


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."User" (id, username, "createdAt", "updatedAt") VALUES (1, 'esmeralda-baggins', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');
INSERT INTO public."User" (id, username, "createdAt", "updatedAt") VALUES (2, 'tom-proudfeet', '2021-05-14 13:57:16.232-05', '2021-05-14 13:57:20.473-05');
INSERT INTO public."UserAts" ("userId", "atId") VALUES (1, 1);
INSERT INTO public."UserAts" ("userId", "atId") VALUES (1, 2);
INSERT INTO public."UserAts" ("userId", "atId") VALUES (2, 3);
INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (1, 'ADMIN');
INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (1, 'TESTER');
INSERT INTO public."UserRoles" ("userId", "roleName") VALUES (2, 'TESTER');


--
-- Data for Name: TestPlanRun; Type: TABLE DATA; Schema: public; Owner: atr
--

INSERT INTO public."TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (1, 1, 1,
'{"{
		\"id\": \"M2M4MeyIxMiI6MX0ThmYT\",
		\"testId\": \"ZDBiOeyIyIjoiMSJ9WZiYT\",
		\"startedAt\": \"2021-09-21T14:09:37.262Z\",
		\"completedAt\": null,
		\"scenarioResults\": [
			{
				\"id\": \"MzdlZeyIxMyI6Ik0yTTRNZXlJeE1pSTZNWDBUaG1ZVCJ9WUzMz\",
				\"scenarioId\": \"MDhhYeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zQyMT\",
				\"commandId\": \"TAB_AND_SHIFT_TAB\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"M2Q1NeyIxNCI6Ik16ZGxaZXlJeE15STZJazB5VFRSTlpYbEplRTFwU1RaTldEQlVhRzFaVkNKOVdVek16In0jk1ZG\",
						\"assertionId\": \"MWJjNeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zNiZW\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"MDE3ZeyIxNCI6Ik16ZGxaZXlJeE15STZJazB5VFRSTlpYbEplRTFwU1RaTldEQlVhRzFaVkNKOVdVek16In0jZlYj\",
						\"assertionId\": \"NTJmZeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9TA0Nj\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"NTA0NeyIxNCI6Ik16ZGxaZXlJeE15STZJazB5VFRSTlpYbEplRTFwU1RaTldEQlVhRzFaVkNKOVdVek16In0zNmYj\",
						\"assertionId\": \"ZjgwMeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9DE4ZW\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}", "{
		\"id\": \"NTQ1MeyIxMiI6MX0DI1MT\",
		\"testId\": \"MGZkYeyIyIjoiMSJ9TgxZD\",
		\"startedAt\": \"2021-09-21T14:21:29.939Z\",
		\"completedAt\": null,
		\"scenarioResults\": [
			{
				\"id\": \"MjcxZeyIxMyI6Ik5UUTFNZXlJeE1pSTZNWDBESTFNVCJ9DY3OD\",
				\"scenarioId\": \"NzVjYeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9TNiMG\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"OGY3MeyIxNCI6Ik1qY3haZXlJeE15STZJazVVVVRGTlpYbEplRTFwU1RaTldEQkVTVEZOVkNKOURZM09EIn0GYyZW\",
						\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			},
			{
				\"id\": \"NmM0ZeyIxMyI6Ik5UUTFNZXlJeE1pSTZNWDBESTFNVCJ9mQzYz\",
				\"scenarioId\": \"MjdmNeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ92I1Mm\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"NWFkMeyIxNCI6Ik5tTTBaZXlJeE15STZJazVVVVRGTlpYbEplRTFwU1RaTldEQkVTVEZOVkNKOW1Rell6In0jFhMz\",
						\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}", "{
		\"id\": \"ZmZlNeyIxMiI6MX0jlmMT\",
		\"testId\": \"Mjk0MeyIyIjoiMSJ9jQyOG\",
		\"startedAt\": \"2021-09-21T14:22:06.373Z\",
		\"completedAt\": null,
		\"scenarioResults\": [
			{
				\"id\": \"ZTM2MeyIxMyI6IlptWmxOZXlJeE1pSTZNWDBqbG1NVCJ9GY4OD\",
				\"scenarioId\": \"NjM1MeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9mU4YW\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"MzNlYeyIxNCI6IlpUTTJNZXlJeE15STZJbHB0V214T1pYbEplRTFwU1RaTldEQnFiRzFOVkNKOUdZNE9EIn0jc1Zm\",
						\"assertionId\": \"OTAyOeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9WI5MT\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}", "{
		\"id\": \"ZjM3OeyIxMiI6MX0GQ0Zj\",
		\"testId\": \"ZDNhNeyIyIjoiMSJ9mE0ND\",
		\"startedAt\": \"2021-09-21T14:22:10.812Z\",
		\"completedAt\": null,
		\"scenarioResults\": [
			{
				\"id\": \"ZmM3MeyIxMyI6IlpqTTNPZXlJeE1pSTZNWDBHUTBaaiJ9GYxMj\",
				\"scenarioId\": \"MGUwYeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9jlkMm\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"N2IwZeyIxNCI6IlptTTNNZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOUdZeE1qIn0GE1MD\",
						\"assertionId\": \"NmZhMeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9WQ0Mz\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"OGMwZeyIxNCI6IlptTTNNZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOUdZeE1qIn0GIxYj\",
						\"assertionId\": \"OGI3MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9TJlMT\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"YzIwMeyIxNCI6IlptTTNNZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOUdZeE1qIn0zM1ND\",
						\"assertionId\": \"MjM3NeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9DczYT\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			},
			{
				\"id\": \"OTlmMeyIxMyI6IlpqTTNPZXlJeE1pSTZNWDBHUTBaaiJ9mY3YW\",
				\"scenarioId\": \"NzE0MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9zE2Yj\",
				\"output\": null,
				\"assertionResults\": [
					{
						\"id\": \"MWI0ZeyIxNCI6Ik9UbG1NZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOW1ZM1lXIn0TcwZG\",
						\"assertionId\": \"NmZhMeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9WQ0Mz\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"MDE4OeyIxNCI6Ik9UbG1NZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOW1ZM1lXIn0TA1MD\",
						\"assertionId\": \"OGI3MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9TJlMT\",
						\"passed\": null,
						\"failedReason\": null
					},
					{
						\"id\": \"YmZiNeyIxNCI6Ik9UbG1NZXlJeE15STZJbHBxVFROUFpYbEplRTFwU1RaTldEQkhVVEJhYWlKOW1ZM1lXIn0GExOW\",
						\"assertionId\": \"MjM3NeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9DczYT\",
						\"passed\": null,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}
"}');
INSERT INTO public."TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (2, 1, 2,
'{"{
	\"id\": \"OWY1OeyIxMiI6Mn0GVlZD\",
	\"testId\": \"ZDBiOeyIyIjoiMSJ9WZiYT\",
	\"startedAt\": \"2021-09-21T14:09:37.262Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"NDE4YeyIxMyI6Ik9XWTFPZXlJeE1pSTZNbjBHVmxaRCJ9WNmZD\",
			\"scenarioId\": \"MDhhYeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zQyMT\",
			\"commandId\": \"TAB_AND_SHIFT_TAB\",
			\"output\": \"output conflicts due to assertions\",
			\"assertionResults\": [
				{
					\"id\": \"YzUyZeyIxNCI6Ik5ERTRZZXlJeE15STZJazlYV1RGUFpYbEplRTFwU1RaTmJqQkhWbXhhUkNKOVdObVpEIn0GU0MT\",
					\"assertionId\": \"MWJjNeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zNiZW\",
					\"passed\": false,
					\"failedReason\": \"NO_OUTPUT\"
				},
				{
					\"id\": \"ODk5YeyIxNCI6Ik5ERTRZZXlJeE15STZJazlYV1RGUFpYbEplRTFwU1RaTmJqQkhWbXhhUkNKOVdObVpEIn0TY5Nj\",
					\"assertionId\": \"NTJmZeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9TA0Nj\",
					\"passed\": false,
					\"failedReason\": \"NO_OUTPUT\"
				},
				{
					\"id\": \"NmU4ZeyIxNCI6Ik5ERTRZZXlJeE15STZJazlYV1RGUFpYbEplRTFwU1RaTmJqQkhWbXhhUkNKOVdObVpEIn0jdlMz\",
					\"assertionId\": \"ZjgwMeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9DE4ZW\",
					\"passed\": false,
					\"failedReason\": \"INCORRECT_OUTPUT\"
				}
			],
			\"unexpectedBehaviors\": []
		}
	]
}", "{
	\"id\": \"NWJjMeyIxMiI6Mn0TEyMT\",
	\"testId\": \"MGZkYeyIyIjoiMSJ9TgxZD\",
	\"startedAt\": \"2021-09-21T14:21:29.939Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"MjlkMeyIxMyI6Ik5XSmpNZXlJeE1pSTZNbjBURXlNVCJ92M5ZW\",
			\"scenarioId\": \"NzVjYeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9TNiMG\",
			\"output\": \"output conflicts due to unexpected behaviors\",
			\"assertionResults\": [
				{
					\"id\": \"NTRjOeyIxNCI6Ik1qbGtNZXlJeE15STZJazVYU21wTlpYbEplRTFwU1RaTmJqQlVSWGxOVkNKOTJNNVpXIn0TAzYm\",
					\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": [
				{
					\"id\": \"OTHER\",
					\"otherUnexpectedBehaviorText\": \"Different text\"
				}
			]
		},
		{
			\"id\": \"MjI1NeyIxMyI6Ik5XSmpNZXlJeE1pSTZNbjBURXlNVCJ9WU1M2\",
			\"scenarioId\": \"MjdmNeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ92I1Mm\",
			\"output\": null,
			\"assertionResults\": [
				{
					\"id\": \"ZjY5ZeyIxNCI6Ik1qSTFOZXlJeE15STZJazVYU21wTlpYbEplRTFwU1RaTmJqQlVSWGxOVkNKOVdVMU0yIn0WQxNG\",
					\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": []
		}
	]
}", "{
	\"id\": \"YTg4YeyIxMiI6Mn0WJiN2\",
	\"testId\": \"Mjk0MeyIyIjoiMSJ9jQyOG\",
	\"startedAt\": \"2021-09-21T14:22:06.373Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"YjQzNeyIxMyI6IllUZzRZZXlJeE1pSTZNbjBXSmlOMiJ9mYwZD\",
			\"scenarioId\": \"NjM1MeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9mU4YW\",
			\"output\": null,
			\"assertionResults\": [
				{
					\"id\": \"Yjc2ZeyIxNCI6IllqUXpOZXlJeE15STZJbGxVWnpSWlpYbEplRTFwU1RaTmJqQlhTbWxPTWlKOW1Zd1pEIn0TRiNW\",
					\"assertionId\": \"OTAyOeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9WI5MT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": [
				{
					\"id\": \"OTHER\",
					\"otherUnexpectedBehaviorText\": \"Different unexpected behavior\"
				}
			]
		}
	]
}"}');
INSERT INTO public."TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (3, 2, 2,
'{"{
	\"id\": \"NGMzOeyIxMiI6M30WFiZj\",
	\"testId\": \"ZDBiOeyIyIjoiMSJ9WZiYT\",
	\"startedAt\": \"2021-09-21T14:09:37.262Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"N2NjOeyIxMyI6Ik5HTXpPZXlJeE1pSTZNMzBXRmlaaiJ9GRmMW\",
			\"scenarioId\": \"MDhhYeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zQyMT\",
			\"commandId\": \"TAB_AND_SHIFT_TAB\",
			\"output\": \"output will conflict due to assertions\",
			\"assertionResults\": [
				{
					\"id\": \"YTNjMeyIxNCI6Ik4yTmpPZXlJeE15STZJazVIVFhwUFpYbEplRTFwU1RaTk16QlhSbWxhYWlKOUdSbU1XIn0WY5Y2\",
					\"assertionId\": \"MWJjNeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zNiZW\",
					\"passed\": true,
					\"failedReason\": null
				},
				{
					\"id\": \"MGQ3YeyIxNCI6Ik4yTmpPZXlJeE15STZJazVIVFhwUFpYbEplRTFwU1RaTk16QlhSbWxhYWlKOUdSbU1XIn0TdhN2\",
					\"assertionId\": \"NTJmZeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9TA0Nj\",
					\"passed\": true,
					\"failedReason\": null
				},
				{
					\"id\": \"NzJhMeyIxNCI6Ik4yTmpPZXlJeE15STZJazVIVFhwUFpYbEplRTFwU1RaTk16QlhSbWxhYWlKOUdSbU1XIn0zQ4OT\",
					\"assertionId\": \"ZjgwMeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9DE4ZW\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": []
		}
	]
}", "{
	\"id\": \"MWU1MeyIxMiI6M30DRkZT\",
	\"testId\": \"MGZkYeyIyIjoiMSJ9TgxZD\",
	\"startedAt\": \"2021-09-21T14:21:29.939Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"ZTcwZeyIxMyI6Ik1XVTFNZXlJeE1pSTZNMzBEUmtaVCJ9DdiOD\",
			\"scenarioId\": \"NzVjYeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9TNiMG\",
			\"output\": \"output will conflict due to unexpected behaviors\",
			\"assertionResults\": [
				{
					\"id\": \"YmFhNeyIxNCI6IlpUY3daZXlJeE15STZJazFYVlRGTlpYbEplRTFwU1RaTk16QkVVbXRhVkNKOURkaU9EIn0DUwNW\",
					\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": [
				{ \"id\": \"SLUGGISH\" }
			]
		},
		{
			\"id\": \"ZjA1MeyIxMyI6Ik1XVTFNZXlJeE1pSTZNMzBEUmtaVCJ92MyNj\",
			\"scenarioId\": \"MjdmNeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ92I1Mm\",
			\"output\": null,
			\"assertionResults\": [
				{
					\"id\": \"OTIwNeyIxNCI6IlpqQTFNZXlJeE15STZJazFYVlRGTlpYbEplRTFwU1RaTk16QkVVbXRhVkNKOTJNeU5qIn0mNhYz\",
					\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": [
				{ \"id\": \"EXCESSIVELY_VERBOSE\" }
			]
		}
	]
}", "{
	\"id\": \"ZjExNeyIxMiI6M30TRiN2\",
	\"testId\": \"Mjk0MeyIyIjoiMSJ9jQyOG\",
	\"startedAt\": \"2021-09-21T14:22:06.373Z\",
	\"completedAt\": \"2021-09-21T14:10:56.262Z\",
	\"scenarioResults\": [
		{
			\"id\": \"ZTRkYeyIxMyI6IlpqRXhOZXlJeE1pSTZNMzBUUmlOMiJ9jM1Yz\",
			\"scenarioId\": \"NjM1MeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9mU4YW\",
			\"output\": null,
			\"assertionResults\": [
				{
					\"id\": \"MzJhNeyIxNCI6IlpUUmtZZXlJeE15STZJbHBxUlhoT1pYbEplRTFwU1RaTk16QlVVbWxPTWlKOWpNMVl6In0GJiMz\",
					\"assertionId\": \"OTAyOeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9WI5MT\",
					\"passed\": true,
					\"failedReason\": null
				}
			],
			\"unexpectedBehaviors\": []
		}
	]
}"}');
INSERT INTO public."TestPlanRun" (id, "testerUserId", "testPlanReportId", "testResults") VALUES (4, 1, 3, '{"{
		\"id\": \"NGIzMeyIxMiI6NH0zliY2\",
		\"testId\": \"ZDBiOeyIyIjoiMSJ9WZiYT\",
		\"startedAt\": \"2021-09-21T14:09:37.262Z\",
		\"completedAt\": \"2021-09-21T14:10:56.262Z\",
		\"scenarioResults\": [
			{
				\"id\": \"ZjVhMeyIxMyI6Ik5HSXpNZXlJeE1pSTZOSDB6bGlZMiJ92QzMz\",
				\"scenarioId\": \"MDhhYeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zQyMT\",
				\"commandId\": \"TAB_AND_SHIFT_TAB\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"MGM4NeyIxNCI6IlpqVmhNZXlJeE15STZJazVIU1hwTlpYbEplRTFwU1RaT1NEQjZiR2xaTWlKOTJRek16In0mQwYj\",
						\"assertionId\": \"MWJjNeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9zNiZW\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"NTQ5YeyIxNCI6IlpqVmhNZXlJeE15STZJazVIU1hwTlpYbEplRTFwU1RaT1NEQjZiR2xaTWlKOTJRek16In0WUwMz\",
						\"assertionId\": \"NTJmZeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9TA0Nj\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"NzU5ZeyIxNCI6IlpqVmhNZXlJeE15STZJazVIU1hwTlpYbEplRTFwU1RaT1NEQjZiR2xaTWlKOTJRek16In0GYzYz\",
						\"assertionId\": \"ZjgwMeyIzIjoiWkRCaU9leUl5SWpvaU1TSjlXWmlZVCJ9DE4ZW\",
						\"passed\": true,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}", "{
		\"id\": \"Y2JhZeyIxMiI6NH0DBjNT\",
		\"testId\": \"MGZkYeyIyIjoiMSJ9TgxZD\",
		\"startedAt\": \"2021-09-21T14:21:29.939Z\",
		\"completedAt\": \"2021-09-21T14:10:56.262Z\",
		\"scenarioResults\": [
			{
				\"id\": \"YjA0MeyIxMyI6IlkySmhaZXlJeE1pSTZOSDBEQmpOVCJ9WZjZD\",
				\"scenarioId\": \"NzVjYeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9TNiMG\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"YzgwYeyIxNCI6IllqQTBNZXlJeE15STZJbGt5U21oYVpYbEplRTFwU1RaT1NEQkVRbXBPVkNKOVdaalpEIn0jYwZG\",
						\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
						\"passed\": false,
						\"failedReason\": \"NO_OUTPUT\"
					}
				],
				\"unexpectedBehaviors\": []
			},
			{
				\"id\": \"YTg4ZeyIxMyI6IlkySmhaZXlJeE1pSTZOSDBEQmpOVCJ9jE1Mm\",
				\"scenarioId\": \"MjdmNeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ92I1Mm\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"MmI4YeyIxNCI6IllUZzRaZXlJeE15STZJbGt5U21oYVpYbEplRTFwU1RaT1NEQkVRbXBPVkNKOWpFMU1tIn0TUzMD\",
						\"assertionId\": \"YmJmZeyIzIjoiTUdaa1lleUl5SWpvaU1TSjlUZ3haRCJ9mU4ZT\",
						\"passed\": false,
						\"failedReason\": \"INCORRECT_OUTPUT\"
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}", "{
		\"id\": \"Mzk0MeyIxMiI6NH0TFlMj\",
		\"testId\": \"Mjk0MeyIyIjoiMSJ9jQyOG\",
		\"startedAt\": \"2021-09-21T14:22:06.373Z\",
		\"completedAt\": \"2021-09-21T14:10:56.262Z\",
		\"scenarioResults\": [
			{
				\"id\": \"OTcyNeyIxMyI6Ik16azBNZXlJeE1pSTZOSDBURmxNaiJ9TkyMj\",
				\"scenarioId\": \"NjM1MeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9mU4YW\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"YTg5OeyIxNCI6Ik9UY3lOZXlJeE15STZJazE2YXpCTlpYbEplRTFwU1RaT1NEQlVSbXhOYWlKOVRreU1qIn0TY1Yz\",
						\"assertionId\": \"OTAyOeyIzIjoiTWprME1leUl5SWpvaU1TSjlqUXlPRyJ9WI5MT\",
						\"passed\": true,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": [
					{ \"id\": \"SLUGGISH\" }
				]
			}
		]
	}", "{
		\"id\": \"NTY5ZeyIxMiI6NH0GUwNT\",
		\"testId\": \"ZDNhNeyIyIjoiMSJ9mE0ND\",
		\"startedAt\": \"2021-09-21T14:22:10.812Z\",
		\"completedAt\": \"2021-09-21T14:10:56.262Z\",
		\"scenarioResults\": [
			{
				\"id\": \"ZGNkNeyIxMyI6Ik5UWTVaZXlJeE1pSTZOSDBHVXdOVCJ9mY3OD\",
				\"scenarioId\": \"MGUwYeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9jlkMm\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"ODMyZeyIxNCI6IlpHTmtOZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOW1ZM09EIn0mI3ZT\",
						\"assertionId\": \"NmZhMeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9WQ0Mz\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"YjI3ZeyIxNCI6IlpHTmtOZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOW1ZM09EIn0Dk5Yz\",
						\"assertionId\": \"OGI3MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9TJlMT\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"Y2ZhNeyIxNCI6IlpHTmtOZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOW1ZM09EIn0GJkMW\",
						\"assertionId\": \"MjM3NeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9DczYT\",
						\"passed\": true,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": [
					{
						\"id\": \"OTHER\",
						\"otherUnexpectedBehaviorText\": \"Another failure reason\"
					}
				]
			},
			{
				\"id\": \"ODUyYeyIxMyI6Ik5UWTVaZXlJeE1pSTZOSDBHVXdOVCJ9WJhNj\",
				\"scenarioId\": \"NzE0MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9zE2Yj\",
				\"output\": \"checkbox sample output\",
				\"assertionResults\": [
					{
						\"id\": \"ZTlkMeyIxNCI6Ik9EVXlZZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOVdKaE5qIn0jIxYz\",
						\"assertionId\": \"NmZhMeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9WQ0Mz\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"OTg3ZeyIxNCI6Ik9EVXlZZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOVdKaE5qIn0jA0YT\",
						\"assertionId\": \"OGI3MeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9TJlMT\",
						\"passed\": true,
						\"failedReason\": null
					},
					{
						\"id\": \"Y2RjMeyIxNCI6Ik9EVXlZZXlJeE15STZJazVVV1RWYVpYbEplRTFwU1RaT1NEQkhWWGRPVkNKOVdKaE5qIn0DYzMW\",
						\"assertionId\": \"MjM3NeyIzIjoiWkROaE5leUl5SWpvaU1TSjltRTBORCJ9DczYT\",
						\"passed\": true,
						\"failedReason\": null
					}
				],
				\"unexpectedBehaviors\": []
			}
		]
	}
"}');

--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."At_id_seq"', 100, true);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."Browser_id_seq"', 100, true);


--
-- Name: At_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."At_id_seq"', 100, true);


--
-- Name: Browser_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."Browser_id_seq"', 100, true);


--
-- Name: TestPlanReport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanReport_id_seq"', 100, true);


--
-- Name: TestPlanRun_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanRun_id_seq"', 100, true);


--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanTarget_id_seq"', 100, true);


--
-- Name: TestPlan_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlan_id_seq"', 100, true);


--
-- Name: User_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."User_id_seq"', 100, true);


--
-- PostgreSQL database dump complete
--

