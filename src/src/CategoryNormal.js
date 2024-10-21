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
	selectedEntry,
	setSelectedEntry,
	showTopicHighlight,
	bipolarColor,
	majorPrefMeasure
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
				selectedEntry={selectedEntry}
				setSelectedEntry={setSelectedEntry}
				showTopicHighlight={showTopicHighlight}
				bipolarColor={bipolarColor}
			/>
	  </CategoryOuter>
	);
};

export default CategoryNormal;