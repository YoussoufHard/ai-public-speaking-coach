import React from 'react';

const Timeline = ({ timeline, duration, onEventClick }) => {
  return (
    <div style={{ position: 'relative', height: '50px', background: '#f0f0f0', marginTop: '10px' }}>
      {timeline.map((event, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            left: `${(event.time / duration) * 100}%`,
            top: '10px',
            width: '10px',
            height: '10px',
            background: 'red',
            cursor: 'pointer',
            borderRadius: '50%',
          }}
          title={event.event}
          onClick={() => onEventClick(event.time)}
        />
      ))}
    </div>
  );
};

export default Timeline;