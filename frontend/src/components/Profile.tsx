'use client'

import { useState, useEffect } from 'react'
import { User, Edit, Save, X, Eye, EyeOff, AlertTriangle, Trash2, Shield, Mail, Phone, Calendar, Lock } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'

interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  role: string
  createdAt: string
}

interface ProfileProps {
  isOpen: boolean
  onClose: () => void
  user: UserProfile | null
  onUserUpdate: (updatedUser: UserProfile) => void
  onProfileRefresh?: () => void
}

export default function Profile({ isOpen, onClose, user, onUserUpdate, onProfileRefresh }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveProfile = async () => {
    if (!user) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedUser = await response.json()
        onUserUpdate(updatedUser)
        setIsEditing(false)
        setSuccess('Profile updated successfully!')
        setTimeout(() => setSuccess(''), 3000)
        if (onProfileRefresh) onProfileRefresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update profile')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!user) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/auth/users/${user.id}/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      })

      if (response.ok) {
        setSuccess('Password changed successfully!')
        setIsChangingPassword(false)
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setTimeout(() => setSuccess(''), 3000)
        if (onProfileRefresh) onProfileRefresh()
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to change password')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:3001/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({})
      })
      if (response.ok) {
        setSuccess('Account successfully deleted.')
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/'
        }, 4000)
        return
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to delete account')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !user) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed z-50 w-full max-w-md mx-auto left-1/2 transform -translate-x-1/2 top-20 sm:top-24">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                <p className="text-sm text-gray-500">{user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter first name"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.firstName || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter last name"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.lastName || 'Not provided'}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter email address"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.email}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.phone || 'Not provided'}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{formData.dateOfBirth ? new Date(formData.dateOfBirth).toLocaleDateString() : 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Security</h3>
                {!isChangingPassword ? (
                  <button
                    onClick={() => setIsChangingPassword(true)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Change Password</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleChangePassword}
                      disabled={loading}
                      className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Updating...' : 'Update'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false)
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                      }}
                      className="px-3 py-1.5 text-sm bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isChangingPassword && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showNewPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Account Deletion */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
              </div>
              <p className="text-sm text-gray-600">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="relative flex flex-col items-center mt-6">
                <Popover.Root open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                  <Popover.Trigger asChild>
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors mb-2 flex items-center justify-center gap-2 disabled:opacity-70"
                      disabled={loading}
                    >
                      Delete Account
                    </button>
                  </Popover.Trigger>
                  <Popover.Portal>
                    <Popover.Content
                      sideOffset={8}
                      align="center"
                      className="z-50 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center animate-fade-in border border-gray-200 w-80 max-w-[90vw] transition-all duration-200"
                    >
                      <h2 className="text-lg font-bold mb-2 text-center">Are you sure you want to delete your account?</h2>
                      <p className="text-sm text-gray-600 mb-6 text-center">This cannot be undone.</p>
                      {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
                      {success ? (
                        <div className="text-green-600 font-semibold text-center">Account successfully deleted</div>
                      ) : (
                        <>
                          <button
                            onClick={handleDeleteAccount}
                            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors mb-2 flex items-center justify-center gap-2 disabled:opacity-70"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <span className="inline-block animate-bounce-right">→</span>
                                Deleting...
                              </>
                            ) : (
                              'Delete Forever'
                            )}
                          </button>
                          <Popover.Close asChild>
                            <button
                              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg transition-colors"
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </Popover.Close>
                        </>
                      )}
                      <Popover.Arrow className="fill-white" />
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error message for save route not found */}
      {error && error.includes('404') && (
        <div className="mt-2 text-sm text-red-500 text-center">
          Could not save changes. The profile update route was not found. Please contact support.
        </div>
      )}
    </>
  )
}
