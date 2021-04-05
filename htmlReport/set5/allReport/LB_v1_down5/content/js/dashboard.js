/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.987922705314, "KoPercent": 0.012077294685990338};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5415338164251208, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server2"], "isController": false}, {"data": [0.5496666666666666, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.5582222222222222, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.5528148148148149, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 41400, 5, 0.012077294685990338, 1205.766594202905, 26, 61069, 303.0, 1348.0, 3318.0, 60028.0, 643.4866406577863, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 150, 0, 0.0, 8539.72, 8024, 9064, 8549.0, 8976.3, 9023.5, 9064.0, 16.532569161247658, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 150, 0, 0.0, 8482.33333333334, 7969, 9024, 8493.0, 8914.9, 8974.05, 9015.84, 16.622340425531913, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server1", 150, 0, 0.0, 60188.8, 60026, 61063, 60028.5, 61032.0, 61038.0, 61061.98, 2.447261514365425, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 150, 0, 0.0, 8440.299999999997, 7931, 8974, 8437.0, 8873.5, 8927.6, 8971.45, 16.701926288831977, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server3", 150, 0, 0.0, 60172.57999999999, 60025, 61069, 60028.0, 61035.0, 61040.45, 61064.41, 2.452022100892536, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server2", 150, 0, 0.0, 60171.20666666666, 60026, 61046, 60028.0, 61030.8, 61036.0, 61043.96, 2.448140229472344, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 13500, 1, 0.007407407407407408, 473.2330370370381, 26, 21059, 312.0, 1028.8999999999996, 1345.0, 3616.219999999983, 281.8312770088307, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 13500, 3, 0.022222222222222223, 467.3451851851842, 26, 21029, 311.0, 1054.7999999999993, 1351.0, 3464.99, 282.34998849685235, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 13500, 1, 0.007407407407407408, 468.2733333333322, 26, 15328, 312.0, 702.8999999999996, 1347.949999999999, 3450.9799999999996, 283.52409954846166, 0.0, 0.0], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, 20.0, 0.0024154589371980675], "isController": false}, {"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 4, 80.0, 0.00966183574879227], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 41400, 5, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 4, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["JoinRoom&Ready_server1", 13500, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 13500, 3, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 3, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 13500, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
