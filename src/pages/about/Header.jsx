import React, { useEffect, useMemo, useRef } from "react";
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
// How fast the background network drifts. 1 is barely noticeable, 2.5 is a gentle
// drift, 5 is lively. Set it to 0 to keep the network still.
const DRIFT_SPEED = 5;
const TONES = ["--c-edu", "--c-research", "--c-career"];

function buildGraph() {
  let seed = 11;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const nodes = [];
  let tries = 0;
  while (nodes.length < 250 && tries < 12000) {
    tries += 1;
    // Bias towards the right and the top so the text on the left stays clear.
    const x = W * Math.pow(rnd(), 0.85);
    const y = H * Math.pow(rnd(), 1.05) * 0.95 + 8;
    if (nodes.every((n) => Math.hypot(n.x - x, n.y - y) > 33)) {
      nodes.push({ x, y, r: 1.3 + rnd() * 1.7, tone: TONES[Math.floor(rnd() * 3)] });
    }
  }
  // Each node drifts on its own slow loop: about a dozen pixels over a minute or two.
  let seed2 = 7;
  const rnd2 = () => (seed2 = (seed2 * 16807) % 2147483647) / 2147483647;
  nodes.forEach((n) => {
    n.ax = 14 + rnd2() * 14; // drift, in graph units
    n.ay = 14 + rnd2() * 14;
    n.wx = (DRIFT_SPEED * 2 * Math.PI) / (70 + rnd2() * 70); // loop time in seconds
    n.wy = (DRIFT_SPEED * 2 * Math.PI) / (70 + rnd2() * 70);
    n.px = rnd2() * 6.283;
    n.py = rnd2() * 6.283;
  });
  const edges = [];
  nodes.forEach((a, i) => {
    nodes.forEach((b, j) => {
      if (j > i && Math.hypot(a.x - b.x, a.y - b.y) < 80) edges.push([i, j]);
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
  const ref = useRef(null);

  // Moves the dots and the lines that join them. The page is not re-rendered:
  // positions are written straight to the SVG, about 12 times a second.
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return undefined;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }
    const lines = svg.querySelectorAll("line");
    const dots = svg.querySelectorAll("circle");
    let frame = 0;
    let last = 0;
    let visible = true;

    const tick = (now) => {
      frame = requestAnimationFrame(tick);
      if (!visible || now - last < 80) return;
      last = now;
      const t = now / 1000;
      const px = new Array(nodes.length);
      const py = new Array(nodes.length);
      nodes.forEach((n, i) => {
        px[i] = n.x + n.ax * Math.sin(n.wx * t + n.px);
        py[i] = n.y + n.ay * Math.sin(n.wy * t + n.py);
        dots[i].setAttribute("cx", px[i].toFixed(2));
        dots[i].setAttribute("cy", py[i].toFixed(2));
      });
      edges.forEach(([i, j], k) => {
        const l = lines[k];
        l.setAttribute("x1", px[i].toFixed(2));
        l.setAttribute("y1", py[i].toFixed(2));
        l.setAttribute("x2", px[j].toFixed(2));
        l.setAttribute("y2", py[j].toFixed(2));
      });
    };

    // Stand still while the hero is scrolled out of view.
    const io =
      "IntersectionObserver" in window
        ? new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
          })
        : null;
    if (io) io.observe(svg);
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      if (io) io.disconnect();
    };
  }, [nodes, edges]);

  return (
    <GraphSvg
      ref={ref}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMaxYMin slice"
      aria-hidden="true"
    >
      {edges.map(([i, j], k) => (
        <line key={k} x1={nodes[i].x} y1={nodes[i].y} x2={nodes[j].x} y2={nodes[j].y} />
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
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 5;
  object-fit: cover;
  object-position: 50% 22%;
  border-radius: 2px;
  background: var(--surface-2);
  position: relative;
`;

// Look of the profile photo. Pick one in the admin (Profile > Photo style).
// Every style reacts when the mouse is over the photo.
const PhotoFrame = styled.div`
  position: relative;
  isolation: isolate;

  ${Photo} {
    transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease, filter 0.35s ease;
  }
  &::before {
    transition: transform 0.35s ease, opacity 0.35s ease;
  }
  @media (prefers-reduced-motion: reduce) {
    ${Photo}, &::before {
      transition: none;
    }
  }

  /* frame: an outline sits behind the photo; on hover the photo slides into it */
  &[data-style="frame"] {
    margin: 0 14px 14px 0;
  }
  &[data-style="frame"]::before {
    content: "";
    position: absolute;
    inset: 0;
    transform: translate(14px, 14px);
    border: 1.5px solid var(--accent);
    border-radius: 6px;
    opacity: 0.7;
    z-index: -1;
  }
  &[data-style="frame"] ${Photo} {
    border-radius: 6px;
  }
  &[data-style="frame"]:hover ${Photo} {
    transform: translate(8px, 8px);
  }
  &[data-style="frame"]:hover::before {
    opacity: 1;
  }

  /* border: a mat and a thin line around the photo; on hover the line takes the accent colour */
  &[data-style="border"] ${Photo} {
    padding: 8px;
    background: var(--surface);
    border: 1.5px solid var(--line);
    border-radius: 8px;
    box-sizing: border-box;
    object-fit: cover;
  }
  &[data-style="border"]:hover ${Photo} {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 18%, transparent);
  }

  /* soft: rounded corners and a shadow; on hover the photo lifts */
  &[data-style="soft"] ${Photo} {
    border-radius: 24px;
    box-shadow: 0 18px 40px -18px rgba(20, 20, 40, 0.45);
  }
  &[data-style="soft"]:hover ${Photo} {
    transform: translateY(-6px);
    box-shadow: 0 28px 50px -18px rgba(20, 20, 40, 0.55);
  }

  /* colour change while the mouse is over the photo (Profile > Photo hover colour) */
  /* auto: dark theme is black & white until hovered; light theme is the reverse */
  html[data-mode="dark"] &[data-hover="auto"] ${Photo} {
    filter: grayscale(1);
  }
  html[data-mode="dark"] &[data-hover="auto"]:hover ${Photo} {
    filter: grayscale(0);
  }
  html:not([data-mode="dark"]) &[data-hover="auto"]:hover ${Photo} {
    filter: grayscale(1) contrast(1.05);
  }
  &[data-hover="bw"] ${Photo} {
    filter: grayscale(1);
  }
  &[data-hover="bw"]:hover ${Photo} {
    filter: grayscale(0);
  }
  &[data-hover="to-bw"]:hover ${Photo} {
    filter: grayscale(1) contrast(1.05);
  }
`;

const PHOTO_STYLES = ["frame", "border", "soft", "plain"];
const PHOTO_HOVERS = ["auto", "bw", "to-bw", "none"];

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
          </Stack>

          <PhotoCol>
            <Annot>
              <PhotoFrame data-hover={PHOTO_HOVERS.includes(profile.photoHover) ? profile.photoHover : "auto"}
                data-style={PHOTO_STYLES.includes(profile.photoStyle) ? profile.photoStyle : "frame"}>
                <Photo
                  src={asset(profile.photo)}
                  alt={`Portrait of ${profile.name}`}
                  width="892"
                  height="901"
                />
              </PhotoFrame>
            </Annot>
          </PhotoCol>
        </Grid>
      </Shell>
    </HeroEl>
  );
}

export default Header;
