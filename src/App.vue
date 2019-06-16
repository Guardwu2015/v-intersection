<template>
  <div id="app">
    <img width="25%" src="./assets/logo.png">
    <ul class="list">
      <li
        v-observe="observer"
        ref="items"
        v-for="i in range"
        :key="i"
        class="item"
        :data-id="i"
      >Item Number #{{i}}</li>
    </ul>

    <aside class="ticker">
      <transition-group v-if="inView" name="in-view" tag="ul">
        <li v-for="i in inView" :key="i" class="in-view-item">{{i}}</li>
      </transition-group>
      <span v-else>No items in view</span>
    </aside>
  </div>
</template>

<script>
import Vue from 'vue'
import vObserve from './v-observe'

export default Vue.extend({
  name: 'App',
  directives: {
    observe: vObserve
  },
  data () {
    return {
      // Record<number, boolean>
      // Essentially an object where the keys are the item index
      // and the values are booleans of whether or not they are in view.
      // A Map or Set could be used to better effect,
      // but Vue cannot observe these types until version 3.x
      inViewById: {},
      observer: undefined
    }
  },
  computed: {
    range () {
      return Array.from({ length: 100 }, (_, i) => i + 1)
    },
    inView () {
      return Object.entries(this.inViewById)
        .filter(this.isInView)
        .map(this.pluckId)
        .sort(this.sortAtoi)
    }
  },
  mounted () {
    this.observer = new IntersectionObserver(this.handleIntersection)
  },
  beforeDestroy () {
    this.observer.disconnect()
  },
  methods: {
    handleIntersection (entries, observer) {
      // Clone the map so we can add new keys.
      let inViewById = this.cloneInViewById()

      // Each entry is an object of intersection information
      // corresponding to our observed elements.
      // The element itself is the entry target.
      for (let entry of entries) {
        let id = entry.target.dataset.id
        if (entry.isIntersecting) {
          inViewById[id] = entry.isIntersecting
        } else if (inViewById[id]) {
          inViewById[id] = false
        }
      }

      // Setting this fresh, unobserved object signals vue to observe & react.
      this.inViewById = inViewById
    },
    cloneInViewById () {
      // We'll just clone the properties that are in view
      // to keep the map small.
      let inViewById = {}
      for (let [id, inView] of Object.entries(this.inViewById)) {
        if (inView) {
          inViewById[id] = true
        }
      }
      return inViewById
    },
    // Destructure the Object Entry of key, value (dropping the key)
    isInView ([, inView]) {
      return inView
    },
    pluckId ([i]) {
      return i
    },
    // Sort ascii to int (a to i) is a sort function
    // that properly sorts numbers when passed as strings.
    sortAtoi (a, b) {
      return Number(a) - Number(b)
    }
  }
})
</script>

<style>
* {
  box-sizing: border-box
}
html,
body {
  font-family: system-ui, BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  margin: 0;
}
#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 60px;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}
.list {
  width: 100%;
  list-style: none;
}
.item {
  padding: 4rem 1rem;
  width: 100%;
  background-color: whitesmoke;
  border-radius: 6px;
  margin: 1rem 0;
  display: flex;
  justify-content: center;
}
.ticker {
  position: fixed;
  /* top: 10vh;
  left: 10vw; */
  top: 3rem;
  left: 3rem;
  background-color: aliceblue;
  padding: 1rem;
  border-radius: 6px;
}
.ticker ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
.ticker li {
  padding: 0.5em;
}
.in-view-item {
  transition: all 0.3s;
  display: block;
}
.in-view-enter, .in-view-leave-to
/* .in-view-leave-active below version 2.1.8 */ {
  opacity: 0;
  transform: translateX(-30px);
}
.in-view-leave-active {
  position: absolute;
}
</style>
