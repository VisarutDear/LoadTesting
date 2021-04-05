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

    var data = {"OkPercent": 97.38235294117646, "KoPercent": 2.6176470588235294};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8802614379084968, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "CreateRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server1"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server2"], "isController": false}, {"data": [0.0, 100, 1000, "JoinRoom_server3"], "isController": false}, {"data": [0.0, 100, 1000, "CreateRoom_server3"], "isController": false}, {"data": [0.89785, 100, 1000, "JoinRoom&Ready_server1"], "isController": false}, {"data": [0.8994, 100, 1000, "JoinRoom&Ready_server2"], "isController": false}, {"data": [0.89635, 100, 1000, "JoinRoom&Ready_server3"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 30600, 801, 2.6176470588235294, 1031.015686274495, 26, 61094, 69.0, 1040.0, 15064.95, 21113.99, 168.52725900877334, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["CreateRoom_server1", 100, 0, 0.0, 11696.42000000001, 11196, 12194, 11700.5, 12106.0, 12172.0, 12193.91, 8.190679007289704, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server1", 100, 0, 0.0, 60200.81, 60046, 61094, 60098.5, 60398.5, 60443.0, 61093.79, 1.6224547740731727, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server2", 100, 100, 100.0, 21089.049999999992, 21039, 21125, 21090.0, 21119.9, 21121.95, 21124.98, 4.733727810650888, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server2", 100, 100, 100.0, 21039.049999999996, 21014, 21058, 21042.0, 21049.9, 21051.95, 21057.97, 4.425170369059209, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom_server3", 100, 100, 100.0, 21039.55000000001, 21016, 21067, 21038.0, 21049.0, 21062.45, 21066.99, 4.423213021939136, 0.0, 0.0], "isController": false}, {"data": ["CreateRoom_server3", 100, 100, 100.0, 21135.050000000003, 21086, 21185, 21134.0, 21169.0, 21173.9, 21184.99, 4.719875395289564, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server1", 10000, 137, 1.37, 529.9302000000021, 26, 21072, 75.0, 124.0, 1050.0, 21040.0, 55.09884733211381, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server2", 10000, 131, 1.31, 530.0066000000032, 26, 21073, 75.0, 125.89999999999964, 1039.0, 21040.0, 55.74943971813083, 0.0, 0.0], "isController": false}, {"data": ["JoinRoom&Ready_server3", 10000, 133, 1.33, 532.9718999999994, 26, 21077, 75.0, 138.0, 1042.0, 21040.989999999998, 55.76902699778597, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 801, 100.0, 2.6176470588235294], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 30600, 801, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 801, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["CreateRoom_server2", 100, 100, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom_server2", 100, 100, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom_server3", 100, 100, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["CreateRoom_server3", 100, 100, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 100, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server1", 10000, 137, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 137, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server2", 10000, 131, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 131, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["JoinRoom&Ready_server3", 10000, 133, "500/javax.script.ScriptException: java.net.ConnectException: Connection timed out: connect", 133, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
