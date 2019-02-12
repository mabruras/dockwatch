import React from 'react';
import styled from 'styled-components';
import determineColorForString from '../utils/determineColorForString';
import DockContainerState from './DockContainerState';
import useApi from '../hooks/useApi';
import { loading } from '../icons';
import { spin } from '../utils/animations';
import { isWebUri } from 'valid-url';
import { Link } from 'react-router-dom';
import ContainerImageLabel from './ContainerImageLabel';

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

const ContainerNameWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;

`;

const ContainerName = styled.h2`
  color: #946ddc;
  margin: 0;
  padding: 0;

  @media all and (max-width: 450px) {
    font-size: 1.4rem;
  }
  `;

const ContainerState = styled.div`
  display: flex;
  align-items: center;
`;

const ContainerTag = styled.span`
  margin-right: 10px;
  font-size: 1.8rem;
  color: ${props => props.color};
`;

const ContainerOptions = styled.div`
  display: flex;
  @media all and (max-width: 450px) {
    justify-content: space-around;
  }
  `;

const COMMON_ACTION_BUTTON_STYLES = `
  text-decoration: none;
  outline: 0;
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 0.8rem;
  margin: 0 0.5rem;
  transition: all 0.15s ease-in-out;

  &:hover {
    transform: scale(1.05);
  }

  @media all and (max-width: 450px) {
    margin: 0.5rem;
  }
`

const StyledActionButton = styled.button`
  ${COMMON_ACTION_BUTTON_STYLES}
  `;

const LogLink = styled(({ ...props }) => <Link {...props} />)`
  color: lightskyblue;
  ${COMMON_ACTION_BUTTON_STYLES}
`;

const Remove = styled(StyledActionButton)`
  color: salmon;
`;


const Restart = styled(StyledActionButton)`
  color: orange;
}
`;

const StyledMessage = styled.p`
  margin: 0.5rem 0;
  color: #fff;
`;

const Spinner = styled.span`
  svg {
    animation: ${spin} 4s infinite linear;
  }
`;

export default function DockContainer({ imageId, container, handleRefetch }) {
  
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

  let containerHref = container.labels['container.url'] || '#';
  let isRemovable = container.labels['dockwatch.removable'] && container.labels['dockwatch.removable'].toUpperCase() === "TRUE";
  let isRestartable = container.labels['dockwatch.restartable'] && container.labels['dockwatch.restartable'].toUpperCase() === "TRUE";

  if(containerHref !== '#' && !isWebUri(containerHref)) {
    containerHref = "http://" + containerHref;
  }

  return (
    <DockContainerWrapper>
    <StyledObjectLink href={containerHref}>
    <ContainerNameWrapper>
    <ContainerTag color={determineColorForString(container.name)}>
          { restartingContainer ? <Spinner>{loading}</Spinner> : "#" }
    </ContainerTag>
      <ContainerName>
        {container.name}
      </ContainerName>

    </ContainerNameWrapper>

      <ContainerState>
      <DockContainerState container={container} />
      </ContainerState>
      <ContainerImageLabel container={container} />
      {
        removingContainer && <StyledMessage>Removing container..</StyledMessage>
      }
    </StyledObjectLink>
    <ContainerOptions>
      {isRestartable && <Restart onClick={() => restartContainer()}>RESTART</Restart>}
      {isRemovable && <Remove onClick={() => removeContainer()}>REMOVE</Remove>}
      <LogLink to={`/${imageId}/${container.id}`}>VIEW DETAILS</LogLink>
    </ContainerOptions>
    </DockContainerWrapper>
  );
}
