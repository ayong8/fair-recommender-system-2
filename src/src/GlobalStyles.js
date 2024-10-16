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