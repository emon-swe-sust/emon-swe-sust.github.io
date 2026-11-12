import React from "react";
import styled from "styled-components";
import data from "../../data.json";
import Header from "./Header";
import Research from "./Research";
import Skill from "./Skill";
import Games from "./Games";
import NextPage from "../../components/NextPage";
import { Page, Section } from "../../components/ui";

const Prose = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 66ch;
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--ink-2);

  p:first-child {
    color: var(--ink);
  }
`;

const Interests = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  column-gap: 40px;
  @media (min-width: 720px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const Interest = styled.li`
  display: flex;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 1.0625rem;
  line-height: 1.45;
  letter-spacing: -0.005em;

  &::before {
    content: "";
    flex: none;
    width: 9px;
    height: 9px;
    margin-top: 0.5em;
    border-radius: 2px;
    background: var(--accent);
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
        <Interests>
          {researchInterest.map((interest, idx) => (
            <Interest key={idx}>{interest}</Interest>
          ))}
        </Interests>
      </Section>

      <Section id="research" title="Research involvements">
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
