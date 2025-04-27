import { expect } from 'chai';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import InboxPage from '@/app/pages/inbox/page';

describe("<InboxPage />", () => {
    it("should render the loading spinner initially", async () => {
      render(<InboxPage />);
      expect(screen.getByRole("status")).to.exist;
    });
    it("should render tabs (Messages, Announcements, Drafts)", async () => {
      render(<InboxPage />);
      await waitFor(() => screen.getByText(/Messages/));
      expect(screen.getByText("Messages")).to.exist;
      expect(screen.getByText("Announcements")).to.exist;
      expect(screen.getByText("Drafts")).to.exist;
    });
    it("should switch between tabs", async () => {
      render(<InboxPage />);
      fireEvent.click(screen.getByText("Announcements"));
      await waitFor(() => screen.getByText("No announcements yet"));
      fireEvent.click(screen.getByText("Drafts"));
      await waitFor(() => screen.getByText("Drafts"));
    });
    it("should render the conversations list when fetched", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          conversations: [
            {
              id: "1",
              name: "Test Conversation",
              isGroup: false,
              isAnnouncement: false,
              participants: [{ id: "user1", firstName: "John", lastName: "Doe" }],
              lastMessage: { content: "Hello", createdAt: "2025-04-26T10:00:00", status: "SENT" },
              updatedAt: "2025-04-26T10:00:00",
            },
          ],
          hasMore: false,
          unreadCount: 1,
        }),
      });
      render(<InboxPage />);
      await waitFor(() => screen.getByText("Test Conversation"));
      expect(screen.getByText("Test Conversation")).to.exist;
      expect(screen.getByText("Hello")).to.exist; 
    });
    it("should show an error message if conversation fetch fails", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.reject(new Error("Failed to fetch conversations")),
      });
      render(<InboxPage />);
      await waitFor(() => screen.getByText("Failed to load conversations. Please try again later."));
      expect(screen.getByText("Failed to load conversations. Please try again later.")).to.exist;
    });
    it("should display no conversations when none are returned", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          conversations: [],
          hasMore: false,
          unreadCount: 0,
        }),
      });
      render(<InboxPage />);
      await waitFor(() => screen.getByText("No conversations yet"));
      expect(screen.getByText("No conversations yet")).to.exist;
    });
    it("should handle load more conversations", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          conversations: [
            {
              id: "1",
              name: "Test Conversation",
              isGroup: false,
              isAnnouncement: false,
              participants: [{ id: "user1", firstName: "John", lastName: "Doe" }],
              lastMessage: { content: "Hello", createdAt: "2025-04-26T10:00:00", status: "SENT" },
              updatedAt: "2025-04-26T10:00:00",
            },
          ],
          hasMore: true,
          unreadCount: 1,
        }),
      });
      render(<InboxPage />);
      await waitFor(() => screen.getByText("Test Conversation"));
      expect(screen.getByText("Load More")).to.exist;
      fireEvent.click(screen.getByText("Load More"));
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          conversations: [
            {
              id: "2",
              name: "New Conversation",
              isGroup: false,
              isAnnouncement: false,
              participants: [{ id: "user2", firstName: "Jane", lastName: "Doe" }],
              lastMessage: { content: "Hi", createdAt: "2025-04-27T10:00:00", status: "SENT" },
              updatedAt: "2025-04-27T10:00:00",
            },
          ],
          hasMore: false,
          unreadCount: 1,
        }),
      });
      await waitFor(() => screen.getByText("New Conversation"));
      expect(screen.getByText("New Conversation")).to.exist;
    });
  });