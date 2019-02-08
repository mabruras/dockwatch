import { keyframes } from "styled-components";

export const fadeInBottom = keyframes`
    0% {
        opacity: 0;
    }

    100% {
        opacity: 1;
    }
`;

export const float = keyframes`
    50% {
        transform: translateY(15px);
    }
`;

export const scaleX = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`;

export const spin = keyframes`
0% {
    transform: rotate(360deg);
}
100% {
    transform: rotate(0deg);
}
`;
