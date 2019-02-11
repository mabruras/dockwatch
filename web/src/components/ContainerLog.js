import React from 'react';
import styled from 'styled-components';
import Container from '../styleguides/Container';
import Flex from '../styleguides/Flex';
import { LazyLog } from 'react-lazylog';
import { SelectedNodeContext } from '../context/SelectedNodeContext';
const ContainerLogWrapper = styled.div``;

const LogWrapper = styled.div`
  width: 100%;
  height: 73vh;
`;

export default function ContainerLog (props) {
  
  const {
    match: {
      params: { imageId }
    }
  } = props;

  const selectedNodeContext = useContext(SelectedNodeContext);

  return (
      <ContainerLogWrapper>
        <Flex
          justify="center"
          alignItems="center"
          direction="column"
          basis="auto"
        >
          <Container>
              <span>logs..</span>
            <LogWrapper>
              <LazyLog url={`${selectedNodeContext.data.baseUrl}/${imageId}/logs`} stream />
            </LogWrapper>
          </Container>
        </Flex>
      </ContainerLogWrapper>
  );
}