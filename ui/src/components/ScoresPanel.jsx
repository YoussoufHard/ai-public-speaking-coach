import React from 'react';

const ScoresPanel = ({ scores }) => {
  if (!scores) return null;

  const scoreEntries = Object.entries(scores);
  const globalScore = scores.global || scores.Global || null;

  return (
    <div>
      <h3>Scores</h3>
      {globalScore && (
        <div style={{ fontSize: '1.5em', fontWeight: 'bold', color: 'green' }}>
          Global Score: {globalScore}/10
        </div>
      )}
      <ul>
        {scoreEntries.map(([category, score]) => (
          <li key={category}>
            {category}: {score}/10
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ScoresPanel;