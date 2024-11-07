import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { scaleLinear } from 'd3-scale';
import axios from 'axios';

import Category from './Category';
import CategorySmall from './CategorySmall';
import TooltipForCategories from './TooltipForCategories';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import { CategoryOuter, getCategoryOuterClassName, getCategoryOuterStyle, getPredPanelStyles } from './GlobalStyles';

const PanelWrapper = styled.div.attrs({
  className: 'panel_wrapper'
})`
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	// margin-right: 100px;
	// margin: 0 auto;
`;

const PanelTitle = styled.div.attrs({
  className: 'panel_title'
})`
	font-size: 1.1rem;
	font-weight: 600;
	text-align: left;
	// margin-bottom: 10px;
	align-self: flex-start;
`;

const CategoryListWrapper = styled.div.attrs({
	className: 'category_list_wrapper'
  })`
  // height: 100%;
	overflow-y: scroll;
	position: relative;
	// margin: 0 -10px;
  `;

const Panel = ({
	panelID,
	dataType,
	userType,
  cats,
	user,
	algoEffs,
	majorPrefMeasure,
	minorPrefMeasure,
	colorScales,
	selectedEntry,
	hoveredEntry,
	setSelectedEntry,
	setHoveredEntry,
	showTopicHighlight,
	bipolarColor,
	explanations,	
	categoryPreferencesOnPred,
	setCategoryPreferencesOnPred,
  topicPreferencesOnPred,
  setTopicPreferencesOnPred,
	handleSetCatRatioChange,
	handleAlgoEffValueAlignment
}) => {

	return (
		<PanelWrapper>
		<PanelTitle
			style={panelID == 'actualUser' ? { marginLeft: '20px' } : { marginLeft: '5px' }}
		>{dataType}</PanelTitle>
		<CategoryListWrapper 
			style={{ 
				width: dataType == 'Recommended' ? '90%' : '82.5%',
				...(((panelID === 'predUser') || (panelID === 'predOthers')) ? {
					backgroundColor: colorScales.stereotypeColorScale(user.stereotype),
					position: 'relative',
					paddingRight: '15px'
				} : { paddingRight: '25px' })
			}}
		>
			{(panelID === 'predUser') && (
				<TooltipForCategories
					algoEff={algoEffs.stereotype}
					onValueAlignmentChange={handleAlgoEffValueAlignment}
				/>
			)}
			{cats.map((cat) => {
				// console.log('algoEffs.filterBubble: ', algoEffs.filterBubble)
				return !cat.isSmall ? (
					<CategoryOuter 
						className={getCategoryOuterClassName(cat)}
						style={getCategoryOuterStyle(cat, colorScales, majorPrefMeasure, minorPrefMeasure)}
					>
						{((cat.isMajorInActual || cat.isMinorInActual)) && (
							<TooltipForAlgoEff
								algoEff={algoEffs.filterBubble}
								cat={cat}
								onValueAlignmentChange={handleAlgoEffValueAlignment}
							/>
						)}
						<Category
							key={cat.id}
							panelID={panelID} 
							dataType={dataType} 
							userType={userType} 
							cat={cat} 
							selectedEntry={selectedEntry}
							hoveredEntry={hoveredEntry}
							setSelectedEntry={setSelectedEntry}
							setHoveredEntry={setHoveredEntry}
							showTopicHighlight={showTopicHighlight}
							bipolarColor={bipolarColor}
							miscalibrationScale={colorScales.miscalibrationScale}
							handleSetCatRatioChange={handleSetCatRatioChange}
						/>
					</CategoryOuter>
					)
					: (<CategoryOuter 
						className={'small_category_wrapper'}
						style={getCategoryOuterStyle(cat, colorScales, majorPrefMeasure, minorPrefMeasure)}
					>
						{((cat.isMajorInActual || cat.isMinorInActual)) && (
							<TooltipForAlgoEff
								algoEff={algoEffs.filterBubble}
								cat={cat}
							/>
						)}
						<CategorySmall
							key={cat.id}
							panelID={panelID} 
							dataType={dataType} 
							userType={userType} 
							cat={cat} 
							selectedEntry={selectedEntry}
							hoveredEntry={hoveredEntry}
							setSelectedEntry={setSelectedEntry}
							setHoveredEntry={setHoveredEntry}
							showTopicHighlight={showTopicHighlight}
							bipolarColor={bipolarColor}
							miscalibrationScale={colorScales.miscalibrationScale}
							handleSetCatRatioChange={handleSetCatRatioChange}
						/>
					</CategoryOuter>)
			})}
		</CategoryListWrapper>
		</PanelWrapper>
	);
}

export default Panel;
