import { render, screen, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import React from 'react'
import PeoplePage from '@/app/pages/student/people/[courseId]/page';
import { useParams } from 'next/navigation';

describe('PeoplePage', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(window, 'fetch');
        useParamsStub = sinon.stub(require('next/navigation'), 'useParams').returns({ courseId: 'course123' });
    });
    afterEach(() => {
        sinon.restore();
    });
    it('shows loading spinner initially', () => {
        render(<PeoplePage />);
        expect(screen.getByRole('status')).to.exist;
    });
    it('renders people after loading', async () => {
        fetchStub.resolves({
            ok: true,
            json: async () => [
                { id: '1', name: 'leah' },
                { id: '2', name: 'ashley' },
            ],
        } as Response);
        render(<PeoplePage />);
        await waitFor(() => {
            expect(screen.getByText('people')).to.exist;
            expect(screen.getByText('leah')).to.exist;
            expect(screen.getByText('ashley')).to.exist;
        });
    });
    it('handles fetch error and still renders empty table', async () => {
        fetchStub.rejects(new Error('network error'));
        render(<PeoplePage />);
        await waitFor(() => {
            expect(screen.getByText('people')).to.exist;
        });
    });
});