import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import determineColorForString from '../utils/determineColorForString';

const StyledObjectLink = styled(({ ...props }) => <Link {...props} />)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
  padding: 1rem;
  border-bottom: 1px solid #624694;
`;

const ChannelName = styled.h2`
  color: #946ddc;
  margin: 0.5rem 0;
`;

const ChannelDescription = styled.p`
  color: #fff;
  margin: 0;
`;

const ChannelTag = styled.span`
  margin-right: 10px;
  color: ${props => props.color};
`;

export default function CreateNodeItem() {
  
  return (
    <StyledObjectLink to={`/nodes/create`}>
      <ChannelName>
        <ChannelTag color={determineColorForString("Create Node")}>+</ChannelTag>
        Create new Node
      </ChannelName>
      <ChannelDescription>Click here to create a new Node.</ChannelDescription>
    </StyledObjectLink>
  );
}