import React, { useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import $ from 'jquery';
import styled from 'styled-components';

import drawPaths from './util/drawPaths';
import { l, c } from './GlobalStyles';

const BipolarSliderWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	width: 100%;
	text-align: center;
  `;
  
  const BipolarTextWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	text-align: left;
	padding-left: 50px;
  `;

const marks = [
	{ value: -1, label: 'Personalization' },
	{ value: "I'm balanced", label: '' },
	{ value: 1, label: 'Diversity' }
];

const valueLabelFormat = (value) => {
	// Customize the label text based on the value
	if (value < 0) return 'I prefer to see personalized news based on my interaction history.';
	if (value == 0) return "I'm balanced ";
	if (value > 0) return 'I prefer to see more diverse news.';
	return 'Very High';
};
  

const BipolarValueSlider = ({
	setBipolarColorScale
}) => {
	const handleChange = (e) => {
		const bipolarValue = e.target.value;
		if (bipolarValue >= 0)
			setBipolarColorScale({ 'personalization': c.negative, 'diversity': c.positive });
		else if (bipolarValue < 0)
			setBipolarColorScale({ 'personalization': c.positive, 'diversity': c.negative });
		// if (value >= 0)
		// 	setBipolarColorScale(colorScale => {
		// 		colorScale.range([l.negative, l.positive]);
		// 	});
		// else if (value < 0)
		// 	setBipolarColorScale(colorScale => {
		// 		colorScale.range([l.positive, l.negative]);
		// 	});
	}
	

	return (
		<BipolarSliderWrapper>
          <BipolarTextWrapper>What you want?</BipolarTextWrapper>
          <Slider
            sx={{ width: '40%' }}
            aria-label="Always visible"
            defaultValue={0}
            // getAriaValueText={valuetext}
            step={0.1}
            min={-1} 
            max={1}
            marks={marks}
			onChange={handleChange}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="on"
          />
        </BipolarSliderWrapper>
	);
}

export default BipolarValueSlider;