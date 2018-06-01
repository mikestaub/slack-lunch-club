import React from "react";

// TODO make npm module
function withNullableProps(WrappedComponent) {
  return class extends React.Component {
    processProps(props) {
      // force the wrapped component to use default props for null props
      return Object.keys(props).reduce(
        (acc, propKey) => {
          const propVal = props[propKey];
          acc[propKey] = propVal === null ? undefined : propVal;
          return acc;
        },
        { ...props },
      );
    }

    render() {
      return <WrappedComponent {...this.processProps(this.props)} />;
    }
  };
}

export default withNullableProps;
