import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeContext } from "../../components/context/Theme";
import { animated } from "react-spring";

const HeaderContainer = styled.div`
  height: ${(props) => `${props.height}px`};
  position: fixed;
  top: 0;
  ${(props) =>
    props.theme.variant === "dark"
      ? 'background: url("bg-dark.jpg") repeat;'
      : 'background: url("bg-light.jpg") repeat;'}
  background-size: 500px 500px;
  z-index: 1;
  transition: ${(props) => props.height} 0.5s ease-in-out;
  overflow: hidden;
  width: 100%;
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (min-width: 768px) {
    width: 75%;
    margin-top: 0px;
  }
  @media (min-width: 1200px) {
    width: 80%;
  }
  text-align: center;
`;

const TitleContainer = styled.div`
  width: 100%;
  font-family: "Rowdies", cursive;
  margin: auto;
  color: ${(props) => props.theme.colors.header};
`;

const TopTitle = styled.div`
  font-size: 50px;
  font-weight: 800;
  @media (max-width: 768px) {
    font-size: 30px;
  }
`;

const ColoredText = styled.span`
  color: ${(props) => props.theme.colors.title};
  font-weight: 900;
  font-size: 70px;
  @media (max-width: 768px) {
    font-size: 50px;
  }
`;

const BottomTitle = styled.div`
  font-size: 30px;
  font-weight: 600;
  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

function Header(props) {
  const { theme } = useContext(ThemeContext);
  // const styles = useSpring({
  //   from: { rotateZ: -30, opacity: 0 },
  //   to: { rotateZ: 0, opacity: 1 },
  //   config: { tension: 200, friction: 6 },
  // });
  return (
    <HeaderContainer height={props.height} theme={theme}>
      <TitleContainer theme={theme}>
        <animated.div>
          {" "}
          {/*style={styles} */}
          <TopTitle>
            Hi, I'm <ColoredText theme={theme}>Emon</ColoredText>
          </TopTitle>
          <BottomTitle>
            a software engineering educator, researcher, and practitioner.
          </BottomTitle>
        </animated.div>
      </TitleContainer>
    </HeaderContainer>
  );
}

export default Header;
