import React, { useMemo } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuildingColumns,
  faEnvelope,
  faFlask,
  faGraduationCap,
} from "@fortawesome/free-solid-svg-icons";
import profile from "../../profile";
import { asset } from "../../components/format";
import { Shell, Button, IconButton } from "../../components/ui";
import { GithubIcon, LinkedInIcon } from "../../components/icons";
import CV from "./CV";

const Annot = ({ children }) => <div>{children}</div>;


// Decorative dependency graph: nodes joined to near neighbours. Seeded, so it
// looks the same on every visit. Colours follow the theme through CSS vars.
const W = 1200;
const H = 640;
const TONES = ["--c-edu", "--c-research", "--c-career"];

function buildGraph() {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nodes = [];
  let tries = 0;
  while (nodes.length < 340 && tries < 12000) {
    tries += 1;
    // Bias towards the right and the top so the text on the left stays clear.
    const x = W * Math.pow(rnd(), 0.85);
    const y = H * Math.pow(rnd(), 1.05) * 0.95 + 8;
    if (nodes.every((n) => Math.hypot(n.x - x, n.y - y) > 28)) {
      nodes.push({ x, y, r: 1.3 + rnd() * 1.7, tone: TONES[Math.floor(rnd() * 3)] });
    }
  }
  const edges = [];
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 80) edges.push([a, b]);
    });
  });
  return { nodes, edges };
}

const GraphSvg = styled.svg`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  -webkit-mask-image: linear-gradient(to bottom, #000 35%, transparent 96%);
  mask-image: linear-gradient(to bottom, #000 35%, transparent 96%);
  line {
    stroke: var(--c-edu);
    stroke-opacity: 0.08;
    stroke-width: 1;
  }
  circle {
    opacity: 0.17;
  }
`;

function DependencyGraph() {
  const { nodes, edges } = useMemo(buildGraph, []);
  return (
    <GraphSvg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMaxYMin slice" aria-hidden="true">
      {edges.map(([a, b], i) => (
        <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={n.r} fill={`var(${n.tone})`} />
      ))}
    </GraphSvg>
  );
}

const HeroEl = styled.section`
  position: relative;
  padding: 72px 0 80px;
  overflow: hidden;
`;

const Grid = styled.div`
  position: relative;
  display: grid;
  gap: 64px;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.5fr) minmax(0, 0.78fr);
    gap: 72px;
  }
`;

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 36px;
`;

const Name = styled.h1`
  font-weight: 800;
  font-size: clamp(2.6rem, 6.2vw, 4.75rem);
  line-height: 0.96;
  letter-spacing: -0.045em;
`;

const Lead = styled.p`
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1.3rem, 2.4vw, 1.8rem);
  line-height: 1.55;
  letter-spacing: -0.01em;
  max-width: 32ch;
`;

// The three roles are links; each is coloured by where it leads.
const roleStyle = `
  display: inline;
  font: inherit;
  color: var(--ink);
  font-weight: 650;
  cursor: pointer;
  padding: 0 0.1em;
  margin: 0 -0.1em;
  background-image: linear-gradient(
    color-mix(in srgb, var(--accent) 36%, transparent),
    color-mix(in srgb, var(--accent) 36%, transparent)
  );
  background-repeat: no-repeat;
  background-position: 0 100%;
  background-size: 100% 36%;
  transition: background-size 0.2s ease;
  &:hover { background-size: 100% 100%; }
`;

const RoleButton = styled.button`
  ${roleStyle}
`;

const Affiliation = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const Position = styled.p`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: -0.015em;
`;

const Detail = styled.p`
  color: var(--ink-2);
  font-size: 1.0625rem;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;


const StatsBar = styled.ul`
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  max-width: 700px;
  border: 1px solid var(--line);
  border-radius: 12px;
  background: var(--surface);
  overflow: hidden;
  @media (min-width: 640px) {
    grid-template-columns: repeat(${(p) => p.$n}, minmax(0, 1fr));
  }

  li {
    display: flex;
    align-items: baseline;
    gap: 8px;
    padding: 11px 16px;
    border-left: 1px solid var(--line);
    border-top: 1px solid var(--line);
    margin: -1px 0 0 -1px;
  }
  a {
    display: contents;
  }
  a:hover .stat-label {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

const StatValue = styled.span`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.375rem;
  line-height: 1;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
  color: var(--ink);
`;

const StatLabel = styled.span`
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.8125rem;
  line-height: 1.2;
  white-space: nowrap;
  color: var(--muted);
`;

const Stat = ({ value, label, href }) => {
  const inner = (
    <>
      <StatValue>{value}</StatValue>
      <StatLabel className="stat-label">{label}</StatLabel>
    </>
  );
  return (
    <li>
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {inner}
        </a>
      ) : (
        inner
      )}
    </li>
  );
};

const PhotoCol = styled.div`
  justify-self: start;
  width: 168px;
  margin-left: 14px;
  @media (min-width: 900px) {
    order: 0;
    justify-self: end;
    width: min(100%, 360px);
    margin-left: 0;
    margin-right: 14px;
  }
  order: -1;
`;

const Photo = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 22%;
  border-radius: 2px;
  background: var(--surface-2);
`;

function Header() {
  const scrollToResearch = () => {
    const el = document.getElementById("research");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <HeroEl>
      <DependencyGraph />
      <Shell>
        <Grid>
          <Stack>
            <Annot>
              <Name>
                {profile.firstNames}
                <br />
                {profile.lastName}
              </Name>
            </Annot>

            <Lead>
              Software engineering{" "}
              <RoleButton type="button" data-tone="research" onClick={scrollToResearch}>
                researcher
              </RoleButton>{" "}
              focused on build systems, CI/CD, and software release.
            </Lead>

            <Annot>
              <Affiliation>
                <Position>{profile.role}</Position>
                <Detail>{profile.institution}</Detail>
                <Detail>{profile.location}</Detail>
                <Detail>{profile.leave}</Detail>
              </Affiliation>
            </Annot>

            <Annot>
              <Actions>
                <CV />
                <Button href={profile.links.scholar} target="_blank" rel="noopener noreferrer">
                  <FontAwesomeIcon icon={faGraduationCap} />
                  Google Scholar
                </Button>
                <Button href={`mailto:${profile.email}`}>
                  <FontAwesomeIcon icon={faEnvelope} />
                  Email
                </Button>
                <IconButton
                  href={profile.links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  title="LinkedIn"
                >
                  <LinkedInIcon />
                </IconButton>
                <IconButton
                  href={profile.links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <GithubIcon />
                </IconButton>
                <IconButton
                  href={profile.links.lasso}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LASSO Lab profile"
                  title="LASSO Lab profile"
                >
                  <FontAwesomeIcon icon={faFlask} />
                </IconButton>
                <IconButton
                  href={profile.links.sust}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="SUST faculty page"
                  title="SUST faculty page"
                >
                  <FontAwesomeIcon icon={faBuildingColumns} />
                </IconButton>
              </Actions>
            </Annot>

            <StatsBar $n={profile.stats.length} aria-label="Research at a glance">
              {profile.stats.map((st) => (
                <Stat key={st.label} {...st} />
              ))}
            </StatsBar>
          </Stack>

          <PhotoCol>
            <Annot>
              <Photo
                src={asset(profile.photo)}
                alt={`Portrait of ${profile.name}`}
                width="892"
                height="901"
              />
            </Annot>
          </PhotoCol>
        </Grid>
      </Shell>
    </HeroEl>
  );
}

export default Header;
