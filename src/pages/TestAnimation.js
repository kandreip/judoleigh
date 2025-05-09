import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import { TestLoadingAnimation } from '../components/LoadingAnimation';

const TestAnimation = () => {
  const [showAnimation, setShowAnimation] = useState(false);

  const handleShowAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => {
      setShowAnimation(false);
    }, 10000); // Show for 2 seconds
  };

  return (
    <Container className="mt-5 text-center">
      <h1>Animation Test Page</h1>
      <Button 
        variant="primary" 
        onClick={handleShowAnimation}
        className="mb-4"
      >
        Show Animation
      </Button>
      
      {showAnimation && <TestLoadingAnimation />}
    </Container>
  );
};

export default TestAnimation; 