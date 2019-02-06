import styled, { css } from 'styled-components';

const Busy = styled.div`
  opacity: 1;
  transition: 0.4s ease-in-out;

  ${props =>
    props.busy &&
    css`
      opacity: 0.2;
    `};
`;

export default Busy;
