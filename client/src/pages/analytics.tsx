import { useQuery } from "@tanstack/react-query";
import { DatasetSelector } from "@/components/dataset-selector";
import { SalesLineChart, SalesBarChart, SalesPieChart } from "@/components/charts";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload, Loader2 } from "lucide-react";

export default function Analytics() {
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

  const chartData = useMemo(() => {
    if (!currentData?.data || currentData.data.length === 0) {
      return {
        lineData: [],
        barData: [],
        pieData: [],
        territoryData: [],
      };
    }

    const data = currentData.data;

    const dateGroups: Record<string, number> = {};
    data.forEach((row: any) => {
      const date = row.OrderDate || row.ModifiedDate || row.Date;
      if (date) {
        const dateKey = new Date(date).toLocaleDateString();
        const value = row.TotalDue || row.SubTotal || row.LineTotal || 1;
        dateGroups[dateKey] = (dateGroups[dateKey] || 0) + value;
      }
    });

    const lineData = Object.entries(dateGroups)
      .slice(0, 20)
      .map(([name, value]) => ({ name, value }));

    const territoryCount: Record<string, number> = {};
    data.forEach((row: any) => {
      const territory = row.TerritoryID || row.Territory || row.Name || "Unknown";
      const value = row.TotalDue || row.SubTotal || row.LineTotal || 1;
      territoryCount[territory] = (territoryCount[territory] || 0) + value;
    });

    const barData = Object.entries(territoryCount)
      .slice(0, 10)
      .map(([name, value]) => ({
        name: name.length > 20 ? name.substring(0, 20) + "..." : name,
        value,
      }));

    const territoryData = Object.entries(territoryCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
      }));

    const categoryCount: Record<string, number> = {};
    data.forEach((row: any) => {
      const category =
        row.ProductCategory ||
        row.Category ||
        row.Type ||
        row.Status ||
        "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const pieData = Object.entries(categoryCount)
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    return {
      lineData,
      barData,
      pieData,
      territoryData,
    };
  }, [currentData]);

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
          Upload your data files to access advanced analytics with multiple chart types and insights.
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
          <h1 className="text-2xl font-semibold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Deep dive into your data with interactive visualizations
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
              Select a dataset to view advanced analytics
            </p>
          </CardContent>
        </Card>
      ) : dataLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6">
            <SalesLineChart
              title="Trend Over Time"
              data={chartData.lineData}
              dataKey="value"
              xAxisKey="name"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesBarChart
              title="Top Performers"
              data={chartData.barData}
              dataKey="value"
              xAxisKey="name"
            />
            <SalesPieChart
              title="Category Distribution"
              data={chartData.pieData}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesBarChart
              title="Territory Analysis"
              data={chartData.territoryData}
              dataKey="value"
              xAxisKey="name"
            />
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-80 text-center">
                <p className="text-muted-foreground">
                  Additional analytics charts can be configured based on your data
                  structure
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
