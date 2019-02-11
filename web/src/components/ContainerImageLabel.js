import React from 'react';
import styled from 'styled-components';
import determineColorForString from '../utils/determineColorForString';

const ImageName = styled.span`
  font-weight: bold;
  color: ${props => props.color || "#fff"}
`;
const ImageVersion = styled.span`
  color: ${props => props.color || "#fff"}
`;

export default function ContainerImageLabel({container}) {
    if(!container) {
        return null;
    }
    
    return(
    <ImageName color={determineColorForString(container.image.name)}>
                  {container.image.name}:
                  <ImageVersion color={determineColorForString(container.image.version)}>{container.image.version}</ImageVersion>
                </ImageName>
    );
}