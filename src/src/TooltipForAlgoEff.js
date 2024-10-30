import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import { Tooltip } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import PropTypes from 'prop-types';
import { styled as muiStyled } from '@mui/material/styles';
import Rating from '@mui/material/Rating';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

import { c } from './GlobalStyles';
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
	algoEff,
	cat
}) => {
	const [parsedExplanation, setParsedExplanation] = useState('');

	const StyledRating = muiStyled(Rating)(({ theme }) => ({
		'& .MuiRating-iconEmpty .MuiSvgIcon-root': {
		  color: theme.palette.action.disabled,
		},
	}));
	  
	const customIcons = {
		1: { icon: <SentimentVeryDissatisfiedIcon color="error" />, 
			   label: 'Very Dissatisfied' },
		2: { icon: <SentimentDissatisfiedIcon color="error" />,
		     label: 'Dissatisfied' },
		3: { icon: <SentimentSatisfiedIcon color="warning" />,
		     label: 'Neutral' },
		4: { icon: <SentimentSatisfiedAltIcon color="success" />,
		     label: 'Satisfied' },
		5: { icon: <SentimentVerySatisfiedIcon color="success" />,
		  	 label: 'Very Satisfied' },
	};
	  
	const iconContainer = (props) => {
		const { value, ...other } = props;
		return <span {...other}>{customIcons[value].icon}</span>;
	}

	useEffect(() => {
		if (algoEff?.explanation && algoEff.valueAlignment) {
			const parsedHTML = parseHTML(algoEff.explanation[algoEff.valueAlignment]);
			setParsedExplanation(parsedHTML.innerHTML);
		}
	}, [algoEff]);

	return (
		<Tooltip
			className={'tooltip_stereotype'}
			// open={true}
			PopperProps={{
				sx: {
					'& .MuiTooltip-tooltip': {
						backgroundColor: 'rgba(255, 255, 255, 0.95)', // Set the background color with 80% opacity
						color: 'black', // Ensure text is visible on white background
						border: '3px solid whitesmoke'
					},
					'& .MuiTooltip-arrow': {
						color: 'rgba(255, 255, 255, 0.8)', // Set the color of the arrow to match the tooltip background with 80% opacity
						border: '3px solid whitesmoke'
					},
				},
			}}
			title={
				<TooltipContent>
					<div style={{ fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: parsedExplanation }} />
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
							defaultValue={3}
							IconContainerComponent={iconContainer}
							getLabelText={(value) => customIcons[value].label}
							highlightSelectedOnly
						/>
						<IconWrapper>
							<ThumbUpIcon fontSize="small" style={{ color: c.bipolar.pos }} />
						</IconWrapper>
					</ValuationWrapper>
				</TooltipContent>
			}
			arrow // Ensure the arrow is enabled
		>
			{cat ? (
				cat.isMajorInActual ? (
					<RadioButtonCheckedIcon 
						style={{
							position: 'absolute',
							top: '2px',
							right: '1px',
							fontSize: '15px',
							color: 'black',
							cursor: 'pointer',
							zIndex: 1
						}}
					/>
				) : cat.isMinorInActual ? (
					<RadioButtonUncheckedIcon 
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
				) : (
					<ErrorOutlineIcon 
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
					)
			) : (
				<ErrorOutlineIcon 
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
			)}
		</Tooltip>
	);
}

export default TooltipForAlgoEff;
