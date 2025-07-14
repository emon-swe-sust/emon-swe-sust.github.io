import React, { useContext, useState } from "react";
import {
  ContentTitle,
  SectionComponentContainer,
} from "../../components/utils";
import SectionTop from "../../components/SectionTop";
import { ThemeContext } from "../../components/context/Theme";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPointRight } from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/Modal";
import Images from "../../components/Images";
import { Spinner } from "@chakra-ui/react";
import BulletPoints from "../../components/BulletPoints";
import Technology from "../../components/Technology";

const Img = styled.img`
  --s: 10px;
  --b: 2px;
  --w: ${(props) => props.width};
  --c: ${(props) => props.theme.colors.title};
  --_i: calc(100% - 2 * var(--s));
  --_g: var(--c) var(--b), #0000 0 calc(100% - var(--b)), var(--c) 0;

  width: var(--w);
  object-fit: cover;
  padding: 20px;
  background: linear-gradient(var(--_g)) 50%/100% var(--_i) no-repeat,
    linear-gradient(90deg, var(--_g)) 50% / var(--_i) 100% no-repeat;
  cursor: pointer;
  outline: var(--b) solid var(--c);
  outline-offset: calc(var(--s) / -2);
  transition: transform 0.3s ease-in-out;
  transform-origin: center center;
  opacity: 0.8;

  :hover,
  select {
    transform: scale(1.05);
    opacity: 1;
  }
  ${(props) =>
    !props.loaded &&
    `
      outline:  none;
      background: none;
  `}
`;

const Image = styled.div`
  margin: 0;
  display: grid;
  place-content: center;
  align-items: center;
  grid-auto-flow: column;
  gap: 20px;
  height: fit-content;
`;

const ImageContainer = styled.div`
  text-align: center;
  padding-top: 36px;
`;

const Content = styled.div`
  display: flex;
  width: ${(props) => (props.image_top ? "100%" : "60%")};
  flex-direction: column;
  gap: 24px;
  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  gap: 24px;
  @media (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

function System({ system }) {
  const [showModal, isShowModal] = useState(false);
  const { theme } = useContext(ThemeContext);
  const [imgLoaded, setImgLoaded] = useState(false);

  const getImage = (imageTop) => {
    return (
      <ImageContainer>
        <Image onClick={() => isShowModal(true)}>
          {!imgLoaded && <Spinner size="xl" />}
          <Img
            src={system.pictures[0]}
            theme={theme}
            width={imageTop ? "600px" : "500px"}
            onLoad={() => setImgLoaded(true)}
            loaded={imgLoaded}
          />
        </Image>
        {imgLoaded && <>Click on Image to view more</>}
      </ImageContainer>
    );
  };

  return (
    <SectionComponentContainer theme={theme}>
      <SectionTop section={system}></SectionTop>
      <Technology technologies={system.technologies} />
      {system.image_top &&
        system.pictures.length > 0 &&
        getImage(system.image_top)}
      <ContentContainer>
        <Content image_top={system.image_top}>
          <div>
            <ContentTitle theme={theme}>Key Features</ContentTitle>
            <BulletPoints
              bulletPoints={system.features}
              type="small"
              gap={"4px"}
              bulletIcon={
                <FontAwesomeIcon
                  icon={faHandPointRight}
                  style={{ color: theme.colors.titleSecondary }}
                />
              }
            />
          </div>
          {system.involvements && (
            <div>
              <ContentTitle theme={theme}>My Contribution</ContentTitle>
              <BulletPoints bulletPoints={system.involvements} gap={"8px"} />
            </div>
          )}
        </Content>
        {!system.image_top &&
          system.pictures.length &&
          getImage(system.image_top)}
        {showModal && system.pictures.length > 0 && (
          <Modal isShowModal={isShowModal}>
            <Images images={system.pictures} />
          </Modal>
        )}
      </ContentContainer>
    </SectionComponentContainer>
  );
}

export default System;
