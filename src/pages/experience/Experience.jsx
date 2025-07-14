import React, { useContext } from "react";
import { BodyContainer } from "../../App";
import { ThemeContext } from "../../components/context/Theme";
import data from "../../data.json";
import { SectionContainer } from "../../components/utils";
import Company from "./Company";
import Title from "../../components/Title";
import NextPage from "../../components/NextPage";

function Experience() {
  const { theme } = useContext(ThemeContext);
  return (
    <BodyContainer theme={theme}>
      <Title>Career Journey</Title>
      <SectionContainer>
        {data.experience.map((company, idx) => (
          <Company company={company} key={idx} />
        ))}
      </SectionContainer>
      <NextPage to="/project">Major Projects</NextPage>
    </BodyContainer>
  );
}

export default Experience;
