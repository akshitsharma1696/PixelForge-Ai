import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  PersonAddRounded,
  ChatBubbleOutlineRounded,
  SearchRounded,
  SendRounded,
  GroupsRounded,
  ForumRounded,
} from "@mui/icons-material";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import { socialApi } from "../api/client";
import { useApp } from "../context/AppContext";

const Page = styled.div`
  padding: 28px 32px 48px;
  max-width: 1300px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  height: calc(100% - 8px);
  min-height: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    height: auto;
    padding: 16px 12px 36px;
  }
`;

const Panel = styled.div`
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 0;
  overflow: hidden;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Hint = styled.p`
  margin: 0;
  font-size: 12.5px;
  color: ${({ theme }) => theme.text_secondary};

  strong {
    color: ${({ theme }) => theme.primary};
  }
`;

const ToggleRow = styled.div`
  display: flex;
  background: ${({ theme }) => theme.bgLight};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 6px;
  padding: 3px;
  gap: 3px;
`;

const TabBtn = styled.button`
  flex: 1;
  border: none;
  background: ${({ $active, theme }) =>
    $active ? theme.card : "transparent"};
  color: ${({ $active, theme }) =>
    $active ? theme.text_primary : theme.text_muted};
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12.5px;
  font-weight: ${({ $active }) => ($active ? "600" : "500")};
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;

  &:hover {
    color: ${({ theme }) => theme.text_primary};
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
`;

const Row = styled.button`
  border: 1px solid
    ${({ $active, theme }) =>
      $active ? theme.primary : theme.border};
  background: ${({ $active, theme }) =>
    $active ? theme.card_light : theme.bgLight};
  color: ${({ theme }) => theme.text_primary};
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.borderHover};
  }

  strong {
    display: block;
    font-size: 13px;
    color: ${({ theme }) => theme.text_primary};
  }

  span {
    font-size: 11.5px;
    color: ${({ theme }) => theme.text_muted};
  }
`;

const Badge = styled.em`
  font-style: normal;
  background: ${({ theme }) => theme.primary};
  color: white;
  font-size: 10px;
  font-weight: 700;
  border-radius: 4px;
  padding: 2px 6px;
`;

const ChatPane = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  min-height: 400px;
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  background: #08080a;
  border-radius: 6px;
  border: 1px solid ${({ theme }) => theme.border};
  min-height: 280px;
`;

const Bubble = styled.div`
  align-self: ${({ $mine }) => ($mine ? "flex-end" : "flex-start")};
  max-width: 75%;
  background: ${({ $mine, theme }) =>
    $mine ? theme.primary : theme.card};
  color: #ffffff;
  border: 1px solid
    ${({ $mine, theme }) =>
      $mine ? "transparent" : theme.border};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.4;
`;

const Compose = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-end;
`;

const SectionLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${({ theme }) => theme.text_secondary};
  margin-top: 4px;
`;

const Error = styled.div`
  color: #ef4444;
  font-size: 12.5px;
  background: rgba(239, 68, 68, 0.1);
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid rgba(239, 68, 68, 0.25);
`;

const EmptyChatState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.text_muted};
  text-align: center;
  gap: 8px;
  padding: 40px 20px;

  svg {
    font-size: 32px;
    color: ${({ theme }) => theme.text_muted};
  }

  p {
    margin: 0;
    font-size: 13.5px;
  }
`;

function Social() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [tab, setTab] = useState("friends");
  const [usernameQuery, setUsernameQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeFriend, setActiveFriend] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const refreshSocial = useCallback(async () => {
    const [f, r, c] = await Promise.all([
      socialApi.friends(),
      socialApi.requests(),
      socialApi.conversations(),
    ]);
    setFriends(f.data.friends || []);
    setIncoming(r.data.incoming || []);
    setOutgoing(r.data.outgoing || []);
    setConversations(c.data.conversations || []);
  }, []);

  useEffect(() => {
    refreshSocial().catch((err) =>
      setError(err?.response?.data?.message || "Failed to load social data")
    );
  }, [refreshSocial]);

  useEffect(() => {
    if (!activeFriend) return undefined;
    let alive = true;
    const load = async () => {
      try {
        const { data } = await socialApi.messages(activeFriend.id);
        if (alive) setMessages(data.messages || []);
      } catch (err) {
        if (alive) {
          setError(err?.response?.data?.message || "Failed to load chat");
        }
      }
    };
    load();
    const timer = setInterval(load, 4000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [activeFriend]);

  const search = async () => {
    setError("");
    try {
      const { data } = await socialApi.search(usernameQuery);
      setSearchResults(data.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Search failed");
    }
  };

  const sendRequest = async (uname) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await socialApi.sendRequest(uname);
      setMessage(`Friend request sent to @${uname}`);
      toast.success(`Request sent to @${uname}`);
      await refreshSocial();
    } catch (err) {
      const msg = err?.response?.data?.message || "Could not send request";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const respond = async (requestId, accept) => {
    try {
      await socialApi.respondRequest(requestId, accept);
      await refreshSocial();
      toast.success(accept ? "Request accepted!" : "Request declined");
    } catch (err) {
      setError(err?.response?.data?.message || "Could not update request");
      toast.error(err?.response?.data?.message || "Could not update request");
    }
  };

  const sendChat = async () => {
    if (!activeFriend || !draft.trim()) return;
    try {
      const { data } = await socialApi.sendMessage(
        activeFriend.id,
        draft.trim()
      );
      setMessages((prev) => [...prev, data.message]);
      setDraft("");
      await refreshSocial();
    } catch (err) {
      setError(err?.response?.data?.message || "Message failed");
    }
  };

  return (
    <Page>
      <Panel>
        <div>
          <Title>
            <GroupsRounded style={{ color: "#6366f1" }} />
            Community & Chat
          </Title>
          <Hint>
            Your ID: <strong>@{user?.username || "…"}</strong>
          </Hint>
        </div>

        <ToggleRow>
          <TabBtn $active={tab === "friends"} onClick={() => setTab("friends")}>
            Connections ({friends.length})
          </TabBtn>
          <TabBtn $active={tab === "chat"} onClick={() => setTab("chat")}>
            Chat {conversations.some((c) => c.unread > 0) && "•"}
          </TabBtn>
        </ToggleRow>

        {tab === "friends" && (
          <>
            <TextInput
              label="Find by username"
              name="username"
              placeholder="artist_nova"
              value={usernameQuery}
              handelChange={(e) => setUsernameQuery(e.target.value)}
            />
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                text="Search"
                leftIcon={<SearchRounded style={{ fontSize: 16 }} />}
                onClick={search}
                flex
              />
              <Button
                text="Request"
                leftIcon={<PersonAddRounded style={{ fontSize: 16 }} />}
                type="secondary"
                onClick={() => sendRequest(usernameQuery.trim().toLowerCase())}
                isLoading={loading}
                isDisabled={usernameQuery.trim().length < 3}
                flex
              />
            </div>

            {searchResults.length > 0 && (
              <>
                <SectionLabel>Search Results</SectionLabel>
                <List>
                  {searchResults.map((u) => (
                    <Row key={u.id} onClick={() => navigate(`/u/${u.username}`)}>
                      <div>
                        <strong>{u.name}</strong>
                        <span>@{u.username}</span>
                      </div>
                      <Button
                        text="Add"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendRequest(u.username);
                        }}
                      />
                    </Row>
                  ))}
                </List>
              </>
            )}

            <SectionLabel>Incoming Requests</SectionLabel>
            <List>
              {incoming.length === 0 && <Hint>No pending requests</Hint>}
              {incoming.map((r) => (
                <Row key={r.id} as="div">
                  <div>
                    <strong>{r.user.name}</strong>
                    <span>@{r.user.username}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button text="Accept" onClick={() => respond(r.id, true)} />
                    <Button
                      text="Decline"
                      type="secondary"
                      onClick={() => respond(r.id, false)}
                    />
                  </div>
                </Row>
              ))}
            </List>

            <SectionLabel>Connections</SectionLabel>
            <List>
              {friends.length === 0 && <Hint>No connections yet</Hint>}
              {friends.map((f) => (
                <Row
                  key={f.id}
                  onClick={() => {
                    setActiveFriend(f);
                    setTab("chat");
                  }}
                >
                  <div>
                    <strong>{f.name}</strong>
                    <span>@{f.username}</span>
                  </div>
                  <ChatBubbleOutlineRounded fontSize="small" style={{ color: "#6366f1" }} />
                </Row>
              ))}
            </List>

            {outgoing.length > 0 && (
              <>
                <SectionLabel>Outgoing Requests</SectionLabel>
                <List>
                  {outgoing.map((r) => (
                    <Row key={r.id} as="div">
                      <div>
                        <strong>{r.user.name}</strong>
                        <span>@{r.user.username} · pending</span>
                      </div>
                    </Row>
                  ))}
                </List>
              </>
            )}
          </>
        )}

        {tab === "chat" && (
          <List>
            {conversations.length === 0 && (
              <Hint>Connect with friends to start chatting</Hint>
            )}
            {conversations.map((c) => (
              <Row
                key={c.friend.id}
                $active={activeFriend?.id === c.friend.id}
                onClick={() => setActiveFriend(c.friend)}
              >
                <div>
                  <strong>{c.friend.name}</strong>
                  <span>
                    {c.lastMessage?.text
                      ? c.lastMessage.text.slice(0, 32)
                      : "No messages yet"}
                  </span>
                </div>
                {c.unread > 0 && <Badge>{c.unread}</Badge>}
              </Row>
            ))}
          </List>
        )}

        {error && <Error>{error}</Error>}
        {message && <Hint>{message}</Hint>}
      </Panel>

      <Panel>
        <Title>
          <ForumRounded style={{ color: "#6366f1" }} />
          {activeFriend ? (
            `Conversation with @${activeFriend.username}`
          ) : (
            "Direct Messenger"
          )}
        </Title>
        {!activeFriend ? (
          <EmptyChatState>
            <ChatBubbleOutlineRounded />
            <p>Select a connection from the list to start messaging.</p>
          </EmptyChatState>
        ) : (
          <ChatPane>
            <Messages>
              {messages.length === 0 ? (
                <EmptyChatState>
                  <p>No messages yet. Send a greeting to @{activeFriend.username}.</p>
                </EmptyChatState>
              ) : (
                messages.map((m) => (
                  <Bubble
                    key={m._id}
                    $mine={String(m.sender) === String(user?.id)}
                  >
                    {m.text}
                  </Bubble>
                ))
              )}
            </Messages>
            <Compose>
              <div style={{ flex: 1 }}>
                <TextInput
                  placeholder={`Message @${activeFriend.username}…`}
                  name="draft"
                  value={draft}
                  handelChange={(e) => setDraft(e.target.value)}
                />
              </div>
              <Button
                text="Send"
                leftIcon={<SendRounded style={{ fontSize: 15 }} />}
                onClick={sendChat}
                isDisabled={!draft.trim()}
              />
            </Compose>
          </ChatPane>
        )}
      </Panel>
    </Page>
  );
}

export default Social;


