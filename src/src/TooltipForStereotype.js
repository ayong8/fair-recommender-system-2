import React from 'react';
import * as d3 from 'd3';
import { Tooltips } from './Tooltips';
import IconForStereotype from './IconForStereotype';

const TooltipForStereotype = ({ 
	user, 
	algoEff, 
	stereotypeScale, 
	onValueAlignmentChange 
}) => {
	const IconComponent = () => {
		if (user.stereotype > 0) {
			return (
				<IconForStereotype 
					style={{
						position: 'relative',
						left: '15px',
						top: '-10%',
						fontSize: '35px',
						color: d3.color(stereotypeScale(user.stereotype)).darker(0.5),
						margin: '-10px',
						zIndex: 1000
					}}
				/>
			);
		}
	};

	return (
		<Tooltips 
			algoEff={algoEff} 
			onValueAlignmentChange={onValueAlignmentChange} 
			IconComponent={IconComponent} 
		/>
	);
};

export default TooltipForStereotype;
