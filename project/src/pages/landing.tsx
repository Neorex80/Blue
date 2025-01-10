import * as React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Sparkles, Brain, MessageSquare, Users, ArrowRight, Lock, Globe, Github, Linkedin, Zap, Shield, Workflow } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-32 h-32 mx-auto lg:mx-0 mb-8 transform-gpu"
                style={{
                  perspective: '1000px',
                  transformStyle: 'preserve-3d'
                }}
              >
                <motion.div
                  animate={{
                    rotateY: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    ease: "linear",
                    repeat: Infinity
                  }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 animate-pulse" />
                  <div className="absolute inset-[2px] rounded-3xl bg-black flex items-center justify-center">
                    <Bot className="w-16 h-16 text-blue-400" />
                  </div>
                  <div className="absolute -right-2 -top-2 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-6xl sm:text-7xl font-bold mb-6"
              >
                Meet <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">Blue</span>
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl text-gray-400 max-w-2xl mx-auto lg:mx-0 mb-12"
              >
                Your AI companion for meaningful conversations. Experience natural, intelligent chat powered by advanced language models.
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
              >
                <button
                  onClick={() => navigate('/auth')}
                  className="group relative inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition-colors text-lg font-medium overflow-hidden"
                >
                  <div className="absolute inset-0 w-3 bg-gradient-to-r from-white/0 via-white/20 to-white/0 skew-x-[-20deg] group-hover:animate-[shine_1s_ease-in-out_infinite]" />
                  <span>Get Started</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>
            </div>

            {/* Chat Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm p-4 shadow-2xl">
                <div className="absolute top-2 left-4 flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <div className="mt-6 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-600/10 text-blue-400 rounded-2xl rounded-tr-sm px-4 py-2 max-w-[80%]">
                      Hey Blue! Can you help me understand quantum computing?
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1, duration: 0.5 }}
                      className="bg-white/5 rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]"
                    >
                      I'd be happy to explain quantum computing! At its core, quantum computing leverages quantum mechanics principles like superposition and entanglement to perform computations...
                      <motion.div
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="inline-flex items-center h-4 space-x-1 ml-2"
                      >
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                        <div className="w-1 h-1 rounded-full bg-blue-400" />
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-600/10 via-transparent to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Why Choose Blue</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Experience the next generation of AI assistance with features designed for seamless interaction and powerful capabilities
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description: 'Get instant responses powered by cutting-edge AI technology',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: Brain,
                title: 'Intelligent Understanding',
                description: 'Advanced natural language processing for meaningful conversations',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Your conversations are protected with enterprise-grade security',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: Users,
                title: 'Custom Personas',
                description: 'Create and share AI personalities tailored to your needs',
                gradient: 'from-pink-500 to-rose-500'
              },
              {
                icon: Workflow,
                title: 'Seamless Integration',
                description: 'Works perfectly across all your devices and platforms',
                gradient: 'from-indigo-500 to-blue-500'
              },
              {
                icon: MessageSquare,
                title: 'Natural Dialogue',
                description: 'Engage in fluid conversations that feel truly human',
                gradient: 'from-purple-500 to-violet-500'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={item}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-75 blur-lg transition duration-300 group-hover:opacity-100"
                  style={{
                    backgroundImage: `linear-gradient(to right, ${feature.gradient})`
                  }}
                />
                <div className="relative bg-black border border-white/10 rounded-2xl p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
            <p className="text-gray-400">© {new Date().getFullYear()} Blue. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/Neorex80"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://www.linkedin.com/in/devrex/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}