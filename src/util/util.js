/**
 * 数组转换为对象
 * @param arr 要转换的数组
 * @param key 数组单项中要作为对象键的属性
 * @param value 数组单项中要作为对象值的属性，不传则默认整个单项为值
 */
 export function arrayToObject(arr, key, value) {
  if (!Array.isArray(arr) || !arr.length) {return {}}
  return arr.reduce((obj, item) => Object.assign(obj, {[item[key]]: value ? item[value] : item}), {})
}
