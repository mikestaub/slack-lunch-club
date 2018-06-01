import React from "react";
import {
  GoogleMap,
  Marker,
  withGoogleMap,
  withScriptjs,
} from "react-google-maps";
import SearchBox from "react-google-maps/lib/components/places/SearchBox";

// load the google maps API script before mounting the component
const AsyncGoogleMap = withScriptjs(
  withGoogleMap(props => (
    <GoogleMap
      ref={props.onMapMounted}
      defaultZoom={12}
      center={props.center}
      onClick={props.onMapClick}
      onBoundsChanged={props.onBoundsChanged}
      defaultOptions={{ mapTypeControl: false }}
    >
      <SearchBox
        ref={props.onSearchBoxMounted}
        bounds={props.bounds}
        controlPosition={window.google.maps.ControlPosition.TOP_LEFT}
        onPlacesChanged={props.onPlacesChanged}
      >
        <input
          type="text"
          placeholder="Enter your work address"
          style={{
            boxSizing: `border-box`,
            marginTop: `15px`,
            marginLeft: `15px`,
            MozBoxSizing: `border-box`,
            border: `1px solid transparent`,
            minWidth: `300px`,
            height: `30px`,
            padding: `0 12px`,
            boxShadow: `0 2px 6px rgba(0, 0, 0, 0.3)`,
            fontSize: `14px`,
            outline: `none`,
            textOverflow: `ellipses`,
          }}
        />
      </SearchBox>
      {props.markers.map((marker, index) => (
        <Marker
          position={marker.position}
          key={index}
          animation={window.google.maps.Animation.DROP}
        />
      ))}
    </GoogleMap>
  )),
);

export default AsyncGoogleMap;
