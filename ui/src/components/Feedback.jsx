import React from 'react';

const Feedback = ({ feedback }) => {
  if (!feedback) return null;

  return (
    <div>
      <h3>Feedback</h3>
      <p><strong>Summary:</strong> {feedback.summary}</p>
      <h4>Recommendations:</h4>
      <ul>
        {feedback.recommendations.map((rec, index) => (
          <li key={index}>{rec}</li>
        ))}
      </ul>
    </div>
  );
};

export default Feedback;