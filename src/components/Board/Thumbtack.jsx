import React, { useMemo } from 'react';
import pin1 from '../../assets/pin1.png';
import pin2 from '../../assets/pin2.png';
import pin3 from '../../assets/pin3.png';
import pin4 from '../../assets/pin4.png';
import pin5 from '../../assets/pin5.png';

const pins = [pin1, pin2, pin3, pin4, pin5];

const Thumbtack = () => {
  // Randomly select a pin image (1-5) - memoized so it doesn't change on re-render
  const pinNumber = useMemo(() => Math.floor(Math.random() * 5), []);
  
  return (
    <img 
      src={pins[pinNumber]}
      alt="Pin"
      className="thumbtack"
      style={{
        position: 'absolute',
        top: '-12px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '24px',
        height: '24px',
        zIndex: 10,
        pointerEvents: 'none',
        filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))'
      }}
    />
  );
};

export default Thumbtack;