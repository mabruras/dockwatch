import React from "react";
import styled from "styled-components";
import { float, scaleX } from "../utils/animations";

const Container = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const NoContentText = styled.p`
  margin-left: 15px;
  color: #777;
  font-weight: bold;
`;

const NoContentAnimation = styled.div`
  margin-bottom: 1.5rem;
`;

const HoveringEmoji = styled.div`
  color: #624694;
  font-size: 5rem;
  animation: ${float} 2s ease-in-out infinite;
  z-index: 10;
  margin-bottom: 0.5rem;
`;
const ShadowWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
`;
const Shadow = styled.div`
  position: absolute;
  width: 5rem;
  height: 0.8rem;
  background: #333;
  border-radius: 50%;
  opacity: .3;
  animation: ${scaleX} 2s ease-in-out infinite;
`;

const NO_CONTENT_EMOJIS = ["🤔", "🙈", "😭", "😴", "🎁", "🍑", "🍆"]

export default function NoContentFound(props) {
  
  const { label } = props;
  const selectedEmoji = NO_CONTENT_EMOJIS[Math.floor(Math.random()*NO_CONTENT_EMOJIS.length)];
  return (
    <Container>
        <NoContentAnimation>
            <HoveringEmoji><span role="img" aria-label="No content icon">{selectedEmoji}</span></HoveringEmoji>
            <ShadowWrapper>
              <Shadow/>
            </ShadowWrapper>
        </NoContentAnimation>
        <NoContentText>{label || "Nothing to show here.."}</NoContentText>
    </Container>
  );
}
