// @ts-nocheck
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import fs from 'node:fs'

export default async function getData() {
  const firstResponse = await fetch(UNESCO_URL)
  let objA = await firstResponse.json()

  for (let offset = 100; offset < 1300; offset += 100) {
    const response = await fetch(`${UNESCO_URL}offset=${offset}`)

    let objB = await response.json()
    objA = deepMerge(objA, objB)

    console.log(offset / 100)
  }
  fs.writeFileSync('public/data/whc001.json', JSON.stringify(objA, null, 2), 'utf8')
}

// https://github.com/Hangga-hub/hangga-hub.github.io/blob/main/tools/json-merge-tool/script.js

/**
 * Deep merges two JSON objects. Properties in objB overwrite properties in objA.
 * Arrays are concatenated.
 * @param {Object|Array} objA - The first JSON object or array.
 * @param {Object|Array} objB - The second JSON object or array.
 * @returns {Object|Array} The merged JSON.
 */
function deepMerge(objA, objB) {
  // If both are arrays, concatenate them
  if (Array.isArray(objA) && Array.isArray(objB)) {
    return [...objA, ...objB]
  }

  // If both are objects, deep merge their properties
  if (
    typeof objA === 'object' &&
    objA !== null &&
    typeof objB === 'object' &&
    objB !== null &&
    !Array.isArray(objA) &&
    !Array.isArray(objB)
  ) {
    const merged = { ...objA } // Start with properties from A
    for (const key in objB) {
      if (Object.prototype.hasOwnProperty.call(objB, key)) {
        if (
          Object.prototype.hasOwnProperty.call(merged, key) &&
          typeof merged[key] === 'object' &&
          merged[key] !== null &&
          typeof objB[key] === 'object' &&
          objB[key] !== null
        ) {
          // Recursively merge if both are objects/arrays
          merged[key] = deepMerge(merged[key], objB[key])
        } else {
          // Otherwise, B's value overwrites A's value
          merged[key] = objB[key]
        }
      }
    }
    return merged
  }

  // If types are different or not mergeable (e.g., one is primitive, one is object),
  // B's value takes precedence.
  return objB
}
