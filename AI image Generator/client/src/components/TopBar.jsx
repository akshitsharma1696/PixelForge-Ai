import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import {
  SearchOutlined,
  BoltRounded,
  PersonOutlineRounded,
  LogoutRounded,
  NotificationsNoneRounded,
  DoneAllRounded,
  AddRounded,
  AutoAwesomeRounded,
  AccountBalanceWalletRounded,
  FavoriteBorderRounded,
} from "@mui/icons-material";
import { useApp } from "../context/AppContext";
import logoImg from "../assets/logo.png";

const Bar = styled.header`
  height: 56px;
  min-height: 56px;
  background: ${({ theme }) => theme.navbar};
  border-bottom: 1px solid ${({ theme }) => theme.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 20px;
  position: relative;
  z-index: 30;

  @media (max-width: 768px) {
    padding: 0 12px;
    height: 52px;
    min-height: 52px;
    gap: 10px;
  }
`;

const MobileBrand = styled(Link)`
  display: none;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  flex-shrink: 0;

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MobileLogo = styled.div`
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

const SearchWrap = styled.div`
  flex: 1;
  max-width: 420px;
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 6px 12px;
  transition: border-color 0.15s ease;

  &:focus-within {
    border-color: ${({ theme }) => theme.primary};
  }

  svg {
    color: ${({ theme }) => theme.text_muted};
    font-size: 18px;
  }

  input {
    border: none;
    outline: none;
    width: 100%;
    background: transparent;
    color: ${({ theme }) => theme.text_primary};
    font-size: 13px;
    font-family: inherit;

    &::placeholder {
      color: ${({ theme }) => theme.text_muted};
    }
  }
`;

const Right = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
`;

const QuickCreateBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: ${({ theme }) => theme.primary};
  color: #ffffff;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }

  svg {
    font-size: 17px;
  }

  @media (max-width: 600px) {
    display: none;
  }
`;

const CreditPill = styled(Link)`
  display: flex;
  align-items: center;
  gap: 5px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.text_secondary};
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12.5px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.15s ease, color 0.15s ease;

  svg {
    font-size: 16px;
    color: ${({ theme }) => theme.yellow};
  }

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};
  }
`;

const RelativeBox = styled.div`
  position: relative;
`;

const IconBtn = styled.button`
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text_secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  svg {
    font-size: 18px;
    color: ${({ theme }) => theme.text_secondary};
  }

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
    border-color: ${({ theme }) => theme.borderHover};
    color: ${({ theme }) => theme.text_primary};

    svg {
      color: ${({ theme }) => theme.text_primary};
    }
  }

  ${({ $active, theme }) =>
    $active &&
    `
    background: ${theme.surfaceHover};
    border-color: ${theme.borderHover};
    color: #ffffff;
  `}
`;

const Badge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ theme }) => theme.primary};
`;

const NotificationDropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 320px;
  max-width: calc(100vw - 32px);
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 12px;
  box-shadow: ${({ theme }) => theme.shadow};
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
`;

const NotifHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.border};

  h4 {
    margin: 0;
    font-size: 13px;
    font-weight: 600;
    color: ${({ theme }) => theme.text_primary};
  }

  button {
    background: transparent;
    border: none;
    color: ${({ theme }) => theme.primary};
    font-size: 11px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px;
    border-radius: 4px;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const NotifList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 260px;
  overflow-y: auto;
`;

const NotifItem = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
  border-radius: 6px;
  background: ${({ $unread, theme }) =>
    $unread ? theme.card_light : "transparent"};
  border: 1px solid
    ${({ $unread, theme }) =>
      $unread ? theme.borderHover : "transparent"};
  transition: background 0.15s ease;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.surfaceHover};
  }
`;

const NotifIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${({ $type }) =>
    $type === "credit"
      ? "rgba(245, 158, 11, 0.15)"
      : $type === "heart"
      ? "rgba(239, 68, 68, 0.15)"
      : "rgba(99, 102, 241, 0.15)"};
  color: ${({ $type }) =>
    $type === "credit"
      ? "#f59e0b"
      : $type === "heart"
      ? "#ef4444"
      : "#6366f1"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    font-size: 14px;
  }
`;

const NotifContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;

  p {
    margin: 0;
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.text_primary};
    line-height: 1.3;
  }

  span {
    font-size: 10px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const AuthLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border-radius: 6px;
  background: ${({ theme }) => theme.primary};
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.primaryHover};
  }
`;

const INITIAL_NOTIFICATIONS = [
  {
    id: 1,
    title: "Image synthesized successfully",
    time: "2m ago",
    type: "create",
    unread: true,
  },
  {
    id: 2,
    title: "50 Credits Added to your wallet",
    time: "1h ago",
    type: "credit",
    unread: true,
  },
  {
    id: 3,
    title: "Alex liked your artwork",
    time: "3h ago",
    type: "heart",
    unread: false,
  },
];

function TopBar() {
  const navigate = useNavigate();
  const {
    credits,
    searchQuery,
    setSearchQuery,
    isAuthenticated,
    user,
    logout,
  } = useApp();

  const [notifsOpen, setNotifsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter((n) => n.unread).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const handleNotifClick = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <Bar>
      <MobileBrand to="/" title="PixelForge Home">
        <MobileLogo>
          <img src={logoImg} alt="PixelForge Logo" />
        </MobileLogo>
      </MobileBrand>

      <SearchWrap>
        <SearchOutlined />
        <input
          type="text"
          placeholder="Search prompts, styles, or creators..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </SearchWrap>

      <Right>
        {isAuthenticated ? (
          <>
            <QuickCreateBtn to="/create">
              <AddRounded />
              <span>Create</span>
            </QuickCreateBtn>

            <CreditPill to="/billing" title="Top Up Credits">
              <BoltRounded />
              <span>{credits} credits</span>
            </CreditPill>

            <RelativeBox ref={notifRef}>
              <IconBtn
                title="Notifications"
                $active={notifsOpen}
                onClick={() => setNotifsOpen(!notifsOpen)}
              >
                <NotificationsNoneRounded />
                {unreadCount > 0 && <Badge />}
              </IconBtn>

              {notifsOpen && (
                <NotificationDropdown>
                  <NotifHeader>
                    <h4>Activity</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}>
                        <DoneAllRounded style={{ fontSize: 13 }} /> Mark all read
                      </button>
                    )}
                  </NotifHeader>
                  <NotifList>
                    {notifications.map((n) => (
                      <NotifItem
                        key={n.id}
                        $unread={n.unread}
                        onClick={() => handleNotifClick(n.id)}
                      >
                        <NotifIcon $type={n.type}>
                          {n.type === "credit" ? (
                            <AccountBalanceWalletRounded />
                          ) : n.type === "heart" ? (
                            <FavoriteBorderRounded />
                          ) : (
                            <AutoAwesomeRounded />
                          )}
                        </NotifIcon>
                        <NotifContent>
                          <p>{n.title}</p>
                          <span>{n.time}</span>
                        </NotifContent>
                      </NotifItem>
                    ))}
                  </NotifList>
                </NotificationDropdown>
              )}
            </RelativeBox>

            <IconBtn
              title={user?.username ? `@${user.username}` : user?.name || "Profile"}
              onClick={() =>
                navigate(user?.username ? `/u/${user.username}` : "/dashboard")
              }
            >
              <PersonOutlineRounded />
            </IconBtn>

            <IconBtn title="Sign out" onClick={logout}>
              <LogoutRounded />
            </IconBtn>
          </>
        ) : (
          <AuthLink to="/login">Sign in</AuthLink>
        )}
      </Right>
    </Bar>
  );
}

export default TopBar;


