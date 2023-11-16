/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import FocusTrapper from '../components/common/FocusTrapper';

describe('FocusTrapper', () => {
    let trappedDiv;

    beforeEach(() => {
        trappedDiv = document.createElement('div');
        trappedDiv.id = 'trapped-div';
        document.body.appendChild(trappedDiv);
    });

    afterEach(() => {
        document.body.removeChild(trappedDiv);
    });

    const renderEls = async () => {
        return render(
            <FocusTrapper isActive={true} trappedElId="trapped-div">
                <button>Click Me</button>
                <a href="www">Link</a>
            </FocusTrapper>,
            { container: document.body.appendChild(trappedDiv) }
        );
    };

    it('should identify focusable elements', async () => {
        await renderEls();

        const focusables = trappedDiv.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        // Two original focusable elements plus 2 for before and after trap
        expect(focusables.length).toBe(4);
    });

    it('should trap focus and allow forward navigation when isActive is true', async () => {
        await renderEls();

        const container = document.getElementById('trapped-div');

        const firstFocusable = container.querySelector('button');
        const lastFocusable = container.querySelector('a');

        act(() => {
            lastFocusable.focus();
        });

        act(() => {
            fireEvent.keyDown(container, {
                key: 'Tab',
                code: 9,
                shiftKey: false
            });
        });

        expect(document.activeElement).toBe(firstFocusable);
    });

    it('should trap focus when and allow backward navigation when isActive is true', async () => {
        await renderEls();

        const container = document.getElementById('trapped-div');

        const firstFocusable = container.querySelector('button');
        const lastFocusable = container.querySelector('a');

        act(() => {
            firstFocusable.focus();
        });

        act(() => {
            fireEvent.keyDown(container, {
                key: 'Tab',
                code: 9,
                shiftKey: true
            });
        });

        expect(document.activeElement).toBe(lastFocusable);
    });

    it('should not trap focus when isActive is false', async () => {
        const { container } = render(
            <FocusTrapper isActive={false} trappedElId="trapped-div">
                <button>Click Me</button>
                <input type="text" />
            </FocusTrapper>,
            { container: document.body.appendChild(trappedDiv) }
        );

        const firstFocusable = container.querySelector('button');
        const lastFocusable = container.querySelector('input');

        act(() => {
            firstFocusable.focus();
        });

        act(() => {
            fireEvent.keyDown(container, {
                key: 'Tab',
                code: 9,
                shiftKey: true
            });
        });

        expect(document.activeElement).not.toBe(lastFocusable);
    });
});
