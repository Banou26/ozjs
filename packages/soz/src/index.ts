import { CSSTag } from './css/index'
import { placeholderRegex, matchSelectorRulesets } from './utils'

const regex = /^([^\S\r\n]*)(?:(?:([@()#\-.a-zA-Z0-9 ]*)[^\S\r\n]*\n)|(.*))/
const gRegex = new RegExp(regex, 'gm')
const strictWhitespaceRegex = /[^\S\r\n]*/
const propertyNameRegex = /[a-zA-Z0-9-]*/
const selectorRegex = /[@()#\-.a-zA-Z0-9 ]*/
const unnestedAtRule = ['@charset', '@import', '@namespace']

const makeCSS = ({ indent, str, childs }, { selector: selectorPrefix = '' } = {}) => {
  str = str.trim()
  const isAtRule = str.startsWith('@')
  if (unnestedAtRule.some(atRule => str.startsWith(atRule))) {
    return `${str};`
  } else if (childs.length) {
    const selectorRulesets = matchSelectorRulesets(str)
    const selector =
      isAtRule
        ? str
        : selectorRulesets.length > 1
          ? selectorRulesets
              .map(str =>
                str.includes('&')
                // todo @banou26: make `any` and `matches` work on any browsers
                  ? str.replace('&', `:-webkit-any(${selectorPrefix})`)
                  : `${selectorPrefix ? `:-webkit-any(${selectorPrefix})` : selectorPrefix} ${str}`)
              .join(',')
              .trim()
          : selectorRulesets[0].includes('&')
              ? selectorRulesets[0].replace('&', `${selectorPrefix}`)
              : `${selectorPrefix ? `${selectorPrefix}` : selectorPrefix} ${selectorRulesets[0]}`
    return `${
      selector
    }{${
      childs
      .filter(({childs}) => !childs.length || isAtRule)
      .map(node => makeCSS(node))
      .join('')
    }}${
      isAtRule
        ? ''
        : childs
          .filter(({childs}) => childs.length)
          .map(node => makeCSS(node, { selector }))
          .join('')
    }`
  } else if (isAtRule) {
    return str
  } else {
    const propertyName = str.match(propertyNameRegex)[0]
    const rest = str.slice(propertyName.length + 1).trim()
    const propertyValue = rest.startsWith(':') ? rest.slice(1) : rest
    return `${propertyName}:${propertyValue.trim()};`
  }
}

const hierarchise = (childs, item, lastChild = childs?.[childs?.length - 1]) =>
  lastChild?.multiline ||
  item.indent > lastChild?.indent || 0
    ? hierarchise(lastChild.childs, item)
    : childs.push(item)

const sozToCSS = str =>
  str
    .split('\n')
    .filter(str => str.trim().length)
    .map(_str => {
      const indent = _str.match(strictWhitespaceRegex)[0].length
      const str = _str.slice(indent)
      return {
        indent,
        str,
        childs: []
      }
    })
    .reduce((arr, item) => (hierarchise(arr, item), arr), [])
    .map(item => makeCSS(item))
    .join('')

export const soz = CSSTag(sozToCSS)
