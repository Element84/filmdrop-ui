import { vi } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QueryableFilters from './QueryableFilters'
import { Provider } from 'react-redux'
import { store } from '../../redux/store'
import { setappConfig, setQueryableFilters } from '../../redux/slices/mainSlice'
import { mockAppConfig } from '../../testing/shared-mocks'
import * as useRenderableQueryablesModule from '../../hooks/useRenderableQueryables'

// Schema fixtures for each branch of renderField()
const rangeNumberSchema = {
  type: 'number',
  minimum: 0,
  maximum: 100,
  title: 'Cloud Cover'
}

const rangeIntegerSchema = {
  type: 'integer',
  minimum: 0,
  maximum: 360,
  title: 'Sun Azimuth'
}

const numericNoRangeSchema = {
  type: 'number',
  title: 'View Angle'
}

const integerOnlyMinSchema = {
  type: 'integer',
  minimum: 0,
  title: 'GSD'
}

const stringEnumSchema = {
  type: 'string',
  enum: ['ascending', 'descending'],
  title: 'Orbit Direction'
}

const integerEnumSchema = {
  type: 'integer',
  enum: [1, 2, 3],
  title: 'Processing Level'
}

const plainStringSchema = {
  type: 'string',
  title: 'Platform'
}

const booleanSchema = {
  type: 'boolean',
  title: 'Is Active'
}

const objectSchema = {
  type: 'object',
  title: 'Properties'
}

const schemaWithDefault = {
  type: 'string',
  title: 'Constellation',
  default: 'sentinel-2'
}

const mockHook = (returnValue) => {
  vi.spyOn(
    useRenderableQueryablesModule,
    'useRenderableQueryables'
  ).mockReturnValue(returnValue)
}

const setup = () => {
  store.dispatch(setappConfig(mockAppConfig))
  return render(
    <Provider store={store}>
      <QueryableFilters />
    </Provider>
  )
}

describe('QueryableFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: empty state
    mockHook({ fields: [], hasFields: false, error: null })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('rendering by schema type', () => {
    it('should render RangeSliderWithInputs for number with min and max', () => {
      mockHook({
        fields: [['eo:cloud_cover', rangeNumberSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getAllByRole('slider')).toHaveLength(2)
      expect(screen.getByText('Cloud Cover')).toBeInTheDocument()
      expect(
        screen.getByLabelText('Cloud Cover minimum value')
      ).toBeInTheDocument()
      expect(
        screen.getByLabelText('Cloud Cover maximum value')
      ).toBeInTheDocument()
    })

    it('should render RangeSliderWithInputs for integer with min and max', () => {
      mockHook({
        fields: [['sun_azimuth', rangeIntegerSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getAllByRole('slider')).toHaveLength(2)
      expect(screen.getByText('Sun Azimuth')).toBeInTheDocument()
    })

    it('should render unbounded range card for number without min/max', () => {
      mockHook({
        fields: [['view_angle', numericNoRangeSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByText('View Angle')).toBeInTheDocument()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      const minPill = screen.getByLabelText('View Angle minimum value')
      const maxPill = screen.getByLabelText('View Angle maximum value')
      expect(minPill).not.toHaveAttribute('readOnly')
      expect(minPill).toHaveAttribute('placeholder', 'Min')
      expect(maxPill).not.toHaveAttribute('readOnly')
      expect(maxPill).toHaveAttribute('placeholder', 'Max')
    })

    it('should render partial range card for integer with only minimum', () => {
      mockHook({
        fields: [['gsd', integerOnlyMinSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByText('GSD')).toBeInTheDocument()
      // No slider track in partial range mode
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      // Fixed min pill + editable max pill
      const minPill = screen.getByLabelText('GSD minimum value')
      const maxPill = screen.getByLabelText('GSD maximum value')
      expect(minPill).toHaveAttribute('readOnly')
      expect(minPill).toHaveValue('Min: 0')
      expect(maxPill).not.toHaveAttribute('readOnly')
      expect(maxPill).toHaveAttribute('placeholder', 'Max')
    })

    it('should render partial range card for number with only maximum', () => {
      const maxOnlySchema = {
        type: 'number',
        maximum: 100,
        title: 'Score'
      }
      mockHook({
        fields: [['score', maxOnlySchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByText('Score')).toBeInTheDocument()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      const minPill = screen.getByLabelText('Score minimum value')
      const maxPill = screen.getByLabelText('Score maximum value')
      expect(maxPill).toHaveAttribute('readOnly')
      expect(maxPill).toHaveValue('Max: 100')
      expect(minPill).not.toHaveAttribute('readOnly')
      expect(minPill).toHaveAttribute('placeholder', 'Min')
    })

    it('should render MultiSelect for string with enum', () => {
      mockHook({
        fields: [['orbit_direction', stringEnumSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Orbit Direction')).toBeInTheDocument()
    })

    it('should render MultiSelect for integer with enum', () => {
      mockHook({
        fields: [['processing_level', integerEnumSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      expect(screen.getByText('Processing Level')).toBeInTheDocument()
    })

    it('should render TextField type="text" for plain string', () => {
      mockHook({
        fields: [['platform', plainStringSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      expect(screen.getByText('Platform')).toBeInTheDocument()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    })

    it('should not render unsupported boolean schema type', () => {
      // The hook filters unsupported types, so they won't appear in fields.
      // But if one somehow got through, renderField returns null.
      mockHook({
        fields: [['is_active', booleanSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.queryByText('Is Active')).not.toBeInTheDocument()
    })

    it('should not render unsupported object schema type', () => {
      mockHook({
        fields: [['properties', objectSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.queryByText('Properties')).not.toBeInTheDocument()
    })

    it('should render all supported field types together', () => {
      mockHook({
        fields: [
          ['eo:cloud_cover', rangeNumberSchema],
          ['orbit_direction', stringEnumSchema],
          ['platform', plainStringSchema],
          ['view_angle', numericNoRangeSchema]
        ],
        hasFields: true,
        error: null
      })
      setup()
      // RangeSlider renders 2 slider inputs (min/max thumbs)
      expect(screen.getAllByRole('slider')).toHaveLength(2)
      // MultiSelect renders a combobox
      expect(screen.getByRole('combobox')).toBeInTheDocument()
      // Plain string TextField renders a textbox
      expect(screen.getByRole('textbox')).toBeInTheDocument()
      // All numeric pill inputs have spinbutton role
      // RangeSlider has 2 + unbounded numeric has 2 = 4 spinbuttons
      expect(screen.getAllByRole('spinbutton')).toHaveLength(4)
      // Verify all labels present
      expect(screen.getByText('Cloud Cover')).toBeInTheDocument()
      expect(screen.getByText('Orbit Direction')).toBeInTheDocument()
      expect(screen.getByText('Platform')).toBeInTheDocument()
      expect(screen.getByText('View Angle')).toBeInTheDocument()
    })
  })

  describe('labels', () => {
    it('should use schema.title as the label when present', () => {
      mockHook({
        fields: [['eo:cloud_cover', rangeNumberSchema]],
        hasFields: true,
        error: null
      })
      setup()
      expect(screen.getByText('Cloud Cover')).toBeInTheDocument()
    })

    it('should fall back to getFieldLabelPlainText when title is missing', () => {
      mockHook({
        fields: [
          ['platform', { type: 'string' }] // no title
        ],
        hasFields: true,
        error: null
      })
      setup()
      // getFieldLabelPlainText('platform') should produce a label
      // The textbox should still render even without a title
      expect(screen.getByRole('textbox')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('should render an Alert with error message', () => {
      mockHook({
        fields: [],
        hasFields: false,
        error: { message: 'Queryables endpoint returned 500' }
      })
      setup()
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.getByText(/Unable to load filters/)).toBeInTheDocument()
      expect(
        screen.getByText(/Queryables endpoint returned 500/)
      ).toBeInTheDocument()
    })

    it('should not render filter fields in error state', () => {
      mockHook({
        fields: [],
        hasFields: false,
        error: { message: 'Error' }
      })
      setup()
      expect(screen.getByRole('alert')).toBeInTheDocument()
      expect(screen.queryAllByRole('slider')).toHaveLength(0)
      expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
      expect(screen.queryByRole('spinbutton')).not.toBeInTheDocument()
    })
  })

  describe('empty state', () => {
    it('should return null when no renderable fields exist', () => {
      mockHook({ fields: [], hasFields: false, error: null })
      const { container } = setup()
      expect(container.firstChild).toBeNull()
    })
  })

  describe('default value initialization', () => {
    it('should dispatch default values from schema on mount', () => {
      mockHook({
        fields: [['constellation', schemaWithDefault]],
        hasFields: true,
        error: null
      })
      setup()
      expect(store.getState().mainSlice.queryableFilters.constellation).toBe(
        'sentinel-2'
      )
    })

    it('should not overwrite existing filter values with defaults', () => {
      store.dispatch(setQueryableFilters({ constellation: 'landsat' }))
      mockHook({
        fields: [['constellation', schemaWithDefault]],
        hasFields: true,
        error: null
      })
      setup()
      expect(store.getState().mainSlice.queryableFilters.constellation).toBe(
        'landsat'
      )
    })
  })

  describe('user interactions', () => {
    describe('RangeSliderWithInputs', () => {
      it('should update Redux when min input changes', () => {
        mockHook({
          fields: [['eo:cloud_cover', rangeNumberSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const minInput = screen.getByLabelText('Cloud Cover minimum value')
        fireEvent.change(minInput, { target: { value: '20' } })
        fireEvent.blur(minInput)

        expect(
          store.getState().mainSlice.queryableFilters['eo:cloud_cover']
        ).toEqual({ min: 20, max: 100 })
      })
    })

    describe('Partial range (min-only mode)', () => {
      it('should update Redux with partial range value when max input changes', () => {
        mockHook({
          fields: [['gsd', integerOnlyMinSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const maxInput = screen.getByLabelText('GSD maximum value')
        fireEvent.change(maxInput, { target: { value: '50' } })
        fireEvent.blur(maxInput)

        expect(store.getState().mainSlice.queryableFilters['gsd']).toEqual({
          max: 50
        })
      })

      it('should remove filter when partial range input is cleared', () => {
        store.dispatch(setQueryableFilters({ gsd: { max: 50 } }))
        mockHook({
          fields: [['gsd', integerOnlyMinSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const maxInput = screen.getByLabelText('GSD maximum value')
        fireEvent.change(maxInput, { target: { value: '' } })
        fireEvent.blur(maxInput)

        expect(
          store.getState().mainSlice.queryableFilters['gsd']
        ).toBeUndefined()
      })
    })

    describe('Unbounded numeric', () => {
      it('should update Redux with min value for unbounded numeric', () => {
        mockHook({
          fields: [['view_angle', numericNoRangeSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const minInput = screen.getByLabelText('View Angle minimum value')
        fireEvent.change(minInput, { target: { value: '10' } })
        fireEvent.blur(minInput)

        expect(store.getState().mainSlice.queryableFilters.view_angle).toEqual({
          min: 10
        })
      })

      it('should update Redux with max value for unbounded numeric', () => {
        mockHook({
          fields: [['view_angle', numericNoRangeSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const maxInput = screen.getByLabelText('View Angle maximum value')
        fireEvent.change(maxInput, { target: { value: '42' } })
        fireEvent.blur(maxInput)

        expect(store.getState().mainSlice.queryableFilters.view_angle).toEqual({
          max: 42
        })
      })

      it('should remove filter from Redux when both inputs cleared', () => {
        store.dispatch(setQueryableFilters({ view_angle: { min: 10 } }))
        mockHook({
          fields: [['view_angle', numericNoRangeSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const minInput = screen.getByLabelText('View Angle minimum value')
        fireEvent.change(minInput, { target: { value: '' } })
        fireEvent.blur(minInput)

        expect(
          store.getState().mainSlice.queryableFilters.view_angle
        ).toBeUndefined()
      })
    })

    describe('Integer rounding', () => {
      it('should round to integer on blur for integer type', () => {
        mockHook({
          fields: [['gsd', integerOnlyMinSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const maxInput = screen.getByLabelText('GSD maximum value')
        fireEvent.change(maxInput, { target: { value: '10.7' } })
        fireEvent.blur(maxInput)

        expect(store.getState().mainSlice.queryableFilters['gsd']).toEqual({
          max: 11
        })
      })
    })

    describe('TextField text', () => {
      it('should update Redux when value changes', () => {
        vi.useFakeTimers()
        mockHook({
          fields: [['platform', plainStringSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: 'Landsat' } })
        act(() => {
          vi.advanceTimersByTime(300)
        })

        expect(store.getState().mainSlice.queryableFilters.platform).toBe(
          'Landsat'
        )
        vi.useRealTimers()
      })

      it('should remove filter from Redux when cleared', () => {
        vi.useFakeTimers()
        store.dispatch(setQueryableFilters({ platform: 'Sentinel' }))
        mockHook({
          fields: [['platform', plainStringSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const input = screen.getByRole('textbox')
        fireEvent.change(input, { target: { value: '' } })
        act(() => {
          vi.advanceTimersByTime(300)
        })

        expect(
          store.getState().mainSlice.queryableFilters.platform
        ).toBeUndefined()
        vi.useRealTimers()
      })
    })

    describe('MultiSelect', () => {
      it('should update Redux when option selected', async () => {
        mockHook({
          fields: [['orbit_direction', stringEnumSchema]],
          hasFields: true,
          error: null
        })
        setup()

        const select = screen.getByRole('combobox')
        await userEvent.click(select)
        const option = screen.getByRole('option', { name: 'ascending' })
        await userEvent.click(option)

        expect(
          store.getState().mainSlice.queryableFilters.orbit_direction
        ).toEqual(['ascending'])
      })
    })
  })
})
