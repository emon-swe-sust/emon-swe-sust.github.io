import React, { useContext } from "react";
import { BodyContainer } from "../../App";
import { ThemeContext } from "../../components/context/Theme";
import data from "../../data.json";
import { SectionContainer } from "../../components/utils";
import Degree from "./Degree";
import Title from "../../components/Title";
import Organization from "./Organization";

function Education() {
  const { theme } = useContext(ThemeContext);
  return (
    <BodyContainer theme={theme}>
      <Title>Educational background</Title>
      <SectionContainer>
        {data.education.map((degree, idx) => (
          <Degree degree={degree} key={idx} />
        ))}
      </SectionContainer>
      <Organization />
    </BodyContainer>
  );
}

export default Education;
