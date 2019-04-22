import React from "react";
import styled from "styled-components";

const NoPortsFoundMessage = styled.p`
  color: #777;
  font-style: italic;
`;

const PortInfo = styled.p`
  color: ${props => props.color || "#fff"};
  border: 1px solid #444;
  padding: 0.5rem 0;
  text-align: center;
  margin: 0;
`;

const PortHighlight = styled.span`
  color: darkcyan;
  font-weight: bold;
`;

const GridList = styled.div``;

const GridItem = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 150px));
  text-align: center;
`;

const Header = styled.div`
  color: #fff;
  font-weight: bold;
  padding: 0.5rem;
`;

export default function ContainerPorts({ ports, hideOnEmptyPorts }) {
  const renderNoContainerPorts = () => {
    return (
      <NoPortsFoundMessage>
        No container ports has been exposed/mapped.
      </NoPortsFoundMessage>
    );
  };
  if (!ports || !ports.published || !Object.keys(ports.published).length) {
    if (hideOnEmptyPorts) {
      return null;
    }

    return renderNoContainerPorts();
  }

  const allPublishedPorts = Object.keys(ports.published);

  if (!allPublishedPorts || !allPublishedPorts.length) {
    if (hideOnEmptyPorts) {
      return null;
    }

    return renderNoContainerPorts();
  }

  return (
    <GridList>
      <GridItem>
        <Header>Host IP</Header>
        <Header>Host</Header>
        <Header>Container</Header>
      </GridItem>
      {allPublishedPorts.map(port => (
        <React.Fragment key={port}>
          {ports.published[port] &&
            ports.published[port].map((portItem, idx) => (
              <GridItem key={idx}>
                <PortInfo color={"#777"}>{portItem.HostIp}</PortInfo>
                <PortInfo>
                  <PortHighlight>{portItem.HostPort}</PortHighlight>
                </PortInfo>
                <PortInfo>
                  <PortHighlight>{port}</PortHighlight>
                </PortInfo>
              </GridItem>
            ))}
          {!ports.published[port] && port && (
            <GridItem>
              <PortInfo>-</PortInfo>
              <PortInfo>-</PortInfo>
              <PortInfo>
                <PortHighlight>{port}</PortHighlight>
              </PortInfo>
            </GridItem>
          )}
        </React.Fragment>
      ))}
    </GridList>
  );
}
