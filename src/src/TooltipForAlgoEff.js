import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import _ from 'lodash';

import { Tooltip } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
`;

const TooltipForAlgoEff = ({
	algoEff
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
			title={
				<TooltipContent>
					<div dangerouslySetInnerHTML={{ __html: parsedExplanation }} />
					<div style={{ marginTop: 10 }}>Valuation</div>
					<ValueNameWrapper>
						<div>Harm</div>
						<div>Value</div>
					</ValueNameWrapper>
					<ValuationWrapper>
						<IconWrapper>
							<ThumbDownIcon fontSize="small" style={{ color: 'red' }} />
						</IconWrapper>
						<StyledRating
							name="highlight-selected-only"
							defaultValue={3}
							IconContainerComponent={iconContainer}
							getLabelText={(value) => customIcons[value].label}
							highlightSelectedOnly
						/>
						<IconWrapper>
							<ThumbUpIcon fontSize="small" style={{ color: 'green' }} />
						</IconWrapper>
					</ValuationWrapper>
				</TooltipContent>
			}
		>
			<ErrorOutlineIcon 
				style={{
					position: 'absolute',
					top: '2px',
					right: '2px',
					fontSize: '13px',
					color: '#666',
					cursor: 'pointer',
					zIndex: 1
				}}
			/>
		</Tooltip>
	);
}

export default TooltipForAlgoEff;
