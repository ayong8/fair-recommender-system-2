import React, { useEffect, useState } from 'react';
import _ from 'lodash';

import Category from './Category';
import { l, c, CategoryOuter } from './GlobalStyles';

const CategoryNormal = ({ 
	key,
	panelID,
	dataType,
	userType,
	cat,
	hoveredEntry,
	setHoveredEntry,
	showTopicHighlight,
	bipolarColor,
	miscalibrationScale
}) => {

	return (
	  <CategoryOuter 
	  	className={'normal_category_wrapper'}
	  >
			<Category
				// style={{ backgroundColor: 
				// 	majorPrefAmpScale(majorPrefMeasure) 
				// }}
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

export default CategoryNormal;