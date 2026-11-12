import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBoxOpen, faBug, faChartLine, faCircleNodes, faCodeBranch, faGears, faHammer, faRobot,
} from "@fortawesome/free-solid-svg-icons";

// The first CORE_COUNT interests (in the admin: About > Research interests) are shown as the main
// themes; the rest appear below as "also working on". Reorder them in the admin to change this.
const CORE_COUNT = 3;

// Picks an icon from the wording, so new interests get a sensible one without any setup.
const ICONS = [
  [/build/i, faHammer],
  [/ci\/cd|devops|pipeline/i, faCodeBranch],
  [/release/i, faBoxOpen],
  [/llm|language model|\bai\b/i, faRobot],
  [/empirical|stud(y|ies)|mining/i, faChartLine],
  [/test|fault|bug|repair|fixing/i, faBug],
  [/automat|tool|maintenance|integration/i, faGears],
];
const iconFor = (text) => (ICONS.find(([re]) => re.test(text)) || [null, faCircleNodes])[1];

// "Software build systems; making builds faster" -> headline + detail
const split = (text) => {
  const i = text.indexOf(";");
  if (i === -1) return { title: text.trim(), detail: "" };
  return { title: text.slice(0, i).trim(), detail: text.slice(i + 1).trim() };
};

const Core = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 28px;
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1fr);
  @media (min-width: 820px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px 22px 24px;
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: 12px;
  transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;

  &:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 14px 30px -20px color-mix(in srgb, var(--accent) 70%, transparent);
  }
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:hover {
      transform: none;
    }
  }
`;

const Badge = styled.span`
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  color: var(--accent-ink, var(--accent));
  background: color-mix(in srgb, var(--accent) 12%, transparent);
  font-size: 1.05rem;
  transition: background 0.25s ease, color 0.25s ease;

  ${Card}:hover & {
    background: var(--accent);
    color: #fff;
  }
`;

const Title = styled.h3`
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.1875rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--ink);
`;

const Detail = styled.p`
  margin: 0;
  font-size: 0.975rem;
  line-height: 1.55;
  color: var(--ink-2);
`;

const Label = styled.p`
  margin: 0 0 12px;
  font-size: 0.9rem;
  color: var(--ink-3, var(--ink-2));
`;

const More = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const Chip = styled.li`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 9px 14px 9px 11px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  font-size: 0.975rem;
  line-height: 1.35;
  color: var(--ink);
  max-width: 100%;
  transition: border-color 0.2s ease, background 0.2s ease;

  svg {
    flex: none;
    color: var(--accent-ink, var(--accent));
  }
  small {
    color: var(--ink-2);
    font-size: 0.875rem;
  }
  &:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 7%, var(--surface));
  }
`;

function Interests({ items }) {
  const parsed = items.map((text) => ({ ...split(text), icon: iconFor(text) }));
  const core = parsed.slice(0, CORE_COUNT);
  const more = parsed.slice(CORE_COUNT);
  return (
    <>
      <Core>
        {core.map((item, i) => (
          <Card key={i}>
            <Badge aria-hidden="true">
              <FontAwesomeIcon icon={item.icon} />
            </Badge>
            <Title>{item.title}</Title>
            {item.detail && <Detail>{item.detail}</Detail>}
          </Card>
        ))}
      </Core>
      {more.length > 0 && (
        <>
          <Label>Also working on</Label>
          <More>
            {more.map((item, i) => (
              <Chip key={i} title={item.detail || undefined}>
                <FontAwesomeIcon icon={item.icon} />
                <span>
                  {item.title}
                  {item.detail && <small> · {item.detail}</small>}
                </span>
              </Chip>
            ))}
          </More>
        </>
      )}
    </>
  );
}

export default Interests;
