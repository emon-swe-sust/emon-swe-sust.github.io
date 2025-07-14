import React, { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ThemeContext } from "./context/Theme";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong, faRightLong } from "@fortawesome/free-solid-svg-icons";
import { useSpring, animated } from "react-spring";

const Container = styled.div`
  background-color: ${(props) => props.theme.colors.bg};
  color: ${(props) => props.theme.colors.primary};
`;

const ImageContainer = styled.div``;

const BigImg = styled.img`
  max-height: 80vh;
  max-width: 80vw;
  @media (max-width: 768px) {
    max-width: 100vw;
  }
  cursor: pointer;
  border: 1px solid ${(props) => props.theme.colors.title};
  opacity: ${(props) => (props.loaded ? "1" : ".5")};
`;

const ButtnContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;

const StyledButton = styled.button`
  margin: 8px 0;
  border: none;
  border-radius: 50%;
  padding: 12px;

  background-color: ${(props) => props.theme.colors.btnSuccess};
  :hover {
    background-color: ${(props) => props.theme.colors.btnHover};
  }

  :disabled {
    background-color: ${(props) => props.theme.colors.btnError};
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    padding: 4px;
  }
`;

function Images({ images }) {
  const { theme } = useContext(ThemeContext);
  const [imgId, setImgId] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    setImgLoaded(false);
  }, [imgId]);

  return (
    <Container theme={theme}>
      <ImageContainer>
        <BigImg
          src={images[imgId]}
          theme={theme}
          onLoad={() => setImgLoaded(true)}
          loaded={imgLoaded}
        />
      </ImageContainer>
      <ButtnContainer>
        <StyledButton
          disabled={imgId < 1 || !imgLoaded}
          onClick={() => setImgId(imgId - 1)}
          theme={theme}
          style={{ color: "white" }}
        >
          <FontAwesomeIcon size="2xl" icon={faLeftLong} />
        </StyledButton>
        <StyledButton
          disabled={imgId >= images.length - 1 || !imgLoaded}
          onClick={() => setImgId(imgId + 1)}
          style={{ color: "white" }}
          theme={theme}
        >
          <FontAwesomeIcon size={"2xl"} icon={faRightLong} />
        </StyledButton>
      </ButtnContainer>
    </Container>
  );
}

export default Images;
