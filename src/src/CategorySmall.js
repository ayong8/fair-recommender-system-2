import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import { colorContrast } from 'd3plus-color';
import { Plus, Minus } from 'lucide-react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import Topic from './Topic';
import TooltipForMiscalibration2 from './TooltipForMiscalibration2';
import TooltipForPopularityBias from './TooltipForPopularityBias';
import TooltipForFilterBubble from './TooltipForFilterBubble';
import { 
	l, 
	c, 
	highlightCategoryBorder, 
	fontSizeScale,
	MajorCategoryInActualAccent,
	MinorCategoryInActualAccent,
	MajorCategoryInOthersAccent,
	MinorCategoryInOthersAccent 
} from './GlobalStyles';
import { adjustCategorySize } from './util/util';
import { ResizeControls, ResizeButton, Divider } from './GlobalStyles';

const CategorySmallWrapper = styled.div.attrs({
	className: 'category_small_wrapper'
})`
//   border: 2px white solid;
	border-radius: 5px;
	text-align: center;
	font-size: 0.8rem;
	overflow-y: scroll;
	margin-bottom: 3px;
`;
  
const CategoryContentWrapper = styled.div`
	width: 90%;
	height: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding-left: 8px; 
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

const colorCategoryHalfAndHalf = (cat, colorScales) => {
	const miscalibrationColor = colorScales.miscalibration(cat.measures.miscalibration);
	const popularityBiasColor = colorScales.popularityBias(cat.measures.popularityBias);
	
	return `linear-gradient(to right, 
	  ${miscalibrationColor} 0%, 
	  ${miscalibrationColor} 50%, 
	  ${popularityBiasColor} 50%, 
	  ${popularityBiasColor} 100%
	)`;
  };

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
	algoEffs,
	algoEffScore,
	algoEffColorScale,
	colorScales,
	setExpandedCategories,
	expandedFactor = 1,
	handleSetCatRatioChange,
	handleAlgoEffValueAlignment
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
  
	const colorCategory = (cat, bipolarColor, algoEffScore, algoEffColorScale, panelID) => {
		return algoEffColorScale(algoEffScore);
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
			style={{ 
				fontSize: fontSizeScale(cat.ratio),
				color: colorContrast(categoryColor) 
			}}
		>
          {_.capitalize(cat.name.split('_').join(' '))}
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
			{_.capitalize(cat.name.split('_').join(' '))}
		  </CategoryNameOnly>
		</CategoryOnlyWrapper>
	  );

	const handleResize = (delta, e) => {
		e.stopPropagation();
		adjustCategorySize(delta, expandedFactor, setExpandedCategories, cat);
	};

	const categoryColor = colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID);

	return (
		<div style={{ display: 'flex', alignItems: 'center' }}>
			<div style={{ display: 'flex', flexDirection: 'column'}}>
				{(panelID == 'predUser') && cat.isCommonWithinMe && (
					<TooltipForFilterBubble
						cat={cat}
						algoEff={algoEffs.filterBubble}
						filterBubbleScale={colorScales.filterBubble}
						onValueAlignmentChange={handleAlgoEffValueAlignment}
					/>
				)}
			</div>
			<CategorySmallWrapper
				style={{
					width: panelID == 'predUser' ? '120px' : '100px',
					height: l.cd.h * cat.ratio + expandedFactor,
					minHeight: '20px',
					background: categoryColor,
						// background: panelID === 'predUser' 
						// 	? colorCategoryHalfAndHalf(cat, colorScales)
						// 	: categoryColor,
					border: highlightCategoryBorder(cat, hoveredEntry, selectedEntry, categoryColor),
					position: 'relative',
					display: 'flex',
					overflow: 'visible'
				}}
				className={`${panelID} ${cat.name}`}
				onMouseEnter={() => {
					console.log('cat: ', panelID, cat);
					setIsHovered(true);
					setHoveredEntry(cat);
				}}
				onMouseLeave={() => {
					setIsHovered(false);
					setHoveredEntry('');
				}}
				onClick={() => {
					setSelectedEntry(selectedEntry.name === cat.name ? {} : cat);
				}}
			>
				<IconButton 
					onClick={() => {/* Add your click handler here */}} 
					style={{ 
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						borderRadius: '50%', 
						padding: 2,
						position: 'absolute',
						right: -10,
						top: -10,
						visibility: isHovered ? 'visible' : 'hidden'
					}} 
					size="small"
				>
					{(panelID == 'predUser') 
						? <CloseIcon style={{ color: 'white', fontSize: 14 }} />
						: ((cat.isOnlyInActual || cat.isOnlyInPredOthers)
							? <AddCircleIcon sx={{ color: 'white', fontSize: 14 }} />
							: null
						)
					}
				</IconButton>
				{panelID == 'predUser' && cat.isCommonWithinMe && (
					<div
						className={'arrowhead_from_left'}
						style={{
							position: 'absolute',
							left: '-5px',
							top: 'calc(50% - 5px)',
							width: 0,
							height: 0,
							borderLeft: '7.5px solid transparent',
							borderRight: '7.5px solid transparent',
							borderBottom: '10px solid ' + d3.color(colorCategory(cat, bipolarColor, cat.measures.filterBubble, colorScales.filterBubble, panelID)).darker(0.2),
							transform: 'rotate(90deg)',
							zIndex: 2
						}}
					/>
				)}
				{panelID == 'predUser' && (
					<div
						className={'arrowhead_from_right'}
						style={{
							position: 'absolute',
							right: '-5px',
							top: 'calc(50% - 5px)',
							width: 0,
							height: 0,
							borderLeft: '7.5px solid transparent',
							borderRight: '7.5px solid transparent',
							borderTop: '10px solid ' + d3.color(colorCategory(cat, bipolarColor, cat.measures.popularityBias, colorScales.popularityBias, panelID)).darker(0.2),
							transform: 'rotate(90deg)',
							zIndex: 2
						}}
					/>
				)}
				<div style={{ width: '100%', position: 'relative', zIndex: 1 }}>
					{showTopicHighlight
					? (showTopicsForCategory ? 
							renderAllTopicsOnMouseover(cat) 
							: renderCategoryWithTopTopics(cat))
					: renderCategoryOnly(cat)
					}
					{(panelID == 'predUser') && cat.isCommonWithinMe && (
						<TooltipForMiscalibration2
						cat={cat}
						miscalibrationScale={colorScales.miscalibration}
						/>
					)}
					{(panelID != 'predOthers') && cat.isMajorInActual && (
						<MajorCategoryInActualAccent 
							backgroundColor={colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
						/>
					)}
					{(panelID != 'predOthers') && cat.isMinorInActual && (
						<MinorCategoryInActualAccent 
							backgroundColor={colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
						/>
					)}
					{(panelID != 'actualUser') && cat.isMajorInActual && (
						<MajorCategoryInOthersAccent 
							backgroundColor={colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
						/>
					)}
					{(panelID != 'actualUser') && cat.isMinorInActual && (
						<MinorCategoryInOthersAccent 
							backgroundColor={colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
						/>
					)}
				</div>
				{/* Resize button */}
				{(panelID == 'predUser') && (<ResizeControls>
					<ResizeButton
						onClick={(e) => handleSetCatRatioChange(cat.name, -1, e)}
					>
						<Minus size={16} />
					</ResizeButton>
					<Divider />
					<ResizeButton
						onClick={(e) => handleSetCatRatioChange(cat.name, 1, e)}
					>
						<Plus size={16} />
					</ResizeButton>
				</ResizeControls>)}
			</CategorySmallWrapper>
			<div style={{ display: 'flex', flexDirection: 'column', width: 0 }}>
				{(panelID == 'predUser') && (
					<TooltipForPopularityBias
						cat={cat}
						algoEff={algoEffs.popularityBias}
						popularityBiasScale={colorScales.popularityBias}
						onValueAlignmentChange={handleAlgoEffValueAlignment}
					/>
				)}
			</div>
	  	</div>
	);
};

export default CategorySmall;
