import { expect } from 'chai';
import { render, screen, waitFor } from '@testing-library/react';
import sinon from 'sinon';
import React from 'react';
import ProfessorDashboard from '@/app/pages/professor/dashboard/page';
import { useUser } from '@clerk/nextjs';

// Required for JSX support in test files
import '@testing-library/jest-dom'; 

describe('ProfessorDashboard', () => {
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

  it('displays professor name when loaded', async () => {
    render(<ProfessorDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Hi, Professor Jane Doe/)).to.exist;
    });
  });

  it('shows "No courses assigned" when no courses exist', async () => {
    render(<ProfessorDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/No courses assigned/)).to.exist;
    });
  });

  it('renders loading state when not loaded', () => {
    useUserMock.restore();
    sinon.stub(require('@clerk/nextjs'), 'useUser').returns({ isLoaded: false });
    render(<ProfessorDashboard />);
    const spinner = screen.getByRole('status', { hidden: true });
    expect(spinner).to.exist;
  });
});
