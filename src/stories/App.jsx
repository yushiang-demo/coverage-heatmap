import Renderer from "three-coverage-heatmap";
import PropTypes from "prop-types";

function Demo({
  texture,
  isSignalIndex,
  signalIntensity,
  signals,
  aabbs,
  planes,
}) {
  const props = {
    texture,
    isSignalIndex,
    signalIntensity,
    signals,
    aabbs,
    planes,
  };
  return <Renderer {...props} />;
}

Demo.propTypes = {
  texture: PropTypes.string,
};

export default Demo;
