<template>
  <NavBar class="navbar" />
  <h1>You did it!</h1>
  <p style="height: 1000px">
    Visit <a href="https://vuejs.org/" target="_blank" rel="noopener">vuejs.org</a> to read the
    documentation
  </p>
  <Footer class="footer" />
</template>

<style scoped>
* {
  font-family: Arial, sans-serif;
}
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
}
.footer {
  position: relative;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
