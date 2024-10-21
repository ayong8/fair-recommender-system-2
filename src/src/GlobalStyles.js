import * as d3 from 'd3';
import styled from "styled-components";

export const l = {
  // cd: CategoryDist
  cd: {
    h: 700,
    minH: 15
  }
};

export const c = {
  actualUser: 'lightgray', // 'lavender',
  predUser: 'lightgray', //'mediumpurple',
  predOthers: 'lightgray', // 'pink',
  personalization: 'orange',
  diversity: 'mediumpurple',
  positive: 'green',
  negative: 'red',
  system: "#433155",
  systemBright: "rgb(127, 98, 156)",
  systemLight: "#c2c8d4",
  highlight: "#4c51c6",
  group: {
		'liberal': "#3c5d95", //"#0000ff", 
		'conservative': "#e5484a"// "#ff0000"
	},
};

export const CategoryWrapper = styled.div.attrs({
  className: 'category_wrapper'
})`
  	width: 100px;
	// minHeight: 20px;
	// background-color: whitesmoke;
	border: 2px white solid;
	border-radius: 5px;
	text-align: center;
	font-size: 0.8rem;
	margin: 0 auto;
	overflow-y: scroll;
  position: relative;
	// display: inline-block;
	// margin-right: 15px;
`;

export const CategoryOuter = styled.div.attrs({
  className: 'category_outer'
})`
  position: relative;
  padding-right: 15px;
`;

// D3 scales
export const majorPrefAmpScale = d3.scaleLinear()
  .domain([2, 0, -2])
  .range(['red', 'whitesmoke', 'green']);

export const minorPrefAmpScale = d3.scaleLinear()
  .domain([2, 0, -2])
  .range(['red', 'whitesmoke', 'green']);

export const stereotypeColorScale = d3.scaleLinear()
  .domain([-1, 0, 1])
  .range(['#ff9999', '#ffffff', '#99ff99']);

export const fontSizeScale = d3.scaleLinear()
  .domain([0.01, 0.1, 0.15, 0.5])
  .range(['8px', '10px', '17px', '17px']);