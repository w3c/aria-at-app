import React from 'react';
import { Helmet } from 'react-helmet';
import { Container, Breadcrumb } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/free-solid-svg-icons';
import './ReportsPage.css';

const ReportsPage = () => {
    return (
        <Container as="main">
            <Helmet>
                <title>ARIA-AT Reports</title>
            </Helmet>
            <h1 id="table-header">Summary Report</h1>
            <Breadcrumb>
                <Breadcrumb.Item active>
                    <FontAwesomeIcon icon={faHome} />
                    Summary Report
                </Breadcrumb.Item>
            </Breadcrumb>
        </Container>
    );
};

export default ReportsPage;
