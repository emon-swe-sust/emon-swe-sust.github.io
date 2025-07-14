import React from "react";
import {
  ContentContainer,
  ContentTitle,
  SectionComponentContainer,
} from "../../components/utils";
import { useContext } from "react";
import { ThemeContext } from "../../components/context/Theme";
import SectionTop from "../../components/SectionTop";
import BulletPoints from "../../components/BulletPoints";
import Technology from "../../components/Technology";

function Company({ company }) {
  const { theme } = useContext(ThemeContext);
  return (
    <SectionComponentContainer theme={theme}>
      <SectionTop section={company} />
      <ContentContainer>
        <ContentTitle theme={theme}>My involvements</ContentTitle>
        <Technology technologies={company.technologies} />
      </ContentContainer>
      <BulletPoints bulletPoints={company.involvements} gap={"8px"} />
    </SectionComponentContainer>
  );
}

export default Company;
