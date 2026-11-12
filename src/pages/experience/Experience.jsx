import React from "react";
import data from "../../data.json";
import Company from "./Company";
import NextPage from "../../components/NextPage";
import { Page, PageTitle, Shell } from "../../components/ui";
import { groupConsecutive } from "../../components/format";

function Experience() {
  // Roles at the same organisation that follow each other (e.g. intern, junior,
  // assistant engineer) are shown as one organisation with a timeline.
  const groups = groupConsecutive(data.experience, (job) => job.title);

  return (
    <Page tone="career">
      <Shell>
        <PageTitle>Career Journey</PageTitle>
        {groups.map((group, idx) => (
          <Company key={idx} roles={group.items} />
        ))}
      </Shell>
      <NextPage to="/project" tone="project">
        Major Projects
      </NextPage>
    </Page>
  );
}

export default Experience;
