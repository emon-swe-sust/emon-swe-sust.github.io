import React from "react";
import data from "../../data.json";
import Degree from "./Degree";
import Organization from "./Organization";
import NextPage from "../../components/NextPage";
import { Page, PageTitle, Shell } from "../../components/ui";

function Education() {
  return (
    <Page tone="edu">
      <Shell>
        <PageTitle>Education</PageTitle>
        {data.education.map((degree, idx) => (
          <Degree degree={degree} key={idx} />
        ))}
        <Organization />
      </Shell>
      <NextPage to="/about" tone="research" label="Back to the start">
        Profile
      </NextPage>
    </Page>
  );
}

export default Education;
