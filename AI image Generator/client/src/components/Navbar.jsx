import React from "react";
import Button from "./Button";
import { AddRounded, ExploreRounded } from "@mui/icons-material";
import styled from "styled-components";
import { useLocation, useNavigate, Link } from "react-router-dom";
import logoImg from "../assets/logo.png";

const Container = styled.div`
  flex: 1;
  background: ${({ theme }) => theme.navbar};
  color: ${({ theme }) => theme.text_primary};
  font-weight: bold;
  font-size: 20px;
  padding: 14px 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border};
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
  @media only screen and (max-width: 600px) {
    padding: 10px 14px;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: ${({ theme }) => theme.text_primary};
  font-family: "Outfit", sans-serif;
  font-weight: 700;
  font-size: 18px;

  span {
    color: ${({ theme }) => theme.primary};
  }
`;

const LogoWrap = styled.div`
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

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname.split("/");

  return (
    <Container>
      <Brand to="/">
        <LogoWrap>
          <img src={logoImg} alt="PixelForge Logo" />
        </LogoWrap>
        <div>
          Pixel<span>Forge</span>
        </div>
      </Brand>
      {path[1] === "post" ? (
        <Button
          text="Explore Posts"
          leftIcon={<ExploreRounded style={{ fontSize: "18px" }} />}
          type="secondary"
          onClick={() => navigate("/")}
        />
      ) : (
        <Button
          text="Create new post"
          leftIcon={<AddRounded style={{ fontSize: "18px" }} />}
          onClick={() => navigate("/create")}
        />
      )}
    </Container>
  );
}

export default Navbar;