import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import styled from 'styled-components';

import Topic from './Topic';
import { l, c } from './GlobalStyles';

const CategoryWrapper = styled.div.attrs({
  className: 'category_wrapper'
})`
  	width: 100px;
	// background-color: whitesmoke;
	border: 2px white solid;
	border-radius: 5px;
	text-align: center;
	font-size: 0.8rem;
	margin: 0 auto;
	overflow-y: scroll;
	// display: inline-block;
`;

const Category = ({
  	cat,
	panelID,
	dataType,
	userType,
	selectedEntry,
	setSelectedEntry
}) => {
	const [showTopics, setShowTopics] = useState(false);

	function handleMouseOverCategory (e) {
		console.log('e.target.className: ', e.target.classList[e.target.classList.length-1])
		const catName = e.target.classList[e.target.classList.length-1];
		$('.' + catName).css('border', '1px solid black');
	
		console.log('this: ', $(e.target))
		const catData = $(e.target).data('cat');
		// console.log('cat data: ', $(e.target).data('cat'))
		// {catData.topics.map((t) => {
		// 	return (
		// 		<div style={{ height: 100*t.ratio, border: '1px solid white', lineHeight: 1.2 }}>{t.name}</div>
		// 	)
		// })}

		e.stopPropagation();
		$(e.target).empty();
		$.each(catData.topics, function(index, obj) {
			console.log('topic: ', obj.name)
			const newDiv = $("<div class='topic'>").text(`${obj.name}`).attr('class', 'topic').attr('pointer-events', 'none');
			$(e.target).append(newDiv);
		});
	}
	
	const handleMouseOutCategory = (e) => {
		const catName = e.target.classList[e.target.classList.length-1];
		$('.' + catName).css('border', '');
	}

	// Highlight the border of the category if it is a major category or selected one
	const highlightCategoryBorder = (cat, selectedEntry) => {
		return selectedEntry.name == cat.name ? '3px solid blue'
			: (cat.is_major ? '3px solid black' : null)
	}

	const colorCategory = (cat) => {
		let catColor = 'none';
		if (cat.isTopPersonalization && ((panelID == 'actualUser') || (panelID == 'predUser')))
			catColor = c.personalization;
		else if (cat.isTopDiversity && ((panelID == 'predOthers') || (panelID == 'predUser')))
			catColor = c.diversity;
		else
			catColor = c[panelID];

		return catColor;
	}

	return (
		<CategoryWrapper
			style={{
				backgroundColor: colorCategory(cat),
				height: l.cd.h * cat.ratio, 
				lineHeight: cat.ratio*30,
				border: highlightCategoryBorder(cat, selectedEntry)
			}}
			// data-cat={JSON.stringify(cat)}
			className={ panelID + ' ' + cat.name }
			onMouseOver={() => {
				setShowTopics(true);
				setSelectedEntry(cat);
			}}
			onMouseOut={() => {
				setShowTopics(true);
				setSelectedEntry('');
			}}
		>{showTopics ? 
			cat.topics.map(topic => 
				(<Topic 
					topic={topic}
					cat={cat}
				/>))
			: cat.name}
		</CategoryWrapper>
	);
}

export default Category;