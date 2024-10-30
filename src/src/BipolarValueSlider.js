import React, { useState, useMemo } from 'react';
import { Slider, Switch } from '@mui/material';
import styled from 'styled-components';

import drawPaths from './util/drawPaths';
import { l, c, setAlgoEffColorScales } from './GlobalStyles';

const BipolarSliderWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	width: 100%;
	text-align: center;
  margin-top: 20px;
  padding: 5px 0;
	background-color: whitesmoke;
  `;
  
  const BipolarTextWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	text-align: left;
	padding-left: 10px;
  `;

const marks = [
	{ value: 0, label: 'Personalization' },
	{ value: "I'm balanced", label: '' },
	{ value: 1, label: 'Diversity' }
];



const BipolarValueSlider = ({
	bipolarScore,
  switchValuePrefForWant,
  switchValuePrefForNotWant,
	setBipolarScore,
	setBipolarColor,
	setColorScales,
  setSwitchValuePrefForWant,
  setSwitchValuePrefForNotWant
}) => {
  const bipolarValue = bipolarScore >= 0.5 ? 'diversity' : 'personalization';

	const handleChange = (event, newBipolarScore) => {
		setBipolarScore(newBipolarScore);
		setColorScales(setAlgoEffColorScales(newBipolarScore));

    if (newBipolarScore >= 0.5) {
      setBipolarColor({ 'personalization': c.bipolar.neg, 'diversity': c.bipolar.pos });
    } else if (newBipolarScore < 0.5) {
      setBipolarColor({ 'personalization': c.bipolar.pos, 'diversity': c.bipolar.neg });
    }
	}

	const handleSwitchChangeForWant = (event) => {
		setSwitchValuePrefForWant(prevState => ({
			...prevState,
			[bipolarValue]: event.target.checked
		}));
	}

	const handleSwitchChangeForNotWant = (event) => {
		setSwitchValuePrefForNotWant(prevState => ({
			...prevState,
			[bipolarValue]: event.target.checked
		}));
	}

  const textForBipolarValue = {
    personalization: {
      overall: (
          <>"I prefer to see what I'm interested in."</>
      ),
      specific: {
        want: (
            <>I want to see more news personalized
              <br />
              toward my interaction history.</>
        ),
        notWant: (
            <>I don't want to see news outside of
              <br />
              toward my interaction history.</>
        )
      }
    },
    diversity: {
      overall: (
          <>"I prefer to see what others are interested in."</>
      ),
      specific: {
        want: (
            <>I want to see more news outside of
              <br />
              toward my interaction history.</>
        ),
        notWant: (
            <>I don't want to see news solely within
              <br />
              my interaction history.</>
        )
      }
    }
  }

  const valuationLabelFormat = (value) => {
    return (
      <div style={{ lineHeight: 1, margin: 3 }} onMouseDown={(e) => e.stopPropagation()}>
        <div style={{ fontSize: '1rem' }}>{textForBipolarValue[bipolarValue].overall}</div>
        <br />
        <div style={{ display: 'flex', alignItems: 'flex-start', textAlign: 'left', marginBottom: 5 }}>
          <Switch
            checked={switchValuePrefForWant[bipolarValue]}
            onChange={handleSwitchChangeForWant}
            size="small"
            sx={{
              '& .MuiSwitch-sizeSmall': {
                marginTop: '-5px',
              },
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div style={{ marginLeft: '10px' }}>
            {textForBipolarValue[bipolarValue].specific.want}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', textAlign: 'left' }}>
          <Switch
            checked={switchValuePrefForNotWant[bipolarValue]}
            onChange={handleSwitchChangeForNotWant}
            size="small"
            sx={{
              '& .MuiSwitch-sizeSmall': {
                marginTop: '-5px',
              },
            }}
            onMouseDown={(e) => e.stopPropagation()}
          />
          <div style={{ marginLeft: '10px' }}>
            {textForBipolarValue[bipolarValue].specific.notWant}
          </div>
        </div>
      </div>
    );
  };

	const gradientColors = bipolarScore >= 0.5 
    ? c.gradientColorStops.diversity
    : c.gradientColorStops.personalization;
	const gradientStops = gradientColors.map((color, index) => 
		`${color} ${index / (gradientColors.length - 1) * 100}%`
	).join(', ');



	const sliderBackground = useMemo(() => {
		const baseColor = 'rgb(211, 211, 211)'; // light gray
		const greenColor = 'rgb(0, 128, 0)'; // green
		const leftColor = bipolarScore <= 0.5 
			? `rgba(0, 128, 0, ${1 - 2 * bipolarScore})` 
			: 'rgba(0, 128, 0, 0)';
		const rightColor = bipolarScore >= 0.5 
			? `rgba(0, 128, 0, ${2 * bipolarScore - 1})` 
			: 'rgba(0, 128, 0, 0)';
		return `linear-gradient(to right, ${leftColor}, ${baseColor} 50%, ${rightColor})`;
	}, [bipolarScore]);

	return (
		<BipolarSliderWrapper>
      <BipolarTextWrapper>What value do you pursue more?</BipolarTextWrapper>
      <Slider
        sx={{
          width: '40%',
          '& .MuiSlider-rail': {
            opacity: 0,
          },
          '& .MuiSlider-track': {
            opacity: 0,
          },
          '& .MuiSlider-thumb': {
            backgroundColor: 'white',
            border: '2px solid currentColor',
            zIndex: 3,
          },
          '& .MuiSlider-markLabel': {
            fontSize: '1.1rem',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            height: '12px',
            background: sliderBackground,
            zIndex: 1,
            borderRadius: '6px',
            border: '1px solid lightgray',
            boxSizing: 'border-box',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '2px',
            height: '20px',
            backgroundColor: 'white',
            zIndex: 2,
          },
        }}
        aria-label="Always visible"
        value={bipolarScore}
        onChange={handleChange}
        step={0.1}
        min={0} 
        max={1}
        marks={marks}
        valueLabelFormat={valuationLabelFormat}
        valueLabelDisplay="on"
      />
    </BipolarSliderWrapper>
	);
}

export default BipolarValueSlider;
