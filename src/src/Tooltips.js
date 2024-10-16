import React, { useEffect, useState } from 'react';
import { Tooltip, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
  
import _ from 'lodash';

const Tooltips = ({
	cat
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
		  <MoreHorizIcon 
			style={{
			  position: 'absolute',
			  top: '2px',
			  right: '2px',
			  fontSize: '14px',
			  color: 'rgba(0, 0, 0, 0.5)',
			}}
		  />
		</Tooltip>
	);
}

export default Tooltips;