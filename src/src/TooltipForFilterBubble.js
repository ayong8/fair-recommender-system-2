import React from 'react';
import * as d3 from 'd3';
import { Tooltips } from './Tooltips';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import RemoveCircleOutlineTwoToneIcon from '@mui/icons-material/RemoveCircleOutlineTwoTone';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import AdjustIcon from '@mui/icons-material/Adjust';

import { twoToneIconStyle } from './GlobalStyles';
import IconForMajorAmplification from './IconForMajorAmplification';
import IconForMinorDeamplification from './IconForMinorDeamplification';

const TooltipForFilterBubble = ({ cat, algoEff, filterBubbleScale, onValueAlignmentChange }) => {
	const IconComponent = () => {
		console.log('cat in tooltipfilterbubble: ', cat.name, cat.measures.filterBubble)
		if (cat.measures.filterBubble > 0) {
			return (
				<IconForMajorAmplification 
					// sx={twoToneIconStyle}
					style={{
						position: 'relative',
							left: '0px',
							top: '50%',
							// transform: 'translateY(-50%)',
							fontSize: '25px',
							color: d3.color(filterBubbleScale(cat.measures.filterBubble)).darker(0.5),
							zIndex: 1000
					}}
				/>
			);
		}
		
		if (cat.measures.filterBubble < 0) {
			return (
				<IconForMinorDeamplification 
					// sx={twoToneIconStyle}
					style={{
						position: 'relative',
						left: '0px',
						top: '50%',
						// transform: 'translateY(-50%)',
						fontSize: '25px',
						color: d3.color(filterBubbleScale(cat.measures.filterBubble)).darker(0.5),
						zIndex: 1000
					}}
				/>
			);
		}
	};

	return (
		<Tooltips 
			cat={cat} 
			algoEff={algoEff} 
			onValueAlignmentChange={onValueAlignmentChange} 
			IconComponent={IconComponent} 
		/>
	);
};

export default TooltipForFilterBubble;
