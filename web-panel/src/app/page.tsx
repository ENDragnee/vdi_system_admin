'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield, BarChart3, Zap, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { ThemeSwitcher } from '@/components/theme-switcher';

const features = [
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Monitor CPU, RAM, storage, and network usage in real-time with intuitive charts and graphs.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  {
    icon: Shield,
    title: 'Secure Access',
    description: 'Enterprise-grade security with encrypted connections and role-based access control.',
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-500 dark:text-green-400',
  },
  {
    icon: Zap,
    title: 'Instant Alerts',
    description: 'Get notified immediately when resource usage exceeds thresholds or issues occur.',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-500 dark:text-amber-400',
  },
  {
    icon: Server,
    title: 'Multi-Instance Management',
    description: 'Manage multiple virtual desktop instances from a single, unified interface.',
    gradient: 'from-purple-500/20 to-pink-500/20',
    iconColor: 'text-purple-500 dark:text-purple-400',
  },
  {
    icon: Activity,
    title: 'Historical Data',
    description: 'Track performance trends over time with comprehensive historical metrics.',
    gradient: 'from-cyan-500/20 to-blue-500/20',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
  },
  {
    icon: CheckCircle,
    title: 'Status Monitoring',
    description: 'Keep track of instance status and health with automatic status detection.',
    gradient: 'from-red-500/20 to-pink-500/20',
    iconColor: 'text-red-500 dark:text-red-400',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 dark:from-background dark:via-background dark:to-primary/5">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 dark:bg-background/50 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                <Server className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">VDS Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeSwitcher />
              <Link href="/auth">
                <Button variant="ghost" className="text-foreground/70 hover:text-foreground hover:bg-muted transition-all">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth">
                <Button className="bg-gradient-to-r from-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 dark:bg-primary/5 rounded-full blur-3xl animate-pulse duration-8"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 dark:bg-accent/5 rounded-full blur-3xl animate-pulse duration-8 delay-4"></div>
          </div>

          <div className="relative max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-primary/20 border border-primary/30 rounded-full px-4 py-2 mb-8 animate-fadeIn">
              <Activity className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Real-time Monitoring</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight animate-fadeIn animation-delay-100">
              Manage Your Virtual Desktops
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                With Confidence
              </span>
            </h1>

            <p className="text-xl text-foreground/70 mb-12 max-w-3xl mx-auto leading-relaxed animate-fadeIn animation-delay-200">
              Monitor resource usage, track performance metrics, and manage your virtual desktop infrastructure
              from a single, powerful dashboard. Built for performance, designed for scale.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn animation-delay-300">
              <Link href="/admin">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-xl hover:shadow-primary/40 text-lg px-8 transition-all duration-300 group">
                  Start Monitoring
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="text-lg px-8 border-primary/30 hover:bg-primary/10 transition-all duration-300">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30 dark:bg-primary/5">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need to Monitor VDS
              </h2>
              <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
                Powerful features to keep your virtual desktops running smoothly and efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={index}
                    className="group relative overflow-hidden"
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 100}ms forwards`,
                      opacity: 0,
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

                    <Card className="relative bg-card/80 dark:bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 group-hover:shadow-xl dark:group-hover:shadow-primary/10 h-full">
                      <CardHeader>
                        <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                        </div>
                        <CardTitle className="text-foreground group-hover:text-primary transition-colors">{feature.title}</CardTitle>
                        <CardDescription className="text-foreground/70">
                          {feature.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 dark:from-primary/10 dark:to-accent/10"></div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
              Join administrators worldwide who are monitoring and managing their virtual desktop infrastructure with confidence using VDS Admin.
            </p>
            <Link href="/admin">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-2xl hover:shadow-primary/40 text-lg px-10 transition-all duration-300 group">
                Get Started Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/20 dark:bg-primary/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-foreground/60">
            <p>&copy; 2025 VDS Admin. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }
      `}</style>
    </div>
  );
}
