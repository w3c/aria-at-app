import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button, Container, Form } from 'react-bootstrap';
import { CURRENT_SETTINGS_QUERY, UPDATE_ME_MUTATION } from './queries';
import { useMutation, useQuery } from '@apollo/client';

const UserSettings = () => {
    const { data } = useQuery(CURRENT_SETTINGS_QUERY);
    const [updateMe] = useMutation(UPDATE_ME_MUTATION, {
        refetchQueries: [{ query: CURRENT_SETTINGS_QUERY }]
    });

    const [isLoading, setIsLoading] = useState(true);
    const [ats, setAts] = useState(null);
    const [username, setCurrentUsername] = useState(null);
    const [currentAts, setCurrentAts] = useState(null);
    const [checkedAts, setCheckedAts] = useState(null);

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
        console.log('updating state');
        setAts(data.ats);
        setCurrentAts(data.me.ats.map(at => at.id));
        setCheckedAts(data.me.ats.map(at => at.id));
        setCurrentUsername(data.me.username);
        setIsLoading(false);
    }, [data]);

    if (isLoading) return null;

    const currentAtDisplay = (
        <div>
            <p>You can currently test the following assistive technologies:</p>
            <ul>
                {ats
                    .filter(({ id: atId }) => currentAts.includes(atId))
                    .map(at => (
                        <li key={at.id}>{at.name}</li>
                    ))}
            </ul>
        </div>
    );
    const noCurrentAtDisplay = (
        <p>
            You currently are not configured to run any assistive technologies.
        </p>
    );

    return (
        <Container as="main">
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
                    <div tabIndex={0} /* ref={this.currentAtsRef} */>
                        {currentAts.length > 0
                            ? currentAtDisplay
                            : noCurrentAtDisplay}
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
