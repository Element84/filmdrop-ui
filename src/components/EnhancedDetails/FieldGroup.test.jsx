import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import FieldGroup from './FieldGroup.jsx'

const { mockGroupContainer, mockFieldItem } = vi.hoisted(() => ({
  mockGroupContainer: vi.fn(),
  mockFieldItem: vi.fn()
}))

/* eslint-disable react/prop-types -- mock components don't need prop validation */
vi.mock('./GroupContainer.jsx', () => ({
  default: mockGroupContainer
}))

vi.mock('./FieldItem.jsx', () => ({
  default: mockFieldItem
}))
/* eslint-enable react/prop-types */

describe('FieldGroup', () => {
  beforeEach(() => {
    mockGroupContainer.mockReset()
    mockFieldItem.mockReset()

    mockGroupContainer.mockImplementation(({ groupName, children }) => (
      <div data-testid="group-container" data-group-name={groupName}>
        {children}
      </div>
    ))

    mockFieldItem.mockImplementation(({ field, value }) => (
      <div data-testid="field-item">
        {field}:{String(value)}
      </div>
    ))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders default-format group fields', () => {
    render(
      <FieldGroup
        group={{
          name: 'Core Fields',
          fields: [
            { name: 'datetime', value: '2024-01-01T00:00:00Z' },
            { name: 'eo:cloud_cover', value: 10.5 }
          ]
        }}
        isConfigured={false}
        defaultExpanded={true}
      />
    )

    expect(screen.getByTestId('group-container')).toHaveAttribute(
      'data-group-name',
      'Core Fields'
    )
    expect(mockFieldItem).toHaveBeenCalledTimes(2)
    expect(mockFieldItem).toHaveBeenCalledWith(
      expect.objectContaining({
        field: 'datetime',
        value: '2024-01-01T00:00:00Z'
      }),
      undefined
    )
  })

  it('renders configured-format fields using provided sort function', () => {
    const sortFields = vi.fn((fields) => Object.entries(fields).reverse())

    render(
      <FieldGroup
        group={[
          'quality',
          {
            'eo:cloud_cover': 10.5,
            'view:sun_elevation': 65
          }
        ]}
        sortFields={sortFields}
        isConfigured={true}
      />
    )

    expect(sortFields).toHaveBeenCalledWith({
      'eo:cloud_cover': 10.5,
      'view:sun_elevation': 65
    })
    expect(screen.getByTestId('group-container')).toHaveAttribute(
      'data-group-name',
      'Quality'
    )
    expect(mockFieldItem).toHaveBeenCalledTimes(2)
  })

  it('returns null for empty groups', () => {
    const { container } = render(
      <FieldGroup
        group={{
          name: 'Core Fields',
          fields: []
        }}
      />
    )

    expect(container.firstChild).toBeNull()
    expect(mockGroupContainer).not.toHaveBeenCalled()
    expect(mockFieldItem).not.toHaveBeenCalled()
  })
})
