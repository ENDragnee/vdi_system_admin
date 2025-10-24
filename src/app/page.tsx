import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, Shield, BarChart3, Zap, CheckCircle, Activity } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">VDS Admin</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth?view=signin">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth?view=signup">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-950/50 border border-blue-800 rounded-full px-4 py-2 mb-8">
              <Activity className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Real-time Monitoring</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Manage Your Virtual Desktops
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-cyan-400">
                With Confidence
              </span>
            </h1>
            <p className="text-xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Monitor resource usage, track performance metrics, and manage your virtual desktop infrastructure
              from a single, powerful dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                  Start Monitoring
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need to Monitor VDS
              </h2>
              <p className="text-slate-400 text-lg">
                Powerful features to keep your virtual desktops running smoothly
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-4">
                    <BarChart3 className="w-6 h-6 text-blue-400" />
                  </div>
                  <CardTitle className="text-white">Real-time Analytics</CardTitle>
                  <CardDescription className="text-slate-400">
                    Monitor CPU, RAM, storage, and network usage in real-time with intuitive charts and graphs.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                  <CardTitle className="text-white">Secure Access</CardTitle>
                  <CardDescription className="text-slate-400">
                    Enterprise-grade security with encrypted connections and role-based access control.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-amber-600/10 rounded-lg flex items-center justify-center mb-4">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <CardTitle className="text-white">Instant Alerts</CardTitle>
                  <CardDescription className="text-slate-400">
                    Get notified immediately when resource usage exceeds thresholds or issues occur.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-purple-600/10 rounded-lg flex items-center justify-center mb-4">
                    <Server className="w-6 h-6 text-purple-400" />
                  </div>
                  <CardTitle className="text-white">Multi-Instance Management</CardTitle>
                  <CardDescription className="text-slate-400">
                    Manage multiple virtual desktop instances from a single, unified interface.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-cyan-600/10 rounded-lg flex items-center justify-center mb-4">
                    <Activity className="w-6 h-6 text-cyan-400" />
                  </div>
                  <CardTitle className="text-white">Historical Data</CardTitle>
                  <CardDescription className="text-slate-400">
                    Track performance trends over time with comprehensive historical metrics.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 backdrop-blur">
                <CardHeader>
                  <div className="w-12 h-12 bg-rose-600/10 rounded-lg flex items-center justify-center mb-4">
                    <CheckCircle className="w-6 h-6 text-rose-400" />
                  </div>
                  <CardTitle className="text-white">Status Monitoring</CardTitle>
                  <CardDescription className="text-slate-400">
                    Keep track of instance status and health with automatic status detection.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Take Control?
            </h2>
            <p className="text-xl text-slate-400 mb-8">
              Join thousands of administrators monitoring their virtual desktop infrastructure with VDS Admin.
            </p>
            <Link href="/auth?view=signup">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Get Started Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-slate-400">
            <p>&copy; 2025 VDS Admin. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
