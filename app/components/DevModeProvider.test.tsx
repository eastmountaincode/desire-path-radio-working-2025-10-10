import { fireEvent, render, screen } from '@testing-library/react'
import { DevModeProvider, useDevMode } from './DevModeProvider'
function Sample() {
  const enabled = useDevMode()
  return <><p>{enabled ? 'Borders on' : 'Borders off'}</p><input aria-label="Title" /><textarea aria-label="Description" /></>
}
test('B toggles boundaries without interfering with typing or browser shortcuts', () => {
  render(<DevModeProvider><Sample /></DevModeProvider>)
  fireEvent.keyDown(window, { key: 'b' })
  expect(screen.getByText('Borders on')).toBeInTheDocument()
  fireEvent.keyDown(screen.getByLabelText('Title'), { key: 'b' })
  fireEvent.keyDown(screen.getByLabelText('Description'), { key: 'B' })
  fireEvent.keyDown(window, { key: 'b', metaKey: true })
  expect(screen.getByText('Borders on')).toBeInTheDocument()
  fireEvent.keyDown(window, { key: 'B' })
  expect(screen.getByText('Borders off')).toBeInTheDocument()
})
