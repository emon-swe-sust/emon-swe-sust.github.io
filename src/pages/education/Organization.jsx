import React from "react";
import styled from "styled-components";
import data from "../../data.json";
import {
  Entity,
  ItemDate,
  ItemTitle,
  SectionTitle,
  Timeline,
  TimelineItem,
} from "../../components/ui";
import { groupConsecutive, tidyRange } from "../../components/format";

const Wrap = styled.section`
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
`;

const Intro = styled.p`
  max-width: 66ch;
  margin-top: 20px;
  margin-bottom: 32px;
  color: var(--ink-2);
`;

function Organization() {
  const { description, organization_list } = data.about.organizations;
  // Consecutive roles in the same organisation share one entry.
  const groups = groupConsecutive(organization_list, (org) => org.title);

  return (
    <Wrap>
      <SectionTitle>Activities</SectionTitle>
      {description && <Intro>{description}</Intro>}
      {groups.map((group, idx) => {
        const first = group.items[0];
        return (
          <Entity
            key={idx}
            logo={first["logo-light"]}
            logoDark={first["logo-dark"]}
            logoBox={first["logo-box"]}
            name={first.title}
            href={first.title_link}
          >
            <Timeline $line={group.items.length > 1}>
              {group.items.map((org, i) => (
                <TimelineItem key={i}>
                  <ItemDate>{tidyRange(org.year)}</ItemDate>
                  <ItemTitle>{org.titleSecond}</ItemTitle>
                </TimelineItem>
              ))}
            </Timeline>
          </Entity>
        );
      })}
    </Wrap>
  );
}

export default Organization;
