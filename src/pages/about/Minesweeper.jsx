import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Wrap, Intro, Row, Action, Meta, Status, Seg } from "./gameui";

// Minesweeper. The first click is always safe. Right-click (or the Flag
// button on touch screens) puts a flag on a square you think is a mine.

const LEVELS = [
  { id: "easy", label: "Easy", rows: 9, cols: 9, mines: 10 },
  { id: "medium", label: "Medium", rows: 12, cols: 12, mines: 24 },
];

const blank = (lv) => ({
  cells: Array.from({ length: lv.rows * lv.cols }, () => ({
    mine: false, adj: 0, open: false, flag: false,
  })),
  status: "ready", // ready | playing | won | lost
  hit: null,
});

const around = (lv, i) => {
  const r = Math.floor(i / lv.cols);
  const c = i % lv.cols;
  const out = [];
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr;
      const cc = c + dc;
      if (rr >= 0 && rr < lv.rows && cc >= 0 && cc < lv.cols) out.push(rr * lv.cols + cc);
    }
  }
  return out;
};

function plant(lv, cells, safe) {
  const banned = new Set([safe, ...around(lv, safe)]);
  const pool = [];
  for (let i = 0; i < cells.length; i++) if (!banned.has(i)) pool.push(i);
  for (let k = pool.length - 1; k > 0; k--) {
    const j = Math.floor(Math.random() * (k + 1));
    [pool[k], pool[j]] = [pool[j], pool[k]];
  }
  const next = cells.map((c) => ({ ...c }));
  pool.slice(0, lv.mines).forEach((i) => {
    next[i].mine = true;
  });
  next.forEach((c, i) => {
    c.adj = around(lv, i).filter((j) => next[j].mine).length;
  });
  return next;
}

function reveal(lv, cells, start) {
  const next = cells.map((c) => ({ ...c }));
  const stack = [start];
  while (stack.length) {
    const i = stack.pop();
    const c = next[i];
    if (c.open || c.flag) continue;
    c.open = true;
    if (c.adj === 0 && !c.mine) around(lv, i).forEach((j) => stack.push(j));
  }
  return next;
}

const numColor = [
  "", "var(--c-edu)", "var(--c-career-ink)", "#d6453d", "var(--c-research)",
  "var(--c-project)", "#0e8ea0", "var(--ink)", "var(--muted)",
];

const Board = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols}, 1fr);
  gap: 3px;
  width: min(100%, 440px);
  padding: 8px;
  border-radius: 14px;
  background: var(--surface-2);
  border: 1px solid var(--line);
`;

const Sq = styled.button`
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 6px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(0.8rem, 3.6vw, 1.15rem);
  line-height: 1;
  cursor: ${(p) => (p.$open ? "default" : "pointer")};
  color: ${(p) => numColor[p.$n] || "var(--ink)"};
  background: ${(p) =>
    p.$boom
      ? "#d6453d"
      : p.$open
      ? "var(--surface)"
      : "color-mix(in srgb, var(--ink) 16%, var(--surface-2))"};
  &:hover:not(:disabled) {
    filter: ${(p) => (p.$open ? "none" : "brightness(1.08)")};
  }
  svg {
    width: 62%;
    height: 62%;
  }
`;

const Flag = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M5 2v16" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
    <path d="M5 3l11 4-11 5z" fill="#d6453d" />
  </svg>
);

const Bomb = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <circle cx="10" cy="11" r="6" fill="var(--ink)" />
    <path d="M10 2v3M3 11H0M20 11h-3M5 6L3 4M15 6l2-2" stroke="var(--ink)" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

function Minesweeper() {
  const [levelId, setLevelId] = useState("easy");
  const lv = LEVELS.find((l) => l.id === levelId);
  const [game, setGame] = useState(() => blank(LEVELS[0]));
  const [flagMode, setFlagMode] = useState(false);
  const [secs, setSecs] = useState(0);

  const { cells, status } = game;
  const flags = cells.filter((c) => c.flag).length;

  useEffect(() => {
    if (status !== "playing") return undefined;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  const reset = (id = levelId) => {
    setLevelId(id);
    setGame(blank(LEVELS.find((l) => l.id === id)));
    setSecs(0);
    setFlagMode(false);
  };

  const toggleFlag = (i) => {
    if (status === "won" || status === "lost" || status === "ready") return;
    const c = cells[i];
    if (c.open) return;
    const next = cells.map((x, k) => (k === i ? { ...x, flag: !x.flag } : x));
    setGame({ ...game, cells: next });
  };

  const open = (i) => {
    if (status === "won" || status === "lost") return;
    if (flagMode) return toggleFlag(i);
    let base = cells;
    let st = status;
    if (status === "ready") {
      base = plant(lv, cells, i);
      st = "playing";
    }
    const c = base[i];
    if (c.open || c.flag) return;
    if (c.mine) {
      const shown = base.map((x) => (x.mine ? { ...x, open: true } : x));
      setGame({ cells: shown, status: "lost", hit: i });
      return;
    }
    const next = reveal(lv, base, i);
    const won = next.every((x) => x.mine || x.open);
    setGame({ cells: next, status: won ? "won" : st, hit: null });
  };

  const onKey = (e, i) => {
    if (e.key === "f" || e.key === "F") {
      e.preventDefault();
      toggleFlag(i);
    }
  };

  const msg =
    status === "won"
      ? `Cleared in ${secs} seconds.`
      : status === "lost"
      ? "Boom. That was a mine. Try again?"
      : "";

  return (
    <Wrap>
      <Intro>
        Open every square that isn't a mine. A number tells you how many mines touch
        that square. Right-click, or use the Flag button, to mark a mine.
      </Intro>

      <Row role="group" aria-label="Difficulty">
        {LEVELS.map((l) => (
          <Seg key={l.id} type="button" $on={levelId === l.id} onClick={() => reset(l.id)}>
            {l.label}
          </Seg>
        ))}
      </Row>

      <Board $cols={lv.cols} role="group" aria-label="Minesweeper board">
        {cells.map((c, i) => (
          <Sq
            key={`${levelId}-${i}`}
            type="button"
            $open={c.open}
            $n={c.open && !c.mine ? c.adj : 0}
            $boom={game.hit === i}
            aria-label={
              c.open
                ? c.mine ? "mine" : `${c.adj || "no"} adjacent ${c.adj === 1 ? "mine" : "mines"}`
                : c.flag ? "flagged" : "hidden"
            }
            onClick={() => open(i)}
            onContextMenu={(e) => {
              e.preventDefault();
              toggleFlag(i);
            }}
            onKeyDown={(e) => onKey(e, i)}
          >
            {c.open ? (c.mine ? <Bomb /> : c.adj || "") : c.flag ? <Flag /> : ""}
          </Sq>
        ))}
      </Board>

      <Status role="status" aria-live="polite">
        {msg}
      </Status>

      <Row>
        <Action type="button" onClick={() => reset()}>
          {status === "won" || status === "lost" ? "Play again" : "New game"}
        </Action>
        <Action
          type="button"
          $ghost
          $active={flagMode}
          aria-pressed={flagMode}
          onClick={() => setFlagMode((f) => !f)}
        >
          Flag mode {flagMode ? "on" : "off"}
        </Action>
        <Meta>
          Mines left {Math.max(0, lv.mines - flags)} · {secs}s
        </Meta>
      </Row>
    </Wrap>
  );
}

export default Minesweeper;
