import React from "react";
import styled from "styled-components";

const List = styled.ul`
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${(p) => p.$gap || "10px"};
`;

const Item = styled.li`
  position: relative;
  padding-left: 22px;
  font-size: 1rem;
  line-height: 1.65;
  color: var(--ink-2);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0.68em;
    width: 7px;
    height: 7px;
    border-radius: 2px;
    background: var(--accent);
  }

  a {
    color: var(--accent-ink);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 3px;
  }
  a:hover {
    text-decoration-thickness: 2px;
  }
`;

// data.json stores a few bullets as HTML (links), so they are rendered as
// markup. Links open in a new tab.
const withSafeLinks = (html) =>
  String(html).replace(/<a\s/gi, '<a target="_blank" rel="noopener noreferrer" ');

const BulletPoints = ({ bulletPoints, gap }) => {
  if (!bulletPoints || bulletPoints.length === 0) return null;
  return (
    <List $gap={gap}>
      {bulletPoints.map((point, idx) => (
        <Item key={idx} dangerouslySetInnerHTML={{ __html: withSafeLinks(point) }} />
      ))}
    </List>
  );
};

export default BulletPoints;
