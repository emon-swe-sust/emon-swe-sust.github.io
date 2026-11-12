import React, { useState } from "react";
import styled, { css, keyframes } from "styled-components";

// A short puzzle about the work: a CI/CD pipeline keeps failing and the player
// picks the right fix at each stage until the release goes out.

const STAGES = ["Checkout", "Build", "Test", "Package", "Deploy"];

const PROBLEMS = [
  {
    stage: 1,
    log: [
      "$ make all",
      "using cache restored from 9 days ago",
      "link error: undefined reference to parse_v2()",
      "build failed on CI, but passes on your laptop",
    ],
    options: [
      "Re-run the job until it passes",
      "Change the cache key when the lockfile changes",
      "Turn the build step off for now",
    ],
    correct: 1,
    why: "A stale cache hid your changes. Keying the cache on the inputs makes builds reproducible.",
  },
  {
    stage: 2,
    log: [
      "$ npm test",
      "checkout.spec: 1 failed, 214 passed",
      "same commit, re-run: all passed",
      "same commit, re-run: 1 failed",
    ],
    options: [
      "Merge when it's green",
      "Delete the test",
      "Find the shared state or timing issue and fix it",
    ],
    correct: 2,
    why: "A flaky test teaches people to ignore red builds. Fix the cause, not the symptom.",
  },
  {
    stage: 3,
    log: [
      "$ build --all",
      "rebuilding 312 of 312 modules",
      "elapsed: 41m 07s",
      "1 file changed in this commit",
    ],
    options: [
      "Rent a bigger machine",
      "Rebuild only what the change affects",
      "Run the pipeline less often",
    ],
    correct: 1,
    why: "Incremental builds follow the dependency graph, so a one-file change rebuilds a few modules, not all of them.",
  },
  {
    stage: 4,
    log: [
      "$ publish v1.0.0",
      "401 unauthorized: registry token expired",
      "token is committed in .github/workflows/release.yml",
    ],
    options: [
      "Commit a fresh token to the repo",
      "Skip publishing",
      "Keep the token in the CI secret store and rotate it",
    ],
    correct: 2,
    why: "Secrets in the repo leak and expire. A secret store lets you rotate without touching code.",
  },
];

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const pop = keyframes`
  from { transform: scale(0.6); opacity: 0.4; }
  to { transform: scale(1); opacity: 1; }
`;

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
  max-width: 760px;
`;

const Intro = styled.p`
  color: var(--ink-2);
  font-size: 1.0625rem;
  max-width: 60ch;
`;

const Pipe = styled.ol`
  list-style: none;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 0;
  overflow-x: auto;
  padding-bottom: 4px;
`;

const statusColor = {
  pass: "var(--c-career)",
  fail: "#d6453d",
  wait: "var(--line-strong)",
};

const StageEl = styled.li`
  display: flex;
  align-items: center;
  flex: 1 0 auto;
  &:last-child {
    flex: 0 0 auto;
  }
`;

const Node = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 68px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.8125rem;
  color: ${(p) => (p.$s === "wait" ? "var(--muted)" : "var(--ink)")};
`;

const Dot = styled.span`
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #fff;
  font-size: 1.05rem;
  line-height: 1;
  background: ${(p) => statusColor[p.$s]};
  ${(p) =>
    p.$s === "fail" &&
    css`
      animation: ${shake} 0.4s ease 1;
    `}
  ${(p) =>
    p.$s === "pass" &&
    p.$fresh &&
    css`
      animation: ${pop} 0.3s ease-out 1;
    `}
`;

const Link = styled.span`
  flex: 1 1 18px;
  min-width: 14px;
  height: 3px;
  margin: 0 6px 22px;
  border-radius: 2px;
  background: ${(p) => (p.$on ? "var(--c-career)" : "var(--line)")};
  transition: background 0.3s ease;
`;

const Log = styled.pre`
  margin: 0;
  padding: 16px 18px;
  border-radius: 12px;
  background: #0d1030;
  color: #cfd5ff;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 0.8125rem;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-x: auto;

  .bad {
    color: #ff8f86;
  }
  .ok {
    color: #5fe3ae;
  }
`;

const Prompt = styled.p`
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 1.0625rem;
`;

const Choices = styled.div`
  display: grid;
  gap: 10px;
`;

const Choice = styled.button`
  text-align: left;
  min-height: 48px;
  padding: 12px 16px;
  border-radius: 10px;
  font: inherit;
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line-strong);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  &:hover:not(:disabled) {
    border-color: var(--ink);
  }
  &:disabled {
    cursor: default;
  }
  ${(p) =>
    p.$state === "wrong" &&
    `border-color: #d6453d; background: color-mix(in srgb, #d6453d 10%, var(--surface));`}
  ${(p) =>
    p.$state === "right" &&
    `border-color: var(--c-career); background: color-mix(in srgb, var(--c-career) 12%, var(--surface));`}
`;

const Feedback = styled.p`
  min-height: 1.6em;
  color: var(--ink-2);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 62ch;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

const Action = styled.button`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 10px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  color: var(--bg);
  background: var(--ink);
  border: 1px solid var(--ink);
  transition: transform 0.15s ease, background-color 0.15s ease;
  &:hover {
    background: var(--accent-ink);
    border-color: var(--accent-ink);
    color: var(--on-accent);
    transform: translateY(-1px);
  }
`;

const Meta = styled.span`
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 0.875rem;
  color: var(--muted);
`;

function PipelineGame() {
  const [step, setStep] = useState(0); // which problem we are on
  const [picked, setPicked] = useState(null); // last wrong option index
  const [fixed, setFixed] = useState(false); // current problem solved, awaiting re-run
  const [misses, setMisses] = useState(0);
  const done = step >= PROBLEMS.length;
  const problem = PROBLEMS[Math.min(step, PROBLEMS.length - 1)];

  const stageState = (i) => {
    if (done) return "pass";
    if (i === 0) return "pass";
    const cur = problem.stage;
    if (i < cur) return "pass";
    if (i === cur) return fixed ? "pass" : "fail";
    return "wait";
  };

  const choose = (i) => {
    if (fixed || done) return;
    if (i === problem.correct) {
      setFixed(true);
      setPicked(null);
    } else {
      setPicked(i);
      setMisses((m) => m + 1);
    }
  };

  const rerun = () => {
    setStep((s) => s + 1);
    setFixed(false);
    setPicked(null);
  };

  const restart = () => {
    setStep(0);
    setFixed(false);
    setPicked(null);
    setMisses(0);
  };

  const feedback = done
    ? ""
    : fixed
    ? problem.why
    : picked !== null
    ? "That doesn't fix the cause. Read the log again and try another."
    : "";

  return (
    <Wrap>
      <Intro>
        The pipeline is red. Pick the right fix at each failing stage and get the
        release out.
      </Intro>

      <Pipe aria-label="Pipeline stages">
        {STAGES.map((name, i) => {
          const s = stageState(i);
          return (
            <StageEl key={name}>
              <Node $s={s}>
                <Dot $s={s} $fresh={fixed && i === problem.stage} aria-hidden="true">
                  {s === "pass" ? "✓" : s === "fail" ? "!" : ""}
                </Dot>
                <span>
                  {name}
                  <span className="sr-only">
                    {s === "pass" ? ", passed" : s === "fail" ? ", failed" : ", waiting"}
                  </span>
                </span>
              </Node>
              {i < STAGES.length - 1 && <Link $on={stageState(i + 1) === "pass"} />}
            </StageEl>
          );
        })}
      </Pipe>

      {done ? (
        <>
          <Log aria-label="Pipeline output">
            <span className="ok">{"✓ checkout  ✓ build  ✓ test  ✓ package  ✓ deploy\n"}</span>
            {"published v1.0.0\n"}
            <span className="ok">pipeline green</span>
          </Log>
          <Feedback role="status">
            {misses === 0
              ? "Released with no wrong turns."
              : `Released after ${misses} wrong ${misses === 1 ? "turn" : "turns"}.`}
          </Feedback>
          <Row>
            <Action type="button" onClick={restart}>
              Play again
            </Action>
          </Row>
        </>
      ) : (
        <>
          <Log aria-label="Pipeline output">
            {problem.log.map((line, i) => (
              <span key={i} className={fixed ? "" : i === problem.log.length - 1 ? "bad" : ""}>
                {line}
                {"\n"}
              </span>
            ))}
            {fixed && <span className="ok">{"fixed. ready to re-run\n"}</span>}
          </Log>

          <Prompt>What do you change?</Prompt>
          <Choices>
            {problem.options.map((opt, i) => (
              <Choice
                key={opt}
                type="button"
                disabled={fixed}
                $state={fixed && i === problem.correct ? "right" : picked === i ? "wrong" : ""}
                onClick={() => choose(i)}
              >
                {opt}
              </Choice>
            ))}
          </Choices>

          <Feedback role="status" aria-live="polite">
            {feedback}
          </Feedback>

          <Row>
            {fixed && (
              <Action type="button" onClick={rerun}>
                {step === PROBLEMS.length - 1 ? "Ship the release" : "Re-run pipeline"}
              </Action>
            )}
            <Meta>
              Problem {step + 1} of {PROBLEMS.length}
              {misses > 0 ? ` · ${misses} wrong ${misses === 1 ? "turn" : "turns"}` : ""}
            </Meta>
          </Row>
        </>
      )}
    </Wrap>
  );
}

export default PipelineGame;
