import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import CategorySmall from './CategorySmall';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import { l, c, CategoryOuter } from './GlobalStyles';

const CategoryMinor = ({ 
	key,
	panelID,
	dataType,
	userType,
	cat,
	algoEffs,
	hoveredEntry,
	setHoveredEntry,
	showTopicHighlight,
	bipolarColor,
	minorPrefMeasure,
	minorPrefAmpScale,
	miscalibrationScale
}) => {

	return (
	  <CategoryOuter 
	  	className={'minor_category_wrapper'}
		  style={{ backgroundColor: minorPrefAmpScale(minorPrefMeasure) }}
	  >
			{panelID === 'predUser' && (
				<TooltipForAlgoEff
					algoEff={algoEffs.stereotype}
				/>
			)}
			{cat.isSmall ? (
				<Category
					key={key}
					panelID={panelID} 
					dataType={dataType} 
					userType={userType} 
					cat={cat} 
					hoveredEntry={hoveredEntry}
					setHoveredEntry={setHoveredEntry}
					showTopicHighlight={showTopicHighlight}
					bipolarColor={bipolarColor}
					miscalibrationScale={miscalibrationScale}
				/>)
				: (<CategorySmall
						key={key}
						panelID={panelID} 
						dataType={dataType} 
						userType={userType} 
						cat={cat} 
						hoveredEntry={hoveredEntry}
						setHoveredEntry={setHoveredEntry}
						showTopicHighlight={showTopicHighlight}
						bipolarColor={bipolarColor}
						miscalibrationScale={miscalibrationScale}
				/>)
			}
	  </CategoryOuter>
	);
};

export default CategoryMinor;