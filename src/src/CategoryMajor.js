import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import { l, c, CategoryWrapper } from './GlobalStyles';

const CategoryMajor = ({ 
	key,
	panelID,
	dataType,
	userType,
	cat,
	selectedEntry,
	setSelectedEntry,
	showTopicHighlight,
	bipolarColorScale,
	majorPrefMeasure
}) => {
	const majorPrefAmpScale = d3.scaleLinear()
		.domain([2, 0, -2])
		.range(['red', 'whitesmoke', 'green']);

	return (
	  <div 
	  	className={'major_category_wrapper'}
		  style={{ 
			backgroundColor: majorPrefAmpScale(majorPrefMeasure),
			position: 'relative', // Keep this
			paddingRight: '15px' // Add padding to accommodate the icon
		}}
	  >
		<Tooltip title="Help information goes here">
			<HelpOutlineIcon 
				style={{
					position: 'absolute',
					top: '2px',
					right: '2px',
					fontSize: '13px',
					color: '#666',
					cursor: 'pointer'
				}}
			/>
		</Tooltip>
		<Category
			// style={{ backgroundColor: 
			// 	majorPrefAmpScale(majorPrefMeasure) 
			// }}
			key={key}
			panelID={panelID} 
			dataType={dataType} 
			userType={userType} 
			cat={cat} 
			selectedEntry={selectedEntry}
			setSelectedEntry={setSelectedEntry}
			showTopicHighlight={showTopicHighlight}
			bipolarColorScale={bipolarColorScale}
		>
			
		</Category>
	  </div>
	);
  };

export default CategoryMajor;