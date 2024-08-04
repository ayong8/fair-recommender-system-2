import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styled from 'styled-components';

import CategoryDist from './CategoryDist';
import './App.css';

const MainViewWrapper = styled.div.attrs({
  className: 'main_view_wrapper'
})`
  display: flex;
  width: 500px;
`;

const Header = styled.div.attrs({
  className: 'header'
})`
  height: 50px;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 10px;
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

const Title = styled.div.attrs({
  className: 'title'
})`
  font-size: 1.3rem;
  font-weight: 800;
`;

const WrapperForMyCategory = styled.div.attrs({
  className: 'wrapper_for_my_category'
})`
  display: flex;
  padding: 10px;
  background-color: whitesmoke;
`;

const WrapperForOthersCategory = styled.div.attrs({
  className: 'wrapper_for_others_category'
})`
  display: flex;
  padding: 10px;
`;

function App() {
  const [ catsActualUser, setCatsActualUser ] = useState([]);
  const [ catsPredUser, setCatsPredUser ] = useState([]);
  const [ catsActualOthers, setCatsActualOthers ] = useState([]);
  const [ catsPredOthers, setCatsPredOthers ] = useState([]);
  const [ users, setUsers ] = useState([]);

  const loadData = () => {
    axios.get('http://localhost:8000/news_rec/loadData/')
      .then((res) => {
        setUsers(res.data.userInfo);
        setCatsActualUser(res.data.catsActualUser);
        setCatsPredUser(res.data.catsPredUser);
        setCatsActualOthers(res.data.catsActualOthers);
        setCatsPredOthers(res.data.catsPredOthers);
      });
  }

  useEffect(() => {
    loadData();
  }, []);

  console.log('catsActualUser: ', catsActualUser);
  console.log('catsPredUser: ', catsPredUser);
  console.log('catsPredOthers: ', catsPredOthers);

  // if (catsActual.length == 0 || catsPred.length == 0)
  //   return <div />

  return (
    <div className="App">
      <Header>Interactive RS</Header>
      <MainViewWrapper>
        <WrapperForMe>
          <Title>Me</Title>
          <WrapperForMyCategory>
            <CategoryDist 
              type={'actualUser'}
              dataType={'preference'} 
              userType={'user'} 
              cats={catsActualUser} 
            />
            <CategoryDist 
              type={'predUser'}
              dataType={'recommendations'} 
              userType={'user'} 
              cats={catsPredUser} 
            />
          </WrapperForMyCategory>
        </WrapperForMe>
        <WrapperForOthers>
          <Title>Others</Title>
          <WrapperForOthersCategory>
            {/* <CategoryDist dataType={'Preference'} cats={userCatsActual} /> */}
            <CategoryDist 
              type={'predOthers'}
              dataType={'recommendations'} 
              userType={'others'} 
              cats={catsPredOthers} 
            />
          </WrapperForOthersCategory>
        </WrapperForOthers>
      </MainViewWrapper>
    </div>
  );
}

export default App;
