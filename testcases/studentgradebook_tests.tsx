import { render, screen, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react';
import GradeTracker from '@/app/pages/student/gradebook/[courseId]/page';
import { useParams } from 'next/navigation';

describe('GradeTracker', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(window, 'fetch');
        useParamsStub = sinon.stub(require('next/navigation'), 'useParams').returns({ courseId: 'course123' });
    });
    afterEach(() => {
        sinon.restore();
    });
    it('renders loading spinner initially', () => {
        render(<GradeTracker />);
        expect(screen.getByRole('status')).to.exist;
    });
    it('renders "no graded assignments" message if no assignments are found', async () => {
        fetchStub.callsFake((input) => {
            const url = typeof input === 'string' ? input : input.url;
            if (url.includes('/assignments')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [],
                } as Response);
            }
            if (url.includes('/student_gradebook')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({}),
                } as Response);
            }
            return Promise.resolve({
                ok: true, 
                json: async () => ({ name: 'test course' }),
            } as Response);
        });
        await waitFor(() => {
            expect(screen.getByText('no graded assignments available for this course yet')).to.exist;
        });
    });
    it('renders assignments and weighted grade if data is available', async () => {
        fetchStub.callsFake((input) => {
            const url = typeof input === 'string' ? input : input.url;
            if (url.includes('/assignments')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            groupName: 'homework',
                            assignments: [
                                {
                                    id: 'assignment1',
                                    title: 'assignment 1',
                                    dueDate: '03-20-2025',
                                    points: 100,
                                    published: true,
                                },
                            ],
                        },
                    ],
                } as Response);
            }
            if (url.includes('/grade')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        pointsEarned: 90,
                        submissionDate: '03-24-2025',
                        feedback: 'great',
                    }),
                } as Response);
            }
            if (url.includes('/student_gradebook')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        finalGrade: 90,
                        breakdown: [],
                    }),
                } as Response);
            }
            return Promise.resolve({
                ok: true,
                json: async () => ({ name: 'test course' }),
            } as Response);
        });
        render(<GradeTracker />);
        await waitFor(() => {
            expect(screen.getByText('gradebook')).to.exist;
            expect(screen.getByText('assignment 1')).to.exist;
            expect(screen.getByText('great')).to.exist;
        });
    });
    it('handles fetch errors gracefully', async () => {
        fetchStub.rejects(new Error('network error'));
        render(<GradeTracker />);
        await waitFor(() => {
            expect(screen.getByText('failed to load grade data')).to.exist;
        });
    });
});