import React, { useState } from "react";
import { AnalysisResult } from "../types";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from "recharts";
import { AlertTriangle, IndianRupee, Recycle, Leaf, TrendingDown, Scale, Download, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

interface Props {
  data: AnalysisResult;
  image?: string | null;
  onReset: () => void;
}

const COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#6B7280"];

export const AnalysisReport: React.FC<Props> = ({ data, image, onReset }) => {
  const [isExporting, setIsExporting] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(val);

  const handleExportPDF = async () => {
    const element = document.getElementById('report-content');
    if (!element) return;

    setIsExporting(true);

    try {
      // Scroll to top to ensure capture isn't affected by scroll position
      window.scrollTo(0, 0);
      
      // Wait a moment for any repaints/animations to settle
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capture the live element directly
      // This ensures charts and state are captured exactly as seen
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#f0fdf4',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image height based on A4 width to maintain aspect ratio
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = 0;
      let page = 1;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content overflows
      while (heightLeft > 0) {
        position = -pdfHeight * page; // Shift image up by one page height
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
        page++;
      }

      const dateStr = new Date().toLocaleDateString('en-IN').replace(/\//g, '-');
      pdf.save(`EcoWaste_Analysis_${dateStr}.pdf`);

    } catch (error) {
      console.error("PDF Export failed", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Action Bar */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800">Analysis Results</h2>
        <button 
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-70"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />}
          <span>{isExporting ? "Generating PDF..." : "Export as PDF"}</span>
        </button>
      </div>

      {/* Printable Content Wrapper */}
      <div id="report-content" className="space-y-8 bg-[#f0fdf4] p-4 rounded-none md:rounded-xl">
        
        {/* Uploaded Image Reference */}
        {image && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-center">
            <div className="relative w-full md:w-1/3 h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                <img 
                  src={image} 
                  alt="Analyzed Waste" 
                  className="max-w-full max-h-full object-contain"
                />
            </div>
            <div className="flex-1 space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-bold text-gray-900">Analysis Overview</h2>
                <p className="text-gray-600">
                  Our AI has successfully identified <strong>{data.wasteBreakdown.length}</strong> categories of waste 
                  and estimated a total weight of <strong>{data.totalWeightGrams}g</strong>.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <span className="w-2 h-2 mr-2 bg-green-600 rounded-full"></span>
                    Processed Successfully
                  </span>
                </div>
            </div>
          </div>
        )}

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Financial Loss Card */}
          <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 flex flex-col items-center text-center">
            <div className="bg-red-50 p-3 rounded-full mb-4">
              <IndianRupee className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-gray-500 font-medium">Est. Financial Loss</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {formatCurrency(data.financialImpact.estimatedLoss)}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Based on {formatCurrency(data.financialImpact.cogsRate)}/g COGS
            </p>
          </div>

          {/* Total Weight Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center text-center">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <Scale className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-gray-500 font-medium">Total Waste Weight</h3>
            <p className="text-4xl font-bold text-gray-900 mt-2">
              {data.totalWeightGrams} <span className="text-xl font-normal text-gray-500">g</span>
            </p>
            <p className="text-sm text-gray-400 mt-1">Estimated from visual data</p>
          </div>

          {/* Primary Issue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6 flex flex-col items-center text-center">
            <div className="bg-orange-50 p-3 rounded-full mb-4">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <h3 className="text-gray-500 font-medium">Biggest Loss Category</h3>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {data.managerReport.biggestLossCategory}
            </p>
            <p className="text-sm text-gray-400 mt-1">Requires immediate attention</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Charts */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Composition Analysis</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.wasteBreakdown as any[]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="weightGrams"
                      nameKey="category"
                    >
                      {data.wasteBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}g`} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weight Distribution</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.wasteBreakdown as any[]} margin={{ bottom: 20 }}>
                    <XAxis 
                      dataKey="category" 
                      interval={0} 
                      fontSize={10} 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="weightGrams" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Breakdown & Report */}
          <div className="lg:col-span-2 space-y-8">
            {/* Detailed Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Detailed Waste Classification</h3>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded bg-green-100 text-green-800">
                  Live Analysis
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Category</th>
                      <th className="px-6 py-3">Est. Weight</th>
                      <th className="px-6 py-3">Recyclable?</th>
                      <th className="px-6 py-3">Identified Items</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.wasteBreakdown.map((item, idx) => (
                      <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{item.category}</td>
                        <td className="px-6 py-4">{item.weightGrams} g</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              item.recyclableStatus.toLowerCase() === "yes"
                                ? "bg-blue-100 text-blue-800"
                                : item.recyclableStatus.toLowerCase() === "compost"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {item.recyclableStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 italic">{item.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Manager's Report */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-sm border border-green-100 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Leaf className="w-6 h-6 text-green-600" />
                <h3 className="text-xl font-bold text-green-900">Manager's Reduction Report</h3>
              </div>
              <p className="text-green-800 mb-4">
                The highest impact area identified is <strong>{data.managerReport.biggestLossCategory}</strong>. 
                Addressing this can significantly reduce the estimated <strong>{formatCurrency(data.financialImpact.estimatedLoss)}</strong> daily loss.
              </p>
              <div className="space-y-3">
                {data.managerReport.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start bg-white p-3 rounded-lg border border-green-100 shadow-sm">
                    <div className="flex-shrink-0 mt-0.5">
                      <TrendingDown className="w-5 h-5 text-green-500" />
                    </div>
                    <p className="ml-3 text-gray-700 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-8">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-lg"
        >
          <Recycle className="w-5 h-5" />
          <span>Analyze New Sample</span>
        </button>
      </div>
    </div>
  );
};