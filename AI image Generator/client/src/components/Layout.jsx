import React from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { useApp } from "../context/AppContext";

const Shell = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  background: ${({ theme }) => theme.bg};
  color: ${({ theme }) => theme.text_primary};
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    order: 1;
    flex: 1;
  }
`;

const Content = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

const DemoIndicator = styled.div`
  position: fixed;
  bottom: 12px;
  right: 14px;
  background: rgba(18, 18, 24, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 999;
  pointer-events: none;
  letter-spacing: 0.02em;

  span.dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 6px #10b981;
  }

  @media (max-width: 768px) {
    bottom: 64px;
    right: 10px;
  }
`;

function Layout() {
  const { isDemoMode } = useApp();

  return (
    <Shell>
      <Sidebar />
      <Main>
        <TopBar />
        <Content>
          <Outlet />
        </Content>
      </Main>
      {isDemoMode && (
        <DemoIndicator title="Smart Simulation Active">
          <span className="dot" />
          Dev-Demo Active
        </DemoIndicator>
      )}
    </Shell>
  );
}

export default Layout;
