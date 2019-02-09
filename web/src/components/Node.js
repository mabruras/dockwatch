import React from 'react';
import styled from 'styled-components';
import determineColorForString from '../utils/determineColorForString';

const NodeWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #624694;

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

const NodeNameWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;

`;

const NodeName = styled.h2`
  color: ${props => props.isSelected ? 'green' : '#946ddc'};
  margin: 0;
  padding: 0;

  @media all and (max-width: 450px) {
    font-size: 1.4rem;
  }
  `;
const NodeUrlWrapper = styled.h4`
  margin: 0;
  color: #555;
`;

const NodeTag = styled.span`
  margin-right: 10px;
  font-size: 1.8rem;
  color: ${props => props.color};
`;

const NodeOptions = styled.div`
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

const NodeSelected = styled.span`
  margin-right: 0.5rem;
  color: green;
`;

export default function Node({ node, onSelect, isSelected }) {
  
  if (!node) {
    return null;
  }

  return (
    <NodeWrapper>
    <StyledObjectLink onClick={() => onSelect(node)}>
    <NodeNameWrapper>
    <NodeTag color={isSelected ? 'green' : determineColorForString(node.name)}>
         #
    </NodeTag>
      <NodeName isSelected={isSelected}>
        {node.name} 
      </NodeName>

    </NodeNameWrapper>
    
        <NodeUrlWrapper>
        {isSelected && <NodeSelected>SELECTED</NodeSelected>} {node.baseUrl}
        </NodeUrlWrapper>
       
    </StyledObjectLink>
    <NodeOptions>
      <Remove>REMOVE</Remove>
    </NodeOptions>
    
    </NodeWrapper>
  );
}
