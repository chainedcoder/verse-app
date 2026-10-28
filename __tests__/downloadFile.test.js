import { dataUrlToBlob, downloadDataUrl } from '../lib/downloadFile'

const readBlobText = (blob) => new Promise((resolve) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.readAsText(blob)
})

describe('dataUrlToBlob', () => {
  it('decodes base64 data URLs with the right mime type', async () => {
    const blob = dataUrlToBlob(`data:image/jpeg;base64,${btoa('jpeg-bytes')}`)
    expect(blob.type).toBe('image/jpeg')
    expect(blob.size).toBe('jpeg-bytes'.length)
    expect(await readBlobText(blob)).toBe('jpeg-bytes')
  })

  it('decodes percent-encoded SVG data URLs from html-to-image', async () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"><text>Hope, 100%</text></svg>'
    const blob = dataUrlToBlob(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
    expect(blob.type).toBe('image/svg+xml')
    expect(await readBlobText(blob)).toBe(svg)
  })

  it('rejects values that are not data URLs', () => {
    expect(() => dataUrlToBlob('https://example.com/a.jpg')).toThrow('Invalid data URL')
  })
})

describe('downloadDataUrl', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    global.URL.createObjectURL = jest.fn(() => 'blob:http://localhost/abc')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('clicks an attached anchor pointing at a blob URL, not the data URL', () => {
    let clicked
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () {
      clicked = { href: this.href, download: this.download, attached: document.body.contains(this) }
    })

    downloadDataUrl(`data:image/jpeg;base64,${btoa('x')}`, 'verse-p1-minimal.jpg')

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob).toBeInstanceOf(Blob)
    expect(blob.type).toBe('image/jpeg')
    expect(clicked).toEqual({ href: 'blob:http://localhost/abc', download: 'verse-p1-minimal.jpg', attached: true })
    expect(document.querySelector('a[download]')).toBeNull()
    clickSpy.mockRestore()
  })

  it('revokes the object URL only after a delay', () => {
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    downloadDataUrl(`data:image/jpeg;base64,${btoa('x')}`, 'a.jpg')

    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    jest.runAllTimers()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/abc')
    clickSpy.mockRestore()
  })
})
