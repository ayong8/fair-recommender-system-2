import React from 'react';
import * as d3 from 'd3';
import { Tooltips } from './Tooltips';
import IconForPopularityBias from './IconForPopularityBias';

const TooltipForPopularityBias = ({ 
	cat, 
	algoEff, 
	popularityBiasScale, 
	onValueAlignmentChange 
}) => {
	const IconComponent = () => {
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

export default TooltipForPopularityBias;
