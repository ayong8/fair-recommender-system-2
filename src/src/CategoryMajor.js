import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import { Tooltip, Typography } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import _ from 'lodash';
import styled from 'styled-components';

import Category from './Category';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import { l, c, majorPrefAmpScale, CategoryOuter } from './GlobalStyles';

const CategoryMajor = ({ 
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
	majorPrefMeasure
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
				bipolarColor={bipolarColor}
			/>
	  </CategoryOuter>
	);
  };

export default CategoryMajor;