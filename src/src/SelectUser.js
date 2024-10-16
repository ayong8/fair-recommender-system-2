import React, { useEffect, useState } from 'react';
import { MenuItem, FormControl, Select, InputLabel } from '@mui/material';
import $ from 'jquery';
import styled from 'styled-components';

const SelectUserWrapper = styled.div.attrs({
	className: 'bipolar_slider_wrapper'
  })`
	width: 100%;
	// text-align: center;
  `;
  

const SelectUser = ({
	selectedUserId,
	setSelectedUserId,
	users
}) => {

	return (
		<SelectUserWrapper>
		  <FormControl sx={{ m: 1, minWidth: 120, marginTop: '10px' }} size="small">
			<InputLabel id="demo-select-small-label" sx={{ '&.MuiInputLabel-shrink': {} }}>Selected user</InputLabel>
			<Select
				labelId="demo-select-small-label"
				id="demo-select-small"
				value={selectedUserId}
				label="Selected user"
				onChange={(e) => {
					return setSelectedUserId(e.target.value)
				}}
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
        </SelectUserWrapper>
	);
}

export default SelectUser;