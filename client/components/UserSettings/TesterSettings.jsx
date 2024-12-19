import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form } from 'react-bootstrap';
import { useMutation } from '@apollo/client';
import { TESTER_SETTINGS_QUERY, UPDATE_ME_MUTATION } from './queries';
import { AtPropType } from '../common/proptypes';

const TesterSettings = ({ ats, meAts }) => {
  const [updateMe] = useMutation(UPDATE_ME_MUTATION, {
    refetchQueries: [{ query: TESTER_SETTINGS_QUERY }]
  });

  const [checkedAts, setCheckedAts] = useState([]);

  if (!ats || !meAts || !checkedAts) return null;

  useEffect(() => {
    if (!meAts) return;
    setCheckedAts(meAts.map(at => at.id));
  }, [meAts]);

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

  const savedAts = meAts.map(at => at.id);

  return (
    <section>
      <h2>Assistive Technology Settings</h2>
      <div aria-atomic="true" aria-live="polite">
        {savedAts.length > 0 ? (
          <div>
            <p data-testid="testable-ats-status">
              You can currently test the following assistive technologies:
            </p>
            <ul>
              {ats
                .filter(({ id: atId }) => savedAts.includes(atId))
                .map(at => (
                  <li style={{ listStyle: 'disc' }} key={at.id}>
                    {at.name}
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <p data-testid="testable-ats-status">
            You have not yet selected any assistive technologies.
          </p>
        )}
      </div>
      <p>
        Update the assistive technologies you can test by selecting from the
        options below:
      </p>
      <Form>
        <h3 id="at-group-label">Assistive Technologies</h3>
        <Form.Group
          controlId="formBasicCheckbox"
          role="group"
          aria-labelledby="at-group-label"
        >
          {ats?.map(at => {
            return (
              <Form.Check
                id={at.id}
                key={at.id}
                label={at.name}
                onChange={handleCheckedAt}
                checked={!!checkedAts.find(atId => atId === at.id)}
              />
            );
          })}
        </Form.Group>
        <Button variant="primary" type="submit" onClick={handleSave}>
          Save
        </Button>
      </Form>
    </section>
  );
};

TesterSettings.propTypes = {
  ats: PropTypes.arrayOf(AtPropType),
  meAts: PropTypes.arrayOf(AtPropType)
};

export default TesterSettings;
