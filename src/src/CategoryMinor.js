import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import { l, c, CategoryWrapper } from './GlobalStyles';
import CategoryMinorSmall from './CategoryMinorSmall';

const CategoryMinor = ({ 
	key,
	panelID,
	dataType,
	userType,
	cat,
	selectedEntry,
	setSelectedEntry,
	showTopicHighlight,
	bipolarColorScale,
	minorPrefMeasure
}) => {
	const minorPrefAmpScale = d3.scaleLinear()
		.domain([2, 0, -2])
		.range(['red', 'whitesmoke', 'green']);

	return (
	  <div 
	  	className={'minor_category_wrapper'}
		  style={{ 
			backgroundColor: minorPrefAmpScale(minorPrefMeasure),
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
		{cat.isSmall ? (
			<Category
				key={key}
				panelID={panelID} 
				dataType={dataType} 
				userType={userType} 
				cat={cat} 
				selectedEntry={selectedEntry}
				setSelectedEntry={setSelectedEntry}
				showTopicHighlight={showTopicHighlight}
				bipolarColorScale={bipolarColorScale}
			/>)
			: (<CategoryMinorSmall
					key={key}
					panelID={panelID} 
					dataType={dataType} 
					userType={userType} 
					cat={cat} 
					selectedEntry={selectedEntry}
					setSelectedEntry={setSelectedEntry}
					showTopicHighlight={showTopicHighlight}
					bipolarColorScale={bipolarColorScale}
			/>)
		}
	  </div>
	);
  };

export default CategoryMinor;