import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import Container from '../styleguides/Container';
import Flex from '../styleguides/Flex';
import { LazyLog } from 'react-lazylog';
import { SelectedNodeContext } from '../context/SelectedNodeContext';
import Line from 'react-lazylog/build/Line';
import { TitleContext } from '../context/AppTitleContext';
import Busy from './Busy';
import useApi from '../hooks/useApi';
import determineColorForString from '../utils/determineColorForString';
import NoResults from './NoResults';
import DockContainerState from './DockContainerState';
import ContainerLabel from './ContainerLabels';
import ContainerImageLabel from './ContainerImageLabel';

Line.defaultProps.style = {
    color: 'green'
  };

const ContainerLogWrapper = styled.div`
  margin: 1rem;
`;

const LogWrapper = styled.div`
  width: 100%;
  height: 55vh;
`;

const DetailsTitle = styled.h2`
  color: #fff;
  margin: 0.5rem 0;
`;

const ContainerName = styled.p`
  margin: 0;
  color: orange;
`;

const ContainerId = styled.span`
  color: #777;
  font-style: italic;
`;

const DetailsSubTitle = styled.h3`
    color: burlywood;
    margin: 0.5rem 0;
    margin-top: 1rem;
`;


export default function ContainerDetails (props) {
  
  const { dispatch } = useContext(TitleContext);
  const [hasLoaded, setHasLoaded] = useState(false);

  const {
    match: {
      params: { containerId }
    }
  } = props;

  const [fetchingContainer, container] = useApi({
    endpoint: `containers/${containerId}`,
    initialData: null,
    fetchOnMount: true,
    onSuccess: container => {
      setHasLoaded(true)
      dispatch({
        type: 'set-title',
        data: {
          title: container.name,
          titleColor: determineColorForString(container.name)
        }
      });
    },
    onError: e => {
      setHasLoaded(true)
    }
  });

  const selectedNodeContext = useContext(SelectedNodeContext);


  if(!container && !fetchingContainer && hasLoaded) {
    return <NoResults />
  }

  return (
    <Busy busy={fetchingContainer}>
      {fetchingContainer ? <DetailsTitle>Loading..</DetailsTitle> : (

      <ContainerLogWrapper>
        <Flex
          justify="center"
          alignItems="center"
          direction="column"
          basis="auto"
        >
          <Container>
              <DetailsTitle>
                  Container details 
              </DetailsTitle>
               {container && (
                 <>
               <DetailsSubTitle>
                 Container name
               </DetailsSubTitle>
                 <ContainerName>{container.name} <ContainerId>(id: {container.id})</ContainerId></ContainerName>
                 </>
               )} 
              <DetailsSubTitle>
                 Original image
              </DetailsSubTitle>
                <ContainerImageLabel container={container} />
              <DetailsSubTitle>
                  Container state
              </DetailsSubTitle>
              <DockContainerState container={container} />
              <DetailsSubTitle>
                  Labels {container ? `(${Object.keys(container.labels).length})` : ''}
              </DetailsSubTitle>
              <ContainerLabel container={container} />
              <DetailsTitle>
                  Dock Log <span role="img" aria-label="log">📚</span>
              </DetailsTitle>
            <LogWrapper>
              <LazyLog 
              url={`${selectedNodeContext.data.baseUrl}/containers/${containerId}/logs`} stream extraLines={5}
              style={
                {
                  background: "#111",
                  outline: 0
                }
              }
              />
            </LogWrapper>
          </Container>
        </Flex>
      </ContainerLogWrapper>
      )}
      
      </Busy>
  );
}