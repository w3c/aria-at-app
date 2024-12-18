import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import TesterSettings from './TesterSettings';
import { CURRENT_SETTINGS_QUERY } from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';
import AdminSettings from '@components/UserSettings/AdminSettings';

const UserSettings = () => {
  const { loading, data, error } = useQuery(CURRENT_SETTINGS_QUERY);

  if (error) {
    return (
      <PageStatus
        title="Settings | ARIA-AT"
        heading="Settings"
        message={error.message}
        isError
      />
    );
  }

  if (loading) {
    return (
      <PageStatus title="Loading - Settings | ARIA-AT" heading="Settings" />
    );
  }

  if (!data) return null;

  const { ats, me } = data;
  const auth = evaluateAuth(me ? me : {});
  const { username, isAdmin, isVendor, isTester } = auth;

  return (
    <Container id="main" as="main" tabIndex="-1">
      <Container fluid>
        <Helmet>
          <title>Settings | ARIA-AT</title>
        </Helmet>
        <h1>Settings</h1>
        <section>
          <h2>User Details</h2>
          <p>
            <a
              href={`https://github.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {username}
            </a>
          </p>
        </section>
        {!isAdmin && isTester && !isVendor && (
          <TesterSettings ats={ats} meAts={data.me.ats} />
        )}
        {isAdmin && <AdminSettings ats={ats} meAts={data.me.ats} />}
      </Container>
    </Container>
  );
};

export default UserSettings;
