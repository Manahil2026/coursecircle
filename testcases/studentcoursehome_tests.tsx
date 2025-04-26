import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { expect } from "chai";
import React from "react";
import Coursepage from "@/app/pages/professor/course_home/[courseId]/page";

describe("Coursepage", () => {
  let originalFetch: typeof fetch;

  beforeEach(() => {
    originalFetch = window.fetch;
  });
  afterEach(() => {
    window.fetch = originalFetch;
  });
  it("renders course materials when modules are fetched", async () => {
    window.fetch = async () =>
      Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: "module-1",
            title: "Module 1",
            published: true,
            sections: [
              { title: "Section 1", content: "Section 1 Content" },
              { title: "Section 2", content: "Section 2 Content" },
            ],
            files: [{ name: "File 1.pdf", url: "/file1.pdf", type: "pdf" }],
          },
        ],
      } as Response);
    render(<Coursepage />);
    await waitFor(() => {
      expect(screen.getByText("Course Materials")).to.exist;
      expect(screen.getByText("Module 1")).to.exist;
      expect(screen.getByText("Section 1")).to.exist;
      expect(screen.getByText("File 1.pdf")).to.exist;
    });
  });
  it("shows loading spinner while fetching", async () => {
    window.fetch = async () =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    render(<Coursepage />);
    expect(screen.getByRole("status")).to.exist;
    await waitFor(() => {
      expect(screen.queryByRole("status")).to.not.exist;
    });
  });
  it("shows message if no modules are available", async () => {
    window.fetch = async () =>
      Promise.resolve({
        ok: true,
        json: async () => [],
      } as Response);
    render(<Coursepage />);
    await waitFor(() => {
      expect(screen.getByText("No course materials available yet.")).to.exist;
    });
  });
  it("expands and collapses a section when clicked", async () => {
    window.fetch = async () =>
      Promise.resolve({
        ok: true,
        json: async () => [
          {
            id: "module-1",
            title: "Module 1",
            published: true,
            sections: [
              { title: "Section 1", content: "Section 1 Content" },
            ],
            files: [],
          },
        ],
      } as Response);
    render(<Coursepage />);
    await waitFor(() => {
      expect(screen.getByText("Section 1")).to.exist;
    });
    expect(screen.queryByText("Section 1 Content")).to.not.exist;
    fireEvent.click(screen.getByText("Section 1"));
    await waitFor(() => {
      expect(screen.getByText("Section 1 Content")).to.exist;
    });
    fireEvent.click(screen.getByText("Section 1"));
    await waitFor(() => {
      expect(screen.queryByText("Section 1 Content")).to.not.exist;
    });
  });
});
