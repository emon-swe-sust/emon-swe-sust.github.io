import React from "react";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import realData from "../data.json";
import Admin from "./Admin";
import * as api from "./api";
import { findProblems, setField } from "./schema";

jest.mock("./api");

const clone = (v) => JSON.parse(JSON.stringify(v));

function renderAdmin(path = "/admin/projects") {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[path]}>
        <Admin />
      </MemoryRouter>
    </ChakraProvider>
  );
}

beforeEach(() => {
  window.localStorage.clear();
  window.sessionStorage.clear();
  window.scrollTo = jest.fn();
  api.getData.mockResolvedValue({ data: clone(realData), rev: "rev1" });
  api.putData.mockResolvedValue({ rev: "rev2", changed: true });
  api.listImages.mockResolvedValue({ images: [] });
});

const savedPayload = () => api.putData.mock.calls[0][0];

test("the current data.json has no problems that would block saving", () => {
  expect(findProblems(realData)).toEqual([]);
});

test("optional fields are dropped when emptied, required ones keep an empty string", () => {
  const optional = { key: "github_link", optional: true };
  const required = { key: "year" };
  expect(setField({ github_link: "x", year: "y" }, optional, "")).toEqual({ year: "y" });
  expect(setField({ year: "y" }, required, "")).toEqual({ year: "" });
});

test("lists every project with the section counts", async () => {
  renderAdmin();
  expect(await screen.findByText(`${realData.projects.length} projects`)).toBeInTheDocument();
  for (const p of realData.projects) expect(screen.getAllByLabelText(`Edit ${p.title}`).length).toBeGreaterThan(0);
  expect(screen.getByTestId("save-state")).toHaveTextContent("All changes saved");
});

test("add a project at the top, fill it in, and save the expected data", async () => {
  const user = userEvent;
  renderAdmin();
  await user.click(await screen.findByRole("button", { name: "Add project" }));

  // Editor opens on the new entry; Save is blocked until it has a title.
  expect(await screen.findByRole("heading", { name: "New project" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /save changes/i })).toBeDisabled();
  expect(screen.getByText(/has no title/i)).toBeInTheDocument();

  await user.type(screen.getByLabelText(/project name/i), "Admin Test");
  await user.type(screen.getByLabelText(/^tagline/i), "A test");
  const tech = screen.getByLabelText("Add to Technologies");
  await user.type(tech, "React{enter}");
  await user.type(tech, "Node{enter}");
  await user.click(within(screen.getByRole("group", { name: "Key features" })).getByRole("button", { name: /add item/i }));
  await user.type(screen.getByLabelText("Key features 1"), "Does things");

  expect(screen.getByTestId("save-state")).toHaveTextContent("Unsaved changes");
  const save = screen.getByRole("button", { name: /save changes/i });
  expect(save).toBeEnabled();
  await user.click(save);

  await waitFor(() => expect(api.putData).toHaveBeenCalledTimes(1));
  const [data, baseRev] = api.putData.mock.calls[0];
  expect(baseRev).toBe("rev1");
  expect(data.projects).toHaveLength(realData.projects.length + 1);
  expect(data.projects[0]).toEqual({
    title: "Admin Test",
    pictures: [], // always present: the Projects page reads pictures.length
    year: "",
    titleSecond: "A test",
    association_with: "",
    technologies: ["React", "Node"],
    features: ["Does things"],
  });
  // Everything else is exactly as it was.
  expect(data.projects.slice(1)).toEqual(realData.projects);
  expect({ ...data, projects: realData.projects }).toEqual(realData);
});

test("edit an existing project; emptying an optional link removes the key", async () => {
  const user = userEvent;
  const target = realData.projects.find((p) => p.github_link);
  const idx = realData.projects.indexOf(target);
  renderAdmin(`/admin/projects/${idx}`);

  const title = await screen.findByLabelText(/project name/i);
  expect(title).toHaveValue(target.title);
  await user.clear(title);
  await user.type(title, "Renamed");
  await user.clear(screen.getByLabelText(/github link/i));

  await user.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalled());
  const saved = savedPayload().projects[idx];
  expect(saved.title).toBe("Renamed");
  expect("github_link" in saved).toBe(false);
  expect(saved.technologies).toEqual(target.technologies); // untouched fields survive
});

test("delete asks for confirmation, then removes only that item", async () => {
  const user = userEvent;
  renderAdmin();
  const victim = realData.projects[2].title;
  await user.click(await screen.findByLabelText(`Delete ${victim}`));

  const dialog = await screen.findByRole("alertdialog");
  await user.click(within(dialog).getByRole("button", { name: "Delete" }));
  await waitFor(() => expect(screen.queryAllByLabelText(`Edit ${victim}`)).toHaveLength(0));

  await user.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalled());
  expect(savedPayload().projects.map((p) => p.title)).toEqual(
    realData.projects.filter((p) => p.title !== victim).map((p) => p.title)
  );
});

test("cancelling the delete dialog keeps the item", async () => {
  const user = userEvent;
  renderAdmin();
  const name = realData.projects[0].title;
  await user.click(await screen.findByLabelText(`Delete ${name}`));
  await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancel" }));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  expect(screen.getAllByLabelText(`Edit ${name}`).length).toBeGreaterThan(0);
  expect(screen.getByTestId("save-state")).toHaveTextContent("All changes saved");
});

test("reordering moves an item and saves the new order", async () => {
  const user = userEvent;
  renderAdmin();
  await user.click(await screen.findByLabelText(`Move ${realData.projects[0].title} down`));
  await user.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalled());
  const titles = savedPayload().projects.map((p) => p.title);
  expect(titles[0]).toBe(realData.projects[1].title);
  expect(titles[1]).toBe(realData.projects[0].title);
});

test("form sections edit nested lists (skills tags)", async () => {
  const user = userEvent;
  renderAdmin("/admin/skills");
  const add = await screen.findByLabelText("Add to Languages");
  await user.type(add, "Rust{enter}");
  await user.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalled());
  expect(savedPayload().about.skills.languages).toEqual([...realData.about.skills.languages, "Rust"]);
});

test("education: optional course list can be removed and publications omitted", async () => {
  const user = userEvent;
  const idx = realData.education.findIndex((e) => e.course_works && !e.publications);
  renderAdmin(`/admin/education/${idx}`);
  await user.click(await screen.findByRole("button", { name: /remove major courses/i }));
  await user.click(screen.getByRole("button", { name: /save changes/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalled());
  const saved = savedPayload().education[idx];
  expect("course_works" in saved).toBe(false);
  expect("publications" in saved).toBe(false);
});

test("unsaved edits survive a reload (dev-server live reload) and can be discarded", async () => {
  const user = userEvent;
  const first = renderAdmin("/admin/skills");
  await user.type(await screen.findByLabelText("Add to Languages"), "Go{enter}");
  first.unmount();

  renderAdmin("/admin/skills");
  expect(await screen.findByText(/restored your unsaved changes/i)).toBeInTheDocument();
  expect(screen.getByText("Go")).toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "Discard them" }));
  await user.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Discard" }));
  await waitFor(() => expect(screen.queryByText("Go")).not.toBeInTheDocument());
  expect(screen.getByTestId("save-state")).toHaveTextContent("All changes saved");
  expect(api.putData).not.toHaveBeenCalled();
});

test("a draft based on an older file revision is ignored", async () => {
  window.localStorage.setItem("portfolio-admin-draft", JSON.stringify({ baseRev: "old", data: { stale: true } }));
  renderAdmin();
  expect(await screen.findByText(`${realData.projects.length} projects`)).toBeInTheDocument();
  expect(screen.queryByText(/restored your unsaved/i)).not.toBeInTheDocument();
});

test("a conflicting file on disk offers to overwrite with the new revision", async () => {
  const user = userEvent;
  const err = Object.assign(new Error("changed on disk"), { status: 409, body: { rev: "rev9" } });
  api.putData.mockRejectedValueOnce(err);
  renderAdmin("/admin/skills");
  await user.type(await screen.findByLabelText("Add to Languages"), "Zig{enter}");
  await user.click(screen.getByRole("button", { name: /save changes/i }));
  const dialog = await screen.findByRole("alertdialog");
  await user.click(within(dialog).getByRole("button", { name: /overwrite with my edits/i }));
  await waitFor(() => expect(api.putData).toHaveBeenCalledTimes(2));
  expect(api.putData.mock.calls[1][1]).toBe("rev9");
});

test("shows a helpful message when the admin API is not available", async () => {
  api.getData.mockResolvedValueOnce(null); // e.g. dev server returned index.html
  renderAdmin();
  expect(await screen.findByText(/npm start/)).toBeInTheDocument();
});

test("raw JSON: invalid text is rejected, valid text updates the draft", async () => {
  const user = userEvent;
  renderAdmin("/admin/raw");
  const box = await screen.findByLabelText("data.json contents");
  fireEvent.change(box, { target: { value: "{ not json" } });
  await user.click(screen.getByRole("button", { name: "Apply to draft" }));
  expect(await screen.findByRole("alert")).toBeInTheDocument();
  expect(screen.getByTestId("save-state")).toHaveTextContent("All changes saved");
});
