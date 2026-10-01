import { SearchOutlined } from "@mui/icons-material";
import React from "react";
import styled from "styled-components";

const SearchBarContainer = styled.div`
    max-width: 550px;
    display: flex;
    width: 99%;
    border: 1px solid ${({theme})=> theme.text_secondary + 90};
    border-radius: 8px;
    padding: 12px 16px;
    cursor: pointer;
    gap: 6px;
    align-items: center;
`;

function SearchBar(){
    return(
        <SearchBarContainer>
            <SearchOutlined />

            <input 
                style={{
                    border:"none",
                    outline:"none",
                    width: "100%",
                    color: "inherit",
                    background: "transparent",
                }}
                type="text"
            />
        </SearchBarContainer>
    )
}

export default SearchBar;