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
	background-color: lightpink;
	border: 1.5px solid white;
	border-radius: 2px;
	padding: 2px;
	margin: 0.5px 1.5px;
	pointer-events: none;
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
	isSmallCategory
}) => {
	// console.log('topic div: ', $('.category_wrapper.' + cat.name).height())
	const parentDiv = $('.category_wrapper.' + cat.name).height();
	const heightFromRatio = parentDiv * topic.ratio - 50;
	const topicDivHeight = l.cd.minH < heightFromRatio ? heightFromRatio : l.cd.minH;
	// console.log('topic: ', cat.name, topic.ratio, heightFromRatio, topicDivHeight);

	// useEffect(() => {
	// 	drawPaths();
	// }, []);

	// drawPaths();

	if (!isSmallCategory) 
		return (<TopicWrapper
				style={{
					backgroundColor: '#b4b2b2', // c[panelID],
					color: 'white'
					// height: topicDivHeight, 
					// lineHeight: topic.ratio*10
				}}
				// data-cat={JSON.stringify(topic)}
				className={ topic.name }
				// onMouseOver={handleMouseOverCategory}
				// onMouseOut={handleMouseOutCategory}
			>{topic.name}
			</TopicWrapper>
		);
	else
		return (<SmallTopicWrapper
			style={{
				backgroundColor: '#b4b2b2', // c[panelID],
				color: 'white'
				// height: topicDivHeight, 
				// lineHeight: topic.ratio*10
			}}
			// data-cat={JSON.stringify(topic)}
			className={ topic.name }
			// onMouseOver={handleMouseOverCategory}
			// onMouseOut={handleMouseOutCategory}
			/>
		);
}

export default Topic;