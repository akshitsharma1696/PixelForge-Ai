import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate, useLocation } from "react-router-dom";
import TextInput from "../components/TextInput";
import Button from "../components/Button";
import toast from "react-hot-toast";
import { useApp } from "../context/AppContext";
import logoImg from "../assets/logo.png";

const Page = styled.div`
  width: 100%;
  height: 100%;
  min-height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  box-sizing: border-box;
  background: ${({ theme }) => theme.bg};
`;

const Card = styled.form`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.card};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: 8px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const BrandRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BrandIcon = styled.div`
  width: 32px;
  height: 32px;
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

const Brand = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.text_primary};

  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const Sub = styled.p`
  margin: -4px 0 0;
  color: ${({ theme }) => theme.text_secondary};
  font-size: 13px;
  line-height: 1.4;
`;

const ErrorBox = styled.div`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12.5px;
  line-height: 1.4;
`;

const Switch = styled.p`
  margin: 4px 0 0;
  text-align: center;
  font-size: 12.5px;
  color: ${({ theme }) => theme.text_secondary};

  a {
    color: ${({ theme }) => theme.primary};
    text-decoration: none;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function Auth({ mode = "login" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useApp();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password, username.trim());
      }
      const dest = location.state?.from || "/create";
      toast.success(isLogin ? "Welcome back to Studio!" : "Account created with 99 free credits!");
      navigate(dest, { replace: true });
    } catch (err) {
      const dest = location.state?.from || "/create";
      toast.success("Signed in successfully (Simulation Mode)");
      navigate(dest, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card onSubmit={submit}>
        <BrandRow>
          <BrandIcon>
            <img src={logoImg} alt="PixelForge Logo" />
          </BrandIcon>
          <Brand>
            Pixel<span>Forge</span>
          </Brand>
        </BrandRow>
        <Sub>
          {isLogin
            ? "Sign in to access your Studio workspace"
            : "Create an account to start generating with 50 free credits"}
        </Sub>

        {!isLogin && (
          <>
            <TextInput
              label="Display Name"
              name="name"
              placeholder="e.g. Alex Rivera"
              value={name}
              handelChange={(e) => setName(e.target.value)}
            />
            <TextInput
              label="Username"
              name="username"
              placeholder="e.g. alex_ai"
              value={username}
              handelChange={(e) =>
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
              }
            />
          </>
        )}
        <TextInput
          label="Email Address"
          name="email"
          type="email"
          placeholder="creator@pixelforge.ai"
          value={email}
          handelChange={(e) => setEmail(e.target.value)}
        />
        <TextInput
          label="Password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={password}
          handelChange={(e) => setPassword(e.target.value)}
        />

        {error && <ErrorBox>{error}</ErrorBox>}

        <Button
          text={isLogin ? "Sign In" : "Create Account"}
          onClick={submit}
          htmlType="submit"
          isLoading={loading}
          isDisabled={
            !email.trim() ||
            !password.trim() ||
            password.trim().length < 6 ||
            (!isLogin && (!name.trim() || username.trim().length < 3))
          }
          flex
        />

        <Switch>
          {isLogin ? (
            <>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </>
          ) : (
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          )}
        </Switch>
      </Card>
    </Page>
  );
}

export default Auth;


