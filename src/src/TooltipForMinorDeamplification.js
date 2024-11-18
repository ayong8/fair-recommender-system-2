import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import IconForMinorDeamplification from './IconForMinorDeamplification';
import * as d3 from 'd3';
import _ from 'lodash';

const TooltipForMinorDeamplification = ({ 
	cat,
	filterBubbleScale 
}) => {
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
		  <IconForMinorDeamplification 
				style={{
					position: 'relative',
					left: '0px',
					top: '50%',
					// transform: 'translateY(-50%)',
					fontSize: '25px',
					color: d3.color(filterBubbleScale(cat.measures.filterBubble)).darker(0.5),
					zIndex: 1000
				}}
		  />
		</Tooltip>
	);
}

export default TooltipForMinorDeamplification;