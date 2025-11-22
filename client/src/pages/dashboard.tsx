import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/metric-card";
import { SalesLineChart, SalesBarChart, SalesPieChart } from "@/components/charts";
import { DatasetSelector } from "@/components/dataset-selector";
import { DollarSign, ShoppingCart, TrendingUp, MapPin, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Upload } from "lucide-react";

export default function Dashboard() {
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

  const metrics = useMemo(() => {
    if (!currentData?.data || currentData.data.length === 0) {
      return {
        totalSales: 0,
        orderCount: 0,
        avgOrderValue: 0,
        topTerritory: "N/A",
      };
    }

    const data = currentData.data;
    let totalSales = 0;
    let orderCount = data.length;

    data.forEach((row: any) => {
      const salesFields = ["TotalDue", "SubTotal", "LineTotal", "OrderQty"];
      for (const field of salesFields) {
        if (row[field] && typeof row[field] === "number") {
          totalSales += row[field];
        }
      }
    });

    const avgOrderValue = orderCount > 0 ? totalSales / orderCount : 0;

    const territoryCount: Record<string, number> = {};
    data.forEach((row: any) => {
      const territory = row.TerritoryID || row.Territory || row.Name;
      if (territory) {
        territoryCount[territory] = (territoryCount[territory] || 0) + 1;
      }
    });

    const topTerritory =
      Object.keys(territoryCount).length > 0
        ? Object.entries(territoryCount).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

    return {
      totalSales,
      orderCount,
      avgOrderValue,
      topTerritory,
    };
  }, [currentData]);

  const chartData = useMemo(() => {
    if (!currentData?.data || currentData.data.length === 0) {
      return {
        lineData: [],
        barData: [],
        pieData: [],
      };
    }

    const data = currentData.data.slice(0, 10);

    const lineData = data.map((row: any, index: number) => ({
      name: row.Name || row.OrderDate || `Item ${index + 1}`,
      value: row.TotalDue || row.SubTotal || row.LineTotal || 0,
    }));

    const territoryCount: Record<string, number> = {};
    currentData.data.forEach((row: any) => {
      const territory = row.TerritoryID || row.Territory || row.Name || "Unknown";
      const value = row.TotalDue || row.SubTotal || row.LineTotal || 1;
      territoryCount[territory] = (territoryCount[territory] || 0) + value;
    });

    const barData = Object.entries(territoryCount)
      .slice(0, 8)
      .map(([name, value]) => ({
        name: name.length > 15 ? name.substring(0, 15) + "..." : name,
        value,
      }));

    const statusCount: Record<string, number> = {};
    currentData.data.forEach((row: any) => {
      const status = row.Status || row.ShipMethodID || row.Type || "Active";
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const pieData = Object.entries(statusCount)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    return {
      lineData,
      barData,
      pieData,
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
          Upload your first Excel or CSV file to start visualizing your sales and
          purchasing data with interactive charts and analytics.
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
          <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
          <p className="text-muted-foreground">
            Visualize your sales and purchasing data
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
              Select a dataset to view analytics
            </p>
          </CardContent>
        </Card>
      ) : dataLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Sales"
              value={`$${metrics.totalSales.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={DollarSign}
              testId="metric-total-sales"
            />
            <MetricCard
              title="Order Count"
              value={metrics.orderCount.toLocaleString()}
              icon={ShoppingCart}
              testId="metric-order-count"
            />
            <MetricCard
              title="Avg Order Value"
              value={`$${metrics.avgOrderValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              icon={TrendingUp}
              testId="metric-avg-order"
            />
            <MetricCard
              title="Top Territory"
              value={metrics.topTerritory}
              icon={MapPin}
              testId="metric-top-territory"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <SalesLineChart
              title="Sales Trend"
              data={chartData.lineData}
              dataKey="value"
              xAxisKey="name"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SalesBarChart
              title="Sales by Territory"
              data={chartData.barData}
              dataKey="value"
              xAxisKey="name"
            />
            <SalesPieChart title="Distribution by Status" data={chartData.pieData} />
          </div>
        </>
      )}
    </div>
  );
}
