import React, { useContext, useEffect } from 'react';
import DockContainer from './DockContainer';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import useApi from '../hooks/useApi';
import Busy from './Busy';
import NoContentFound from './NoResults';

export default function Containers(props) {
  
  const { dispatch } = useContext(TitleContext);
  
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
  const [fetchingContainers, containers, error, fetchData] = useApi({
    endpoint: `images/${imageId}/containers`,
    fetchOnMount: true,
    initialData: []
  });

  if (!imageId) return <NoContentFound />;

  return (
    <Busy busy={fetchingContainers}>
      <Container>
        {containers.map(item => (
          <DockContainer 
            imageId={imageId}
            container={item} 
            key={item.id} 
            handleRefetch={() => fetchData()} />
        ))}
      </Container>
    </Busy>
  );
}
