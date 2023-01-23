import { React, useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import NativeSelect from '@mui/material/NativeSelect';

import "./CollectionDropdown.css";

// most of this component comes from the material core UI started code
// https://mui.com/material-ui/react-select/#native-select

// redux imports
import { useDispatch } from "react-redux";
// you need to import each action you need to use
import { setselectedCollection } from "../../redux/slices/mainSlice";

const Dropdown = () => {

  const API_ENDPOINT = process.env.REACT_APP_STAC_API_ENDPOINT;
  const DEFAULT_COLLECTION = process.env.REACT_APP_DEFAULT_COLLECTION;

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch();
  const [value, setValue] = useState(DEFAULT_COLLECTION);
  const [collectionData, setCollectionData] = useState(null);

  useEffect(() => {
    fetch(API_ENDPOINT+`/collections`)
      .then((response) => response.json())
      .then((actualData) => {
        setCollectionData(actualData);
      })
      .catch((err) => {
        console.log("CollectionDropdown.js Fetch Error: ", err.message);
      });
  }, [API_ENDPOINT]);  
 
  useEffect(() => {
    dispatch(setselectedCollection(value));
    // eslint-disable-next-line
  }, [value]);

  const handleDropdownChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <Box sx={{ width: 250 }}>
      <label>Collection</label>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs>
          <NativeSelect
            id="collections-dropdown"
            value={value}
            label="Collection"
            onChange={handleDropdownChange}
            sx={{
              width: 250,
            }}
          >
            {collectionData && collectionData.collections.map(({ id, title }) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </NativeSelect>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dropdown;
