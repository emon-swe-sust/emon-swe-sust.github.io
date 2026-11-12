import React from "react";
import { faLocationDot } from "@fortawesome/free-solid-svg-icons";
import {
  Entity,
  ExtLink,
  ItemDate,
  ItemTitle,
  MetaItem,
  MetaList,
  Timeline,
  TimelineItem,
} from "../../components/ui";
import BulletPoints from "../../components/BulletPoints";
import Technology from "../../components/Technology";
import { tidyRange } from "../../components/format";

const Place = ({ job }) =>
  job.location ? (
    <MetaList>
      <MetaItem icon={faLocationDot}>
        <ExtLink href={job.location_link}>{job.location}</ExtLink>
      </MetaItem>
    </MetaList>
  ) : null;

function Company({ roles }) {
  const first = roles[0];
  const sharedPlace = new Set(roles.map((r) => r.location)).size === 1;

  return (
    <Entity
      logo={first["logo-light"]}
      logoDark={first["logo-dark"]}
      logoBox={first["logo-box"]}
      name={first.title}
      href={first.title_link}
      meta={sharedPlace ? <Place job={first} /> : null}
    >
      <Timeline $line={roles.length > 1}>
        {roles.map((job, idx) => (
          <TimelineItem key={idx}>
            <ItemDate>{tidyRange(job.year)}</ItemDate>
            <ItemTitle>{tidyRange(job.titleSecond)}</ItemTitle>
            {!sharedPlace && <Place job={job} />}
            <Technology technologies={job.technologies} />
            <BulletPoints bulletPoints={job.involvements} />
          </TimelineItem>
        ))}
      </Timeline>
    </Entity>
  );
}

export default Company;
