import { render, screen } from '@testing-library/react'
import { App } from '@/app/App'

describe('App', () => {
  it('renders foundation placeholder', () => {
    render(<App />)
    expect(
      screen.getByRole('heading', { name: /team workflow board/i }),
    ).toBeInTheDocument()
  })
})
