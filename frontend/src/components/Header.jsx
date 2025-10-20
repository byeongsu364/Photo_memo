import React from 'react'
import { useNavigate, NavLink, Link } from 'react-router-dom'

const Header = ({
    isAuthed,
    user,
    onLogout
}) => {

    const navigate = useNavigate()
    const handleLogout=async()=>{
        if(!window.confirm('정말 로그아웃 하시겠어요?')) return

        try {
            await onLogout()
        } catch (error) {
            
        }
    }

    return (
        <div>
            <button className='btn logout' onClick={handleLogout}>로그아웃</button>
        </div>
    )
}

export default Header