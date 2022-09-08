import type { ComputedGetter, ComputedRef, WatchSource, WritableComputedOptions, WritableComputedRef } from 'vue-demi'
import { computed, ref, watch } from 'vue-demi'
import { isFunction } from '../utils'

export interface ComputedWithControlRefExtra {
  /**
   * Force update the computed value.
   */
  trigger(): void
}

export interface ComputedRefWithControl<T> extends ComputedRef<T>, ComputedWithControlRefExtra {}
export interface WritableComputedRefWithControl<T> extends WritableComputedRef<T>, ComputedWithControlRefExtra {}

export function computedWithControl<T, S>(
  source: WatchSource<S> | WatchSource<S>[],
  fn: ComputedGetter<T>
): ComputedRefWithControl<T>

export function computedWithControl<T, S>(
  source: WatchSource<S> | WatchSource<S>[],
  fn: WritableComputedOptions<T>
): WritableComputedRefWithControl<T>

/**
 * Explicitly define the deps of computed.
 *
 * @param source
 * @param fn
 */
export function computedWithControl<T, S>(
  source: WatchSource<S> | WatchSource<S>[],
  fn: ComputedGetter<T> | WritableComputedOptions<T>,
) {
  let v: T = undefined!

  const get = isFunction(fn) ? fn : fn.get
  const set = isFunction(fn) ? undefined : fn.set

  const flag = ref(true)
  const update = () => {
    v = get()
    // notify getter
    flag.value = !flag.value
  }

  watch(source, update, { flush: 'sync', immediate: true })

  const result = computed({
    get() {
      // eslint-disable-next-line no-unused-expressions
      flag.value
      return v
    },
    set(v) {
      set?.(v)
    },
  }) as ComputedRefWithControl<T>

  result.trigger = update

  return result
}

// alias
export { computedWithControl as controlledComputed }
