import { render, screen, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon'
import React from 'react';
import PeoplePage from '@/app/pages/professor/people/[courseId]/page';
import * as nextNavigation from 'next/navigation';

describe('PeoplePage', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    const mockPeople = [
        { id: 1, name: 'olivia rose', role: 'Student' },
        { id: 2, name: 'nick dotro', role: 'TA' },
    ];
    beforeEach(() => {
        useParamsStub = sinon.stub(nextNavigation, 'useParams').returns({ courseId: '123' });
        fetchStub = sinon.stub(global, 'fetch').resolves({
            json: async () => mockPeople
        } as Response);
    });
    afterEach(() => {
        sinon.restore();
    });
    it('displays loading spinner initially', async () => {
        render(<PeoplePage />);
        expect(screen.getByRole('status')).to.exist;
    });
    it('fetches and displays people data', async () => {
        render(<PeoplePage />);
        await waitFor(() => {
            expect(screen.getByText('People')).to.exist;
            expect(screen.getByText('olivia')).to.exist;
            expect(screen.getByText('nick dotro')).to.exist;
        });
        expect(fetchStub.calledOnceWith('/api/people?courseId=123')).to.be.true;
    });
    it('handles fetch error gracefully', async () => {
        fetchStub.restore();
        sinon.stub(global, 'fetch').rejects(new Error('fetch failed'));
        render(<PeoplePage />);
        await waitFor(() => {
            expect(screen.getByText('people')).to.exist;
        });
    });
    it('does not call fetch if courseId is missing', async () => {
        useParamsStub.restore();
        sinon.stub(nextNavigation, 'useParams').returns({});
        render(<PeoplePage />);
        await waitFor(() => {
            expect(fetchStub.called).to.be.false;
        });
    });
});