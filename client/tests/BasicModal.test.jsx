/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import BasicModal from '../components/common/BasicModal';

const MockCustomComponent = ({ customProp }) => <button>{customProp}</button>; // eslint-disable-line react/prop-types

describe('BasicModal', () => {
    test('renders modal when show is true', () => {
        render(
            <BasicModal show={true} title="Test title" content="Test content" />
        );
        expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    test('does not render modal when show is false', () => {
        render(
            <BasicModal
                show={false}
                title="Test title"
                content="Test content"
            />
        );
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders title and content correctly', () => {
        render(
            <BasicModal show={true} title="My Title" content="My Content" />
        );
        expect(screen.getByText('My Title')).toBeInTheDocument();
        expect(screen.getByText('My Content')).toBeInTheDocument();
    });

    test('multiple action buttons trigger correct functions', () => {
        const saveFunction = jest.fn();
        const deleteFunction = jest.fn();
        render(
            <BasicModal
                show={true}
                title="Test title"
                content="Test content"
                actions={[
                    { label: 'Save', onClick: saveFunction },
                    { label: 'Delete', onClick: deleteFunction }
                ]}
            />
        );
        fireEvent.click(screen.getByText('Save'));
        fireEvent.click(screen.getByText('Delete'));
        expect(saveFunction).toHaveBeenCalledTimes(1);
        expect(deleteFunction).toHaveBeenCalledTimes(1);
    });

    test('close button triggers handleClose function', () => {
        const handleClose = jest.fn();
        render(
            <BasicModal
                show={true}
                handleClose={handleClose}
                title="Test title"
                content="Test content"
            />
        );
        fireEvent.click(screen.getByText('Cancel'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });

    test('cancel button triggers handleClose function when cancelButton is true', () => {
        const handleClose = jest.fn();
        render(
            <BasicModal
                show={true}
                handleClose={handleClose}
                cancelButton={true}
                title="Test title"
                content="Test content"
            />
        );
        fireEvent.click(screen.getByText('Cancel'));
        expect(handleClose).toHaveBeenCalledTimes(1);
    });
    test('renders custom component in actions', () => {
        render(
            <BasicModal
                show={true}
                title="Test title"
                content="Test content"
                actions={[
                    {
                        component: MockCustomComponent,
                        props: { customProp: 'Custom Button' }
                    }
                ]}
            />
        );

        expect(screen.getByText('Custom Button')).toBeInTheDocument();
    });

    test('custom component triggers appropriate action', () => {
        const customAction = jest.fn();

        render(
            <BasicModal
                show={true}
                title="Test title"
                content="Test content"
                actions={[
                    {
                        component: () => (
                            <button onClick={customAction}>
                                Custom Action
                            </button>
                        ),
                        props: {}
                    }
                ]}
            />
        );

        fireEvent.click(screen.getByText('Custom Action'));
        expect(customAction).toHaveBeenCalledTimes(1);
    });
});
