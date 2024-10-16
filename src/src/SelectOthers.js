import React, { useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import $ from 'jquery';
import styled from 'styled-components';

const SelectOthersWrapper = styled.div.attrs({
	className: 'select_others_wrapper'
  })`
	text-align: center;
  `;
  

const SelectOthers = ({
	selectedOthers,
	setSelectedOthers
}) => {

	return (
		<SelectOthersWrapper>
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
        </SelectOthersWrapper>
	);
}

export default SelectOthers;