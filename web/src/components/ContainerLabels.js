import React from 'react';
import styled from 'styled-components';

const StyledLabel = styled.div`
`;

const StyledLabelValue = styled.pre`
    color: orange;
`;

export default function ContainerLabel({ container }) {

  if (!container) {
      return null;
  }

  const { state } = container;

  if (!state) {
    return null;
  }

  return (
    <div>
        {Object.keys(container.labels).map(label => (
            <StyledLabel key={label}>
                    <StyledLabelValue>{label} = {container.labels[label]}</StyledLabelValue>
            </StyledLabel>
        ))}
    </div>
  );
}
