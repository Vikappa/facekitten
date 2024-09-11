'use client'

import { useEffect, useState } from 'react';

const StaScrivendo = ({ staScrivendo = false }: { staScrivendo?: boolean }) => {
  
    const [dots, setDots] = useState('');
  
    useEffect(() => {
  
      let interval: NodeJS.Timeout;
  
      if (staScrivendo) {
        interval = setInterval(() => {
          setDots((prev) => {
            const newDots = prev.length < 3 ? prev + '.' : '';
            return newDots;
          });
        }, 500);
      } else {
        setDots(''); 
      }
  
      return () => {
        clearInterval(interval);
      };
    }, [staScrivendo]);
  
    return (
      <p
        style={{
          color: 'var(--bs-tertiary)',
          fontSize: '0.8rem',
          margin: '0',
          padding: '0 1rem',
        }}>
        Sta scrivendo{dots}
      </p>
    );
  };
  
  export default StaScrivendo;
  