import { useEffect, useRef } from 'react';

/**
 * Hook to manage focus behavior in the test renderer. Automatically focuses the first
 * element that needs attention after submission, including elements with focus flags,
 * incomplete assertions, and negative side effects sections. Uses MutationObserver to
 * wait for DOM updates and has a 5-second timeout.
 *
 * @param {boolean} isSubmitted - True when the form has been submitted
 * @param {Object} pageContent - The page content object containing results.commands array
 * @returns {void}
 */
const useTestRendererFocus = (isSubmitted, pageContent) => {
  const focusHandledRef = useRef(false);
  const observerRef = useRef(null);
  const timeoutRef = useRef(null);

  const findAndFocusElement = () => {
    if (!pageContent?.results?.commands) return false;

    for (
      let commandIndex = 0;
      commandIndex < pageContent.results.commands.length;
      commandIndex++
    ) {
      const command = pageContent.results.commands[commandIndex];

      if (command.atOutput.focus) {
        const outputElement = document.getElementById(
          `speechoutput-${commandIndex}`
        );
        if (outputElement) {
          outputElement.focus();
          return true;
        }
      }

      const incompleteAssertionIndex = command.assertions.findIndex(
        assertion => assertion.passed === null
      );
      if (incompleteAssertionIndex >= 0) {
        const firstRadioButton = document.querySelector(
          `input[data-testid="radio-yes-${commandIndex}-${incompleteAssertionIndex}"]`
        );
        if (firstRadioButton) {
          firstRadioButton.focus();
          return true;
        }
      }

      // Check if negative side effects section needs focus
      const negativeSideEffects = command.negativeSideEffects;
      if (negativeSideEffects.description[1].highlightRequired) {
        const firstUnexpectedRadio = document.getElementById(
          `problem-${commandIndex}-true`
        );
        if (firstUnexpectedRadio) {
          firstUnexpectedRadio.focus();
          return true;
        }
      }

      // Check if negative side effects details sections need focus
      if (negativeSideEffects.failChoice?.options?.options) {
        for (const option of negativeSideEffects.failChoice.options.options) {
          if (option.more?.description?.[1]?.highlightRequired) {
            const optionDescription = option.description
              .toLowerCase()
              .replace(/,/g, '')
              .replace(/\./g, '')
              .replace(/\s+/g, '-')
              .replace(/--+/g, '-')
              // Actual element class name may have a forward slash
              // This is the case with the "Excessively verbose..." option
              // Forward slash is not allowed in a query selector
              .replace(/\//g, '\\/');
            const detailsElement = document.querySelector(
              `.negative-side-effect-${optionDescription}-details`
            );
            if (detailsElement) {
              detailsElement.focus();
              return true;
            }
          }
        }
      }
    }
    return false;
  };

  const attemptFocus = () => {
    if (findAndFocusElement()) {
      cleanup();
      return;
    }

    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        if (findAndFocusElement()) {
          cleanup();
        }
      });

      observerRef.current.observe(document.body, {
        childList: true,
        subtree: true
      });
    }
  };

  const cleanup = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    if (isSubmitted && pageContent && !focusHandledRef.current) {
      focusHandledRef.current = true;

      requestAnimationFrame(() => {
        attemptFocus();

        timeoutRef.current = setTimeout(() => {
          cleanup();
        }, 5000);
      });
    }
  }, [isSubmitted, pageContent]);

  useEffect(() => {
    if (!isSubmitted) {
      focusHandledRef.current = false;
      cleanup();
    }
  }, [isSubmitted]);

  useEffect(() => {
    return cleanup;
  }, []);
};

export default useTestRendererFocus;
