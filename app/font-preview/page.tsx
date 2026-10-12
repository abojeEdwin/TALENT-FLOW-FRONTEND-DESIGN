"use client";

import { Inter, Plus_Jakarta_Sans, DM_Sans, Outfit, Manrope, Space_Grotesk, Sora } from 'next/font/google';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp } from 'lucide-react';
import { useState } from 'react';

// Load all fonts
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });

const fonts = [
  {
    name: 'Inter',
    variable: inter.variable,
    description: 'Designed for UI/screens. Used by Notion, GitHub, Vercel',
    recommended: true,
  },
  {
    name: 'Plus Jakarta Sans',
    variable: plusJakarta.variable,
    description: 'Geometric, approachable, excellent for educational content',
    recommended: true,
  },
  {
    name: 'DM Sans',
    variable: dmSans.variable,
    description: 'Professional, clean, geometric sans-serif',
    recommended: false,
  },
  {
    name: 'Outfit',
    variable: outfit.variable,
    description: 'Modern with rounded corners, friendly appearance',
    recommended: false,
  },
  {
    name: 'Manrope',
    variable: manrope.variable,
    description: 'Modern grotesque with open forms, balanced',
    recommended: false,
  },
  {
    name: 'Space Grotesk',
    variable: spaceGrotesk.variable,
    description: 'Bold geometric, great for headings',
    recommended: false,
  },
  {
    name: 'Sora',
    variable: sora.variable,
    description: 'Contemporary, works well for headings',
    recommended: false,
  },
];

export default function FontPreviewPage() {
  const [selectedFont, setSelectedFont] = useState('Inter');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Font Preview - TrailForge LMS</h1>
          <p className="text-lg text-muted-foreground">
            Compare different fonts in real UI context. Click on any font card to see it applied to sample content below.
          </p>
        </div>

        {/* Font Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {fonts.map((font) => (
            <Card
              key={font.name}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedFont === font.name ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedFont(font.name)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {font.name}
                      {font.recommended && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-normal">
                          Recommended
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{font.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`space-y-2 ${font.variable} font-sans`}>
                  <p className="text-2xl font-bold">TrailForge LMS</p>
                  <p className="text-base">The quick brown fox jumps over the lazy dog</p>
                  <p className="text-sm text-muted-foreground">
                    Modern learning management for teams
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Preview Section */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">
            Live Preview: {selectedFont}
          </h2>

          <div
            className={`space-y-6 ${
              fonts.find((f) => f.name === selectedFont)?.variable
            } font-sans`}
          >
            {/* Dashboard Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Admin Dashboard</CardTitle>
                <p className="text-muted-foreground">Platform overview and management</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">Total Users</span>
                    </div>
                    <p className="text-3xl font-bold">2,815</p>
                    <p className="text-sm text-green-600">+12% from last month</p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm font-medium">Active Courses</span>
                    </div>
                    <p className="text-3xl font-bold">156</p>
                    <p className="text-sm text-green-600">+8 this month</p>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm font-medium">Enrollments</span>
                    </div>
                    <p className="text-3xl font-bold">3,204</p>
                    <p className="text-sm text-green-600">+2.4% this week</p>
                  </div>
                </div>

                {/* Content Preview */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Course Content Example</h3>
                  <div className="space-y-2">
                    <h4 className="text-lg font-semibold">
                      Introduction to Web Development
                    </h4>
                    <p className="text-base leading-relaxed">
                      Learn the fundamentals of web development including HTML, CSS, and JavaScript.
                      This comprehensive course covers everything from basic syntax to advanced concepts
                      like responsive design and modern frameworks.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Duration: 12 weeks • Difficulty: Beginner • Instructor: Sarah Johnson
                    </p>
                  </div>
                </div>

                {/* Button Examples */}
                <div className="flex flex-wrap gap-3">
                  <Button>Primary Action</Button>
                  <Button variant="outline">Secondary Action</Button>
                  <Button variant="ghost">Ghost Button</Button>
                </div>

                {/* Table Preview */}
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Student Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Course</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Progress</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr>
                        <td className="px-4 py-3 font-medium">John Smith</td>
                        <td className="px-4 py-3 text-muted-foreground">Web Development</td>
                        <td className="px-4 py-3">75%</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Emily Davis</td>
                        <td className="px-4 py-3 text-muted-foreground">Data Science</td>
                        <td className="px-4 py-3">45%</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            In Progress
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 font-medium">Michael Chen</td>
                        <td className="px-4 py-3 text-muted-foreground">UX Design</td>
                        <td className="px-4 py-3">100%</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Typography Scale */}
                <div className="space-y-3 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Typography Scale</h3>
                  <p className="text-4xl font-bold">Heading 1 - Large Display</p>
                  <p className="text-3xl font-bold">Heading 2 - Page Title</p>
                  <p className="text-2xl font-bold">Heading 3 - Section Title</p>
                  <p className="text-xl font-semibold">Heading 4 - Card Title</p>
                  <p className="text-lg font-semibold">Heading 5 - Subsection</p>
                  <p className="text-base">Body Text - Regular paragraph with normal weight</p>
                  <p className="text-sm text-muted-foreground">
                    Small Text - Captions, metadata, secondary information
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Extra Small - Timestamps, labels, fine print
                  </p>
                </div>

                {/* Number Display */}
                <div className="space-y-2 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Numbers & Data</h3>
                  <div className="flex gap-8">
                    <div>
                      <p className="text-5xl font-bold">12,345</p>
                      <p className="text-sm text-muted-foreground">Large Numbers</p>
                    </div>
                    <div>
                      <p className="text-3xl font-semibold">$45.99</p>
                      <p className="text-sm text-muted-foreground">Currency</p>
                    </div>
                    <div>
                      <p className="text-2xl font-medium">98.7%</p>
                      <p className="text-sm text-muted-foreground">Percentages</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Instructions */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-2">How to use this preview:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Click on any font card above to see it applied to the sample content</li>
              <li>Pay attention to readability at different sizes</li>
              <li>Consider how numbers and data look</li>
              <li>Check if headings have good hierarchy and distinction</li>
              <li>Once you've chosen, let me know and I'll implement it in the application</li>
            </ol>
          </CardContent>
        </Card>

        {/* Back to App */}
        <div className="text-center pb-8">
          <Button asChild variant="outline">
            <a href="/dashboard">← Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
