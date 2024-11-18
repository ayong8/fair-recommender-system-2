import * as React from 'react';
import { SvgIcon as MuiSvgIcon, styled } from '@mui/material';

const SvgIcon = styled(MuiSvgIcon, {
  name: 'CategoryIcon',
  shouldForwardProp: (prop) => prop !== 'fill',
})(() => ({
  fill: 'white',
  stroke: 'black',
  strokeWidth: '3px',
}));

SvgIcon.defaultProps = {
  viewBox: '0 0 100 100',
  focusable: 'false',
  'aria-hidden': 'true',
};

const IconForStereotype = (props) => {
  return (
    <SvgIcon 
      className="icon_for_miscalibration" 
      {...props}
    >
      <circle 
        cx="50" 
        cy="50" 
        r="45" 
        fill="white"
        fill-opacity="0.5" 
        stroke="currentColor" 
        stroke-width="6"
      />
      {/* single user */}
      <path d="M22 35 
           A7.5 7.5 0 0 1 22 50
           A7.5 7.5 0 0 1 22 35
           M12 62
           A10 10 0 0 1 32 62" 
        fill="none" 
        stroke="currentColor" 
        stroke-width="5" 
        stroke-linecap="round"/>
      {/* arrow */}
      <path 
        d="M35 50 L55 50 M48 44 L55 50 L48 56" 
        fill="currentColor" 
        stroke="currentColor" 
        stroke-width="3.5" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />
      <path d="M65 42
              A5 5 0 0 1 65 52
              A5 5 0 0 1 65 42
              M58 62
              A7 7 0 0 1 72 62" 
            fill="currentColor" 
            stroke="currentColor" 
            stroke-width="4" 
            stroke-linecap="round"/>
      
      <path d="M73 30
              A5 5 0 0 1 73 40
              A5 5 0 0 1 73 30" 
            fill="currentColor" 
            stroke="currentColor" 
            stroke-width="4" 
            stroke-linecap="round"/>
      
      <path d="M81 42
              A5 5 0 0 1 81 52
              A5 5 0 0 1 81 42
              M74 62
              A7 7 0 0 1 88 62" 
            fill="currentColor" 
            stroke="currentColor" 
            stroke-width="4" 
            stroke-linecap="round"/>
    </SvgIcon>
  );
};

export default IconForStereotype;