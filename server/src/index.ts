import express from 'express';
import jwt from "jsonwebtoken";
import z from "zod";
import bcrypt from "bcryptjs";
import { UserModel, ContentModel, ShareLinkModel, CoursesModel, CacheModel } from './model';
import { JWT_SECRET } from './config';
import { auth } from './middleware';
import cors from 'cors';
import { Mail } from './emailer';
import { v4 as UUID } from 'uuid';
import { EMBEDDING_URL, HF_TOKEN } from "./config";
import axios from "axios";
import mongoose from 'mongoose';
import { HfInference } from '@huggingface/inference';

const hf_token = HF_TOKEN
const embedding_url = EMBEDDING_URL
const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

let OTP: string = "";

function checkOTP(sent: string): boolean {
	if (sent === OTP) {
		return true;
	}
	return false;
}

async function expandShortPins(shortUrl: string) {
	try {
		const response = await fetch(shortUrl, { method: 'HEAD', redirect: 'follow' });
		const url = response.url;
		const code = url.split('/')[4];
		const finalUrl = "https://www.pinterest.com/pin/" + code;
		return finalUrl
	} catch (error) {
		return `Error: ${(error as Error).message}`;
	}
}

const hf = new HfInference(hf_token);

async function generate_embedding(text: string): Promise<number[] | null> {
	try {
		const result = await hf.featureExtraction({
			model: 'sentence-transformers/all-MiniLM-L6-v2',
			inputs: text,
			provider: "auto"
		});
		return result as number[];
	} catch (error) {
		console.error('Error generating embedding:', error);
		return null;
	}
}

app.get('/api/v1/', (req, res) => {
	res.send('Hello World!');
});

app.post('/obscured/please/stop/right/here', (req, res) => {
	const pypy = req.body.pypy;
	if (pypy) {
		res.status(200).json({
			id: "d61e7963c1c34dca864cc141c0968f04",
			secret: "358b4c8b62a34f85b779c388ed55dc50",
			message: "You are a good person, but you are not allowed to access this route, if somehow you found this route, please dont misuse this, this is for internal use only",
			actualCode: 200,
			funny: "yes this is how i handle codes, even though the server blows up, it will give 200 😃"
		})
		return;
	}
	res.status(403).json({
		message: "Unauthorized"
	})
})

app.get('/erp/api/v1/course', async (req, res) => {
	const courses = await CoursesModel.find({});
	res.status(200).json({
		courses: courses
	});
	return;
});

app.post('/erp/api/v1/getUserInfo', async (req, res) => {
	try {
		const requiredBody = z.object({
			token: z.string()
		})
		const parsedDataWithSuccess = requiredBody.safeParse(req.body);
		if (!parsedDataWithSuccess.success) {
			res.status(411).json({
				message: "Invalid input, provide valid token",
				error: parsedDataWithSuccess.error.issues
			});
			return;
		}
		const token = req.body.token;
		res.status(200).json({
			rollNumber: "22ME30085",
			password: "xyzhehe",
			questions: [
				"What is your name?",
				"What is your favourite color?",
				"What is your favourite food?"
			],
			answers: [
				"Harsh Gupta",
				"Blue",
				"Chicken Biryani"
			]
		});
		return;
	} catch (e) {
		res.status(200).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.post('/erp/api/v1/course', async (req, res) => {
	const requiredBody = z.object({
		courses: z.array(
			z.object({
				code: z.string(),
				name: z.string(),
			})
		)
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid courses",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const courses = req.body.courses;
	try {
		for (let i = 0; i < courses.length; i++) {
			const course = new CoursesModel({
				code: courses[i].code,
				name: courses[i].name
			});
			await course.save();
		}
		res.status(200).json({
			message: "Courses added successfully"
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.post('/api/v1/signup', async (req, res) => {
	const requiredBody = z.object({
		username: z
			.string()
			.min(3, "username must be atleast 3 characters long")
			.max(50, "username must be atmost 50 characters long"),
		password: z
			.string()
			.min(5, "password must be atleast 5 characters long")
			.max(50, "password must be atmost 50 characters long"),
		email: z
			.string()
			.email("Invalid email"),
		otp: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(200).json({
			message: "Invalid input, provide valid email, name and password",
			actualCode: 411,
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const username: string = req.body.username;
	const password: string = req.body.password;
	const email: string = req.body.email
	const otp: string = req.body.otp;
	if (!checkOTP(otp)) {
		res.status(200).json({
			message: "Invalid OTP",
			actualCode: 403
		});
		return;
	}
	const userExists = await UserModel.findOne({ username: username });
	if (userExists) {
		res.status(200).json({
			message: "User Already exists",
			actualCode: 403
		});
		return;
	}
	const emailExists = await UserModel.findOne({ email: email });
	if (emailExists) {
		res.status(200).json({
			message: "Email already exists",
			actualCode: 403
		});
		return;
	}
	try {
		const hashedPassword = await bcrypt.hash(password, 5);
		const initial = username[0].toUpperCase();
		const user = new UserModel({
			username: username,
			password: hashedPassword,
			email: email,
			initial: initial
		});
		await user.save();
		res.status(200).json({
			message: "Signed up successfully",
			actualCode: 200
		});
	} catch (e) {
		res.status(200).json({
			message: "Internal server error",
			actualCode: 500,
		})
	}
});

app.post('/api/v1/email', async (req, res) => {
	try {
		const requiredBody = z.object({
			emailAddress: z.string().email("Invalid email"),
			userName: z.string().min(3, "username must be atleast 3 characters long").max(50, "username must be atmost 50 characters long")
		})
		const parsedDataWithSuccess = requiredBody.safeParse(req.body);
		if (!parsedDataWithSuccess.success) {
			const majorIssue = (parsedDataWithSuccess.error.issues[0].message);
			res.status(200).json({
				message: majorIssue,
				actualCode: 411,
				error: parsedDataWithSuccess.error.issues
			});
			return;
		}
		const emailAddress: string = req.body.emailAddress;
		const userName: string = req.body.userName;
		const emailExists = await UserModel.findOne({ email: emailAddress });
		if (emailExists) {
			res.status(200).json({
				message: "Email already exists",
				actualCode: 403
			});
			return;
		}
		const otp = Math.floor(100000 + Math.random() * 900000).toString();
		const mail_res = await Mail({ emailAddress, userName, otp });
		OTP = otp;
		if (mail_res.error) {
			res.status(200).json({
				message: 'Failed to process email',
				email: "Mail not sent",
				actualCode: 500,
				error: mail_res.error
			});
			return;
		}
		res.status(200).json({
			message: "Email sent successfully",
			actualCode: 200
		});
	} catch (error) {
		console.error(error);
		res.status(200).json({
			message: 'Failed to process email',
			actualCode: 500,
			error: (error as Error).message
		});
		return;
	}
})

app.post('/api/v1/signin', async (req, res) => {
	const requiredBody = z.object({
		username: z.string(),
		password: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(200).json({
			message: "Invalid input, provide valid email, name and password",
			actualCode: 411,
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const username: string = req.body.username;
	const password: string = req.body.password
	const user = await UserModel.findOne({ username: username });
	if (!user) {
		res.status(200).json({
			message: "user does not exist",
			actualCode: 403
		});
		return;
	}
	try {
		const passwordMatch = await bcrypt.compare(password, user.password);
		if (!passwordMatch) {
			res.status(200).json({
				message: "Invalid password",
				actualCode: 403
			});
			return;
		}
		const token = jwt.sign({
			userid: user._id,
		}, JWT_SECRET, {
			expiresIn: "30d"
		});
		user.token = token;
		await user.save();
		res.status(200).json({
			message: "Signed in successfully",
			actualCode: 200,
			token: token
		});
	} catch (e) {
		res.status(200).json({
			message: "Internal server error",
			actualCode: 500,
			error: e
		});
		return;
	}
});

app.get('/api/v1/user', auth, async (req, res) => {
	const userid = req.body.userid;
	try {
		const user = await UserModel.findOne({ _id: userid });
		if (!user) {
			res.status(403).json({
				message: "User does not exist"
			});
			return;
		}
		res.status(200).json({
			username: user.username,
			share: user.share,
			shareLink: user.shareableLink,
			shareSome: user.shareSome,
			shareLinkSome: user.shareableLinkSome,
			initial: user.initial
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error"
		});
		return;
	}
});

app.post('/api/v1/content', auth, async (req, res) => {
	const requiredBody = z.object({
		content: z.string().optional(),
		title: z.string(),
		link: z.string().optional(),
		userid: z.string(),
		tags: z.array(z.string()).optional()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid content, title, link and userid",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	let titleContentAndTags = ""
	if (req.body.title) {
		titleContentAndTags += req.body.title + ".";
	}
	if (req.body.content) {
		titleContentAndTags += " " + req.body.content + ".";
	}
	const tags: string[] = req.body.tags;
	if (tags.length > 0) {
		tags.map((tag) => {
			titleContentAndTags += " This is related to " + tag + ".";
		})
	}
	console.log(titleContentAndTags);
	try {
		const embedding = await generate_embedding(titleContentAndTags);
		const content = req.body.content;
		const title = req.body.title;
		const link = req.body.link;
		const userid = req.body.userid;
		const tags = req.body.tags;
		const type = req.body.type;
		const date = {
			day: new Date().getDate(),
			month: new Date().getMonth() + 1,
			year: new Date().getFullYear()
		}
		const contentModel = new ContentModel({
			content: content,
			title: title,
			link: link,
			userId: userid,
			tags: tags,
			type: type,
			date: date,
			embedding: embedding
		});
		await contentModel.save();

		await CacheModel.deleteMany({
			userId: userid
		});

		res.status(200).json({
			content: contentModel,
			message: "Content saved successfully"
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.get('/api/v1/content', auth, async (req, res) => {
	const userid = req.body.userid;
	try {
		const contents = await ContentModel.find({ userId: userid }).populate("userId", "username");
		contents.map((content) => {
			content.embedding = [];
		})
		res.status(200).json({
			contents: contents
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.delete('/api/v1/content', auth, async (req, res) => {
	const requiredBody = z.object({
		contentId: z.string(),
		userid: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid contentId",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const contentId = req.body.contentId;
	const userid = req.body.userid;
	try {
		await ContentModel.deleteOne({ _id: contentId, userId: userid });
		await CacheModel.deleteMany({
			userId: userid
		});
		res.status(200).json({
			message: "Content deleted successfully"
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.delete('/api/v1/content/selected', auth, async (req, res) => {
	const requiredBody = z.object({
		contentIds: z.array(z.string()),
		userid: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid contentIds",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const contentIds = req.body.contentIds;
	const userid = req.body.userid;
	try {
		await ContentModel.deleteMany({ _id: { $in: contentIds }, userId: userid });
		await CacheModel.deleteMany({
			userId: userid
		});
		res.status(200).json({
			message: "Contents deleted successfully"
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.post('/api/v1/brain/share', auth, async (req, res) => {
	const requiredBody = z.object({
		share: z.boolean(),
		userid: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid share",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const share = req.body.share;
	const userid = req.body.userid;
	try {
		const user = await UserModel.findOne({ _id: userid });
		if (!user) {
			res.status(403).json({
				message: "User does not exist"
			});
			return;
		}
		user.share = share;
		await user.save();
		if (share) {
			const shortID = UUID();
			await ShareLinkModel.create({
				shortLink: shortID,
				userId: user._id
			});
			user.shareableLink = shortID;
			await user.save();
			res.status(200).json({
				message: "Share status updated successfully",
				shareableLink: user.shareableLink
			});
		} else {
			await ShareLinkModel.deleteOne({ shortLink: user.shareableLink, userId: user._id });
			user.shareableLink = "";
			await user.save();
			res.status(200).json({
				message: "Share status updated successfully"
			});
		}
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.get('/api/v1/brain/:shareLink', async (req, res) => {
	try {
		const shareLink = req.params.shareLink;
		const shareLinkExists = await ShareLinkModel.findOne({ shortLink: shareLink });
		if (!shareLinkExists) {
			res.status(403).json({
				message: "Link expired"
			});
			return;
		}
		const userid = shareLinkExists.userId;
		const user = await UserModel.findOne({ _id: userid })
		if (!user) {
			res.status(403).json({
				message: "Unauthorized"
			});
			return;
		}
		if (shareLink !== user.shareableLink) {
			res.status(403).json({
				message: "Link expired"
			});
			return;
		}
		if (!user.share) {
			res.status(404).json({
				message: "Share has been disabled"
			});
			return;
		}
		const contents = await ContentModel.find({ userId: userid });
		res.status(200).json({
			username: user.username,
			contents: contents
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.post('/api/v1/brain/share/selected', auth, async (req, res) => {
	const requiredBody = z.object({
		share: z.boolean(),
		contentids: z.array(z.string()),
		userid: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid share",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const share = req.body.share;
	const userid = req.body.userid;
	const contentids = req.body.contentids;
	try {
		const user = await UserModel.findOne({ _id: userid });
		if (!user) {
			res.status(403).json({
				message: "User does not exist"
			});
			return;
		}
		user.shareSome = share;
		await user.save();
		if (share) {
			const contents = await ContentModel.find({ _id: { $in: contentids } });
			if (!contents) {
				res.status(404).json({
					message: "Content does not exist"
				});
				return;
			}
			for (let i = 0; i < contents.length; i++) {
				if (contents[i]?.userId?.toString() !== userid) {
					res.status(403).json({
						message: "Unauthorized"
					});
					return;
				}
				contents[i].visibility = "public";
				await contents[i].save();
			}
			const shortID = UUID();
			await ShareLinkModel.create({
				shortLink: shortID,
				userId: user._id
			});
			user.shareableLinkSome = shortID;
			await user.save();
			res.status(200).json({
				message: "Share status updated successfully",
				shareableLink: user.shareableLinkSome
			});
		} else {
			await ShareLinkModel.deleteOne({ shortLink: user.shareableLinkSome, userId: user._id });
			user.shareableLinkSome = "";
			await user.save();
			const contents = await ContentModel.find({ visibility: "public", userId: userid });
			for (let i = 0; i < contents.length; i++) {
				contents[i].visibility = "private";
				await contents[i].save();
			}
			res.status(200).json({
				message: "Share status updated successfully"
			});
		}
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.get('/api/v1/brain/selected/:shareLink', async (req, res) => {
	try {
		const shareLink = req.params.shareLink;
		const shareLinkExists = await ShareLinkModel.findOne({ shortLink: shareLink });
		if (!shareLinkExists) {
			res.status(403).json({
				message: "Link expired"
			});
			return;
		}
		const userid = shareLinkExists.userId;
		const user = await UserModel.findOne({ _id: userid })
		if (!user) {
			res.status(403).json({
				message: "Unauthorized"
			});
			return;
		}
		if (shareLink !== user.shareableLinkSome) {
			res.status(403).json({
				message: "Link expired"
			});
			return;
		}
		if (!user.shareSome) {
			res.status(404).json({
				message: "Share has been disabled"
			});
			return;
		}
		const contents = await ContentModel.find({ userId: userid, visibility: "public" });
		res.status(200).json({
			username: user.username,
			contents: contents
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
});

app.post('/api/v1/brain/merge', auth, async (req, res) => {
	const requiredBody = z.object({
		contents: z.array(
			z.object({
				content: z.string(),
				title: z.string(),
				link: z.string(),
				tags: z.array(z.string()),
				userId: z.string(),
				type: z.string(),
				date: z.object({
					day: z.string(),
					month: z.string(),
					year: z.string()
				}),
				visibility: z.string()
			})
		),
		username: z.string(),
		userid: z.string()
	});
	const parsedDataWithSuccess = requiredBody.safeParse(req.body);
	if (!parsedDataWithSuccess.success) {
		res.status(411).json({
			message: "Invalid input, provide valid contents",
			error: parsedDataWithSuccess.error.issues
		});
		return;
	}
	const contents = req.body.contents;
	const userid = req.body.userid;
	try {
		const user = await UserModel.findOne({ _id: userid });
		if (!user) {
			res.status(403).json({
				message: "User does not exist"
			});
			return;
		}
		if (user.username === req.body.username) {
			res.status(403).json({
				message: "Cannot merge your own contents"
			});
			console.log("Cannot merge your own contents");
			return;
		}
		for (let i = 0; i < contents.length; i++) {
			const content = new ContentModel({
				content: contents[i].content,
				title: contents[i].title,
				link: contents[i].link,
				userId: userid,
				tags: contents[i].tags,
				type: contents[i].type,
				date: contents[i].date,
				visibility: contents[i].visibility,
				embedding: contents[i].embedding
			});
			await content.save();
		}
		await CacheModel.deleteMany({
			userId: userid
		});
		res.status(200).json({
			message: "Contents merged successfully"
		});
	} catch (e) {
		res.status(500).json({
			message: "Internal server error",
			error: e
		});
		return;
	}
}
);

app.get('/api/v1/expand/:shortUrl', async (req, res) => {
	const code: string = req.params.shortUrl;
	const shortUrl = "https://pin.it/" + code
	console.log(shortUrl);
	try {
		const expandedUrl = await expandShortPins(shortUrl);
		res.status(200).json({
			"message": "expanded",
			"url": expandedUrl,
			"actualCode": 200
		})
	} catch (e) {
		res.status(200).json({
			"message": "error",
			"eroor": e,
			"actualCode": 500
		})
	}
});

app.post('/api/v1/search/embedded', auth, async (req, res) => {
	const query: string = req.body.query;
	let filter: string = req.body.filter;
	if(filter === "links"){
		filter = "link";
	} else if(filter === "tweets"){
		filter = "tweet";
	}
	const userid: string = req.body.userid;
	let objectIdUserId = new mongoose.Types.ObjectId(userid);
	try {
		const cachekey = userid + "-" + query + "-" + filter;
		const checkCache = await CacheModel.findOne({
			key: cachekey,
			userId: userid
		});
		if (checkCache) {
			res.status(200).json({
				"actualCode": 200,
				"data": checkCache.content
			});
			return;
		}
		const embedding: number[] | null = await generate_embedding(query);
		if (!embedding) {
			return;
		}
		let results = await ContentModel.aggregate([
			{
				"$vectorSearch": {
					"queryVector": embedding,
					"path": "embedding",
					"numCandidates": 100,
					"limit": 100,
					"index": "vector_index"
				}
			},
			{
				'$project': {
					"embedding": 0
				}
			},
			{
				'$match' : {
					"userId": objectIdUserId
				}
			}
		]);
		if (filter !== "all" && filter !== "") {
			results = results.filter(item => !filter || item.type.toLowerCase() === filter.toLowerCase());
		}
		await CacheModel.findOneAndUpdate(
			{ key: cachekey, userId: userid },
			{ key: cachekey, userId: userid, content: results },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
		res.status(200).json({
			"actualCode": 200,
			"data": results
		});
	} catch (error) {
		res.status(200).json({
			"actualCode": 500,
			"error": error
		});
	}
})

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server is running on port ${PORT}`);
});
