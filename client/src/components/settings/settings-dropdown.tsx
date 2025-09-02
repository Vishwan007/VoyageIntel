import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useToast } from "@/hooks/use-toast";

export function SettingsDropdown() {
  const { toast } = useToast();

  const handleChatSettings = () => {
    toast({
      title: "Chat Settings",
      description: "Additional chat settings coming soon!",
    });
  };

  const handleNotifications = () => {
    toast({
      title: "Notifications",
      description: "Notification settings coming soon!",
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="w-9 px-0" data-testid="button-settings">
          <Settings className="h-5 w-5" />
          <span className="sr-only">Settings</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuItem className="flex justify-between items-center cursor-default">
          <span>Theme</span>
          <ThemeToggle />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Chatbot Settings</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleChatSettings}>
          <span>Chat Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleNotifications}>
          <span>Notifications</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}