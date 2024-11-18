import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { scaleLinear } from 'd3-scale';
import axios from 'axios';

import Category from './Category';
import CategorySmall from './CategorySmall';
import TooltipForStereotype from './TooltipForStereotype';
import { CategoryOuter, getCategoryOuterClassName, getCategoryOuterStyle, getPredPanelStyles } from './GlobalStyles';

import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import Groups2OutlinedIcon from '@mui/icons-material/Groups2Outlined';

const PanelWrapper = styled.div.attrs({
  className: 'panel_wrapper'
})`
	// width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: ${props => props.style ? props.style.alignItems : 'center' };
	// margin: 0 10px;
`;

const PanelTitle = styled.div.attrs({
  className: 'panel_title'
})`
	font-size: 1rem;
	font-weight: 600;
	text-align: left;
	align-self: center;
	margin-left: 12.5px;
    // margin-right: 12.5px;
	line-height: 1;
	text-align: center;
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
	panelName,
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
		<PanelWrapper style={dataType === 'Recommended' ? { alignItems: 'flex-end' } : { alignItems: 'flex-start' }}>
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
				<PanelTitle
					style={panelID == 'predUser' ? { marginLeft: 10 } : {}}
				>
					{(panelID == 'actualUser') 
						? <PersonOutlineOutlinedIcon style={{ fontSize: '48px', marginBottom: '-7px', color: 'dimgray' }} />
						: ((panelID == 'predUser')
							? <SmartToyOutlinedIcon style={{ fontSize: '48px', marginBottom: '-7px', color: 'dimgray' }} />
							: <Groups2OutlinedIcon style={{ fontSize: '65px', marginBottom: '-15px', color: 'dimgray' }} />
						)}
					<div>{panelName}</div>
				</PanelTitle>
				{(panelID == 'predUser') && (
					<TooltipForStereotype
						user={user}
						algoEff={algoEffs.stereotype}
						stereotypeScale={colorScales.stereotype}
						onValueAlignmentChange={handleAlgoEffValueAlignment}
					/>
				)}
			</div>
			{cats.map((cat) => {
				return !cat.isSmall ? (
					<>
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
							algoEffs={algoEffs}
							algoEffScore={(userType == 'user') ? cat.measures.miscalibration : cat.measures.popularityBias}
							algoEffColorScale={(userType == 'user') ? colorScales.miscalibration : colorScales.popularityBias}
							colorScales={colorScales}
							handleSetCatRatioChange={handleSetCatRatioChange}
							handleAlgoEffValueAlignment={handleAlgoEffValueAlignment}
						/>
					</>
				) : (
					<>
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
							algoEffs={algoEffs}
							algoEffScore={(userType == 'user') ? cat.measures.miscalibration : cat.measures.popularityBias}
							algoEffColorScale={(userType == 'user') ? colorScales.miscalibration : colorScales.popularityBias}
							colorScales={colorScales}
							handleSetCatRatioChange={handleSetCatRatioChange}
							handleAlgoEffValueAlignment={handleAlgoEffValueAlignment}
						/>
					</>
				);
			})}
		</PanelWrapper>
	);
}

export default Panel;
