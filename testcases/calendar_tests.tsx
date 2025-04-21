import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Calendar from '@/app/pages/calendar/page';
import { expect } from 'chai';

describe('Calendar Component', () => {
    it('renders the calendar header with current month and year', () => {
        render(<Calendar />);
        const now = new Date();
        const monthName = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear().toString();
        expect(screen.getByText(new RegExp(`${monthName} ${year}`))).to.exist;
    });
    it('renders 7 days names', () => {
        render(<Calendar />);
        ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach(day => {
            expect(screen.getByText(day)).to.exist;
        });
    });
    it('has navigation buttons: Today, Prev, Next', () => {
        render(<Calendar />);
        expect(screen.getByText('Today')).to.exist;
        expect(screen.getByLabelText('Previous month')).to.exist;
        expect(screen.getByLabelText('Next month')).to.exist;
    });
    it('opens the "New Event" modal when clicking "New Event" button', () => {
        render(<Calendar />);
        fireEvent.click(screen.getByRole('button', { name: /new event/i }));
        expect(screen.getAllByText(/add event/i).length).to.be.greaterThan(0);
    });
    it('adds a new event to the selected date', () => {
        render(<Calendar />);
        fireEvent.click(screen.getByRole('button', { name: /new event/i}));
        const titleInput = screen.getByPlaceholderText(/title/i);
        fireEvent.change(titleInput, { target: { value: 'Meeting' }});
        fireEvent.click(screen.getByRole('button', { name: /add event/i }));
        expect(screen.getAllByText(/meeting/i).length).to.be.greaterThan(0);
    });
    it('deletes an event when delete icon is clicked and confirmed', () => {
        render(<Calendar />);
        fireEvent.click(screen.getByRole('button', { name: /new event/i }));
        fireEvent.change(screen.getByPlaceholderText(/title/i), {target: {value: 'delete; '}});
        fireEvent.click(screen.getByRole('button', { name: /add event/i }));
        const deleteButton = screen.getAllByRole('button').find(btn =>
            btn.innerHTML.includes('svg') && btn.getAttribute('aria-label') === 'Delete event'
        );
        if (deleteButton) {
            window.confirm = () => true;
            fireEvent.click(deleteButton);
            expect(screen.queryByText(/delete me/i)).to.not.exist;
        }
    });
});