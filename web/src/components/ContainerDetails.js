import React, { useContext, useState } from "react";
import styled, { css } from "styled-components";
import Container from "../styleguides/Container";
import Flex from "../styleguides/Flex";
import { LazyLog, ScrollFollow } from "react-lazylog/es5";
import { TitleContext } from "../context/AppTitleContext";
import Busy from "./Busy";
import useApi from "../hooks/useApi";
import determineColorForString from "../utils/determineColorForString";
import NoResults from "./NoResults";
import DockContainerState from "./DockContainerState";
import ContainerLabel from "./ContainerLabels";
import ContainerImageLabel from "./ContainerImageLabel";
import DockContainer from "./DockContainer";

const ContainerLogWrapper = styled.div`
  margin: 1rem;
`;

const LogWrapper = styled.div`
  width: 100%;
  height: 55vh;
  margin: 0.5rem 0;
`;

const DetailsTitle = styled.h2`
  color: #fff;
  margin: 0.5rem 0;
`;

const ContainerName = styled.span`
  margin: 0;
  color: ${props => props.color || "orange"};
`;

const DetailsSubTitle = styled.h3`
  color: #dbdbdb;
  margin: 0.5rem 0;
  margin-top: 1rem;
`;

const StyledInstanceList = styled.ul`
  margin: 0;
  list-style: none;
  max-height: 600px;
  overflow: auto;
`;

const StyledInstanceListItem = styled.li`
  border-bottom: 1px solid #624694;
  transition: all 0.1s ease-in-out;
  background-color: #222;

  ${props =>
    props.isSelected &&
    css`
      background-color: #232323;
    `}
`;

const SelectedContainerInfo = styled.div``;

export default function ContainerDetails(props) {
  const { dispatch } = useContext(TitleContext);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState(null);

  const {
    match: {
      params: { containerName }
    }
  } = props;

  //eslint-disable-next-line
  const [fetchingContainer, containerResponse, err, refetch] = useApi({
    endpoint: `containers/${containerName}`,
    initialData: null,
    fetchOnMount: true,
    onSuccess: container => {
      setHasLoaded(true);

      if (container && container.data && container.data.length) {
        if (container.data[0].instances && container.data[0].instances.length) {
          setSelectedContainer(container.data[0].instances[0]);
        }
      }

      dispatch({
        type: "set-title",
        data: {
          title: containerName,
          titleColor: determineColorForString(containerName)
        }
      });
    },
    onError: e => {
      setHasLoaded(true);
    }
  });

  if (
    (!containerResponse ||
      (!containerResponse.data || !containerResponse.data.length)) &&
    !fetchingContainer &&
    hasLoaded
  ) {
    return <NoResults />;
  }
  if (!selectedContainer) {
    return <div />;
  }

  return (
    <Busy busy={fetchingContainer}>
      {!hasLoaded ? (
        <DetailsTitle>Loading..</DetailsTitle>
      ) : (
        <ContainerLogWrapper key={selectedContainer.name}>
          <Flex
            justify="center"
            alignItems="center"
            direction="column"
            basis="auto"
          >
            <Container>
              <Flex justify="space-between">
                <SelectedContainerInfo>
                  {selectedContainer && (
                    <DetailsTitle>
                      <ContainerName
                        color={determineColorForString(selectedContainer.name)}
                      >
                        {selectedContainer.name}@
                      </ContainerName>

                      <ContainerName
                        color={determineColorForString(selectedContainer.ip)}
                      >
                        {selectedContainer.ip}
                      </ContainerName>
                    </DetailsTitle>
                  )}
                  <DetailsSubTitle>Original image</DetailsSubTitle>
                  <ContainerImageLabel container={selectedContainer} />
                  <DetailsSubTitle>Container state</DetailsSubTitle>
                  <DockContainerState container={selectedContainer} />
                  <DetailsSubTitle>
                    Labels{" "}
                    {selectedContainer && selectedContainer.labels
                      ? `(${Object.keys(selectedContainer.labels).length})`
                      : ""}
                  </DetailsSubTitle>
                  <ContainerLabel container={selectedContainer} />
                </SelectedContainerInfo>
                {containerResponse.data[0].instances.length > 1 && (
                  <div>
                    <DetailsSubTitle>Select instance</DetailsSubTitle>
                    <StyledInstanceList>
                      {containerResponse.data[0].instances.map(container => (
                        <StyledInstanceListItem
                          key={container.id}
                          isSelected={container.id === selectedContainer.id}
                        >
                          <DockContainer
                            container={container}
                            handleContainerClick={() =>
                              setSelectedContainer(container)
                            }
                            handleRefetch={() => refetch()}
                          />
                        </StyledInstanceListItem>
                      ))}
                    </StyledInstanceList>
                  </div>
                )}
              </Flex>
              <DetailsTitle>
                Dock Log{" "}
                <span role="img" aria-label="log">
                  📚
                </span>
              </DetailsTitle>
              <LogWrapper>
                {selectedContainer && (
                  <ScrollFollow
                    startFollowing={true}
                    render={({ follow, onScroll }) => (
                      <LazyLog
                        extraLines={5}
                        url={`/containers/${selectedContainer.name}/logs`}
                        stream
                        follow={follow}
                        onScroll={onScroll}
                        style={{
                          outline: 0,
                          color: "#fff",
                          background: "#111"
                        }}
                      />
                    )}
                  />
                )}
              </LogWrapper>
            </Container>
          </Flex>
        </ContainerLogWrapper>
      )}
      )) )}
    </Busy>
  );
}
