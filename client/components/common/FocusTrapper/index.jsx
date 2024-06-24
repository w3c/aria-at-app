import React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';

const FocusTrapper = ({ children, isActive, initialFocusRef, trappedElId }) => {
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
    // When SHIFT + TAB is pressed and the active element is the first focusable element
    if (
      event.shiftKey &&
      (document.activeElement === firstFocusableEl ||
        document.activeElement === focusableEls[0] ||
        document.activeElement === initialFocusRef.current)
    ) {
      lastFocusableEl.focus();
      event.preventDefault();
    }
    // When TAB is pressed and the active element is the last focusable element
    else if (
      !event.shiftKey &&
      (document.activeElement === lastFocusableEl ||
        document.activeElement === focusableEls[focusableEls.length - 1])
    ) {
      firstFocusableEl.focus();
      event.preventDefault();
    }
  };

  useEffect(() => {
    if (isActive) {
      updateFocusableElements();
      document.addEventListener('keydown', trapFocus);
    } else {
      document.removeEventListener('keydown', trapFocus);
      focusableElsRef.current = [];
    }

    return () => {
      focusableElsRef.current = [];
      document.removeEventListener('keydown', trapFocus);
    };
  }, [isActive]);

  return <div>{children}</div>;
};

FocusTrapper.propTypes = {
  children: PropTypes.node.isRequired,
  isActive: PropTypes.bool.isRequired,
  trappedElId: PropTypes.string.isRequired,
  initialFocusRef: PropTypes.shape({
    current: PropTypes.object
  })
};

export default FocusTrapper;
