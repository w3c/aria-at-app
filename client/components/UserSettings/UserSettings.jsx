import React, { useState, useCallback, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Button, Container, Form } from 'react-bootstrap';
// import { CURRENT_SETTINGS_QUERY } from './queries';
// import { useQuery } from '@apollo/client';

const UserSettings = () => {
    // const { data } = useQuery(CURRENT_SETTINGS_QUERY);

    const ats = [
        { id: 'nvda', name: 'NVDA' },
        { id: 'jaws', name: 'JAWS' },
        { id: 'voiceOver', name: 'VoiceOver' }
    ];
    const [currentAts, setCurrentAts] = useState([]);
    const [checkedAts, setCheckedAts] = useState([]);

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
            setCurrentAts(checkedAts);
        },
        [checkedAts]
    );

    // useEffect(() => {
    //     if (!data) return;

    //     setCurrent;
    // }, [data]);

    // if (!data) return;

    const isSignedIn = true;
    const username = 'aflennik';
    const email = null;
    const loadedUserData = true;

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

    const content =
        loadedUserData && isSignedIn ? (
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
                <p>{email}</p>
                <h2>Assistive Technology Settings</h2>
                <div tabIndex={0} /* ref={this.currentAtsRef} */>
                    {currentAts.length > 0
                        ? currentAtDisplay
                        : noCurrentAtDisplay}
                </div>
                <p>
                    Submit the form below to update the assistive technologies
                    you can test:
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
        ) : (
            <p data-test="user-settings-unauthorized">Unauthorized</p>
        );

    return (
        <Container as="main">
            <Container fluid data-test="user-settings-contents">
                <Helmet>
                    <title>Settings | ARIA-AT</title>
                </Helmet>
                <h1>Settings</h1>
                {content}
            </Container>
        </Container>
    );
};

export default UserSettings;
