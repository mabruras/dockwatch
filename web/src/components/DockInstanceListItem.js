import React from 'react';
import styled from 'styled-components';
import determineColorForString from '../utils/determineColorForString';
import DockContainerState from './DockContainerState';
import ContainerImageLabel from './ContainerImageLabel';
import ContainerPortsSlim from './ContainerPortsSlim';

const DockContainerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;

  @media all and (max-width: 450px) {
    flex-direction: column;
  }
`;

const StyledObjectLink = styled.div`
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

const ColorizedSpan = styled.span`
  color: ${props => props.color};
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


export default function DockInstanceListItem({container, handleContainerClick}) {

  if (!container) {
    return null;
  }


  return (
    <DockContainerWrapper>
      <StyledObjectLink onClick={() => handleContainerClick()}>
        <ContainerNameWrapper>
          <ContainerTag color={determineColorForString(container.name)}>
            {"#"}
          </ContainerTag>
          <ContainerName>
            {container.name}@<ColorizedSpan color={determineColorForString(container.ip)}>{container.ip}</ColorizedSpan>
          </ContainerName>
        </ContainerNameWrapper>
        <ContainerState>
          <DockContainerState container={container}/>
        </ContainerState>
        <ContainerImageLabel container={container}/>
        <ContainerPortsSlim ports={container.ports} hideOnEmptyPorts={true}/>
      </StyledObjectLink>
    </DockContainerWrapper>
  );
}
