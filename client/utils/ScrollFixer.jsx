import PropTypes from 'prop-types';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Fixes scroll issues inherent in single page apps such as jumping the scroll
 * to the element in the hash and jumping the scroll to the top of the page when
 * switching pages. Use this component to wrap rendered components, but note
 * that it must be inside React Router's Router component.
 */
const ScrollFixer = ({ children }) => {
  const location = useLocation();

  useLayoutEffect(() => {
    const scrollTop = () => {
      window.scroll(0, 0);
      // When switching pages, the focus should jump to the top. Otherwise
      // screen readers' focus might be lingering in a nonsensical
      // location partly down the page.
      document.querySelector('a').focus();
    };
    if (!location.hash) return scrollTop();
    (async () => {
      // The point at which the window jumping down the page would become
      // disorienting. This must include time for the page's API requests
      // to complete.
      const timeout = 8000;
      const element = await pollForElement(location.hash, { timeout });
      if (!element) return scrollTop();
      element.scrollIntoView();
      element.focus();
    })();
  }, [location]);

  return children;
};

ScrollFixer.propTypes = {
  children: PropTypes.node.isRequired
};

const pollForElement = async (selector, { timeout }) => {
  let element = document.querySelector(selector);
  if (element) return element;

  let timeoutExceeded = false;
  window.setTimeout(() => {
    timeoutExceeded = true;
  }, timeout);

  return new Promise(resolve => {
    const interval = window.setInterval(() => {
      element = document.querySelector(selector);

      if (element) {
        clearInterval(interval);
        resolve(element);
        return;
      }

      if (timeoutExceeded) {
        clearInterval(interval);
        resolve(null);
      }
    }, 10);
  });
};

export default ScrollFixer;
