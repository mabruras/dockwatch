import React from "react";
import styled from "styled-components";
import determineColorForString from "../utils/determineColorForString";

const Versions = styled.div`
  display: flex;
`;

const VersionLabel = styled.span`
  margin: 5px;
  background-color: ${props => props.color};
  border-radius: 10px;
  padding: 0.3rem 0.7rem;
  color: #fff;
  flex-basis: 20%;
`;

const ContainerStatus = styled.span``;

const ContainerStatusAmount = styled.span`
  margin-left: 0.5rem;
  font-weight: bold;
`;

export default function DockStatusLabels({ statuses }) {
  return (
    <Versions>
    {Object.keys(statuses).map(status => (
      <VersionLabel
        key={status}
        color={determineColorForString(status + "STATUS")}
      >
        <ContainerStatus>{`${status}:`}</ContainerStatus>
        <ContainerStatusAmount>
          {statuses[status]}
        </ContainerStatusAmount>
      </VersionLabel>
    ))}
  </Versions>
  );
}
