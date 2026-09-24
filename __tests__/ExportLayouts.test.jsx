import { render, screen, fireEvent, within } from '@testing-library/react'
import ExportModal from '../components/ExportModal'
import ExportPageClient from '../components/ExportPageClient'
import { ExportNode } from '../components/ExportEngine'
import { getExportPalettes, CREATIVE_LAYOUTS } from '../lib/exportLayouts'

jest.mock('next/navigation', () => ({ useRouter: () => ({}), useSearchParams: () => ({ get: () => null }) }))
jest.mock('html-to-image', () => ({ toJpeg: jest.fn(), toSvg: jest.fn() }))
const poem = { title: 'Where the light rests', fullText: 'The garden keeps a little light\nFor every heart that comes at night.' }
const author = { name: 'Avery', username: 'avery' }

for (const Component of [ExportModal, ExportPageClient]) {
  describe(Component.name, () => {
    it.each([
      ['Story format', 'White', '#ffffff'], ['Story format', 'Ivory', '#faf6ed'], ['Story format', 'Mist', '#edf2f5'],
      ['Love letter', 'Midnight', '#171923'], ['Love letter', 'Burgundy', '#301b26'], ['Love letter', 'Charcoal', '#202020'],
      ['Botanical press', 'Forest', '#142e26'], ['Celestial', 'Daybreak', '#f8f5ee'],
    ])('selects %s / %s in the card and export', (title, palette, background) => {
      const { container } = render(<Component poem={poem} author={author} onClose={() => {}} />)
      const card = screen.getByText(title).closest('[role="button"]')
      fireEvent.click(card)
      const swatch = within(card).getByRole('button', { name: `${title}: ${palette}` })
      fireEvent.click(swatch)
      expect(swatch).toHaveAttribute('aria-pressed', 'true')
      expect(card.firstElementChild).toHaveStyle({ background })
      const exportTitle = [...container.querySelectorAll('h1')].filter(el => el.textContent === poem.title).at(-1)
      expect(exportTitle).toBeTruthy()
      const exportRoot = title === 'Botanical press' || title === 'Celestial'
        ? exportTitle.closest('[data-layout]').parentElement.parentElement
        : exportTitle.parentElement.parentElement
      expect(exportRoot).toHaveStyle({ backgroundColor: background })
      fireEvent.click(screen.getByText('Minimal').closest('[role="button"]'))
      fireEvent.click(card)
      expect(within(card).getAllByRole('button').filter(el => el.getAttribute('aria-pressed') === 'true')).toHaveLength(1)
      expect(within(card).getAllByRole('button')[0]).toHaveAttribute('aria-pressed', 'true')
    })
  })
}

it.each(CREATIVE_LAYOUTS)('$title exports complete text, custom attribution, watermark and scales overflowing poems', ({ id }) => {
  const scrollHeight = jest.spyOn(HTMLElement.prototype, 'scrollHeight', 'get').mockReturnValue(2400)
  const props = { poem, author, template: id, colors: getExportPalettes()[id][0], width: 1080, height: 1350, displayAuthor: 'Custom writer' }
  const { container, rerender } = render(<ExportNode {...props} />)
  expect(screen.getByText((_, el) => el.textContent === poem.fullText)).toBeInTheDocument()
  expect(screen.getByText('— Custom writer')).toBeInTheDocument()
  expect(screen.getByText('https://verse.sno.center/avery')).toBeInTheDocument()
  expect(container.querySelector('[data-layout]').parentElement).toHaveStyle({ transform: 'scale(0.54)' })
  rerender(<ExportNode {...props} showAuthor={false} author={{ ...author, exportPreferences: { watermark: 'none' } }} />)
  expect(screen.queryByText('— Custom writer')).not.toBeInTheDocument()
  expect(screen.queryByText('https://verse.sno.center/avery')).not.toBeInTheDocument()
  scrollHeight.mockRestore()
})

it('keeps site view palettes responsive to the theme accent', () => {
  expect(getExportPalettes('rose').siteview[0].accent).toBe('hsl(348, 60%, 22%)')
  expect(getExportPalettes('invalid').siteview).toEqual(getExportPalettes('indigo').siteview)
})
