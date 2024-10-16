import React, { useEffect, useState, useRef } from 'react';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import $ from 'jquery';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import { l, c } from './GlobalStyles';

import Panel from './Panel';
import drawPaths from './util/drawPaths';
import './App.css';
import SelectUser from './SelectUser';
import SelectOthers from './SelectOthers';
import BipolarValueSlider from './BipolarValueSlider';

const MainViewWrapper = styled.div.attrs({
  className: 'main_view_wrapper'
})`
  display: flex;
  width: 1000px;
  height: ${l.cd.h}px;
`;

const Header = styled.div.attrs({
  className: 'header'
})`
  height: 25px;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 10px;
`;

const WrapperForMe = styled.div.attrs({
  className: 'wrapper_for_me'
})`
  height: 100%;
  text-align: center;
  background-color: whitesmoke;
`;

const WrapperForOthers = styled.div.attrs({
  className: 'wrapper_for_others'
})`
  height: 100%;
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
  height: ${l.cd.h}px;
  display: flex;
  padding: 10px;
  // background-color: whitesmoke;
`;

const WrapperForOthersCategory = styled.div.attrs({
  className: 'wrapper_for_others_category'
})`
  height: ${l.cd.h}px;
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

function App() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [catsActualUser, setCatsActualUser] = useState([]);
  const [catsPredUser, setCatsPredUser] = useState([]);
  const [catsActualOthers, setCatsActualOthers] = useState([]);
  const [catsPredOthers, setCatsPredOthers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(460523);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Add these new state variables
  const [showTopicHighlight, setShowTopicHighlight] = useState(true);
  const [bipolarColorScale, setBipolarColorScale] = useState({ 'personalization': c.negative, 'diversity': c.positive });
  const [selectedEntry, setSelectedEntry] = useState({});
  const [selectedOthers, setSelectedOthers] = useState('all_users');

  // Add this ref
  const ref = useRef(null);
  let commonCatsWithinMe = [];
// if (!catsActualUser || catsActualUser.length == 0)
//   return <div />  


  // // Add this function to handle bipolar color scale changes
  // const handleBipolarColorScaleChange = (newScale) => {
  //   setBipolarColorScale(newScale);
  // };

  // Initial load using GET method
  useEffect(() => {
    const initialLoadData = async () => {
      try {
        const response = await axios.get('http://localhost:8000/news_rec/loadData/');
        const data = response.data;
        setUsers(data.users);
        setUser(data.user);
        setCatsActualUser(data.catsActualUser);
        setCatsPredUser(data.catsPredUser);
        setCatsActualOthers(data.catsActualOthers);
        setCatsPredOthers(data.catsPredOthers);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };

    initialLoadData();
  }, []);

  // Update data when selectedUserId changes using POST method
  useEffect(() => {
    const updateUserData = async () => {
      if (isInitialLoad.current) return; // Skip if it's the initial load

      setIsLoading(true);
      try {
        const response = await axios.post('http://localhost:8000/news_rec/loadData/', {
          user_id: selectedUserId
        });
        const data = response.data;
        setUser(data.user);
        setCatsActualUser(data.catsActualUser);
        setCatsPredUser(data.catsPredUser);
        setCatsActualOthers(data.catsActualOthers);
        setCatsPredOthers(data.catsPredOthers);
      } catch (error) {
        console.error('Error updating user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    updateUserData();
  }, [selectedUserId]);

  // Render lines between categories to represent miscalibration
  useEffect(() => {
    const svg = $(ref.current);
    commonCatsWithinMe = _.intersectionBy(catsActualUser, catsPredUser, 'name');
    drawPaths(svg, catsActualUser, catsPredUser);
  }, [ref.current, catsActualUser]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Header>Interactive RS</Header>
      <ThemeProvider theme={theme}>
        <div style={{ display: 'flex' }}>
        <SelectUser 
          selectedUserId={selectedUserId}
          setSelectedUserId={setSelectedUserId}
          users={users}
        />
        <FormGroup sx={{ width: '300px' }}>
          <FormControlLabel 
            control={
              <Switch 
                  checked={showTopicHighlight}
                  onChange={() => setShowTopicHighlight(prev => !prev)}
                  defaultChecked />
              } 
            label="Show topic highlight" 
          />
        </FormGroup>
        </div>
        <BipolarValueSlider 
          setBipolarColorScale={setBipolarColorScale}
        />
        <MainViewWrapper>
          <WrapperForMe>
            <TitleMe>Me</TitleMe>
            <WrapperForMyCategory>
              <Panel 
                panelID={'actualUser'}
                dataType={'Preferred'} 
                userType={'user'}
                user={user}
                majorPrefMeasure={user.major_pref_amp}
                minorPrefMeasure={user.minor_pref_deamp}
                cats={catsActualUser} 
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColorScale={bipolarColorScale}
              />
              <Panel 
                panelID={'predUser'}
                dataType={'Recommended'} 
                userType={'user'}
                user={user}
                majorPrefMeasure={user.major_pref_amp}
                minorPrefMeasure={user.minor_pref_deamp}
                cats={catsPredUser}
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColorScale={bipolarColorScale}
              />
            </WrapperForMyCategory>
          </WrapperForMe>
          <WrapperForOthers>
            {/* Dropdown menu for selecting others */}
            <SelectOthers 
	            selectedOthers={selectedOthers}
	            setSelectedOthers={setSelectedOthers}
            />
            <WrapperForOthersCategory>
              {/* <CategoryDist dataType={'Preference'} cats={userCatsActual} /> */}
              <Panel 
                panelID={'predOthers'}
                dataType={'Recommended'} 
                userType={'others'}
                user={user}
                majorPrefMeasure={user.major_pref_amp}
                minorPrefMeasure={user.minor_pref_deamp}
                cats={catsPredOthers}
                selectedEntry={selectedEntry}
                setSelectedEntry={setSelectedEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColorScale={bipolarColorScale}
              />
            </WrapperForOthersCategory>
          </WrapperForOthers>
          <div id="svgContainer">
            <svg ref={ref} id="svg1" width="0" height="0">
              {commonCatsWithinMe.map(cat => {
                return <path
                  id={`path-from-actual-to-pred-user-${cat.name}`}
                  d="M0 0"         
                  stroke="#000" 
                  fill="none" 
                  strokeWidth="2px"
                />
              })}
              {/* {commonCatsBtnMeOthers.map(cat => {
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
