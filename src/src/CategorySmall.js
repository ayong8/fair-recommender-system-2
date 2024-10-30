import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import Topic from './Topic';
import TooltipForCategory from './TooltipForCategory';
import { l, c, highlightCategoryBorder, fontSizeScale } from './GlobalStyles';
import { adjustCategorySize } from './util/util'; // Import the shared function

const CategorySmallWrapper = styled.div.attrs({
	className: 'category_small_wrapper'
})`
	  border: 2px white solid;
	  border-radius: 5px;
	  text-align: center;
	  font-size: 0.8rem;
	  overflow-y: scroll;
  `;
  
const CategoryContentWrapper = styled.div`
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-left: 5px; 
	flex-direction: row;
`;
  
const CategoryName = styled.div`
	display: flex;
	justify-content: center;
	flex-direction: column;
	height: calc(100% - 45px);
`;
  
const TopicsContainer = styled.div`
	display: flex;
	align-items: flex-end;
	justify-content: flex-start;
	flex-direction: row;
	height: 100%;
`;
  
const CategoryOnlyWrapper = styled.div`
	display: flex;
	height: 100%;
	justify-content: center; // Changed from flex-end to center
	align-items: center; // Added to center vertically
`;
  
const CategoryNameOnly = styled.div`
	line-height: 1.2; // Changed from 250% to 1.2 for better readability
	text-align: center; // Added to ensure horizontal centering
`;

const CategorySmall = ({ 
	cat, 
	panelID, 
	selectedEntry,
	hoveredEntry, 
	setSelectedEntry,
	setHoveredEntry, 
	showTopicHighlight, 
	bipolarColor,
	minorPrefMeasure,
	miscalibrationScale,
	expandedCategories,
	setExpandedCategories,
	expandedFactor = 1
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);
  
	const colorCategory = (cat, bipolarColor, miscalibrationScale, panelID) => {
		return miscalibrationScale(cat.measures.miscalibration);
	};
  
	// Render functions
	const renderAllTopicsOnMouseover = (cat) => (
		cat.topics.map(topic => (
		  <Topic
			topic={topic}
			cat={cat}
			key={topic.name}
		  />
		))
	  );
  
	const renderCategoryWithTopTopics = (cat) => (
	  <CategoryContentWrapper>
		<CategoryName 
			style={{ fontSize: fontSizeScale(cat.ratio) }}
		>
          {_.capitalize(cat.name)}
        </CategoryName>
        <TopicsContainer>
		  {cat.topics.slice(0, 2).map(topic => (
			<Topic 
			  topic={topic}
			  cat={cat}
			  isSmallCategory={cat.isSmall}
			  key={topic.name}
			/>
		  ))}
		</TopicsContainer>
	  </CategoryContentWrapper>
	);
  
	const renderCategoryOnly = (cat) => (
		<CategoryOnlyWrapper>
		  <CategoryNameOnly 
		  	fontSize={fontSizeScale(cat.ratio)}
		  >
			{_.capitalize(cat.name)}
		  </CategoryNameOnly>
		</CategoryOnlyWrapper>
	  );

	const handleResize = (delta, e) => {
		e.stopPropagation();
		adjustCategorySize(delta, expandedFactor, setExpandedCategories, cat);
	};

	return (
	  <CategorySmallWrapper
			style={{
				width: panelID == 'predUser' ? '120px' : '100px',
				height: l.cd.h * cat.ratio + expandedFactor,
				minHeight: '20px',
				backgroundColor: colorCategory(cat, bipolarColor, miscalibrationScale, panelID),
				border: highlightCategoryBorder(cat, hoveredEntry, selectedEntry),
				position: 'relative'
			}}
			className={`${panelID} ${cat.name}`}
			onMouseOver={() => {
				console.log('cat: ', panelID, cat);
				setShowTopicsForCategory(false);
				setHoveredEntry(cat);
			}}
			onMouseOut={() => {
				setShowTopicsForCategory(false);
				setHoveredEntry('');
			}}
			onClick={() => {
				setSelectedEntry(selectedEntry.name === cat.name ? {} : cat);
			}}
	  >
		<TooltipForCategory
			cat={cat}
		/>
		{showTopicHighlight
		  ? (showTopicsForCategory ? 
			renderAllTopicsOnMouseover(cat) 
			: renderCategoryWithTopTopics(cat))
		  : renderCategoryOnly(cat)
		}
	  </CategorySmallWrapper>
	);
};

export default CategorySmall;
