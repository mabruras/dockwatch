import React, { useContext, useEffect, useState } from 'react';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import useApi from '../hooks/useApi';
import Busy from './Busy';
import NoContentFound from './NoResults';
import styled from 'styled-components';
import StyledSearchInput from '../styleguides/StyledSearchInput';
import DockContainer from './DockContainer';

const Instance = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 3px solid ${props => props.color || "transparent"};

  @media all and (max-width: 450px) {
    flex-direction: column;
  }
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
          <DockContainer key={item.name + item.ip} container={item} imageId={imageId} handleRefetch={() => fetchData()}/>
        ))}
      </Container>
      )}
    </Busy>
  );
}
