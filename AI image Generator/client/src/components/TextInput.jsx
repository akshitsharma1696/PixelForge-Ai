import React from "react";
import styled from "styled-components";

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.text_secondary};
  padding: 0 2px;
`;

const OutlinedInput = styled.div`
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text_primary};
  outline: none;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
  }

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
  }
`;

const Input = styled.input`
  width: 100%;
  font-size: 13.5px;
  outline: none;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.text_primary};
  font-family: inherit;

  &::placeholder {
    color: ${({ theme }) => theme.text_muted};
  }

  &:focus {
    outline: none;
  }
`;

const TextInput = ({
  label,
  placeholder,
  name,
  value,
  handelChange,
  textArea,
  rows,
  columns,
  type = "text",
}) => {
  return (
    <Container>
      {label && <Label>{label}</Label>}
      <OutlinedInput>
        <Input
          as={textArea ? "textarea" : "input"}
          type={textArea ? undefined : type}
          name={name}
          rows={rows}
          columns={columns}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handelChange(e)}
        />
      </OutlinedInput>
    </Container>
  );
};

export default TextInput;
