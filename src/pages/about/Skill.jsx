import React from "react";
import styled from "styled-components";
import data from "../../data.json";
import Technology from "../../components/Technology";

const Intro = styled.p`
  max-width: 66ch;
  margin-bottom: 24px;
  color: var(--ink-2);
`;

const Rows = styled.dl`
  margin: 0;
  display: flex;
  flex-direction: column;
`;

const Row = styled.div`
  display: grid;
  gap: 12px 24px;
  padding: 20px 0;
  border-top: 1px solid var(--line);
  &:first-child {
    border-top: 0;
    padding-top: 0;
  }
  @media (min-width: 720px) {
    grid-template-columns: 180px minmax(0, 1fr);
  }
`;

const Label = styled.dt`
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 1rem;
  line-height: 1.4;
  color: var(--ink);
`;

const Items = styled.dd`
  margin: 0;
`;

function Skill() {
  const { languages, web_dev, tools, descriptions, data_science } = data.about.skills;
  const groups = [
    { title: "AI/ML tools and techniques", items: data_science },
    { title: "Languages", items: languages },
    { title: "Web development", items: web_dev },
    { title: "Other tools", items: tools },
  ];

  return (
    <>
      {descriptions && (
        <Intro dangerouslySetInnerHTML={{ __html: descriptions }} />
      )}
      <Rows>
        {groups.map((group) => (
          <Row key={group.title}>
            <Label>{group.title}</Label>
            <Items>
              <Technology technologies={group.items} tint={false} label={group.title} />
            </Items>
          </Row>
        ))}
      </Rows>
    </>
  );
}

export default Skill;
