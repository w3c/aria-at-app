import PropTypes from 'prop-types';
import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * Fixes scroll issues inherent in single page apps such as jumping the scroll
 * to the element in the hash and jumping the scroll to the top of the page when
 * switching pages. Use this component to wrap rendered components, but note
 * that it must be inside React Router's Route component.
 */
const ScrollFixer = ({ children }) => {
    const location = useLocation();

    useLayoutEffect(() => {
        const scrollTop = () => {
            window.scroll(0, 0);
            // When switching pages, the focus should jump to the top. Otherwise
            // screen readers' focus might be lingering partly down the page.
            document.querySelector('a').focus();
        };
        if (!location.hash) return scrollTop();
        const element = document.querySelector(location.hash);
        if (!element) return scrollTop();
        element.scrollIntoView();
        element.focus();
    }, [location]);

    return children;
};

ScrollFixer.propTypes = {
    children: PropTypes.node.isRequired
};

export default ScrollFixer;
