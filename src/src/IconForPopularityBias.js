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

const IconForPopularityBias = (props) => {
  return (
    <SvgIcon 
      className="icon_for_miscalibration" 
      {...props}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <circle 
          cx="50" 
          cy="50" 
          r="40" 
          fill="white"
          fill-opacity="1" 
          stroke="currentColor" 
          strokeWidth="8"
        />
        <path 
          d="M30 45 L50 25 L70 45 M50 25 L50 75" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    </SvgIcon>
  );
};

export default IconForPopularityBias;