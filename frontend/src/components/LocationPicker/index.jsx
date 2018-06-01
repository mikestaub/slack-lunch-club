import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import { oneLineTrim } from "common-tags";
import FaSpinner from "react-icons/lib/fa/spinner";

import AsyncGoogleMap from "./AsyncGoogleMap";
import withNullableProps from "../WithNullableProps";

// construct google maps api URL
const apiVersion = "3.exp";
const libraries = "geometry,drawing,places";
const apiKey = "AIzaSyCa5MwMUsmWj12lqzNL54xVJFvIfU6eco8";
const mapURL = oneLineTrim`https://maps.googleapis.com/maps/api/js?
  v=${apiVersion}&
  libraries=${libraries}&
  key=${apiKey}`;

class LocationPicker extends React.Component {
  static googleMapURL = mapURL;

  state = {
    bounds: null,
    center: {
      lat: this.props.userLocation.lat,
      lng: this.props.userLocation.lng,
    },
    markers: [
      {
        position: {
          lat: this.props.userLocation.lat,
          lng: this.props.userLocation.lng,
        },
        key: this.props.userLocation.key,
      },
    ],
  };

  handleMapMounted = map => {
    this.map = map;
  };

  handleSearchBoxMounted = searchBox => {
    this.searchBox = searchBox;
  };

  handleBoundsChanged = () => {
    this.setState({
      bounds: this.map.getBounds(),
      center: this.map.getCenter(),
    });
  };

  handlePlacesChanged = () => {
    const places = this.searchBox.getPlaces();

    // add a marker for each place returned from the search
    const markers = places.map(place => ({
      position: place.geometry.location,
      key: _.uniqueId(), // http://fb.me/react-warning-keys
    }));

    // set map center to first search result
    const center = markers.length ? markers[0].position : this.state.center;

    this.setState({
      markers,
      center,
    });

    this.props.onLocationPicked(places[0]);
  };

  render() {
    return (
      <AsyncGoogleMap
        googleMapURL={LocationPicker.googleMapURL}
        loadingElement={
          <FaSpinner
            style={{
              display: `block`,
              width: `30px`,
              height: `30px`,
              margin: `150px auto`,
              animation: `fa-spin 2s infinite linear`,
            }}
          />
        }
        containerElement={
          <div
            style={{
              height: "300px",
              padding: "5px",
            }}
          />
        }
        mapElement={
          <div
            style={{
              height: "100%",
              borderRadius: "7px",
            }}
          />
        }
        center={this.state.center}
        bounds={this.state.bounds}
        markers={this.state.markers}
        onMapMounted={this.handleMapMounted}
        onSearchBoxMounted={this.handleSearchBoxMounted}
        onMapClick={_.noop}
        onBoundsChanged={this.handleBoundsChanged}
        onPlacesChanged={this.handlePlacesChanged}
      />
    );
  }
}

LocationPicker.propTypes = {
  userLocation: PropTypes.object,
  onLocationPicked: PropTypes.func.isRequired,
};

LocationPicker.defaultProps = {
  userLocation: {
    lat: 37.783719,
    lng: -122.408961,
    key: "Hack Reactor",
    formattedAddress:
      "944 Market Street, 8th floor, San Francisco, CA 94102, USA",
  },
};

export default withNullableProps(LocationPicker);
