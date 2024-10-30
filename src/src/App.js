import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import $ from 'jquery';
import _ from 'lodash';
import axios from 'axios';
import styled from 'styled-components';
import { l, c, setAlgoEffColorScales } from './GlobalStyles';

import Feed from './Feed';
import Panel from './Panel';
import drawPaths from './util/drawPaths';
import './App.css';
import SelectUser from './SelectUser';
import SelectOthers from './SelectOthers';
import BipolarValueSlider from './BipolarValueSlider';
import { color } from 'd3';

const MainViewWrapper = styled.div.attrs({
  className: 'main_view_wrapper'
})`
  display: flex;
  width: 1000px;
  height: ${l.cd.h}px;
  position: relative;
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
  background-color: #e7e7e7;
`;

const WrapperForOthers = styled.div.attrs({
  className: 'wrapper_for_others'
})`
  height: 100%;
  text-align: center;
  margin-left: 10px;
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

const initialBipolarColors = { 
  'personalization': { 'neg': c.bipolar.neg, 'pos': c.bipolar.pos },
  'diversity': { 'neg': c.bipolar.neg, 'pos': c.bipolar.pos }
}

function App() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState({});
  const [catsActualUser, setCatsActualUser] = useState([]);
  const [catsPredUser, setCatsPredUser] = useState([]);
  const [catsActualOthers, setCatsActualOthers] = useState([]);
  const [catsPredOthers, setCatsPredOthers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(460523);
  const [algoEffs, setAlgoEffs] = useState({});
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);

  // Add these new state variables
  const [showTopicHighlight, setShowTopicHighlight] = useState(true);
  const [bipolarScore, setBipolarScore] = useState(0.5);
  const [bipolarColor, setBipolarColor] = useState(initialBipolarColors);
  const [colorScales, setColorScales] = useState(() => setAlgoEffColorScales(0.5));
  const [hoveredEntry, setHoveredEntry] = useState({});
  const [selectedEntry, setSelectedEntry] = useState({});
  const [selectedOthers, setSelectedOthers] = useState('all_users');
  const [switchValuePrefForWant, setSwitchValuePrefForWant] = useState({personalization: false, diversity: false});
  const [switchValuePrefForNotWant, setSwitchValuePrefForNotWant] = useState({personalization: false, diversity: false});

  const ref = useRef(null);

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
        setAlgoEffs(data.algoEffs);
        setItems(data.items);
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
        setAlgoEffs(data.algoEffs);
        setItems(data.items);
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
    drawPaths(
      $(ref.current), 
      catsActualUser, 
      catsPredUser,
      colorScales.miscalibrationScale
    );
  }, [ref.current, catsActualUser, catsPredUser, bipolarScore]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log('user: ', user)

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
      <Feed 
        selectedEntry={selectedEntry}
        items={items}
      />
      <div style={{ width: 500 }}>
        <Header>When you are not satisfied with RS</Header>
        <div></div>
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
          bipolarScore={bipolarScore}
          switchValuePrefForWant={switchValuePrefForWant}
          switchValuePrefForNotWant={switchValuePrefForNotWant}
          setBipolarScore={setBipolarScore}
          setBipolarColor={setBipolarColor}
          setColorScales={setColorScales}
          setSwitchValuePrefForWant={setSwitchValuePrefForWant}
          setSwitchValuePrefForNotWant={setSwitchValuePrefForNotWant}
        />
        <div style={{ fontSize: '1.2rem', marginTop: 20, marginBottom: 2.5 }}>How does the algorithm favor your value?</div>
        <MainViewWrapper>
          <WrapperForMe>
            <TitleMe>Me</TitleMe>
            <div>Algorithm boosted/not my preferences to recommendation.</div>
            <WrapperForMyCategory>
              <Panel 
                panelID={'actualUser'}
                dataType={'Preferred'} 
                userType={'user'}
                user={user}
                algoEffs={algoEffs}
                majorPrefMeasure={user.major_pref_amp}
                minorPrefMeasure={user.minor_pref_deamp}
                colorScales={colorScales}
                cats={catsActualUser}
                selectedEntry={selectedEntry}
                hoveredEntry={hoveredEntry}
                setSelectedEntry={setSelectedEntry}
                setHoveredEntry={setHoveredEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColor={bipolarColor}
              />
              <Panel 
                panelID={'predUser'}
                dataType={'Recommended'} 
                userType={'user'}
                user={user}
                algoEffs={algoEffs}
                majorPrefMeasure={user.major_pref_amp}
                minorPrefMeasure={user.minor_pref_deamp}
                colorScales={colorScales}
                cats={catsPredUser}
                selectedEntry={selectedEntry}
                hoveredEntry={hoveredEntry}
                setSelectedEntry={setSelectedEntry}
                setHoveredEntry={setHoveredEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColor={bipolarColor}
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
                colorScales={colorScales}
                cats={catsPredOthers}
                selectedEntry={selectedEntry}
                hoveredEntry={hoveredEntry}
                setSelectedEntry={setSelectedEntry}
                setHoveredEntry={setHoveredEntry}
                showTopicHighlight={showTopicHighlight}
                bipolarColor={bipolarColor}
              />
            </WrapperForOthersCategory>
          </WrapperForOthers>
          <div id="svgContainer" style={{ position: 'absolute', top: 100, left: 100 }}>
            <svg 
              id="svg1"
              ref={ref} 
              width="0" 
              height="0" 
            />
          </div>
        </MainViewWrapper>
      </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
