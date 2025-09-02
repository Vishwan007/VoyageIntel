import { Zap } from "lucide-react";
import { Link, useLocation } from "wouter";
import { AuthDropdown } from "@/components/auth/auth-dropdown";
import { SettingsDropdown } from "@/components/settings/settings-dropdown";
import { ThemeToggle } from "@/components/theme/theme-toggle";


export default function Header() {
  const [location] = useLocation();

  const handleNavClick = (section: string) => {
    // All sections are now functional, no toast needed for implemented features
    return;
  };

  const handleDocumentsClick = () => {
    window.location.href = '/documents';
  };

  const handleVoyageToolsClick = () => {
    window.location.href = '/voyage-tools';
  };

  // Settings and profile are now handled by their respective dropdown components

  return (
    <header className="bg-background shadow-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-maritime-blue rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">MaritimeAI</h1>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <Link 
                href="/"
                className={`transition-colors cursor-pointer ${
                  location === '/' || location.startsWith('/chat') 
                    ? 'text-maritime-blue font-medium border-b-2 border-maritime-blue pb-1'
                    : 'text-muted-foreground hover:text-maritime-blue'
                }`}
                data-testid="nav-chat-assistant"
              >
                Chat Assistant
              </Link>

              <Link 
                href="/knowledge-base"
                className={`transition-colors cursor-pointer ${
                  location === '/knowledge-base' 
                    ? 'text-maritime-blue font-medium border-b-2 border-maritime-blue pb-1'
                    : 'text-muted-foreground hover:text-maritime-blue'
                }`}
                data-testid="nav-knowledge-base"
              >
                Knowledge Base
              </Link>
              <Link 
                href="/voyage-tools"
                className={`transition-colors cursor-pointer ${
                  location === '/voyage-tools' 
                    ? 'text-maritime-blue font-medium border-b-2 border-maritime-blue pb-1'
                    : 'text-muted-foreground hover:text-maritime-blue'
                }`}
                data-testid="nav-voyage-tools"
              >
                Voyage Tools
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <SettingsDropdown />
            <AuthDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
