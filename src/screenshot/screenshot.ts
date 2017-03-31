"use strict"

import * as ora from 'ora'
import * as path from 'path'
import * as fileSystem from 'fs'
import * as Promise from 'bluebird'
const fs: any = Promise.promisifyAll(fileSystem)

import Phantom from './phantom'
import chunk from '../utilities/chunk'
import CapturerInterface from './capturer-interface'

import {environmentsInterface} from '../cli/environments-interface'

export default class Screenshot {

    /**
     * Screenshot environments
     * @type {environmentsInterface}
     */
    environments: environmentsInterface

    /**
     * Capturer
     * @type {CapturerInterface}
     */
    capturer: CapturerInterface

    /**
     * Output base path
     * @type {string}
     */
    base: string

    /**
     * Screenshot constructor
     * 
     * @param {environmentsInterface} environments 
     * @param {string} base
     */
    constructor(environments: environmentsInterface, base: string = process.cwd()) { 
        this.environments = environments;
        this.capturer = new Phantom(environments)
        this.base = base;
    }

    /**
     * Initialize the screenshot process
     * 
     * @param  {string|string[]} paths
     * @return {Promise<environmentsInterface>}
     */
    run(paths: string|string[]) : Promise<environmentsInterface> {
        if (typeof paths === 'string') {
            // TODO: Handle the json/yaml file assigning the paths
            paths = []
        }

        let chunkedPaths: string[][] = chunk(paths, 6)

        const spinner = ora(`Capturing paths 🏞`).start()
        return this.multiScreenshot(chunkedPaths)
            .then(() => spinner.succeed('Paths captured successfully'))
            .catch((error: string) => spinner.fail(error.message));
    }

    /**
     * Screenshot multiple chunked paths
     * 
     * @param  {string[][]} chunkedPaths
     * @return {Promise<any>}
     */
    protected multiScreenshot(chunkedPaths: string[][]): Promise<any> {
        return Promise.map(chunkedPaths, (chunk: string[], index: number) => {
            return this.screenshot(chunk, index)
        }, {concurrency: 6})
    }

    /**
     * Screenshot an individual chunk
     * 
     * @param  {string[]} chunk
     * @param  {number} index
     * @return {Promise<environmentsInterface>}
     */
    protected screenshot(chunk: string[], index: number): Promise<environmentsInterface> {
        let filename: string = path.resolve(this.base, `chunk-${index}.json`);

        return this.writeChunkFile(filename, chunk)
                .then((chunkFilename: string) => this.screenshotChunk(filename))
                .then((chunkFilename: string) => this.removeChunk(filename))
    }

    /**
     * Write the chunk to a temporary json file
     * 
     * @param  {string} filename
     * @param  {string[]} chunk
     * @return {Promise<string>}
     */
    protected writeChunkFile(filename: string, chunk: string[]): Promise<string> {
        return fs.writeFileAsync(filename, JSON.stringify(chunk)).then(() => filename)
    }

    /**
     * Run the chunk through the capturer
     * 
     * @param  {string} chunkFilename
     * @return {Promise<string>}
     */
    protected screenshotChunk(chunkFilename: string): Promise<string> {
        let chunkQueue: Promise<any>[] = []
        let environments: string[] = Object.keys(this.environments)

        for (var i = environments.length - 1; i >= 0; i--) {
            chunkQueue.push(
                this.capturer.capture(chunkFilename, environments[i])
            )
        }

        return Promise.join(...chunkQueue).then(() => chunkFilename)
    }

    /**
     * Remove the temporary chunk json file
     * 
     * @param  {string} chunkFilename
     * @return {Promise<environmentsInterface>}
     */
    protected removeChunk(chunkFilename: string): Promise<any> {
        return fs.unlinkAsync(chunkFilename)
    }

}