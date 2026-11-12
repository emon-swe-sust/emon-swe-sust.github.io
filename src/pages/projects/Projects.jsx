import React from "react";
import styled from "styled-components";
import data from "../../data.json";
import System from "./System";
import NextPage from "../../components/NextPage";
import { Page, PageTitle, Shell } from "../../components/ui";

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-bottom: 24px;
`;

function Projects() {
  return (
    <Page tone="project">
      <Shell>
        <PageTitle>Major Projects</PageTitle>
        <List>
          {data.projects.map((project, idx) => (
            <System key={idx} system={project} />
          ))}
        </List>
      </Shell>
      <NextPage to="/education" tone="edu">
        Education &amp; Activities
      </NextPage>
    </Page>
  );
}

export default Projects;
