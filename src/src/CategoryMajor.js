import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import { l, c, CategoryOuter } from './GlobalStyles';

const CategoryMajor = ({ 
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
	majorPrefMeasure,
	majorPrefAmpScale,
	miscalibrationScale
}) => {

	return (
	  <CategoryOuter 
	  	className={'major_category_wrapper'}
			style={{ backgroundColor: majorPrefAmpScale(majorPrefMeasure) }}
	  >
			{panelID === 'predUser' && (
				<TooltipForAlgoEff
					algoEff={algoEffs.filterBubble}
				/>
			)}
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
			/>
	  </CategoryOuter>
	);
  };

export default CategoryMajor;