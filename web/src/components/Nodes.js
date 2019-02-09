import React, { useContext, useEffect } from 'react';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import Busy from './Busy';
import NoContentFound from './NoResults';
import CreateNodeItem from './CreateNodeItem';
import { SelectedNodeContext, defaultNode } from '../context/SelectedNodeContext';
import Node from './Node';

export default function Nodes() {
  
  const { dispatch } = useContext(TitleContext);
  const selectedNodeContext = useContext(SelectedNodeContext);

  let nodes = [
    {
      id: 'id1',
      name: 'Node 1',
      baseUrl: 'http://vg.no'
    },
    {
      id: 'id2',
      name: 'Node 2',
      baseUrl: 'http://localhost:5000'
    }
  ];

  if(defaultNode) {
    nodes = [defaultNode, ...nodes]
  }

  useEffect(() => {
    dispatch({
      type: 'set-title',
      data: {
        title: "Nodes",
        titleColor: determineColorForString("nodes")
      }
    });
  }, []);

  const handleNodeSelected = node => {
    selectedNodeContext.setData(node)
  }

  if (!nodes) return <NoContentFound />;

  const isNodeSelected = node => {
    return selectedNodeContext.data.id === node.id
  }
  return (
    <Busy busy={false}>
      <Container>
        <CreateNodeItem />
        {
          nodes.map(node => (
            <Node key={node.id} isSelected={isNodeSelected(node)} node={node} onSelect={handleNodeSelected}/>
          ))
        }
      </Container>
    </Busy>
  );
}
