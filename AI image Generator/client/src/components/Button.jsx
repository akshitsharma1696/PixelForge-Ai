import { CircularProgress } from "@mui/material";
import React from "react";
import styled from "styled-components";

const StyledButton = styled.button`
  position: relative;
  border-radius: 6px;
  border: 1px solid transparent;
  color: white;
  font-size: 13.5px;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: min-content;
  padding: 8px 16px;
  line-height: 1.4;

  @media (max-width: 600px) {
    padding: 7px 12px;
    font-size: 13px;
  }

  ${({ $variant, theme }) =>
    $variant === "secondary"
      ? `
      background: ${theme.card};
      border-color: ${theme.border};
      color: ${theme.text_primary};

      &:hover:not(:disabled) {
        background: ${theme.surfaceHover};
        border-color: ${theme.borderHover};
      }
    `
      : $variant === "danger"
      ? `
      background: rgba(239, 68, 68, 0.12);
      border-color: rgba(239, 68, 68, 0.3);
      color: #ef4444;

      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.2);
        border-color: #ef4444;
      }
    `
      : `
      background: ${theme.primary};
      border-color: transparent;
      color: #ffffff;

      &:hover:not(:disabled) {
        background: ${theme.primaryHover};
      }
    `}

  &:active:not(:disabled) {
    transform: translateY(1px);
  }

  ${({ $isDisabled }) =>
    $isDisabled &&
    `
    opacity: 0.5;
    cursor: not-allowed;
  `}

  ${({ $isLoading }) =>
    $isLoading &&
    `
    opacity: 0.8;
    cursor: not-allowed;
  `}

  ${({ $flex }) =>
    $flex &&
    `
    flex: 1;
    width: 100%;
  `}
`;

const Button = ({
  text,
  isLoading,
  isDisabled,
  rightIcon,
  leftIcon,
  type,
  onClick,
  flex,
  htmlType = "button",
  style,
}) => {
  return (
    <StyledButton
      type={htmlType}
      onClick={(e) => {
        if (isDisabled || isLoading) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
      $variant={type}
      $isDisabled={isDisabled}
      $isLoading={isLoading}
      $flex={flex}
      style={style}
      disabled={Boolean(isDisabled || isLoading)}
    >
      {isLoading && (
        <CircularProgress
          style={{ width: "14px", height: "14px", color: "inherit" }}
        />
      )}
      {!isLoading && leftIcon}
      {text}
      {!isLoading && rightIcon}
    </StyledButton>
  );
};

export default Button;


