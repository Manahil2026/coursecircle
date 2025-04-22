import React from 'react';
import { expect } from 'chai';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import sinon from 'sinon';
import ConversationPage from '@/app/pages/inbox/[conversationId]/page';
import * as nextNavigation from 'next/navigation';
import * as clerkNextjs from '@clerk/nextjs';

describe('<ConversationPage />', () => {
    let useParamsStub: sinon.SinonStub;
    let useUserStub: sinon.SinonStub;
    let fetchStub: sinon.SinonStub;
    beforeEach(() => {
        useParamsStub = sinon.stub(nextNavigation, 'useParams');
        useUserStub = sinon.stub(clerkNextjs, 'useUser');
        fetchStub = sinon.stub(global, 'fetch');
    });
    afterEach(() => {
        sinon.restore();
    });
    it('renders loading state when user is not loaded', () => {
        useUserStub.returns({ isLoaded: false });
        render(<ConversationPage />);
        expect(screen.getByText('Loading user...')).to.exist;
    });
    it('renders error message if conversation fetch fails', async () => {
        useUserStub.returns({ isLoaded: true, user: { id: 'user1' } });
        useParamsStub.returns({ conversationId: '123' });
        fetchStub.resolves(new Response(null, { status: 500 }));
        render(<ConversationPage />);
        await waitFor(() => {
            expect(screen.getByText('Failed to load conversation. Please try again.')).to.exist;
        });
    });
    it('renders converstation when data is loaded successfully', async () => {
        useUserStub.returns({ isLoaded: true, user: { id: 'user1' } });
        useParamsStub.returns({ conversationId: '123' });
        fetchStub.resolves(new Response(JSON.stringify({
            id: '123',
            name: 'Test Conversation',
            isGroup: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participants: [],
            messages: [],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        render(<ConversationPage />);
        await waitFor(() => {
            expect(screen.getByText('Test Conversation')).to.exist;
        });
    });
    it('allows user to type and send a message', async () => {
        useUserStub.returns({ isLoaded: true, user: { id: 'user1' } });
        useParamsStub.returns({ conversationId: '123' });
        fetchStub.onFirstCall().resolves(new Response(JSON.stringify({
            id: '123',
            name: 'Test Conversation',
            isGroup: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participants: [],
            messages: [],
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        fetchStub.onSecondCall().resolves(new Response(JSON.stringify({
            id: 'msg1',
            content: 'Hello',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            status: 'SENT',
            isDraft: false,
            sender: {
                id: 'user1',
                firstName: 'Test',
                lastName: 'User',
            },
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        }));
        render(<ConversationPage />);
        await waitFor(() => {
            expect(screen.getByText('Test Conversation')).to.exist;
        });
        const input = screen.getByPlaceholderText('Type a message...');
        fireEvent.change(input, { target: { value: 'Hello'} });
        const sendButton = screen.getByRole('button', { name: 'Send' });
        fireEvent.click(sendButton);
        await waitFor(() => {
            expect(screen.getByText('Hello')).to.exist;
        });
    });
});