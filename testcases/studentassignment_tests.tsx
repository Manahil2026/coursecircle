import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import StudentAssignments from '@/app/pages/student/assignments/[courseId]/page';
import React from 'react';
import { useRouter } from 'next/navigation';
import sinon from 'sinon';

describe('StudentAssignments', () => {
    let fetchStub: sinon.SinonStub;
    let routerPushStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(window, 'fetch');
        routerPushStub = sinon.stub();
        sinon.stub(require('next/navigation'), 'useRouter').returns({
            push: routerPushStub,
        });
    });
    afterEach(() => {
        sinon.restore();
    });
    it('shows loading spinner initially', () => {
        fetchStub.resolves({
            ok: true,
            json: async () => [],
        } as Response);
        render(<StudentAssignments />);
        expect(screen.getByRole('status')).to.exist;
    });
    it('displays "No assignments" if no assignments returned', async () => {
        fetchStub.resolves({
            ok: true,
            json: async () => [],
        } as Response);
        render(<StudentAssignments />);
        await waitFor(() => {
            expect(screen.getByText('no assignments available for this course yet')).to.exist;
        });
    });
    it('renders groups and assignments', async () => {
        fetchStub.callsFake((input) => {
            const url = typeof input === 'string' ? input : input.url;
            if (url.includes('/assignments')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => [
                        {
                            id: 'group-1',
                            name: 'homework',
                            assignments: [
                                {
                                    id: 'assignment-1',
                                    title: 'assignment 1',
                                    points: 10,
                                    dueDate: '03-14-2024',
                                    published: true,
                                },
                            ],
                        },
                    ],
                } as Response);
            }
            if (url.includes('/submissions/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        statuses: {
                            'assignment-1': 'SUBMITTED',
                        },
                    }),
                } as Response);
            }
            return Promise.reject(new Error('unknown API'));
        });
        render(<StudentAssignments />);
        await waitFor(() => {
            expect(screen.getByText('homework')).to.exist;
            expect(screen.getByText('assignment 1')).to.exist;
            expect(screen.getByText('submitted')).to.exist;
        });
    });
    it('clicks an assignment and navigates', async () => {
        fetchStub.callsFake((input) => {
            const url = typeof input === 'string' ? input : input.url;
            if (url.includes('/assignments')) {
                return Promise.resolve({
                    ok: true, 
                    json: async () => [
                        {
                            id: 'group-1',
                            name: 'homework',
                            assignments: [
                                {
                                    id: 'assignment-1',
                                    title: 'assignment 1',
                                    points: 10,
                                    dueDate: '03-14-2025',
                                    published: true,
                                },
                            ],
                        },
                    ],
                } as Response);
            }
            if (url.includes('/submissions/status')) {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        status: {
                            'assignment-1': 'SUBMITTED',
                        },
                    }),
                } as Response);
            }
            return Promise.reject(new Error('unknown API'));
        });
        render(<StudentAssignments />);
        await waitFor(() => {
            const assignmentLink = screen.getByText('assignment 1');
            expect(assignmentLink).to.exist;
            fireEvent.click(assignmentLink);
            expect(routerPushStub.called).to.be.true;
        });
    });
    it('handles fetch error gracefully', async () => {
        fetchStub.rejects(new Error('fetch failed'));
        render(<StudentAssignments />);
        await waitFor(() => {
            expect(screen.getByText('no assignments available for this course yet')).to.exist;
        });
    });
});