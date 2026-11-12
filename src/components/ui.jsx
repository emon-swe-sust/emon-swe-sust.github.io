import React from "react";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { asset, isUrl } from "./format";

/* ------------------------------------------------------------------ layout */

export const Shell = styled.div`
  width: min(100% - 40px, var(--maxw));
  margin-inline: auto;
  @media (min-width: 640px) {
    width: min(100% - 64px, var(--maxw));
  }
`;

const pageIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const PageEl = styled.main`
  min-height: calc(100vh - var(--nav-h));
  animation: ${pageIn} 0.28s ease-out;
  &:focus {
    outline: none;
  }
`;

// `tone` picks the section colour (research | career | project | edu).
export const Page = ({ tone, children }) => (
  <PageEl id="main" tabIndex={-1} data-tone={tone}>
    {children}
  </PageEl>
);

/* ------------------------------------------------------------------ titles */

// Corner brackets, like the selection handles of an annotation tool.
const brackets = `
  position: relative;
  &::before,
  &::after {
    content: "";
    position: absolute;
    width: 12px;
    height: 12px;
    border: 2px solid var(--accent);
    pointer-events: none;
  }
  &::before {
    top: 0;
    left: 0;
    border-right: 0;
    border-bottom: 0;
  }
  &::after {
    bottom: 0;
    right: 0;
    border-left: 0;
    border-top: 0;
  }
`;

const PageTitleEl = styled.h1`
  ${brackets}
  display: inline-block;
  font-weight: 800;
  font-size: clamp(2.25rem, 5.4vw, 3.5rem);
  letter-spacing: -0.035em;
  padding: 10px 14px;
  margin-left: -14px;
  @media (min-width: 640px) {
    padding: 14px 22px;
    margin-left: -22px;
  }
`;

export const PageHeader = styled.header`
  padding: 56px 0 32px;
`;

export const PageTitle = ({ children }) => (
  <PageHeader>
    <PageTitleEl>{children}</PageTitleEl>
  </PageHeader>
);

export const SectionTitle = styled.h2`
  ${brackets}
  display: inline-block;
  font-weight: 700;
  font-size: 1.75rem;
  padding: 8px 14px;
  margin-left: -14px;
  &::before,
  &::after {
    width: 10px;
    height: 10px;
  }
`;

/* ------------------------------------------------- section with a side rail */

// Full-bleed band; `band` gives it the raised surface colour so neighbouring
// sections alternate and the long profile page has a rhythm.
const SectionEl = styled.section`
  border-top: 1px solid var(--line);
  scroll-margin-top: calc(var(--nav-h) + 8px);
  ${(p) => p.$band && "background: var(--surface);"}
`;

const SectionGrid = styled.div`
  display: grid;
  gap: 20px 56px;
  padding: 56px 0;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 960px) {
    grid-template-columns: 220px minmax(0, 1fr);
  }
`;

const RailEl = styled.div`
  @media (min-width: 960px) {
    position: sticky;
    top: calc(var(--nav-h) + 28px);
    align-self: start;
  }
`;

export const Section = ({ id, tone, title, band, children }) => (
  <SectionEl id={id} data-tone={tone} $band={band}>
    <Shell>
      <SectionGrid>
        <RailEl>
          <SectionTitle>{title}</SectionTitle>
        </RailEl>
        <div>{children}</div>
      </SectionGrid>
    </Shell>
  </SectionEl>
);

/* ---------------------------------------------------------- inline elements */

export const ExtLink = ({ href, children, ...rest }) =>
  isUrl(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  ) : (
    <span {...rest}>{children}</span>
  );

export const Chips = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Chip = styled.li`
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.8125rem;
  line-height: 1;
  padding: 8px 12px;
  border-radius: 999px;
  color: var(--ink-2);
  background: var(--surface-2);
  border: 1px solid var(--line);
  ${(p) =>
    p.$tint &&
    `
    color: var(--ink);
    background: var(--surface-2);
    background: color-mix(in srgb, var(--accent) 10%, var(--surface));
    border-color: var(--surface-2);
    border-color: color-mix(in srgb, var(--accent) 32%, var(--line));
  `}
`;

export const MetaList = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.4;
  color: var(--muted);

  li {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  svg {
    color: var(--accent-ink);
    flex: none;
  }
  a:hover {
    color: var(--ink);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
`;

export const MetaItem = ({ icon, children }) => (
  <li>
    {typeof icon === "object" && icon.iconName ? (
      <FontAwesomeIcon icon={icon} />
    ) : (
      icon
    )}
    <span>{children}</span>
  </li>
);

/* ------------------------------------------------------- logo + entity block */

const LogoTile = styled.div`
  flex: none;
  width: ${(p) => p.$size || 64}px;
  height: ${(p) => p.$size || 64}px;
  display: grid;
  place-items: center;
  padding: 8px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--line);
  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

export const Logo = ({ src, alt = "", size }) =>
  src ? (
    <LogoTile $size={size}>
      <img src={asset(src)} alt={alt} loading="lazy" />
    </LogoTile>
  ) : null;

const EntityEl = styled.article`
  display: grid;
  gap: 24px 56px;
  padding: 40px 0;
  border-top: 1px solid var(--line);
  @media (min-width: 960px) {
    grid-template-columns: 260px minmax(0, 1fr);
  }
`;

const EntityRail = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  @media (min-width: 960px) {
    flex-direction: column;
    position: sticky;
    top: calc(var(--nav-h) + 24px);
    align-self: start;
  }
`;

const EntityName = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.25;
  a:hover {
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    text-decoration-color: var(--accent);
  }
`;

const EntityHead = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

// An organisation / school on the left, what happened there on the right.
export const Entity = ({ logo, name, href, meta, children }) => (
  <EntityEl>
    <EntityRail>
      <Logo src={logo} alt="" />
      <EntityHead>
        <EntityName>
          {isUrl(href) ? <ExtLink href={href}>{name}</ExtLink> : name}
        </EntityName>
        {meta}
      </EntityHead>
    </EntityRail>
    <div>{children}</div>
  </EntityEl>
);

/* ---------------------------------------------------------------- timeline */

export const Timeline = styled.ol`
  list-style: none;
  padding: 0;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 44px;
`;

// Each item draws the line down to the next marker, so the line ends at the
// last marker instead of trailing off below it.
export const TimelineItem = styled.li`
  position: relative;
  padding-left: 28px;
  @media (min-width: 640px) {
    padding-left: 34px;
  }
  display: flex;
  flex-direction: column;
  gap: 12px;
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 6px;
    z-index: 1;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    background: var(--accent);
    box-shadow: 0 0 0 5px var(--bg);
  }
  &:not(:last-child)::after {
    content: "";
    position: absolute;
    left: 5px;
    top: 18px;
    bottom: -50px;
    width: 2px;
    background: var(--line-strong);
  }
`;

export const ItemDate = styled.div`
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--muted);
  display: flex;
  flex-wrap: wrap;
  gap: 4px 14px;
  align-items: center;
`;

export const ItemTitle = styled.h4`
  font-size: 1.3125rem;
  font-weight: 650;
  line-height: 1.25;
`;

/* ----------------------------------------------------------------- buttons */

const press = `
  transition: transform 0.15s ease, background-color 0.15s ease,
    border-color 0.15s ease, color 0.15s ease;
  &:hover { transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

export const Button = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  line-height: 1;
  cursor: pointer;
  ${press}
  ${(p) =>
    p.$primary
      ? `
    background: var(--ink);
    color: var(--bg);
    border: 1px solid var(--ink);
    &:hover { background: var(--accent-ink); border-color: var(--accent-ink); color: var(--on-accent); }
  `
      : `
    background: var(--surface);
    color: var(--ink);
    border: 1px solid var(--line-strong);
    &:hover { border-color: var(--ink); }
  `}
`;

export const IconButton = styled.a`
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  font-size: 1.125rem;
  color: var(--ink-2);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  ${press}
  &:hover {
    color: var(--ink);
    border-color: var(--ink);
  }
`;
