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

    var data = {"OkPercent": 80.7905982905983, "KoPercent": 19.20940170940171};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7926282051282051, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.811, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.8321666666666667, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.8298333333333333, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9360, 1798, 19.20940170940171, 545.406730769231, 26, 22279, 39.0, 2187.0, 2334.949999999999, 3831.779999999999, 46.42442639050085, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 60, 60, 100.0, 3411.416666666667, 2915, 3955, 3380.5, 3846.5, 3887.15, 3955.0, 15.026296018031555, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server1", 60, 60, 100.0, 4030.0166666666664, 2942, 22279, 3386.0, 3865.9, 3908.85, 22279.0, 2.6421242679114005, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server2", 60, 60, 100.0, 2680.9166666666665, 2161, 21127, 2367.0, 2452.8, 2460.85, 21127.0, 2.8289876939035317, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 60, 60, 100.0, 2380.4333333333334, 2285, 2488, 2381.0, 2454.9, 2469.85, 2488.0, 24.057738572574177, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server3", 60, 60, 100.0, 2624.433333333334, 2160, 21173, 2316.0, 2382.7, 2399.75, 21173.0, 2.833262501770789, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 60, 60, 100.0, 2962.1000000000004, 2250, 21160, 2340.5, 2399.0, 2411.0, 21160.0, 2.834467120181406, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 3000, 480, 16.0, 533.8689999999989, 26, 21938, 39.0, 2184.0, 2196.95, 5119.99, 14.884496308644916, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 3000, 479, 15.966666666666667, 401.429000000001, 26, 21055, 39.0, 2179.0, 2187.0, 2377.959999999999, 15.171667416821334, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 3000, 479, 15.966666666666667, 404.5846666666672, 26, 21060, 39.0, 2178.0, 2190.0, 2330.99, 15.347309616624207, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1722, 95.77308120133482, 18.397435897435898], "isController": false}, {"data": ["500/javax.script.ScriptException: javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 60, 3.337041156840934, 0.6410256410256411], "isController": false}, {"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 16, 0.8898776418242491, 0.17094017094017094], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9360, 1798, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1722, "500/javax.script.ScriptException: javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 16, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["CreateRoom_server1", 60, 60, "500/javax.script.ScriptException: javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 60, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom_server1", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 58, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 2, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom_server2", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 59, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["CreateRoom_server2", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 60, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom_server3", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 59, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 1, null, null, null, null, null, null], "isController": false}, {"data": ["CreateRoom_server3", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 58, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 2, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server1", 3000, 480, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 476, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 4, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 3000, 479, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 477, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 2, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 3000, 479, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 475, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 4, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
