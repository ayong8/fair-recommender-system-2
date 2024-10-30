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
  bipolar: { pos: '#53ab8b', neg: '#b13f64' },
  system: "#433155",
  systemBright: "rgb(127, 98, 156)",
  systemLight: "#c2c8d4",
  highlight: "#4c51c6",
  group: {
		'liberal': "#3c5d95", //"#0000ff", 
		'conservative': "#e5484a"// "#ff0000"
	},
  gradientColorStops: {
    'personalization': ['#53ab8b', '#82dbb8', '#a2fdd9', '#eafff9', 'whitesmoke', '#f6d2a9', '#f19c7c', '#dd686c', '#b13f64'],
    'diversity':['#b13f64', '#dd686c', '#f19c7c', '#f6d2a9', 'whitesmoke', '#eafff9', '#a2fdd9', '#82dbb8', '#53ab8b']
  }
};

export const CategoryWrapper = styled.div.attrs({
  className: 'category_wrapper'
})`
  width: 100px;
	border: 2px white solid;
	border-radius: 5px;
	text-align: center;
	font-size: 0.8rem;
	overflow-y: scroll;
  position: relative;
`;

export const CategoryOuter = styled.div.attrs({
  className: 'category_outer'
})`
  position: relative;
  padding-right: 15px;
  border: 1px solid white;
  border-radius: 7px;
`;

// D3 scales
export const bipolarValueScale = d3.scaleLinear()
  .domain([0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 1])
  .range(['#b13f64', '#dd686c', '#f19c7c', '#f6d2a9', 'whitesmoke', '#eafff9', '#a2fdd9', '#82dbb8', '#53ab8b']);

// export const majorPrefAmpScale = d3.scaleLinear()
//   .domain([2, 0, -2])
//   .range(['red', 'whitesmoke', 'green']);

// export const minorPrefAmpScale = d3.scaleLinear()
//   .domain([2, 0, -2])
//   .range(['red', 'whitesmoke', 'green']);

// export const stereotypeColorScale = d3.scaleLinear()
//   .domain([-1, 0, 1])
//   .range(['#ff9999', '#ffffff', '#99ff99']);

export const fontSizeScale = d3.scaleLinear()
  .domain([0.01, 0.1, 0.15, 0.5])
  .range(['8px', '10px', '17px', '17px']);


export const setAlgoEffColorScales = (bipolarScore) => {
  const createScale = (domain, range) => d3.scaleLinear()
    .domain(domain)
    .range(range);

  const prefDiversity = bipolarScore >= 0.5;
  const [negColor, posColor] = prefDiversity 
    ? [c.bipolar.pos, c.bipolar.neg] 
    : [c.bipolar.neg, c.bipolar.pos];

  return {
    majorPrefAmpScale: createScale([-2, 0, 2], [negColor, 'whitesmoke', posColor]),
    minorPrefAmpScale: createScale([-2, 0, 2], [negColor, 'whitesmoke', posColor]),
    miscalibrationScale: createScale([0, 0.05, 0.5], [posColor, 'whitesmoke', negColor]),
    stereotypeColorScale: createScale([-0.3, 0, 1], [posColor, 'whitesmoke', negColor])
  }
}

// Dynamic styling
export const highlightCategoryBorder = (cat, hoveredEntry, selectedEntry) => {
  return ((hoveredEntry.name === cat.name) || (selectedEntry.name === cat.name))
  ? '3px solid blue' 
  : (cat.isMajorInActual ? '3px solid black' : null);
};
