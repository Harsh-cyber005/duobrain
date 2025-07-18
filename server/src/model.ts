import mongoose from "mongoose";
import { MONGO_URL } from "./config";

const Schema = mongoose.Schema;
const model = mongoose.model;

try {
    mongoose.connect(MONGO_URL);
    console.log('Connected to MongoDB');
} catch (error) {
    console.log(error);
}

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    initial: {
        type: String,
    },
    token: {
        type: String
    },
    share:{
        type: Boolean,
        default: false
    },
    shareSome:{
        type: Boolean,
        default: false
    },
    shareableLink:{
        type: String,
        default: ""
    },
    shareableLinkSome:{
        type: String,
        default: ""
    }
});

const ContentSchema = new Schema({
    type: {
        type: String,
        enum: ["document", "tweet", "youtube", "link", "instagram", "pinterest"],
        required: true
    },
    link: {
        type: String
    },
    title: {
        type: String,
        required: true
    },
    tags: {
        type: Array(String)
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
    content: {
        type: String,
    },
    visibility:{
        type: String,
        enum: ["public", "private"],
        default: "private"
    },
    embedding: {
        type: Array,
        required: true
    },
    date: {
        type: {
            day: { type: String, required: true },
            month: { type: String, required: true },
            year: { type: String, required: true }
        },
        default: {
            day: new Date().getDate().toString(),
            month: (new Date().getMonth() + 1).toString(),
            year: new Date().getFullYear().toString()
        }
    }
})

const ShareLinkSchema = new Schema({
    shortLink: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true
    },
});

const CoursesSchema = new Schema({
    code: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});

const CacheSchema = new Schema({
    key: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    content: {
        type: Array,
        required: true
    }
});

export const UserModel = model('User', UserSchema);
export const ContentModel = model('Content', ContentSchema);
export const ShareLinkModel = model('ShareLink', ShareLinkSchema);
export const CoursesModel = model('Courses', CoursesSchema);
export const CacheModel = model('Cache', CacheSchema);