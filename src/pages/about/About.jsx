import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../../components/context/Theme";
import styled from "styled-components";
import Header from "./Header";
import { BodyContainer } from "../../App";
import { animated } from "react-spring";
import CV from "./CV";
import degree from "./../../data.json";
import Skill from "./Skill";
import Title from "./../../components/Title";
import NextPage from "../../components/NextPage";
import Research from "./Research";
import { TitleLabel } from "../../components/utils";
import BulletPoints from "../../components/BulletPoints";
import Email from "./Email";
import {
  ContactItem,
  StyledIcon,
} from "../../components/sidebar/SidebarContent";
import { Link } from "react-router-dom";

const ProfilePicture = styled.img`
  border-radius: 50%;
  width: 300px;
  height: 300px;
  object-fit: cover;
  transition: all 0.3s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;

const ProfileContainer = styled.div`
  padding: 16px 0;
  display: flex;
  gap: 16px;
  @media (max-width: 1100px) {
    flex-direction: column-reverse;
  }
  z-index: 40;
`;

const NameContainer = styled.div`
  color: ${(props) => props.theme.colors.title};
  gap: 4px;
  margin-top: 12px;
  font-size: x-large;
  width: 100%;
  text-align: center;
  font-family: "Patua One", cursive;
`;

const ProfileInfoContainer = styled.div`
  width: 60%;
  align-items: center;
  @media (max-width: 1100px) {
    width: 100%;
  }
`;

const Container = styled.div`
  margin-top: 400px;
  position: sticky;
  top: 48px;
  z-index: 3;
  @media (max-width: 768px) {
    margin-top: 250px;
  }
`;

const DPContainer = styled.div`
  margin-left: auto;

  @media (max-width: 1100px) {
    margin: auto;
    align-items: center;
  }
`;

const P = styled.p`
  margin-bottom: 16px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

function About({ headerInitialHeight }) {
  const { theme } = useContext(ThemeContext);
  const [height, setHeight] = useState(headerInitialHeight);
  // const styles = useSpring({
  //   from: { rotateZ: 320, opacity: 0 },
  //   to: { rotateZ: 360, opacity: 1 },
  //   config: { tension: 50, friction: 20 },
  // });

  useEffect(() => {
    setHeight(headerInitialHeight);

    const handleScroll = () => {
      const { scrollTop } = document.documentElement;
      const newHeight = Math.max(0, headerInitialHeight - scrollTop);
      setHeight(newHeight);
    };

    document.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [headerInitialHeight]);

  return (
    <div>
      <Header height={height} />

      <BodyContainer theme={theme}>
        <Container>
          <Title>About Me</Title>
          <ProfileContainer>
            <ProfileInfoContainer>
              {degree.about.descriptions.map((description, idx) => (
                <P key={idx}>{description}</P>
              ))}
              <CV />
            </ProfileInfoContainer>
            <DPContainer>
              <animated.div>
                {" "}
                {/**style={styles} */}
                <ProfilePicture src="/emon_dp.jpeg" />
                <NameContainer theme={theme}>
                  Mahfuzur Rahman Emon
                </NameContainer>
                <div
                  style={{
                    width: "100%",
                    textAlign: "center",
                    fontSize: "large",
                  }}
                >
                  Lecturer, IICT, SUST
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginTop: "16px",
                    justifyContent: "center",
                  }}
                >
                  <StyledIcon
                    src="/icons/mail.png"
                    onClick={() =>
                      (window.location.href = "mailto:emon-iict@sust.edu")
                    }
                  />
                  <Link
                    to="https://scholar.google.com/citations?user=ugFyqqEAAAAJ&hl=en"
                    target="_blank"
                  >
                    <StyledIcon src="icons/google_scholar.png" />
                  </Link>
                  <Link
                    to="https://www.linkedin.com/in/emon-swe-sust/"
                    target="_blank"
                  >
                    <StyledIcon src="/icons/linkedin.png" target="_blank" />
                  </Link>
                  <Link to="https://github.com/emon-swe-sust" target="_blank">
                    <StyledIcon
                      src={
                        theme.variant === "light"
                          ? "/icons/github-dark.png"
                          : "/icons/github-light.png"
                      }
                    />
                  </Link>
                </div>
              </animated.div>
            </DPContainer>
          </ProfileContainer>
          <TitleLabel theme={theme} style={{ marginBottom: "24px" }}>
            Research Interest
          </TitleLabel>
          <BulletPoints
            bulletPoints={degree.about.researchInterest}
            gap={"8px"}
          />
          <Research />
          <Skill />
          <NextPage to="/experience">Career Journey</NextPage>
        </Container>
      </BodyContainer>
      {/* <Email /> */}
    </div>
  );
}

export default About;
