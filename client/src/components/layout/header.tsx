import { Zap, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-maritime-blue rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">MaritimeAI</h1>
            </div>
            <nav className="hidden md:flex space-x-6 ml-8">
              <a 
                href="#" 
                className="text-maritime-blue font-medium border-b-2 border-maritime-blue pb-1"
                data-testid="nav-chat-assistant"
              >
                Chat Assistant
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-maritime-blue transition-colors"
                data-testid="nav-documents"
              >
                Documents
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-maritime-blue transition-colors"
                data-testid="nav-knowledge-base"
              >
                Knowledge Base
              </a>
              <a 
                href="#" 
                className="text-gray-600 hover:text-maritime-blue transition-colors"
                data-testid="nav-voyage-tools"
              >
                Voyage Tools
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-settings"
            >
              <Settings className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              data-testid="button-profile"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
