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

const IconForMiscalibration = (props) => {
  return (
    <SvgIcon 
      className="icon_for_miscalibration" 
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

      <path d="M6 8 L18 8" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round"/>
  
      <path d="M6 12 L18 12" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round"/>
                
      <path d="M7 16 L17 4" 
        stroke="currentColor" 
        strokeWidth="2.5"
        strokeLinecap="round"/>
    </SvgIcon>
  );
};

export default IconForMiscalibration;