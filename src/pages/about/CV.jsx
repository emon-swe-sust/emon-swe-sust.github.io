import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../../components/context/Theme";
import { saveAs } from "file-saver";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

const DownloadButton = styled.button`
  color: ${(props) => props.theme.colors.success};
  margin: 24px 0;
  font-size: x-large;
  font-weight: 900;
  cursor: s-resize;
  width: fit-content;
  display: inline-block;
  border-bottom: 3px solid ${(props) => props.theme.colors.success};
  display: flex;
  gap: 8px;
  align-items: center;
  :hover,
  select {
    transform: scale(1.05);
    transition: 200ms;
  }
`;

function CV() {
  const { theme } = useContext(ThemeContext);
  const downloadPDF = () => {
    const pdfPath = "cv.pdf";
    fetch(process.env.PUBLIC_URL + pdfPath)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, "emon_cv.pdf");
      })
      .catch((error) => {
        console.error("Error fetching PDF file:", error);
      });
  };
  return (
    <DownloadButton theme={theme} onClick={downloadPDF}>
      Download CV
      <FontAwesomeIcon icon={faFileArrowDown} />
    </DownloadButton>
  );
}

export default CV;
