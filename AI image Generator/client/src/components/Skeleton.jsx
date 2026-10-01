import React from "react";
import styled, { keyframes } from "styled-components";

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const SkeletonBox = styled.div`
  width: 100%;
  height: 100%;
  min-height: ${({ $minHeight }) => $minHeight || "280px"};
  border-radius: 16px;
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.bgLight} 25%,
    ${({ theme }) => theme.card} 50%,
    ${({ theme }) => theme.bgLight} 75%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

function Skeleton({ minHeight }) {
  return <SkeletonBox $minHeight={minHeight} />;
}

export default Skeleton;
