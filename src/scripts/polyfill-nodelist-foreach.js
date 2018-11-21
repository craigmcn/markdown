/* Solution for IE11 SCRIPT438:Object doesn't support property or method 'forEach'
 * https://tips.tutorialhorizon.com/2017/01/06/object-doesnt-support-property-or-method-foreach/ */
;(function() {
  if (typeof NodeList.prototype.forEach === 'function') return false
  NodeList.prototype.forEach = Array.prototype.forEach
})()
