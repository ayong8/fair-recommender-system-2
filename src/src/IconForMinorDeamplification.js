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
  viewBox: '0 0 24 24',
  focusable: 'false',
  'aria-hidden': 'true',
};

const IconForMinorDeamplification = (props) => {
  return (
    <SvgIcon 
      className="icon_for_filter_bubble" 
      {...props}
    >
      <circle 
        cx="12" 
        cy="10" 
        r="9.5" 
        stroke="currentColor" 
        strokeWidth="2"
        fill="white"
        fill-opacity="1"
      />

      {/* top diagonal line */}
      <path d="M11 4 L17 8"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="square"/>
  
      {/* minus sign */}
      <path d="M7 10 L13 10"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="square"/>
      
      {/* bottom diagonal line */}
      <path d="M11 16 L17 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="square"/>
    </SvgIcon>
  );
};

export default IconForMinorDeamplification;