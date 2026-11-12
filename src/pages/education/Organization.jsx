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
  align-items: stretch;
  gap: 24px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  padding: 40px 0 28px;
  --card: 82%;
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
  min-width: 0;
  overflow-wrap: anywhere;
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

const Stage = styled.div`
  position: relative;
`;

const Arrow = styled.button`
  position: absolute;
  top: 50%;
  ${(p) => (p.$side === "left" ? "left: 4px;" : "right: 4px;")}
  transform: translateY(-50%);
  z-index: 2;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  background: var(--surface);
  color: var(--ink);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  &:hover {
    border-color: var(--accent);
    color: var(--accent-ink, var(--accent));
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

const GAP = 24;

function Organization() {
  const { description, organization_list } = data.about.organizations;
  // Consecutive roles in the same organisation share one card.
  const groups = groupConsecutive(organization_list, (org) => org.title);
  const n = groups.length;
  // Three copies in a row; the view is kept in the middle copy so the row
  // loops forever in both directions.
  const loop = [0, 1, 2].flatMap((copy) => groups.map((group, idx) => ({ group, idx, copy })));
  const track = useRef(null);

  const update = useCallback(() => {
    const el = track.current;
    if (!el || !el.children.length) return;
    const cards = Array.from(el.children).filter((c) => c.tagName === "ARTICLE");

    // Wrap around: when the middle copy has scrolled out, jump one copy back.
    if (cards.length > n) {
      const setWidth = cards[n].offsetLeft - cards[0].offsetLeft;
      let shift = 0;
      if (el.scrollLeft < setWidth * 0.5) shift = setWidth;
      else if (el.scrollLeft > setWidth * 1.5) shift = -setWidth;
      if (shift) {
        el.style.scrollSnapType = "none";
        el.scrollLeft += shift;
        requestAnimationFrame(() => {
          el.style.scrollSnapType = "";
        });
      }
    }

    const mid = el.scrollLeft + el.clientWidth / 2;
    let best = null;
    let bestDist = Infinity;
    cards.forEach((card) => {
      const dist = Math.abs(card.offsetLeft + card.offsetWidth / 2 - mid);
      const t = Math.min(dist / (card.offsetWidth * 1.1), 1); // 0 = centred
      card.style.setProperty("--s", String(1.12 - 0.22 * t));
      card.style.setProperty("--o", String(1 - 0.35 * t));
      if (dist < bestDist) {
        bestDist = dist;
        best = card;
      }
    });
    cards.forEach((card) => card.setAttribute("data-active", String(card === best)));
  }, [n]);

  const centreFirst = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelectorAll("article")[n];
    if (!card) return;
    el.style.scrollSnapType = "none";
    el.scrollLeft = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2;
    requestAnimationFrame(() => {
      el.style.scrollSnapType = "";
      update();
    });
  }, [n, update]);

  useEffect(() => {
    centreFirst();
    const onResize = () => centreFirst();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [centreFirst]);

  const step = (dir) => {
    const el = track.current;
    const card = el && el.querySelector("article");
    if (el && card) el.scrollBy({ left: dir * (card.offsetWidth + GAP), behavior: "smooth" });
  };

  return (
    <Wrap>
      <SectionTitle>Involvements</SectionTitle>
      {description && <Intro>{description}</Intro>}
      <Stage>
        <Arrow type="button" aria-label="Previous involvement" onClick={() => step(-1)} $side="left">‹</Arrow>
        <Track ref={track} onScroll={update} tabIndex={0} aria-label="Involvements, scroll sideways">
          {loop.map(({ group, idx, copy }) => {
            const first = group.items[0];
            return (
              <Card key={`${copy}-${idx}`} aria-hidden={copy === 1 ? undefined : true}>
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
        <Arrow type="button" aria-label="Next involvement" onClick={() => step(1)} $side="right">›</Arrow>
      </Stage>
    </Wrap>
  );
}

export default Organization;
