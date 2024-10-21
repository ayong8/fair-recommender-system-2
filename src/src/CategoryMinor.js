import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import CategoryMinorSmall from './CategoryMinorSmall';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import { l, c, minorPrefAmpScale, CategoryOuter } from './GlobalStyles';

const CategoryMinor = ({ 
	key,
	panelID,
	dataType,
	userType,
	cat,
	algoEffs,
	selectedEntry,
	setSelectedEntry,
	showTopicHighlight,
	bipolarColor,
	minorPrefMeasure
}) => {

	return (
	  <CategoryOuter 
	  	className={'minor_category_wrapper'}
		  style={{ backgroundColor: minorPrefAmpScale(minorPrefMeasure) }}
	  >
			{panelID === 'predUser' && (
				<TooltipForAlgoEff
					algoEff={algoEffs.filterBubble}
				/>
			)}
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
					bipolarColor={bipolarColor}
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
						bipolarColor={bipolarColor}
				/>)
			}
	  </CategoryOuter>
	);
};

export default CategoryMinor;