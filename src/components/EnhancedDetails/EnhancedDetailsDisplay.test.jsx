import React from 'react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { setAppConfig } from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import EnhancedDetailsDisplay from './EnhancedDetailsDisplay'

const {
  mockUseEnhancedDetails,
  mockFieldGroup,
  mockAssetDisplay,
  mockDefaultAssetDisplay,
  mockLinkDisplay,
  mockShowApplicationAlert,
  mockGroupPropertiesByExtension
} = vi.hoisted(() => ({
  mockUseEnhancedDetails: vi.fn(),
  mockFieldGroup: vi.fn(),
  mockAssetDisplay: vi.fn(),
  mockDefaultAssetDisplay: vi.fn(),
  mockLinkDisplay: vi.fn(),
  mockShowApplicationAlert: vi.fn(),
  mockGroupPropertiesByExtension: vi.fn()
}))

vi.mock('../../contexts/EnhancedDetailsContext', () => ({
  useEnhancedDetails: mockUseEnhancedDetails
}))

vi.mock('./FieldGroup.jsx', () => ({
  default: mockFieldGroup
}))

vi.mock('./AssetDisplay.jsx', () => ({
  default: mockAssetDisplay
}))

vi.mock('./DefaultAssetDisplay.jsx', () => ({
  default: mockDefaultAssetDisplay
}))

vi.mock('./LinkDisplay.jsx', () => ({
  default: mockLinkDisplay
}))

vi.mock('../../utils/alertHelper.js', () => ({
  showApplicationAlert: mockShowApplicationAlert
}))

vi.mock('../../utils/defaultFieldGrouping.js', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    groupPropertiesByExtension: mockGroupPropertiesByExtension
  }
})

function buildItem(overrides = {}) {
  return {
    id: 'scene-1',
    collection: 'demo-collection',
    properties: {
      datetime: '2024-05-01T00:00:00Z',
      'eo:cloud_cover': 12.5
    },
    assets: {
      thumbnail: {
        href: 'https://example.com/thumb.png',
        title: 'Thumbnail'
      }
    },
    links: [
      {
        rel: 'self',
        href: 'https://example.com/items/scene-1',
        type: 'application/geo+json'
      },
      {
        rel: 'license',
        href: 'https://example.com/license',
        type: 'text/html'
      }
    ],
    ...overrides
  }
}

function renderSubject({ item = buildItem(), appConfig = {} } = {}) {
  store.dispatch(
    setAppConfig({
      ...mockAppConfig,
      COLLECTIONS_CONFIG: {},
      STAC_LINK_ENABLED: true,
      STAC_LINKS_SECTION_ENABLED: true,
      ...appConfig
    })
  )

  mockUseEnhancedDetails.mockReturnValue({
    item,
    enhancedColumns: 2
  })

  const view = render(
    <Provider store={store}>
      <EnhancedDetailsDisplay />
    </Provider>
  )

  return {
    ...view,
    store
  }
}

describe('EnhancedDetailsDisplay', () => {
  beforeEach(() => {
    mockFieldGroup.mockReset()
    mockAssetDisplay.mockReset()
    mockDefaultAssetDisplay.mockReset()
    mockLinkDisplay.mockReset()
    mockShowApplicationAlert.mockReset()
    mockUseEnhancedDetails.mockReset()
    mockGroupPropertiesByExtension.mockReset()

    mockFieldGroup.mockImplementation(({ group, isConfigured }) => (
      <div data-testid="field-group">
        {isConfigured ? group[0] : group.name}
      </div>
    ))
    mockAssetDisplay.mockImplementation(() => (
      <div data-testid="asset-display">enhanced assets</div>
    ))
    mockDefaultAssetDisplay.mockImplementation(() => (
      <div data-testid="default-asset-display">default assets</div>
    ))
    mockLinkDisplay.mockImplementation(() => (
      <div data-testid="link-display">links</div>
    ))
    mockGroupPropertiesByExtension.mockReturnValue([
      {
        name: 'Core Fields',
        fields: [{ name: 'datetime', value: '2024-05-01T00:00:00Z' }]
      }
    ])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders nothing when there is no current popup result', () => {
    const { container } = renderSubject({ item: null })

    expect(container.firstChild).toBeNull()
    expect(mockFieldGroup).not.toHaveBeenCalled()
    expect(mockShowApplicationAlert).not.toHaveBeenCalled()
  })

  it('renders default property, asset, and link sections without enhanced config', () => {
    renderSubject()

    expect(screen.getByText('Properties')).toBeInTheDocument()
    expect(screen.getByText('Assets')).toBeInTheDocument()
    expect(screen.getByText('Links')).toBeInTheDocument()
    expect(screen.getByTestId('default-asset-display')).toBeInTheDocument()
    expect(screen.getByTestId('link-display')).toBeInTheDocument()
    expect(mockAssetDisplay).not.toHaveBeenCalled()
    expect(mockGroupPropertiesByExtension).toHaveBeenCalledTimes(1)

    const firstFieldGroupProps = mockFieldGroup.mock.calls[0][0]
    expect(firstFieldGroupProps.isConfigured).toBe(false)
    expect(firstFieldGroupProps.defaultExpanded).toBe(true)
  })

  it('uses configured field groups and enhanced asset display when configured', () => {
    renderSubject({
      appConfig: {
        COLLECTIONS_CONFIG: {
          'demo-collection': {
            enhancedDisplayConfig: {
              property_groups: [
                {
                  name: 'Core Fields',
                  fields: [{ name: 'datetime' }]
                },
                {
                  name: 'Quality',
                  fields: [{ name: 'eo:cloud_cover' }]
                }
              ]
            }
          }
        }
      }
    })

    expect(screen.getByTestId('asset-display')).toBeInTheDocument()
    expect(mockDefaultAssetDisplay).not.toHaveBeenCalled()
    expect(mockGroupPropertiesByExtension).not.toHaveBeenCalled()
    expect(mockFieldGroup).toHaveBeenCalledTimes(2)

    expect(mockFieldGroup.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        isConfigured: true,
        defaultExpanded: true
      })
    )
    expect(mockFieldGroup.mock.calls[1][0]).toEqual(
      expect.objectContaining({
        isConfigured: true,
        defaultExpanded: false
      })
    )
  })

  it('dedupes field-grouping alerts for the same item id across rerenders', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {})
    mockGroupPropertiesByExtension.mockImplementation(() => {
      throw new Error('grouping failed')
    })

    store.dispatch(
      setAppConfig({
        ...mockAppConfig,
        COLLECTIONS_CONFIG: {},
        STAC_LINK_ENABLED: true,
        STAC_LINKS_SECTION_ENABLED: true
      })
    )

    const firstItem = buildItem({ id: 'scene-1' })
    mockUseEnhancedDetails.mockReturnValue({
      item: firstItem,
      enhancedColumns: 2
    })

    const { rerender } = render(
      <Provider store={store}>
        <EnhancedDetailsDisplay />
      </Provider>
    )

    expect(mockShowApplicationAlert).toHaveBeenCalledTimes(1)

    mockUseEnhancedDetails.mockReturnValue({
      item: { ...firstItem },
      enhancedColumns: 2
    })
    rerender(
      <Provider store={store}>
        <EnhancedDetailsDisplay />
      </Provider>
    )

    expect(mockShowApplicationAlert).toHaveBeenCalledTimes(1)

    mockUseEnhancedDetails.mockReturnValue({
      item: buildItem({ id: 'scene-2' }),
      enhancedColumns: 2
    })
    rerender(
      <Provider store={store}>
        <EnhancedDetailsDisplay />
      </Provider>
    )

    expect(mockShowApplicationAlert).toHaveBeenCalledTimes(2)
    consoleErrorSpy.mockRestore()
  })
})
