import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const features = [
    {
        icon: "🚀",
        title: "AI-Powered Writing",
        desc: "Get intelligent suggestions, grammar checks, and creative prompts to enhance your writing flow.",
    },
    {
        icon: "🎨",
        title: "Rich Media Support",
        desc: "Embed images, videos, interactive elements, and custom code blocks in your blog posts.",
    },
    {
        icon: "💬",
        title: "Community Engagement",
        desc: "Foster discussions with comments, reactions, and collaborative features.",
    },
];

const blogCategories = [
    "Tech & Innovation", "Creative Writing", "Lifestyle", "Business", "Travel", "Food", "Health", "Fashion"
];

const testimonials = [
    {
        name: "Alex Rivera",
        role: "Tech Blogger",
        quote: "The AI writing assistant helped me increase my productivity by 300%. My readers love the interactive content!",
        avatar: "👨‍💻"
    },
    {
        name: "Maya Chen",
        role: "Lifestyle Influencer",
        quote: "Finally, a platform that understands creative bloggers. The analytics helped me grow my audience to 50K+ followers.",
        avatar: "👩‍🎨"
    },
    {
        name: "David Kim",
        role: "Food Blogger",
        quote: "The rich media support is incredible. I can showcase my recipes with videos, interactive elements, and beautiful galleries.",
        avatar: "👨‍🍳"
    },
];

const stats = [
    { number: "50K+", label: "Active Writers" },
    { number: "2M+", label: "Blog Posts Published" },
    { number: "15M+", label: "Monthly Readers" },
    { number: "$2M+", label: "Writer Earnings" },
];

const animatedQuotes = [
    {
        text: "Words have the power to change minds, inspire action, and create lasting impact.",
        author: "Maya Angelou"
    },
    {
        text: "There is no greater agony than bearing an untold story inside you.",
        author: "Maya Angelou"
    },
    {
        text: "Fill your paper with the breathings of your heart.",
        author: "William Wordsworth"
    },
    {
        text: "The art of writing is the art of discovering what you believe.",
        author: "Gustave Flaubert"
    },
    {
        text: "Start writing, no matter what. The water does not flow until the faucet is turned on.",
        author: "Louis L'Amour"
    }
];

export default function LandingPage() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [currentQuote, setCurrentQuote] = useState(0);

    useEffect(() => {
        setIsVisible(true);

        const testimonialInterval = setInterval(() => {
            setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        }, 5000);

        const categoryInterval = setInterval(() => {
            setCurrentCategory((prev) => (prev + 1) % blogCategories.length);
        }, 2000);

        const quoteInterval = setInterval(() => {
            setCurrentQuote((prev) => (prev + 1) % animatedQuotes.length);
        }, 4000);

        return () => {
            clearInterval(testimonialInterval);
            clearInterval(categoryInterval);
            clearInterval(quoteInterval);
        };
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="floating-stars"></div>
                <div className="floating-particles"></div>
                <div className="floating-code"></div>
            </div>

            {/* Navigation */}
            <nav className="relative z-10 flex justify-between items-center p-6 text-white">
                <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    BlogCraft Pro
                </div>
                <div className="hidden md:flex space-x-8">
                    <a href="#features" className="hover:text-purple-300 transition-colors">Features</a>
                    <a href="#community" className="hover:text-purple-300 transition-colors">Community</a>
                    <a href="#about" className="hover:text-purple-300 transition-colors">About</a>
                </div>
                <div className="flex items-center space-x-4">
                    <Link to="/login" className="px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-pink-500 hover:to-indigo-500 transition-all duration-300 shadow-lg">
                        Login
                    </Link>
                    <Link to="/register" className="px-5 py-2 rounded-full font-semibold bg-gradient-to-r from-pink-500 to-yellow-500 hover:from-yellow-500 hover:to-pink-500 transition-all duration-300 shadow-lg">
                        Register
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center text-white px-4">
                <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
                    <div className="mb-6">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-slate-900 px-4 py-2 rounded-full text-sm font-semibold animate-pulse">
                            ✨ New: AI Writing Assistant
                        </span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-bold mb-6">
                        <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent animate-gradient">
                            The Future of
                        </span>
                        <br />
                        <span className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient-reverse">
                            Blog Writing
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
                        Transform your ideas into engaging content with AI-powered tools, stunning visuals, and a community of innovative writers.
                        Build your audience, monetize your passion, and create content that matters.
                    </p>

                    {/* Dynamic category display */}
                    <div className="mb-8">
                        <p className="text-lg text-gray-400 mb-2">Perfect for</p>
                        <div className="text-2xl font-bold text-purple-300 animate-fade-in-out">
                            {blogCategories[currentCategory]}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                        <Link
                            to="/register"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-pulse text-center"
                        >
                            Start Writing Free
                        </Link>
                    </div>
                </div>

                {/* Floating elements */}
                <div className="absolute right-10 top-1/4 animate-float">
                    <div className="text-4xl">💻</div>
                </div>
                <div className="absolute left-10 bottom-1/4 animate-float-delayed">
                    <div className="text-3xl">📱</div>
                </div>
                <div className="absolute right-1/4 top-1/3 animate-float-slow">
                    <div className="text-2xl">🎯</div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative z-10 py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">
                        <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Everything You Need to Succeed
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={feature.title}
                                className={`bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-500 hover:scale-105 hover:shadow-2xl ${isVisible ? 'animate-slide-up' : 'opacity-0 translate-y-20'
                                    }`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="text-4xl mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                                <p className="text-gray-300 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Animated Quotes Section */}
            <section id="community" className="relative z-10 py-20 px-4">
                <div className="max-w-5xl mx-auto text-center">
                    <div className="flex flex-col items-center justify-center min-h-[180px]">
                        <div
                            key={currentQuote}
                            className="transition-opacity duration-1000 ease-in-out opacity-100 animate-fade-quote"
                            style={{ minHeight: 120 }}
                        >
                            <p className="text-2xl md:text-3xl text-purple-100 italic mb-4">
                                "{animatedQuotes[currentQuote].text}"
                            </p>
                            <p className="text-lg text-purple-300 font-semibold">
                                - {animatedQuotes[currentQuote].author}
                            </p>
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes fade-quote {
                        0% { opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        100% { opacity: 0; }
                    }
                    .animate-fade-quote {
                        animation: fade-quote 4s linear;
                    }
                `}</style>
            </section>

            {/* CTA Section */}
            <section className="relative z-10 py-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
                        Ready to Start Your Blogging Journey?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                        Join thousands of creative bloggers who are already creating amazing content with BlogCraft Pro.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/register"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 px-12 py-6 rounded-full text-xl font-bold hover:scale-110 hover:shadow-2xl transition-all duration-300 animate-bounce text-center"
                        >
                            Start Writing Free
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="relative z-10 py-12 px-4 text-center text-gray-400">
                <p>&copy; 2025 BlogCraft Pro. Empowering the next generation of content creators.</p>
            </footer>

            <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
        .animate-gradient-reverse {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite reverse;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
        .animate-float-slow {
          animation: float 4s ease-in-out infinite 2s;
        }
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }
        @keyframes fade-in-out {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        .animate-fade-in-out {
          animation: fade-in-out 2s ease-in-out infinite;
        }
        .floating-stars {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #eee, transparent),
            radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
            radial-gradient(1px 1px at 90px 40px, #fff, transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent),
            radial-gradient(2px 2px at 160px 30px, #ddd, transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: sparkle 20s linear infinite;
        }
        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 50px 50px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 150px 150px, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 250px 100px, rgba(255,255,255,0.4), transparent);
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: float-particles 15s linear infinite;
        }
        .floating-code {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(1px 1px at 100px 200px, rgba(147,51,234,0.3), transparent),
            radial-gradient(1px 1px at 300px 400px, rgba(236,72,153,0.2), transparent),
            radial-gradient(1px 1px at 500px 300px, rgba(147,51,234,0.4), transparent);
          background-repeat: repeat;
          background-size: 400px 400px;
          animation: float-code 25s linear infinite;
        }
        @keyframes sparkle {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-100px); }
        }
        @keyframes float-particles {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-300px) rotate(360deg); }
        }
        @keyframes float-code {
          0% { transform: translateY(0px) rotate(0deg); }
          100% { transform: translateY(-400px) rotate(-360deg); }
        }
      `}</style>
        </div>
    );
} 