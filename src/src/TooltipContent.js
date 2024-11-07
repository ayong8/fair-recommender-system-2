import React from 'react';
import styled from 'styled-components';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

import { c, algoEffRatingIcons, StyledRating } from './GlobalStyles';

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

const TooltipContentWrapper = styled.div`
  max-width: 200px;
  padding: 10px;
  box-sizing: border-box;
  font-family: PT Sans Narrow;
`;

const TooltipContent = ({ explanation, ratingValue, onValueAlignmentChange }) => {
  const iconContainer = (props) => {
    const { value, ...other } = props;
    return <span {...other}>{algoEffRatingIcons[value].icon}</span>;
  };

  return (
    <TooltipContentWrapper>
      <div style={{ fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: explanation }} />
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
          onChange={onValueAlignmentChange}
          IconContainerComponent={iconContainer}
          getLabelText={(value) => algoEffRatingIcons[value].label}
          highlightSelectedOnly
        />
        <IconWrapper>
          <ThumbUpIcon fontSize="small" style={{ color: c.bipolar.pos }} />
        </IconWrapper>
      </ValuationWrapper>
    </TooltipContentWrapper>
  );
};

export default TooltipContent; 