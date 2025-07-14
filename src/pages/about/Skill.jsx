import React from "react";
import data from "../../data.json";
import styled from "styled-components";
import { SubTitle2 } from "../../components/utils";
import { useContext } from "react";
import { ThemeContext } from "../../components/context/Theme";
import Technology from "../../components/Technology";
import Title from "../../components/Title";

const Container = styled.div`
  margin: 36px 0;
`;

const P = styled.p`
  margin-bottom: 16px;
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const SkillContainer = styled.div`
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
  border: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.bgCard};
  width: 100%;
  margin: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const SubTitleSecond = styled(SubTitle2)`
  width: fit-content;
  padding-right: 64px;
  border-bottom: 2px solid ${(props) => props.theme.colors.title};
  font-size: large;
  @media (max-width: 768px) {
    font-size: medium;
  }
`;

const ItemContainer = styled.div`
  display: flex;
  gap: 16px;
`;

const IndividualSkill = ({ title, items }) => {
  const { theme } = useContext(ThemeContext);
  return (
    <SkillContainer theme={theme}>
      <SubTitleSecond theme={theme}>{title}</SubTitleSecond>
      <ItemContainer>
        <Technology technologies={items} />
      </ItemContainer>
    </SkillContainer>
  );
};

function Skill() {
  const languages = data.about.skills.languages;
  const web_dev = data.about.skills.web_dev;
  const tools = data.about.skills.tools;
  const descriptions = data.about.skills.descriptions;
  const data_science = data.about.skills.data_science;

  return (
    <Container>
      <Title>Skills and Toolsets</Title>
      <P dangerouslySetInnerHTML={{ __html: descriptions }}></P>
      <IndividualSkill
        title={"AI/ML Tools & Techniques"}
        items={data_science}
      ></IndividualSkill>
      <IndividualSkill title={"Languages"} items={languages}></IndividualSkill>
      <IndividualSkill title={"Web Dev"} items={web_dev}></IndividualSkill>
      <IndividualSkill title={"Others"} items={tools}></IndividualSkill>
    </Container>
  );
}

export default Skill;
