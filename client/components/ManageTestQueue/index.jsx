import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const Container = styled.div`
    border: 1px solid #d3d5da;
    border-radius: 3px;
`;

const DisclosureButton = styled.button`
    position: relative;
    width: 100%;
    margin: 0;
    padding: 1.25rem;
    text-align: left;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 3px;
    background-color: transparent;

    &:nth-of-type(1) {
        border-radius: 3px 3px 0 0;
    }

    &:nth-last-of-type(1) {
        border-top: 1px solid #d3d5da;
        border-radius: 0 0 3px 3px;

        &:hover,
        &:focus {
            border-top: 1px solid #d3d5da;
        }
    }

    &:hover,
    &:focus {
        padding: 1.25rem;
        border: 0 solid #005a9c;
        background-color: #def;
        cursor: pointer;
    }

    &[aria-expanded='true']::after {
        content: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9.148' viewBox='0 0 16 9.148'%3e%3cpath d='M14.19,17.637l6.05-6.055a1.139,1.139,0,0,1,1.615,0,1.153,1.153,0,0,1,0,1.62L15,20.062a1.141,1.141,0,0,1-1.577.033l-6.9-6.888a1.144,1.144,0,0,1,1.615-1.62Z' transform='translate(22.188 20.395) rotate(180)' fill='%23969696'/%3e%3c/svg%3e");
        position: absolute;
        right: 1.25rem;
    }

    &[aria-expanded='false']::after {
        content: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='16' height='9.148' viewBox='0 0 16 9.148'%3e%3cpath d='M14.19,17.637l6.05-6.055a1.139,1.139,0,0,1,1.615,0,1.153,1.153,0,0,1,0,1.62L15,20.062a1.141,1.141,0,0,1-1.577.033l-6.9-6.888a1.144,1.144,0,0,1,1.615-1.62Z' transform='translate(-6.188 -11.246)' fill='%23969696'/%3e%3c/svg%3e");
        position: absolute;
        right: 1.25rem;
    }
`;

const DisclosureContainer = styled.div`
    display: ${({ show }) => (show ? 'block' : 'none')};

    background-color: #f8f9fa;
    padding: 1.25rem;
    border-top: 1px solid #d3d5da;

    > span {
        display: block;
        margin-bottom: 1rem;
    }

    // Add Test Plan to Test Queue button
    > button {
        display: flex;
        padding: 0.5rem 1rem;
        margin-top: 1rem;
        margin-left: auto;
        margin-right: 0;
    }

    .disclosure-row-manage-ats {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;

        .ats-container {
            grid-column: 1 / span 2;
        }

        .at-versions-container {
            display: flex;
            flex-direction: column;
            grid-column: 3 / span 3;
        }

        .disclosure-buttons-row {
            display: flex;
            flex-direction: row;
            justify-content: flex-start;

            > button {
                margin: 0;
                padding: 0;
                color: #275caa;
                border: none;
                background-color: transparent;

                &:nth-of-type(2) {
                    margin-left: auto;
                }

                // remove button
                &:nth-of-type(3) {
                    margin-left: 1rem;
                    color: #ce1b4c;
                }
            }
        }
    }

    .disclosure-row-test-plans {
        display: grid;
        grid-auto-flow: column;
        grid-template-columns: 1fr 1fr 1fr 1fr;
        grid-gap: 1rem;
    }

    .disclosure-form-label {
        font-weight: bold;
        font-size: 1rem;
    }
`;

const ManageTestQueue = ({ ats = [] }) => {
    const [showManageATs, setShowManageATs] = useState(false);
    const [showAddTestPlans, setShowAddTestPlans] = useState(false);
    const [selectedManageAtId, setSelectedManageAtId] = useState('');
    const [selectedManageAtVersions, setSelectedManageAtVersions] = useState(
        []
    );
    const [selectedManageAtVersion, setSelectedManageAtVersion] = useState('');

    const onManageAtsClick = () => setShowManageATs(!showManageATs);
    const onAddTestPlansClick = () => setShowAddTestPlans(!showAddTestPlans);

    useEffect(() => {
        if (ats.length) {
            setSelectedManageAtId(ats[0].id);
            setSelectedManageAtVersions(ats[0].atVersions);
            setSelectedManageAtVersion(ats[0].atVersions[0]);
        }
    }, [ats]);

    const onManageAtChange = e => {
        const { value } = e.target;
        if (selectedManageAtId !== value) {
            setSelectedManageAtId(value);
            const at = ats.find(item => item.id === value);
            setSelectedManageAtVersions(at.atVersions);
            setSelectedManageAtVersion(at.atVersions[0]);
        }
    };

    const onManageAtVersionChange = e => {
        const { value } = e.target;
        setSelectedManageAtVersion(value);
    };

    return (
        <Container>
            <DisclosureButton
                type="button"
                aria-expanded={showManageATs}
                aria-controls="id_manage_ats"
                onClick={onManageAtsClick}
            >
                Manage Assistive Technology Versions
            </DisclosureButton>
            <DisclosureContainer id="id_manage_ats" show={showManageATs}>
                <span>
                    Select an Assistive Technology and manage its versions in
                    the ARIA-AT App
                </span>
                <div className="disclosure-row-manage-ats">
                    <Form.Group className="ats-container">
                        <Form.Label className="disclosure-form-label">
                            Assistive Technology
                        </Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedManageAtId}
                            onChange={onManageAtChange}
                        >
                            {ats.map(item => (
                                <option
                                    key={`${item.name}-${item.id}`}
                                    value={item.id}
                                >
                                    {item.name}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>
                    <div className="at-versions-container">
                        <Form.Group>
                            <Form.Label className="disclosure-form-label">
                                Available Versions
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedManageAtVersion}
                                onChange={onManageAtVersionChange}
                            >
                                {selectedManageAtVersions.map(item => (
                                    <option
                                        key={`${selectedManageAtId}-${item}`}
                                        value={item}
                                    >
                                        {item}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <div className="disclosure-buttons-row">
                            <button>Add a New Version</button>
                            <button>
                                <FontAwesomeIcon icon={faEdit} />
                                Edit
                            </button>
                            <button>
                                <FontAwesomeIcon icon={faTrashAlt} />
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            </DisclosureContainer>
            <DisclosureButton
                type="button"
                aria-expanded={showAddTestPlans}
                aria-controls="id_test_plans"
                onClick={onAddTestPlansClick}
            >
                Add Test Plans to the Test Queue
            </DisclosureButton>
            <DisclosureContainer id="id_test_plans" show={showAddTestPlans}>
                <span>
                    Select a Test Plan and version and an Assistive Technology
                    and Browser to add it to the Test Queue
                </span>
                <div className="disclosure-row-test-plans">
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Test Plan
                        </Form.Label>
                        <Form.Control as="select"></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Test Plan Version
                        </Form.Label>
                        <Form.Control as="select"></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Assistive Technology
                        </Form.Label>
                        <Form.Control as="select"></Form.Control>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label className="disclosure-form-label">
                            Browser
                        </Form.Label>
                        <Form.Control as="select"></Form.Control>
                    </Form.Group>
                </div>
                <Button variant="primary">Add Test Plan to Test Queue</Button>
            </DisclosureContainer>
        </Container>
    );
};

ManageTestQueue.propTypes = {
    ats: PropTypes.array
};

export default ManageTestQueue;
