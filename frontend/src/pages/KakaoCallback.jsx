import React, {useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {fetchMe, saveAuthToStorage} from '../api/client'

const KakaoCallback = ({onAuythed}) => {
    const navigate= useNavigate()

    useEffect(() => {
        //1
        const params = new URLSearchParams(window.location.search)
        const token = params.get("token")

        //2
        if (!token) {
            navigate("/admin/login?error=kakao", {replace:true})
            return
        } 

        //3
        saveAuthToStorage({token})

        (async()=>{
            try {
                const me = await fetchMe()

                saveAuthToStorage({user:me, token})

                onAuythed?.({user:me, token})

                if(me.role === "admin"){
                    navigate("/admin/dashboard", {replace:true})
                } else {
                    navigate("/user/dashboard", {replace:true})
                }
            } catch (error) {
                console.error("KakaoCallback error", error)
                navigate("/admin/login?error=kakao", {replace:true})
            }
        })()
    }, [navigate, onAuythed])

    return (
        <div>
            <p>카카오 로그인 처리중입니다...</p>
        </div>
    )
}

export default KakaoCallback