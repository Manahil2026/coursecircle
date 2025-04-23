import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import Coursepage from '@/app/pages/professor/course_home/[courseId]/page';
import * as navigation from 'next/navigation';

describe('Coursepage', () => {
    let fetchStub: sinon.SinonStub;
    beforeEach(() => {
        sinon.stub(navigation, 'useSearchParams').returns(
            new URLSearchParams('courseId=123&courseName=testcourse') as any
        );
        fetchStub = sinon.stub(global, 'fetch');
    });
    afterEach(() => {
        sinon.restore();
    });
    it('renders a loading state initially', () => {
        fetchStub.resolves(Promise.resolve({
            ok: true,
            json: async () => [],
        }));
        render(<Coursepage />);
        expect(screen.getByText(/loading/i)).to.exist;
    });
    it('fetches and displays modules', async () => {
        fetchStub.resolves(Promise.resolve({
            ok: true,
            json: async () => [
                { id: '1', title: 'intro module', published: true },
            ],
        }));
        render(<Coursepage />);
        await waitFor(() => {
            expect(screen.getByText('intro module')).to.exist;
        });
    });
    it('allows toggling module publish state', async () => {
        fetchStub.onCall(0).resolves(Promise.resolve({
            ok: true,
            json: async () => [
                { id: '1', title: 'module 1', published: false },
            ],
        }));
        fetchStub.onCall(1).resolves(Promise.resolve({ ok: true }));
        render(<Coursepage />);
        await waitFor(() => {
            expect(screen.getByText('module 1')).to.exist;
        });
        const toggleButton = screen.getByText(/publish/i);
        fireEvent.click(toggleButton);
        await waitFor(() => {
            expect(fetchStub.calledWith('/api/module/publish', sinon.match.any)).to.be.true;
        });
    });
    it('allows deleting a module', async () => {
        fetchStub.onCall(0).resolves(Promise.resolve({
            ok: true,
            json: async () => [
                { id: '1', title: 'module to delete', published: true },
            ],
        }));
        fetchStub.onCall(1).resolves(Promise.resolve({ ok: true }));
        render(<Coursepage />);
        await waitFor(() => {
            expect(screen.getByText('module to delete')).to.exist;
        });
        const deleteButton = screen.getByText(/delete/i);
        fireEvent.click(deleteButton);
        await waitFor(() => {
            expect(fetchStub.calledWith('/api/module/delete', sinon.match.any)).to.be.true;
        });
    });
});