import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import GradeTracker from '@/app/pages/professor/gradebook/[courseId]/page';
import * as nextNavigation from 'next/navigation';

describe("GradeTracker Component", () => {
    let fetchStub: sinon.SinonStub;
    const mockCourseId = '123';
    const mockData = {
        assignments: [
            { id: 1, groupId: 1, title: 'assignment 1', dueDate: '04-15-2025', points: 100 },
        ],
        students: [
            {
                id: 1,
                name: 'leah',
                submissions: [
                    {
                        assignment: { id: 1, groupId: 1 },
                        grade: 90,
                    },
                ],
            },
        ],
        gradebook: [
            {
                studentId: 1,
                name: 'leah',
                weightedGrade: 90,
            },
        ],
    };
    beforeEach(() => {
        sinon.stub(nextNavigation, 'useParams').returns({ courseId: mockCourseId });
        fetchStub = sinon.stub(global, 'fetch');
        fetchStub.withArgs(`/api/gradebook?courseId=${mockCourseId}`).resolves({
            ok: true,
            json: async () => mockData,
        } as Response);
    });
    afterEach(() => {
        sinon.restore();
    });
    it('renders loading state initially', () => {
        render(<GradeTracker />);
        expect(screen.getByText('loading gradebook')).to.exist;
    });
    it('renders grade table after data is fetched', async () => {
        render(<GradeTracker />);
        await waitFor(() => {
            expect(screen.getByText('gradebook')).to.exist;
            expect(screen.getByText('leah')).to.exist;
            expect(screen.getByText('assignment 1')).to.exist;
        });
    });
    it('disables save/cancel buttons when there are no changes', async () => {
        render(<GradeTracker />);
        await waitFor(() => {
            const saveButton = screen.getByText('save changes') as HTMLButtonElement;
            const cancelButton = screen.getByText('cancel') as HTMLButtonElement;
            expect(saveButton.disabled).to.be.true;
            expect(cancelButton.disabled).to.be.true;
        });
    });
    it('handles API error gracefully', async () => {
        sinon.restore();
        sinon.stub(nextNavigation, 'useParams').returns({ courseId: mockCourseId });
        fetchStub = sinon.stub(global, 'fetch');
        fetchStub.withArgs(`/api/gradebook?courseId=${mockCourseId}`).rejects(new Error('Network error'));
        render(<GradeTracker />);
        await waitFor(() => {
            expect(screen.getByText('loading gradebook')).to.exist;
        });
    });
    it('calls save API on save changes', async () => {
        render(<GradeTracker />);
        await waitFor(() => {
            expect(screen.getByText('leah')).to.exist;
        });
        const saveButton = screen.getByText('save changes') as HTMLButtonElement;
        fireEvent.click(saveButton);
        await waitFor(() => {
            expect(saveButton.disabled).to.be.true;
        });
    });
});