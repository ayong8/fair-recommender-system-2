import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import Topic from './Topic';
import TooltipForCategory from './TooltipForCategory';
import { l, c, fontSizeScale, CategoryWrapper } from './GlobalStyles';

const CategoryContentWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0, 
  flexDirection: column
`;

const CategoryName = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  height: calc(100% - 45px);
`;

const TopicsContainer = styled.div`
  display: flex;
  align-items: ${props => props.isSmallCategory ? 'flex-end' : 'stretch'};
  justify-content: ${props => props.isSmallCategory ? 'flex-start' : 'flex-end'};
  flex-direction: ${props => props.isSmallCategory ? 'row' : 'column'};
  height: ${props => props.isSmallCategory ? '100%' : 'auto'};
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

const Category = ({ 
	cat, 
	panelID, 
	selectedEntry, 
	setSelectedEntry, 
	showTopicHighlight, 
	bipolarColor 
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);

	// Helper functions
	const highlightCategoryBorder = (cat, selectedEntry) => {
	  return selectedEntry.name === cat.name 
		? '3px solid blue' 
		: (cat.isMajor ? '3px solid black' : null);
	};
  
	const colorCategory = (cat, bipolarColor, panelID) => {
		if (cat.isTopPersonalization && ['actualUser', 'predUser'].includes(panelID)) {
		  return bipolarColor.personalization;
		}
		
		if (cat.isTopDiversity && ['predOthers', 'predUser'].includes(panelID)) {
		  return bipolarColor.diversity;
		}
		
		return c[panelID];
	  };
  
	// Render functions
	const renderAllTopicsOnMouseover = () => (
		cat.topics.map(topic => (
		  <Topic
			topic={topic}
			cat={cat}
			key={topic.name}
		  />
		))
	  );
  
	const renderCategoryWithTopTopics = (cat) => (
	  <CategoryContentWrapper 
	  	style={{ 
			paddingLeft: cat.isSmall ? '5px' : '0', 
			flexDirection: cat.isSmall ? 'row' : 'column' 
		}}>
		<CategoryName 
			style={{ fontSize: fontSizeScale(cat.ratio) }}
		>
          {_.capitalize(cat.name)}
        </CategoryName>
        <TopicsContainer 
			isSmallCategory={cat.isSmall}
		>
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
				backgroundColor: colorCategory(cat, bipolarColor, panelID),
				height: l.cd.h * 0.8 * cat.ratio,
				minHeight: '20px',
				border: highlightCategoryBorder(cat, selectedEntry),
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
			<TooltipForCategory
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

export default Category;