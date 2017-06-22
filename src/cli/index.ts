"use strict"

import * as Promise from 'bluebird'

import sanitize from './sanitizer'

import Compare from '../compare'
import isDirectory from '../utilities/is-directory'

import { Duplex } from 'stream'

import { optionsInterface, environmentsInterface } from '../screenshot/interfaces'

import Screenshot from '../screenshot'
import Validator from './validator'
import Sanitizer from './sanitizer'

/**
 * Handle CLI Screenshots
 * 
 * @param {string[]} rawEnvironments 
 * @param {optionsInterface} options
 */
export function handleScreenshots(rawEnvironments: string[], options: optionsInterface): Duplex {

    const validator: Validator = new Validator(rawEnvironments)
    if (!validator.valid) {
        // Handle error bag
        console.log(validator.bag)
        process.exit(1)
    }

    const sanitizer: Sanitizer = new Sanitizer(rawEnvironments)
    const screenshot: Screenshot = new Screenshot(sanitizer.sanitized, options)

    return screenshot.capture()
}

/**
 * Handle CLI Comparison
 * 
 * @param {string} original 
 * @param {string} comparison 
 * @param {optionsInterface} options
 */
export function handleCompare(original: string, comparison: string, options: optionsInterface): any {

    // Url or file path?
    // if (original & comparison are filepaths) {
        // stream the file paths to compare
    // }

    const compare: Compare = new Compare(options)

    const screenshot = handleScreenshots([
        `original=${original}`,
        `comparison=${comparison}`
    ], options)

    screenshot.pipe(compare)

}