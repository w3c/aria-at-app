import React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const FocusTrapper = ({ children, isActive, trappedElId }) => {
    const focusableElsRef = useRef([]);

    const updateFocusableElements = () => {
        if (focusableElsRef.current.length > 0) return;

        // Must use getElementById because a ref is not consistently populated
        const el = document.getElementById(trappedElId);
        if (!el) return;

        focusableElsRef.current = Array.from(
            el.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
        );

        // Create two elements to trap focus before and after the dialog
        // APG Example for Dialog used as reference
        const before = document.createElement('div');
        const after = document.createElement('div');
        before.tabIndex = 0;
        after.tabIndex = 0;
        el.prepend(before);
        el.append(after);

        focusableElsRef.current.unshift(before);
        focusableElsRef.current.push(after);
    };

    const trapFocus = event => {
        const isTabPressed = event.key === 'Tab' || event.keyCode === 9;
        if (!isTabPressed) return;

        const focusableEls = focusableElsRef.current;

        // First focusable element is after the blank 'before' div
        const firstFocusableEl = focusableEls[1];
        // Last focusable element is before the blank 'after' div
        const lastFocusableEl = focusableEls[focusableEls.length - 2];

        if (event.shiftKey && document.activeElement === firstFocusableEl) {
            lastFocusableEl.focus();
            event.preventDefault();
        } else if (
            !event.shiftKey &&
            document.activeElement === lastFocusableEl
        ) {
            firstFocusableEl.focus();
            event.preventDefault();
        }
    };

    useEffect(() => {
        if (isActive) {
            updateFocusableElements();
            document.addEventListener('keydown', trapFocus);
        }

        return () => {
            document.removeEventListener('keydown', trapFocus);
        };
    }, [isActive]);

    return <div>{children}</div>;
};

FocusTrapper.propTypes = {
    children: PropTypes.node.isRequired,
    isActive: PropTypes.bool.isRequired,
    trappedElId: PropTypes.string.isRequired
};

export default FocusTrapper;
