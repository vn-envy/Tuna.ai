import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import LandingPage from './page'
import '@testing-library/jest-dom'

describe('LandingPage', () => {
  it('renders the main heading', () => {
    render(<LandingPage />)
    const heading = screen.getByText(/Plan once. Tuna keeps swimming/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders the sign in button', () => {
    render(<LandingPage />)
    const button = screen.getByRole('button', { name: /Sign in with Google/i })
    expect(button).toBeInTheDocument()
  })
})
