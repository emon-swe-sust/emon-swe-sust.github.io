import React from "react";
import styled from "styled-components";
import data from "../../data.json";
import Header from "./Header";
import Research from "./Research";
import Skill from "./Skill";
import Games from "./Games";
import Interests from "./Interests";
import NextPage from "../../components/NextPage";
import { Page, Section } from "../../components/ui";

const Prose = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: none; 
  width: 100%; 
  text-align: justify;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--ink-2);

  p:first-child {
    color: var(--ink);
  }
`;

function About() {
  const { descriptions, researchInterest } = data.about;
  return (
    <Page tone="research">
      <Header />
      <Section title="About me">
        <Prose>
          {descriptions.map((description, idx) => (
            <p key={idx}>{description.trim()}</p>
          ))}
        </Prose>
      </Section>

      <Section title="Research interests" band>
        <Interests items={researchInterest} />
      </Section>

      <Section id="research" title="Published works">
        <Research />
      </Section>

      <Section title="Skills and toolsets" band>
        <Skill />
      </Section>
      <Section id="game" title="Play">
        <Games />
      </Section>
      <NextPage to="/experience" tone="career">
        Career Journey
      </NextPage>
    </Page>
  );
}

export default About;
