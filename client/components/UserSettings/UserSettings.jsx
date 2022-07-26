import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button, Container, Form } from 'react-bootstrap';
import { useMutation, useQuery } from '@apollo/client';
import PageStatus from '../common/PageStatus';
import { CURRENT_SETTINGS_QUERY, UPDATE_ME_MUTATION } from './queries';

const UserSettings = () => {
    const { loading, data, error } = useQuery(CURRENT_SETTINGS_QUERY);

    const [updateMe] = useMutation(UPDATE_ME_MUTATION, {
        refetchQueries: [{ query: CURRENT_SETTINGS_QUERY }]
    });

    const [checkedAts, setCheckedAts] = useState(undefined);

    const handleCheckedAt = useCallback(
        event => {
            const atId = event.target.id;
            const isChecked = checkedAts.includes(atId);
            if (isChecked) {
                setCheckedAts(checkedAts.filter(item => item !== atId));
            } else {
                setCheckedAts([...checkedAts, atId]);
            }
        },
        [checkedAts]
    );

    const handleSave = useCallback(
        event => {
            event.preventDefault();
            updateMe({ variables: { input: { atIds: checkedAts } } });
        },
        [checkedAts]
    );

    useEffect(() => {
        if (!data) return;
        setCheckedAts(data.me.ats.map(at => at.id));
    }, [data]);

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
            <PageStatus
                title="Loading - Settings | ARIA-AT"
                heading="Settings"
            />
        );
    }

    if (!data || !checkedAts) return null;

    const {
        ats,
        me: { username, ats: userAtsData }
    } = data;
    const savedAts = userAtsData.map(at => at.id);

    return (
        <Container id="main" as="main" tabIndex="-1">
            <Container fluid data-test="user-settings-contents">
                <Helmet>
                    <title>Settings | ARIA-AT</title>
                </Helmet>
                <h1>Settings</h1>
                <section data-test="user-settings-authorized">
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
                    <h2>Assistive Technology Settings</h2>
                    <div aria-atomic="true" aria-live="polite">
                        {savedAts.length > 0 ? (
                            <div>
                                <p>
                                    You can currently test the following
                                    assistive technologies:
                                </p>
                                <ul>
                                    {ats
                                        .filter(({ id: atId }) =>
                                            savedAts.includes(atId)
                                        )
                                        .map(at => (
                                            <li key={at.id}>{at.name}</li>
                                        ))}
                                </ul>
                            </div>
                        ) : (
                            <p>
                                You currently are not configured to run any
                                assistive technologies.
                            </p>
                        )}
                    </div>
                    <p>
                        Submit the form below to update the assistive
                        technologies you can test:
                    </p>
                    <Form>
                        <h3 id="at-group-label">ATs</h3>
                        <Form.Group
                            controlId="formBasicCheckbox"
                            role="group"
                            aria-labelledby="at-group-label"
                        >
                            {ats &&
                                ats.map(at => {
                                    return (
                                        <Form.Check
                                            id={at.id}
                                            key={at.id}
                                            label={at.name}
                                            onChange={handleCheckedAt}
                                            checked={
                                                !!checkedAts.find(
                                                    atId => atId === at.id
                                                )
                                            }
                                        />
                                    );
                                })}
                        </Form.Group>
                        <Button
                            variant="primary"
                            type="submit"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </Form>
                </section>
            </Container>
        </Container>
    );
};

export default UserSettings;
