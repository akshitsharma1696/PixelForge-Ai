import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useApp } from "../context/AppContext";

const Loading = styled.div`
  height: 100%;
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.text_secondary};
`;

function ProtectedRoute({ children }) {
  const { isAuthenticated, authLoading } = useApp();
  const location = useLocation();

  if (authLoading) {
    return <Loading>Loading workspace…</Loading>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default ProtectedRoute;
