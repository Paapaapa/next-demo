import { cloneElement, memo } from "react";

const containerStyle = {
  width: "100%",
  maxWidth: 1200,
  margin: "0 auto",
  padding: "0 20px",
};

function Container({ children, renderer = <div /> }) {
  const newElement = cloneElement(renderer, {
    style: { ...containerStyle, ...renderer.props.style },
    children,
  });

  return newElement;
}

export default memo(Container);
