import { render, screen, waitFor } from '@testing-library/react';
import { expect } from 'chai';
import sinon from 'sinon';
import { useParams } from 'next/navigation';
import FileViewer from '@/app/components/file_viewer';
import React from 'react';
import AssignmentFilePage from '@/app/pages/professor/assignments/[courseId]/[assignmentId]/file/[fileId]/page';

describe('AssignmentFilePage', () => {
    let fetchStub: sinon.SinonStub;
    let useParamsStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
        useParamsStub = sinon.stub(require('next/navigation'), 'useParams');
    });
    afterEach(() => {
        fetchStub.restore();
        useParamsStub.restore();
    });
    it('should render loading state while fetching file details', () => {
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
            fileId: '789',
        });
        fetchStub.callsFake(() => new Promise(() => {}));
        render(<AssignmentFilePage />);
        expect(screen.getByText(/loading file/i)).to.exist;
    });
    it('should render FileViewer component with file URL after successful fetch', async () => {
        const mockFileData = {
            id: '789',
            fileName: 'example.pdf',
            fileUrl: 'http://example.com/file.pdf',
        };
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
            fileId: '789',
        });
        fetchStub.resolves({
            json: () => Promise.resolve(mockFileData),
        });
        render(<AssignmentFilePage />);
        await waitFor(() => {
            const fileViewer = screen.getByText(/file viewer/i);
            expect(fileViewer).to.exist;
            expect(fileViewer.closest('iframe')?.src).to.include(mockFileData.fileUrl);
        });
    });
    it('should handle error if file fetch fails', async () => {
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
            fileId: '789',
        });
        fetchStub.rejects(new Error('Error fetching file'));
        render(<AssignmentFilePage />);
        await waitFor(() => {
            expect(screen.getByText(/loading file/i)).to.exist;
        });
    });
    it('should not fetch file if fileId is not present in params', () => {
        useParamsStub.returns({
            courseId: '123',
            assignmentId: '456',
            fileId: '',
        });
        render(<AssignmentFilePage />);
        expect(screen.queryByText('File Viewer Mock')).to.not.exist;
    });
});