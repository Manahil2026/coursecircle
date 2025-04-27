import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import ViewAssignment from '@/app/pages/student/view_assignment/[courseId]/[assignmentId]/page';
import * as nextNavigation from 'next/navigation';
import { OnlineSubmissionMethod } from '@prisma/client';

function Sidebar_dashboard() {
    return <div>Sidebar_dashboard</div>;
}
function CourseMenu({ courseId } : { courseId: string }) {
    return <div>CourseMenu {courseId}</div>;
}
function StudentFileUpload() {
    return <div>StudentFileUpload</div>;
}
function ReactQuillEditor() {
    return <div>ReactQuillEditor</div>;
}
function FileViewer({ fileUrl }: { fileUrl: string }) {
    return <div>FileViewer {fileUrl}</div>;
}
describe('ViewAssignment page', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    let useRouterStub: sinon.SinonStub;
    let routerBackStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
        useParamsStub = sinon.stub(nextNavigation, 'useParams');
        useRouterStub = sinon.stub(nextNavigation, 'useRouter');
        routerBackStub = sinon.stub();
        useParamsStub.returns({ courseId: 'course123', assignmentId: 'assignment123' });
        useRouterStub.returns({ back: routerBackStub });
    });
    afterEach(() => {
        sinon.restore();
    });
    it('displays loading spinner initially', () => {
        render(<ViewAssignment />);
        expect(screen.getByRole('status')).to.exist;
    });
    it('shows error if assignment not found', async () => {
        fetchStub.onFirstCall().resolves(new Response(null, { status: 404 }));
        render(<ViewAssignment />);
        await waitFor(() => {
            expect(screen.getByText(/assignment not found/i)).to.exist;
        });
    });
    it('renders assignment details correctly', async () => {
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify({
            id: 'assignment123',
            title: 'assignment title',
            description: '<p>content</p>',
            points: 60,
            dueDate: '04-27-2025',
            submissionType: 'ONLINE',
            OnlineSubmissionMethod: 'TEXT_ENTRY',
            published: true
        }), { status: 200 }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({ files: [] }), { status: 200 }));
        fetchStub.onThirdCall().resolves(new Response(JSON.stringify({ submissions: [] }), { status: 200 }));
        fetchStub.onCall(3).resolves(new Response(JSON.stringify({ pointsEarned: null, totalPoints: 50 }), { status: 200 }));
        render(<ViewAssignment />);
        expect(await screen.findByText('assignment tile')).to.exist;
        expect(await screen.findByText(/60 points/)).to.exist;
        expect(await screen.findByText(/Due Date/)).to.exist;
    });
    it('navigates back when back button is clicked', async () => {
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify({
            id: 'assignment123',
            title: 'assignment test',
            description: '<p>test</p>',
            points: 50,
            dueDate: '04-27-2025',
            submissionType: 'ONLINE',
            onlineSubmissionMethod: 'TEXT_ENTRY',
            published: true
        }), { status: 200 }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({ files: [] }), { status: 200 }));
        fetchStub.onThirdCall().resolves(new Response(JSON.stringify({ submissions: [] }), { status: 200 }));
        fetchStub.onCall(3).resolves(new Response(JSON.stringify({ pointsEarned: null, totalPointss: 50 }), { status: 200 }));
        render(<ViewAssignment />);
        const backButton = await screen.findByRole('button', { name: /back/i });
        fireEvent.click(backButton);
        expect(routerBackStub.calledOnce).to.be.true;
    });
    it('shows submitted fil if submission exists', async () => {
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify({
            id: 'assignment123',
            title: 'assignment test',
            description: '<p>test</p>',
            points: 50,
            dueDate: '04-27-2025',
            submissionType: 'ONLINE',
            onlineSubmissionMethod: 'FILE_UPLOAD',
            published: true
        }), { status: 200 }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({ files: [] }), { status: 200 }));
        fetchStub.onThirdCall().resolves(new Response(JSON.stringify({
            submissions: [{ id: 'sub123', fileUrl: 'https://example.com/file.pdf' }]
        }), { status: 200 }));
        fetchStub.onCall(3).resolves(new Response(JSON.stringify({ pointsEarned: null, totalPoints: 50 }), { status: 200 }));
        render(<ViewAssignment />);
        await waitFor(() => {
            expect(screen.getByText(/your submission/i)).to.exist;
            expect(screen.getByText(/file\.pdf/i)).to.exist;
        });
    });
});