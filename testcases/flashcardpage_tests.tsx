import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { afterEach, describe, it } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import FlashcardsPage from '@/app/pages/chat/flashcard_stacks/page';
import * as nextRouter from 'next/navigation';

describe("FlashcardsPage", () => {
    let fetchStub: sinon.SinonStub;
    let pushStub: sinon.SinonStub;
    beforeEach(() => {
        sinon.stub(nextRouter, "useSearchParams").returns(
            new URLSearchParams("courseId=course123") as any
        );
        pushStub = sinon.stub();
        sinon.stub(nextRouter, "useRouter").returns({ push: pushStub } as any);
        fetchStub = sinon.stub(global, "fetch");
    });
    afterEach(() => {
        sinon.restore();
    });
    it("renders flashcard stacks fetched from API", async () => {
        const mockFlashcards = [
            {
                stackName: "Biology Vocab",
                flashcards: [
                    {
                        id: '1',
                        question: 'What is a cell',
                        answer: 'basic unit of life',
                        moduleId: 'm1',
                        moduleName: 'terminology',
                        source: 'module',
                        isSaved: true,
                    },
                ],
            },
        ];
        fetchStub.resolves({
            ok: true,
            json: async () => mockFlashcards,
        } as Response);
        render(<FlashcardsPage />);
        await waitFor(() => {
            expect(screen.getByText("Biology vocab")).to.exist;
            expect(screen.getByText("1 flashcards")).to.exist;
        });
    });
    it("shows 'no flashcard have been created yet' if response is empty", async () => {
        fetchStub.resolves({
            ok: true,
            json: async () => [],
        } as Response);
        render(<FlashcardsPage />);
        await waitFor(() => {
            expect(screen.getByText("no flashcards have been created yet")).to.exist;
        });
    });
    it('filters flashcard stacks based on search input', async () => {
        const mockStacks = [
            { stackName: 'Java', flashcards: [] },
            { stackName: 'Python', flashcards: [] },
        ];
        fetchStub.resolves({
            ok: true,
            json: async () => mockStacks,
        } as Response);
        render(<FlashcardsPage />);
        await waitFor(() => {
            expect(screen.getByText('Java')).to.exist;
            expect(screen.getByText('Python')).to.exist;
        });
        fireEvent.change(screen.getByPlaceholderText('Search stacks...'), {
            target: { value: 'Java' },
        });
        await waitFor(() => {
            expect(screen.getByText('Java')).to.exist;
            expect(screen.queryByText('Python')).to.be.null;
        });
    });
    it("navigates back when 'Back' button is clicked", async () => {
        fetchStub.resolves({
            ok: true,
            json: async () => [],
        } as Response);
        render(<FlashcardsPage />);
        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);
        expect(pushStub.calledWith("/pages/chat?courseId=course123")).to.be.true;
    });
});