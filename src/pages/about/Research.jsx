import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faDatabase,
  faGlobe,
  faLink,
} from "@fortawesome/free-solid-svg-icons";
import data from "../../data.json";
import BulletPoints from "../../components/BulletPoints";
import { ExtLink } from "../../components/ui";
import { isUrl, tidyRange } from "../../components/format";

const List = styled.ol`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
`;

const Item = styled.li`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 32px 0;
  border-top: 1px solid var(--line);
  &:first-child {
    padding-top: 0;
    border-top: 0;
  }
  &:last-child {
    padding-bottom: 0;
  }
`;

const TopRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--muted);
`;

const Status = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 10px;
  border-radius: 999px;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  line-height: 1;

  &::before {
    content: "";
    width: 8px;
    height: 8px;
    border-radius: 2px;
    background: ${(p) => p.$color};
  }
`;

const Title = styled.h3`
  font-size: clamp(1.25rem, 2.2vw, 1.5rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
  max-width: 40ch;

  a svg {
    margin-left: 0.45em;
    font-size: 0.6em;
    vertical-align: 0.18em;
    color: var(--accent-ink);
  }
  a:hover {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
  }
`;

const Venue = styled.p`
  font-style: italic;
  color: var(--muted);
  font-size: 0.9375rem;
  max-width: 62ch;
`;

const Description = styled.p`
  max-width: 68ch;
  color: var(--ink-2);
`;

const Links = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Pill = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--accent-ink);
  background: var(--surface-2);
  background: color-mix(in srgb, var(--accent) 9%, var(--surface));
  border: 1px solid var(--line);
  border-color: color-mix(in srgb, var(--accent) 28%, var(--line));
  transition: border-color 0.15s ease;
  &:hover {
    border-color: var(--accent);
  }
`;

const Contribution = styled.div`
  padding-left: 18px;
  border-left: 2px solid var(--line-strong);
  max-width: 68ch;
`;

// The status is derived from the free-text "info" field in data.json.
const statusOf = (info = "") => {
  if (/^published/i.test(info))
    return { label: "Published", color: "var(--c-career)", venue: info };
  if (/submitted/i.test(info))
    return { label: "Under review", color: "var(--c-project)" };
  if (/ongoing/i.test(info)) return { label: "Ongoing", color: "var(--c-research)" };
  return info ? { label: info, color: "var(--c-edu)" } : null;
};

function Research() {
  return (
    <List>
      {data.researches.map((research, idx) => {
        const status = statusOf(research.info);
        return (
          <Item key={idx}>
            <TopRow>
              {status && <Status $color={status.color}>{status.label}</Status>}
              {research.year && <span>{tidyRange(research.year)}</span>}
            </TopRow>

            <Title>
              {isUrl(research.link) ? (
                <ExtLink href={research.link}>
                  {research.title}
                  <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                </ExtLink>
              ) : (
                research.title
              )}
            </Title>

            {status && status.venue && <Venue>{status.venue}</Venue>}
            {research.description && <Description>{research.description}</Description>}

            {(isUrl(research.doi) || isUrl(research.website) || isUrl(research.dataset)) && (
              <Links>
                {isUrl(research.doi) && (
                  <Pill href={research.doi} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faLink} /> DOI
                  </Pill>
                )}
                {isUrl(research.website) && (
                  <Pill href={research.website} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faGlobe} /> Website
                  </Pill>
                )}
                {isUrl(research.dataset) && (
                  <Pill href={research.dataset} target="_blank" rel="noopener noreferrer">
                    <FontAwesomeIcon icon={faDatabase} /> Dataset
                  </Pill>
                )}
              </Links>
            )}

            {research.involvements && research.involvements.length > 0 && (
              <Contribution>
                <BulletPoints bulletPoints={research.involvements} />
              </Contribution>
            )}
          </Item>
        );
      })}
    </List>
  );
}

export default Research;
