import { expect } from 'chai';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ChatPage from '@/app/pages/chat/page';
import { prototype } from 'events';

global.fetch = sinon.stub();
const pushStub = sinon.stub();
const GoogleGenerativeAI = {
    prototype: {
        getGenerativeModel: sinon.stub(),
    },
};
describe('ChatPage Component', () => {
    let genAIStub: any;
    let modelStub: any;
    beforeEach(() => {
        modelStub = {
            generateContent: sinon.stub().resolves({ response: { text: () => JSON.stringify([{ question: 'what is AI?', answer: 'artificial intelligence' }]) } }),
        };
        genAIStub = sinon.stub(GoogleGenerativeAI.prototype, 'getGenerativeModel').returns(modelStub);
        (global.fetch as sinon.SinonStub).resolves({
            ok: true,
            json: () => Promise.resolve({ message: 'saved' }),
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    it('should generate flashcards from modules', async () => {
        render(<ChatPage />);
        const generateButton = screen.getByText(/Module Flashcards/);
        fireEvent.click(generateButton);
        await waitFor(() => {
            const generatedFlashcards = screen.getByText(/what is AI/);
            expect(generatedFlashcards).to.be.ok;
        });
    });
    it('should generate flashcards from custom text', async () => {
        render(<ChatPage />);
        const customButton = screen.getByText(/custom flashcards/);
        fireEvent.click(customButton);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'what is AI' } });
        const generateButton = screen.getByText(/generate/);
        fireEvent.click(generateButton);
        await waitFor(() => {
            const customFlashcard = screen.getByText(/what is AI/);
            expect(customFlashcard).to.be.ok;
        });
    });
    it('should save flashcards succesfully', async () => {
        render(<ChatPage />);
        const saveButton = screen.getByText(/save flashcards/);
        fireEvent.click(saveButton);
        await waitFor(() => {
            const notification = screen.getByText(/flashcards saved/);
            expect(notification).to.be.ok;
        });
    });
    it('should handle error when saving flashcards', async () => {
        (global.fetch as sinon.SinonStub).resolves({
            ok: false,
            json: () => Promise.resolve({ error: 'unautorized' }),
            statusText: 'unautorized',
        });
        render(<ChatPage />);
        const saveButton = screen.getByText(/save flashcards/);
        fireEvent.click(saveButton);
        await waitFor(() => {
            const errorNotification = screen.getByText(/failed to save flashcards/);
            expect(errorNotification).to.be.ok;
        });
    });
    it('should toggle flashcards view', () => {
        render(<ChatPage />);
        const toggleButton = screen.getByText(/view flashcards/);
        fireEvent.click(toggleButton);
        const flashcards = screen.getByText(/waht is AI/);
        expect(flashcards).to.be.ok;
    });
    it('should load and select a course', () => {
        render(<ChatPage />);
        const courseSelector = screen.getByText(/select course/);
        fireEvent.click(courseSelector);
        const courseOption = screen.getByText(/course 1/);
        fireEvent.click(courseOption);
        expect(screen.getByText('course 1')).to.not.be.null;
    });
});