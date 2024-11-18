import React, { useEffect, useState } from 'react';
import $ from 'jquery';
import styled from 'styled-components';
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
	overflow: hidden;
`;

const SmallTopicWrapper = styled.div.attrs({
	className: 'small_topic_wrapper'
})`
	width: 10px;
	height: 10px;
	background-color: lightpink;
	border: 1px solid white;
	border-radius: 2px;
	pointer-events: auto;
	line-height: initial;
	float: left;
	z-index: 1;
	position: relative;
	${(props) => props.isSelected && `
		border: 1px solid black; // Highlight border when selected
	`}
`;

const Tooltip = styled.div`
	position: absolute;
	background-color: rgba(0, 0, 0, 0.7);
	color: white;
	padding: 5px;
	border-radius: 4px;
	white-space: nowrap;
	top: -25px;
	left: 50%;
	transform: translateX(-50%);
	visibility: hidden;
	opacity: 0;
	transition: visibility 0s, opacity 0.2s ease-in-out;
`;

const Topic = ({
  topic,
	cat,
	isSmallCategory,
	selectedEntry,
	setSelectedEntry
}) => {
	const [isHovered, setIsHovered] = useState(false); // State to manage hover
	const parentDiv = $('.category_wrapper.' + cat.name).height();
	const heightFromRatio = parentDiv * topic.ratio - 50;
	const topicDivHeight = l.cd.minH < heightFromRatio ? heightFromRatio : l.cd.minH;

	if (!isSmallCategory) 
		return (<TopicWrapper
					style={{
						backgroundColor: '#b4b2b2',
						color: 'white',
						border: (selectedEntry && selectedEntry.name === topic.name) || isHovered 
							? '1px solid black' 
							: '1px solid white'
					}}
					className={ topic.name }
					onMouseEnter={() => setIsHovered(true)} // Set hover state to true
					onMouseLeave={() => setIsHovered(false)} // Set hover state to false
					onClick={(e) => {
						setSelectedEntry(selectedEntry.name === topic.name ? {} : topic);
				}}
			>{topic.name}
			</TopicWrapper>
		);
	else
		return (
			<SmallTopicWithTooltip 
				topic={topic} 
				selectedEntry={selectedEntry} 
				setSelectedEntry={setSelectedEntry} 
			/>
		);
}

const SmallTopicWithTooltip = ({ topic, selectedEntry, setSelectedEntry }) => {
	const [isHovered, setIsHovered] = useState(false); // State to manage hover

	return (
		<SmallTopicWrapper
			style={{
				backgroundColor: '#b4b2b2',
				color: 'white',
				border: (selectedEntry && selectedEntry.name === topic.name) || isHovered 
					? '1px solid black' 
					: '1px solid white'
			}}
			className={topic.name}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={(e) => {
				setSelectedEntry(selectedEntry.name === topic.name ? {} : topic);
			}}
		>
			{/* Tooltip */}
			<Tooltip style={{
				visibility: isHovered ? 'visible' : 'hidden', // Show tooltip if hovered
				opacity: isHovered ? 1 : 0 // Fade in/out effect
			}}>
				{topic.name}
			</Tooltip>
		</SmallTopicWrapper>
	);
};

export default Topic;