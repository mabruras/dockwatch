import React from "react";
import styled from "styled-components";

const NoPortsFoundMessage = styled.p`
  color: #777;
  font-style: italic;
`;

const PortInfo = styled.p`
  color: #fff;
  margin: 0.1rem;
  font-size: 0.9rem;
`;

const PortHighlight = styled.span`
  color: ${props => props.color || "darkcyan"};
  font-weight: bold;
`;

const PortMap = styled.div`
    display: flex;
`;
const ContentPadder = styled.div`
    margin: 0.5rem;
`;
const Delimiter = styled.span`
    color: #aaa;
    margin: 0 0.2rem;
`;

export default function ContainerPortsSlim({ ports, hideOnEmptyPorts }) {
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
    <ContentPadder>
      {allPublishedPorts.map(port => (
        <div key={port}>
          {ports.published[port] &&
            ports.published[port].map((portItem, idx) => (
              <PortMap key={idx}>
                  <PortInfo>
                    <PortHighlight color={"#777"}>{portItem.HostIp}:</PortHighlight>
                    <PortHighlight>{portItem.HostPort}</PortHighlight>
                     <Delimiter>-></Delimiter>
                    <PortHighlight>{port}</PortHighlight>
                  </PortInfo>
              </PortMap>
            ))}
        </div>
      ))}
    </ContentPadder>
  );
}
