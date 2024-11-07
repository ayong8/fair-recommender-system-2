import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import _ from 'lodash';

const TooltipForCategory = ({ cat }) => {
	const renderMeasures = () => {
		return Object.entries(cat.measures).map(([name, value], index) => (
			<div key={index}>{name}: {_.round(value, 2)}</div>
		  ));
	  };

	return (
		<Tooltip 
		  title={
		    <React.Fragment>
		      <Typography color="inherit">Category Information</Typography>
		      {renderMeasures(cat)}
		    </React.Fragment>
		  } 
		  arrow 
		  placement="top"
		>
		  <CircleIcon 
				style={{
					position: 'absolute',
					left: '-7px',
					top: '50%',
					transform: 'translateY(-50%)',
					fontSize: '14px',
					color: 'rgba(0, 0, 0, 0.5)',
					zIndex: 1000,
					fill: 'white',
					stroke: 'black',
    				strokeWidth: 2
				}}
		  />
		</Tooltip>
	);
}

export default TooltipForCategory;