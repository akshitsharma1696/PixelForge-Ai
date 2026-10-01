import React from "react";
import styled from "styled-components";
import { NavLink, Link, useNavigate } from "react-router-dom";
import {
  HomeRounded,
  AutoAwesomeRounded,
  DashboardRounded,
  PublicRounded,
  AccountBalanceWalletRounded,
  GroupsRounded,
  PhotoLibraryRounded,
  BoltRounded,
  PersonOutlineRounded,
} from "@mui/icons-material";
import { useApp } from "../context/AppContext";

const Shell = styled.aside`
  width: 220px;
  min-width: 220px;
  height: 100%;
  background: ${({ theme }) => theme.sidebar};
  border-right: 1px solid ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px 12px;
  z-index: 20;

  @media (max-width: 768px) {
    width: 100%;
    min-width: 100%;
    height: auto;
    flex-direction: row;
    justify-content: space-around;
    padding: 8px 6px;
    border-right: none;
    border-top: 1px solid ${({ theme }) => theme.border};
    order: 2;
  }
`;

const TopSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
    gap: 0;
  }
`;

import logoImg from "../assets/logo.png";

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  padding: 4px 8px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

const BrandLogo = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const BrandText = styled.div`
  font-family: "Outfit", sans-serif;
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
  letter-spacing: -0.01em;

  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const NavList = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 100%;

  @media (max-width: 768px) {
    flex-direction: row;
    justify-content: space-around;
  }
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 6px;
  text-decoration: none;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 13.5px;
  font-weight: 500;
  transition: background 0.15s ease, color 0.15s ease;

  svg {
    font-size: 19px;
    color: ${({ theme }) => theme.text_muted};
    transition: color 0.15s ease;
  }

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
    color: ${({ theme }) => theme.text_primary};

    svg {
      color: ${({ theme }) => theme.text_primary};
    }
  }

  &.active {
    background: ${({ theme }) => theme.card_light};
    color: #ffffff;
    font-weight: 600;

    svg {
      color: ${({ theme }) => theme.primary};
    }
  }

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 3px;
    padding: 6px 8px;
    font-size: 10px;

    svg {
      font-size: 20px;
    }
  }
`;

const BottomSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.border};

  @media (max-width: 768px) {
    display: none;
  }
`;

const BalanceRow = styled(Link)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  text-decoration: none;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 12.5px;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};
  }

  div {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  strong {
    color: ${({ theme }) => theme.yellow};
    font-weight: 600;
  }
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }
`;

const UserAvatar = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;

  span:first-child {
    font-size: 12.5px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span:last-child {
    font-size: 11px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const links = [
  { to: "/", label: "Home", icon: <HomeRounded />, end: true },
  { to: "/create", label: "Studio", icon: <AutoAwesomeRounded /> },
  { to: "/community", label: "Explore", icon: <PublicRounded /> },
  { to: "/library", label: "Library", icon: <PhotoLibraryRounded /> },
  { to: "/dashboard", label: "Dashboard", icon: <DashboardRounded /> },
  { to: "/social", label: "Community", icon: <GroupsRounded /> },
  { to: "/billing", label: "Billing", icon: <AccountBalanceWalletRounded /> },
];

function Sidebar() {
  const navigate = useNavigate();
  const { credits, isAuthenticated, user } = useApp();

  return (
    <Shell>
      <TopSection>
        <Brand to="/">
          <BrandLogo>
            <img src={logoImg} alt="PixelForge Logo" />
          </BrandLogo>
          <BrandText>
            Pixel<span>Forge</span>
          </BrandText>
        </Brand>

        <NavList>
          {links.map((link) => (
            <NavItem key={link.to} to={link.to} end={link.end}>
              {link.icon}
              <span>{link.label}</span>
            </NavItem>
          ))}
        </NavList>
      </TopSection>

      <BottomSection>
        {isAuthenticated ? (
          <>
            <BalanceRow to="/billing" title="Click to Top up Credits">
              <div>
                <BoltRounded style={{ fontSize: 16, color: "#f59e0b" }} />
                <span>Credits</span>
              </div>
              <strong>{credits}</strong>
            </BalanceRow>

            <UserRow
              onClick={() =>
                navigate(user?.username ? `/u/${user.username}` : "/dashboard")
              }
              title="View profile"
            >
              <UserAvatar>{user?.name?.[0]?.toUpperCase() || "U"}</UserAvatar>
              <UserInfo>
                <span>{user?.name || "Creator"}</span>
                <span>@{user?.username || "user"}</span>
              </UserInfo>
            </UserRow>
          </>
        ) : (
          <BalanceRow to="/login">
            <div style={{ justifyContent: "center", width: "100%" }}>
              <span>Sign in</span>
            </div>
          </BalanceRow>
        )}
      </BottomSection>
    </Shell>
  );
}

export default Sidebar;


