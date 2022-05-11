--
-- PostgreSQL database dump
--

-- Dumped from database version 14.2
-- Dumped by pg_dump version 14.2

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
-- Name: TestPlanTarget; Type: TABLE; Schema: public; Owner: atr
--

CREATE TABLE public."TestPlanTarget" (
    id integer NOT NULL,
    title text,
    "atId" integer,
    "browserId" integer,
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
-- Name: TestPlanTarget id; Type: DEFAULT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget" ALTER COLUMN id SET DEFAULT nextval('public."TestPlanTarget_id_seq"'::regclass);


--
-- Data for Name: TestPlanTarget; Type: TABLE DATA; Schema: public; Owner: atr
--

COPY public."TestPlanTarget" (id, title, "atId", "browserId", "atVersion", "browserVersion") FROM stdin;
\.


--
-- Name: TestPlanTarget_id_seq; Type: SEQUENCE SET; Schema: public; Owner: atr
--

SELECT pg_catalog.setval('public."TestPlanTarget_id_seq"', 1, false);


--
-- Name: TestPlanTarget TestPlanTarget_pkey; Type: CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_pkey" PRIMARY KEY (id);


--
-- Name: TestPlanTarget TestPlanTarget_at_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_at_fkey" FOREIGN KEY ("atId") REFERENCES public."At"(id) ON UPDATE CASCADE;


--
-- Name: TestPlanTarget TestPlanTarget_browser_fkey; Type: FK CONSTRAINT; Schema: public; Owner: atr
--

ALTER TABLE ONLY public."TestPlanTarget"
    ADD CONSTRAINT "TestPlanTarget_browser_fkey" FOREIGN KEY ("browserId") REFERENCES public."Browser"(id) ON UPDATE CASCADE;


--
-- PostgreSQL database dump complete
--

