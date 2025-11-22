import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database } from "lucide-react";

interface DatasetSelectorProps {
  datasets: Array<{ id: string; name: string; rowCount: number }>;
  selectedDataset: string | null;
  onSelectDataset: (id: string) => void;
}

export function DatasetSelector({
  datasets,
  selectedDataset,
  onSelectDataset,
}: DatasetSelectorProps) {
  if (datasets.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Database className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedDataset || undefined} onValueChange={onSelectDataset}>
        <SelectTrigger className="w-64" data-testid="select-dataset">
          <SelectValue placeholder="Select a dataset" />
        </SelectTrigger>
        <SelectContent>
          {datasets.map((dataset) => (
            <SelectItem key={dataset.id} value={dataset.id} data-testid={`option-dataset-${dataset.id}`}>
              <div className="flex flex-col">
                <span className="font-medium">{dataset.name}</span>
                <span className="text-xs text-muted-foreground">
                  {dataset.rowCount} rows
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
