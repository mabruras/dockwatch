import React, { useContext, useEffect } from 'react';
import { TitleContext } from '../context/AppTitleContext';
import determineColorForString from '../utils/determineColorForString';
import Container from '../styleguides/Container';
import Busy from './Busy';
import NoContentFound from './NoResults';
import CreateNodeItem from './CreateNodeItem';
import { SelectedNodeContext, defaultNode } from '../context/SelectedNodeContext';
import Node from './Node';

let nodes = [
  defaultNode,
];

export default function Nodes(props) {
  
  const { dispatch } = useContext(TitleContext);
  const selectedNodeContext = useContext(SelectedNodeContext);

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
    selectedNodeContext.setData(node);
    props.history.push(`/`);
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
