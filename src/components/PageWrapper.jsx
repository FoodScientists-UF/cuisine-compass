// src/components/PageWrapper.js
import React from "react";
import { Container } from "semantic-ui-react";

const PageWrapper = ({ children }) => {
  return (
    <div style={wrapperStyle}>
      <Container style={containerStyle}>{children}</Container>
    </div>
  );
};

const wrapperStyle = {
  display: "flex",
  justifyContent: "center", // Centers content horizontally
  alignItems: "center", // Centers content vertically (optional)
  minHeight: "100vh",
  width: "100%",
  padding: "20px", // Adds a small border on mobile
  boxSizing: "border-box",
};

const containerStyle = {
  width: "100%",
  maxWidth: "1728px", // Maximum width for large screens
  backgroundColor: "#fff",
  borderRadius: "10px",
  padding: "20px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional shadow for better visuals
};

export default PageWrapper;
