module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": ['eslint:recommended', 'prettier'],
    "plugins": ['prettier'],
    "overrides": [
        {
            "env": {
                "node": true
            },
            "files": [
                ".eslintrc.{js,cjs}"
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    "rules": {
      'prettier/prettier': 'error',
      'no-console': 'off', // Разрешить использование console.log
      'indent': ['error', 2], // Использовать отступ в 2 пробела
    }
}
