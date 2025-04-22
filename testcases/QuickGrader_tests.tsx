import { expect } from 'chai';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import QuickGraderPage from '@/app/pages/professor/assignments/[courseId]/[assignmentId]/quick-grader/page';

describe('QuickGraderPage', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    let useRouterStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
        useParamsStub = sinon.stub(require('next/navigation'), 'useParams');
        useRouterStub = sinon.stub(require('next/navigation'), 'useRouter');
    });
    afterEach(() => {
        fetchStub.restore();
        useParamsStub.restore();
        useRouterStub.restore();
    });
    it('should show loading state while fetching submissions', () => {
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
        });
        fetchStub.callsFake(() => new Promise(() => {}));
        render(<QuickGraderPage />);
        expect(screen.getByText(/loading file/i)).to.exist;
    });
    it('should render submission and allow grading after fetch', async () => {
        const mockSubmission = {
            id: '789',
            fileName: 'example.pdf',
            fileUrl: 'http://example.com/file.pdf',
            createdAt: new Date().toISOString(),
            student: {
                id: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
            },
            grade: 90,
            feedback: 'Good Job!',
        };
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
        });
        fetchStub.resolves({
            json: () => Promise.resolve({ submissions: [mockSubmission] }),
        });
        render(<QuickGraderPage />);
        await waitFor(() => {
            expect(screen.getByText(/John Doe's Submission/i)).to.exist;
            expect(screen.getByText(/Submitted on/i)).to.exist;
            expect(screen.getByText(mockSubmission.fileName)).to.exist;
        });
        const gradeInput = screen.getByRole('spinbutton');
        expect(gradeInput).to.exist;
        const feedbackTextarea = screen.getByRole('textbox');
        expect(feedbackTextarea).to.exist;
    });
    it('should handle grade and feedback update', async () => {
        const mockSubmission = {
            id: '789',
            fileName: 'example.pdf',
            fileUrl: 'http://example.com/file.pdf',
            createdAt: new Date().toISOString(),
            student: {
                id: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
            },
            grade: 90,
            feedback: 'Awesome!',
        };
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
        });
        fetchStub.resolves({
            json: () => Promise.resolve({ submissions: [mockSubmission] }),
        });
        render(<QuickGraderPage />);
        await waitFor(() => {
            expect(screen.getByText(/John Doe's Submission/i)).to.exist;
        });
        const gradeInput = screen.getByRole('spinbutton');
        fireEvent.change(gradeInput, { target: { value: '89' } });
        const feedbackTextarea = screen.getByRole('textbox');
        fireEvent.change(feedbackTextarea, { target: { value: 'Excellent work!' } });
        expect(screen.getByDisplayValue('95')).to.exist;
        expect(screen.getByDisplayValue('Excellent work')).to.exist;
    });
    it('should navigate to the next student when Next button is clicked', async () => {
        const mockSubmission1 = {
            id: '789',
            fileName: 'example.pd',
            fileUrl: 'http://example.com/file.pdf',
            createdAt: new Date().toISOString(),
            student: {
                id: '123',
                firstName: 'John',
                lastName: 'Doe',
                email: 'johndoe@example.com',
            },
            grade: 90,
            feedback: 'Great work!',
        };
        const mockSubmission2 = {
            id: '790',
            fileName: 'example2.pdf',
            fileUrl: 'http://example.com/file2.pdf',
            createdAt: new Date().toISOString(),
            student: {
                id: '124',
                firstName: 'Jane',
                lastName: 'Doe',
                email: 'janedoe@example.com',
            },
            grade: 85,
            feedback: 'good job',
        };
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
        });
        fetchStub.resolves({
            json: () => Promise.resolve({ submissions: [mockSubmission1, mockSubmission2] }),
        });
        render(<QuickGraderPage />);
        await waitFor(() => {
            expect(screen.getByText(/John Doe's submission/i)).to.exist;
        });
        const nextButton = screen.getByText(/Next /i);
        fireEvent.click(nextButton);
        await waitFor(() => {
            expect(screen.getByText(/Jane Doe's Submission/i)).to.exist;
        });
    });
    it('should show error if fetching submissions fails', async () => {
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
        });
        fetchStub.rejects(new Error('Error fetching submission'));
        render(<QuickGraderPage />);
        await waitFor(() => {
            expect(screen.getByText(/Error fetching submissions/i)).to.exist;
        });
    });
});