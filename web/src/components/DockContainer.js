import React from 'react';
import styled from 'styled-components';
import determineColorForString from '../utils/determineColorForString';
import moment from 'moment';
import DockContainerState from './DockContainerState';
import useApi from '../hooks/useApi';
const DockContainerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #624694;

  @media all and (max-width: 450px) {
    flex-direction: column;
  }
`;

const StyledObjectLink = styled.a`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
`;

const ContainerName = styled.h2`
  color: #946ddc;
  margin: 0.5rem 0;

  @media all and (max-width: 450px) {
    font-size: 1.4rem;
  }
  `;

const ContainerState = styled.div`

`;

const ContainerCreatedAt = styled.span`
  color: #fff;
  margin-left: 0.5rem;
`;

const ContainerTag = styled.span`
  margin-right: 10px;
  color: ${props => props.color};
`;

const ContainerOptions = styled.div`
  display: flex;
  @media all and (max-width: 450px) {
    justify-content: space-around;
  }
  `;

const StyledActionButton = styled.button`
  outline: 0;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 0.5rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media all and (max-width: 450px) {
    margin: 0.5rem;
  }
`;

const Remove = styled(StyledActionButton)`
  color: salmon;
`;

const Restart = styled(StyledActionButton)`
  color: orange;
`;

const StyledMessage = styled.p`
  margin: 0.5rem 0;
  color: #fff;
`;

export default function DockContainer({ container, handleRefetch }) {
  
  if (!container) {
    return null;
  }
  // eslint-disable-next-line
  const [restartingContainer, restartResponse, err1, restartContainer] = useApi({
    endpoint: `containers/${container.id}/restart`,
    method: "POST",
    successDelay: 2000,
    onSuccess: () => {
     handleRefetch()
    }, 
  });

   // eslint-disable-next-line
  const [removingContainer, removeResponse, err2, removeContainer] = useApi({
    endpoint: `containers/${container.id}/delete`,
    method: "DELETE",
    successDelay: 2000,
    onSuccess: () => {
     handleRefetch()
    }, 
  });

  
  return (
    <DockContainerWrapper>
    <StyledObjectLink href={`https://not-implemented-yet.no`} target="_blank">
      <ContainerName>
        <ContainerTag color={determineColorForString(container.name)}>#</ContainerTag>
        {container.name}
      </ContainerName>
      
      <ContainerState>
       <DockContainerState containerState={container.state} />
       <ContainerCreatedAt>Started {moment(container.created).calendar().toLocaleLowerCase()}</ContainerCreatedAt> 
      </ContainerState>
      {
        restartingContainer && <StyledMessage>Restarting..</StyledMessage>
      }
      {
        removingContainer && <StyledMessage>Removing container..</StyledMessage>
      }
    </StyledObjectLink>
    <ContainerOptions>
      <Restart onClick={() => restartContainer()}>RESTART</Restart>
      <Remove onClick={() => removeContainer()}>REMOVE</Remove>
    </ContainerOptions>
    
    </DockContainerWrapper>
  );
}
