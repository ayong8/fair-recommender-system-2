import React, { useEffect, useState, useRef } from 'react';
import { MenuItem, FormControl, Select, InputLabel, Slider, Button as MuiButton } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import $ from 'jquery';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';

import Panel from './Panel';
import drawPaths from './util/drawPaths';
import './App.css';

const MainViewWrapper = styled.div.attrs({
  className: 'main_view_wrapper'
})`
  display: flex;
  width: 1000px;
`;

const Header = styled.div.attrs({
  className: 'header'
})`
  height: 25px;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 10px;
`;

const BipolarSliderWrapper = styled.div.attrs({
  className: 'bipolar_slider_wrapper'
})`
  width: 100%;
  text-align: center;
`;

const BipolarTextWrapper = styled.div.attrs({
  className: 'bipolar_slider_wrapper'
})`
  text-align: left;
  padding-left: 50px;
`;

const WrapperForMe = styled.div.attrs({
  className: 'wrapper_for_me'
})`
  text-align: center;
`;

const WrapperForOthers = styled.div.attrs({
  className: 'wrapper_for_others'
})`
  text-align: center;
`;

const TitleMe = styled.div.attrs({
  className: 'title_me'
})`
  font-size: 1.5rem;
  font-weight: 800;
  margin-top: 12.5px;
  margin-bottom: 12.5px;
`;

const WrapperForMyCategory = styled.div.attrs({
  className: 'wrapper_for_my_category'
})`
  width: 300px;
  display: flex;
  padding: 10px;
  // background-color: whitesmoke;
`;

const WrapperForOthersCategory = styled.div.attrs({
  className: 'wrapper_for_others_category'
})`
  display: flex;
  padding: 10px;
`;

const theme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'PT Sans Narrow',
      textTransform: 'none',
      // fontSize: 16,
    },
  },
});

const marks = [
  { value: -1, label: 'Personalization' },
  { value: "I'm balanced", label: '' },
  { value: 1, label: 'Diversity' }
];

const valueLabelFormat = (value) => {
  // Customize the label text based on the value
  if (value < 0) return 'Low';
  if (value == 0) return 'Medium';
  if (value > 0) return 'High';
  return 'Very High';
};

function App() {
  const initialized = useRef(null);
  const ref = useRef(false);
  const [ users, setUsers ] = useState([]);
  const [ catsActualUser, setCatsActualUser ] = useState([]);
  const [ catsPredUser, setCatsPredUser ] = useState([]);
  const [ catsActualOthers, setCatsActualOthers ] = useState([]);
  const [ catsPredOthers, setCatsPredOthers ] = useState([]);
  // const [ commonCats, setCommonCats ] = useState({}); // Identify common categories within actual-pred and predMe-predOthers
  const [ selectedUserId, setSelectedUserId ] = useState(460523);
  const [ selectedOthers, setSelectedOthers ] = useState('all_users')
  const [ selectedEntry, setSelectedEntry ] = useState({});
  
  console.log('selected cat: ', selectedEntry.measures);

  const loadData = () => {
    axios.get('http://localhost:8000/news_rec/loadData/')
      .then((res) => {
        setUsers(res.data.userInfo);
        setCatsActualUser(res.data.catsActualUser);
        setCatsPredUser(res.data.catsPredUser);
        setCatsActualOthers(res.data.catsActualOthers);
        setCatsPredOthers(res.data.catsPredOthers);
        // setCommonCats({
        //   'commonCatsWithinMe': _.intersectionBy(res.data.catsActualUser, res.data.catsPredUser, 'name'),
        //   'commonCatsBtnMeOthers': _.intersectionBy(res.data.catsPredUser, res.data.catsPredOthers, 'name')
        // });
      });
  }
  
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      loadData();
    }
    const svg = $(ref.current);
    const commonCatsWithinMe = _.intersectionBy(catsActualUser, catsPredUser, 'name');
        // commonCatsBtnMeOthers = _.intersectionBy(catsPredUser, catsPredOthers, 'name');

    console.log('within useeffect: ', commonCatsWithinMe);
    commonCatsWithinMe.forEach(cat => {
      // return <path
      //  id={`path-from-actual-to-pred-user-${cat.name}`}
      //  d="M0 0"         
      //  stroke="#000" 
      //  fill="none" 
      //  strokeWidth="2px"

      const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      $(newPath).attr({
        id: `path-from-actual-to-pred-user-${cat.name}`,
        d: 'M10 10 L90 90',
        stroke: 'black',
        'stroke-width': 2,
        fill: 'none'
      });
      
      svg.append(newPath);
    //  />
    });
    drawPaths(catsActualUser, catsPredUser, catsPredOthers);
  }, [ref.current, catsActualUser]);

  // if (!catsActualUser || catsActualUser.length == 0)
  //   return <div />  

  return (
    <div className="App">
      <Header>Interactive RS</Header>
      <ThemeProvider theme={theme}>
        <FormControl sx={{ m: 1, minWidth: 120, marginTop: '10px' }} size="small">
          <InputLabel id="demo-select-small-label" sx={{ '&.MuiInputLabel-shrink': {} }}>Selected user</InputLabel>
          <Select
            labelId="demo-select-small-label"
            id="demo-select-small"
            value={selectedUserId}
            label="Selected user"
            onChange={(e) => setSelectedUserId(e.target.value)}
            sx={{
              height: '2.5rem',
              color: 'black',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'gray'
              },
              '& .MuiSvgIcon-root': {
                color: 'gray'
              },
            }}
          >
            {users.map((u) => (
              <MenuItem key={u.userID} value={u.userID}>User {u.userID}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <BipolarSliderWrapper>
          <BipolarTextWrapper>What you want?</BipolarTextWrapper>
          <Slider
            sx={{ width: '40%' }}
            aria-label="Always visible"
            defaultValue={0}
            // getAriaValueText={valuetext}
            step={0.1}
            min={-1} 
            max={1}
            marks={marks}
            valueLabelFormat={valueLabelFormat}
            valueLabelDisplay="on"
          />
        </BipolarSliderWrapper>
        <MainViewWrapper>
          <WrapperForMe>
            <TitleMe>Me</TitleMe>
            <WrapperForMyCategory>
              <Panel 
                panelID={'actualUser'}
                dataType={'preference'} 
                userType={'user'} 
                cats={catsActualUser} 
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
              />
              <Panel 
                panelID={'predUser'}
                dataType={'recommendations'} 
                userType={'user'} 
                cats={catsPredUser}
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
              />
            </WrapperForMyCategory>
          </WrapperForMe>
          <WrapperForOthers>
            {/* Dropdown menu for selecting others */}
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="demo-select-small-label" sx={{ '&.MuiInputLabel-shrink': {} }}>Select others</InputLabel>
              <Select
                labelId="demo-select-small-label"
                id="demo-select-small"
                value={selectedOthers}
                label="Selected user"
                onChange={(e) => setSelectedOthers(e.target.value)}
                sx={{
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  height: '2.5rem',
                  color: 'black',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'gray'
                  },
                  '& .MuiSvgIcon-root': {
                    color: 'gray'
                  },
                }}
              >
                <MenuItem key={'all_users'} value={'all_users'}>All users</MenuItem>
                <MenuItem key={'trending'} value={'trending'}>Trending</MenuItem>
              </Select>
            </FormControl>
            <WrapperForOthersCategory>
              {/* <CategoryDist dataType={'Preference'} cats={userCatsActual} /> */}
              <Panel 
                panelID={'predOthers'}
                dataType={'recommendations'} 
                userType={'others'} 
                cats={catsPredOthers}
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
              />
            </WrapperForOthersCategory>
          </WrapperForOthers>
          <div id="svgContainer">
            <svg ref={ref} id="svg1" width="0" height="0">
              {/* {commonCatsWithinMe.map(cat => {
                return <path
                  id={`path-from-actual-to-pred-user-${cat.name}`}
                  d="M0 0"         
                  stroke="#000" 
                  fill="none" 
                  strokeWidth="2px"
                />
              })}
              {commonCatsBtnMeOthers.map(cat => {
                return <path
                  id={`path-from-pred-me-to-others-${cat.name}`}
                  d="M0 0"         
                  stroke="#000" 
                  fill="none" 
                  strokeWidth="2px"
                />
              })} */}
            </svg>
          </div>
        </MainViewWrapper>
      </ThemeProvider>
    </div>
  );
}

export default App;
