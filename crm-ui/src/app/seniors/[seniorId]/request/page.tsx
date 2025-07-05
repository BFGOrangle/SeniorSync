"use client"

import { useParams } from 'next/navigation'
import { SeniorChatbot } from '@/components/senior-chatbot'

export default function SeniorRequestPage() {
  const params = useParams()
  const seniorId = parseInt(params.seniorId as string)

  if (isNaN(seniorId)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Senior ID</h1>
          <p className="text-lg text-gray-600">Please check the URL and try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <SeniorChatbot seniorId={seniorId} />
        </div>
      </div>
    </div>
  )
}