import React from 'react';
import styled from '@emotion/styled';

const SkipAnchorLink = styled.a`
  left: -999px;
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: -999;

  &:focus,
  &:focus-visible,
  &:active {
    color: #fff;
    background-color: #0b60ab;
    outline: 2px solid #a9d1ff;
    outline-offset: 0;
    left: auto;
    width: initial;
    height: auto;
    overflow: auto;
    margin-top: 120px;
    padding: 5px 10px;
    border-radius: 5px;
    text-align: center;
    font-size: 1em;
    z-index: 999;
    display: inline-block;
  }
`;

const SkipLink = () => {
  return <SkipAnchorLink href="#main">Skip to main content</SkipAnchorLink>;
};

export default SkipLink;
