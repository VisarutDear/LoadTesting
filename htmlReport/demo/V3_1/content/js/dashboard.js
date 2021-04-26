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

    var data = {"OkPercent": 71.77482408131353, "KoPercent": 28.225175918686475};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 100, 1000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 100, 1000, "BaseLineTestFunction"], "isController": false}, {"data": [0.0, 100, 1000, "Testfunction-srd"], "isController": false}, {"data": [0.0, 100, 1000, "UserType3"], "isController": false}, {"data": [0.0, 100, 1000, "UserType4"], "isController": false}, {"data": [0.0, 100, 1000, "UserType1"], "isController": false}, {"data": [0.0, 100, 1000, "UserType2"], "isController": false}, {"data": [0.0, 100, 1000, "TestFunction-cfc"], "isController": false}, {"data": [0.0, 100, 1000, "TestFunction-rfc"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1279, 361, 28.225175918686475, 49032.97419859262, 2181, 64706, 60931.0, 61651.0, 61742.0, 64165.8, 19.676923076923078, 0.0, 0.0], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["BaseLineTestFunction", 1, 1, 100.0, 2639.0, 2639, 2639, 2639.0, 2639.0, 2639.0, 2639.0, 0.378931413414172, 0.0, 0.0], "isController": false}, {"data": ["Testfunction-srd", 1, 1, 100.0, 2181.0, 2181, 2181, 2181.0, 2181.0, 2181.0, 2181.0, 0.4585052728106373, 0.0, 0.0], "isController": false}, {"data": ["UserType3", 500, 140, 28.0, 49255.109999999986, 17758, 61971, 61086.0, 61648.0, 61722.95, 61907.71, 8.060355945318546, 0.0, 0.0], "isController": false}, {"data": ["UserType4", 250, 70, 28.0, 48470.06800000001, 17689, 60865, 60020.5, 60600.5, 60645.35, 60808.74, 4.101318984185314, 0.0, 0.0], "isController": false}, {"data": ["UserType1", 25, 7, 28.0, 52535.6, 22092, 64706, 64159.0, 64656.6, 64695.5, 64706.0, 0.38461538461538464, 0.0, 0.0], "isController": false}, {"data": ["UserType2", 500, 140, 28.0, 49291.018000000025, 17791, 62007, 61121.5, 61685.9, 61752.0, 61913.94, 8.057498307925355, 0.0, 0.0], "isController": false}, {"data": ["TestFunction-cfc", 1, 1, 100.0, 2188.0, 2188, 2188, 2188.0, 2188.0, 2188.0, 2188.0, 0.4570383912248629, 0.0, 0.0], "isController": false}, {"data": ["TestFunction-rfc", 1, 1, 100.0, 2195.0, 2195, 2195, 2195.0, 2195.0, 2195.0, 2195.0, 0.4555808656036447, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 357, 98.89196675900277, 27.912431587177483], "isController": false}, {"data": ["500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 4, 1.10803324099723, 0.3127443315089914], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1279, 361, "500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 357, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 4, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["BaseLineTestFunction", 1, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Testfunction-srd", 1, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["UserType3", 500, 140, "500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 140, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["UserType4", 250, 70, "500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 70, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["UserType1", 25, 7, "500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["UserType2", 500, 140, "500/javax.script.ScriptException: java.net.SocketTimeoutException: Read timed out", 140, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["TestFunction-cfc", 1, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["TestFunction-rfc", 1, 1, "500/javax.script.ScriptException: java.net.ConnectException: Connection refused: connect", 1, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
