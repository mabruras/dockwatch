import React from 'react';
import styled from 'styled-components';
const StyledLabel = styled.div`
`;

const StyledLabelValue = styled.pre`
    color: orange;
`;
const NoLabelsFoundText = styled.p`
    color: #777;
    font-style: italic;
    margin: 0;
`;


export default function ContainerLabel({ container }) {

  if (!container) {
      return null;
  }
  const labels = Object.keys(container.labels);
 
  return (
    <div>
        {labels.map(label => (
            <StyledLabel key={label}>
                    <StyledLabelValue>{label} = {container.labels[label]}</StyledLabelValue>
            </StyledLabel>
        ))}
        {
            !labels.length && (
                <NoLabelsFoundText>No labels found.</NoLabelsFoundText>
            ) 
        }
    </div>
  );
}
