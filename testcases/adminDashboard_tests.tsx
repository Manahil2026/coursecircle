import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import AdminDashboard from "@/app/pages/admin/dashboard/page";
import { beforeEach, afterEach, describe, it } from "mocha";
import { expect } from "chai";

describe("AdminDashboard Component", () => {
    beforeEach(() => {
        render(<AdminDashboard />);
    });
    afterEach(() => {
        cleanup();
    });
    it("should render the sidebar with all navigation buttons", () => {
        expect(screen.getByText("Dashboard")).to.exist;
        expect(screen.getByText("Courses")).to.exist;
        expect(screen.getByText("Users")).to.exist;
    });
    it("should show Dashboard section by default", () => {
        expect(screen.getByText("Admin Dashboard")).to.exist;
    });
    it("should render Courses section when 'Courses' is clicked", () => {
        const coursesButton = screen.getByText("Courses");
        fireEvent.click(coursesButton);
        expect(screen.getByText("Admin Courses")).to.exist;
    });
    it("should render Users section when 'Users' is clicked", () => {
        const usersButton = screen.getByText("Users");
        fireEvent.click(usersButton);
        expect(screen.getByText("Admin Userss")).to.exist;
    });
    it("should go back to Dashboard when 'Dashboard' is clicked", () => {
        fireEvent.click(screen.getByText("Courses"));
        fireEvent.click(screen.getByText("Dashboard"));
        expect(screen.getByText("Admin Dashboard")).to.exist;
    });
    it("should underline the active button when section is selected", () => {
        const usersButton = screen.getByText("Users");
        fireEvent.click(usersButton);
        expect(usersButton.className.includes("underline")).to.be.true;
    });
    it("should update heading based on the active section", () => {
        const coursesButton = screen.getByText("Courses");
        fireEvent.click(coursesButton);
        expect(screen.getByRole("heading", { name: "Admin Courses" })).to.exist;
        const usersButton = screen.getByText("Users");
        fireEvent.click(usersButton);
        expect(screen.getByRole("heading", { name: "Admin Users" })).to.exist;
    });
});