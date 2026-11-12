import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faXmark } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../context/Theme";
import { Shell } from "../ui";
import { MoonIcon, SunIcon } from "../icons";
import profile from "../../profile";

const links = [
  {
    to: "/about",
    label: "Profile",
    tone: "research",
    isActive: (p) => p === "/" || p.startsWith("/about"),
  },
  {
    to: "/experience",
    label: "Career",
    tone: "career",
    isActive: (p) => p.startsWith("/experience"),
  },
  {
    to: "/project",
    label: "Projects",
    tone: "project",
    isActive: (p) => p.startsWith("/project"),
  },
  {
    to: "/education",
    label: "Education",
    tone: "edu",
    isActive: (p) => p.startsWith("/education"),
  },
];

const Bar = styled.header`
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg);
  background: color-mix(in srgb, var(--bg) 86%, transparent);
  -webkit-backdrop-filter: saturate(1.4) blur(14px);
  backdrop-filter: saturate(1.4) blur(14px);
  border-bottom: 1px solid var(--line);
`;

const Inner = styled(Shell)`
  height: var(--nav-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled(Link)`
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  letter-spacing: -0.04em;
  line-height: 1;
  .r {
    color: var(--c-research);
  }
  .c {
    color: var(--c-career);
  }
  .p {
    color: var(--c-project);
  }
`;

const DesktopNav = styled.nav`
  display: none;
  height: 100%;
  margin-left: auto;
  @media (min-width: 760px) {
    display: flex;
  }
`;

const NavItem = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  padding: 0 16px;
  font-family: var(--font-display);
  font-weight: 550;
  font-size: 0.9375rem;
  color: ${(p) => (p.$active ? "var(--ink)" : "var(--muted)")};
  transition: color 0.15s ease;
  &:hover {
    color: var(--ink);
  }
  &::after {
    content: "";
    position: absolute;
    left: 16px;
    right: 16px;
    bottom: -1px;
    height: 3px;
    background: var(--accent);
    transform: scaleX(${(p) => (p.$active ? 1 : 0)});
    transform-origin: left;
    transition: transform 0.22s ease;
  }
  &:hover::after {
    transform: scaleX(1);
  }
`;

const RoundButton = styled.button`
  display: inline-grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  font-size: 1.125rem;
  color: var(--ink-2);
  border: 1px solid var(--line-strong);
  background: var(--surface);
  transition: border-color 0.15s ease, color 0.15s ease;
  &:hover {
    color: var(--ink);
    border-color: var(--ink);
  }
`;

const MenuButton = styled(RoundButton)`
  @media (min-width: 760px) {
    display: none;
  }
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MobilePanel = styled.nav`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--bg);
  border-bottom: 1px solid var(--line);
  box-shadow: var(--shadow);
  padding: 8px 0 16px;
  @media (min-width: 760px) {
    display: none;
  }
`;

const MobileItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 0;
  font-family: var(--font-display);
  font-weight: 650;
  font-size: 1.25rem;
  color: ${(p) => (p.$active ? "var(--ink)" : "var(--ink-2)")};
  border-bottom: 1px solid var(--line);
  &::before {
    content: "";
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: var(--accent);
    opacity: ${(p) => (p.$active ? 1 : 0.35)};
  }
`;

const SkipLink = styled.button`
  position: absolute;
  left: 16px;
  top: -80px;
  z-index: 60;
  padding: 10px 14px;
  border-radius: 8px;
  background: var(--ink);
  color: var(--bg);
  font-family: var(--font-display);
  font-weight: 600;
  &:focus {
    top: 12px;
  }
`;

function TopNav() {
  const { theme, changeTheme } = useContext(ThemeContext);
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const isDark = theme.variant === "dark";

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const skip = () => {
    const main = document.getElementById("main");
    if (main) main.focus();
  };

  return (
    <Bar>
      <SkipLink type="button" onClick={skip}>
        Skip to content
      </SkipLink>
      <Inner>
        <Brand to="/about" aria-label={`${profile.name}, home`}>
          m<span className="r">.</span>r<span className="c">.</span>e
          <span className="p">.</span>
        </Brand>

        <DesktopNav aria-label="Main">
          {links.map((l) => {
            const active = l.isActive(pathname);
            return (
              <NavItem
                key={l.to}
                to={l.to}
                data-tone={l.tone}
                $active={active}
                aria-current={active ? "page" : undefined}
              >
                {l.label}
              </NavItem>
            );
          })}
        </DesktopNav>

        <Controls>
          <RoundButton
            type="button"
            onClick={() => changeTheme(isDark ? "light" : "dark")}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            title={isDark ? "Light theme" : "Dark theme"}
          >
            {isDark ? <SunIcon /> : <MoonIcon />}
          </RoundButton>
          <MenuButton
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <FontAwesomeIcon icon={open ? faXmark : faBars} />
          </MenuButton>
        </Controls>
      </Inner>

      {open && (
        <MobilePanel id="mobile-nav" aria-label="Main">
          <Shell>
            {links.map((l) => {
              const active = l.isActive(pathname);
              return (
                <MobileItem
                  key={l.to}
                  to={l.to}
                  data-tone={l.tone}
                  $active={active}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </MobileItem>
              );
            })}
          </Shell>
        </MobilePanel>
      )}
    </Bar>
  );
}

export default TopNav;
