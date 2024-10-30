import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { scaleLinear } from 'd3-scale';

import Category from './Category';
import CategorySmall from './CategorySmall';
import CategoryMajor from './CategoryMajor';
import CategoryMinor from './CategoryMinor';
import CategoryNormal from './CategoryNormal';
import TooltipForAlgoEff from './TooltipForAlgoEff';
import TooltipForCategory from './TooltipForCategory';
import { CategoryOuter } from './GlobalStyles';

const PanelWrapper = styled.div.attrs({
  className: 'panel_wrapper'
})`
	width: 100%;
	height: 85%;
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
  height: 100%;
	overflow-y: scroll;
	position: relative;
	// margin: 0 -10px;
  `;

// const CategoryWrapper = styled.div`
//   padding: 2px;
//   margin: 0 -10px;
// `;

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
	explanations
}) => {
	const [expandedCategories, setExpandedCategories] = useState(() => {
    return cats.reduce((acc, cat) => ({
        ...acc,
        [cat.name]: 1
    }), {});
	});

    // Log expandedCategories whenever it changes
    useEffect(() => {
        console.log('Expanded Factors:', expandedCategories);
    }, [expandedCategories]);

	const predPanelForStyles = ((panelID === 'predUser') || (panelID === 'predOthers')) ? {
		backgroundColor: colorScales.stereotypeColorScale(user.stereotype),
		position: 'relative',
		paddingRight: '15px'
	} : { paddingRight: '25px' };

	const getCategoryOuterClassName = (cat) => {
		return cat.isMajorInActual
		? 'major_category_wrapper'
		: (cat.isMinorInActual 
			? 'minor_category_wrapper'
			: 'normal_category_wrapper');
	}

	const getCategoryOuterStyle = (cat) => {
		return cat.isMajorInActual
		? { backgroundColor: colorScales.majorPrefAmpScale(majorPrefMeasure) }
		: (cat.isMinorInActual 
			? { backgroundColor: colorScales.minorPrefAmpScale(minorPrefMeasure) }
			: {});
	}

	return (
		<PanelWrapper>
		<PanelTitle
			style={panelID == 'actualUser' ? { marginLeft: '20px' } : { marginLeft: '5px' }}
		>{dataType}</PanelTitle>
		<CategoryListWrapper 
			style={{ 
				width: dataType == 'Recommended' ?  '90%' : '82.5%',
				...predPanelForStyles,
			}}
		>
			{(panelID === 'predUser') && (
				<TooltipForAlgoEff
					algoEff={algoEffs.stereotype}
				/>
			)}
			{cats.map((cat) => {

				return !cat.isSmall ? (
					<CategoryOuter 
						className={getCategoryOuterClassName(cat)}
						style={getCategoryOuterStyle(cat)}
					>
						{((panelID === 'actualUser') || (panelID == 'predUser')) && ((cat.isMajorInActual || cat.isMinorInActual)) && (
							<TooltipForAlgoEff
								algoEff={algoEffs.filterBubble}
								cat={cat}
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
							expandedCategories={expandedCategories}
        			setExpandedCategories={setExpandedCategories}
							expandedFactor={expandedCategories[cat.name] || 1}
						/>
					</CategoryOuter>
					)
					: (<CategoryOuter 
						className={'small_category_wrapper'}
						style={getCategoryOuterStyle(cat)}
					>
						{(panelID === 'predUser' && (cat.isMajorInActual || cat.isMinorInActual)) && (
							<TooltipForAlgoEff
								algoEff={algoEffs.filterBubble}
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
							expandedCategories={expandedCategories}
        			setExpandedCategories={setExpandedCategories}
							expandedFactor={expandedCategories[cat.name] || 1}
						/>
					</CategoryOuter>)
			})}
		</CategoryListWrapper>
		</PanelWrapper>
	);
}

export default Panel;
