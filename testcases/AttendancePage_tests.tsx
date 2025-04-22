import { expect } from 'chai';
import sinon from 'sinon';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useParams } from 'next/navigation';
import AttendancePage from '@/app/pages/professor/attendance/[courseId]/page';

describe('AttendancePage', () => {
    let fetchStub: sinon.SinonStub;
    let userParamsStub: sinon.SinonStub;
    beforeEach(() => {
        fetchStub = sinon.stub(global, 'fetch');
        userParamsStub = sinon.stub(require('next/navigation'), 'useParams');
    });
    afterEach(() => {
        fetchStub.restore();
        userParamsStub.restore();
    });
    it('should render loading state if courseId is missing', async () => {
        userParamsStub.returns(null);
        render(<AttendancePage />);
        expect(screen.getByText(/courseId is missing/i)).to.exist;
    });
    it('should fetch and display students when attendance data is fetched', async () => {
        const mockCourseId = '123';
        const mockStudents = [
            { id: '1', firstName: 'John', lastName: 'Doe', status: 'PRESENT' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'ABSENT' },
        ];
        userParamsStub.returns({ courseId: mockCourseId });
        fetchStub.resolves({
            json: () =>
                Promise.resolve({
                    attendanceRecords: mockStudents.map(student => ({
                        student: { ...student },
                        status: student.status,
                    })),
                    professorId: 'professor-123',
                }),
        });
        render(<AttendancePage />);
        await waitFor(() => {
            expect(screen.getByText(/Attendance for/i)).to.exist;
        });
        expect(screen.getByText(/John Doe/i)).to.exist;
        expect(screen.getByText(/Jane Smith/i)).to.exist;
    });
    it('should allow toggling student attendance status', async () => {
        const mockCourseId = '123';
        const mockStudents = [
            { id: '1', firstName: 'John', lastName: 'Doe', status: 'PRESENT' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'ABSENT' },
        ];
        userParamsStub.returns({ courseId: mockCourseId });
        fetchStub.resolves({
            json: () =>
                Promise.resolve({
                    attendanceRecords: mockStudents.map(student => ({
                        student: { ...student },
                        status: student.status,
                    })),
                    professorId: 'professor-123',
                }),
        });
        render(<AttendancePage />);
        await waitFor(() => {
            expect(screen.getByText(/Attendance for/i)).to.exist;
        });
        const johnDoeButton = screen.getByText(/PRESENT/i);
        fireEvent.click(johnDoeButton);
        await waitFor(() => {
            expect(screen.getByText(/ABSENT/i)).to.exist;
        });
    });
    it('should save attendance and display success message', async () => {
        const mockCourseId = '123';
        const mockStudents = [
            { id: '1', firstName: 'John', lastName: 'Doe', status: 'PRESENT' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'ABSENT' },
        ];
        sinon.stub(require('next/navigaation'), 'useParams').returns({ courseId: mockCourseId });
        render(<AttendancePage />);
        await waitFor(() => {
            expect(screen.getByText(/Attendance for/i)).to.exist;
        });
        const saveButton = screen.getByText(/Save Attendance/i);
        fireEvent.click(saveButton);
        await waitFor(() => {
            expect(screen.getByText(/Attendance saved successfully!/i)).to.exist;
        });
    });
    it('should handle errors during fetching attendance', async () => {
        const mockCourseId = '123';
        fetchStub.withArgs(`/api/courses/123/attendance?date=2025-04-22`).resolves({
            ok: false,
            json: () => Promise.resolve({ message: 'Failed to getch attendance records' }),
        });
        sinon.stub(require('next/navigation'), 'useParams').returns({ courseId: mockCourseId });
        render(<AttendancePage />);
        await waitFor(() => {
            expect(screen.getByText(/Error fetching attendance records/i)).to.exist;
        });
    });
    it('should handle errors during saving attendance', async () => {
        const mockCourseId = '123';
        const mockStudents = [
            { id: '1', firstName: 'John', lastName: 'Doe', status: 'PRESENT' },
            { id: '2', firstName: 'Jane', lastName: 'Smith', status: 'ABSENT' },
        ];
        sinon.stub(require('next/navigation'), 'useParams').returns({ courseId: mockCourseId });
        fetchStub.withArgs(`/api/courses/123/attendance?date=2025-04-22`).resolves({
            ok: true,
            json: () =>
                Promise.resolve({
                    attendanceRecords: mockStudents,
                    professorId: 'professor-123',
                }),
        });
        fetchStub.withArgs(`/api/courses/123/attendance`).resolves({
            ok: false,
            json: () => Promise.resolve({ message: 'Failed to save attendance' }),
        });
        render(<AttendancePage />);
        await waitFor(() => {
            expect(screen.getByText(/Attendance for /i)).to.exist;
        });
        const saveButton = screen.getByText(/Save Attendance/i);
        fireEvent.click(saveButton);
        await waitFor(() => {
            expect(screen.getByText(/Failed to save attendance/i)).to.exist;
        });
    });
});