"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Users, 
  Clock, 
  Shield, 
  Smartphone, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Building2,
  Phone,
  Mail
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: <Heart className="h-6 w-6 text-rose-500" />,
      title: "Compassionate Care Management",
      description: "Connect with seniors who need your services through our intelligent request matching system."
    },
    {
      icon: <Users className="h-6 w-6 text-blue-500" />,
      title: "Growing Senior Community",
      description: "Access a dedicated network of seniors and their families actively seeking care services."
    },
    {
      icon: <Clock className="h-6 w-6 text-green-500" />,
      title: "Real-time Request Handling",
      description: "Receive and respond to service requests instantly with our streamlined communication platform."
    },
    {
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      title: "Verified & Secure",
      description: "All interactions are secure and verified, ensuring trust between vendors and seniors."
    },
    {
      icon: <Smartphone className="h-6 w-6 text-orange-500" />,
      title: "Mobile-First Experience",
      description: "Manage your vendor profile and respond to requests on-the-go with our responsive platform."
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-indigo-500" />,
      title: "Business Efficiency",
      description: "Improve service operations and boost efficiency through tailored workflows."
    }
  ];

  const benefits = [
    "Direct access to seniors needing care services",
    "Automated request matching based on your specialties",
    "Secure payment processing and invoicing",
    "Customer review and rating system",
    "Marketing tools to showcase your services",
    "24/7 support for vendors"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">SeniorSync</span>
            <Badge variant="secondary" className="ml-2">For Vendors</Badge>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" size="sm">
                Vendor Login
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            Join Our Vendor Network
          </Badge>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Connect with Seniors Who Need
            <span className="text-blue-600 block">Your Care Services</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            SeniorSync is the premier platform connecting qualified care service vendors 
            with seniors and their families. Join our network and help make a difference 
            while growing your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/vendor-application">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3">
                Get Started as a Vendor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Free to join • No setup fees • Start receiving requests today
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose SeniorSync?
            </h2>
            <p className="text-gray-600 text-lg">
              Everything you need to succeed as a senior care service provider
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="mb-2">{feature.icon}</div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-gray-600 mb-8 text-lg">
                Join hundreds of verified vendors who are already using SeniorSync 
                to connect with seniors and grow their care service businesses.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-600 mb-6">
                Join our vendor network today and start connecting with seniors 
                who need your services.
              </p>
              <Link href="/vendor-application">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 mb-4">
                  Apply to Become a Vendor
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <p className="text-sm text-gray-500 text-center">
                Application review typically takes 1-2 business days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join SeniorSync today and start connecting with seniors who need your care services. 
            It&apos;s free to get started and takes less than 5 minutes to set up your profile.
          </p>
          <Link href="/vendor-application">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
              Get Started Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-6 w-6 text-blue-400" />
                <span className="text-xl font-bold">SeniorSync</span>
              </div>
              <p className="text-gray-400">
                Connecting seniors with trusted care service providers.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Vendors</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Vendor Login</li>
                <li>Apply to Join</li>
                <li>Success Stories</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Documentation</li>
                <li>Best Practices</li>
                <li>Community</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>vendors@seniorsync.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>1-800-SENIORS</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 SeniorSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
