const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    supportFile: false,
    video: true ,
    screenshotsFolder: 'cypress/screenshots',
    setupNodeEvents(on, config) {
      // Configurações e eventos personalizados
    },
  },
});