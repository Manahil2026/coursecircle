import { expect } from 'chai';
import { render, screen, waitFor } from '@testing-library/react';
import sinon from 'sinon';
import React from 'react';
import StudentDashboard from '@/app/pages/student/dashboard/page';
import { useUser } from '@clerk/nextjs';

import '@testing-library/jest-dom';

describe('StudentDashboard', () => {
  let useUserMock: sinon.SinonStub;
  let fetchStub: sinon.SinonStub;

  beforeEach(() => {
    useUserMock = sinon.stub(require('@clerk/nextjs'), 'useUser').returns({
      isLoaded: true,
      user: { fullName: 'Jane Doe', firstName: 'Jane' },
    });

    fetchStub = sinon.stub(global, 'fetch').resolves({
      ok: true,
      json: async () => [],
    } as Response);
  });

  afterEach(() => {
    useUserMock.restore();
    fetchStub.restore();
  });

  it('displays student name when loaded', async () => {
    render(<StudentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Hi, Jane/)).to.exist;
    });
  });

  it('shows "No courses assigned" when no courses exist', async () => {
    render(<StudentDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No courses assigned/)).to.exist;
    });
  });

  it('renders course cards when courses exist', async () => {
    fetchStub.resolves({
      ok: true,
      json: async () => [
        { id: '1', name: 'Biology 101', code: 'BIO101' },
        { id: '2', name: 'Physics 202', code: 'PHY202' },
      ],
    } as Response);

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Biology 101/)).to.exist;
      expect(screen.getByText(/Physics 202/)).to.exist;
    });
  });

  it('renders loading state when user is not loaded', () => {
    useUserMock.restore();
    sinon.stub(require('@clerk/nextjs'), 'useUser').returns({ isLoaded: false });
    render(<StudentDashboard />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).to.exist;
  });

  it('handles fetch errors gracefully', async () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    fetchStub.rejects(new Error('Fetch failed'));

    render(<StudentDashboard />);

    await waitFor(() => {
      expect(consoleErrorStub.calledWithMatch('Error fetching courses:')).to.be.true;
    });

    consoleErrorStub.restore();
  });
});
