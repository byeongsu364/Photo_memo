const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const User = require("../models/User")

function makeToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
            email: user.email
        },

        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    )
}

router.post("/register", async (req, res) => {
    try {
        const { email, password, displayName, role } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "이메일/비밀번호 필요" })
        }

        const exists = await User.findOne({
            email: email.toLowerCase()
        })

        if (exists) {
            return res.status(400).json({ message: "이미 가입된 이메일 입니다." })
        }

        const passwordHash = await bcrypt.hash(password, 10)

        const validRoles = ["user", "admin"]
        const safeRole = validRoles.includes(role) ? role : "user"

        const user = await User.create({
            email,
            displayName,
            passwordHash,
            role: safeRole
        })

        res.status(201).json({ user: user.toSafeJSON() })

    } catch (error) {
        return res.status(500).json({
            message: "회원가입 실패..",
            error: error.message
        })
    }
})

router.post("/login", async (req, res) => {
    try {
        // 1) req.body에서 email, password를 꺼낸다(기본값은 빈 문자열).
        const { email, password } = req.body

        // 2) 이메일을 소문자로 바꿔 활성화된 유저만 조회
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true })

        if (!user) {
            return res.status(200).json({ message: "이메일이 올바르지 않습니다." })
        }

        // 3) 비밀번호 확인
        const ok = await user.comparePassword(password)
        if (!ok) {
            user.loginAttempts += 1

            if (user.loginAttempts >= 5) {
                user.isActive = false
                await user.save()
                return res.status(403).json({ message: "비밀번호 5회 이상 틀려 계정이 비활성화되었습니다." })
            }

            await user.save()
            return res.status(400).json({
                message: `비밀번호가 올바르지 않습니다. (${user.loginAttempts}회 실패, 5회 초과 시 계정 잠금)`
            })
        }

        user.loginAttempts = 0
        user.lastLoginAt = new Date()
        await user.save()

        // 4) 로그인 성공 시 DB 업데이트
        const updated = await User.findByIdAndUpdate(
            user._id,
            {
                $set: {
                    isLoggined: true
                }
            },
            { new: true }
        )

        if (!updated) return res.status(200).json({ message: "로그인 상태 갱신 실패" })

        // 5) JWT 토큰 발급
        const token = makeToken(updated)

        res.cookie('token', token, {
            httpOnly: true, //보안 강화
            sameSite: "lax",
            secure: "production", //https 환경
            maxAge: 7 * 24 * 60 * 1000 //7일
        })

        return res.status(200).json({
            user: updated.toSafeJSON(),
            token
        })

    } catch (error) {
        console.error(err)
        res.status(500).json({
            message: "로그인 실패",
            error: error.message
        })
    }
})

router.get("/me", async (req, res) => {
    try {
        const h = req.headers.authorization || ""

        const token = h.startsWith("Bearer") ? h.slice(7) : null

        if (!token) return res.status(401).json({ message: "인증 필요" })

        const payload = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(payload.id)

        if (!user) return res.status(404).json({ message: "사용자 없음" })

        res.status(200).json(user.toSafeJSON())

    } catch (error) {
        res.status(401).json({ message: "토큰 무효", error: error.message })
    }
})


module.exports = router