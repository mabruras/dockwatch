import React from 'react';
import styled, { css } from 'styled-components';
import moment from 'moment';

const ContainerCreatedAt = styled.span`
  color: #fff;
  margin-left: 0.5rem;
  font-weight: normal;
`;

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

const DaysOldLabelWrapper = styled.span`
  color: #777;
  margin: 0 0.5rem;
`;  
const DaysOldLabel = styled.span`
  margin-right: 3px;
  color: ${props => props.color};
`;

export default function DockContainerState({ container }) {
  
  if (!container) {
    return null;
  }

  const { state } = container;

  if (!state) {
    return null;
  }

  function renderDate(state) {
    switch(state.Status.toUpperCase()) {
      case "RUNNING":
        return `Started ${moment(state.StartedAt).calendar().toLocaleLowerCase()}`;
      case "EXITED":
      return `Finished ${moment(state.FinishedAt).calendar().toLocaleLowerCase()}`;
      default:
      return `Created ${moment(container.created).calendar().toLocaleLowerCase()}`;
    }
  }

  function determineDaysOld(daysSinceCreation) {
    if(daysSinceCreation === 0) {
      return "cadetblue";
    }

    if(daysSinceCreation < 7) {
      return "mediumseagreen";
    }

    if (daysSinceCreation >= 7 && daysSinceCreation < 14) {
      return "salmon";
    }

    if (daysSinceCreation >= 14) {
      return "red";
    }
  }

  const daysOld = moment().diff(moment(container.created), 'days');
  
  return (
    <StyledRunningStateInfo 
        dead={state.Dead}
        running={state.Running}
        paused={state.Paused}
        restarted={state.Restarting}
      >
      {state.Status.toUpperCase()}
      <ContainerCreatedAt>{renderDate(state)}</ContainerCreatedAt>
      <DaysOldLabelWrapper>(<DaysOldLabel color={determineDaysOld(daysOld)}>{daysOld}</DaysOldLabel> day{daysOld === 1 ? '' : 's'} old) </DaysOldLabelWrapper>
      </StyledRunningStateInfo>
  );
}
