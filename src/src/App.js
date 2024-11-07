import React, { useEffect, useState, useRef, useMemo } from 'react';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as d3 from 'd3';
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
  // height: ${l.cd.h}px;
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
  width: 150px;
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
  // height: ${l.cd.h}px;
  display: flex;
  padding: 10px;
  // background-color: whitesmoke;
`;

const WrapperForOthersCategory = styled.div.attrs({
  className: 'wrapper_for_others_category'
})`
  // height: ${l.cd.h}px;
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

axios.defaults.withCredentials = true;
axios.defaults.headers.common = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

const api = axios.create({
  baseURL: 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
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
  const [categoryPreferencesOnPred, setCategoryPreferencesOnPred] = useState({});
  const [topicPreferencesOnPred, setTopicPreferencesOnPred] = useState({});

  const [showTopicHighlight, setShowTopicHighlight] = useState(true);
  const [bipolarScore, setBipolarScore] = useState(0.5);
  const [bipolarColor, setBipolarColor] = useState(initialBipolarColors);
  const [colorScales, setColorScales] = useState(() => setAlgoEffColorScales(0.5));
  const [hoveredEntry, setHoveredEntry] = useState({});
  const [selectedEntry, setSelectedEntry] = useState({});
  const [selectedOthers, setSelectedOthers] = useState('all_users');

  // const [catRatioChange, setCatRatioChange] = useState({ name: null, change: null });
  const [switchValuePrefForMe, setSwitchValuePrefForMe] = useState(false);
  const [switchValuePrefForOthers, setSwitchValuePrefForOthers] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const ref = useRef(null);

  useEffect(() => {
    const initialLoadData = async () => {
      try {
        const response = await api.get('/news_rec/loadData/');
        const data = response.data;
        setUsers(data.users);
        setUser(data.user);
        setCatsActualUser(data.catsActualUser);
        setCatsPredUser(data.catsPredUser);
        setCatsActualOthers(data.catsActualOthers);
        setCatsPredOthers(data.catsPredOthers);
        setAlgoEffs(data.algoEffs);
        setItems(data.items);
        setCategoryPreferencesOnPred(data.categoryPreferencesOnPred);
        setTopicPreferencesOnPred(data.topicPreferencesOnPred);
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };

    initialLoadData();
  }, []);

  // // Update data when selectedUserId changes using POST method
  // useEffect(() => {
  //   const updateUserData = async () => {
  //     if (isInitialLoad.current) return; // Skip if it's the initial load

  //     setIsLoading(true);
  //     try {
  //       const response = await api.post('/news_rec/loadData/', {
  //         user_id: selectedUserId
  //       });
  //       const data = response.data;
  //       setUser(data.user);
  //       setCatsActualUser(data.catsActualUser);
  //       setCatsPredUser(data.catsPredUser);
  //       setCatsActualOthers(data.catsActualOthers);
  //       setCatsPredOthers(data.catsPredOthers);
  //       setAlgoEffs(data.algoEffs);
  //       setItems(data.items);
  //     } catch (error) {
  //       console.error('Error updating user data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   updateUserData();
  // }, [selectedUserId]);

  // Render lines between categories to represent miscalibration
  useEffect(() => {
    d3.selectAll('.path').remove();
    drawPaths(
      $(ref.current), 
      catsActualUser, 
      catsPredUser,
      colorScales.miscalibrationScale
    );
  }, [ref.current, catsActualUser, catsPredUser, bipolarScore]);

  const handleSetCatRatioChange = (name, delta, e) => {
    e.stopPropagation();

    const change = delta > 0 ? 'increased' : 'decreased';
    // setCatRatioChange({ name, change });

    const updatedPreferences = { ...categoryPreferencesOnPred };
    let newPreference = updatedPreferences[name] || 0;
    const margin = 0.1;
    const otherCategories = catsPredUser.filter(cat => cat.name !== name);
    const adjustmentPerCategory = 0.1 / otherCategories.length;

    if (change === 'increased') {
      newPreference += margin;
      otherCategories.forEach(otherCat => {
        updatedPreferences[otherCat.name] = Math.max((updatedPreferences[otherCat.name] || 0) - adjustmentPerCategory, 0.05);
      });
    } else if (change === 'decreased') {
      newPreference -= margin;
      otherCategories.forEach(otherCat => {
        updatedPreferences[otherCat.name] = Math.max((updatedPreferences[otherCat.name] || 0) + adjustmentPerCategory, 0.05);
      });
    }

    updatedPreferences[name] = Math.max(newPreference, 0.05);
    console.log('catRatioChange: ', { name, change });
    console.log('updatedPreferences: ', updatedPreferences);
    handleCategoryPreferencesUpdate(updatedPreferences);
	};

	const handleCategoryPreferencesUpdate = async (updatedPreferences) => {
    setCategoryPreferencesOnPred(updatedPreferences);
    const updatedCatsPred = catsPredUser.map(cat => ({
        ...cat,
        ratio: updatedPreferences[cat.name]
    }));
    setCatsPredUser(updatedCatsPred);

		try {
			const response = await api.post('/news_rec/updatePreferences/', {
				userID: user.userID,
        bipolarScore: bipolarScore,
				categoryPreferences: updatedPreferences,
				catsPred: updatedCatsPred
			});
			const data = response.data;
      setItems(response.data.updatedItems);
		} catch (error) {
			console.error('Error updating preferences:', error);
		}
	};

  // const handleChange = (event, newBipolarScore) => {
		

  //   if (newBipolarScore >= 0.5) {
  //     setBipolarColor({ 'personalization': c.bipolar.neg, 'diversity': c.bipolar.pos });
  //   } else if (newBipolarScore < 0.5) {
  //     setBipolarColor({ 'personalization': c.bipolar.pos, 'diversity': c.bipolar.neg });
  //   }
	// }

  const handleBipolarScoreChange = async (event, newBipolarScore) => {
    setBipolarScore(newBipolarScore);
		setColorScales(setAlgoEffColorScales(newBipolarScore));

    if (newBipolarScore >= 0.5) {
      setBipolarColor({ 'personalization': c.bipolar.neg, 'diversity': c.bipolar.pos });
    } else if (newBipolarScore < 0.5) {
      setBipolarColor({ 'personalization': c.bipolar.pos, 'diversity': c.bipolar.neg });
    }

    try {
      const response = await api.post('/news_rec/updateBipolarValueAlignment/', {
        userID: user.userID,
        bipolarScore: newBipolarScore
      });
      
      setItems(response.data.updatedItems);
    } catch (error) {
      console.error('Error updating value alignment:', error);
    }
  };

  const handleValueAlignmentChange = async (algoEffName, newValueAlignment) => {
    setAlgoEffs(prevState => ({
        ...prevState,
        [algoEffName]: {
            ...prevState[algoEffName],
            valueAlignment: newValueAlignment
        }
    }));

    try {
      const response = await api.post('/news_rec/updateValueAlignment/', {
        userID: user.userID,
        algoEffName: algoEffName,
        valueAlignment: newValueAlignment
      });
      
      setItems(response.data.updatedItems);
    } catch (error) {
      console.error('Error updating value alignment:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
          switchValuePrefForMe={switchValuePrefForMe}
          switchValuePrefForOthers={switchValuePrefForOthers}
          handleBipolarScoreChange={handleBipolarScoreChange}
          setBipolarColor={setBipolarColor}
          setColorScales={setColorScales}
          setSwitchValuePrefForMe={setSwitchValuePrefForMe}
          setSwitchValuePrefForOthers={setSwitchValuePrefForOthers}
        />
        <div style={{ fontSize: '1.2rem', marginTop: 20, marginBottom: 2.5 }}>How does the algorithm favor your value?</div>
        <MainViewWrapper>
          <WrapperForMe>
            <TitleMe>Me</TitleMe>
            <div style={{ height: 65 }}>Algorithm&nbsp;
              <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>{bipolarScore < 0.5 ? 'diminished' : (bipolarScore > 0.5 ? 'boosted' : 'diminished')}</span>
              &nbsp;my preferences <br /> in my recommendation.
            </div>
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
                categoryPreferencesOnPred={categoryPreferencesOnPred}
                setCategoryPreferencesOnPred={setCategoryPreferencesOnPred}
                topicPreferencesOnPred={topicPreferencesOnPred}
                setTopicPreferencesOnPred={setTopicPreferencesOnPred}
                handleSetCatRatioChange={handleSetCatRatioChange}
                handleAlgoEffValueAlignment={handleBipolarScoreChange}
              />
            </WrapperForMyCategory>
          </WrapperForMe>
          <WrapperForOthers>
            {/* Dropdown menu for selecting others */}
            <SelectOthers 
              selectedOthers={selectedOthers}
              setSelectedOthers={setSelectedOthers}
            />
            <div>Algorithm&nbsp;
              <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>{bipolarScore < 0.5 ? 'boosted' : (bipolarScore > 0.5 ? 'ignored' : 'diminished')}</span>
              <br /> &nbsp;others' preferences <br /> in my recommendation.
            </div>
            <WrapperForOthersCategory>
              {/* <CategoryDist dataType={'Preference'} cats={userCatsActual} /> */}
              <Panel 
                panelID={'predOthers'}
                dataType={'Recommended'} 
                userType={'others'}
                user={user}
                algoEffs={algoEffs}
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
