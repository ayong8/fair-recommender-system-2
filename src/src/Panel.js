import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { scaleLinear } from 'd3-scale';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { Tooltip } from '@mui/material';

import Category from './Category';
import CategoryMajor from './CategoryMajor';
import CategoryMinor from './CategoryMinor';
import CategoryNormal from './CategoryNormal';
import { l } from './GlobalStyles';

const PanelWrapper = styled.div.attrs({
  className: 'panel_wrapper'
})`
	width: 100%;
	height: 85%;
	display: flex;
	flex-direction: column;
	align-items: center;
	// margin-right: 100px;
	// margin: 0 auto;
`;

const PanelTitle = styled.div.attrs({
  className: 'panel_title'
})`
	font-size: 1.1rem;
	font-weight: 600;
	text-align: center;
	margin-bottom: 10px;
	margin: 0 auto;
`;

const CategoryListWrapper = styled.div.attrs({
	className: 'category_list_wrapper'
  })`
  	height: 100%;
	overflow-y: scroll;
	position: relative;
	margin: 0 -10px;
  `;

const CategoryWrapper = styled.div`
  padding: 2px;
  margin: 0 -10px;
`;

const MinorCategoryWrapper = styled(CategoryWrapper)`
  background-color: #e6f3ff; // Light blue background for minor categories
`;

const Panel = ({
	panelID,
	dataType,
	userType,
  	cats,
	user,
	majorPrefMeasure,
	minorPrefMeasure,
	selectedEntry,
	setSelectedEntry,
	showTopicHighlight,
	bipolarColorScale
}) => {
	const stereotypeColorScale = scaleLinear()
		.domain([-1, 0, 1])
		.range(['#ff9999', '#ffffff', '#99ff99']);

	const predUserPanelForStyles = panelID === 'predUser' ? {
		backgroundColor: stereotypeColorScale(user.stereotype),
		margin: '0 -10px',
		// padding: '0 10px'
		position: 'relative', // Keep this
		paddingRight: '15px' // Add padding to accommodate the icon
	} : {};
	
	return (
		<PanelWrapper>
		<PanelTitle>{dataType}</PanelTitle>
		<CategoryListWrapper 
			style={{ 
				width: userType == 'others' ?  '105%' : '80%',
				...predUserPanelForStyles,
			}}
		>
			{panelID === 'predUser' && (
				<Tooltip title="Help information for category list">
					<HelpOutlineIcon 
						style={{
							position: 'absolute',
							top: '2px',
							right: '2px',
							fontSize: '13px',
							color: '#666',
							cursor: 'pointer',
							zIndex: 1
						}}
					/>
				</Tooltip>)}
			{cats.map((cat) => {
				if (cat.isMajor) {
					return (<CategoryMajor
						key={cat.id}
						panelID={panelID} 
						dataType={dataType} 
						userType={userType} 
						cat={cat} 
						selectedEntry={selectedEntry}
						setSelectedEntry={setSelectedEntry}
						showTopicHighlight={showTopicHighlight}
						bipolarColorScale={bipolarColorScale}
						majorPrefMeasure={majorPrefMeasure}
					/>)
				} else if (cat.isMinor) {
					return (<CategoryMinor
						key={cat.id}
						panelID={panelID} 
						dataType={dataType} 
						userType={userType} 
						cat={cat} 
						selectedEntry={selectedEntry}
						setSelectedEntry={setSelectedEntry}
						showTopicHighlight={showTopicHighlight}
						bipolarColorScale={bipolarColorScale}
						minorPrefMeasure={minorPrefMeasure}
					/>)
				} else {
					return (<CategoryNormal
						key={cat.id}
						panelID={panelID} 
						dataType={dataType} 
						userType={userType} 
						cat={cat} 
						selectedEntry={selectedEntry}
						setSelectedEntry={setSelectedEntry}
						showTopicHighlight={showTopicHighlight}
						bipolarColorScale={bipolarColorScale}
					/>)
				}
			})}
		</CategoryListWrapper>
		</PanelWrapper>
	);
}

export default Panel;
