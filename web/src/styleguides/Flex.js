import styled, { css } from 'styled-components';

const Flex = styled.div`
  display: ${props => (props.display ? props.display : 'flex')};
  justify-content: ${props => (props.justify ? props.justify : 'unset')};
  align-items: ${props => (props.alignItems ? props.alignItems : 'unset')};
  flex-direction: ${props => (props.direction ? props.direction : 'row')};
  flex-wrap: wrap;

  ${props =>
    props.basis &&
    css`
      flex-basis: ${props.basis};
    `};

  ${props =>
    props.flexFlow &&
    css`
      flex-flow: ${props.flexFlow};
    `};

  ${props =>
    props.fullWidth &&
    css`
      width: 100%;
    `};

  ${props =>
    props.child &&
    css`
      padding: 0 ${props.gap || '1rem'};

      > * {
        margin: 0 -${props.gap || '1rem'};
      }
    `};
  ${props =>
    props.threeCol &&
    css`
      flex: 1 33%;

      @media all and (max-width: 650px) {
        flex: 1 50%;
      }
    `}

  ${props =>
    props.gutterBottom &&
    css`
      margin-bottom: 2rem;
    `};
`;

export default Flex;
