"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Briefcase,
  FileText,
  Clock
} from "lucide-react";

export default function VendorApplicationPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    contactName: "",
    email: "",
    phone: "",
    address: "",
    serviceType: "",
    experience: "",
    description: "",
    availability: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      const response = await fetch('/api/vendor-application', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setIsSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit application. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Building2 className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">SeniorSync</span>
              <Badge variant="secondary" className="ml-2">For Vendors</Badge>
            </Link>
          </div>
        </header>

        {/* Success Message */}
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg mb-6">
              Thank you for your interest in joining the SeniorSync vendor network. 
              We&apos;ve received your application and will review it within 1-2 business days.
            </p>
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-blue-800 text-sm space-y-1 text-left">
                <li>• Our team will review your application</li>
                <li>• We may contact you for additional information</li>
                <li>• Upon approval, you&apos;ll receive onboarding instructions</li>
                <li>• You&apos;ll get access to your vendor dashboard</li>
              </ul>
            </div>
            <div className="space-y-4">
              <Button asChild className="w-full sm:w-auto">
                <Link href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Home
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SeniorSync</span>
            <Badge variant="secondary" className="ml-2">For Vendors</Badge>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Vendor Login
            </Button>
          </Link>
        </div>
      </header>

      {/* Application Form */}
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Apply to Become a Vendor
          </h1>
          <p className="text-gray-600 text-lg">
            Join our network of trusted care service providers and start connecting with seniors in your area.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Vendor Application Form
            </CardTitle>
            <CardDescription>
              Please provide the following information about your business and services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Business Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={formData.businessName}
                      onChange={(e) => handleInputChange("businessName", e.target.value)}
                      placeholder="Your business name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="serviceType">Type of Service *</Label>
                    <Input
                      id="serviceType"
                      value={formData.serviceType}
                      onChange={(e) => handleInputChange("serviceType", e.target.value)}
                      placeholder="e.g., Home Care, Transportation, Meal Delivery"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Business Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Full business address"
                    required
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Contact Information
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      placeholder="Primary contact person"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="contact@yourbusiness.com"
                    required
                  />
                </div>
              </div>

              {/* Service Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Service Details
                </h3>
                
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange("experience", e.target.value)}
                    placeholder="e.g., 5 years"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Service Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe the services you provide and what makes your business unique..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="availability">Availability *</Label>
                  <Textarea
                    id="availability"
                    value={formData.availability}
                    onChange={(e) => handleInputChange("availability", e.target.value)}
                    placeholder="Describe your availability (days, hours, service area)..."
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Terms Agreement */}
              <Alert>
                <AlertDescription>
                  By submitting this application, you agree to our terms of service and privacy policy. 
                  All information will be verified as part of our vendor onboarding process.
                </AlertDescription>
              </Alert>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700" 
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting Application..." : "Submit Application"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
