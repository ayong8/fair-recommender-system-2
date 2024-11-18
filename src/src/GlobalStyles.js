import * as d3 from 'd3';
import styled from "styled-components";
import { styled as muiStyled } from '@mui/material/styles';
import Rating from '@mui/material/Rating';

import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentSatisfiedIcon from '@mui/icons-material/SentimentSatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAltOutlined';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';

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
  border-radius: 5px;
  text-align: center;
  font-size: 0.8rem;
  overflow: auto;
  margin-bottom: 3px;
  border: 3px solid none;
`;

export const CategoryOuter = styled.div.attrs({
  className: 'category_outer'
})`
  position: relative;
  padding-right: 5px;
  // border: 1px solid white;
  border-radius: 7px;
  margin-bottom: 5px;
`;

export const MajorCategoryInActualAccent = styled.div.attrs({
  className: 'major-category-in-actual-accent'
})`
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 6px,
    white 6px,
    white 12px
  );
`;

export const MinorCategoryInActualAccent = styled.div.attrs({
  className: 'minor-category-in-actual-accent'
})`
  position: absolute;
  left: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background-image: repeating-linear-gradient(
    45deg,
    transparent 0px,
    transparent 2px,
    white 2px,
    white 4px
  );
`;

export const MajorCategoryInOthersAccent = styled.div.attrs({
  className: 'major-category-in-others-accent'
})`
  position: absolute;
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0px,
    transparent 6px,
    white 6px,
    white 12px
  );
`;

export const MinorCategoryInOthersAccent = styled.div.attrs({
  className: 'minor-category-in-others-accent'
})`
  position: absolute;
  right: 0;
  top: 0;
  width: 5px;
  height: 100%;
  background-image: repeating-linear-gradient(
    -45deg,
    transparent 0px,
    transparent 2px,
    white 2px,
    white 4px
  );
`;

export const ResizeControls = styled.div`
  position: absolute;
  left: 50%; // Center horizontally
  transform: translateX(-50%); // Adjust to center
  top: 47.5%; // Position at the bottom
  display: flex;
  flex-direction: row; // Ensure buttons are placed horizontally
  align-items: center; // Center align the buttons vertically
  opacity: 0;
  transition: opacity 300ms;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;

  ${CategoryWrapper}:hover & {
    opacity: 1;
  }
`;

export const ResizeButton = styled.button`
  padding: 4px;
  transition: background-color 300ms;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;

  &:hover:not(:disabled) {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    &:hover {
      background-color: transparent;
    }
  }

  svg {
    color: black
  }
`;

export const Divider = styled.div`
  width: 1px;
  background-color: rgba(0, 0, 0, 0.2); // Made
`;

export const StyledRating = muiStyled(Rating)(({ theme }) => ({
  '& .MuiRating-iconEmpty .MuiSvgIcon-root': {
    color: theme.palette.action.disabled,
  },
}));

export const algoEffRatingIcons = {
  1: { icon: <SentimentVeryDissatisfiedIcon color="error" />, 
       label: 'Very Dissatisfied',
       valueAlignment: 'harm' },
  2: { icon: <SentimentDissatisfiedIcon color="error" />,
       label: 'Dissatisfied', 
       valueAlignment: 'harm' },
  3: { icon: <SentimentSatisfiedIcon color="warning" />,
       label: 'Neutral',
       valueAlignment: 'neutral' },
  4: { icon: <SentimentSatisfiedAltIcon color="success" />,
       label: 'Satisfied', 
       valueAlignment: 'value' },
  5: { icon: <SentimentVerySatisfiedIcon color="success" />,
       label: 'Very Satisfied',
       valueAlignment: 'value' },
};

// D3 scales
export const bipolarValueScale = d3.scaleLinear()
  .domain([0, 0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 0.9, 1])
  .range(['#b13f64', '#dd686c', '#f19c7c', '#f6d2a9', 'whitesmoke', '#eafff9', '#a2fdd9', '#82dbb8', '#53ab8b']);

// export const majorPrefAmp = d3.scaleLinear()
//   .domain([2, 0, -2])
//   .range(['red', 'whitesmoke', 'green']);

// export const majorPrefAmp = d3.scaleLinear()
//   .domain([2, 0, -2])
//   .range(['red', 'whitesmoke', 'green']);

// export const stereotype = d3.scaleLinear()
//   .domain([-1, 0, 1])
//   .range(['#ff9999', '#ffffff', '#99ff99']);

export const twoToneIconStyle = { backgroundColor: '#ffffff96', borderRadius: "100%" }

export const fontSizeScale = d3.scaleLinear()
  .domain([0.01, 0.1, 0.15, 0.5])
  .range(['9px', '15px', '18px', '20px']);

export const lineWidthScale = d3.scaleLinear() // From category ratio to category lines
  .domain([0, 1])
  .range([2, 50]);

export const setAlgoEffColorScales = (bipolarScore) => {
  const createScale = (domain, range) => d3.scaleLinear()
    .domain(domain)
    .range(range);

  const prefDiversity = bipolarScore >= 0.5;
  const [negColor, posColor] = prefDiversity 
    ? [c.bipolar.pos, c.bipolar.neg] 
    : [c.bipolar.neg, c.bipolar.pos];

  return {
    filterBubble: createScale([-1, 0, 1], [negColor, 'rgb(229,228,226)', posColor]),
    miscalibration: createScale([0, 0.1, 0.5], [posColor, 'rgb(229,228,226)', negColor]),
    stereotype: createScale([-0.3, 0, 1], [posColor, 'rgb(229,228,226)', negColor]),
    popularityBias: createScale([-0.3, 0, 1], [posColor, 'rgb(229,228,226)', negColor])
  }
}

export const highlightCategoryBorder = (cat, hoveredEntry, selectedEntry, categoryColor) => {
  return ((hoveredEntry.name === cat.name) || (selectedEntry.name === cat.name))
  ? '2.5px solid black' 
  : `2.5px solid ${d3.color(categoryColor).darker(0.1)}`;
};

export const getCategoryOuterClassName = (cat) => {
  return cat.isMajorInActual
  ? 'major_category_wrapper'
  : (cat.isMinorInActual 
    ? 'minor_category_wrapper'
    : 'normal_category_wrapper');
}

export const getCategoryOuterStyle = (cat, colorScales, majorPrefMeasure, minorPrefMeasure) => {
  return cat.isMajorInActual
  ? { backgroundColor: colorScales.majorPrefAmp(majorPrefMeasure) }
  : (cat.isMinorInActual 
    ? { backgroundColor: colorScales.majorPrefAmp(minorPrefMeasure) }
    : { border: 'none' });
}

export const getPredPanelStyles = (panelID, colorScales, stereotype) => {
  return ((panelID === 'predUser') || (panelID === 'predOthers')) ? {
    // backgroundColor: colorScales.stereotype(stereotype),
    position: 'relative',
    paddingRight: '15px'
  } : { paddingRight: '25px' };
}

export const tooltipStyles = {
    className: 'tooltip_stereotype',
    PopperProps: {
        sx: {
            '& .MuiTooltip-tooltip': {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                color: 'black',
                border: '3px solid whitesmoke'
            },
            '& .MuiTooltip-arrow': {
                color: 'rgba(255, 255, 255, 0.8)',
                border: '3px solid whitesmoke'
            },
        },
    }
};

export const isDarkColor = (color) => {
  // Convert hex to RGB
  const rgb = parseInt(color.replace('#', ''), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;

  // Calculate perceived brightness
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b);

  // Adjust the threshold for leniency
  return brightness < 180; // Adjusted threshold for leniency
};

export const isColorInRange = (color, higherThreshold) => {
  const colorScale = ['whitesmoke', higherThreshold];

  // Convert hex to RGB
  const hexToRgb = (hex) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    return {
      r: (rgb >> 16) & 0xff,
      g: (rgb >>  8) & 0xff,
      b: (rgb >>  0) & 0xff,
    };
  };

  // Get RGB values of the input color
  const inputRgb = hexToRgb(color);

  // Check if the input color is close to any color in the scale
  return colorScale.some((scaleColor) => {
    const scaleRgb = hexToRgb(scaleColor);
    const distance = Math.sqrt(
      Math.pow(inputRgb.r - scaleRgb.r, 2) +
      Math.pow(inputRgb.g - scaleRgb.g, 2) +
      Math.pow(inputRgb.b - scaleRgb.b, 2)
    );
    return distance < 50; // Adjust the threshold for closeness
  });
};