import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import AnnouncementPage from '@/app/pages/inbox/announcement/page';
import * as nextRouter from 'next/navigation';
import * as clerkNextjs from '@clerk/nextjs';
import { send } from 'process';
import userEvent from '@testing-library/user-event';

describe('AnnouncementPage', () => {
    let routerPushStub: sinon.SinonStub;
    let fetchStub: sinon.SinonStub;
    let userMock: any;
    beforeEach(() => {
        routerPushStub = sinon.stub();
        sinon.stub(nextRouter, 'useRouter').returns({ push: routerPushStub } as any);
        userMock = {
            user: { publicMetadata: { role: 'prof' } },
            isLoaded: true,
        };
        sinon.stub(clerkNextjs, 'useUser').returns(userMock);
        fetchStub = sinon.stub(global, 'fetch');
    });
    afterEach(() => {
        sinon.restore();
    });
    it('renders page correctly', async () => {
        fetchStub.resolves(new Response(JSON.stringify([]), { status: 200 }));
        render(<AnnouncementPage />);
        expect(await screen.findByText('class announcement')).to.exist;
        expect(screen.getByText('--select a course--')).to.exist;
    });
    it('shows error if trying to send without selecting a course', async () => {
        render(<AnnouncementPage />);
        const sendButton = await screen.findByRole('button', { name: 'send announcement' });
        fireEvent.click(sendButton);
        expect(await screen.findByText('please select a course')).to.exist;
    });
    it('shows error if trying to send without entering a message', async () => {
        fetchStub.resolves(new Response(JSON.stringify([
            { id: 'course1', name: 'Java', code: 'CSIT112' }
        ]), { status: 200 }));
        render(<AnnouncementPage />);
        const courseSelect = await screen.findByLabelText('select course');
        fireEvent.change(courseSelect, { target: { value: 'course1' } });
        await waitFor(() => {
            expect(screen.getByDisplayValue('CSIT112 - Java')).to.exist;
        });
        const sendButton = screen.getByRole('button', { name: 'send announcement' });
        fireEvent.click(sendButton);
        expect(await screen.findByText('please enter a message')).to.exist;
    });
    it('shows error if no students found in the course', async () => {
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify([
            { id: 'course1', name: 'Java', code: 'CSIT112' }
        ]), { status: 200 }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({ students: [] }), { status: 200 }));
        render(<AnnouncementPage />);
        const courseSelect = await screen.findByLabelText('select course:');
        fireEvent.change(courseSelect, { target: { value: 'course1' } });
        await waitFor (() => screen.getByText('no students found in this course'));
        const sendButton = screen.getByRole('button', { name: 'send announcement' });
        fireEvent.click(sendButton);
        expect(await screen.findByText('no students found in this course')).to.exist;
    });
    it('disables send button if required fields are missing', async () => {
        fetchStub.resolves(new Response(JSON.stringify([]), { status: 200 }));
        render(<AnnouncementPage />);
        const sendButton = await screen.findByRole('button', { name: 'send announcement' });
        const user = userEvent.setup();
        let errorCaught = false;
        try {
            await user.click(sendButton);
        } catch (e) {
            errorCaught = true;
        }
        expect(errorCaught).to.be.true;
    });
    it('sends announcement successfully', async () => {
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify([
            { id: 'course1', name: 'Java', code: 'CSIT112' }
        ]), { status: 200 }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({
            students: [
                { id: 'student1', firstName: 'John', lastName: 'Doe' },
                { id: 'student2', firstName: 'Jane', lastName: 'Smith' }
            ]
        }), { status: 200 }));
        fetchStub.onThirdCall().resolves(new Response(JSON.stringify({ id: 'converstaion123' }), { status: 200 }));
        fetchStub.onCall(3).resolves(new Response(JSON.stringify({}), { status: 200 }));
        render(<AnnouncementPage />);
        const courseSelect = await screen.findByLabelText('select course:');
        fireEvent.change(courseSelect, { target: { value: 'course1' } });
        await waitFor(() => screen.getByText('recipients:'));
        const editor = await screen.findByLabelText('announcement message:');
        fireEvent.change(editor.querySelector('textarea')!, { target: { value: 'hello' } });
        const sendButton = screen.getByRole('button', { name: 'send announcement' });
        fireEvent.click(sendButton);
        await waitFor(() => {
            expect(routerPushStub.calledWith('/pages/inbox/converstaion123')).to.be.true;
        });
    });
    it('shows loading spinner when loading courses or students', async () => {
        fetchStub.resolves(new Promise(() => {}));
        render(<AnnouncementPage />)
        expect(screen.getByRole('status')).to.exist;
    });
});