import styled, { css } from 'styled-components';

const Container = styled.div`
  margin: 0 auto;
  max-width: 1920px;
  width: 100%;

  ${props =>
    props.gutterTop &&
    css`
      margin-top: 1rem;
    `};
`;

export default Container;
