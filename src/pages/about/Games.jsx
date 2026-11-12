import React, { useState } from "react";
import styled from "styled-components";
import PipelineGame from "./PipelineGame";
import Sudoku from "./Sudoku";
import Minesweeper from "./Minesweeper";

const GAMES = [
  { id: "build", label: "Fix the build", View: PipelineGame },
  { id: "sudoku", label: "Sudoku", View: Sudoku },
  { id: "mines", label: "Minesweeper", View: Minesweeper },
];

const Tabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 28px;
`;

const Tab = styled.button`
  min-height: 40px;
  padding: 0 16px;
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  color: ${(p) => (p.$on ? "var(--bg)" : "var(--ink-2)")};
  background: ${(p) => (p.$on ? "var(--ink)" : "var(--surface)")};
  border: 1px solid ${(p) => (p.$on ? "var(--ink)" : "var(--line-strong)")};
  &:hover {
    border-color: var(--ink);
  }
`;

function Games() {
  const [id, setId] = useState(GAMES[0].id);
  const { View } = GAMES.find((g) => g.id === id);
  return (
    <>
      <Tabs role="tablist" aria-label="Games">
        {GAMES.map((g) => (
          <Tab
            key={g.id}
            type="button"
            role="tab"
            aria-selected={g.id === id}
            $on={g.id === id}
            onClick={() => setId(g.id)}
          >
            {g.label}
          </Tab>
        ))}
      </Tabs>
      <View />
    </>
  );
}

export default Games;
