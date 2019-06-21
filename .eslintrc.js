
module.exports = {
  root: true,
  env: {
    node: true
  },
  'extends': [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  // 这里可以进行自定义规则配置
  // key：规则代号
  // value：具体的限定方式
  //   "off" or 0 - 关闭规则
  //   "warn" or 1 - 将规则视为一个警告（不会影响退出码）,只警告，不会退出程序
  //   "error" or 2 - 将规则视为一个错误 (退出码为1)，报错并退出程序
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': ['error', {
      'anonymous': 'never',
      'named': 'never',
      'asyncArrow': 'never'
    }]
    // 'semi': ['error', 'always']
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
