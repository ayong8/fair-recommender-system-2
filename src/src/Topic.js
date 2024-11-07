import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import styled from 'styled-components';

import drawPaths from './util/drawPaths';
import { l, c } from './GlobalStyles';

const TopicWrapper = styled.div.attrs({
  className: 'topic_wrapper'
})`
  	// width: 100px;
	height: 15px;
	cursor: pointer;
	background-color: lightpink;
	border: 1.5px solid white;
	border-radius: 2px;
	padding: 2px;
	margin: 0.5px 1.5px;
	pointer-events: auto;
	line-height: initial;
	float: left;
`;

const SmallTopicWrapper = styled.div.attrs({
	className: 'small_topic_wrapper'
})`
	width: 10px;
	height: 8px;
	background-color: lightpink;
	border: 1.5px solid white;
	border-radius: 2px;
	padding: 1px;
	margin: 0.5px 1.5px;
	pointer-events: none;
	line-height: initial;
	float: left;
`;

const Topic = ({
  topic,
	cat,
	isSmallCategory,
	selectedEntry,
	setSelectedEntry
}) => {
	const parentDiv = $('.category_wrapper.' + cat.name).height();
	const heightFromRatio = parentDiv * topic.ratio - 50;
	const topicDivHeight = l.cd.minH < heightFromRatio ? heightFromRatio : l.cd.minH;

	if (!isSmallCategory) 
		return (<TopicWrapper
				style={{
					backgroundColor: '#b4b2b2',
					color: 'white'
				}}
				className={ topic.name }
				onClick={(e) => {
					setSelectedEntry(selectedEntry.name === topic.name ? {} : topic);
				}}
			>{topic.name}
			</TopicWrapper>
		);
	else
		return (<SmallTopicWrapper
			style={{
				backgroundColor: '#b4b2b2',
				color: 'white'
			}}
			className={ topic.name }
			/>
		);
}

export default Topic;