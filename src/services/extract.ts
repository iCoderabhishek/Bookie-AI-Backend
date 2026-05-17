import * as cheerio from 'cheerio'
import type { Extracted } from '../types/index.js'


const extract = async (url: string): Promise<Extracted> => {
    return {
        title: "title",
        text: "text",
        candidateImages: []
    }
}

export default extract
