import React, { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import useApi from '../hooks/useApi';
import Busy from './Busy';
import NoContentFound from './NoResults';
import styled from 'styled-components';
import DockStatusLabels from './DockStatusLabels';
import { Link } from 'react-router-dom';
import StyledSearchInput from '../styleguides/StyledSearchInput';

const Instance = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 3px solid ${props => props.color || "transparent"};

  @media all and (max-width: 450px) {
    flex-direction: column;
  }
`;

const InstanceTitle = styled.h2`
  color: #fff;
  margin: 0;
`;

const DockLink = styled(({ ...props }) => <Link {...props} />)`
  display: flex;
  flex-direction: column;
  text-decoration: none;
  cursor: pointer;
`; 

export default function Containers(props) {
  
  const { dispatch } = useContext(TitleContext);
  const [filterInput, setFilterInput] = useState("");

  const { 
    match: {
      params: { imageId }
    }
  } = props;

  useEffect(() => {
    dispatch({
      type: 'set-title',
      data: {
        title: imageId,
        titleColor: determineColorForString(imageId)
      }
    });
  }, []);

  // eslint-disable-next-line
  const [fetchingContainers, containersResponse, error, fetchData] = useApi({
    endpoint: `images/${imageId}/containers`,
    fetchOnMount: true,
    initialData: []
  });

  if (!imageId || (!fetchingContainers && !containersResponse)) return <NoContentFound />;

  return (
    <Busy busy={fetchingContainers}>
      {(containersResponse && containersResponse.data) && (
        <Container>
          <Instance padded>
            <StyledSearchInput onChange={e => setFilterInput(e.target.value)} value={filterInput} placeholder="Search container names..." />   
          </Instance>
        {containersResponse.data.filter(item => filterInput.length === 0 || item.name.toLowerCase().includes(filterInput.toLowerCase())).map(item => (
          <React.Fragment key={item.name + item.ip}>
            <DockLink to={`/${imageId}/${item.name}`}>
            <Instance color={determineColorForString(item.name)}>
              <InstanceTitle color={determineColorForString(item.name)}>{item.name}</InstanceTitle>
              <DockStatusLabels statuses={item.status} />
            </Instance>
            </DockLink>
            
            { /* 
            
            item.instances.map(instance => (
                <DockInstance 
                imageId={item.name}
                container={instance} 
                key={instance.id} 
                handleRefetch={() => fetchData()} 
                />
              ))
              
            */
              
            }
          </React.Fragment>
        ))}
      </Container>
      )}
    </Busy>
  );
}
