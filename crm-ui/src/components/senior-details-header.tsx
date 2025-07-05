"use client"

import { User, Phone, Mail, MapPin, Calendar, AlertCircle, Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSeniorDetails } from '@/hooks/use-senior-details'
import { seniorUtils } from '@/services/senior-api'

interface SeniorDetailsHeaderProps {
  seniorId: number
}

export function SeniorDetailsHeader({ seniorId }: SeniorDetailsHeaderProps) {
  const { senior, loading, error } = useSeniorDetails(seniorId)

  if (loading) {
    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600 mr-2" />
            <span className="text-lg text-gray-600">Loading senior details...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !senior) {
    return (
      <Card className="mb-6 bg-red-50 border-red-200">
        <CardContent className="p-6">
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <span className="text-lg font-medium">
              {error || 'Unable to load senior details'}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const age = seniorUtils.calculateAge(senior.dateOfBirth)
  const fullName = seniorUtils.getFullName(senior)

  return (
    <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 text-white rounded-full p-3">
              <User className="h-8 w-8" />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                {fullName}
              </h2>
              <p className="text-lg text-blue-600 font-medium">
                Logging request for yourself
              </p>
            </div>
          </div>

          {age && (
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Age {age}
            </Badge>
          )}
        </div>

        {/* Senior Details Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {senior.contactPhone && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Phone className="h-5 w-5 text-blue-600" />
              <span className="text-base font-medium">{senior.contactPhone}</span>
            </div>
          )}

          {senior.contactEmail && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-base font-medium">{senior.contactEmail}</span>
            </div>
          )}

          {senior.dateOfBirth && (
            <div className="flex items-center space-x-2 text-gray-700">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-base font-medium">
                {seniorUtils.formatDate(senior.dateOfBirth)}
              </span>
            </div>
          )}

          {senior.address && (
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="h-5 w-5 text-blue-600" />
              <span className="text-base font-medium line-clamp-1" title={senior.address}>
                {senior.address}
              </span>
            </div>
          )}
        </div>

        {/* Confirmation Message */}
        <div className="mt-4 p-4 bg-blue-100 rounded-lg border-l-4 border-blue-600">
          <p className="text-lg font-medium text-blue-800">
            ✓ Please confirm this is you before proceeding with your request
          </p>
        </div>
      </CardContent>
    </Card>
  )
}