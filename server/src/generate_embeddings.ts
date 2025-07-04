import { EMBEDDING_URL, HF_TOKEN } from "./config";
import axios from "axios";

const hf_token = HF_TOKEN
const embedding_url = EMBEDDING_URL

async function generate_embedding(text:string) : Promise<number[] | null> {
    console.log(text);
    try {
        const response = await axios.post(embedding_url, {
            inputs: text,
            sentences: text
        }, {
            headers: {
                'Authorization': `Bearer ${hf_token}`
            }
        });
        if (response.status !== 200) {
            throw new Error(`Request failed with status code ${response.status}: ${response.data}`);
        }
        return response.data as number[];
    } catch (error) {
        console.error('Error generating embedding:', error);
        return null;
    }
}

const HandleAdvancedSearch = async (req: Request, res: Response) => {
    const query:string = req.body.query;
    try {
        const embedding: number[] | null = await generate_embedding(query);
        if (!embedding) {
            return;
        }
        const results = await ContentModel.aggregate([
            {
                "$vectorSearch": {
                    "queryVector": embedding,
                    "path": "embedding",
                    "numCandidates": 3,
                    "limit": 3,
                    "index": "vector_index"
                }
            },
            {
                '$project': {
                    "_id": 1,
                    "title": 1,
                    "content": 1,
                    "link": 1
                }
            }
        ]);
        console.log(results)
    } catch (error) {
        console.error('Error performing search:', error);
    }
}

const HandleAutoSearch = async (req: Request, res: Response) => {
    const { query, dbClient } = req.body;

    const db = dbClient?.db('sample_mflix');
    const collection = db?.collection('movies');

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const autopipeline = [
            {
                '$search': {
                    'index': 'default',
                    'autocomplete': {
                        'query': query,
                        'path': 'title',
                        'tokenOrder': 'sequential',
                    }
                },
            },
            {
                '$project': {
                    "_id": 1,
                    "title": 1,
                    "poster": 1,
                }
            },
            {
                '$limit': 10
            }
        ]
        const arr = await collection.aggregate(autopipeline).toArray();

        const response = arr.map((doc: { title: string; poster: string; _id: string }) => ({
            title: doc.title,
            poster: doc.poster,
            id: doc._id
        }));

        res.send(response);
    }
    catch (error) {
        console.error('Error performing search:');
        res.status(500).json({ error: (error as Error).message });
    }
}

import { Request, Response } from 'express';
import { ContentModel } from "./model";

const HandleBasicSearch = async (req: Request, res: Response) => {
    const { query, dbClient } = req.body;

    const db = dbClient?.db('sample_mflix');
    const collection = db?.collection('movies');

    if (!query) {
        return res.status(400).json({ error: 'Query is required' });
    }

    try {
        const pipelinefuzzy = [
            {
                '$search': {
                    'index': 'fuzzy_search',
                    'text': {
                        'query': query,
                        'path': ['title'],
                        'fuzzy': {
                            'maxEdits': 2,
                            'prefixLength': 3,
                        }
                    }
                },
            },
            {
                '$project': {
                    "_id": 1,
                    "title": 1,
                    "poster": 1,
                }
            },
            {
                '$limit': 1000
            }
        ]
        const arr = await collection.aggregate(pipelinefuzzy).toArray();

        const response = arr.map((doc: { title: string; poster: string; _id: string }) => ({
            title: doc.title,
            poster: doc.poster,
            id: doc._id
        }));

        res.send(response);
    }
    catch (error) {
        console.error('Error performing search:');
        res.status(500).json({ error: (error as Error).message });
    }
}

module.exports = {
    HandleAdvancedSearch,
    HandleAutoSearch,
    HandleBasicSearch
}