import ExportModal from './ExportModal'
import ExportPageClient from './ExportPageClient'

const poem = {
  title: 'Where the light rests',
  fullText: 'The garden keeps a little light\nFor every heart that comes at night.\n\nBetween the leaves, a quiet sky;\nWe let the hurried world go by.',
}
const author = { name: 'Avery', username: 'avery' }

const meta = { title: 'Export/Layouts', parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } } }
export default meta

export const Modal = { render: () => <ExportModal poem={poem} author={author} onClose={() => {}} /> }
export const Page = { render: () => <ExportPageClient poem={poem} author={author} /> }
export const LongPoem = { render: () => <ExportModal poem={{ ...poem, fullText: Array(12).fill(poem.fullText).join('\n\n') }} author={author} onClose={() => {}} /> }
