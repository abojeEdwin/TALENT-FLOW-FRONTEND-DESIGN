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
  X,
  Sparkles,
  Target,
  BookOpen
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <CoursesPreview />
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
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">TrailForge.</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Why TrailForge
            </Link>
            <Link href="#courses" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Explore courses
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </Link>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <Link 
              href="/auth/login" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2"
            >
              Learner demo
            </Link>
            <Link 
              href="/register" 
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
            >
              Explore learning
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button 
              className="p-2"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col space-y-4">
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                Why TrailForge
              </Link>
              <Link href="#courses" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                Explore courses
              </Link>
              <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground" onClick={() => setIsOpen(false)}>
                How it works
              </Link>
              <Link 
                href="/auth/login" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Learner demo
              </Link>
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground"
              >
                Explore learning
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
    <section className="relative mt-16 overflow-hidden bg-gradient-to-br from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/20 dark:via-teal-950/20 dark:to-green-950/20">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px] py-12 lg:py-20">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 dark:border-emerald-800 bg-white/80 dark:bg-emerald-950/50 backdrop-blur px-4 py-1.5 text-sm font-medium">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-900 dark:text-emerald-100">A LITTLE CURIOSITY. A LOT OF POSSIBILITY.</span>
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                TrailForge.
                <br />
                <span className="text-emerald-600 dark:text-emerald-400">Your next chapter.</span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-lg">
                Build real-world skills, one meaningful lesson at a time. A clearer path 
                from where you are to where you want to be.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link 
                href="/dashboard/learner/courses" 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-base font-semibold text-white transition-colors shadow-lg shadow-emerald-600/20"
              >
                Find your next course
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 px-6 py-3 text-base font-medium transition-colors">
                <Play className="w-4 h-4" />
                Take a look inside
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Learn at your pace
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Put your skills to work
              </span>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
              alt="Students collaborating" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Target,
      title: "A clear place to start",
      description: "Find courses that match your interests with a clear syllabus of what you'll learn.",
    },
    {
      icon: BarChart3,
      title: "Progress you can feel",
      description: "Pick up where you left off and turn small steps into steady momentum.",
    },
    {
      icon: BookOpen,
      title: "Room to really learn",
      description: "A focused backup experience that keeps the rest step within easy reach.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 lg:px-6">
      <div className="container mx-auto">
        <div className="mb-16">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">LESS FRICTION. MORE FORWARD.</p>
          <h2 className="text-3xl md:text-4xl font-bold max-w-xl">
            Learning that fits your life.
          </h2>
          <p className="text-lg text-muted-foreground mt-4 max-w-2xl">
            A thoughtful space to get curious, stay focused, and keep growing.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-xl font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CoursesPreview() {
  const courses = [
    {
      id: 1,
      title: "UI/UX Design Fundamentals",
      instructor: "Sarah Johnson",
      category: "Design",
      rating: 4.8,
      students: 1234,
      duration: "24 lessons",
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=600&q=80",
      level: "Beginner"
    },
    {
      id: 2,
      title: "Modern Web Development",
      instructor: "David Chen",
      category: "Development",
      rating: 4.9,
      students: 2156,
      duration: "32 lessons",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
      level: "Intermediate"
    },
    {
      id: 3,
      title: "Data Analytics Essentials",
      instructor: "Michael Adams",
      category: "Data & Analytics",
      rating: 4.7,
      students: 987,
      duration: "18 lectures",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      level: "Beginner"
    },
  ];

  const categories = ["All courses", "Design", "Development", "Data & Analytics"];

  return (
    <section id="courses" className="py-20 px-4 lg:px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-4">FOLLOW YOUR CURIOSITY</p>
            <h2 className="text-3xl md:text-4xl font-bold">
              What will you learn next?
            </h2>
            <p className="text-lg text-muted-foreground mt-2">
              A new perspective. A practical skill. A fresh beginning.
            </p>
          </div>
          <Link href="/dashboard/learner/courses" className="hidden md:flex items-center gap-2 text-emerald-600 font-medium hover:gap-3 transition-all">
            Browse all courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                idx === 0 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-white dark:bg-card border hover:border-emerald-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Link 
              key={course.id}
              href={`/dashboard/learner/courses/${course.id}`}
              className="group bg-white dark:bg-card rounded-xl overflow-hidden border hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                <div className="absolute top-3 left-3 px-2 py-1 bg-emerald-600 text-white text-xs font-medium rounded">
                  {course.level}
                </div>
                <img 
                  src={course.image} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-emerald-600 font-medium">{course.category}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500">★</span>
                    <span className="font-medium">{course.rating}</span>
                  </div>
                </div>
                <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{course.instructor}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t text-sm text-muted-foreground">
                  <span>{course.duration}</span>
                  <span>{course.students.toLocaleString()} students</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link href="/dashboard/learner/courses" className="inline-flex items-center gap-2 text-emerald-600 font-medium">
            Browse all courses
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-8 text-center">
          Featured courses are illustrated for UI design purposes.
        </p>
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
    <section id="how-it-works" className="py-20 px-4 lg:px-6">
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
              <div className="text-6xl font-bold text-emerald-100 dark:text-emerald-900/20 mb-4">
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
    <section id="testimonials" className="py-20 px-4 lg:px-6 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Loved by Teams Everywhere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See what our customers have to say about their experience with TrailForge.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto bg-white dark:bg-card rounded-2xl p-8 md:p-12 shadow-sm border">
          <blockquote className="space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">
              "Since implementing TrailForge, we've reduced training costs by 40% while increasing intern productivity by 65%. The platform's seamless integration with our existing tools made onboarding effortless."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center">
                <span className="text-emerald-600 font-semibold text-lg">CL</span>
              </div>
              <div>
                <div className="font-semibold">Chike Lazarus</div>
                <div className="text-sm text-muted-foreground">CEO, NexusAcademy</div>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 px-4 lg:px-6">
      <div className="container mx-auto">
        <div className="bg-emerald-600 rounded-2xl p-8 md:p-16 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 opacity-90" />
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Team?
            </h2>
            <p className="text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of organizations already using TrailForge to power their 
              learning and development programs.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register" 
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-8 py-3 text-base font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors shadow-lg"
              >
                Register Your Organisation
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white px-8 py-3 text-base font-medium text-white hover:bg-white/10 transition-colors">
                Contact Sales
              </button>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-sm opacity-90">
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
    <footer className="border-t py-12 px-4 lg:px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <GraduationCap className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold">TrailForge.</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Empowering teams through modern learning experiences.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link href="#courses" className="hover:text-foreground transition-colors">Courses</Link></li>
              <li><Link href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
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
