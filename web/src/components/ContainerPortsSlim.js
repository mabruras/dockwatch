import React from "react";
import styled from "styled-components";

const NoPortsFoundMessage = styled.p`
  color: #777;
  font-style: italic;
`;

const PortInfo = styled.p`
  color: #fff;
`;

const PortHighlight = styled.span`
  color: darkcyan;
  font-weight: bold;
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
    <div>
      {allPublishedPorts.map(port => (
        <div key={port}>
          {ports.published[port] &&
            ports.published[port].map((portItem, idx) => (
              <div key={idx}>
                <div key={idx}>
                  <PortInfo>
                    <PortHighlight>{port}</PortHighlight> (container) ->{" "}
                    <PortHighlight>{portItem.HostPort}</PortHighlight> (
                    {portItem.HostIp === "127.0.0.1" ||
                    portItem.HostIp === "0.0.0.0"
                      ? `localhost`
                      : portItem.HostIp}
                    )
                  </PortInfo>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
