document.addEventListener("DOMContentLoaded", () => {

    const fullYear = new Date().getFullYear();

    document.querySelectorAll(".current-year").forEach(span => {
        span.textContent = fullYear;
    });

    const params = new URLSearchParams(window.location.search);

    const from = params.get("start_date");
    const to = params.get("end_date");

    if (from && to) {
        const host = window.location.hostname || "localhost";
        const port = "8000";

        const API_BASE = `http://${host}:${port}`;

        fetch(
            `${API_BASE}/api/get-new-summary-report?start_date=${from}&end_date=${to}`
        )
            .then((response) => response.json())
            .then(
                ({
                    dates,
                    generatedDate,
                    preparedBy,
                    activityChartData,
                    responseTimeTrend,
                    serviceDistributionDonutChartData,
                    services,
                    statsByServices,
                    lastWeekComparison,
                    avgResponseTimeChange,
                    totalVisits,
                    totalPending,
                    totalServed,
                    notAnswered,
                    avgResponse,
                    bestCounter,
                    servedPercentage,
                    totalVisitsForBestCounter
                }) => {
                    callerFrequency(activityChartData);
                    renderTrendChart(responseTimeTrend);

                    serviceDistributionChart(serviceDistributionDonutChartData);
                    renderServiceLegend(serviceDistributionDonutChartData);

                    // right section
                    renderServiceProgressBars(services);

                    renderServiceTables(statsByServices);


                    // Helper function to safely set text
                    const setText = (id, value) => {
                        const el = document.getElementById(id);
                        if (el && value !== undefined && value !== null) {
                            el.textContent = value;
                        }
                    };

                    setText("dateRange", dates);
                    setText("dateRange2", dates);
                    setText("generatedDate", generatedDate);
                    setText("avgResponseSpan", avgResponse);
                    setText("last-week-avg-progress-card", avgResponse);
                    setText("bestCounterSpan", bestCounter);
                    setText("bestCounterCard", bestCounter);
                    setText("preparedBy", preparedBy);
                    setText("totalVisitsCard", totalVisits);
                    setText("totalVisits", totalVisits);

                    setText("totalPending", totalPending);
                    setText("totalServed", totalServed);
                    setText("servedPercentage", servedPercentage);
                    setText("notAnswered", notAnswered);
                    setText("totalVisitsForBestCounter", totalVisitsForBestCounter);



                    setText("last-week-comparison-progress", lastWeekComparison);
                    setText("last-week-avg-progress", avgResponseTimeChange);
                }
            )
            .catch((error) => {
                console.error("API Error:", error);
            });
    }

    function renderServiceTables(statsByServices) {
        const container = document.getElementById("servicesContainer");
        container.innerHTML = ""; // clear previous content

        // Group counters by service_name
        const servicesMap = {};
        statsByServices.forEach(item => {
            if (!servicesMap[item.service_name]) servicesMap[item.service_name] = [];
            servicesMap[item.service_name].push(item);
        });


        let pageNumber = 1;              // start from 1
        const extraPages = 2;            // first 2 static pages
        const servicesCount = Object.keys(servicesMap).length;
        const totalPages = extraPages + servicesCount;

        document.querySelectorAll(".page-container").forEach((page, idx) => {
            if (idx < extraPages) { // only first 2 pages
                const pageCountSpan = page.querySelector(".page-count");
                if (pageCountSpan) {
                    pageCountSpan.textContent = totalPages; // set total pages dynamically
                    pageCountSpan.parentElement.textContent = `Page ${idx + 1} of ${totalPages}`;
                }
            }
        });

        for (const [serviceName, counters] of Object.entries(servicesMap)) {
            // Create main page container
            const pageDiv = document.createElement("div");
            pageDiv.className = "page-container";
            pageDiv.style.height = "295mm";

            pageDiv.style.margin = "0";
            pageDiv.style.padding = "10 10mm";     // 10mm padding left and right

            // Header
            const headerDiv = document.createElement("div");
            headerDiv.className = "flex justify-between items-center mb-3";
            headerDiv.innerHTML = `
            <div class="flex items-center gap-2 opacity-50">
                <span class="material-symbols-outlined text-primary" style="font-size: 20px">monitoring</span>
                <span class="font-bold text-slate-900 text-sm">Queue Management Report</span>
            </div>
            <span class="text-xs text-slate-400 uppercase">Continued</span>
        `;
            pageDiv.appendChild(headerDiv);

            // Service title
            const h3 = document.createElement("h3");
            h3.className = "text-lg font-bold text-slate-900 mb-4";
            h3.textContent = serviceName;
            pageDiv.appendChild(h3);

            // Table
            const tableWrapper = document.createElement("div");
            tableWrapper.className = "w-full mb-8";

            const table = document.createElement("table");
            table.className = "w-full text-left border-collapse text-sm";

            table.innerHTML = `
            <thead>
                <tr class="border-b-2 border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th class="py-3 pr-4 font-semibold w-24">Counter</th>
                    <th class="py-3 px-2 font-semibold">Served</th>
                    <th class="py-3 px-2 font-semibold">No Show</th>
                    <th class="py-3 px-2 font-semibold">AVG Response Time</th>
                    <th class="py-3 px-2 font-semibold">Feedback</th>
                </tr>
            </thead>
        `;

            const tbody = document.createElement("tbody");
            tbody.className = "divide-y divide-slate-100";

            const feedbackMap = {
                Excellent: 4,
                Good: 3,
                Average: 2,
                Poor: 1,
                "No Rating": 5
            };

            const feedbackReverseMap = {
                4: "Excellent",
                3: "Good",
                2: "Average",
                1: "Poor",
                5: "No Rating"
            };

            let totalServed = 0;
            let totalNoShow = 0;
            let feedbackScoreTotal = 0;
            let feedbackCount = 0;
            let maxAvgTimeSeconds = 0;

            counters.forEach((item, index) => {

                if (feedbackMap[item.feedback]) {
                    feedbackScoreTotal += feedbackMap[item.feedback];
                    feedbackCount++;
                }

                const timeParts = item.avgTime
                    ? item.avgTime.replace("m", "").split(" ").map(v => parseInt(v))
                    : [0, 0];
                const minutes = timeParts[0] || 0;
                const seconds = timeParts[1] || 0;
                const avgTimeSeconds = minutes * 60 + seconds;
                if (avgTimeSeconds > maxAvgTimeSeconds) maxAvgTimeSeconds = avgTimeSeconds;

                totalServed += item.service_count;
                totalNoShow += item.noShow || 0;

                const row = document.createElement("tr");
                if (index % 2 !== 0) row.classList.add("bg-slate-50/50");

                row.innerHTML = `
                <td class="py-3 pr-4 font-mono text-xs font-medium text-slate-600">${item.counters}</td>
                <td class="py-3 px-2 text-slate-800 font-medium">${item.service_count}</td>
                <td class="py-3 px-2 text-slate-600">${item.noShow || 0}</td>
                <td class="py-3 px-2 text-slate-600">${item.avgTime}</td>
                <td class="py-3 px-2 text-slate-600">${item.feedback || 0}</td>
            `;
                tbody.appendChild(row);
            });

            // Total row
            const totalRow = document.createElement("tr");
            totalRow.className = "bg-slate-50/50 font-medium";
            totalRow.innerHTML = `
            <td class="py-3 pr-4 font-mono text-xs font-medium text-slate-600">Total</td>
            <td class="py-3 px-2 text-slate-800 font-medium">${totalServed}</td>
            <td class="py-3 px-2 text-slate-600">${totalNoShow}</td>
            <td class="py-3 px-2 text-slate-600">${secondsToHMS(maxAvgTimeSeconds)}</td>
            <td class="py-3 px-2 text-slate-600">
    ${feedbackCount
                    ? feedbackReverseMap[Math.round(feedbackScoreTotal / feedbackCount)]
                    : "-"}
</td>
        `;
            tbody.appendChild(totalRow);

            table.appendChild(tbody);
            tableWrapper.appendChild(table);
            pageDiv.appendChild(tableWrapper);


            // --- ADD NOTE SECTION HERE ---
            const noteDiv = document.createElement("div");
            noteDiv.className = "mt-4 p-4 bg-slate-50 rounded border border-slate-200 text-sm text-slate-600";
            noteDiv.innerHTML = `
    <strong>Note:</strong> This report includes all visits between Oct 17
    and Oct 23. Average response time is calculated based on the interval
    between 'Call Time' and 'End Time'.
`;
            pageDiv.appendChild(noteDiv);
            // --- NOTE SECTION END ---

            // Footer
            const footer = document.createElement("footer");
            footer.className = "mt-auto pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-400";
            footer.innerHTML = `
            <span>© ${fullYear} Queue Management System</span>
            <span>Page ${pageNumber + extraPages} of ${totalPages}</span>
        `;
            pageDiv.appendChild(footer);

            container.appendChild(pageDiv);
            pageNumber++;
        }
    }
    // Helper: convert seconds to Xm Ys
    function secondsToHMS(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m`;
    }

    function exportToPDF() {
        const element = document.getElementById("reportContent");

        const opt = {
            margin: 0,
            padding: 0,
            filename: `Report_${new Date().toISOString().slice(0, 10)}.pdf`,
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: {
                scale: 2,
                scrollY: 0,
                useCORS: true,
                backgroundColor: "#ffffff",
            },
            jsPDF: {
                unit: "mm",
                format: "a4",
                orientation: "portrait",
            },
        };

        html2pdf().set(opt).from(element).save();
    }

    // Attach to button
    document
        .getElementById("downloadPDF")
        .addEventListener("click", exportToPDF);

    async function renderServiceProgressBars(services) {
        try {
            const totalVisits = services.reduce((sum, s) => sum + s.visits, 0);

            const colors = [
                "bg-blue-500",
                "bg-purple-500",
                "bg-slate-400",
                "bg-red-500",
                "bg-green-500",
                "bg-yellow-500",
                "bg-pink-500",
                "bg-indigo-500",
                "bg-teal-500",
                "bg-orange-500"
            ];

            const container = document.getElementById("service-progress-bars");
            if (!container) return;

            container.innerHTML = ""; // Clear previous

            services.forEach((service, index) => {
                const percent =
                    totalVisits > 0
                        ? Math.round((service.visits / totalVisits) * 100)
                        : 0;

                const barWrapper = document.createElement("div");
                barWrapper.className = "w-full";

                barWrapper.innerHTML = `
                <div class="flex justify-between text-xs mb-1">
                    <span class="font-semibold text-slate-700">${service.name
                    }</span>
                    <span class="text-slate-500">${service.visits} visits</span>
                </div>
                <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div class="${colors[index] || "bg-gray-500"
                    } h-full rounded-full" style="width: ${percent}%"></div>
                </div>
            `;

                container.appendChild(barWrapper);
            });
        } catch (error) {
            console.error("Failed to load service progress bars:", error);
        }
    }

    async function renderServiceLegend(series) {
        try {
            const labels = ["Served", "No Show"];
            const colors = ["bg-emerald-500", "bg-amber-500"];

            const container = document.getElementById(
                "service-distribution-legend"
            );
            if (!container) return;

            container.innerHTML = ""; // clear previous

            // Create legend dynamically
            series.forEach((value, index) => {
                const legendItem = document.createElement("div");
                legendItem.className = "flex justify-between items-center text-xs";

                legendItem.innerHTML = `
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full ${colors[index]}"></span>${labels[index]}
                </div>
                <span class="font-medium">${value}%</span>
            `;
                container.appendChild(legendItem);
            });
        } catch (error) {
            console.error("Failed to load service legend data:", error);
        }
    }

    async function callerFrequency(activityChartData) {
        try {
            var seriesData = activityChartData.activity || [];
            var categories = activityChartData.activity_categories || [
                "00",
                "02",
                "04",
                "06",
                "08",
                "10",
                "12",
                "14",
                "16",
                "18",
                "20",
                "22",
            ];

            var options = {
                series: [{ name: "Activity", data: seriesData }],
                chart: {
                    type: "bar",
                    height: 260,
                    toolbar: { show: false },
                    animations: { enabled: true, easing: "easeinout", speed: 1000 },
                },
                plotOptions: { bar: { borderRadius: 4, columnWidth: "65%" } },
                colors: ["#3b82f6"],
                dataLabels: { enabled: false },
                grid: {
                    borderColor: "#f1f5f9",
                    strokeDashArray: 4,
                    yaxis: { lines: { show: true } },
                    padding: { top: 0, right: 0, bottom: 0, left: 0 },
                },
                xaxis: {
                    categories: categories,
                    labels: { style: { colors: "#94a3b8", fontSize: "12px" } },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                },
                yaxis: { show: false },
            };

            var el = document.querySelector("#chart");
            if (!el) return;
            el.innerHTML = "";
            var chart = new ApexCharts(el, options);
            chart.render();
        } catch (error) {
            console.error("Failed to load activity data:", error);
        }
    }

    async function renderTrendChart(responseTimeTrend) {
        try {
            var seriesData = responseTimeTrend.response_time || [
                65, 58, 45, 52, 38, 28, 18,
            ];
            var categories = responseTimeTrend.response_days || [
                "MON",
                "TUE",
                "WED",
                "THU",
                "FRI",
                "SAT",
                "SUN",
            ];

            var options = {
                series: [{ name: "Response Time", data: seriesData }],
                chart: {
                    type: "area",
                    height: 260,
                    toolbar: { show: false },
                    sparkline: { enabled: false },
                    animations: { enabled: true, easing: "easeinout", speed: 1000 },
                },
                colors: ["#f97316"],
                stroke: { curve: "straight", width: 6, lineCap: "butt" },
                fill: { type: "solid", opacity: 0.1 },
                markers: {
                    size: 6,
                    colors: ["#ffffff"],
                    strokeColors: "#f97316",
                    strokeWidth: 4,
                    hover: { size: 8 },
                },
                dataLabels: { enabled: false },
                grid: {
                    show: false,
                    padding: { left: 20, right: 20, top: 0, bottom: 0 },
                },
                xaxis: {
                    categories: categories,
                    labels: {
                        style: { colors: "#94a3b8", fontSize: "12px", fontWeight: 600 },
                    },
                    axisBorder: { show: false },
                    axisTicks: { show: false },
                    tickPlacement: "on",
                },
                yaxis: { show: false },
                tooltip: { enabled: false },
            };

            var el = document.querySelector("#trend-chart");
            if (!el) return;
            el.innerHTML = "";
            var chart = new ApexCharts(el, options);
            chart.render();
        } catch (error) {
            console.error("Failed to load trend chart data:", error);
        }
    }

    async function serviceDistributionChart(serviceDistribution) {
        try {
            var series = serviceDistribution || [65, 25];

            var options = {
                series: series,
                chart: {
                    type: "donut",
                    height: 280,
                    animations: { enabled: true, easing: "easeinout", speed: 1000 },
                },
                labels: ["Served", "No Show"],
                colors: ["#10b981", "#f59e0b"],
                plotOptions: {
                    pie: {
                        donut: {
                            size: "75%",
                            labels: {
                                show: true,
                                name: {
                                    show: true,
                                    fontSize: "14px",
                                    fontFamily: "Inter, ui-sans-serif",
                                    color: "#64748b",
                                    offsetY: -10,
                                },
                                value: {
                                    show: true,
                                    fontSize: "24px",
                                    fontFamily: "Inter, ui-sans-serif",
                                    fontWeight: "bold",
                                    color: "#1e293b",
                                    offsetY: 5,
                                },
                                total: { show: true, label: "Served", color: "#64748b" },
                            },
                        },
                    },
                },
                dataLabels: { enabled: false },
                legend: { show: false },
                stroke: { width: 0 },
                tooltip: { enabled: true, y: { formatter: (val) => val + "%" } },
                responsive: [
                    { breakpoint: 480, options: { chart: { height: 240 } } },
                ],
            };

            var el = document.querySelector("#service-distribution-chart");
            if (!el) return;
            el.innerHTML = "";
            var chart = new ApexCharts(el, options);
            chart.render();
        } catch (error) {
            console.error("Failed to load service distribution data:", error);
        }
    }


});