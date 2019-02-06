import styled, { css } from 'styled-components';

export const MessageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  white-space: pre-wrap;

  ${props =>
    props.isLast &&
    css`
      margin-bottom: 60px;
    `}
`;

export const MessageText = styled.span`
  color: #fff;
  max-width: 500px;
  font-family: 'Roboto', sans-serif;
  overflow-wrap: break-word;
  word-break: break-word;
`;

export const CircularIconWrapper = styled.div`
  background-color: ${props => props.color || '#000'};
  border-radius: 50%;
  height: 50px;
  width: 50px;
  display: flex;
  overflow: hidden;

  img {
    width: 100%;
  }
`;
