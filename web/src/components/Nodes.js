import React, { useContext, useEffect } from 'react';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import Busy from './Busy';
import NoContentFound from './NoResults';
import CreateNodeItem from './CreateNodeItem';

export default function Nodes() {
  
  const { dispatch } = useContext(TitleContext);

  useEffect(() => {
    dispatch({
      type: 'set-title',
      data: {
        title: "NODES",
        titleColor: determineColorForString("nodes")
      }
    });
  }, []);

  const nodes = []; // use local storage

  if (!nodes) return <NoContentFound />;

  return (
    <Busy busy={false}>
      <Container>
        <CreateNodeItem />
      </Container>
    </Busy>
  );
}
