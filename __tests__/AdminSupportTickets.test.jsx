import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import '@testing-library/jest-dom';
import TicketsPage from '../app/admin/support/tickets/page';
import SupportLayout from '../app/admin/support/layout';

// Mock matchMedia
window.matchMedia = window.matchMedia || function() {
  return {
    matches: false,
    addListener: function() {},
    removeListener: function() {}
  };
};

jest.mock('next/navigation', () => ({
  usePathname: () => '/admin/support/tickets'
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: { user: { id: 'admin1', role: 'ADMIN' } }, status: 'authenticated' }))
}));

describe('Admin Support Tickets Feature', () => {
  describe('Support Layout', () => {
    it('renders the layout children cleanly', () => {
      render(
        <SupportLayout>
          <div>Support Content</div>
        </SupportLayout>
      );
      expect(screen.getByText('Support Content')).toBeInTheDocument();
    });
  });

  describe('Tickets Page', () => {
    it('renders the tickets list and default active tabs', () => {
      render(<TicketsPage />);
      
      // Should show the title
      expect(screen.getByText('Tickets', { selector: 'h1' })).toBeInTheDocument();
      
      // Should have ticket cards
      expect(screen.getByText('Reinstate Flagged Poem', { selector: 'p' })).toBeInTheDocument();
      expect(screen.getByText('Featured Poem Banner Request', { selector: 'p' })).toBeInTheDocument();
      
      // Should show details of the first ticket which is active
      expect(screen.getByText('Ticket #128')).toBeInTheDocument();
      expect(screen.getByText('#P183294')).toBeInTheDocument();
    });

    it('filters tickets when searching', async () => {
      render(<TicketsPage />);
      
      const searchInput = screen.getByPlaceholderText('Search');
      fireEvent.change(searchInput, { target: { value: 'OAuth Login Error' } });
      
      expect(screen.getAllByText('OAuth Login Error', { selector: 'p' })[0]).toBeInTheDocument();
      expect(screen.queryByText('Reinstate Flagged Poem', { selector: 'p' })).not.toBeInTheDocument();
    });

    it('toggles group by dropdown menu open and select options', async () => {
      render(<TicketsPage />);
      
      // Initially, the "Group: Categories" custom trigger should be visible
      const groupTrigger = screen.getByText('Categories');
      expect(groupTrigger).toBeInTheDocument();
      
      // Click the trigger to open the custom dropdown menu
      fireEvent.click(groupTrigger);
      
      // Popover items should appear
      const flatListOption = screen.getByText('Flat List');
      expect(flatListOption).toBeInTheDocument();
      
      // Click on Flat List option
      fireEvent.click(flatListOption);
      
      // Dropdown menu should close, and trigger should now display 'Flat List'
      await waitFor(() => {
        expect(screen.queryByText('Categories')).not.toBeInTheDocument();
        expect(screen.getByText('Flat List')).toBeInTheDocument();
      });
    });

    it('switches active ticket when clicking a ticket card', async () => {
      render(<TicketsPage />);
      
      // Click the second ticket
      const secondTicket = screen.getByText('Featured Poem Banner Request', { selector: 'p' });
      fireEvent.click(secondTicket);
      
      // The details panel should now show the second ticket's info
      await waitFor(() => {
        expect(screen.getByText('Ticket #129')).toBeInTheDocument();
        expect(screen.getByText('#AD9921')).toBeInTheDocument();
      });
    });

    it('closes a tab when clicking the close button', async () => {
      render(<TicketsPage />);
      
      // We start with "Reinstate Flagged Poem" and "Inappropriate Comments"
      // Let's close the first tab ("Reinstate Flagged Poem" has ID 128)
      // The close buttons are spans with '×' inside the tab
      const closeButtons = screen.getAllByText('×');
      fireEvent.click(closeButtons[0]);
      
      // The first ticket info should disappear and the next tab should become active
      await waitFor(() => {
        expect(screen.queryByText('Ticket #128')).not.toBeInTheDocument();
        expect(screen.getByText('Ticket #130')).toBeInTheDocument();
      });
    });
  });
});

describe('Tickets Page — derived and reset state', () => {
  const jsonResponse = (body) => Promise.resolve({ ok: true, json: () => Promise.resolve(body) });
  const ADA = { id: 'u9', name: 'Ada Lovelace', email: 'ada@example.com', detail: 'ada@example.com' };

  beforeEach(() => {
    sessionStorage.clear();
    global.fetch = jest.fn((url) => {
      if (url.startsWith('/api/admin/users/search')) return jsonResponse({ users: [ADA] });
      if (url.startsWith('/api/admin/entities/search')) return jsonResponse({ entities: [ADA] });
      return jsonResponse({});
    });
  });

  afterEach(() => {
    delete global.fetch;
    useSession.mockImplementation(() => ({ data: { user: { id: 'admin1', role: 'ADMIN' } }, status: 'authenticated' }));
  });

  describe('Create ticket user search', () => {
    it('shows results for a query and clears them once a user is picked', async () => {
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ New Ticket'));

      fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), { target: { value: 'ada' } });
      await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Ada Lovelace'));
      expect(screen.queryByPlaceholderText('Search by name or email...')).not.toBeInTheDocument();
      expect(screen.getByText('ada@example.com')).toBeInTheDocument();

      // Unpicking shows an empty search without stale results, even while a new query is debouncing
      const modal = screen.getByText('Create New Ticket').parentElement.parentElement;
      fireEvent.click(within(modal).getByText('✕'));
      expect(screen.getByPlaceholderText('Search by name or email...')).toHaveValue('');
      fireEvent.change(screen.getByPlaceholderText('Search by name or email...'), { target: { value: 'b' } });
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });

    it('clears results as soon as the query is emptied', async () => {
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ New Ticket'));
      const input = screen.getByPlaceholderText('Search by name or email...');

      fireEvent.change(input, { target: { value: 'ada' } });
      await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());

      fireEvent.change(input, { target: { value: '  ' } });
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });

    it('files tickets for the signed-in user when they are a regular user', async () => {
      useSession.mockImplementation(() => ({
        data: { user: { id: 'u1', name: 'Uma User', email: 'uma@example.com', role: 'USER' } },
        status: 'authenticated'
      }));
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ New Ticket'));

      // No user picker: the session user is the target
      expect(screen.queryByText('Select User')).not.toBeInTheDocument();
      fireEvent.change(screen.getByPlaceholderText('E.g. Unable to access billing'), { target: { value: 'Locked out' } });
      fireEvent.change(screen.getByPlaceholderText('Describe the issue on behalf of the user...'), { target: { value: 'Cannot sign in' } });

      const submit = screen.getByText('Create Ticket');
      expect(submit).toBeEnabled();
      await act(async () => {
        fireEvent.click(submit);
      });

      const [, request] = global.fetch.mock.calls.find(([url, opts]) => url === '/api/admin/tickets' && opts?.method === 'POST');
      expect(JSON.parse(request.body)).toMatchObject({ targetUserId: 'u1', title: 'Locked out', snippet: 'Cannot sign in' });
    });

    it('requires admins to pick a user before creating a ticket', () => {
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ New Ticket'));
      fireEvent.change(screen.getByPlaceholderText('E.g. Unable to access billing'), { target: { value: 'Locked out' } });
      fireEvent.change(screen.getByPlaceholderText('Describe the issue on behalf of the user...'), { target: { value: 'Cannot sign in' } });

      expect(screen.getByText('Create Ticket')).toBeDisabled();
    });
  });

  describe('Create ticket entity search', () => {
    it('clears entity results when the query is emptied', async () => {
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ New Ticket'));
      const input = screen.getByPlaceholderText('Search Post...');

      fireEvent.change(input, { target: { value: 'ada' } });
      await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());

      fireEvent.change(input, { target: { value: '' } });
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });
  });

  describe('CC search', () => {
    it('only shows results for queries of two or more characters', async () => {
      render(<TicketsPage />);
      fireEvent.click(screen.getByText('+ Add CC'));
      const input = screen.getByPlaceholderText('Type to search...');

      fireEvent.change(input, { target: { value: 'ad' } });
      await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument());

      fireEvent.change(input, { target: { value: 'a' } });
      expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument();
    });
  });

  describe('responsive layout outside the test environment', () => {
    const originalEnv = process.env.NODE_ENV;
    const originalWidth = window.innerWidth;

    const setWidth = (width) => {
      Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
    };

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
    });

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
      setWidth(originalWidth);
    });

    it('opens the chat view for the active ticket on mobile', async () => {
      setWidth(500);
      render(<TicketsPage />);

      await waitFor(() => expect(screen.queryByText('Tickets', { selector: 'h1' })).not.toBeInTheDocument());
      expect(screen.getByText('Reply To')).toBeInTheDocument();
    });

    it('collapses the details pane on tablet and re-expands it on desktop', async () => {
      setWidth(900);
      render(<TicketsPage />);
      await waitFor(() => expect(screen.queryByText('Ticket #128')).not.toBeInTheDocument());

      act(() => {
        setWidth(1300);
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.getByText('Ticket #128')).toBeInTheDocument();

      act(() => {
        setWidth(900);
        window.dispatchEvent(new Event('resize'));
      });
      expect(screen.queryByText('Ticket #128')).not.toBeInTheDocument();
    });

    it("clears the previous ticket's timeline as soon as another ticket is opened", async () => {
      setWidth(1300);
      global.fetch = jest.fn((url) => {
        if (url === '/api/admin/tickets/128/logs') {
          return jsonResponse({ logs: [{ id: 'log1', operation: 'Escalated to safety', actor: { name: 'Ada' }, createdAt: '2026-01-01T00:00:00.000Z' }] });
        }
        // Ticket 129's logs never arrive, so only the reset can clear the old timeline
        if (url === '/api/admin/tickets/129/logs') return new Promise(() => {});
        return jsonResponse({});
      });

      render(<TicketsPage />);
      await waitFor(() => expect(screen.getByText('Escalated to safety')).toBeInTheDocument());

      fireEvent.click(screen.getByText('Featured Poem Banner Request', { selector: 'p' }));
      await waitFor(() => expect(screen.getByText('Ticket #129')).toBeInTheDocument());
      expect(screen.queryByText('Escalated to safety')).not.toBeInTheDocument();
      expect(screen.getByText('No progress events yet.')).toBeInTheDocument();
      expect(global.fetch).toHaveBeenCalledWith('/api/admin/tickets/129/logs');
    });
  });
});

