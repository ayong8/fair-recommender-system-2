import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import styled from 'styled-components';

import { l, c } from './GlobalStyles';

const CategoryWrapper = styled.div.attrs({
  className: 'category_dist_wrapper'
})`
  width: 100px;
	// background-color: whitesmoke;
	border: 2px white solid;
	border-radius: 5px;
	text-align: center;
	font-size: 0.8rem;
	margin: 0 auto;
`;

const Category = ({
  cat,
	type,
	dataType,
	userType
}) => {

	console.log('cat ratio: ', cat.ratio)

	return (
		<CategoryWrapper
			style={{
				backgroundColor: c[type],
				height: l.cd.h * cat.ratio, 
				lineHeight: cat.ratio*30
			}}
			className={ cat.name }
			onMouseOver={handleMouseOverCategory}
			onMouseOut={handleMouseOutCategory}
		>{cat.name}
		</CategoryWrapper>
	);
}

const handleMouseOverCategory = (e) => {
	console.log(e.target.innerHTML);
	const catName = e.target.innerHTML;
	$('.' + catName).css('border', '1px solid black');
}

const handleMouseOutCategory = (e) => {
	console.log(e.target.innerHTML);
	const catName = e.target.innerHTML;
	$('.' + catName).css('border', '');
}

export default Category;