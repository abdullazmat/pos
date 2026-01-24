const path = require("path");

module.exports = {
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en", "pt"],
    localePath: path.resolve("./public/locales"),
  },
  ns: ["common", "errors", "messages", "pricing"],
  defaultNS: "common",
};
