import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import NewMessagePage from '@/app/pages/inbox/new/page';

describe('NewMessagePage', () => {
    let fetchStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
    });
    afterEach(() => {
        fetchStub.restore();
    });
    it('should render the page correctly', () => {
        render(<NewMessagePage />);
        expect(screen.getByText('new message')).to.exist;
    });
    it('should show an error message if no recipient is selected and "save draft" is clicked', async () => {
        render(<NewMessagePage />);
        fireEvent.click(screen.getByText('save draft'));
        await waitFor(() => {
            expect(screen.getByText('please select at least one recipient')).to.exist;
        });
    });
    it("should show an error message if no message is entered and 'Save Draft' is clicked", async () => {
        render(<NewMessagePage />);
    
        fireEvent.click(screen.getByText("Save Draft"));
    
        await waitFor(() => {
          expect(screen.getByText("Please enter a message")).to.exist;
        });
      });
      it("should add and remove recipients correctly", async () => {
        render(<NewMessagePage />)
        fetchStub.withArgs("/api/messages/new-draft").resolves({
          ok: true,
          json: () => Promise.resolve({ draft: { id: "123" } }),
        });
        fireEvent.change(screen.getByPlaceholderText("Search for recipients..."), {
          target: { value: "Jane" },
        })
        fireEvent.click(screen.getByText("Jane Doe"));
        expect(screen.getByText("Jane Doe")).to.exist;
        fireEvent.click(screen.getByLabelText("Remove"));
        expect(screen.queryByText("Jane Doe")).to.be.null;
      });
      it("should fetch courses and show them in the course dropdown", async () => {
        fetchStub.withArgs("/api/courses/professor").resolves({
          ok: true,
          json: () => Promise.resolve([
            { id: "1", name: "Course 1", code: "CS101" },
            { id: "2", name: "Course 2", code: "CS102" },
          ]),
        });
        render(<NewMessagePage />);
        await waitFor(() => {
          expect(screen.getByText("Course 1")).to.exist;
          expect(screen.getByText("Course 2")).to.exist;
        });
      });
      it("should handle saving a draft correctly", async () => {
        render(<NewMessagePage />);
        fetchStub.withArgs("/api/messages/new-draft").resolves({
          ok: true,
          json: () => Promise.resolve({ draft: { id: "123" } }),
        });
        fireEvent.change(screen.getByPlaceholderText("Search for recipients..."), {
          target: { value: "Jane" },
        });
        fireEvent.click(screen.getByText("Jane Doe"));
        fireEvent.change(screen.getByPlaceholderText("Message"), {
          target: { value: "This is a test message." },
        });
        fireEvent.click(screen.getByText("Save Draft"));
        await waitFor(() => {
          expect(screen.getByText("Message saved to drafts!")).to.exist;
        });
    });
});