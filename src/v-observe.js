const yes = 'yes'
const no = 'no'
const kObserver = Symbol('v-observe')

function markObserved (el) {
  el.dataset.vObserved = yes
}

function markNotObserved (el) {
  el.dataset.vObserved = no
}

function cacheObserver (el, observer) {
  el[kObserver] = observer
}

function removeCachedObserver (el) {
  el[kObserver] = undefined
}

export default {
  inserted (el, { value: observer }) {
    if (observer instanceof IntersectionObserver) {
      observer.observe(el)
      markObserved(el)
      cacheObserver(el, observer)
    } else {
      markNotObserved(el)
      removeCachedObserver(el)
    }
  },

  update (el, { value: observer }) {
    let cached = el[kObserver]
    let sameObserver = observer === cached
    let observed = el.dataset.vObserved === yes
    let givenObserver = observer instanceof IntersectionObserver

    if (!observed) {
      if (givenObserver) {
        observer.observe(el)
        markObserved(el)
        cacheObserver(el, observer)
      }

      return
    }

    if (!givenObserver) {
      markNotObserved(el)
      if (cached) {
        cached.unobserve(el)
        removeCachedObserver(el)
      }
      return
    }

    if (sameObserver) {
      return
    }

    if (cached) {
      cached.unobserve(el)
    }

    observer.observe(el)
    markObserved(el)
    cacheObserver(el, observer)
  },

  unbind (el) {
    let cached = el[kObserver]
    if (cached instanceof IntersectionObserver) {
      cached.unobserve(el)
    }
    markNotObserved(el)
    removeCachedObserver(el)
  }
}
