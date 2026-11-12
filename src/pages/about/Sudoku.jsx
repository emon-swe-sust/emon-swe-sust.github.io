import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Wrap, Intro, Row, Action, Meta, Status, Seg } from "./gameui";

// Classic 9x9 Sudoku. Puzzles are generated in the browser and always have
// exactly one solution.

const LEVELS = [
  { id: "easy", label: "Easy", clues: 40 },
  { id: "medium", label: "Medium", clues: 32 },
  { id: "hard", label: "Hard", clues: 27 },
];

const shuffle = (a) => {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

const rowOf = (i) => Math.floor(i / 9);
const colOf = (i) => i % 9;
const boxOf = (i) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);

const candidates = (g, i) => {
  const used = new Set();
  const r = rowOf(i);
  const c = colOf(i);
  const b = boxOf(i);
  for (let k = 0; k < 81; k++) {
    if (g[k] && (rowOf(k) === r || colOf(k) === c || boxOf(k) === b)) used.add(g[k]);
  }
  const out = [];
  for (let v = 1; v <= 9; v++) if (!used.has(v)) out.push(v);
  return out;
};

// Fills `g` in place; returns true when solved. With `random`, digit order
// is shuffled (used to build a full grid).
function solve(g, random) {
  let best = -1;
  let bestC = null;
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    const c = candidates(g, i);
    if (c.length === 0) return false;
    if (!bestC || c.length < bestC.length) {
      best = i;
      bestC = c;
      if (c.length === 1) break;
    }
  }
  if (best === -1) return true;
  for (const v of random ? shuffle(bestC) : bestC) {
    g[best] = v;
    if (solve(g, random)) return true;
  }
  g[best] = 0;
  return false;
}

function countSolutions(g, limit) {
  let best = -1;
  let bestC = null;
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    const c = candidates(g, i);
    if (c.length === 0) return 0;
    if (!bestC || c.length < bestC.length) {
      best = i;
      bestC = c;
      if (c.length === 1) break;
    }
  }
  if (best === -1) return 1;
  let n = 0;
  for (const v of bestC) {
    g[best] = v;
    n += countSolutions(g, limit - n);
    if (n >= limit) break;
  }
  g[best] = 0;
  return n;
}

function makePuzzle(clues) {
  const solution = Array(81).fill(0);
  solve(solution, true);
  const puzzle = solution.slice();
  let left = 81;
  for (const i of shuffle([...Array(81).keys()])) {
    if (left <= clues) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions(puzzle.slice(), 2) !== 1) puzzle[i] = keep;
    else left -= 1;
  }
  return { solution, given: puzzle.map(Boolean), values: puzzle.slice() };
}

const newGame = (levelId) => {
  const level = LEVELS.find((l) => l.id === levelId);
  return { ...makePuzzle(level.clues), selected: null, hints: 0, start: Date.now() };
};

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  width: min(100%, 468px);
  border: 2px solid var(--ink);
  border-radius: 6px;
  background: var(--surface);
  overflow: hidden;
  &:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
`;

const Cell = styled.div`
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  user-select: none;
  font-family: var(--font-display);
  font-size: clamp(1.05rem, 4.6vw, 1.6rem);
  font-weight: ${(p) => (p.$given ? 700 : 500)};
  color: ${(p) => (p.$bad ? "#d6453d" : p.$given ? "var(--ink)" : "var(--c-edu-ink, var(--c-edu))")};
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  ${(p) => p.$c % 3 === 2 && p.$c !== 8 && "border-right: 2px solid var(--ink);"}
  ${(p) => p.$r % 3 === 2 && p.$r !== 8 && "border-bottom: 2px solid var(--ink);"}
  ${(p) => p.$c === 8 && "border-right: 0;"}
  ${(p) => p.$r === 8 && "border-bottom: 0;"}
  background: ${(p) =>
    p.$sel
      ? "color-mix(in srgb, var(--c-edu) 32%, var(--surface))"
      : p.$same
      ? "color-mix(in srgb, var(--c-edu) 20%, var(--surface))"
      : p.$peer
      ? "color-mix(in srgb, var(--c-edu) 8%, var(--surface))"
      : "transparent"};
`;

const Pad = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  width: min(100%, 468px);
`;

const Key = styled.button`
  min-height: 46px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.125rem;
  cursor: pointer;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  &:hover:not(:disabled) {
    border-color: var(--ink);
  }
  &:disabled {
    opacity: 0.35;
    cursor: default;
  }
`;

const fmt = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

function Sudoku() {
  const [level, setLevel] = useState("easy");
  const [game, setGame] = useState(() => newGame("easy"));
  const [busy, setBusy] = useState(false);
  const [finished, setFinished] = useState(null);
  const boardRef = useRef(null);

  const { values, given, solution, selected, hints } = game;

  const conflicts = new Set();
  for (let i = 0; i < 81; i++) {
    if (!values[i]) continue;
    for (let k = 0; k < 81; k++) {
      if (k !== i && values[k] === values[i] &&
        (rowOf(k) === rowOf(i) || colOf(k) === colOf(i) || boxOf(k) === boxOf(i))) {
        conflicts.add(i);
        break;
      }
    }
  }
  const solved = values.every((v, i) => v === solution[i]);

  useEffect(() => {
    if (solved && finished === null) setFinished(Date.now() - game.start);
  }, [solved, finished, game.start]);

  const counts = Array(10).fill(0);
  values.forEach((v) => {
    counts[v] += 1;
  });

  const start = (id) => {
    setBusy(true);
    // Let the "Making puzzle…" state paint before the generator runs.
    setTimeout(() => {
      setGame(newGame(id));
      setFinished(null);
      setBusy(false);
    }, 20);
  };

  const pick = (l) => {
    setLevel(l);
    start(l);
  };

  const setValue = (v) => {
    if (selected === null || given[selected] || solved) return;
    const next = values.slice();
    next[selected] = v;
    setGame({ ...game, values: next });
  };

  const hint = () => {
    if (solved) return;
    let i = selected;
    if (i === null || given[i] || values[i] === solution[i]) {
      const open = values.map((v, k) => (v !== solution[k] ? k : -1)).filter((k) => k >= 0);
      if (!open.length) return;
      i = open[Math.floor(Math.random() * open.length)];
    }
    const next = values.slice();
    next[i] = solution[i];
    setGame({ ...game, values: next, selected: i, hints: hints + 1 });
  };

  const onKey = (e) => {
    const moves = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 };
    if (moves[e.key] !== undefined) {
      e.preventDefault();
      const cur = selected === null ? 40 : selected;
      const r = rowOf(cur) + (e.key === "ArrowUp" ? -1 : e.key === "ArrowDown" ? 1 : 0);
      const c = colOf(cur) + (e.key === "ArrowLeft" ? -1 : e.key === "ArrowRight" ? 1 : 0);
      if (r >= 0 && r < 9 && c >= 0 && c < 9) setGame({ ...game, selected: r * 9 + c });
    } else if (/^[1-9]$/.test(e.key)) setValue(Number(e.key));
    else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") setValue(0);
  };

  const sv = selected !== null ? values[selected] : 0;

  return (
    <Wrap>
      <Intro>
        Fill the grid so every row, column and 3×3 box holds 1 to 9 once. Click a
        square, then press a number. Mistakes turn red.
      </Intro>

      <Row role="group" aria-label="Difficulty">
        {LEVELS.map((l) => (
          <Seg key={l.id} type="button" $on={level === l.id} onClick={() => pick(l.id)}>
            {l.label}
          </Seg>
        ))}
      </Row>

      <Board
        ref={boardRef}
        role="grid"
        tabIndex={0}
        aria-label="Sudoku board"
        aria-activedescendant={selected !== null ? `sd-${selected}` : undefined}
        onKeyDown={onKey}
        style={{ opacity: busy ? 0.4 : 1 }}
      >
        {values.map((v, i) => (
          <Cell
            key={i}
            id={`sd-${i}`}
            role="gridcell"
            aria-selected={selected === i}
            aria-label={`Row ${rowOf(i) + 1}, column ${colOf(i) + 1}, ${v || "empty"}${given[i] ? ", given" : ""}`}
            $r={rowOf(i)}
            $c={colOf(i)}
            $given={given[i]}
            $bad={conflicts.has(i)}
            $sel={selected === i}
            $same={selected !== i && sv !== 0 && v === sv}
            $peer={
              selected !== null && selected !== i &&
              (rowOf(i) === rowOf(selected) || colOf(i) === colOf(selected) || boxOf(i) === boxOf(selected))
            }
            onClick={() => {
              setGame({ ...game, selected: i });
              if (boardRef.current) boardRef.current.focus({ preventScroll: true });
            }}
          >
            {v || ""}
          </Cell>
        ))}
      </Board>

      <Pad aria-label="Number pad">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <Key key={n} type="button" disabled={counts[n] >= 9 || solved} onClick={() => setValue(n)}>
            {n}
          </Key>
        ))}
        <Key type="button" disabled={solved} onClick={() => setValue(0)} aria-label="Erase">
          Erase
        </Key>
      </Pad>

      <Status role="status" aria-live="polite">
        {busy
          ? "Making a puzzle…"
          : solved
          ? `Solved in ${fmt(finished ?? 0)}${hints ? ` with ${hints} ${hints === 1 ? "hint" : "hints"}` : ""}.`
          : ""}
      </Status>

      <Row>
        <Action type="button" onClick={() => start(level)} disabled={busy}>
          New puzzle
        </Action>
        {!solved && (
          <Action type="button" $ghost onClick={hint}>
            Hint
          </Action>
        )}
        <Meta>{hints ? `${hints} ${hints === 1 ? "hint" : "hints"} used` : ""}</Meta>
      </Row>
    </Wrap>
  );
}

export default Sudoku;
