import { useEffect, useRef } from 'react';

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
        const assertionFieldset = document.getElementById(
          `assertion-fieldset-${commandIndex}-${incompleteAssertionIndex}`
        );
        if (assertionFieldset) {
          assertionFieldset.focus();
          return true;
        }
      }

      const unexpectedBehaviors = command.unexpectedBehaviors;
      if (unexpectedBehaviors.description[1].highlightRequired) {
        const unexpectedFieldset = document.getElementById(
          `cmd-${commandIndex}-problems`
        );
        if (unexpectedFieldset) {
          unexpectedFieldset.focus();
          return true;
        }
      }

      if (unexpectedBehaviors.failChoice?.options?.options) {
        for (const option of unexpectedBehaviors.failChoice.options.options) {
          if (option.more?.description?.[1]?.highlightRequired) {
            const optionDescription = option.description
              .toLowerCase()
              .replace(/[^a-z0-9]/g, '-');
            const detailsElement = document.querySelector(
              `.undesirable-${optionDescription}-details`
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
