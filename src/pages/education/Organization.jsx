import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";
import data from "../../data.json";
import {
  ExtLink,
  ItemDate,
  ItemTitle,
  Logo,
  SectionTitle,
  Timeline,
  TimelineItem,
} from "../../components/ui";
import { groupConsecutive, isUrl, tidyRange } from "../../components/format";

const Wrap = styled.section`
  margin-top: 56px;
  padding-top: 40px;
  border-top: 1px solid var(--line);
`;

const Intro = styled.p`
  margin-top: 20px;
  margin-bottom: 32px;
  color: var(--ink-2);
`;

/* A horizontal, scrollable row. Three cards are in view on wide screens and
   the one nearest the middle is drawn larger (see the scroll handler below). */
const Track = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  padding: 40px 0 28px;
  /* Side padding lets the first and last card reach the centre. */
  --card: 82%;
  padding-inline: calc((100% - var(--card)) / 2);
  @media (min-width: 720px) {
    --card: 46%;
  }
  @media (min-width: 1040px) {
    --card: 31%;
  }
`;

const Card = styled.article`
  flex: none;
  width: var(--card);
  scroll-snap-align: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 18px;
  background: var(--surface);
  transform: scale(var(--s, 0.9));
  opacity: var(--o, 0.7);
  transition: transform 0.15s ease-out, opacity 0.15s ease-out, border-color 0.15s;
  &[data-active="true"] {
    border-color: var(--accent);
    box-shadow: 0 18px 40px -22px rgba(0, 0, 0, 0.45);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Name = styled.h3`
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

function Organization() {
  const { description, organization_list } = data.about.organizations;
  // Consecutive roles in the same organisation share one card.
  const groups = groupConsecutive(organization_list, (org) => org.title);
  const track = useRef(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = null;
    let bestDist = Infinity;
    Array.from(el.children).forEach((card) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      const t = Math.min(dist / (card.offsetWidth * 1.1), 1); // 0 = centred
      card.style.setProperty("--s", String(1.12 - 0.22 * t));
      card.style.setProperty("--o", String(1 - 0.35 * t));
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    Array.from(el.children).forEach((card) => card.setAttribute("data-active", String(card === best)));
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return undefined;
    // Start with the first card centred (padding-inline already does this).
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return (
    <Wrap>
      <SectionTitle>Involvements</SectionTitle>
      {description && <Intro>{description}</Intro>}
      <Track ref={track} onScroll={update} tabIndex={0} aria-label="Involvements, scroll sideways">
        {groups.map((group, idx) => {
          const first = group.items[0];
          return (
            <Card key={idx}>
              <Logo src={first["logo-light"]} srcDark={first["logo-dark"]} boxed={first["logo-box"]} alt="" />
              <Name>
                {isUrl(first.title_link) ? <ExtLink href={first.title_link}>{first.title}</ExtLink> : first.title}
              </Name>
              <Timeline>
                {group.items.map((org, i) => (
                  <TimelineItem key={i}>
                    <ItemDate>{tidyRange(org.year)}</ItemDate>
                    <ItemTitle>{org.titleSecond}</ItemTitle>
                  </TimelineItem>
                ))}
              </Timeline>
            </Card>
          );
        })}
      </Track>
    </Wrap>
  );
}

export default Organization;
