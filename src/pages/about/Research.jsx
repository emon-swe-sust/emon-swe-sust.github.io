import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import styled, { createGlobalStyle } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUpRightFromSquare,
  faChevronRight,
  faDatabase,
  faGlobe,
  faLink,
  faQuoteLeft,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import data from "../../data.json";
import BulletPoints from "../../components/BulletPoints";
import { isUrl, tidyRange } from "../../components/format";
import { doiFrom, useCitationMap } from "./useCitations";

/* ------------------------------------------------------------------ list */

const List = styled.ol`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Row = styled.li`
  border-top: 1px solid var(--line);
  &:first-child {
    border-top: 0;
  }
`;

const RowButton = styled.button`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px 24px;
  width: 100%;
  padding: 22px 4px;
  text-align: left;
  background: none;
  border: 0;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:hover h3 {
    text-decoration: underline;
    text-decoration-color: var(--accent);
    text-decoration-thickness: 2px;
    text-underline-offset: 5px;
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
    border-radius: 6px;
  }
  &:hover .go {
    color: var(--accent-ink);
    transform: translateX(3px);
  }
`;

const Main = styled.span`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`;

const TopRow = styled.span`
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
  margin: 0;
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 700;
  line-height: 1.28;
  letter-spacing: -0.02em;
  max-width: 48ch;
`;

const Side = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 16px;
  color: var(--muted);

  .go {
    transition: transform 0.2s ease, color 0.2s ease;
  }
  @media (max-width: 600px) {
    grid-column: 1;
  }
`;

const Cites = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  line-height: 1;
  white-space: nowrap;
  color: var(--accent-ink);
  background: color-mix(in srgb, var(--accent) 9%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line));

  strong {
    font-size: 1rem;
    color: var(--ink);
  }
`;

/* ----------------------------------------------------------------- popup */

const NoScroll = createGlobalStyle`
  body { overflow: hidden; }
`;

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(10, 12, 30, 0.55);
  backdrop-filter: blur(3px);
  animation: fadein 0.18s ease;

  @keyframes fadein {
    from {
      opacity: 0;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Dialog = styled.div`
  position: relative;
  width: min(720px, 100%);
  max-height: min(86vh, 900px);
  overflow-y: auto;
  padding: 32px 32px 30px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--surface);
  color: var(--ink);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  box-shadow: 0 30px 80px -30px rgba(0, 0, 0, 0.6);
  text-align: left;
  @media (max-width: 600px) {
    padding: 26px 20px 24px;
  }
`;

const Close = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-2, var(--surface));
  color: var(--ink-2);
  cursor: pointer;
  &:hover {
    border-color: var(--accent);
    color: var(--accent-ink);
  }
  &:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
`;

const PopTitle = styled.h3`
  margin: 0;
  padding-right: 40px;
  font-size: clamp(1.3rem, 3vw, 1.65rem);
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: -0.02em;
`;

const Venue = styled.p`
  margin: 0;
  font-style: italic;
  color: var(--muted);
  font-size: 0.9375rem;
`;

const Description = styled.p`
  margin: 0;
  color: var(--ink-2);
  line-height: 1.65;
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
  padding: 9px 13px;
  border-radius: 8px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  line-height: 1;
  color: var(--accent-ink);
  background: color-mix(in srgb, var(--accent) 9%, var(--surface));
  border: 1px solid color-mix(in srgb, var(--accent) 28%, var(--line));
  transition: border-color 0.15s ease;
  &:hover {
    border-color: var(--accent);
  }
`;

const Contribution = styled.div`
  padding-left: 18px;
  border-left: 2px solid var(--line-strong);
`;

const Source = styled.span`
  font-weight: 500;
  color: var(--muted);
  font-size: 0.75rem;
`;

/* ----------------------------------------------------------------- logic */

// The status is derived from the free-text "info" field in data.json.
const statusOf = (info = "") => {
  if (/^published/i.test(info)) return { label: "Published", color: "var(--c-career)", venue: info };
  if (/submitted/i.test(info)) return { label: "Under review", color: "var(--c-project)" };
  if (/ongoing/i.test(info)) return { label: "Ongoing", color: "var(--c-research)" };
  return info ? { label: info, color: "var(--c-edu)" } : null;
};

const doiLink = (research) => {
  const doi = doiFrom(research.doi);
  return doi ? `https://doi.org/${doi}` : isUrl(research.doi) ? research.doi : null;
};

function CitationBadge({ found, withSource }) {
  if (!found) return null;
  return (
    <Cites title={`Cited by ${found.count} (${found.source})`}>
      <FontAwesomeIcon icon={faQuoteLeft} />
      <strong>{found.count}</strong> {found.count === 1 ? "citation" : "citations"}
      {withSource && <Source>· {found.source}</Source>}
    </Cites>
  );
}

function Popup({ research, found, onClose }) {
  const closeRef = useRef(null);
  const status = statusOf(research.info);
  const doi = doiLink(research);
  const hasLinks = doi || isUrl(research.website) || isUrl(research.dataset);

  useEffect(() => {
    const previous = document.activeElement;
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous && previous.focus && previous.focus();
    };
  }, [onClose]);

  return createPortal(
    <Backdrop onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <NoScroll />
      <Dialog role="dialog" aria-modal="true" aria-labelledby="paper-title" data-tone="research">
        <Close ref={closeRef} type="button" aria-label="Close" onClick={onClose}>
          <FontAwesomeIcon icon={faXmark} />
        </Close>
        <TopRow>
          {status && <Status $color={status.color}>{status.label}</Status>}
          {research.year && <span>{tidyRange(research.year)}</span>}
          <CitationBadge found={found} withSource />
        </TopRow>
        <PopTitle id="paper-title">{research.title}</PopTitle>
        {status && status.venue && <Venue>{status.venue}</Venue>}
        {research.description && <Description>{research.description}</Description>}
        {(hasLinks || isUrl(research.link)) && (
          <Links>
            {isUrl(research.link) && (
              <Pill href={research.link} target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faArrowUpRightFromSquare} /> Paper
              </Pill>
            )}
            {doi && (
              <Pill href={doi} target="_blank" rel="noopener noreferrer">
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
      </Dialog>
    </Backdrop>,
    document.body
  );
}

function Research() {
  const [open, setOpen] = useState(null);
  const close = useCallback(() => setOpen(null), []);
  const counts = useCitationMap(data.researches.map((r) => r.doi));

  // Most cited first. Papers without a count keep their order from data.json, after the cited ones.
  const order = data.researches
    .map((_, i) => i)
    .sort((a, b) => {
      const ca = counts[a] ? counts[a].count : -1;
      const cb = counts[b] ? counts[b].count : -1;
      return cb - ca || a - b;
    });

  return (
    <>
      <List>
        {order.map((idx) => {
          const research = data.researches[idx];
          const status = statusOf(research.info);
          return (
            <Row key={idx}>
              <RowButton
                type="button"
                onClick={() => setOpen(idx)}
                aria-haspopup="dialog"
                aria-label={`${research.title}. Show details`}
              >
                <Main>
                  <TopRow>
                    {status && <Status $color={status.color}>{status.label}</Status>}
                    {research.year && <span>{tidyRange(research.year)}</span>}
                  </TopRow>
                  <Title>{research.title}</Title>
                </Main>
                <Side>
                  <CitationBadge found={counts[idx]} />
                  <FontAwesomeIcon className="go" icon={faChevronRight} />
                </Side>
              </RowButton>
            </Row>
          );
        })}
      </List>
      {open !== null && data.researches[open] && <Popup research={data.researches[open]} found={counts[open]} onClose={close} />}
    </>
  );
}

export default Research;
