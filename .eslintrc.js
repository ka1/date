module.exports = {
    "extends": ["eslint:recommended", "plugin:jest/recommended"],
    "rules": {
        "semi": ["error", "always"],
        "quotes": ["error", "double"]
    },
    "plugins": [
        "react",
        "jest"
    ],
    "parser": "babel-eslint",
    "env": {
        "jest": true
    }
};