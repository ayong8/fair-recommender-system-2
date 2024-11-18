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
import IconForMajorAmplification from './IconForMajorAmplification';
import IconForMinorDeamplification from './IconForMinorDeamplification';
import IconForMiscalibration from './IconForMiscalibration';
import IconForPopularityBias from './IconForPopularityBias';
import IconForStereotype from './IconForStereotype';

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

const BipolarTextWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	text-align: left;
  font-size: 1.2rem;
  margin-top: 15px;
`;

const WrapperForMe = styled.div.attrs({
  className: 'wrapper_for_me'
})`
  height: 100%;
  text-align: center;
  background-color: whitesmoke;
  border: 1px dashed lightgray;
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
  display: flex;
  justify-content: space-between;
  padding: 25px;
  position: relative;
  z-index: 1;
`;

const WrapperForOthersCategory = styled.div.attrs({
  className: 'wrapper_for_others_category'
})`
  // height: ${l.cd.h}px;
  display: flex;
  justify-content: center;
  // padding: 10px;
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
  const [bipolarScore, setBipolarScore] = useState(0.25);
  const [bipolarColor, setBipolarColor] = useState(initialBipolarColors);
  const [colorScales, setColorScales] = useState(() => setAlgoEffColorScales(bipolarScore));
  const [hoveredEntry, setHoveredEntry] = useState({});
  const [selectedEntry, setSelectedEntry] = useState({});
  const [selectedOthers, setSelectedOthers] = useState('all_users');

  // const [catRatioChange, setCatRatioChange] = useState({ name: null, change: null });
  const [switchValuePrefForMe, setSwitchValuePrefForMe] = useState(false);
  const [switchValuePrefForOthers, setSwitchValuePrefForOthers] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const isInitialLoad = useRef(true);
  const refFromActualToPred = useRef(null);
  const refFromOthersToMe = useRef(null);

  // useEffect(() => {
  //   const initialLoadData = async () => {
  //     try {
  //       const response = await api.get('/news_rec/loadData/');
  //       const data = response.data;
  //       setUsers(data.users);
  //       setUser(data.user);
  //       setCatsActualUser(data.catsActualUser);
  //       setCatsPredUser(data.catsPredUser);
  //       setCatsActualOthers(data.catsActualOthers);
  //       setCatsPredOthers(data.catsPredOthers);
  //       setAlgoEffs(data.algoEffs);
  //       setItems(data.items);
  //       setCategoryPreferencesOnPred(data.categoryPreferencesOnPred);
  //       setTopicPreferencesOnPred(data.topicPreferencesOnPred);
  //     } catch (error) {
  //       console.error('Error loading initial data:', error);
  //     } finally {
  //       setIsLoading(false);
  //       isInitialLoad.current = false;
  //     }
  //   };

  //   initialLoadData();
  // }, []);

  // Update data when selectedUserId changes using POST method
  useEffect(() => {
    const updateUserData = async () => {
      // if (isInitialLoad.current) return; // Skip if it's the initial load

      setIsLoading(true);
      try {
        const response = await api.post('/news_rec/loadData/', {
          user_id: selectedUserId
        });
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
        console.error('Error updating user data:', error);
      } finally {
        setIsLoading(false);
        isInitialLoad.current = false;
      }
    };

    updateUserData();
  }, [selectedUserId]);

  // Render lines between categories to represent miscalibration
  useEffect(() => {
    d3.selectAll('.path').remove();
    drawPaths(
      'within-me',
      $('#svgContainer1'),
      $(refFromActualToPred.current), 
      'actualUser',
      'predUser',
      catsActualUser, 
      catsPredUser,
      colorScales.filterBubble
    );
    drawPaths(
      'between-me-and-others',
      $('#svgContainer2'),
      $(refFromOthersToMe.current),  
      'predUser',
      'predOthers',
      catsPredUser,
      catsPredOthers,
      colorScales.popularityBias
    );
  }, [refFromActualToPred.current, refFromOthersToMe.current, catsActualUser, catsPredUser, bipolarScore]);

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
            updatedPreferences[otherCat.name] = Math.max(
                (updatedPreferences[otherCat.name] || 0) - adjustmentPerCategory,
                0.05
            );
        });
    } else if (change === 'decreased') {
        newPreference -= margin;
        otherCategories.forEach(otherCat => {
            updatedPreferences[otherCat.name] = Math.max(
                (updatedPreferences[otherCat.name] || 0) + adjustmentPerCategory,
                0.05
            );
        });
    }

    updatedPreferences[name] = Math.max(newPreference, 0.05);
    handleCategoryPreferencesUpdate(updatedPreferences);
  };

  const handleCategoryPreferencesUpdate = async (updatedPreferences) => {
    setCategoryPreferencesOnPred(updatedPreferences);
    const updatedCatsPredUser = catsPredUser.map(cat => ({
        ...cat,
        ratio: updatedPreferences[cat.name]
    }));

		try {
			const response = await api.post('/news_rec/updatePreferences/', {
				userID: user.userID,
        bipolarScore: bipolarScore,
				categoryPreferences: updatedPreferences,
				catsPred: updatedCatsPredUser,
			});

      setItems(response.data.updatedItems);
      setCatsActualUser(response.data.updatedCatsActual);
      setCatsPredUser(response.data.updatedCatsPred);
      setCatsPredOthers(response.data.updatedCatsPredOthers);
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

  const handleItemPreferenceChange = async (item) => {
		const updatedItem = {
			...item,
			score: Math.min(item.score, 0.1)
		};
		const updatedItems = items.map(i => 
			i.itemID === item.itemID ? updatedItem : i
		);
		
    try {
      const response = await api.post('/news_rec/updateItemPreferences/', {
        userID: user.userID,
        updatedItems: updatedItems
      });
      
      setItems(response.data.updatedItems);
    } catch (error) {
      console.error('Error updating value alignment:', error);
    }
	};

  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  // console.log('catsPredUser popularity bias: ', catsPredUser.map(c => c.measures.popularityBias));
  // console.log('catsPredUser majoramp: ', catsPredUser.map(c => c.measures.filterBubble));

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
      <Feed 
        selectedEntry={selectedEntry}
        items={items}
        handleItemPreferenceChange={handleItemPreferenceChange}
      />
      <div style={{ width: 500 }}>
        {/* <Header>When you are not satisfied with RS</Header> */}
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
        <BipolarTextWrapper>What do you want for your feed?</BipolarTextWrapper>
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
        <div style={{ fontSize: '1.2rem', marginTop: 20, marginBottom: 2.5 }}>
            Does the algorithm&nbsp; 
            <span style={{ color: c.bipolar.pos, fontWeight: 600 }}>favor</span> or&nbsp;
            <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>harm</span> the {bipolarScore <= 0.5 ? 'personalization' : 'diversity'}?
          </div>
        <MainViewWrapper>
          <WrapperForMe>
            <TitleMe>Me</TitleMe>
            <div style={{ height: 45, fontSize: '1.2rem', lineHeight: 1.1 }}>Your preferences were<br />
              <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>{bipolarScore < 0.5 ? 'diminished' : (bipolarScore > 0.5 ? 'boosted' : 'diminished')}</span>
              <FormControlLabel
                sx={{ marginRight: -1.5, marginLeft: -1, marginTop: -0.5 }}
                control={
                  <Switch
                    checked={switchValuePrefForMe} // Assuming you have a state for this
                    onChange={() => setSwitchValuePrefForMe(prev => !prev)} // Toggle the state
                    icon={<IconForMinorDeamplification style={{ marginBottom: -7.5, color: c.bipolar.neg }} />}
                    checkedIcon={<IconForMinorDeamplification style={{ marginBottom: -7.5, color: c.bipolar.pos }} />} // Change color when checked
                    sx={{
                      ".MuiSwitch-track": {
                        backgroundColor: c.bipolar.neg
                      },
                      "& .MuiSwitch-switchBase": {
                        "&.Mui-checked": {
                          "+ .MuiSwitch-track": {
                            backgroundColor: c.bipolar.pos
                          },
                        }
                      }
                    }}
                  />
                }
              />
              &nbsp;or&nbsp;
              <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>{bipolarScore < 0.5 ? 'miscalibrated' : (bipolarScore > 0.5 ? 'over-focused' : 'miscalibrated')}</span>
              <FormControlLabel
                sx={{ marginRight: -1.5, marginLeft: -1, marginTop: -0.5 }}
                control={
                  <Switch
                    checked={switchValuePrefForMe} // Assuming you have a state for this
                    onChange={() => setSwitchValuePrefForMe(prev => !prev)} // Toggle the state
                    icon={<IconForMiscalibration style={{ marginBottom: -7.5, color: c.bipolar.neg }} />}
                    checkedIcon={<IconForMiscalibration style={{ marginBottom: -7.5, color: c.bipolar.pos }} />} // Change color when checked
                  />
                }
              />
            </div>
            <div id="svgContainer1" style={{ position: 'absolute', top: 100, left: 120, zIndex: 0 }}>
              <svg 
                id="svg1"
                ref={refFromActualToPred} 
                width={85}
                height="0" 
              />
            </div>
            <div id="svgContainer2" style={{ position: 'absolute', top: 100, left: 325, zIndex: 0 }}>
              <svg 
                id="svg2"
                ref={refFromOthersToMe} 
                width={85}
                height={800} 
              />
            </div>
            <WrapperForMyCategory>
              <Panel 
                panelID={'actualUser'}
                dataType={'Preferred'} 
                panelName={'My preference'}
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
                panelName={'News feed for me'}
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
            <div style={{ height: 60, fontSize: '1.2rem', lineHeight: 1.1 }}>Others' preferences<br /> 
              were<br />
              <span style={{ color: c.bipolar.neg, fontWeight: 600 }}>{bipolarScore < 0.5 ? 'amplified' : (bipolarScore > 0.5 ? 'boosted' : 'amplified')}</span>
              <FormControlLabel
                sx={{ marginRight: -1.5, marginLeft: -1, marginTop: -0.5 }}
                control={
                  <Switch
                    checked={switchValuePrefForMe} // Assuming you have a state for this
                    onChange={() => setSwitchValuePrefForMe(prev => !prev)} // Toggle the state
                    icon={<IconForPopularityBias style={{ transform: 'translateY(-2px)', color: c.bipolar.neg }} />}
                    checkedIcon={<IconForPopularityBias style={{ transform: 'translateY(-2px)', color: c.bipolar.pos }} />} // Adjusted position when checked
                  />
                }
              />
            </div>
            <WrapperForOthersCategory>
              {/* <CategoryDist dataType={'Preference'} cats={userCatsActual} /> */}
              <Panel 
                panelID={'predOthers'}
                dataType={'Recommended'} 
                panelName={'News feed for others'}
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
        </MainViewWrapper>
      </div>
      </ThemeProvider>
    </div>
  );
}

export default App;
