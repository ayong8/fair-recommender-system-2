import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import Topic from './Topic';
import Tooltips from './Tooltips';
import { l, c } from './GlobalStyles';

const CategoryWrapper = styled.div.attrs({
	className: 'category_wrapper'
})`
		width: 100px;
	  // minHeight: 20px;
	  // background-color: whitesmoke;
	  border: 2px white solid;
	  border-radius: 5px;
	  text-align: center;
	  font-size: 0.8rem;
	  margin: 0 auto;
	  overflow-y: scroll;
	  // display: inline-block;
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

const CategoryMinorSmall = ({ 
	cat, 
	panelID, 
	selectedEntry, 
	setSelectedEntry, 
	showTopicHighlight, 
	bipolarColorScale,
	minorPrefMeasure
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);
	// const isSmallCategory = cat.ratio <= 0.15;
	const fontSizeScale = d3.scaleLinear().domain([0.01, 0.1, 0.15, 0.5]).range(['8px', '10px', '17px', '17px']);
  
	const colorCategory = (cat, bipolarColorScale, panelID) => {
		if (cat.isTopPersonalization && ['actualUser', 'predUser'].includes(panelID)) {
		  return bipolarColorScale.personalization;
		}
		
		if (cat.isTopDiversity && ['predOthers', 'predUser'].includes(panelID)) {
		  return bipolarColorScale.diversity;
		}
		
		return c[panelID];
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

	return (
	  <CategoryWrapper
		style={{
		  backgroundColor: colorCategory(cat, bipolarColorScale, panelID),
		  height: l.cd.h * cat.ratio,
		  minHeight: '20px',
		  position: 'relative'
		}}
		className={`${panelID} ${cat.name}`}
		onMouseOver={() => {
		  setShowTopicsForCategory(false);
		  setSelectedEntry(cat);
		}}
		onMouseOut={() => {
		  setShowTopicsForCategory(false);
		  setSelectedEntry('');
		}}
	  >
		<Tooltips
			cat={cat}
		/>
		{showTopicHighlight
		  ? (showTopicsForCategory ? 
			renderAllTopicsOnMouseover(cat) 
			: renderCategoryWithTopTopics(cat))
		  : renderCategoryOnly(cat)
		}
	  </CategoryWrapper>
	);
  };

export default CategoryMinorSmall;