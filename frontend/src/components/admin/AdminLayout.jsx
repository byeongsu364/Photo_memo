import React from 'react'
import {Oultet} from 'react-router-dom'
import AdminNav from './AdminNav'

const AdminLayout = () => {
  return (
    <div>
        <AdminNav />
        <main>
            <Oultet />
        </main>
    </div>
  )
}

export default AdminLayout