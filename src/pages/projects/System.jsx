import React, { useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faBriefcase,
  faCalendarDays,
  faImages,
} from "@fortawesome/free-solid-svg-icons";
import Modal from "../../components/Modal";
import Images from "../../components/Images";
import BulletPoints from "../../components/BulletPoints";
import Technology from "../../components/Technology";
import { ExtLink, MetaItem, MetaList } from "../../components/ui";
import { GithubIcon } from "../../components/icons";
import { asset, isUrl, tidyRange } from "../../components/format";

const Card = styled.article`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: clamp(20px, 3.2vw, 36px);
  border-radius: 18px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
`;

const Head = styled.header`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Name = styled.h2`
  font-size: clamp(1.75rem, 3.2vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.1;

  a svg {
    margin-left: 0.4em;
    font-size: 0.5em;
    vertical-align: 0.3em;
    color: var(--accent-ink);
  }
  a:hover {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 3px;
    text-underline-offset: 6px;
  }
`;

const Tagline = styled.p`
  max-width: 68ch;
  font-style: italic;
  color: var(--ink-2);
`;

const Body = styled.div`
  display: grid;
  gap: 28px 44px;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  @media (min-width: 900px) {
    grid-template-columns: ${(p) =>
      p.$side ? "minmax(0, 1.1fr) minmax(0, 1fr)" : "minmax(0, 1fr)"};
  }
`;

const TextCol = styled.div`
  display: grid;
  gap: 28px 44px;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  @media (min-width: 900px) {
    grid-template-columns: ${(p) =>
      p.$twoCol ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)"};
  }
`;

// Keeps the screenshot in view while the longer text beside it scrolls past.
const SideShot = styled.div`
  @media (min-width: 900px) {
    position: sticky;
    top: calc(var(--nav-h) + 24px);
  }
`;

const BlockTitle = styled.h3`
  font-size: 1.0625rem;
  font-weight: 700;
  padding-bottom: 10px;
  margin-bottom: 14px;
  border-bottom: 2px solid var(--accent);
  width: fit-content;
  padding-right: 24px;
`;

const Toggle = styled.button`
  margin-top: 14px;
  padding: 8px 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  color: var(--accent-ink);
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 4px;
  &:hover {
    text-decoration-thickness: 2px;
  }
`;

const Shot = styled.button`
  position: relative;
  display: block;
  width: 100%;
  overflow: hidden;
  padding: 0;
  border-radius: 12px;
  background: #fff;
  border: 1px solid var(--line-strong);
  box-shadow: var(--shadow);
  img {
    display: block;
    width: 100%;
    height: auto;
    transition: transform 0.4s ease;
  }
  &:hover img {
    transform: scale(1.015);
  }
`;

const ShotLabel = styled.span`
  position: absolute;
  right: 12px;
  bottom: 12px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 13px;
  border-radius: 999px;
  background: var(--ink);
  color: var(--bg);
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  line-height: 1;
`;

const FEATURE_PREVIEW = 5;

function Features({ features }) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = features.length > FEATURE_PREVIEW + 1;
  const visible = collapsible && !expanded ? features.slice(0, FEATURE_PREVIEW) : features;
  return (
    <div>
      <BlockTitle>Key features</BlockTitle>
      <BulletPoints bulletPoints={visible} gap="8px" />
      {collapsible && (
        <Toggle type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? "Show fewer features" : `Show all ${features.length} features`}
        </Toggle>
      )}
    </div>
  );
}

function System({ system }) {
  const [showModal, setShowModal] = useState(false);
  const pictures = system.pictures || [];
  const hasPictures = pictures.length > 0;
  const imageOnTop = hasPictures && Boolean(system.image_top);
  const imageOnSide = hasPictures && !system.image_top;
  const hasContribution = system.involvements && system.involvements.length > 0;
  const hasFeatures = system.features && system.features.length > 0;

  const shot = (
    <Shot
      type="button"
      onClick={() => setShowModal(true)}
      aria-label={`View ${pictures.length} screenshot${pictures.length > 1 ? "s" : ""} of ${system.title}`}
    >
      <img src={asset(pictures[0])} alt="" loading="lazy" />
      <ShotLabel>
        <FontAwesomeIcon icon={faImages} />
        {pictures.length > 1 ? `${pictures.length} screenshots` : "View screenshot"}
      </ShotLabel>
    </Shot>
  );

  return (
    <Card>
      <Head>
        <Name>
          {isUrl(system.title_link) ? (
            <ExtLink href={system.title_link}>
              {system.title}
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </ExtLink>
          ) : (
            system.title
          )}
        </Name>
        {system.titleSecond && <Tagline>{system.titleSecond}</Tagline>}
        <MetaList>
          {system.year && <MetaItem icon={faCalendarDays}>{tidyRange(system.year)}</MetaItem>}
          {system.association_with && (
            <MetaItem icon={faBriefcase}>{system.association_with}</MetaItem>
          )}
          {isUrl(system.github_link) && (
            <MetaItem icon={<GithubIcon />}>
              <ExtLink href={system.github_link}>GitHub</ExtLink>
            </MetaItem>
          )}
        </MetaList>
      </Head>

      <Technology technologies={system.technologies} />

      {imageOnTop && shot}

      <Body $side={imageOnSide}>
        <TextCol $twoCol={!imageOnSide && hasFeatures && hasContribution}>
          {hasFeatures && <Features features={system.features} />}
          {hasContribution && (
            <div>
              <BlockTitle>My contribution</BlockTitle>
              <BulletPoints bulletPoints={system.involvements} gap="10px" />
            </div>
          )}
        </TextCol>
        {imageOnSide && <SideShot>{shot}</SideShot>}
      </Body>

      {showModal && hasPictures && (
        <Modal isShowModal={setShowModal} label={`${system.title} screenshots`}>
          <Images images={pictures} title={system.title} />
        </Modal>
      )}
    </Card>
  );
}

export default System;
