import { React, useEffect } from "react";
import "./PopupResult.css";

// redux imports
import { useDispatch } from "react-redux";
// you need to import each action you need to use
import { setcurrentPopupResult } from "../../redux/slices/mainSlice";

const PopupResult = (props) => {

  // if you are setting redux state, call dispatch
  const dispatch = useDispatch();
  //props can sometimes be undefined while re-rendering so need to make sure it exists
  useEffect(() => {
    if (props.result) {
      // set image
      dispatch(setcurrentPopupResult(props.result));
    }
    // eslint-disable-next-line
  }, [props.result]);

  useEffect(() => {
    return () => {
      // set to null when popup not shown anymore
      dispatch(setcurrentPopupResult(null));
    };
    // eslint-disable-next-line
  }, []);

  let thumbnail = props.result?.links?.filter(({ rel }) => rel === 'thumbnail')[0].href;

  // TODO: Temporary fix until Sentinel 2 L1C thumbnails are made available
  const collection = props.result.collection;
  if (collection === "sentinel-2-l1c") { thumbnail = ""};

  return (
    <div className="popupResult">
      {props.result ? (
        <div>
          <div className="popupResultThumbnailContainer">
            {thumbnail 
            ? (
              <picture>
                <source
                  src={thumbnail}
                  type="image/jp2"
                  className="popupResultThumbnail"
                />
                <img
                  src={thumbnail}
                  alt="thumbnail"
                  className="popupResultThumbnail"
                ></img>
              </picture>
            ) 
            : (
              <span className="popupResultCaption"><em>Thumbnail not available.</em></span> 
            )}
          </div>
          <div className="popupResultDetails">
            <div className="detailRow">
              <label>Title: </label>
              <span>{props.result.id}</span>
            </div>
            <div className="detailRow">
              <label>Collection Date: </label>
              <span>{props.result.properties["datetime"]}</span>
            </div>
            <div className="detailRow finalDetailRow">
              <label>Cloud Cover: </label>
              <span>
                {props.result.properties["eo:cloud_cover"].toFixed(2) + " %"}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PopupResult;
