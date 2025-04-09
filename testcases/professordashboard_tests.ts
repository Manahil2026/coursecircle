import { expect } from 'chai';
import { createRoot } from 'react-dom/client';  // React 18+ way of rendering
import { beforeEach, afterEach, describe, it } from 'mocha';
import ProfessorDashboard from '@/app/pages/professor/dashboard/page'; // Ensure this path is correct
import sinon from 'sinon';
import { useUser } from '@clerk/nextjs';
import React from 'react';

let container: HTMLDivElement;
let useUserMock: sinon.SinonStub;

describe('ProfessorDashboard Component', function () {
  beforeEach(function () {
    // Create a DOM element to render the component into
    container = document.createElement('div');
    document.body.appendChild(container);

    // Stub useUser to return mock data
    useUserMock = sinon.stub(require('@clerk/nextjs'), 'useUser').returns({
      isLoaded: true,
      user: { fullName: 'Jane Doe', firstName: 'Jane' },
    });
  });

  afterEach(function () {
    // Cleanup after each test
    document.body.removeChild(container);
    useUserMock.restore();
  });

  it('renders professor name when user is loaded', function () {
    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard)); // Manually create the element

    const heading = container.querySelector('h1');
    expect(heading?.textContent).to.include('Professor Jane Doe');
  });

  it('renders "No courses assigned" when course list is empty', function () {
    // Mock fetch to return an empty course list
    global.fetch = sinon.stub().resolves({
      ok: true,
      json: async () => [],
    });

    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard));  // Manually create the element

    const message = container.querySelector('p');
    expect(message?.textContent).to.include('No courses assigned.');
  });

  it('renders calendar with 7 days of the week', function () {
    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard));  // Manually create the element

    const days = Array.from(container.querySelectorAll('.grid > div')).map(
      (day) => day.textContent
    );
    expect(days.slice(0, 7)).to.eql(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
  });

  it('renders a To-do list with at least one item', function () {
    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard));  // Manually create the element

    const todoItems = container.querySelectorAll('ul li');
    expect(todoItems.length).to.be.at.least(1);
  });

  it('renders announcement section', function () {
    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard));  // Manually create the element

    const announcement = container.querySelector('p');
    expect(announcement?.textContent).to.include('No Announcement');
  });

  it('shows loading screen if user is not loaded', function () {
    useUserMock.restore(); // Remove earlier stub
    sinon.stub(require('@clerk/nextjs'), 'useUser').returns({ isLoaded: false });

    const root = createRoot(container);  // React 18+ method to render
    root.render(React.createElement(ProfessorDashboard));  // Manually create the element

    const loading = container.querySelector('.animate-spin');
    expect(loading).to.exist;
  });
});
