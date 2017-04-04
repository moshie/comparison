"use strict"

import * as Promise from 'bluebird'

import sanitize from './sanitizer'

import Compare from '../compare/compare'
import Screenshot from '../screenshot/screenshot'
import {optionsInterface} from './options-interface'
import {environmentsInterface} from './environments-interface'
import directoriesExistIn from '../utilities/directories-exist-in'

import Crawler from '../crawl/site-crawler'

export function handleScreenshots(rawEnvironments: string[], options: optionsInterface): any {
	const environments: environmentsInterface = sanitize(rawEnvironments)
	const crawler = new Crawler(environments[Object.keys(environments)[0]], { concurrent: 10 })
	//const screenshot = new Screenshot(environments, options.directory)

	crawler.on('data', (data) => {
		console.log(data.toString())
	})


	// TODO: Works However could benefit from speed improvement
	// 
	// const capture = new Screenshot(environments, options.directory)
	// const crawler = new Crawler(environments)
	// const operation = options.paths ? capture.run(options.paths) : crawler.crawl().then((paths: string[]) => capture.run(paths))

	// return operation.catch((error: any) => console.log(error)) // TODO(David): Create error handler function
}

export function handleCompare(original: string, comparison: string, options: optionsInterface): Promise<any> {

	// TODO: Implement directoriesExistIn!
	if (directoriesExistIn(options.directory || process.cwd(), original, comparison)) {
		return (new Compare(original, comparison, options.directory)).run()
	}

	let environments: string[] = [`original=${original}`, `comparison=${comparison}`]

	return handleScreenshots(environments, options)
		.then((environments: environmentsInterface) => {
			console.log('Started');
			return handleCompare('original', 'comparison', options)
		})
		.catch((error: any) => console.log(error)) // TODO(David): Create error handler function
}