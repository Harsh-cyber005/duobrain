import { EMBEDDING_URL, HF_TOKEN } from "./config";
import { ContentModel } from "./model";
import axios from "axios";

const query = "business";
const embedding_url = EMBEDDING_URL;
const hf_token = HF_TOKEN;

async function generate_embedding(text:string) : Promise<number[] | null> {
    try {
        const response = await axios.post(embedding_url, {
            inputs: text
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

const HandleAdvancedSearch = async () => {
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
        console.error('Error performing search:' , error);
    }
}

HandleAdvancedSearch();