import React from 'react';
import * as d3 from 'd3';
import { Tooltips } from './Tooltips';
import IconForMiscalibration from './IconForMiscalibration';

const TooltipForMiscalibration = ({ 
	cat, 
	algoEff, 
	miscalibrationScale, 
	onValueAlignmentChange 
}) => {
	const IconComponent = () => {
		return (
			!cat.isSmall ? (
				<IconForMiscalibration 
					style={{
						position: 'absolute',
						left: '5px',
						top: '2.5%',
						fontSize: '25px',
						color: d3.color(miscalibrationScale(cat.measures.miscalibration)).darker(0.5),
						zIndex: 1000
					}}
				/>
			) : (
				<IconForMiscalibration 
					style={{
						position: 'absolute',
						right: '5px',
						top: '2.5%',
						fontSize: '25px',
						color: d3.color(miscalibrationScale(cat.measures.miscalibration)).darker(0.5),
						zIndex: 1000
					}}
				/>
			)
		);
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

export default TooltipForMiscalibration;
