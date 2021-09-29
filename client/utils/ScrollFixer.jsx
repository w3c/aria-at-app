import React from 'react';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';

const scrollTop = () => {
    window.scroll(0, 0);
};

/**
 * Fixes scroll issues inherent in single page apps such as jumping the scroll
 * to the element in the hash and jumping the scroll to the top of the page when
 * switching pages. Use this component to wrap rendered components, but note
 * that it must be inside React Router's Route component.
 */
const ScrollFixer = ({ children }) => {
    const location = useLocation();
    const wrapperRef = useRef();

    useEffect(() => {
        if (!location.hash) return scrollTop();
        const element = wrapperRef.current.querySelector(location.hash);
        if (!element) return scrollTop();
        element.scrollIntoView();
        element.focus();
    }, [location]);

    return <div ref={wrapperRef}>{children}</div>;
};

ScrollFixer.propTypes = {
    children: PropTypes.node.isRequired
};

export default ScrollFixer;
