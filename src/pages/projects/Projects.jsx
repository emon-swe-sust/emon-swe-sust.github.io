import React, { useContext } from "react";
import { BodyContainer } from "../../App";
import { SectionContainer } from "../../components/utils";
import { ThemeContext } from "../../components/context/Theme";
import data from "./../../data.json";
import System from "./System";
import Title from "../../components/Title";
import NextPage from "../../components/NextPage";

function Projects() {
  const { theme } = useContext(ThemeContext);
  return (
    <BodyContainer theme={theme}>
      <Title>Major Projects</Title>
      <SectionContainer>
        {data.projects.map((project, idx) => (
          <System key={idx} system={project} />
        ))}
      </SectionContainer>
      <NextPage to="/education">Education & Activities</NextPage>
    </BodyContainer>
  );
}

export default Projects;
