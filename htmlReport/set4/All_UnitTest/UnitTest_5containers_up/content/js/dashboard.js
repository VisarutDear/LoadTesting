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

    var data = {"OkPercent": 98.06233062330624, "KoPercent": 1.937669376693767};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.943089430894309, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.9613541666666666, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.9705208333333334, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.968125, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 14760, 286, 1.937669376693767, 1084.6712737127382, 26, 61059, 40.0, 58.0, 366.0, 21092.39, 100.07118885385945, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 60, 0, 0.0, 11124.01666666667, 10623, 11624, 11122.0, 11539.3, 11590.2, 11624.0, 5.156411137848058, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server1", 60, 0, 0.0, 60140.16666666667, 60026, 61059, 60044.5, 60337.5, 60372.25, 61059.0, 0.976848686138517, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 60, 0, 0.0, 10078.499999999996, 10071, 10087, 10071.0, 10087.0, 10087.0, 10087.0, 5.948250223059383, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server2", 60, 60, 100.0, 21050.583333333336, 21030, 21073, 21049.0, 21060.8, 21070.95, 21073.0, 2.6843235504652827, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server3", 60, 0, 0.0, 60046.96666666667, 60027, 60074, 60042.0, 60070.9, 60072.95, 60074.0, 0.9784735812133072, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 60, 60, 100.0, 21089.28333333333, 21070, 21103, 21091.0, 21102.0, 21102.95, 21103.0, 2.843197649623276, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 4800, 51, 1.0625, 336.9043749999992, 26, 21086, 40.0, 55.0, 82.94999999999982, 21032.989999999998, 42.454206946569606, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 4800, 57, 1.1875, 356.82208333333347, 26, 21091, 40.0, 54.0, 65.0, 21036.98, 43.05743682666691, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 4800, 58, 1.2083333333333333, 347.51875000000024, 26, 21090, 40.0, 54.0, 73.0, 21040.98, 43.062844839187186, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 286, 100.0, 1.937669376693767], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 14760, 286, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 286, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["JoinRoom_server2", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 60, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["CreateRoom_server3", 60, 60, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 60, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server1", 4800, 51, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 51, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 4800, 57, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 57, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 4800, 58, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 58, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
