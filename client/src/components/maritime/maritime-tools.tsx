import { Sun, Clock, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MaritimeTools() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Maritime Tools</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          data-testid="tool-weather"
        >
          <Sun className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Weather</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          data-testid="tool-laytime"
        >
          <Clock className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Laytime</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          data-testid="tool-distance"
        >
          <MapPin className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">Distance</div>
        </Button>
        <Button
          variant="outline"
          className="p-3 h-auto flex flex-col items-center space-y-1 border border-gray-200 hover:border-maritime-blue hover:bg-maritime-blue/5 transition-colors"
          data-testid="tool-cp-clauses"
        >
          <FileText className="w-5 h-5 text-gray-600" />
          <div className="text-xs font-medium text-gray-900">CP Clauses</div>
        </Button>
      </div>
    </div>
  );
}
