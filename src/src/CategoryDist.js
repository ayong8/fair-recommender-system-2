import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Category from './Category';
import { l } from './GlobalStyles';

const CategoryDistWrapper = styled.div.attrs({
  className: 'category_dist_wrapper'
})`
  width: 100%;
	height: ${l.cd.h}px;
	margin-right: 20px;
	margin: 0 auto;
`;

const DistTitle = styled.div.attrs({
  className: 'dist_title'
})`
  font-size: 1.1rem;
	font-weight: 600;
	text-align: center;
	margin-bottom: 10px;
	margin: 0 auto;
`;

const CategoryDist = ({
	type,
	dataType,
	userType,
  cats
}) => {

	return (
		<CategoryDistWrapper>
			<DistTitle>{dataType}</DistTitle>
			{cats.map((cat) => {
				return <Category type={type} dataType={dataType} userType={userType} cat={cat} />
			})}
		</CategoryDistWrapper>
	);
}

export default CategoryDist;