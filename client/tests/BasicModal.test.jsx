/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import BasicModal from '../components/common/BasicModal/';
import '@testing-library/jest-dom/extend-expect';

describe('<BasicModal />', () => {
    it('has aria-labelledby matching the modal title id', () => {
        const { getByRole, getByText } = render(
            <BasicModal show title="Test Title" content="Test Content" />
        );

        const modal = getByRole('dialog');
        const title = getByText('Test Title');

        expect(modal).toHaveAttribute('aria-labelledby', title.id);
    });
});
