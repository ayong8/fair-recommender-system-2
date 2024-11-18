import React, { useEffect, useState, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';

import { colorContrast } from 'd3plus-color';
import { Plus, Minus } from 'lucide-react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import AddCircleIcon from '@mui/icons-material/AddCircle';

import Topic from './Topic';
import TooltipForFilterBubble from './TooltipForFilterBubble';
import TooltipForPopularityBias from './TooltipForPopularityBias';
import TooltipForMiscalibration from './TooltipForMiscalibration';
import { 
	l, 
	c, 
	highlightCategoryBorder, 
	fontSizeScale, 
	CategoryWrapper,
	MajorCategoryInActualAccent,
	MinorCategoryInActualAccent,
	MajorCategoryInOthersAccent,
	MinorCategoryInOthersAccent 
} from './GlobalStyles';
import { adjustCategorySize } from './util/util';
import { ResizeControls, ResizeButton, Divider, isColorInRange } from './GlobalStyles';

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
	algoEffs,
	algoEffScore,
	algoEffColorScale,
	colorScales,
	handleSetCatRatioChange,
	handleAlgoEffValueAlignment
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);
	const [isAccordionExpanded, setIsAccordionExpanded] = useState(false); // State to track accordion expansion
	const accordionRef = useRef(null); // Create a ref for the accordion
	const [isHovered, setIsHovered] = useState(false); // State to track hover

	const colorCategory = (cat, bipolarColor, algoEffScore, algoEffColorScale, panelID) => {
		return algoEffColorScale(algoEffScore)
	};

	// Render functions
	const renderAllTopicsOnMouseover = () => (
		cat.topics.map(topic => (
		  <Topic
				topic={topic}
				cat={cat}
				key={topic.name}
				isSmallCategory={cat.isSmall}
				selectedEntry={selectedEntry}
				setSelectedEntry={setSelectedEntry}
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
			style={{ 
				fontSize: fontSizeScale(cat.ratio),
				color: colorContrast(categoryColor)
			}}
		>
			{_.capitalize(cat.name.split('_').join(' '))}
		</CategoryName>
		<TopicsContainer 
			isSmallCategory={cat.isSmall}
		>
		<div style={{ position: 'absolute', left: 0, bottom: 0, zIndex: 100, width: '80%' }}>
		  {!isAccordionExpanded && cat.topics.slice(0, 2).map(topic => (
				<Topic 
					topic={topic}
					cat={cat}
					key={topic.name}
					isSmallCategory={cat.isSmall}
					selectedEntry={selectedEntry}
					setSelectedEntry={setSelectedEntry}
				/>
		  ))}
		</div>
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

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (accordionRef.current && !accordionRef.current.contains(event.target)) {
				setIsAccordionExpanded(false);
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, []);

	const categoryColor = colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID);

	return (
		<div style={{ display: 'flex', alignItems: 'center', textAlign: 'left' }}>
			{/* tooltip for filter bubble */}
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
			<CategoryWrapper
				style={{
					width: panelID == 'predUser' ? '120px' : '100px',
					height: l.cd.h * 0.8 * cat.ratio,
					minHeight: '20px',
					background: categoryColor,
					border: highlightCategoryBorder(cat, hoveredEntry, selectedEntry, categoryColor),
					position: 'relative',
					overflow: 'visible'
				}}
				className={`${panelID} ${cat.name} category-wrapper group relative`}
				onMouseOver={() => {
					console.log('cat: ', panelID, cat);
					setShowTopicsForCategory(false);
					setHoveredEntry(cat);
				}}
				onMouseOut={() => {
					setShowTopicsForCategory(false);
					setHoveredEntry('');
				}}
				onClick={(e) => {
					if (!accordionRef.current || !accordionRef.current.contains(e.target)) {
						setSelectedEntry(selectedEntry.name === cat.name ? {} : cat);
					}
				}}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
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
						visibility: isHovered ? 'visible' : 'hidden',
						zIndex: 10
					}} 
					size="small"
				>
					{(panelID == 'predUser') 
						? <CloseIcon style={{ color: 'white', fontSize: 14 }} />
						: ((cat.isOnlyInActual || cat.isOnlyInPredOthers)
							? <AddCircleIcon sx={{ color: 'white', fontSize: 14 }} />
							: <span />
						)
					}
				</IconButton>
				{(panelID == 'predUser') && (
					<TooltipForMiscalibration
						cat={cat}
						algoEff={algoEffs.miscalibration}
						miscalibrationScale={colorScales.miscalibration}
						onValueAlignmentChange={handleAlgoEffValueAlignment}
					/>
				)}
				{(panelID != 'predOthers') && cat.isMajorInActual && (
					<MajorCategoryInActualAccent 
						backgroundColor={panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
					/>
				)}
				{(panelID != 'predOthers') && cat.isMinorInActual && (
					<MinorCategoryInActualAccent 
						backgroundColor={panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
					/>
				)}
				{(panelID != 'actualUser') && cat.isMajorInActual && (
					<MajorCategoryInOthersAccent 
						backgroundColor={panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
					/>
				)}
				{(panelID != 'actualUser') && cat.isMinorInActual && (
					<MinorCategoryInOthersAccent 
						backgroundColor={panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, algoEffScore, algoEffColorScale, panelID)}
					/>
				)}
				{panelID == 'predUser' && cat.isCommonWithinMe && (
					<div
						className={'arrowhead_from_left'}
						style={{
							position: 'absolute',
							left: '-7px',
							top: 'calc(50% - 8px)',
							width: 0,
							height: 0,
							borderLeft: '15px solid transparent',
							borderRight: '15px solid transparent',
							borderBottom: '20px solid ' + d3.color(colorCategory(cat, bipolarColor, cat.measures.filterBubble, colorScales.filterBubble, panelID)).darker(0.2),
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
							right: '-7px',
							top: 'calc(50% - 8px)',
							width: 0,
							height: 0,
							borderLeft: '15px solid transparent',
							borderRight: '15px solid transparent',
							borderTop: '20px solid ' + d3.color(colorCategory(cat, bipolarColor, cat.measures.popularityBias, colorScales.popularityBias, panelID)).darker(0.2),
							transform: 'rotate(90deg)',
							zIndex: 2
						}}
					/>
				)}
				{showTopicHighlight
					? renderCategoryWithTopTopics(cat)
					: renderCategoryOnly(cat)
				}
				<Accordion
					ref={accordionRef}
					className="accordion-container"
					sx={{
						width: '100%',
						position: 'absolute',
						bottom: 0,
						zIndex: 99,
						background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))', // Gradient from white to transparent
						'&.MuiAccordion-root': {
							margin: 0, // Remove margin from the accordion
							'&::before': {
								display: 'none', // Remove the ::before pseudo-element
							},
						},
						'& .MuiAccordionSummary-root': {
							minHeight: '10px !important',
							padding: 0,
						},
						'& .MuiAccordionSummary-content': {
							margin: 0, // Ensure no margin in the summary content
						},
					}}
					expanded={isAccordionExpanded}
					onChange={() => setIsAccordionExpanded(!isAccordionExpanded)}
				>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls="panel1a-content"
						id="panel1a-header"
					>
						{/* You can add a title or leave it empty */}
					</AccordionSummary>
					<AccordionDetails
						sx={{
							maxHeight: `calc(${l.cd.h * 0.8 * cat.ratio}px / 2)`, // Calculate half of the CategoryWrapper height
							overflowY: 'auto',
							padding: 0,
							margin: 0,
							background: 'linear-gradient(to top, rgba(255, 255, 255, 1), rgba(255, 255, 255, 0))',
						}}
						onClick={(e) => {
							// e.stopPropagation();
							if (!e.target.closest('.topic_wrapper')) {
								setIsAccordionExpanded(false);
							}
						}}
					>
						{showTopicHighlight
							? renderAllTopicsOnMouseover(cat)
							: renderCategoryOnly(cat)
						}
					</AccordionDetails>
				</Accordion>
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
						<AddIcon size={16} />
					</ResizeButton>
				</ResizeControls>)}
			</CategoryWrapper>
			{/* remove icon */}
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

export default Category;
