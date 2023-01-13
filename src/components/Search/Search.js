import { React, useEffect, useState } from "react";
import "./Search.css";

// redux imports
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
// you need to import each action you need to use
import { setsearchResults } from "../../redux/slices/mainSlice";
import { setdateTime } from "../../redux/slices/mainSlice";
import { setclickResults } from "../../redux/slices/mainSlice";
import { setsearchLoading } from "../../redux/slices/mainSlice";
import { setsearchParameters } from "../../redux/slices/mainSlice";

import * as L from "leaflet";
import "leaflet-draw";
import DateTimeRangePicker from "@wojtekmaj/react-datetimerange-picker/dist/DateTimeRangePicker";
import CloudSlider from "../CloudSlider/CloudSlider";

const Search = () => {
  const _map = useSelector((state) => state.mainSlice.map);
  const _cloudCover = useSelector((state) => state.mainSlice.cloudCover);
  const _searchResults = useSelector((state) => state.mainSlice.searchResults);
  const _currentPopupResult = useSelector(
    (state) => state.mainSlice.currentPopupResult
  );

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch();

  // set up map state
  const map = _map;

  // set default date range (current minus 24 * 60 * 60 * 1000 per day)
  const oneWeekAgo = new Date(Date.now() - 604800000);

  // set up local state
  const [dateTimeValue, setdateTimeValue] = useState([oneWeekAgo, new Date()]);
  const [drawHandler, setdrawHandler] = useState();
  const [drawnItems, setdrawnItems] = useState();
  const [resultFootprints, setresultFootprints] = useState();
  const [clickedFootprintHighlights, setclickedFootprintsHighlight] =
    useState();
  const [clickedFootprintsImageLayer, setclickedFootprintsImageLayer] =
    useState();

  // override leaflet draw tooltips
  L.drawLocal = {
    draw: {
      handlers: {
        rectangle: {
          tooltip: {
            start: "Click and Drag to Draw Bounding Box.",
          },
        },
        simpleshape: {
          tooltip: {
            end: "Release mouse to finish drawing.",
          },
        },
      },
    },
  };

  // when map is set (will only happen once), set up more controls/layers
  useEffect(() => {
    // if map full loaded
    if (map && Object.keys(map).length > 0) {
      // override position of zoom controls
      L.control
        .zoom({
          position: "topleft",
        })
        .addTo(map);

      // set up draw BBOX control and set color
      const drawHandler = new L.Draw.Rectangle(map, {
        shapeOptions: {
          color: "#6CC24A",
        },
      });
      setdrawHandler(drawHandler);

      // add feature group to hold BBOX rectangle and add to map
      const drawnItemsInit = new L.FeatureGroup();
      setdrawnItems(drawnItemsInit);
      map.addLayer(drawnItemsInit);

      // set up layerGroup for footprints and add to map
      const resultFootprintsInit = new L.FeatureGroup();
      setresultFootprints(resultFootprintsInit);
      resultFootprintsInit.addTo(map);

      // set up layerGroup for highlight footprints and add to map
      const clickedFootprintsHighlightInit = new L.FeatureGroup();
      setclickedFootprintsHighlight(clickedFootprintsHighlightInit);
      clickedFootprintsHighlightInit.addTo(map);

      // set up layerGroup for image layer and add to map
      const clickedFootprintsImageLayerInit = new L.FeatureGroup();
      setclickedFootprintsImageLayer(clickedFootprintsImageLayerInit);
      clickedFootprintsImageLayerInit.addTo(map);

      // handle event after BBOX is drawn
      map.on(L.Draw.Event.CREATED, function (e) {
        const layer = e.layer;
        // add layer ID so it can easily be found later
        layer.id = "drawnAOI";
        drawnItemsInit.addLayer(layer);
        // zoom to bounds
        map.fitBounds(layer._bounds, { padding: [100, 100] });
      });

      map.createPane("imagery");
      map.getPane("imagery").style.zIndex = 650;
      map.getPane("imagery").style.pointerEvents = "none";

      map.on("click", clickHandler);
    }
    // eslint-disable-next-line
  }, [map]);

  // when dataTime changes set in global store
  useEffect(() => {
    dispatch(setdateTime(dateTimeValue));
    // eslint-disable-next-line
  }, [dateTimeValue]);

  // when search results change, if map loaded, set new clickHandler
  useEffect(() => {
    if (map && Object.keys(map).length > 0 && _searchResults !== null) {
      map.on("click", clickHandler);
    }
    // eslint-disable-next-line
  }, [_searchResults]);

  // when currentPopupResult set, add image layer to map
  useEffect(() => {
    if (_currentPopupResult !== null) {
      if (clickedFootprintsImageLayer) {
        clickedFootprintsImageLayer.clearLayers();
      }
      // call add new image layer to map function
      addImageClicked(_currentPopupResult);
    }
    // eslint-disable-next-line
  }, [_currentPopupResult]);

  // function called when draw BBOX button clicked
  function drawBBOX() {
    // remove old bbox, footprints and enable draw handler
    drawnItems.clearLayers();
    clickedFootprintsImageLayer.clearLayers();
    dispatch(setsearchResults(null));
    dispatch(setclickResults([]));
    if (clickedFootprintHighlights) {
      clickedFootprintHighlights.clearLayers();
    }
    removeFootprints();
    drawHandler.enable();
  }

  function clickHandler(e) {
    const clickBounds = L.latLngBounds(e.latlng, e.latlng);

    if (clickedFootprintHighlights) {
      clickedFootprintHighlights.clearLayers();
    }
    if (clickedFootprintsImageLayer) {
      clickedFootprintsImageLayer.clearLayers();
    }

    let intersectingFeatures = [];

    if (_searchResults !== null) {
      for (const f in _searchResults.features) {
        const feature = _searchResults.features[f];
        const bounds = feature.bbox;
        const latlng1 = L.latLng(bounds[1], bounds[0]);
        const latlng2 = L.latLng(bounds[3], bounds[2]);
        const featureBounds = L.latLngBounds(latlng1, latlng2);
        if (featureBounds && clickBounds.intersects(featureBounds)) {
          intersectingFeatures.push(feature);
          // add features to clickedHighlight layer
          const clickedFootprintsSelectedStyle = {
            color: "#ff7800",
            weight: 5,
            opacity: 0.65,
            fillOpacity: 0,
          };
          const clickedFootprintsFound = L.geoJSON(feature, {
            style: clickedFootprintsSelectedStyle,
          });
          clickedFootprintsFound.id = "clickedFootprintHighlights";
          clickedFootprintsFound.addTo(clickedFootprintHighlights);
        }
      }
    }

    // if at least one feature found, push to store else clear store
    if (intersectingFeatures.length > 0) {
      dispatch(setclickResults(intersectingFeatures));
      // push to store
    } else {
      // clear store
      dispatch(setclickResults([]));
    }
  }

  // function to convert DateTime Range Picker values to STAC compliant format
  function convertDateTimeForAPI(dateTime) {
    const dateString =
      dateTime.getUTCFullYear() +
      "-" +
      ("0" + (dateTime.getUTCMonth() + 1)).slice(-2) +
      "-" +
      ("0" + dateTime.getUTCDate()).slice(-2) +
      "T" +
      ("0" + dateTime.getUTCHours()).slice(-2) +
      ":" +
      ("0" + dateTime.getUTCMinutes()).slice(-2) +
      ":" +
      ("0" + dateTime.getUTCSeconds()).slice(-2) +
      "Z";
    //format dateTime here
    return dateString;
  }

  // remove old footprints from map
  function removeFootprints() {
    resultFootprints.eachLayer(function (layer) {
      map.removeLayer(layer);
    });
  }

  // function called when search button clicked
  function searchAPI() {
    // get AOI bounds
    let aoiBounds;
    drawnItems.eachLayer(function (layer) {
      if (layer.id === "drawnAOI") {
        aoiBounds = layer._bounds;
      }
    });

    // if no bounding box drawn, abort search TODO: add better error handling
    if (!aoiBounds) {
      return;
    }

    // remove clicked footprint highlight
    if (clickedFootprintHighlights) {
      clickedFootprintHighlights.clearLayers();
    }

    // remove image layer
    if (clickedFootprintsImageLayer) {
      clickedFootprintsImageLayer.clearLayers();
    }
    // remove existing footprints from map
    removeFootprints();

    // show loading spinner
    dispatch(setsearchLoading(true));
    dispatch(setsearchResults(null));
    dispatch(setclickResults([]));

    // build datetime input
    const combinedDateRange =
      convertDateTimeForAPI(dateTimeValue[0]) +
      "%2F" +
      convertDateTimeForAPI(dateTimeValue[1]);

    // get cloud cover silder value
    const cloudCover = _cloudCover;

    const API_ENDPOINT = process.env.REACT_APP_STAC_API_ENDPOINT;
    const COLLECTIONS = process.env.REACT_APP_COLLECTIONS;

    // build GET URL (limit hardcoded to 362)
    const baseURLGET =
      API_ENDPOINT +
      "/search?bbox=" +
      aoiBounds._southWest.lng +
      "," +
      aoiBounds._southWest.lat +
      "," +
      aoiBounds._northEast.lng +
      "," +
      aoiBounds._northEast.lat +
      '&limit=100&query=%7B"eo%3Acloud_cover"%3A%7B"gte"%3A0,"lte"%3A' +
      cloudCover +
      "%7D%7D&datetime=" +
      combinedDateRange +
      "&collections=" +
      COLLECTIONS;

    // TODO rework this to make DRY with baseURLGET string above...
    // build string to set for publish copy to clipboard
    const searchParametersString =
      "?bbox=" +
      aoiBounds._southWest.lng +
      "," +
      aoiBounds._southWest.lat +
      "," +
      aoiBounds._northEast.lng +
      "," +
      aoiBounds._northEast.lat +
      '&query=%7B"eo%3Acloud_cover"%3A%7B"gte"%3A0,"lte"%3A' +
      cloudCover +
      "%7D%7D&datetime=" +
      combinedDateRange +
      "&collections=sentinel-2-l2a";

    //set state for publish copy to clipboard
    dispatch(setsearchParameters(searchParametersString));

    // send GET request to find first 200 STAC images that intersect bbox
    fetch(baseURLGET, {
      method: "GET",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        // set search results in store for use in other components
        dispatch(setsearchResults(json));

        //remove loading spinner
        dispatch(setsearchLoading(false));

        //add new footprints to map
        const resultFootprintsFound = L.geoJSON(json, {});
        resultFootprints.id = "resultFootprints";
        resultFootprintsFound.addTo(resultFootprints);
      });
  }

  // function to remove old image layer and add new image layer to map
  function addImageClicked(feature) {
    const featureURL = feature.links[0].href;
    clickedFootprintsImageLayer.clearLayers();

    const titilerURL_E84AWS = process.env.REACT_APP_TITILER;

    const singleAssetName = "visual";

    fetch(featureURL, {
      method: "GET",
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (json) {
        const corner1 = L.latLng(json.bbox[1], json.bbox[0]);
        const corner2 = L.latLng(json.bbox[3], json.bbox[2]);
        const tileBounds = L.latLngBounds(corner1, corner2);
        L.tileLayer(
          titilerURL_E84AWS +
            "/stac/tiles/{z}/{x}/{y}.png?&url=" +
            featureURL +
            "&assets=" +
            singleAssetName +
            "&return_mask=true",
          {
            attribution: "©OpenStreetMap, ©CartoDB",
            tileSize: 256,
            bounds: tileBounds,
            pane: "imagery",
          }
        ).addTo(clickedFootprintsImageLayer);
      });
  }

  return (
    <div className="Search" data-testid="Search">
      <button onClick={() => drawBBOX()} className="bboxButton">
        Draw BBOX
      </button>
      <div className="searchContainer">
        <label>Select Date & Time Range</label>
        <DateTimeRangePicker
          className="dateTimePicker"
          onChange={setdateTimeValue}
          format={"yy-MM-dd HH:mm"}
          maxDate={new Date()}
          value={dateTimeValue}
        ></DateTimeRangePicker>
      </div>
      <div className="searchContainer">
        <CloudSlider></CloudSlider>
      </div>
      <button className="searchButton" onClick={() => searchAPI()}>
        Search
      </button>
    </div>
  );
};

export default Search;
