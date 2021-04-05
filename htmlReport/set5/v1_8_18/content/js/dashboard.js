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

    var data = {"OkPercent": 99.94444444444444, "KoPercent": 0.05555555555555555};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.41825854700854703, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server3"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom&Wait_server2"], "isController": false}, {"data": [0.43746666666666667, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.43646666666666667, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.4310333333333333, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 46800, 26, 0.05555555555555555, 2288.2107905983007, 26, 63609, 518.0, 3189.600000000006, 14114.850000000002, 63236.990000000005, 663.0773590252196, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 300, 0, 0.0, 12225.666666666672, 11688, 12744, 12190.0, 12661.5, 12706.8, 12743.93, 23.538642604943114, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 300, 0, 0.0, 11548.83, 10972, 12044, 11547.0, 11934.0, 11990.7, 12030.0, 24.818001323626735, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server1", 300, 0, 0.0, 63023.17333333333, 62415, 63609, 62999.5, 63515.7, 63565.85, 63602.96, 4.716313729189266, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 300, 0, 0.0, 12031.753333333327, 11576, 12576, 12040.0, 12447.0, 12518.9, 12568.96, 23.854961832061072, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server3", 300, 0, 0.0, 62781.28333333333, 62038, 63447, 62811.5, 63311.7, 63342.0, 63425.0, 4.72768532526475, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Wait_server2", 300, 0, 0.0, 62906.42, 62190, 63522, 62920.5, 63420.0, 63486.85, 63513.99, 4.722252829416487, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 15000, 8, 0.05333333333333334, 872.5685333333329, 26, 21047, 564.0, 1576.0, 3071.0, 6754.98, 246.1679850329865, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 15000, 7, 0.04666666666666667, 886.1600666666689, 27, 21057, 565.0, 1577.8999999999996, 3081.0, 7060.0, 229.22460955408172, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 15000, 11, 0.07333333333333333, 890.1465333333316, 27, 21040, 564.0, 1578.0, 3078.0, 7063.99, 242.78916189181317, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 26, 100.0, 0.05555555555555555], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 46800, 26, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 26, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["JoinRoom&Ready_server1", 15000, 8, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 8, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 15000, 7, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 15000, 11, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 11, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
