import React from 'react';
import styled, { css } from 'styled-components';



const StyledRunningStateInfo = styled.span`
 font-weight: bold;
 color: salmon;
  ${props => props.dead && css`
    color: grey;
  `}
  ${props => props.running && css`
    color: green;
  `}
  ${props => props.paused && css`
    color: yellow;
  `}
  ${props => props.restarted && css`
    color: orange;
  `}
  `;

export default function DockContainerState({ containerState }) {

  if (!containerState) {
    return null;
  }
  
  return (
    <StyledRunningStateInfo 
        dead={containerState.Dead}
        running={containerState.Running}
        paused={containerState.Paused}
        restarted={containerState.Restarting}
      >{containerState.Status.toUpperCase()}</StyledRunningStateInfo>
  );
}
