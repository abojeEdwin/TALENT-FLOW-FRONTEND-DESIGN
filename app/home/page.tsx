"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { useState } from "react";
import { 
  GraduationCap, 
  Users, 
  BarChart3, 
  Plug, 
  Award,
  ArrowRight,
  CheckCircle2,
  Play,
  UserCog,
  Menu,
  X
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTASection />
      <Footer />
    </div>
  );
}

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-3">
            <img 
              alt="TrailForge"
              loading="lazy"
              width="40"
              height="40"
              decoding="async"
              data-nimg="1"
              className="w-[40px] rounded-md dark:bg-background/90"
              src="/logo.png"
            />
            <h4 className="ml-2 text-2xl font-bold leading-5 text-foreground dark:text-white right2" style={{position: "relative"}}>TrailForge</h4>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Testimonials
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button 
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                Features
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                How It Works
              </Link>
              <Link href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                Testimonials
              </Link>
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/register" 
                className="inline-flex items-center justify-center gap-2 rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium text-foreground hover:bg-foreground/10"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <header className="relative h-[75vh] min-h-[560px] w-full overflow-hidden mt-16 rounded-3xl">
      <video 
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay 
        loop 
        muted 
        playsInline
      >
        <source src="/hero-Cover.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black/40"></div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
      <div className="relative z-10 flex h-full items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur px-4 py-1.5 text-sm font-medium mb-8">
            <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Now enrolling for Spring 2026
          </div>
          
          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl mb-6">
            Empower Your Team with{" "}
            <span className="text-white drop-shadow-lg">Modern Learning</span>
          </h1>
          
          <p className="mx-auto mt-4 max-w-3xl text-base text-zinc-200 sm:text-lg">
            Transform your workforce with TrailForge - the comprehensive learning 
            management system designed for modern organizations.
          </p>
          
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link 
              href="/auth/register" 
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button className="inline-flex items-center justify-center gap-2 rounded-md border border-white/20 bg-white/10 backdrop-blur px-8 py-3 text-lg font-semibold text-white hover:bg-white/20">
              <Play className="w-4 h-4" />
              Watch Demo
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function Features() {
  const features = [
    {
      icon: GraduationCap,
      title: "Expert-Led Courses",
      description: "Access courses created by industry experts with real-world experience.",
    },
    {
      icon: UserCog,
      title: "Team Management",
      description: "Admin easily manage learners, instructors, and track team progress.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Gain insights with comprehensive reporting and progress tracking.",
    },
    {
      icon: Users,
      title: "Cross-Functional Collaboration",
      description: "Enable seamless cross-functional collaboration across 50+ interns from diverse disciplines.",
    },
    {
      icon: Plug,
      title: "Integration",
      description: "The LMS integrates with external tools such as Zoom, Google Drive, Slack, and Email systems.",
    },
    {
      icon: Award,
      title: "Certifications",
      description: "Earn recognized certifications upon course completion.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-muted/50">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to enhance learning outcomes and streamline 
            your training programs.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-background rounded-xl p-6 border shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in minutes and set up your organization profile.",
    },
    {
      number: "02",
      title: "Add Your Team",
      description: "Invite learners and instructors to join your workspace.",
    },
    {
      number: "03",
      title: "Launch Programs",
      description: "Create courses and assign learning paths to your team.",
    },
    {
      number: "04",
      title: "Track Progress",
      description: "Monitor completion rates and generate detailed reports.",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Get Started in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple setup process to get your learning platform up and running quickly.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="text-6xl font-bold text-primary/10 mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 w-16 border-t-2 border-dashed border-border" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4:bg-[#1f2937]">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            Loved by Teams Everywhere
          </h2>
          <p className="text-lg text-gray-600 dark:text-white/70 max-w-2xl mx-auto">
            See what our customers have to say about their experience with TrailForge.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <blockquote className="transition-opacity duration-500 opacity-100">
            <p className="text-gray-700 dark:text-white/90 text-[1.05rem] leading-7 md:pr-8">"Since implementing TrailForge, we've reduced training costs by 40% while increasing intern productivity by 65%. The platform's seamless integration with our existing tools made onboarding effortless."</p>
            <div className="mt-4">
              <span className="font-semibold text-gray-900 dark:text-white">Chike Lazarus</span>
              <div className="text-sm text-gray-600 dark:text-white/70">CEO, NexusAcademy</div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <div className="bg-black rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <img 
            alt="waves" 
            fetchPriority="high" 
            decoding="async" 
            data-nimg="fill" 
            className="pointer-events-none select-none object-cover opacity-10" 
            src="https://firebasestorage.googleapis.com/v0/b/techx-57646.appspot.com/o/Assets%2Fimg%2Fwaves-white.svg?alt=media&token=a8ae5adf-0a53-4afa-86ff-5cce49638cb4"
            style={{position: "absolute", height: "100%", width: "100%", inset: "0px", color: "transparent"}}
          />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Team?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto mb-8">
              Join thousands of organizations already using TrailForge to power their 
              learning and development programs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register" 
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-8 py-3 text-base font-medium text-black hover:bg-white/90"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-md border-2 border-white px-8 py-3 text-base font-medium text-white hover:bg-white/10">
                Contact Sales
              </button>
            </div>
            <div className="flex items-center justify-center gap-8 mt-8 text-sm opacity-80">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                14-day free trial
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-12 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-3 mb-4">
              <img 
                alt="TrailForge"
                loading="lazy"
                width="40"
                height="40"
                decoding="async"
                data-nimg="1"
                className="w-[40px] rounded-md"
                src="/logo.png"
              />
              <h5 className="ml-2 text-2xl font-bold leading-5 text-foreground dark:text-white right2" style={{position: "relative"}}>TrailForge</h5>
            </Link>
            <p className="text-sm text-muted-foreground">
              
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground">Features</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground">How It Works</Link></li>
              <li><Link href="#testimonials" className="hover:text-foreground">Testimonials</Link></li>
              <li><Link href="#" className="hover:text-foreground">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">About Us</Link></li>
              <li><Link href="#" className="hover:text-foreground">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TrailForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
