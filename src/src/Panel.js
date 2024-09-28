import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Category from './Category';
import { l } from './GlobalStyles';

const PanelWrapper = styled.div.attrs({
  className: 'panel_wrapper'
})`
	width: 100%;
	height: ${l.cd.h}px;
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
  `;

const Panel = ({
	panelID,
	dataType,
	userType,
  	cats,
	selectedEntry,
	setSelectedEntry
}) => {

	// useEffect(() => {
	// 	loadData();
	// 	drawPaths();
	// }, []);
	
	return (
		<PanelWrapper>
			<PanelTitle>{dataType}</PanelTitle>
			<CategoryListWrapper>
				{cats.map((cat) => {
					return <Category
						panelID={panelID} 
						dataType={dataType} 
						userType={userType} 
						cat={cat} 
						selectedEntry={selectedEntry}
						setSelectedEntry={setSelectedEntry}
					/>
				})}
			</CategoryListWrapper>
		</PanelWrapper>
	);
}

export default Panel;