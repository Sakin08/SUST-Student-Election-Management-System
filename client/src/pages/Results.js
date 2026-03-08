import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Results = () => {
  const { electionId } = useParams();
  const [results, setResults] = useState([]);
  const [positions, setPositions] = useState([]);
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [electionId]);

  const fetchResults = async () => {
    try {
      const [resRes, posRes, elecRes] = await Promise.all([
        axios.get(`http://localhost:5001/api/votes/results/${electionId}`),
        axios.get(`http://localhost:5001/api/positions/election/${electionId}`),
        axios.get(`http://localhost:5001/api/elections/${electionId}`),
      ]);
      console.log("Results data:", resRes.data);
      console.log("Positions data:", posRes.data);
      setResults(resRes.data);
      setPositions(posRes.data);
      setElection(elecRes.data);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getResultsByPosition = (positionId) => {
    return results
      .filter((r) => r.positionId?._id === positionId)
      .sort((a, b) => b.voteCount - a.voteCount);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(20);
    doc.setFont(undefined, "bold");
    doc.text("Election Results", pageWidth / 2, 20, { align: "center" });

    // Election Name
    if (election) {
      doc.setFontSize(14);
      doc.setFont(undefined, "normal");
      doc.text(election.title, pageWidth / 2, 30, { align: "center" });

      // Date
      doc.setFontSize(10);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2, 37, {
        align: "center",
      });
    }

    let yPosition = 50;

    // Loop through each position
    positions.forEach((position, posIndex) => {
      const positionResults = getResultsByPosition(position._id);
      const totalVotes = positionResults.reduce(
        (acc, curr) => acc + curr.voteCount,
        0,
      );

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Position Title
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      doc.text(`${posIndex + 1}. ${position.title}`, 14, yPosition);
      yPosition += 7;

      // Position Type
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        position.isHallSpecific ? "Hall-Specific Position" : "General Position",
        14,
        yPosition,
      );
      yPosition += 5;

      // Total Votes
      doc.text(`Total Votes: ${totalVotes}`, 14, yPosition);
      yPosition += 10;

      if (positionResults.length === 0) {
        doc.setFont(undefined, "italic");
        doc.text("No votes received for this position", 20, yPosition);
        yPosition += 15;
      } else {
        // Find highest vote count for winner determination
        const highestVoteCount = positionResults[0]?.voteCount || 0;

        // Create table data
        const tableData = positionResults.map((result, index) => {
          const votePercentage =
            totalVotes > 0
              ? ((result.voteCount / totalVotes) * 100).toFixed(1)
              : 0;

          // Mark as winner if vote count equals highest (handles ties)
          const isWinner =
            result.voteCount === highestVoteCount && highestVoteCount > 0;

          return [
            index + 1,
            result.studentId?.name || "N/A",
            result.studentId?.registrationNumber || "N/A",
            result.panelId?.name || "Independent",
            result.voteCount,
            `${votePercentage}%`,
            isWinner ? "WINNER" : "",
          ];
        });

        // Add table
        autoTable(doc, {
          startY: yPosition,
          head: [["Rank", "Name", "Reg. No.", "Panel", "Votes", "%", "Status"]],
          body: tableData,
          theme: "grid",
          headStyles: {
            fillColor: [51, 51, 51],
            textColor: [255, 255, 255],
            fontStyle: "bold",
            fontSize: 9,
          },
          bodyStyles: {
            fontSize: 8,
          },
          columnStyles: {
            0: { cellWidth: 15, halign: "center" },
            1: { cellWidth: 45 },
            2: { cellWidth: 30 },
            3: { cellWidth: 35 },
            4: { cellWidth: 20, halign: "center" },
            5: { cellWidth: 20, halign: "center" },
            6: { cellWidth: 25, halign: "center", fontStyle: "bold" },
          },
          didParseCell: function (data) {
            // Highlight winner rows (handles ties - all rows with "WINNER" status)
            if (data.section === "body" && data.column.index === 6) {
              const cellValue = data.cell.raw;
              if (cellValue === "WINNER") {
                // Highlight entire row for winners
                const rowCells = data.table.body[data.row.index].cells;
                rowCells.forEach((cell) => {
                  cell.styles.fillColor = [255, 251, 235]; // Light yellow
                  cell.styles.textColor = [180, 83, 9]; // Amber text
                });
              }
            }
          },
          margin: { left: 14, right: 14 },
        });

        yPosition = doc.lastAutoTable.finalY + 15;
      }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont(undefined, "normal");
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" },
      );
      doc.text(
        "SUST Election Management System",
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" },
      );
    }

    // Save PDF
    const fileName = election
      ? `${election.title.replace(/\s+/g, "_")}_Results.pdf`
      : "Election_Results.pdf";
    doc.save(fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-bold animate-pulse text-lg">
            ফলাফল গণনা করা হচ্ছে...
          </p>
        </div>
      </div>
    );
  }

  const totalVotesAllPositions = results.reduce(
    (acc, curr) => acc + curr.voteCount,
    0,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-emerald-50/30 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm mb-6 transition-colors group"
        >
          <svg
            className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          ড্যাশবোর্ডে ফিরে যান
        </Link>

        {/* Header */}
        <div className="text-center mb-12 relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-emerald-200 to-blue-200 rounded-full blur-3xl opacity-30 -z-10"></div>

          <div className="inline-block mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl flex items-center justify-center text-4xl shadow-2xl shadow-emerald-200 animate-bounce">
              🏆
            </div>
          </div>

          <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">
            নির্বাচনী ফলাফল
          </h1>

          {election && (
            <p className="text-xl text-slate-600 font-bold mb-6">
              {election.title}
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full border-2 border-emerald-200 shadow-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-black text-slate-700 uppercase tracking-widest">
                ভোট গণনা সম্পন্ন
              </span>
              <div className="px-3 py-1 bg-emerald-100 rounded-full">
                <span className="text-xs font-black text-emerald-700">
                  {totalVotesAllPositions} ভোট
                </span>
              </div>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-black text-sm shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              PDF ডাউনলোড করুন
            </button>
          </div>
        </div>

        {/* Results by Position */}
        <div className="space-y-10">
          {positions.map((position, posIndex) => {
            const positionResults = getResultsByPosition(position._id);
            const totalVotes = positionResults.reduce(
              (acc, curr) => acc + curr.voteCount,
              0,
            );

            return (
              <div
                key={position._id}
                className="bg-white rounded-[2.5rem] border-2 border-slate-200 shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500"
              >
                {/* Position Header */}
                <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-8">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>

                  <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl border border-white/20">
                        {position.isHallSpecific ? "🏢" : "🎓"}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h2 className="text-3xl font-black text-white tracking-tight">
                            {position.title}
                          </h2>
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold text-white">
                            #{posIndex + 1}
                          </span>
                        </div>
                        <p className="text-white/70 text-sm font-medium">
                          {position.isHallSpecific
                            ? "হল-নির্দিষ্ট পদ"
                            : "সাধারণ পদ"}
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-4 text-center">
                      <div className="text-white font-black text-3xl">
                        {totalVotes}
                      </div>
                      <div className="text-white/70 text-xs font-bold uppercase tracking-wider">
                        মোট ভোট
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results List */}
                <div className="p-8">
                  {positionResults.length === 0 ? (
                    <div className="text-center py-16 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-300">
                      <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                        📭
                      </div>
                      <p className="text-slate-400 font-bold text-lg">
                        এই পদের জন্য কোনো ভোট পাওয়া যায়নি
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {positionResults.map((result, index) => {
                        const votePercentage =
                          totalVotes > 0
                            ? ((result.voteCount / totalVotes) * 100).toFixed(1)
                            : 0;

                        // Check if this candidate has the highest vote count (handle ties)
                        const highestVoteCount =
                          positionResults[0]?.voteCount || 0;
                        const isWinner =
                          result.voteCount === highestVoteCount &&
                          highestVoteCount > 0;

                        // Runner-up: second highest vote count (handle ties)
                        const secondHighestVoteCount =
                          positionResults.find(
                            (r) => r.voteCount < highestVoteCount,
                          )?.voteCount || 0;
                        const isRunnerUp =
                          !isWinner &&
                          result.voteCount === secondHighestVoteCount &&
                          secondHighestVoteCount > 0;

                        return (
                          <div key={index} className="relative group">
                            {/* Winner Badge */}
                            {isWinner && (
                              <div className="absolute -top-3 -right-3 z-10">
                                <div className="bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase shadow-xl flex items-center gap-2 animate-bounce">
                                  <span className="text-lg">👑</span>
                                  বিজয়ী
                                </div>
                              </div>
                            )}

                            <div
                              className={`p-6 rounded-3xl border-2 transition-all ${
                                isWinner
                                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300 shadow-xl shadow-amber-100"
                                  : isRunnerUp
                                    ? "bg-gradient-to-r from-slate-50 to-blue-50 border-slate-300"
                                    : "bg-slate-50 border-slate-200"
                              }`}
                            >
                              {/* Candidate Header */}
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-4">
                                  {/* Rank Badge */}
                                  <div
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg ${
                                      isWinner
                                        ? "bg-gradient-to-br from-amber-400 to-yellow-500 text-white ring-4 ring-amber-200"
                                        : isRunnerUp
                                          ? "bg-gradient-to-br from-slate-400 to-slate-500 text-white ring-4 ring-slate-200"
                                          : "bg-white text-slate-600 border-2 border-slate-300"
                                    }`}
                                  >
                                    {isWinner
                                      ? "🥇"
                                      : isRunnerUp
                                        ? "🥈"
                                        : index + 1}
                                  </div>

                                  {/* Candidate Photo */}
                                  {result.candidatePhoto ? (
                                    <div className="w-16 h-16 rounded-xl overflow-hidden border-3 border-white shadow-lg">
                                      <img
                                        src={result._id.candidatePhoto}
                                        alt={result.studentId?.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                                      {result.studentId?.name?.charAt(0)}
                                    </div>
                                  )}

                                  {/* Candidate Info */}
                                  <div>
                                    <h3
                                      className={`text-xl font-black mb-1 ${
                                        isWinner
                                          ? "text-amber-900"
                                          : "text-slate-900"
                                      }`}
                                    >
                                      {result.studentId?.name}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="font-bold text-slate-500">
                                        🆔{" "}
                                        {result.studentId?.registrationNumber}
                                      </span>
                                      {result.panelId?.name && (
                                        <>
                                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                          <span className="font-black text-blue-600">
                                            🚩 {result._id.panelId.name}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Vote Count */}
                                <div className="text-right">
                                  <div
                                    className={`text-4xl font-black leading-none mb-1 ${
                                      isWinner
                                        ? "text-amber-600"
                                        : "text-slate-900"
                                    }`}
                                  >
                                    {result.voteCount}
                                  </div>
                                  <div className="text-xs font-bold text-slate-500">
                                    ভোট
                                  </div>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="relative">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-sm font-bold text-slate-600">
                                    ভোটের শতাংশ
                                  </span>
                                  <span
                                    className={`text-lg font-black ${
                                      isWinner
                                        ? "text-amber-600"
                                        : "text-blue-600"
                                    }`}
                                  >
                                    {votePercentage}%
                                  </span>
                                </div>
                                <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                  <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                                      isWinner
                                        ? "bg-gradient-to-r from-amber-400 to-yellow-500"
                                        : isRunnerUp
                                          ? "bg-gradient-to-r from-slate-400 to-slate-500"
                                          : "bg-gradient-to-r from-blue-400 to-indigo-500"
                                    }`}
                                    style={{ width: `${votePercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full border border-slate-200 shadow-sm">
            <span className="text-slate-400 text-sm">🔒</span>
            <span className="text-slate-500 text-sm font-medium">
              ফলাফল স্বচ্ছ এবং নিরাপদভাবে সংরক্ষিত
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
