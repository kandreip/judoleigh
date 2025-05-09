import React from 'react';
import '../styles/LoadingAnimation.css';
import loaderImage from '../images/loader.png';

const LoadingAnimation = () => {
  return (
    <div className="loading-container">
      <div className="rolling-kid">
        <div className="kid">
          <img src={loaderImage} alt="Loading..." className="loader-image" />
        </div>
      </div>
      <div className="loading-text">Hajime!</div>
    </div>
  );
};

// Test component to show the animation for at least 1 second
export const TestLoadingAnimation = () => {
  return <LoadingAnimation />;
};

export default LoadingAnimation; 