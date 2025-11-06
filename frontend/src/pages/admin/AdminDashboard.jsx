import React, {useEffect, useState} from 'react'
import AdminStats from '../../components/admin/AdminStats'
import { fetchAdminPosts } from '../../api/adminApi'

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        today:0,
        pending:0,
        reports:0
    })

    useEffect(()=> {
        (async ()=> {
            try {
                const s = await fetchAdminPosts()
                setStats(s)
            } catch (error) {
                console.error('관리자 통계 불러오기 실패',error)
            }
        })()
    }, [])

    return <AdminStats {...stats}/>

}

export default AdminDashboard