import React from 'react';
import { Helmet } from 'react-helmet';
import { Container } from 'react-bootstrap';
import { useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import TesterSettings from './TesterSettings';
import AdminSettings from './AdminSettings';
import { ME_QUERY } from '../App/queries';
import { TESTER_SETTINGS_QUERY, ADMIN_SETTINGS_QUERY } from './queries';
import { evaluateAuth } from '../../utils/evaluateAuth';

const UserSettings = () => {
  const { loading, data, error } = useQuery(ME_QUERY);

  const auth = evaluateAuth(data?.me ? data?.me : {});
  const { username, isAdmin, isVendor, isTester } = auth;

  const {
    data: testerQueryData,
    loading: testerQueryLoading,
    error: testerQueryError
  } = useQuery(TESTER_SETTINGS_QUERY, {
    skip: isAdmin || isVendor // no need to query if admin or vendor
  });

  const {
    data: adminQueryData,
    loading: adminQueryLoading,
    error: adminQueryError,
    refetch: adminQueryRefetch
  } = useQuery(ADMIN_SETTINGS_QUERY, {
    skip: !isAdmin // no need to query if not admin
  });

  if (error || testerQueryError || adminQueryError) {
    return (
      <PageStatus
        title="Settings | ARIA-AT"
        heading="Settings"
        message={error.message}
        isError
      />
    );
  }

  if (loading || testerQueryLoading || adminQueryLoading) {
    return (
      <PageStatus title="Loading - Settings | ARIA-AT" heading="Settings" />
    );
  }

  return (
    <Container id="main" as="main" tabIndex="-1">
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
        <TesterSettings
          ats={testerQueryData.ats}
          meAts={testerQueryData.me.ats}
        />
      )}
      {isAdmin && (
        <AdminSettings
          latestTestPlanVersion={adminQueryData.latestTestPlanVersion}
          refetch={adminQueryRefetch}
        />
      )}
    </Container>
  );
};

export default UserSettings;
