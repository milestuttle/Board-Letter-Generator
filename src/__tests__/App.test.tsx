import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import App from '../App'

describe('App - export validation gating', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('blocks printing the starter template, which has no recipient name yet, and names the missing fields', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'Print' }))

    expect(printSpy).not.toHaveBeenCalled()
    expect(
      screen.getByText(/Add these fields before exporting: First Name, Last Name/)
    ).toBeInTheDocument()
  })

  it('unblocks printing once the recipient name is filled in', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)

    fireEvent.change(screen.getByPlaceholderText('e.g. Stacy'), { target: { value: 'Sarah' } })
    fireEvent.change(screen.getByPlaceholderText('e.g. Andrews'), { target: { value: 'Jenkins' } })
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))

    expect(printSpy).toHaveBeenCalledTimes(1)
    expect(
      screen.getByText(/Tip: In print dialog, choose 'Save as PDF'/)
    ).toBeInTheDocument()
  })

  it('re-blocks printing if the filled-in name is cleared again', () => {
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {})
    render(<App />)

    const firstNameInput = screen.getByPlaceholderText('e.g. Stacy')
    const lastNameInput = screen.getByPlaceholderText('e.g. Andrews')
    fireEvent.change(firstNameInput, { target: { value: 'Sarah' } })
    fireEvent.change(lastNameInput, { target: { value: 'Jenkins' } })
    fireEvent.change(lastNameInput, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'Print' }))

    expect(printSpy).not.toHaveBeenCalled()
    expect(screen.getByText(/Add this field before exporting: Last Name/)).toBeInTheDocument()
  })
})
