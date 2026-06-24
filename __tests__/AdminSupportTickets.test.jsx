import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
