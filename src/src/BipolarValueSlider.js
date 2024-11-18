import React, { useState, useMemo } from 'react';
import { Slider, Switch } from '@mui/material';
import styled from 'styled-components';
import { l, c, setAlgoEffColorScales } from './GlobalStyles';

const BipolarSliderWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	width: 100%;
	text-align: center;
  padding: 5px 0;
	background-color: whitesmoke;
  `;

const marks = [
	{ value: 0, label: 'Personalization' },
	{ value: "I'm balanced", label: '' },
	{ value: 1, label: 'Diversity' }
];



const BipolarValueSlider = ({
	bipolarScore,
  switchValuePrefForMe,
  switchValuePrefForOthers,
	handleBipolarScoreChange,
	setBipolarColor,
	setColorScales,
  setSwitchValuePrefForMe,
  setSwitchValuePrefForOthers
}) => {
  const bipolarValue = (bipolarScore > 0.5) ? 'diversity' : ((bipolarScore < 0.5) ? 'personalization' : 'equal');

	const handleSwitchChangeForWant = (event) => {
		setSwitchValuePrefForMe(prevState => ({
			...prevState,
			[bipolarValue]: event.target.checked
		}));
	}

	const handleSwitchChangeForNotWant = (event) => {
		setSwitchValuePrefForOthers(prevState => ({
			...prevState,
			[bipolarValue]: event.target.checked
		}));
	}

  const textForBipolarValue = {
    personalization: {
      overall: (
          <>"I prefer to see more personalized news <span style={{ fontWeight: 600, fontStyle: 'italic' }}>
            <br />based on</span> my interest."</>
      ),
      specific: {
        want: (
            <>I prefer to see more news that is personalized
          <br />
            based on my interaction history.</>
        ),
        notWant: (
            <>I prefer to ignore news that comes from 
              <br />
              other users' preferences.</>
        )
      }
    },
    equal: {
      overall: (
        <>"I'm balanced."</>
      ),
      specific: { want: (<></>), notWant: (<></>)}
    },
    diversity: {
      overall: (
          <>"I prefer to see more diverse news <span style={{ fontWeight: 600, fontStyle: 'italic' }}>
            <br />outside of</span> my interest."</>
      ),
      specific: {
        want: (
            <>I don't want the algorithm to personalize news
            <br />
             solely based on my interaction history.</>
        ),
        notWant: (
            <>I am open to seeing news that comes from
              <br />
              other users' preferences.</>
        )
      }
    }
  }

  const valuationLabelFormat = (value) => {
    return (
      <div
        style={{ lineHeight: 1, margin: 3 }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={{ fontSize: '1rem' }}>
          {textForBipolarValue[bipolarValue].overall}
        </div>
        {/* <br /> */}
        {/* <div style={{ textAlign: 'left', paddingBottom: 3 }}>What is your detalied preference on {bipolarValue}?</div>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            textAlign: 'left',
            marginBottom: 5,
          }}
        >
          <Switch
            checked={switchValuePrefForMe[bipolarValue]}
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
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            textAlign: 'left',
          }}
        >
          <Switch
            checked={switchValuePrefForOthers[bipolarValue]}
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
        </div> */}
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
			? `rgba(100, 100, 100, ${1 - 2 * bipolarScore})` 
			: 'rgba(100, 100, 100, 0)';
		const rightColor = bipolarScore >= 0.5 
			? `rgba(100, 100, 100, ${2 * bipolarScore - 1})` 
			: 'rgba(100, 100, 100, 0)';
		return `linear-gradient(to right, ${leftColor}, ${baseColor} 50%, ${rightColor})`;
	}, [bipolarScore]);

	return (
		<BipolarSliderWrapper>
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
            fontWeight: 600
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
        onChange={handleBipolarScoreChange}
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
