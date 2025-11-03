const mongoose = require('mongoose')
const Post = require('../models/Post')
const User = require('../models/User')

    (async () => {
        await mongoose.connect(process.env.MONGO_URI)

        const posts = await Post.find({
            fileUrl: { $type: 'string' }
        }).select('_id fileUrl')

        for (const p of posts) {
            p.fileUrl = [p.fileUrl].filter(Boolean)
            if (!p.status) p.status = 'approved'
            await p.save()
        }

        await User.updateMany(
            { roles: { $exists: false } },
            {
                $set: { role: 'user', isActive: true },
                $setOnInsert: { failedLoginAttempts: 0 }
            }
        )
        console.log('Migration done')
        process.exit(0)
    })