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

const IconForMajorAmplification = (props) => {
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
        fill-opacity="0.5"
      />

      {/* top diagonal line */}
      <path d="M7 8 L13 4" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="square"/>
      {/* plus sign */}
      <path d="M12 10 L18 10 M15 7 L15 13" 
            stroke="currentColor" 
            strokeWidth="3" 
            strokeLinecap="square"/>
      {/* bottom diagonal line */}
      <path d="M7 12 L13 16" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="square"/>
    </SvgIcon>
  );
};

export default IconForMajorAmplification;