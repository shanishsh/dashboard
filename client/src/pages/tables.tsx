import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table";
import { DatasetSelector } from "@/components/dataset-selector";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Loader2 } from "lucide-react";

export default function Tables() {
  const [selectedDataset, setSelectedDataset] = useState<string | null>(null);

  const { data: datasets = [], isLoading: datasetsLoading } = useQuery<any[]>({
    queryKey: ["/api/datasets"],
  });

  useEffect(() => {
    if (datasets.length > 0 && !selectedDataset) {
      setSelectedDataset(datasets[0].id);
    }
  }, [datasets, selectedDataset]);

  const { data: currentData, isLoading: dataLoading } = useQuery({
    queryKey: ["/api/datasets", selectedDataset],
    enabled: !!selectedDataset,
  });

  if (datasetsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center p-6">
        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Upload className="h-12 w-12 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Upload your Excel or CSV files to view and explore your data in interactive tables.
        </p>
        <Button asChild size="lg" data-testid="button-go-to-upload">
          <Link href="/upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Files
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Data Tables</h1>
          <p className="text-muted-foreground">
            Browse and search your uploaded datasets
          </p>
        </div>
        <DatasetSelector
          datasets={datasets}
          selectedDataset={selectedDataset}
          onSelectDataset={setSelectedDataset}
        />
      </div>

      {!selectedDataset ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground mb-4">
              Select a dataset to view table data
            </p>
          </CardContent>
        </Card>
      ) : dataLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : currentData ? (
        <DataTable
          data={currentData.data}
          columns={currentData.columns}
          title={currentData.name}
        />
      ) : null}
    </div>
  );
}
