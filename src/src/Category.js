import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';

import Topic from './Topic';
import TooltipForCategory from './TooltipForCategory';
import { l, c, highlightCategoryBorder, fontSizeScale, CategoryWrapper } from './GlobalStyles';
import { adjustCategorySize } from './util/util'; // Import the shared function

const CategoryContentWrapper = styled.div`
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0, 
  flex-direction: column;
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
  justify-content: center;
  align-items: center;
`;

const CategoryNameOnly = styled.div`
  line-height: 1.2;
  text-align: center;
`;

const ResizeControls = styled.div`
  position: absolute;
  left: 50%; // Center horizontally
  transform: translateX(-50%); // Adjust to center
  top: 47.5%; // Position at the bottom
  display: flex;
  flex-direction: row; // Ensure buttons are placed horizontally
  align-items: center; // Center align the buttons vertically
  opacity: 0;
  transition: opacity 300ms;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;

  ${CategoryWrapper}:hover & {
    opacity: 1;
  }
`;

const ResizeButton = styled.button`
  padding: 4px;
  transition: background-color 300ms;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    &:hover {
      background-color: transparent;
    }
  }

  svg {
    color: black;
  }
`;

const Divider = styled.div`
  width: 1px;
  background-color: rgba(0, 0, 0, 0.2); // Made divider more transparent
`;

const Category = ({ 
	key, 
	panelID, 
	dataType,
	userType,
	cat,
	selectedEntry,
	hoveredEntry, 
	setSelectedEntry,
	setHoveredEntry, 
	showTopicHighlight, 
	bipolarColor,
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

	const handleResize = (delta, e) => {
		e.stopPropagation(); // Prevent category selection when clicking buttons
		adjustCategorySize(delta, expandedFactor, setExpandedCategories, cat);
	};

	return (
		<CategoryWrapper
			style={{
				width: panelID == 'predUser' ? '120px' : '100px',
				height: l.cd.h * 0.8 * cat.ratio + expandedFactor, // Add expandedFactor
				minHeight: '20px',
				backgroundColor: panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, miscalibrationScale, panelID),
				border: highlightCategoryBorder(cat, hoveredEntry, selectedEntry),
			}}
			className={`${panelID} ${cat.name} group relative`}
			onMouseOver={() => {
				setShowTopicsForCategory(false);
				setHoveredEntry(cat);
			}}
			onMouseOut={() => {
				setShowTopicsForCategory(false);
				setHoveredEntry('');
			}}
			onClick={() => {
				console.log('cat: ', panelID, cat);
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
			<ResizeControls>
				<ResizeButton
					onClick={(e) => handleResize(1, e)}  // Change by +15px
					disabled={expandedFactor >= 45}  // Adjust max limit
				>
					<ChevronDown size={16} />
				</ResizeButton>
				<Divider />
				<ResizeButton
					onClick={(e) => handleResize(-1, e)}  // Change by -15px
					disabled={expandedFactor <= -45}
				>
					<ChevronUp size={16} />
				</ResizeButton>
			</ResizeControls>
		</CategoryWrapper>
	);
};

export default Category;
