// Code adatped from the "manual" installation instructions on "Tooltip -
// shadcn/ui"
// https://ui.shadcn.com/docs/components/tooltip
import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import PropTypes from 'prop-types';
import './Tooltip.module.css';

function TooltipProvider({ delayDuration = 0, ...props }) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

TooltipProvider.propTypes = {
  delayDuration: PropTypes.number
};

function Tooltip({ ...props }) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({ sideOffset = 0, children, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className="aria-at-tooltip-content"
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="aria-at-tooltip-arrow" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

TooltipContent.propTypes = {
  children: PropTypes.node.isRequired,
  sideOffset: PropTypes.number
};

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
