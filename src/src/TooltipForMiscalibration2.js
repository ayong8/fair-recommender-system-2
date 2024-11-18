import React from 'react';
import { Tooltip, Typography } from '@mui/material';
import IconForMiscalibration from './IconForMiscalibration';
import * as d3 from 'd3';
import _ from 'lodash';

const TooltipForMiscalibration2 = ({ 
	cat,
	miscalibrationScale 
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
		  {!cat.isSmall ? (<IconForMiscalibration 
				style={{
					position: 'absolute',
					left: '5px',
					top: '2.5%',
					// transform: 'translateY(-50%)',
					fontSize: '25px',
					color: d3.color(miscalibrationScale(cat.measures.miscalibration)).darker(0.5),
					zIndex: 1000
				}}
		  />) : (<IconForMiscalibration 
				style={{
					position: 'absolute',
					right: '5px',
					top: '2.5%',
					// transform: 'translateY(-50%)',
					fontSize: '25px',
					color: d3.color(miscalibrationScale(cat.measures.miscalibration)).darker(0.5),
					zIndex: 1000
				}}
		/>)}
		</Tooltip>
	);
}

export default TooltipForMiscalibration2;