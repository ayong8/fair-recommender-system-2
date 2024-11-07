import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import { Tooltip, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PropTypes from 'prop-types';

import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AdjustIcon from '@mui/icons-material/Adjust';

import { c, algoEffRatingIcons, StyledRating } from './GlobalStyles';
import { parseHTML } from './util/util';

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

const TooltipForAlgoEff = ({ 
	cat, 
	algoEff, 
	onValueAlignmentChange 
}) => {
	const [parsedExplanation, setParsedExplanation] = useState('');
	const [ratingValue, setRatingValue] = useState(3);

	useEffect(() => {
		if (algoEff?.explanation?.[algoEff?.valueAlignment]) {
			const parsedHTML = parseHTML(algoEff.explanation[algoEff.valueAlignment]);
			console.log('parsedHTML: ', parsedHTML)
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
		
		if (cat.isMajorInActual) {
			return (
				<RadioButtonCheckedIcon 
					style={{
						position: 'absolute',
						top: '2px',
						right: '1px',
						fontSize: '13px',
						color: 'black',
						cursor: 'pointer',
						zIndex: 1
					}}
				/>
			);
		}
		
		if (cat.isMinorInActual) {
			return (
				<AdjustIcon 
					style={{
						position: 'absolute',
						top: '2px',
						right: '2px',
						fontSize: '13px',
						color: 'black',
						cursor: 'pointer',
						zIndex: 1
					}}
				/>
			);
		}
		
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

TooltipForAlgoEff.propTypes = {
	cat: PropTypes.object,
	algoEff: PropTypes.object,
	onValueAlignmentChange: PropTypes.func
};

export default TooltipForAlgoEff;
