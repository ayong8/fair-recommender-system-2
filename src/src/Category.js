import React, { useEffect, useState, useRef } from 'react';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';
import { ChevronDown, ChevronUp } from 'lucide-react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

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
	handleSetCatRatioChange
}) => {
	const [showTopicsForCategory, setShowTopicsForCategory] = useState(false);
	const [isAccordionExpanded, setIsAccordionExpanded] = useState(false); // State to track accordion expansion
	const accordionRef = useRef(null); // Create a ref for the accordion

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
			style={{ fontSize: fontSizeScale(cat.ratio) }}
		>
			{_.capitalize(cat.name)}
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
				{_.capitalize(cat.name)}
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

	return (
		<CategoryWrapper
			style={{
				width: panelID == 'predUser' ? '120px' : '100px',
				height: l.cd.h * 0.8 * cat.ratio,
				minHeight: '20px',
				backgroundColor: panelID == 'predOthers' ? c[panelID] : colorCategory(cat, bipolarColor, miscalibrationScale, panelID),
				border: highlightCategoryBorder(cat, hoveredEntry, selectedEntry),
				position: 'relative'
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
			onClick={(e) => {
				if (!accordionRef.current || !accordionRef.current.contains(e.target)) {
					setSelectedEntry(selectedEntry.name === cat.name ? {} : cat);
				}
			}}
		>
			{(panelID == 'predUser') && (<TooltipForCategory
					cat={cat}
				/>)
			}
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
			{/* arrows */}
			<ResizeControls>
				<ResizeButton
					onClick={(e) => handleSetCatRatioChange(cat.name, 1, e)}
				>
					<ChevronDown size={16} />
				</ResizeButton>
				<Divider />
				<ResizeButton
					onClick={(e) => handleSetCatRatioChange(cat.name, -1, e)}
				>
					<ChevronUp size={16} />
				</ResizeButton>
			</ResizeControls>
		</CategoryWrapper>
	);
};

export default Category;
