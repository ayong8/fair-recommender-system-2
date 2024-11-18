import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import * as d3 from 'd3';
import _ from 'lodash';

import { Tooltip, Box } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import PropTypes from 'prop-types';

import { c, algoEffRatingIcons, StyledRating } from './GlobalStyles';
import { parseHTML } from './util/util';
import IconForPopularityBias from './IconForPopularityBias';

const ValuationWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const ValueNameWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const TooltipContent = styled.div`
  max-width: 200px;
  padding: 10px;
  box-sizing: border-box;
	font-family: PT Sans Narrow;
`;

const TooltipForPopularityBias2 = ({ 
	cat, 
	algoEff, 
	popularityBiasScale,
	onValueAlignmentChange 
}) => {
	const [parsedExplanation, setParsedExplanation] = useState('');
	const [ratingValue, setRatingValue] = useState(3);

	useEffect(() => {
		if (algoEff?.explanation?.[algoEff?.valueAlignment]) {
			const parsedHTML = parseHTML(algoEff.explanation[algoEff.valueAlignment]);
			setParsedExplanation(parsedHTML?.innerHTML || '');

			const initialRating = Object.keys(algoEffRatingIcons).find(key => 
				algoEffRatingIcons[key].valueAlignment === algoEff.valueAlignment
			);
			setRatingValue(parseInt(initialRating) || 3);
		}
	}, [algoEff]);

	const handleValueAlignmentChange = (event, newValue) => {
		const newAlignment = algoEffRatingIcons[newValue].valueAlignment;
		setRatingValue(newValue);

		if (algoEff.valueAlignment !== newAlignment) {
			onValueAlignmentChange('filterBubble', newAlignment);
		}
	};

	const iconContainer = (props) => {
		const { value, ...other } = props;
		return <span {...other}>{algoEffRatingIcons[value].icon}</span>;
	};

	const tooltipContent = (
		<TooltipContent>
			<div style={{ fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: parsedExplanation || '' }} />
			<div style={{ marginTop: 10, fontSize: '0.9rem', fontWeight: 500 }}>How do you value this algorithmic effect?</div>
			<ValueNameWrapper>
				<div>Harm</div>
				<div>Value</div>
			</ValueNameWrapper>
			<ValuationWrapper>
				<IconWrapper>
					<ThumbDownIcon fontSize="small" style={{ color:c.bipolar.neg }} />
				</IconWrapper>
				<StyledRating
					name="highlight-selected-only"
					value={ratingValue}
					onChange={handleValueAlignmentChange}
					IconContainerComponent={iconContainer}
					getLabelText={(value) => algoEffRatingIcons[value].label}
					highlightSelectedOnly
				/>
				<IconWrapper>
					<ThumbUpIcon fontSize="small" style={{ color: c.bipolar.pos }} />
				</IconWrapper>
			</ValuationWrapper>
		</TooltipContent>
	);

	const renderIcon = () => {
		if (!cat) return <></>;
		
		if (cat.measures.popularityBias > 0) {
			return (
				<IconForPopularityBias 
					style={{
						position: 'relative',
						left: '0px',
						top: '50%',
						// transform: 'translateY(-50%)',
						fontSize: '25px',
						color: d3.color(popularityBiasScale(cat.measures.popularityBias)).darker(0.5),
						zIndex: 1000
					}}
				/>
			);
		}
		
		// if (cat.measures.filterBubble < 0) {
		// 	return (
		// 		<RemoveCircleOutlineIcon 
		// 			style={{
		// 				position: 'relative',
		// 				left: '0px',
		// 				top: '50%',
		// 				// transform: 'translateY(-50%)',
		// 				fontSize: '25px',
		// 				color: d3.color(filterBubbleScale(cat.measures.filterBubble)).darker(0.5),
		// 				zIndex: 1000
		// 			}}
		// 		/>
		// 	);
		// }
		
		return <></>;
	};

	return (
		<Tooltip
			className={'tooltip_stereotype'}
			// open={true}
			PopperProps={{
				sx: {
					'& .MuiTooltip-tooltip': {
						backgroundColor: 'rgba(255, 255, 255, 0.95)',
						color: 'black',
						border: '3px solid whitesmoke'
					},
					'& .MuiTooltip-arrow': {
						color: 'rgba(255, 255, 255, 0.8)',
						border: '3px solid whitesmoke'
					},
				},
			}}
			title={tooltipContent}
			arrow 
		>
			{renderIcon()}
		</Tooltip>
	);
}

TooltipForPopularityBias2.propTypes = {
	cat: PropTypes.object,
	algoEff: PropTypes.object,
	onValueAlignmentChange: PropTypes.func
};

export default TooltipForPopularityBias2;
