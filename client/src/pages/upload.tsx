import { FileUpload } from "@/components/file-upload";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Calendar, Table } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Upload() {
  const queryClient = useQueryClient();
  const { data: datasets = [] } = useQuery<any[]>({
    queryKey: ["/api/datasets"],
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/datasets"] });
    queryClient.invalidateQueries({ queryKey: ["/api/datasets", undefined] });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Upload Data Files</h1>
        <p className="text-muted-foreground">
          Import your Excel or CSV files for analysis and visualization
        </p>
      </div>

      <FileUpload onUploadSuccess={handleUploadSuccess} />

      {datasets.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Uploaded Datasets</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {datasets.map((dataset: any) => (
              <Card key={dataset.id} className="hover-elevate transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-base truncate" data-testid={`text-dataset-name-${dataset.id}`}>
                          {dataset.name}
                        </CardTitle>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex-shrink-0">
                      {dataset.rowCount} rows
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Table className="h-4 w-4" />
                    <span>{dataset.columnCount} columns</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(dataset.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
